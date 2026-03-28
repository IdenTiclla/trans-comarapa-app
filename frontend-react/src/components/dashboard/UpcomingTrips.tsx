import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router'
import { tripService } from '@/services/trip.service'

interface Trip {
    id: number
    trip_datetime: string
    route?: { origin?: string; destination?: string }
    bus?: { license_plate?: string; capacity?: number }
    available_seats?: number
    status?: string
}

function formatDateTime(dateStr: string, timeStr?: string) {
    const date = new Date(dateStr)
    const formatted = new Intl.DateTimeFormat('es-ES', {
        day: 'numeric',
        month: 'short',
        hour: 'numeric',
        minute: 'numeric',
    }).format(date)
    return timeStr ? `${formatted}` : formatted
}

export default function UpcomingTrips() {
    const navigate = useNavigate()
    const [trips, setTrips] = useState<Trip[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const controller = new AbortController()
        async function load() {
            try {
                const data = await tripService.getAll({ status: 'scheduled,in_progress', limit: 5 }, controller.signal)
                const items = Array.isArray(data) ? data : (data as { trips?: Trip[]; items?: Trip[] }).trips || (data as any).items || []
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

    if (loading) {
        return (
            <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
            </div>
        )
    }

    if (trips.length === 0) {
        return <p className="text-gray-500 text-center py-4">No hay viajes próximos</p>
    }

    return (
        <div className="space-y-3">
            {trips.map((trip) => {
                const origin = trip.route?.origin || 'Origen'
                const destination = trip.route?.destination || 'Destino'

                return (
                    <div
                        key={trip.id}
                        onClick={() => navigate(`/trips/${trip.id}`)}
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-blue-50 cursor-pointer transition-colors border border-gray-200 hover:border-blue-200"
                    >
                        <div className="flex-1 min-w-0">
                            <p className="font-semibold text-gray-900 truncate">
                                {origin} → {destination}
                            </p>
                            <p className="text-sm text-gray-600">
                                {formatDateTime(trip.trip_datetime, 'true')}
                            </p>
                        </div>
                        <div className="text-right ml-4 flex-shrink-0">
                            {trip.bus?.license_plate && (
                                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-medium">
                                    {trip.bus.license_plate}
                                </span>
                            )}
                            {trip.available_seats !== undefined && (
                                <p className="text-xs text-gray-500 mt-1">{trip.available_seats} asientos</p>
                            )}
                        </div>
                    </div>
                )
            })}
        </div>
    )
}
