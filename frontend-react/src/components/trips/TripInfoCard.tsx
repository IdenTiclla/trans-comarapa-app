import { TripStaffEditor } from './TripStaffEditor'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { MapPin, Bus, Banknote, Building2, User } from 'lucide-react'

const STATUS_MAP: Record<string, string> = { scheduled: 'Programado', boarding: 'Abordando', departed: 'Despachado', in_progress: 'En Progreso', arrived: 'Llegó', completed: 'Completado', cancelled: 'Cancelado' }
const STATUS_BADGE: Record<string, string> = { scheduled: 'bg-blue-50 text-blue-700 border-blue-200', boarding: 'bg-purple-50 text-purple-700 border-purple-200', departed: 'bg-orange-50 text-orange-700 border-orange-200', in_progress: 'bg-orange-50 text-orange-700 border-orange-200', arrived: 'bg-green-50 text-green-700 border-green-200', completed: 'bg-green-50 text-green-700 border-green-200', cancelled: 'bg-red-50 text-red-700 border-red-200' }

function formatTimeAmPm(timeString: string) {
    if (!timeString) return ''
    const parts = timeString.split(':')
    if (parts.length >= 2) {
        const hours = parseInt(parts[0], 10)
        const minutes = parts[1]
        const period = hours >= 12 ? 'PM' : 'AM'
        const displayHours = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours
        return `${displayHours}:${minutes} ${period}`
    }
    return timeString
}

function getDayName(dateString?: string) {
    if (!dateString) return ''
    const date = new Date(dateString)
    if (isNaN(date.getTime())) return ''
    return new Intl.DateTimeFormat('es-ES', { weekday: 'long' }).format(date)
}

function formatShortDate(dateString?: string) {
    if (!dateString) return ''
    const date = new Date(dateString)
    if (isNaN(date.getTime())) return ''
    return new Intl.DateTimeFormat('es-ES', { day: '2-digit', month: '2-digit', year: '2-digit' }).format(date)
}

interface TicketStats {
    total: number
    sold: number
    reserved: number
    available: number
}

interface StaffState {
    editingDriver: boolean
    setEditingDriver: (v: boolean) => void
    editingAssistant: boolean
    setEditingAssistant: (v: boolean) => void
    selectedDriverId: string
    setSelectedDriverId: (v: string) => void
    selectedAssistantId: string
    setSelectedAssistantId: (v: string) => void
    savingDriver: boolean
    savingAssistant: boolean
    saveDriver: () => void
    saveAssistant: () => void
}

interface Props {
    trip: any
    ticketStats: TicketStats
    formatDate: (dateString: string) => string
    drivers: any[]
    assistants: any[]
    staff: StaffState
}

export function TripInfoCard({ trip, ticketStats, formatDate, drivers, assistants, staff }: Props) {
    const occupancyPercent = ticketStats.total > 0 ? ((ticketStats.sold + ticketStats.reserved) / ticketStats.total) * 100 : 0

    const occupancyLevel = occupancyPercent >= 80 ? 'full' : occupancyPercent >= 50 ? 'medium' : 'available'
    const occupancyColors = {
        available: { bar: 'bg-status-available', bg: 'bg-green-50', text: 'text-green-700', label: 'Disponible' },
        medium: { bar: 'bg-status-medium', bg: 'bg-yellow-50', text: 'text-yellow-700', label: 'Moderado' },
        full: { bar: 'bg-status-full', bg: 'bg-red-50', text: 'text-red-700', label: 'Lleno' },
    }[occupancyLevel]

    return (
        <Card>
            <CardContent className="p-0">
                {/* Header */}
                <div className="px-5 py-4 border-b bg-muted/30 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="bg-primary p-2 rounded-lg">
                            <MapPin className="h-5 w-5 text-primary-foreground" />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-primary uppercase tracking-wide">Trans Comarapa</p>
                            <p className="text-[11px] text-muted-foreground">Viaje #{trip.id}</p>
                        </div>
                    </div>
                    <Badge variant="outline" className={`text-xs font-semibold border ${STATUS_BADGE[trip.status] || ''}`}>
                        {STATUS_MAP[trip.status] || trip.status}
                    </Badge>
                </div>

                {/* Route + Date/Time info */}
                <div className="px-5 py-3 border-b">
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
                        <div className="bg-primary/5 px-3 py-2 rounded-lg text-center">
                            <span className="text-[10px] font-semibold text-muted-foreground block uppercase">Origen</span>
                            <p className="text-sm font-bold text-foreground truncate">{trip.route?.origin || 'N/D'}</p>
                        </div>
                        <div className="bg-primary/5 px-3 py-2 rounded-lg text-center">
                            <span className="text-[10px] font-semibold text-muted-foreground block uppercase">Destino</span>
                            <p className="text-sm font-bold text-foreground truncate">{trip.route?.destination || 'N/D'}</p>
                        </div>
                        <div className="bg-primary/5 px-3 py-2 rounded-lg text-center">
                            <span className="text-[10px] font-semibold text-muted-foreground block uppercase">Día</span>
                            <p className="text-sm font-bold text-foreground capitalize">{getDayName(trip.trip_datetime)}</p>
                        </div>
                        <div className="bg-primary/5 px-3 py-2 rounded-lg text-center">
                            <span className="text-[10px] font-semibold text-muted-foreground block uppercase">Fecha</span>
                            <p className="text-sm font-bold text-foreground">{formatShortDate(trip.trip_datetime)}</p>
                        </div>
                        <div className="bg-primary/5 px-3 py-2 rounded-lg text-center col-span-2 sm:col-span-1">
                            <span className="text-[10px] font-semibold text-muted-foreground block uppercase">Hora</span>
                            <p className="text-sm font-bold text-foreground">{trip.departure_time ? formatTimeAmPm(trip.departure_time) : 'N/A'}</p>
                        </div>
                    </div>
                </div>

                {/* Body */}
                <div className="p-5">
                    <div className="flex flex-col lg:flex-row lg:items-start gap-4">
                        {/* Left: Bus details + Staff */}
                        <div className="flex-1 space-y-4">
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                                <div className="bg-muted/50 rounded-lg p-2.5">
                                    <div className="flex items-center gap-1.5 mb-1">
                                        <Bus className="h-3.5 w-3.5 text-muted-foreground" />
                                        <p className="text-[10px] text-muted-foreground font-medium uppercase">Bus</p>
                                    </div>
                                    <p className="font-semibold text-foreground">{trip.bus?.license_plate || 'N/A'}</p>
                                    {trip.bus?.brand && <p className="text-xs text-muted-foreground">{trip.bus.brand} {trip.bus.model || ''}</p>}
                                </div>
                                <div className="bg-muted/50 rounded-lg p-2.5">
                                    <div className="flex items-center gap-1.5 mb-1">
                                        <Banknote className="h-3.5 w-3.5 text-muted-foreground" />
                                        <p className="text-[10px] text-muted-foreground font-medium uppercase">Precio</p>
                                    </div>
                                    <p className="font-semibold text-foreground">Bs. {trip.route?.price ?? trip.price ?? 'N/A'}</p>
                                </div>
                                <div className="bg-muted/50 rounded-lg p-2.5">
                                    <div className="flex items-center gap-1.5 mb-1">
                                        <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
                                        <p className="text-[10px] text-muted-foreground font-medium uppercase">Pisos</p>
                                    </div>
                                    <p className="font-semibold text-foreground">{trip.bus?.floors || 1}</p>
                                </div>
                                <div className="bg-muted/50 rounded-lg p-2.5">
                                    <div className="flex items-center gap-1.5 mb-1">
                                        <User className="h-3.5 w-3.5 text-muted-foreground" />
                                        <p className="text-[10px] text-muted-foreground font-medium uppercase">Dueño</p>
                                    </div>
                                    <p className="font-semibold text-foreground">
                                        {trip.bus?.owner ? `${trip.bus.owner.firstname} ${trip.bus.owner.lastname}` : 'Sin asignar'}
                                    </p>
                                </div>
                            </div>

                            <TripStaffEditor
                                drivers={drivers}
                                assistants={assistants}
                                trip={trip}
                                staff={staff}
                            />
                        </div>

                        {/* Right: Ticket stats */}
                        <div className="lg:w-56">
                            <div className={`${occupancyColors.bg} rounded-xl p-4 border`}>
                                <h4 className="text-xs font-bold text-foreground mb-2 uppercase tracking-wide">Ocupación</h4>
                                <div className="space-y-1.5">
                                    <div className="flex justify-between text-sm"><span className="text-muted-foreground">Total</span><span className="font-bold">{ticketStats.total}</span></div>
                                    <div className="flex justify-between text-sm"><span className="text-green-600">Vendidos</span><span className="font-bold text-green-700">{ticketStats.sold}</span></div>
                                    <div className="flex justify-between text-sm"><span className="text-yellow-600">Reservados</span><span className="font-bold text-yellow-700">{ticketStats.reserved}</span></div>
                                    <div className="flex justify-between text-sm"><span className="text-primary">Disponibles</span><span className="font-bold text-primary">{ticketStats.available}</span></div>
                                    <div className="mt-2 w-full bg-muted rounded-full h-2">
                                        <div className={`${occupancyColors.bar} h-2 rounded-full transition-all`} style={{ width: `${occupancyPercent}%` }} />
                                    </div>
                                    <div className="flex justify-between items-center mt-1">
                                        <span className={`text-[10px] font-semibold ${occupancyColors.text}`}>{occupancyColors.label}</span>
                                        <span className="text-[10px] text-muted-foreground">{Math.round(occupancyPercent)}%</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
