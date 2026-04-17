import { useState, useEffect, useMemo } from 'react'
import type { FormEvent } from 'react'
import { useNavigate, useSearchParams } from 'react-router'
import { useAppSelector } from '@/store'
import { selectUser } from '@/store/auth.slice'
import { statsService } from '@/services/stats.service'
import { ticketService } from '@/services/ticket.service'
import { clientService } from '@/services/client.service'
import { tripService } from '@/services/trip.service'
import { apiFetch } from '@/lib/api'
import { toast } from 'sonner'
import FormInput from '@/components/forms/FormInput'
import FormSelect from '@/components/forms/FormSelect'
import FormDatePicker from '@/components/forms/FormDatePicker'
import { ViewToggle } from '@/components/ui/view-toggle'
import { LayoutGrid, List } from 'lucide-react'

interface Ticket {
  id: number
  client_id: number
  trip_id: number
  seat_id: number
  state: string
  price: number
  payment_method: string
  created_at: string
  [key: string]: any
}

interface Client {
  id: number
  firstname: string
  lastname: string
}

interface Trip {
  id: number
  route?: {
    origin: string
    destination: string
    price?: number
  }
  trip_datetime?: string
  bus_id?: number
}

interface Seat {
  id: number
  seat_number: number
  deck: string
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('es-BO', {
    style: 'currency',
    currency: 'BOB',
  }).format(amount || 0)
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleString('es-BO', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const getStatusText = (status: string) => {
  const statusMap: Record<string, string> = {
    pending: 'Pendiente',
    confirmed: 'Confirmado',
    cancelled: 'Cancelado',
    completed: 'Completado',
  }
  return statusMap[status] || status
}

const getStatusBadgeClass = (status: string) => {
  const classMap: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    confirmed: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
    completed: 'bg-blue-100 text-blue-800',
  }
  return classMap[status] || 'bg-gray-100 text-gray-800'
}

export function Component() {
  const user = useAppSelector(selectUser)
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const [tickets, setTickets] = useState<Ticket[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [availableTrips, setAvailableTrips] = useState<Trip[]>([])
  const [availableSeats, setAvailableSeats] = useState<Seat[]>([])

  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [dateFromFilter, setDateFromFilter] = useState(new Date().toISOString().split('T')[0])
  const [dateToFilter, setDateToFilter] = useState('')
  const [paymentMethodFilter, setPaymentMethodFilter] = useState('')

  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 10

  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards')
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false)

  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingTicket, setEditingTicket] = useState<Ticket | null>(null)

  const [ticketForm, setTicketForm] = useState({
    trip_id: '',
    client_id: '',
    seat_id: '',
    state: 'pending',
    price: 0,
    payment_method: '',
  })

  const [stats, setStats] = useState({
    confirmed: 0,
    pending: 0,
    cancelled: 0,
    totalRevenue: 0,
  })

  const [comparison, setComparison] = useState({
    confirmed: 0,
    pending: 0,
    cancelled: 0,
    totalRevenue: 0,
  })

  const fetchData = async () => {
    setIsLoading(true)
    try {
      const [ticketsRes, clientsRes, tripsRes, statsRes] = await Promise.all([
        ticketService.getAll({ skip: 0, limit: 10000 }),
        clientService.getAll({ skip: 0, limit: 10000 }),
        tripService.getAll({ upcoming: true }),
        (statsService.getBookingsStatsComparison() as Promise<any>).catch(() => null),
      ])

      setTickets((ticketsRes as Ticket[]) || [])
      setClients((clientsRes as Client[]) || [])
      setAvailableTrips((tripsRes as any).trips || [])

      if (statsRes) {
        const statsData = statsRes as any
        setStats({
          confirmed: statsData.today.confirmed || 0,
          pending: statsData.today.pending || 0,
          cancelled: statsData.today.cancelled || 0,
          totalRevenue: statsData.today.totalRevenue || 0,
        })
        setComparison({
          confirmed: statsData.comparison.confirmed || 0,
          pending: statsData.comparison.pending || 0,
          cancelled: statsData.comparison.cancelled || 0,
          totalRevenue: statsData.comparison.totalRevenue || 0,
        })
      }
    } catch (error) {
      console.error(error)
      toast.error('Error al cargar datos')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  useEffect(() => {
    const tripId = searchParams.get('trip_id')
    const action = searchParams.get('action')

    if (tripId) {
      setTicketForm((prev) => ({
        ...prev,
        trip_id: tripId,
        state: action === 'sell' ? 'confirmed' : 'pending',
      }))
      setShowCreateModal(true)
    }
  }, [searchParams])

  const fetchAvailableSeats = async (tripId: string) => {
    if (!tripId) {
      setAvailableSeats([])
      return
    }

    try {
      const tripResponse = (await tripService.getById(Number(tripId))) as any
      if (!tripResponse.bus_id) {
        setAvailableSeats([])
        return
      }

      const seatsResponse = (await apiFetch(`/seats/bus/${tripResponse.bus_id}`)) as Seat[]
      const availableResponse = (await apiFetch(`/trips/${tripId}/available-seats`)) as any

      setAvailableSeats(
        seatsResponse.filter((seat) =>
          availableResponse.available_seat_numbers.includes(seat.seat_number)
        )
      )
    } catch (error) {
      console.error(error)
      setAvailableSeats([])
    }
  }

  useEffect(() => {
    if (ticketForm.trip_id) {
      fetchAvailableSeats(ticketForm.trip_id)
      const selectedTrip = availableTrips.find((t) => t.id === Number(ticketForm.trip_id))
      if (selectedTrip?.route?.price) {
        setTicketForm((prev) => ({ ...prev, price: selectedTrip.route!.price! }))
      }

      const seatNumStr = searchParams.get('seat_number')
      if (seatNumStr && availableSeats.length > 0) {
        const seat = availableSeats.find((s) => s.seat_number === Number(seatNumStr))
        if (seat) {
          setTicketForm((prev) => ({ ...prev, seat_id: seat.id.toString() }))
        }
      }
    } else {
      setAvailableSeats([])
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ticketForm.trip_id])

  const filteredTickets = useMemo(() => {
    let filtered = tickets

    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (t) =>
          t.id.toString().includes(query) ||
          getClientName(t.client_id).toLowerCase().includes(query) ||
          getTripInfo(t.trip_id).toLowerCase().includes(query) ||
          t.seat_id.toString().includes(query)
      )
    }

    if (statusFilter) {
      filtered = filtered.filter((t) => t.state === statusFilter)
    }

    if (dateFromFilter) {
      filtered = filtered.filter((t) => t.created_at.split('T')[0] >= dateFromFilter)
    }

    if (dateToFilter) {
      filtered = filtered.filter((t) => t.created_at.split('T')[0] <= dateToFilter)
    }

    if (paymentMethodFilter) {
      filtered = filtered.filter((t) => t.payment_method === paymentMethodFilter)
    }

    return filtered
  }, [tickets, searchQuery, statusFilter, dateFromFilter, dateToFilter, paymentMethodFilter])

  const paginatedTickets = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return filteredTickets.slice(start, start + pageSize)
  }, [filteredTickets, currentPage])

  const totalPages = Math.ceil(filteredTickets.length / pageSize)

  const activeFiltersCount =
    (statusFilter ? 1 : 0) +
    (dateFromFilter ? 1 : 0) +
    (dateToFilter ? 1 : 0) +
    (paymentMethodFilter ? 1 : 0)

  function getClientName(clientId: number) {
    const client = clients.find((c) => c.id === clientId)
    return client ? `${client.firstname} ${client.lastname}` : `Cliente #${clientId}`
  }

  function getTripInfo(tripId: number) {
    const trip = availableTrips.find((t) => t.id === tripId)
    if (trip?.route) {
      return `${trip.route.origin} → ${trip.route.destination}`
    }
    return `Viaje #${tripId}`
  }

  const exportData = () => {
    const dataToExport = filteredTickets.map((t) => ({
      ID: t.id,
      Cliente: getClientName(t.client_id),
      Viaje: getTripInfo(t.trip_id),
      Asiento: t.seat_id,
      Estado: getStatusText(t.state),
      Precio: t.price,
      'Método de Pago': t.payment_method || 'N/A',
      'Fecha de Creación': formatDate(t.created_at),
    }))

    if (dataToExport.length === 0) return

    const headers = Object.keys(dataToExport[0]).join(',')
    const rows = dataToExport.map((row) => Object.values(row).join(','))
    const csv = [headers, ...rows].join('\n')

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `boletos_${new Date().toISOString().split('T')[0]}.csv`
    link.click()
  }

  const clearAllFilters = () => {
    setStatusFilter('')
    setDateFromFilter('')
    setDateToFilter('')
    setPaymentMethodFilter('')
    setSearchQuery('')
    setCurrentPage(1)
  }

  const handleCloseModal = () => {
    setShowCreateModal(false)
    setShowEditModal(false)
    setEditingTicket(null)
    setTicketForm({
      trip_id: '',
      client_id: '',
      seat_id: '',
      state: 'pending',
      price: 0,
      payment_method: '',
    })

    if (searchParams.get('trip_id')) {
      navigate(`/trips/${searchParams.get('trip_id')}`)
    }
  }

  const submitTicketForm = async (e: FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      const payload = {
        ...ticketForm,
        trip_id: Number(ticketForm.trip_id),
        client_id: Number(ticketForm.client_id),
        seat_id: Number(ticketForm.seat_id),
        price: Number(ticketForm.price),
        operator_user_id: user?.id,
      }

      if (showCreateModal) {
        await ticketService.create(payload)
      } else if (showEditModal && editingTicket) {
        await ticketService.update(editingTicket.id, payload)
      }

      toast.success(showCreateModal ? 'Boleto creado' : 'Boleto actualizado')
      handleCloseModal()
      fetchData()
    } catch (error: any) {
      if (error.status === 403) {
        toast.error('Permiso denegado. Solo secretarios/administradores pueden crear boletos.')
      } else {
        toast.error('Error al guardar boleto')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEditTicket = (t: Ticket) => {
    setEditingTicket(t)
    setTicketForm({
      trip_id: t.trip_id.toString(),
      client_id: t.client_id.toString(),
      seat_id: t.seat_id.toString(),
      state: t.state,
      price: t.price,
      payment_method: t.payment_method || '',
    })
    setShowEditModal(true)
  }

  const handleCancelTicket = async (id: number) => {
    if (!window.confirm('¿Estás seguro de que quieres cancelar este boleto?')) return

    try {
      await ticketService.update(id, { state: 'cancelled' })
      toast.success('Boleto cancelado')
      fetchData()
    } catch {
      toast.error('Error al cancelar boleto')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8 bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
          Gestión de Boletos
        </h1>
        <p className="mt-2 text-gray-600">Administra los boletos de viaje de los pasajeros</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[
          {
            title: 'Boletos Confirmados',
            val: stats.confirmed,
            comp: comparison.confirmed,
            color: 'blue',
          },
          {
            title: 'Boletos Reservados',
            val: stats.pending,
            comp: comparison.pending,
            color: 'yellow',
          },
          {
            title: 'Boletos Cancelados',
            val: stats.cancelled,
            comp: comparison.cancelled,
            color: 'red',
          },
          {
            title: 'Total Ingresos',
            val: formatCurrency(stats.totalRevenue),
            comp: comparison.totalRevenue,
            color: 'green',
          },
        ].map((s, i) => (
          <div
            key={i}
            className={`bg-gradient-to-br from-${s.color}-50 to-${s.color}-100 rounded-2xl shadow-sm p-6 border border-${s.color}-200`}
          >
            <p className={`text-sm font-medium text-${s.color}-600`}>{s.title}</p>
            <p className={`text-3xl font-bold text-${s.color}-900`}>{s.val}</p>
            <p
              className={`text-xs mt-1 font-medium ${s.comp > 0 ? 'text-green-600' : s.comp < 0 ? 'text-red-600' : 'text-gray-600'
                }`}
            >
              {s.comp === 0 ? 'Sin cambios vs ayer' : `${s.comp}% vs ayer`}
            </p>
          </div>
        ))}
      </div>

      {/* Actions & Filters */}
      <div className="bg-white rounded-2xl shadow-sm p-6 mb-8 border border-gray-100">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex flex-col sm:flex-row gap-4 flex-1">
            <FormInput
              placeholder="Buscar por ID, cliente, viaje..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1"
            />
            <button
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className="px-4 py-2.5 border border-gray-200 rounded-xl bg-gray-50/50 hover:bg-gray-100/50 text-sm font-medium transition-all"
            >
              Filtros Avanzados {activeFiltersCount > 0 && `(${activeFiltersCount})`}
            </button>
          </div>
          <button
            onClick={() => navigate('/trips')}
            className="px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 text-sm font-medium"
          >
            Vender Boleto
          </button>
        </div>

        {showAdvancedFilters && (
          <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <FormSelect
              label="Estado"
              value={statusFilter}
              onChange={(val) => setStatusFilter(val)}
              options={[
                { label: 'Todos los estados', value: '' },
                { label: 'Pendientes', value: 'pending' },
                { label: 'Confirmados', value: 'confirmed' },
                { label: 'Cancelados', value: 'cancelled' },
                { label: 'Completados', value: 'completed' }
              ]}
            />
            <FormDatePicker
              label="Desde"
              value={dateFromFilter}
              onChange={(date) => setDateFromFilter(date ? date.toISOString().split('T')[0] : '')}
            />
            <FormDatePicker
              label="Hasta"
              value={dateToFilter}
              onChange={(date) => setDateToFilter(date ? date.toISOString().split('T')[0] : '')}
            />
            <FormSelect
              label="Método pago"
              value={paymentMethodFilter}
              onChange={(val) => setPaymentMethodFilter(val)}
              options={[
                { label: 'Todos los pagos', value: '' },
                { label: 'Efectivo', value: 'cash' },
                { label: 'Tarjeta', value: 'card' },
                { label: 'Transferencia', value: 'transfer' },
                { label: 'QR', value: 'qr' }
              ]}
            />
            <div className="flex flex-col justify-end h-full">
              <button
                onClick={clearAllFilters}
                className="w-full px-4 min-h-[48px] border border-gray-200 rounded-xl bg-gray-100/50 text-sm font-medium hover:bg-gray-200/50 transition-all text-gray-700"
              >
                Limpiar
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Tickets List Header */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-900">Lista de Boletos ({filteredTickets.length})</h2>
        <div className="flex gap-2">
          <button onClick={exportData} className="px-3 py-2 bg-white border rounded-lg text-sm">
            Exportar
          </button>
          <div className="flex bg-gray-100 rounded-lg p-1">
            <ViewToggle
              value={viewMode}
              onChange={(val) => setViewMode(val as 'cards' | 'table')}
              options={[
                { value: 'cards', icon: <LayoutGrid className="h-4 w-4" />, label: 'Tarjetas', ariaLabel: 'Vista en tarjetas' },
                { value: 'table', icon: <List className="h-4 w-4" />, label: 'Lista', ariaLabel: 'Vista en tabla' }
              ]}
            />
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-12">Cargando...</div>
      ) : filteredTickets.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg">No hay boletos</div>
      ) : viewMode === 'table' ? (
        <div className="bg-white rounded-2xl shadow-sm overflow-x-auto mb-6">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Boleto</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cliente</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Viaje</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Precio</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {paginatedTickets.map((t) => (
                <tr key={t.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    <p>#{t.id}</p>
                    <p className="text-xs text-gray-500">{formatDate(t.created_at)}</p>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {getClientName(t.client_id)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {getTripInfo(t.trip_id)}
                    <br /> Asiento {t.seat_id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded-full ${getStatusBadgeClass(t.state)}`}>
                      {getStatusText(t.state)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {formatCurrency(t.price)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button onClick={() => handleEditTicket(t)} className="text-indigo-600 hover:text-indigo-900 mx-2">
                      Editar
                    </button>
                    {t.state !== 'cancelled' && (
                      <button onClick={() => handleCancelTicket(t.id)} className="text-red-600 hover:text-red-900">
                        Cancelar
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-6">
          {paginatedTickets.map((t) => (
            <div key={t.id} className="bg-white rounded-2xl shadow-sm border p-4">
              <div className="flex justify-between items-center mb-3">
                <div>
                  <h4 className="font-semibold text-gray-900">Boleto #{t.id}</h4>
                  <p className="text-xs text-gray-500">{formatDate(t.created_at)}</p>
                </div>
                <span className={`px-2 py-1 text-xs rounded-full ${getStatusBadgeClass(t.state)}`}>
                  {getStatusText(t.state)}
                </span>
              </div>
              <p className="text-sm font-medium text-gray-900">{getClientName(t.client_id)}</p>
              <p className="text-sm text-gray-600 mb-2">{getTripInfo(t.trip_id)}</p>
              <div className="flex justify-between items-center mt-3 pt-3 border-t">
                <span className="text-sm text-gray-600">Asiento {t.seat_id}</span>
                <span className="font-bold text-gray-900">{formatCurrency(t.price)}</span>
              </div>
              <div className="mt-3 flex gap-2">
                <button
                  onClick={() => handleEditTicket(t)}
                  className="flex-1 py-1 bg-indigo-50 text-indigo-600 rounded text-sm hover:bg-indigo-100"
                >
                  Editar
                </button>
                {t.state !== 'cancelled' && (
                  <button
                    onClick={() => handleCancelTicket(t.id)}
                    className="flex-1 py-1 bg-red-50 text-red-600 rounded text-sm hover:bg-red-100"
                  >
                    Cancelar
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 border rounded-lg disabled:opacity-50"
          >
            Anterior
          </button>
          <span className="text-sm text-gray-600">
            Página {currentPage} de {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="px-4 py-2 border rounded-lg disabled:opacity-50"
          >
            Siguiente
          </button>
        </div>
      )}

      {/* Modal Crear / Editar */}
      {(showCreateModal || showEditModal) && (
        <div className="fixed inset-0 modal-overlay-bokeh z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-xl">
            <div className="p-6 border-b border-gray-100">
              <h3 className="text-xl font-bold">
                {showCreateModal ? 'Crear Nuevo Boleto' : 'Editar Boleto'}
              </h3>
            </div>
            <form onSubmit={submitTicketForm} className="p-6 space-y-4">
              <FormSelect
                label="Viaje"
                required
                value={ticketForm.trip_id}
                onChange={(val) => setTicketForm({ ...ticketForm, trip_id: val })}
                options={availableTrips.map((trip) => ({
                  label: `${trip.route?.origin} → ${trip.route?.destination} - ${formatDate(trip.trip_datetime || '')}`,
                  value: trip.id
                }))}
                placeholder="Seleccionar viaje..."
              />

              <FormSelect
                label="Cliente"
                required
                value={ticketForm.client_id}
                onChange={(val) => setTicketForm({ ...ticketForm, client_id: val })}
                options={clients.map((c) => ({
                  label: `${c.firstname} ${c.lastname}`,
                  value: c.id
                }))}
                placeholder="Seleccionar cliente..."
              />

              {ticketForm.trip_id && (
                <FormSelect
                  label="Asiento"
                  required
                  value={ticketForm.seat_id}
                  onChange={(val) => setTicketForm({ ...ticketForm, seat_id: val })}
                  options={availableSeats.map((s) => ({
                    label: `Asiento ${s.seat_number} (${s.deck})`,
                    value: s.id
                  }))}
                  placeholder="Seleccionar asiento..."
                />
              )}

              <div className="grid grid-cols-2 gap-4">
                <FormSelect
                  label="Estado"
                  required
                  value={ticketForm.state}
                  onChange={(val) => setTicketForm({ ...ticketForm, state: val })}
                  options={[
                    { label: 'Pendiente', value: 'pending' },
                    { label: 'Confirmado', value: 'confirmed' },
                    { label: 'Cancelado', value: 'cancelled' },
                    { label: 'Completado', value: 'completed' }
                  ]}
                />

                <FormInput
                  label="Precio"
                  type="number"
                  step="0.01"
                  required
                  value={ticketForm.price}
                  onChange={(e) => setTicketForm({ ...ticketForm, price: parseFloat(e.target.value) })}
                />
              </div>

              <FormSelect
                label="Método de Pago"
                value={ticketForm.payment_method}
                onChange={(val) => setTicketForm({ ...ticketForm, payment_method: val })}
                options={[
                  { label: 'Sin especificar', value: '' },
                  { label: 'Efectivo', value: 'cash' },
                  { label: 'Tarjeta', value: 'card' },
                  { label: 'Transferencia', value: 'transfer' },
                  { label: 'QR', value: 'qr' }
                ]}
              />

              <div className="pt-4 flex justify-end gap-3 border-t">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                >
                  {isSubmitting ? 'Guardando...' : 'Guardar Boleto'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Component
