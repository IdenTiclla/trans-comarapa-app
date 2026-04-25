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
import { Button } from '@/components/ui/button'
import { ViewToggle } from '@/components/ui/view-toggle'
import { LayoutGrid, List } from 'lucide-react'
import {
  type Ticket, type Client, type Trip, type Seat,
  formatDate, getStatusText,
} from '@/components/tickets/tickets-helpers'
import { TicketsStatsCards } from '@/components/tickets/TicketsStatsCards'
import { TicketsFilters } from '@/components/tickets/TicketsFilters'
import { TicketsTableView, TicketsCardGridView } from '@/components/tickets/TicketsListViews'
import { TicketFormModal } from '@/components/tickets/TicketFormModal'

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
    trip_id: '', client_id: '', seat_id: '', state: 'pending', price: 0, payment_method: '',
  })

  const [stats, setStats] = useState({ confirmed: 0, pending: 0, cancelled: 0, totalRevenue: 0 })
  const [comparison, setComparison] = useState({ confirmed: 0, pending: 0, cancelled: 0, totalRevenue: 0 })

  const fetchData = async () => {
    setIsLoading(true)
    try {
      const [ticketsRes, clientsRes, tripsRes, statsRes] = await Promise.all([
        ticketService.getAll({ skip: 0, limit: 10000 }),
        clientService.getAll({ skip: 0, limit: 10000 }),
        tripService.getAll({ upcoming: true }),
        (statsService.getTicketsStatsComparison() as Promise<unknown>).catch(() => null),
      ])

      setTickets((ticketsRes as Ticket[]) || [])
      setClients((clientsRes as Client[]) || [])
      setAvailableTrips((tripsRes as { trips?: Trip[] }).trips || [])

      if (statsRes) {
        type StatsBucket = { confirmed?: number; pending?: number; cancelled?: number; totalRevenue?: number }
        const d = statsRes as { today: StatsBucket; comparison: StatsBucket }
        setStats({
          confirmed: d.today.confirmed || 0,
          pending: d.today.pending || 0,
          cancelled: d.today.cancelled || 0,
          totalRevenue: d.today.totalRevenue || 0,
        })
        setComparison({
          confirmed: d.comparison.confirmed || 0,
          pending: d.comparison.pending || 0,
          cancelled: d.comparison.cancelled || 0,
          totalRevenue: d.comparison.totalRevenue || 0,
        })
      }
    } catch (error) {
      console.error(error)
      toast.error('Error al cargar datos')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => { fetchData() }, [])

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
    if (!tripId) { setAvailableSeats([]); return }
    try {
      const tripResponse = (await tripService.getById(Number(tripId))) as { bus_id?: number }
      if (!tripResponse.bus_id) { setAvailableSeats([]); return }
      const seatsResponse = (await apiFetch(`/seats/bus/${tripResponse.bus_id}`)) as Seat[]
      const availableResponse = (await apiFetch(`/trips/${tripId}/available-seats`)) as { available_seat_numbers: number[] }
      setAvailableSeats(
        seatsResponse.filter((seat) => availableResponse.available_seat_numbers.includes(seat.seat_number))
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
        if (seat) setTicketForm((prev) => ({ ...prev, seat_id: seat.id.toString() }))
      }
    } else {
      setAvailableSeats([])
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ticketForm.trip_id])

  function getClientName(clientId: number) {
    const client = clients.find((c) => c.id === clientId)
    return client ? `${client.firstname} ${client.lastname}` : `Cliente #${clientId}`
  }

  function getTripInfo(tripId: number) {
    const trip = availableTrips.find((t) => t.id === tripId)
    if (trip?.route) return `${trip.route.origin} → ${trip.route.destination}`
    return `Viaje #${tripId}`
  }

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
    if (statusFilter) filtered = filtered.filter((t) => t.state === statusFilter)
    if (dateFromFilter) filtered = filtered.filter((t) => t.created_at.split('T')[0] >= dateFromFilter)
    if (dateToFilter) filtered = filtered.filter((t) => t.created_at.split('T')[0] <= dateToFilter)
    if (paymentMethodFilter) filtered = filtered.filter((t) => t.payment_method === paymentMethodFilter)
    return filtered
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    setTicketForm({ trip_id: '', client_id: '', seat_id: '', state: 'pending', price: 0, payment_method: '' })
    if (searchParams.get('trip_id')) navigate(`/trips/${searchParams.get('trip_id')}`)
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
      if (showCreateModal) await ticketService.create(payload)
      else if (showEditModal && editingTicket) await ticketService.update(editingTicket.id, payload)
      toast.success(showCreateModal ? 'Boleto creado' : 'Boleto actualizado')
      handleCloseModal()
      fetchData()
    } catch (error) {
      if (error.status === 403) toast.error('Permiso denegado. Solo secretarios/administradores pueden crear boletos.')
      else toast.error('Error al guardar boleto')
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
      <div className="mb-8 bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
          Gestión de Boletos
        </h1>
        <p className="mt-2 text-gray-600">Administra los boletos de viaje de los pasajeros</p>
      </div>

      <TicketsStatsCards stats={stats} comparison={comparison} />

      <TicketsFilters
        searchQuery={searchQuery} setSearchQuery={setSearchQuery}
        statusFilter={statusFilter} setStatusFilter={setStatusFilter}
        dateFromFilter={dateFromFilter} setDateFromFilter={setDateFromFilter}
        dateToFilter={dateToFilter} setDateToFilter={setDateToFilter}
        paymentMethodFilter={paymentMethodFilter} setPaymentMethodFilter={setPaymentMethodFilter}
        showAdvancedFilters={showAdvancedFilters} setShowAdvancedFilters={setShowAdvancedFilters}
        activeFiltersCount={activeFiltersCount}
        onClearAll={clearAllFilters}
      />

      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-900">Lista de Boletos ({filteredTickets.length})</h2>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={exportData}>Exportar</Button>
          <div className="flex bg-gray-100 rounded-lg p-1">
            <ViewToggle
              value={viewMode}
              onChange={(val) => setViewMode(val as 'cards' | 'table')}
              options={[
                { value: 'cards', icon: <LayoutGrid className="h-4 w-4" />, label: 'Tarjetas', ariaLabel: 'Vista en tarjetas' },
                { value: 'table', icon: <List className="h-4 w-4" />, label: 'Lista', ariaLabel: 'Vista en tabla' },
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
        <TicketsTableView
          tickets={paginatedTickets}
          getClientName={getClientName}
          getTripInfo={getTripInfo}
          onEdit={handleEditTicket}
          onCancel={handleCancelTicket}
        />
      ) : (
        <TicketsCardGridView
          tickets={paginatedTickets}
          getClientName={getClientName}
          getTripInfo={getTripInfo}
          onEdit={handleEditTicket}
          onCancel={handleCancelTicket}
        />
      )}

      {totalPages > 1 && (
        <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm">
          <Button variant="outline" onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1}>
            Anterior
          </Button>
          <span className="text-sm text-gray-600">Página {currentPage} de {totalPages}</span>
          <Button variant="outline" onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>
            Siguiente
          </Button>
        </div>
      )}

      {(showCreateModal || showEditModal) && (
        <TicketFormModal
          mode={showCreateModal ? 'create' : 'edit'}
          form={ticketForm}
          setForm={setTicketForm}
          availableTrips={availableTrips}
          clients={clients}
          availableSeats={availableSeats}
          isSubmitting={isSubmitting}
          onSubmit={submitTicketForm}
          onClose={handleCloseModal}
        />
      )}
    </div>
  )
}

export default Component
