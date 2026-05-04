import { useState, useEffect } from 'react'
import { tripService } from '@/services/trip.service'

interface Trip {
    id: number
    trip_datetime: string
    route?: { origin?: string; destination?: string }
    bus?: { license_plate?: string; capacity?: number }
    available_seats?: number
    status?: string
}

export function useUpcomingTrips() {
    const [trips, setTrips] = useState<Trip[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const controller = new AbortController()
        async function load() {
            try {
                const data = await tripService.getAll({ status: 'scheduled,in_progress', limit: 5 })
                const items = Array.isArray(data) ? data : (data as { trips?: Trip[]; items?: Trip[] }).trips || (data as { items?: Trip[] }).items || []
                setTrips(items as Trip[])
            } catch (_err) {
                if (controller.signal.aborted) return
                setTrips([])
            } finally {
                if (!controller.signal.aborted) setLoading(false)
            }
        }
        load()
        return () => controller.abort('unmount')
    }, [])

    return { trips, loading }
}
