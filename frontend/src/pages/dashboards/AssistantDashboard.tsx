import { useState, useEffect, useMemo } from 'react'
import { tripService } from '@/services/trip.service'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { KpiCard } from '@/components/dashboards/assistant/KpiCard'
import { TripCard } from '@/components/dashboards/assistant/TripCard'
import { formatTime, formatDate } from '@/components/dashboards/assistant/constants'
import type { MyTrip, TripTab } from '@/components/dashboards/assistant/types'

export function Component() {
  const [trips, setTrips] = useState<MyTrip[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedTrip, setExpandedTrip] = useState<number | null>(null)
  const [filter, setFilter] = useState<'active' | 'all'>('active')
  const [tab, setTab] = useState<TripTab>('passengers')
  const [transitioning, setTransitioning] = useState<number | null>(null)

  useEffect(() => {
    loadTrips()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter])

  async function loadTrips() {
    setLoading(true)
    try {
      const status = filter === 'active' ? 'scheduled,boarding,departed' : undefined
      const data = await tripService.getMyTrips(status ? { status } : undefined)
      setTrips(data)
      for (const trip of data) {
        if (trip.status === 'arrived' || trip.status === 'cancelled') {
          localStorage.removeItem(`boarding-checklist-${trip.id}`)
        }
      }
    } catch {
      setTrips([])
    } finally {
      setLoading(false)
    }
  }

  async function handleTransition(tripId: number, action: string, label: string) {
    setTransitioning(tripId)
    try {
      await tripService.transitionTrip(tripId, action)
      toast.success(`Viaje actualizado: ${label}`)
      await loadTrips()
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error al actualizar viaje'
      toast.error(message)
    } finally {
      setTransitioning(null)
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

  const totalPassengers = todayTrips.reduce((sum, t) => sum + t.occupied_seats, 0)
  const totalPackages = todayTrips.reduce((sum, t) => sum + t.package_count, 0)
  const nextScheduled = todayTrips.find(t => t.status === 'scheduled')

  return (
    <div className="w-full">
      <div className="flex justify-end gap-2 px-2 sm:px-4 lg:px-6 pt-4">
        <Button
          variant={filter === 'active' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('active')}
          className="rounded-xl"
        >
          Activos
        </Button>
        <Button
          variant={filter === 'all' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('all')}
          className="rounded-xl"
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
          <div className="flex justify-center py-16">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" />
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
                      onTransition={handleTransition}
                      transitioning={transitioning}
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
                      onTransition={handleTransition}
                      transitioning={transitioning}
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
