import { useState, useEffect, useMemo, useCallback } from 'react'
import { tripService } from '@/services/trip.service'
import { toast } from 'sonner'
import { errMsg } from '@/lib/error-utils'
import { LOCALE } from '@/lib/locale-config'
import type { MyTrip } from '@/components/dashboards/assistant/types'

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
  departed: 'bg-emerald-100 text-emerald-800',
  arrived: 'bg-gray-100 text-gray-800',
  cancelled: 'bg-red-100 text-red-800',
}

const TRANSITION_CONFIG: Record<string, { action: string; label: string; color: string; confirm?: boolean }> = {
  scheduled: { action: 'start_boarding', label: 'Iniciar Abordaje', color: 'bg-blue-600 hover:bg-blue-700 text-white' },
  boarding: { action: 'depart', label: 'Partir', color: 'bg-emerald-600 hover:bg-emerald-700 text-white', confirm: true },
  departed: { action: 'arrive', label: 'Llegamos', color: 'bg-gray-700 hover:bg-gray-800 text-white', confirm: true },
}

export function useDriverDashboard() {
  const [trips, setTrips] = useState<MyTrip[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedTrip, setExpandedTrip] = useState<number | null>(null)
  const [filter, setFilter] = useState<'active' | 'all'>('active')
  const [transitioning, setTransitioning] = useState<number | null>(null)

  const loadTrips = useCallback(async () => {
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
    return trips.filter((t) => new Date(t.trip_datetime).toDateString() === today)
  }, [trips])

  const upcomingTrips = useMemo(() => {
    const today = new Date().toDateString()
    return trips.filter((t) => new Date(t.trip_datetime).toDateString() !== today)
  }, [trips])

  const totalPassengers = todayTrips.reduce((sum, t) => sum + t.occupied_seats, 0)
  const totalPackages = todayTrips.reduce((sum, t) => sum + t.package_count, 0)
  const nextScheduled = todayTrips.find((t) => t.status === 'scheduled')

  function formatTime(datetime: string) {
    return new Date(datetime).toLocaleTimeString(LOCALE, { hour: '2-digit', minute: '2-digit' })
  }

  function formatDate(datetime: string) {
    return new Date(datetime).toLocaleDateString(LOCALE, { weekday: 'short', day: 'numeric', month: 'short' })
  }

  return {
    trips,
    loading,
    expandedTrip,
    setExpandedTrip,
    filter,
    setFilter,
    transitioning,
    handleTransition,
    todayTrips,
    upcomingTrips,
    totalPassengers,
    totalPackages,
    nextScheduled,
    formatTime,
    formatDate,
    STATUS_LABELS,
    STATUS_COLORS,
    TRANSITION_CONFIG,
  }
}
