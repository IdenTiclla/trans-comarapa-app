import { useEffect } from 'react'
import { useNavigate } from 'react-router'
import { useAppDispatch, useAppSelector } from '@/store'
import { fetchTrips, deleteTrip, selectTrips, selectTripLoading, selectTripError } from '@/store/trip.slice'
import { toast } from 'sonner'

interface Trip {
    id: number
    departure_date: string
    departure_time?: string
    origin_name?: string
    destination_name?: string
    route?: { origin?: { name: string }; destination?: { name: string } }
    bus?: { plate_number?: string }
    driver?: { first_name?: string; last_name?: string }
    status?: string
    available_seats?: number
    [key: string]: unknown
}

const STATUS_COLORS: Record<string, string> = {
    scheduled: 'bg-blue-100 text-blue-700',
    in_progress: 'bg-yellow-100 text-yellow-700',
    completed: 'bg-green-100 text-green-700',
    cancelled: 'bg-red-100 text-red-700',
}
const STATUS_LABELS: Record<string, string> = {
    scheduled: 'Programado',
    in_progress: 'En curso',
    completed: 'Completado',
    cancelled: 'Cancelado',
}

export function Component() {
    const dispatch = useAppDispatch()
    const navigate = useNavigate()
    const trips = useAppSelector(selectTrips) as Trip[]
    const loading = useAppSelector(selectTripLoading)
    const error = useAppSelector(selectTripError)

    useEffect(() => { dispatch(fetchTrips({})) }, [dispatch])

    const handleDelete = async (trip: Trip) => {
        const origin = trip.origin_name || trip.route?.origin?.name || 'Origen'
        const dest = trip.destination_name || trip.route?.destination?.name || 'Destino'
        if (!confirm(`¿Eliminar viaje ${origin} → ${dest}?`)) return
        try { await dispatch(deleteTrip(trip.id)).unwrap(); toast.success('Viaje eliminado'); dispatch(fetchTrips({})) } catch (err) { toast.error(`Error: ${err}`) }
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Gestión de Viajes</h1>
                    <p className="text-gray-600 mt-1">Programación y control de viajes</p>
                </div>
                <button onClick={() => navigate('/trips')} className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-lg transition-colors">Ver Tablero</button>
            </div>

            {error && <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded"><p className="text-red-700">{error}</p></div>}

            {loading ? (
                <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" /></div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {trips.length === 0 ? (
                        <div className="col-span-full text-center py-12 text-gray-500">No hay viajes programados</div>
                    ) : trips.map((trip) => {
                        const origin = trip.origin_name || trip.route?.origin?.name || 'Origen'
                        const dest = trip.destination_name || trip.route?.destination?.name || 'Destino'
                        return (
                            <div key={trip.id} className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-shadow">
                                <div className="p-5">
                                    <div className="flex items-center justify-between mb-3">
                                        <h3 className="font-bold text-gray-900 text-lg truncate">{origin} → {dest}</h3>
                                        <span className={`px-2 py-1 text-xs rounded-full font-medium ${STATUS_COLORS[trip.status || ''] || 'bg-gray-100 text-gray-700'}`}>
                                            {STATUS_LABELS[trip.status || ''] || trip.status || 'Programado'}
                                        </span>
                                    </div>
                                    <div className="space-y-2 text-sm text-gray-600">
                                        <p>📅 {new Date(trip.departure_date).toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short' })}{trip.departure_time ? ` ${trip.departure_time}` : ''}</p>
                                        {trip.bus?.plate_number && <p>🚌 {trip.bus.plate_number}</p>}
                                        {trip.driver && <p>👤 {trip.driver.first_name} {trip.driver.last_name}</p>}
                                        {trip.available_seats !== undefined && <p>💺 {trip.available_seats} asientos disponibles</p>}
                                    </div>
                                </div>
                                <div className="border-t border-gray-100 px-5 py-3 bg-gray-50 flex justify-between">
                                    <button onClick={() => navigate(`/trips/${trip.id}`)} className="text-blue-600 hover:text-blue-800 text-sm font-medium">Ver detalles</button>
                                    <div className="space-x-3">
                                        <button onClick={() => navigate(`/trips/${trip.id}/edit`)} className="text-gray-600 hover:text-gray-800 text-sm font-medium">Editar</button>
                                        <button onClick={() => handleDelete(trip)} className="text-red-600 hover:text-red-800 text-sm font-medium">Eliminar</button>
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}
        </div>
    )
}
