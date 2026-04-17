import { useEffect } from 'react'
import { useNavigate } from 'react-router'
import { useAppDispatch, useAppSelector } from '@/store'
import { fetchTrips, deleteTrip, selectTrips, selectTripLoading, selectTripError } from '@/store/trip.slice'
import { toast } from 'sonner'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Calendar, Bus, Users, Armchair } from 'lucide-react'

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

const STATUS_VARIANT: Record<string, 'default' | 'secondary' | 'outline' | 'destructive'> = {
    scheduled: 'secondary',
    in_progress: 'outline',
    completed: 'default',
    cancelled: 'destructive',
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
        <div className="w-full space-y-6">
            <div className="flex items-center justify-between">
                <Button onClick={() => navigate('/trips')}>Ver Tablero</Button>
            </div>

            {error && (
                <Card className="border-l-4 border-l-destructive">
                    <CardContent className="p-4">
                        <p className="text-destructive">{error}</p>
                    </CardContent>
                </Card>
            )}

            {loading ? (
                <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" /></div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {trips.length === 0 ? (
                        <div className="col-span-full text-center py-12 text-muted-foreground">No hay viajes programados</div>
                    ) : trips.map((trip) => {
                        const origin = trip.origin_name || trip.route?.origin?.name || 'Origen'
                        const dest = trip.destination_name || trip.route?.destination?.name || 'Destino'
                        return (
                            <Card key={trip.id} className="overflow-hidden">
                                <CardContent className="p-5">
                                    <div className="flex items-center justify-between mb-3">
                                        <h3 className="font-bold text-foreground text-lg truncate">{origin} → {dest}</h3>
                                        <Badge variant={STATUS_VARIANT[trip.status || ''] || 'secondary'}>
                                            {STATUS_LABELS[trip.status || ''] || trip.status || 'Programado'}
                                        </Badge>
                                    </div>
                                    <div className="space-y-2 text-sm text-muted-foreground">
                                        <p className="flex items-center gap-2">
                                            <Calendar className="h-4 w-4" />
                                            {new Date(trip.departure_date).toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short' })}{trip.departure_time ? ` ${trip.departure_time}` : ''}
                                        </p>
                                        {trip.bus?.plate_number && (
                                            <p className="flex items-center gap-2">
                                                <Bus className="h-4 w-4" />
                                                {trip.bus.plate_number}
                                            </p>
                                        )}
                                        {trip.driver && (
                                            <p className="flex items-center gap-2">
                                                <Users className="h-4 w-4" />
                                                {trip.driver.first_name} {trip.driver.last_name}
                                            </p>
                                        )}
                                        {trip.available_seats !== undefined && (
                                            <p className="flex items-center gap-2">
                                                <Armchair className="h-4 w-4" />
                                                {trip.available_seats} asientos disponibles
                                            </p>
                                        )}
                                    </div>
                                </CardContent>
                                <div className="border-t px-5 py-3 bg-muted/50 flex justify-between">
                                    <Button variant="ghost" size="sm" onClick={() => navigate(`/trips/${trip.id}`)}>Ver detalles</Button>
                                    <div className="space-x-2">
                                        <Button variant="ghost" size="sm" onClick={() => navigate(`/trips/${trip.id}/edit`)}>Editar</Button>
                                        <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive" onClick={() => handleDelete(trip)}>Eliminar</Button>
                                    </div>
                                </div>
                            </Card>
                        )
                    })}
                </div>
            )}
        </div>
    )
}
