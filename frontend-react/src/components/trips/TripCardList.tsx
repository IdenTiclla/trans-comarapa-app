import { useNavigate } from 'react-router'
import { EmptyState } from '@/components/common'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { CalendarClock, Plus, Settings, User } from 'lucide-react'

interface SlotRoute {
    id: number
    origin: string
    destination: string
    price?: number
}

interface Slot {
    time: string
    trip: Record<string, unknown> | null
    route: SlotRoute
    schedule?: Record<string, unknown>
}

interface RouteGroup {
    route: SlotRoute
    slots: Slot[]
}

interface TripCardListProps {
    scheduleBoard: RouteGroup[]
    loading?: boolean
    selectedDate?: string
    onViewTrip?: (id: number) => void
    onCreateTrip?: (data: { routeId: number; date: string; time: string }) => void
    onSellTicket?: (tripId: number) => void
}

function getOccupancyInfo(trip: Record<string, unknown>) {
    const total = (trip.total_seats as number) ?? 0
    const available = (trip.available_seats as number) ?? 0
    const occupied = Math.max(0, total - available)
    const pct = total > 0 ? occupied / total : 0

    if (available === 0 && total > 0) return { occupied, total, label: 'Agotado', color: 'text-red-600' }
    if (pct >= 0.8) return { occupied, total, label: 'Lleno', color: 'text-red-500' }
    if (pct >= 0.5) return { occupied, total, label: 'Medio', color: 'text-yellow-600' }
    if (pct >= 0.25) return { occupied, total, label: 'Bajo', color: 'text-blue-600' }
    return { occupied, total, label: 'Disponible', color: 'text-green-600' }
}

function getDriverName(trip: Record<string, unknown>): string {
    const driver = trip.driver as { name?: string; firstname?: string; lastname?: string } | undefined
    if (!driver) return 'No asignado'
    if (driver.firstname) return `${driver.firstname} ${driver.lastname ?? ''}`.trim()
    if (driver.name) return driver.name
    return 'No asignado'
}

function getBusInfo(trip: Record<string, unknown>): { plate: string; floors: number } {
    const bus = trip.bus as { license_plate?: string; floors?: number } | undefined
    return {
        plate: bus?.license_plate || 'N/A',
        floors: bus?.floors ?? 1,
    }
}

function TripRow({
    slot,
    onViewTrip,
    onSellTicket,
    onCreateTrip,
    selectedDate,
    isPastDate,
    isSlotPast,
}: {
    slot: Slot
    onViewTrip?: (id: number) => void
    onSellTicket?: (tripId: number) => void
    onCreateTrip?: (data: { routeId: number; date: string; time: string }) => void
    selectedDate: string
    isPastDate: boolean
    isSlotPast: boolean
}) {
    const trip = slot.trip
    const isPast = isPastDate || isSlotPast
    const occ = trip ? getOccupancyInfo(trip) : { occupied: 0, total: 0, label: '--', color: 'text-muted-foreground/30' }
    const driverName = trip ? getDriverName(trip) : 'Sin viaje creado'
    const busInfo = trip ? getBusInfo(trip) : { plate: '--', floors: 0 }
    const tripId = trip ? (trip.id as number) : null
    const isSoldOut = trip ? occ.label === 'Agotado' : false
    const floorLabel = busInfo.floors >= 2 ? '2 Pisos' : busInfo.floors === 1 ? '1 Piso' : null

    const containerClasses = trip
        ? "border border-border rounded-lg px-4 py-3 hover:shadow-md transition-shadow bg-card"
        : isPast
        ? "border border-dashed border-muted rounded-lg px-4 py-3 bg-muted/20 opacity-60 cursor-not-allowed"
        : "border-2 border-dashed border-blue-200 rounded-lg px-4 py-3 hover:border-blue-400 hover:bg-blue-50/30 transition-all cursor-pointer group"

    const timeClasses = trip
        ? "text-2xl font-bold text-[#1a365d]"
        : "text-2xl font-bold text-muted-foreground/30"

    const dividerClasses = trip ? "bg-border" : isPast ? "bg-muted" : "bg-blue-100"

    return (
        <div 
            className={containerClasses}
            onClick={() => !trip && !isPast && onCreateTrip?.({ routeId: slot.route.id, date: selectedDate, time: slot.time })}
        >
            {/* Top row: Content Alignment */}
            <div className="flex items-center h-10">
                <span className={`flex-shrink-0 min-w-[5rem] ${timeClasses}`}>{slot.time}</span>
                
                <div className={`h-8 w-px mx-3 flex-shrink-0 ${dividerClasses}`} />
                
                <div className="flex-1 flex items-center justify-between">
                    {/* Bus Info */}
                    <div className="flex items-center gap-3">
                        <div className={!trip ? "opacity-40" : ""}>
                            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Bus No.</p>
                            <p className="text-sm font-bold text-foreground leading-tight">{busInfo.plate}</p>
                        </div>
                        {floorLabel && (
                            <Badge variant="outline" className="text-[9px] h-4 px-1.5 font-medium whitespace-nowrap">
                                {floorLabel}
                            </Badge>
                        )}
                    </div>

                    {/* Occupancy Info */}
                    <div className={`text-right ${!trip ? "opacity-30" : ""}`}>
                        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Ocupación</p>
                        <p className="text-sm font-bold leading-tight">
                            {trip ? (
                                <>
                                    <span className={occ.color}>{String(occ.occupied).padStart(2, '0')}/{occ.total}</span>
                                    <span className={`ml-1.5 text-[10px] uppercase ${occ.color}`}>{occ.label}</span>
                                </>
                            ) : (
                                <span className="text-muted-foreground">--/--</span>
                            )}
                        </p>
                    </div>
                </div>

                <div className={`h-8 w-px mx-3 flex-shrink-0 ${dividerClasses}`} />

                {/* Actions */}
                <div className="flex items-center justify-end min-w-[90px] flex-shrink-0">
                    {!trip ? (
                        isPast ? (
                            <span className="text-[10px] italic text-muted-foreground/40 leading-tight text-right">
                                Horario<br/>pasado
                            </span>
                        ) : (
                            <Button 
                                variant="outline" 
                                size="sm" 
                                className="gap-1 text-[11px] font-bold h-8 text-blue-700 border-blue-200 hover:bg-blue-50 w-full"
                            >
                                <Plus className="h-3 w-3" />
                                Crear
                            </Button>
                        )
                    ) : (
                        isPastDate ? (
                            <Button
                                variant="outline"
                                size="sm"
                                className="text-[11px] font-bold text-[#1a365d] h-8 w-full border-[#1a365d]/20 hover:bg-[#1a365d]/5"
                                onClick={(e) => { e.stopPropagation(); onViewTrip?.(tripId!) }}
                            >
                                Ver
                            </Button>
                        ) : (
                            <Button
                                variant={isSoldOut ? 'outline' : 'default'}
                                size="sm"
                                disabled={isSoldOut}
                                className={`text-[11px] font-bold uppercase h-8 w-full ${
                                    isSoldOut ? '' : 'bg-[#1a365d] hover:bg-[#2a4a7f]'
                                }`}
                                onClick={(e) => { e.stopPropagation(); onSellTicket?.(tripId!) }}
                            >
                                {isSoldOut ? 'Lleno' : 'Vender'}
                            </Button>
                        )
                    )}
                </div>
            </div>

            {/* Bottom row: Meta Info */}
            <div className={`flex items-center gap-1.5 mt-2 pt-2 border-t text-xs ${
                trip ? "border-border/50 text-muted-foreground" : "border-blue-100/30 text-muted-foreground/30"
            }`}>
                <User className="h-3 w-3 opacity-70" />
                <span className="flex-1">
                    {trip ? "Chofer: " : ""}
                    <span className={`${trip ? "text-foreground font-medium" : "italic"}`}>
                        {driverName}
                    </span>
                </span>
                {trip && (
                    <div className="flex items-center gap-1.5 opacity-50">
                        <CalendarClock className="h-3 w-3" />
                        <span className="text-[10px]">ID: {tripId}</span>
                    </div>
                )}
            </div>
        </div>
    )
}

export default function TripCardList({
    scheduleBoard = [],
    loading = false,
    selectedDate = '',
    onViewTrip,
    onCreateTrip,
    onSellTicket,
}: TripCardListProps) {
    const navigate = useNavigate()

    if (loading) {
        return (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {[1, 2].map((n) => (
                    <div key={n} className="space-y-2">
                        <div className="h-6 bg-muted rounded w-2/3 animate-pulse" />
                        <div className="h-3 bg-muted/60 rounded w-1/3 animate-pulse" />
                        {[1, 2, 3].map((m) => (
                            <div key={m} className="h-20 bg-muted/40 rounded-lg animate-pulse" />
                        ))}
                    </div>
                ))}
            </div>
        )
    }

    const now = new Date()
    const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
    const isPastDate = selectedDate < todayStr
    const isToday = selectedDate === todayStr
    // Current time as "HH:MM" in local timezone for slot-level comparison
    const currentTimeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`

    if (!scheduleBoard || scheduleBoard.length === 0) {
        return (
            <EmptyState
                title="No hay horarios configurados"
                description="No se encontraron rutas con horarios activos. Configure horarios desde la administración de rutas."
                icon={<CalendarClock className="h-10 w-10 text-muted-foreground" />}
                action={
                    <Button onClick={() => navigate('/admin/routes')} className="gap-2">
                        <Settings className="h-4 w-4" />
                        Configurar Rutas
                    </Button>
                }
            />
        )
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {scheduleBoard.map((group) => (
                <div key={group.route.id} className="space-y-2">
                    {/* Route Header */}
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-base font-bold text-foreground">
                                {group.route.origin} <span className="text-muted-foreground mx-1">→</span> {group.route.destination}
                            </h2>
                            <p className="text-xs text-muted-foreground">Salidas desde {group.route.origin}</p>
                        </div>
                        <Badge variant="outline" className="text-[10px] font-semibold uppercase tracking-wider border-[#1a365d] text-[#1a365d]">
                            {group.slots.length} Horarios
                        </Badge>
                    </div>

                    {/* Trip Rows */}
                    <div className="space-y-2">
                        {group.slots.map((slot) => (
                            <TripRow
                                key={`${group.route.id}-${slot.time}`}
                                slot={slot}
                                onViewTrip={onViewTrip}
                                onSellTicket={onSellTicket}
                                onCreateTrip={onCreateTrip}
                                selectedDate={selectedDate}
                                isPastDate={isPastDate}
                                isSlotPast={isToday && slot.time < currentTimeStr}
                            />
                        ))}
                    </div>
                </div>
            ))}
        </div>
    )
}
