import { useState, useEffect, useMemo } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { tripService } from '@/services/trip.service'

interface Passenger {
  ticket_id: number
  seat_number: number | string
  client_name: string
  state: string
}

interface MyTrip {
  id: number
  trip_datetime: string
  status: string
  route: { origin: string; destination: string }
  bus: { license_plate: string; model: string; brand: string } | null
  total_seats: number
  occupied_seats: number
  available_seats: number
  package_count: number
  passengers: Passenger[]
}

const STATUS_LABELS: Record<string, string> = {
  scheduled: 'Programado',
  boarding: 'Abordando',
  departed: 'En camino',
  arrived: 'Llegó',
  cancelled: 'Cancelado',
}

const STATUS_COLORS: Record<string, string> = {
  scheduled: 'bg-blue-100 text-blue-800',
  boarding: 'bg-yellow-100 text-yellow-800',
  departed: 'bg-amber-100 text-amber-800',
  arrived: 'bg-gray-100 text-gray-800',
  cancelled: 'bg-red-100 text-red-800',
}

export function Component() {
  const { user } = useAuth()
  const [trips, setTrips] = useState<MyTrip[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedTrip, setExpandedTrip] = useState<number | null>(null)
  const [filter, setFilter] = useState<'active' | 'all'>('active')
  const [tab, setTab] = useState<'passengers' | 'checklist'>('passengers')

  useEffect(() => {
    loadTrips()
  }, [filter])

  async function loadTrips() {
    setLoading(true)
    try {
      const status = filter === 'active' ? 'scheduled,boarding,departed' : undefined
      const data = await tripService.getMyTrips(status ? { status } : undefined)
      setTrips(data)
    } catch {
      setTrips([])
    } finally {
      setLoading(false)
    }
  }

  const todayTrips = useMemo(() => {
    const today = new Date().toDateString()
    return trips.filter(t => new Date(t.trip_datetime).toDateString() === today)
  }, [trips])

  const upcomingTrips = useMemo(() => {
    const today = new Date().toDateString()
    return trips.filter(t => new Date(t.trip_datetime).toDateString() !== today)
  }, [trips])

  function formatTime(datetime: string) {
    return new Date(datetime).toLocaleTimeString('es-BO', { hour: '2-digit', minute: '2-digit' })
  }

  function formatDate(datetime: string) {
    return new Date(datetime).toLocaleDateString('es-BO', { weekday: 'short', day: 'numeric', month: 'short' })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-slate-100 w-full">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200 w-full">
        <div className="w-full px-2 sm:px-4 lg:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-amber-600 to-amber-700 rounded-xl shadow-lg">
                <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Mis Viajes</h1>
                <p className="text-gray-700">Bienvenido, {user?.firstname} {user?.lastname}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setFilter('active')}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${filter === 'active' ? 'bg-amber-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
              >
                Activos
              </button>
              <button
                onClick={() => setFilter('all')}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${filter === 'all' ? 'bg-amber-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
              >
                Todos
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full px-2 sm:px-4 lg:px-6 py-6 space-y-6">
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-amber-600" />
          </div>
        ) : trips.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <svg className="h-16 w-16 text-gray-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <h2 className="text-xl font-semibold text-gray-600 mb-2">Sin viajes asignados</h2>
            <p className="text-gray-500">No tienes viajes {filter === 'active' ? 'activos' : ''} asignados por el momento.</p>
          </div>
        ) : (
          <>
            {todayTrips.length > 0 && (
              <section>
                <h2 className="text-lg font-semibold text-gray-800 mb-3">Hoy</h2>
                <div className="space-y-4">
                  {todayTrips.map(trip => (
                    <TripCard
                      key={trip.id}
                      trip={trip}
                      expanded={expandedTrip === trip.id}
                      onToggle={() => setExpandedTrip(expandedTrip === trip.id ? null : trip.id)}
                      formatTime={formatTime}
                      tab={tab}
                      onTabChange={setTab}
                    />
                  ))}
                </div>
              </section>
            )}

            {upcomingTrips.length > 0 && (
              <section>
                <h2 className="text-lg font-semibold text-gray-800 mb-3">
                  {filter === 'active' ? 'Próximos' : 'Otros viajes'}
                </h2>
                <div className="space-y-4">
                  {upcomingTrips.map(trip => (
                    <TripCard
                      key={trip.id}
                      trip={trip}
                      expanded={expandedTrip === trip.id}
                      onToggle={() => setExpandedTrip(expandedTrip === trip.id ? null : trip.id)}
                      formatTime={formatTime}
                      showDate
                      formatDate={formatDate}
                      tab={tab}
                      onTabChange={setTab}
                    />
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </div>
    </div>
  )
}

function TripCard({
  trip,
  expanded,
  onToggle,
  formatTime,
  showDate,
  formatDate,
  tab,
  onTabChange,
}: {
  trip: MyTrip
  expanded: boolean
  onToggle: () => void
  formatTime: (d: string) => string
  showDate?: boolean
  formatDate?: (d: string) => string
  tab: 'passengers' | 'checklist'
  onTabChange: (t: 'passengers' | 'checklist') => void
}) {
  const [checked, setChecked] = useState<Set<number>>(new Set())

  function toggleCheck(ticketId: number) {
    setChecked(prev => {
      const next = new Set(prev)
      if (next.has(ticketId)) next.delete(ticketId)
      else next.add(ticketId)
      return next
    })
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <button onClick={onToggle} className="w-full text-left px-4 py-4 hover:bg-gray-50 transition-colors">
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-1">
              <span className="text-lg font-semibold text-gray-900">
                {trip.route.origin} → {trip.route.destination}
              </span>
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[trip.status] || 'bg-gray-100 text-gray-800'}`}>
                {STATUS_LABELS[trip.status] || trip.status}
              </span>
            </div>
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <span>{showDate && formatDate ? formatDate(trip.trip_datetime) + ' · ' : ''}{formatTime(trip.trip_datetime)}</span>
              {trip.bus && <span>{trip.bus.brand} {trip.bus.model} · {trip.bus.license_plate}</span>}
            </div>
          </div>
          <div className="flex items-center gap-4 ml-4">
            <div className="text-right">
              <div className="text-sm font-medium text-gray-900">{trip.occupied_seats}/{trip.total_seats}</div>
              <div className="text-xs text-gray-500">pasajeros</div>
            </div>
            <div className="text-right">
              <div className="text-sm font-medium text-gray-900">{trip.package_count}</div>
              <div className="text-xs text-gray-500">encomiendas</div>
            </div>
            <svg className={`h-5 w-5 text-gray-400 transition-transform ${expanded ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </button>

      {expanded && (
        <div className="border-t border-gray-100">
          {/* Tabs */}
          <div className="flex border-b border-gray-100">
            <button
              onClick={() => onTabChange('passengers')}
              className={`flex-1 px-4 py-2 text-sm font-medium transition-colors ${tab === 'passengers' ? 'text-amber-700 border-b-2 border-amber-600' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Pasajeros
            </button>
            <button
              onClick={() => onTabChange('checklist')}
              className={`flex-1 px-4 py-2 text-sm font-medium transition-colors ${tab === 'checklist' ? 'text-amber-700 border-b-2 border-amber-600' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Verificación de Abordaje
            </button>
          </div>

          <div className="px-4 py-4">
            {tab === 'passengers' ? (
              <>
                {trip.passengers.length === 0 ? (
                  <p className="text-sm text-gray-500 italic">Sin pasajeros registrados.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="text-left py-2 pr-4 font-medium text-gray-600">Asiento</th>
                          <th className="text-left py-2 pr-4 font-medium text-gray-600">Pasajero</th>
                          <th className="text-left py-2 font-medium text-gray-600">Estado</th>
                        </tr>
                      </thead>
                      <tbody>
                        {trip.passengers.map(p => (
                          <tr key={p.ticket_id} className="border-b border-gray-50">
                            <td className="py-2 pr-4 font-medium text-gray-900">{p.seat_number}</td>
                            <td className="py-2 pr-4 text-gray-700">{p.client_name}</td>
                            <td className="py-2">
                              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${p.state === 'confirmed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                {p.state === 'confirmed' ? 'Confirmado' : p.state === 'pending' ? 'Pendiente' : p.state}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </>
            ) : (
              <>
                {trip.passengers.length === 0 ? (
                  <p className="text-sm text-gray-500 italic">Sin pasajeros para verificar.</p>
                ) : (
                  <div className="space-y-2">
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-sm text-gray-600">
                        {checked.size} de {trip.passengers.length} verificados
                      </span>
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-amber-600 h-2 rounded-full transition-all"
                          style={{ width: `${trip.passengers.length > 0 ? (checked.size / trip.passengers.length) * 100 : 0}%` }}
                        />
                      </div>
                    </div>
                    {trip.passengers.map(p => (
                      <label
                        key={p.ticket_id}
                        className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${checked.has(p.ticket_id) ? 'bg-amber-50 border-amber-200' : 'bg-white border-gray-200 hover:bg-gray-50'}`}
                      >
                        <input
                          type="checkbox"
                          checked={checked.has(p.ticket_id)}
                          onChange={() => toggleCheck(p.ticket_id)}
                          className="h-4 w-4 rounded border-gray-300 text-amber-600 focus:ring-amber-500"
                        />
                        <span className="font-medium text-gray-900 w-10">#{p.seat_number}</span>
                        <span className={`flex-1 ${checked.has(p.ticket_id) ? 'text-gray-400 line-through' : 'text-gray-700'}`}>
                          {p.client_name}
                        </span>
                      </label>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
