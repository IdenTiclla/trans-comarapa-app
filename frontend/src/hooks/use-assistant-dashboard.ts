import { useState, useEffect, useMemo, useCallback } from 'react'
import { tripService } from '@/services/trip.service'
import { toast } from 'sonner'
import { errMsg } from '@/lib/error-utils'
import type { MyTrip, TripTab } from '@/components/dashboards/assistant/types'

export function useAssistantDashboard() {
  const [trips, setTrips] = useState<MyTrip[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedTrip, setExpandedTrip] = useState<number | null>(null)
  const [filter, setFilter] = useState<'active' | 'all'>('active')
  const [tab, setTab] = useState<TripTab>('passengers')
  const [transitioning, setTransitioning] = useState<number | null>(null)

  const loadTrips = useCallback(async () => {
    setLoading(true)
    try {
      const status =
        filter === 'active' ? 'scheduled,boarding,departed' : undefined
      const data = await tripService.getMyTrips(
        status ? { status } : undefined,
      )
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
  }, [filter])

  useEffect(() => {
    loadTrips()
  }, [loadTrips])

  async function handleTransition(tripId: number, action: string, label: string) {
    setTransitioning(tripId)
    try {
      await tripService.transitionTrip(tripId, action)
      toast.success(`Viaje actualizado: ${label}`)
      await loadTrips()
    } catch (err: unknown) {
      const message = errMsg(err, 'Error al actualizar viaje')
      toast.error(message)
    } finally {
      setTransitioning(null)
    }
  }

  const todayTrips = useMemo(() => {
    const today = new Date().toDateString()
    return trips.filter(
      (t) => new Date(t.trip_datetime).toDateString() === today,
    )
  }, [trips])

  const upcomingTrips = useMemo(() => {
    const today = new Date().toDateString()
    return trips.filter(
      (t) => new Date(t.trip_datetime).toDateString() !== today,
    )
  }, [trips])

  const totalPassengers = todayTrips.reduce(
    (sum, t) => sum + t.occupied_seats,
    0,
  )
  const totalPackages = todayTrips.reduce(
    (sum, t) => sum + t.package_count,
    0,
  )
  const nextScheduled = todayTrips.find((t) => t.status === 'scheduled')

  return {
    trips,
    loading,
    expandedTrip,
    setExpandedTrip,
    filter,
    setFilter,
    tab,
    setTab,
    transitioning,
    handleTransition,
    todayTrips,
    upcomingTrips,
    totalPassengers,
    totalPackages,
    nextScheduled,
  }
}
