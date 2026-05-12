import { useDriverDashboard } from '@/hooks/use-driver-dashboard'
import { useDocumentTitle } from '@/hooks/use-document-title'
import { useConfirm } from '@/hooks/use-confirm'
import { Button } from '@/components/ui/button'

function KpiCard({ label, value, icon }: { label: string; value: string | number; icon: string }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
      <div className="flex items-center gap-3">
        <span className="text-2xl">{icon}</span>
        <div>
          <div className="text-xl font-bold text-gray-900">{value}</div>
          <div className="text-xs text-gray-500">{label}</div>
        </div>
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
  onTransition,
  transitioning,
  STATUS_LABELS,
  STATUS_COLORS,
  TRANSITION_CONFIG,
}: {
  trip: Parameters<typeof onTransition>[0] extends never ? never : import('@/components/dashboards/assistant/types').MyTrip
  expanded: boolean
  onToggle: () => void
  formatTime: (d: string) => string
  showDate?: boolean
  formatDate?: (d: string) => string
  onTransition: (tripId: number, action: string, label: string) => void
  transitioning: number | null
  STATUS_LABELS: Record<string, string>
  STATUS_COLORS: Record<string, string>
  TRANSITION_CONFIG: Record<string, { action: string; label: string; color: string; confirm?: boolean }>
}) {
  const transition = TRANSITION_CONFIG[trip.status]
  const { confirm, ConfirmDialog } = useConfirm()

  async function handleTransitionClick(e: React.MouseEvent) {
    e.stopPropagation()
    if (!transition) return
    if (transition.confirm && !(await confirm({ title: transition.label ?? 'Confirmar acción', description: `¿Confirmar "${transition.label}"?`, confirmLabel: 'Sí, confirmar' }))) return
    onTransition(trip.id, transition.action, transition.label)
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <Button
        variant="ghost"
        onClick={onToggle}
        aria-expanded={expanded}
        aria-label={`Detalles del viaje ${trip.route.origin} a ${trip.route.destination}`}
        className="h-auto w-full justify-start rounded-none px-4 py-4 text-left hover:bg-gray-50 whitespace-normal"
      >
        <div className="flex w-full items-center justify-between">
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
            {trip.package_count > 0 && (
              <div className="text-right">
                <div className="text-sm font-medium text-gray-900">{trip.package_count}</div>
                <div className="text-xs text-gray-500">encomiendas</div>
              </div>
            )}
            <svg aria-hidden="true" className={`h-5 w-5 text-gray-400 transition-transform ${expanded ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </Button>

      {transition && (
        <div className="px-4 pb-3">
          <Button
            onClick={handleTransitionClick}
            disabled={transitioning === trip.id}
            className={`w-full h-auto py-2 rounded-lg text-sm font-medium ${transition.color} disabled:opacity-50`}
          >
            {transitioning === trip.id ? 'Actualizando...' : transition.label}
          </Button>
        </div>
      )}

      {expanded && (
        <div className="border-t border-gray-100 px-4 py-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Manifiesto de Pasajeros</h3>
          {trip.passengers.length === 0 ? (
            <p className="text-sm text-gray-500 italic">Sin pasajeros registrados.</p>
          ) : (
            <div className="overflow-x-auto">
              {/* eslint-disable-next-line no-restricted-syntax */}
              <table className="w-full text-sm">
                <caption className="sr-only">Viajes del conductor</caption>
                <thead>
                  <tr className="border-b border-gray-200">
                    <th scope="col" className="text-left py-2 pr-4 font-medium text-gray-600">Asiento</th>
                    <th scope="col" className="text-left py-2 pr-4 font-medium text-gray-600">Pasajero</th>
                    <th scope="col" className="text-left py-2 font-medium text-gray-600">Estado</th>
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
        </div>
      )}
      {ConfirmDialog}
    </div>
  )
}

export function Component() {
  useDocumentTitle('Panel de Conductor')
  const {
    loading, expandedTrip, setExpandedTrip, filter, setFilter,
    transitioning, handleTransition, todayTrips, upcomingTrips,
    totalPassengers, totalPackages, nextScheduled,
    formatTime, formatDate, STATUS_LABELS, STATUS_COLORS, TRANSITION_CONFIG,
  } = useDriverDashboard()

  return (
    <div className="w-full">
      <h1 className="sr-only">Panel de Conductor</h1>
      <div className="flex justify-end gap-2 px-2 sm:px-4 lg:px-6 pt-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setFilter('active')}
          className={`h-auto px-3 py-1.5 rounded-lg text-sm font-medium ${filter === 'active' ? 'bg-primary text-white hover:bg-primary/90 hover:text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
        >
          Activos
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setFilter('all')}
          className={`h-auto px-3 py-1.5 rounded-lg text-sm font-medium ${filter === 'all' ? 'bg-primary text-white hover:bg-primary/90 hover:text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
        >
          Todos
        </Button>
      </div>

      <div className="w-full px-2 sm:px-4 lg:px-6 py-4 space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <KpiCard label="Viajes Hoy" value={todayTrips.length} icon="🚌" />
          <KpiCard label="Pasajeros" value={totalPassengers} icon="👥" />
          <KpiCard label="Encomiendas" value={totalPackages} icon="📦" />
          <KpiCard label="Próximo" value={nextScheduled ? formatTime(nextScheduled.trip_datetime) : '—'} icon="🕐" />
        </div>

        {loading ? (
          <div role="status" aria-live="polite" className="flex justify-center py-16">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" aria-hidden="true" />
            <span className="sr-only">Cargando viajes...</span>
          </div>
        ) : todayTrips.length === 0 && upcomingTrips.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <svg aria-hidden="true" className="h-16 w-16 text-gray-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <h2 className="text-xl font-semibold text-gray-600 mb-2">Sin viajes asignados</h2>
            <p className="text-gray-500">No tienes viajes {filter === 'active' ? 'activos' : ''} asignados por el momento.</p>
          </div>
        ) : (
          <>
            {todayTrips.length > 0 && (
              <section aria-labelledby="driver-today-heading">
                <h2 id="driver-today-heading" className="text-lg font-semibold text-gray-800 mb-3">Hoy</h2>
                <div className="space-y-4">
                  {todayTrips.map(trip => (
                    <TripCard
                      key={trip.id}
                      trip={trip}
                      expanded={expandedTrip === trip.id}
                      onToggle={() => setExpandedTrip(expandedTrip === trip.id ? null : trip.id)}
                      formatTime={formatTime}
                      onTransition={handleTransition}
                      transitioning={transitioning}
                      STATUS_LABELS={STATUS_LABELS}
                      STATUS_COLORS={STATUS_COLORS}
                      TRANSITION_CONFIG={TRANSITION_CONFIG}
                    />
                  ))}
                </div>
              </section>
            )}

            {upcomingTrips.length > 0 && (
              <section aria-labelledby="driver-upcoming-heading">
                <h2 id="driver-upcoming-heading" className="text-lg font-semibold text-gray-800 mb-3">
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
                      onTransition={handleTransition}
                      transitioning={transitioning}
                      STATUS_LABELS={STATUS_LABELS}
                      STATUS_COLORS={STATUS_COLORS}
                      TRANSITION_CONFIG={TRANSITION_CONFIG}
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
