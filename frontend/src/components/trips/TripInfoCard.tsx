import { TripStaffEditor } from './TripStaffEditor'

import { Clock, Bus, Banknote, CalendarDays, ArrowRight, Gauge } from 'lucide-react'
import { LOCALE } from '@/lib/locale-config'
import type { Assistant, Driver, Trip } from '@/types'

const STATUS_MAP: Record<string, string> = {
    scheduled: 'Programado',
    boarding: 'Abordando',
    departed: 'Despachado',
    in_progress: 'En Progreso',
    arrived: 'Llegó',
    completed: 'Completado',
    cancelled: 'Cancelado',
}

const STATUS_BADGE: Record<string, { bg: string; text: string; dot: string }> = {
    scheduled: { bg: 'bg-primary/10', text: 'text-primary', dot: 'bg-primary' },
    boarding: { bg: 'bg-chart-4/20', text: 'text-chart-4', dot: 'bg-chart-4' },
    departed: { bg: 'bg-status-medium/15', text: 'text-status-medium', dot: 'bg-status-medium' },
    in_progress: { bg: 'bg-status-medium/15', text: 'text-status-medium', dot: 'bg-status-medium' },
    arrived: { bg: 'bg-status-available/15', text: 'text-status-available', dot: 'bg-status-available' },
    completed: { bg: 'bg-status-available/15', text: 'text-status-available', dot: 'bg-status-available' },
    cancelled: { bg: 'bg-destructive/15', text: 'text-destructive', dot: 'bg-destructive' },
}

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

function formatFullDate(dateString?: string) {
    if (!dateString) return ''
    // Parse as local date to avoid timezone offset issues
    const [datePart] = dateString.split('T')
    const [y, m, d] = datePart.split('-').map(Number)
    const date = new Date(y, m - 1, d)
    if (isNaN(date.getTime())) return ''
    const weekday = new Intl.DateTimeFormat(LOCALE, { weekday: 'long' }).format(date)
    const day = String(d).padStart(2, '0')
    const month = String(m).padStart(2, '0')
    const year = String(y).slice(2)
    return `${weekday.charAt(0).toUpperCase() + weekday.slice(1)}, ${day}/${month}/${year}`
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

interface Person { id: number; firstname?: string; lastname?: string; [k: string]: unknown }
type RoutePoint = string | { name?: string } | null | undefined
interface TripInfo {
    id: number
    status?: string
    trip_datetime?: string
    departure_time?: string
    departure_date?: string
    price?: number | string
    route?: {
        origin?: RoutePoint
        destination?: RoutePoint
        price?: number | string
        [k: string]: unknown
    }
    bus?: {
        license_plate?: string
        floors?: number
        [k: string]: unknown
    }
    driver?: Person | null
    assistant?: Person | null
    [k: string]: unknown
}

interface Props {
    trip: TripInfo
    ticketStats: TicketStats
    drivers: Person[]
    assistants: Person[]
    staff: StaffState
    actions?: React.ReactNode
}

// ── Small info cell used in the data grid ────────────────────────────────────
function InfoCell({ icon, label, value }: { icon: React.ReactNode; label: string; value: React.ReactNode }) {
    return (
        <div className="flex items-center gap-2.5 min-w-0">
            <div className="flex-shrink-0 text-muted-foreground">{icon}</div>
            <div className="min-w-0">
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider leading-tight">{label}</p>
                <p className="text-sm font-bold text-foreground truncate leading-tight mt-0.5">{value}</p>
            </div>
        </div>
    )
}

function formatRoutePoint(point: RoutePoint) {
    if (typeof point === 'string') return point
    if (point?.name) return point.name
    return 'N/D'
}

export function TripInfoCard({ trip, ticketStats, drivers, assistants, staff, actions }: Props) {
    const occupancyPercent = ticketStats.total > 0
        ? ((ticketStats.sold + ticketStats.reserved) / ticketStats.total) * 100
        : 0

    const status = trip.status ?? ''
    const statusStyle = STATUS_BADGE[status] ?? { bg: 'bg-muted', text: 'text-muted-foreground', dot: 'bg-muted-foreground' }
    const statusLabel = STATUS_MAP[status] ?? status
    const origin = formatRoutePoint(trip.route?.origin)
    const destination = formatRoutePoint(trip.route?.destination)
    const departureTime = trip.departure_time ?? ''
    const tripForStaff = trip as unknown as Trip
    const driverOptions = drivers as unknown as Driver[]
    const assistantOptions = assistants as unknown as Assistant[]

    return (
        <section className="overflow-hidden rounded-xl border border-border bg-card shadow-sm" aria-label="Resumen del viaje">
            {/* Header */}
            <div className="border-b border-border bg-muted/20 px-4 py-4">
                <div className="mb-3 flex items-start justify-between gap-3">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${statusStyle.bg} ${statusStyle.text}`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${statusStyle.dot}`} />
                        {statusLabel}
                    </span>
                    <span className="rounded-md border border-border bg-card px-2 py-0.5 text-[11px] font-semibold text-muted-foreground">#{trip.id}</span>
                </div>
                <div className="space-y-3">
                    <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
                        <div className="min-w-0">
                            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Origen</p>
                            <h2 className="truncate text-xl font-extrabold leading-tight text-foreground">{origin}</h2>
                        </div>
                        <div className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card text-muted-foreground">
                            <ArrowRight className="h-4 w-4" aria-hidden="true" />
                        </div>
                        <div className="min-w-0 text-right">
                            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Destino</p>
                            <h2 className="truncate text-xl font-extrabold leading-tight text-foreground">{destination}</h2>
                        </div>
                    </div>
                    <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs font-medium text-muted-foreground">
                        <CalendarDays className="h-3.5 w-3.5" aria-hidden="true" />
                        {formatFullDate(trip.trip_datetime)}
                        {departureTime && (
                            <>
                                <span aria-hidden="true">·</span>
                                <Clock className="h-3.5 w-3.5" aria-hidden="true" />
                                {formatTimeAmPm(departureTime)}
                            </>
                        )}
                    </p>
                </div>
            </div>

            {/* Actions */}
            {actions && (
                <div className="grid gap-2 border-b border-border px-4 py-3 [&>*]:w-full [&_a]:w-full">
                    {actions}
                </div>
            )}

            {/* Data list */}
            <div className="grid grid-cols-1 gap-3 border-b border-border px-4 py-3 sm:grid-cols-3 xl:grid-cols-1">
                <InfoCell
                    icon={<Bus className="h-4 w-4" />}
                    label="Bus"
                    value={`${trip.bus?.license_plate ?? 'N/A'} · ${trip.bus?.floors ?? 1} piso${(trip.bus?.floors ?? 1) > 1 ? 's' : ''}`}
                />
                <InfoCell
                    icon={<Banknote className="h-4 w-4" />}
                    label="Precio"
                    value={`Bs. ${trip.route?.price ?? trip.price ?? 'N/A'}`}
                />
                <InfoCell
                    icon={<Clock className="h-4 w-4" />}
                    label="Salida"
                    value={departureTime ? formatTimeAmPm(departureTime) : 'N/A'}
                />
            </div>

            {/* Staff */}
            <div className="border-b border-border px-4 py-3">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2.5">Personal</p>
                <TripStaffEditor
                    drivers={driverOptions}
                    assistants={assistantOptions}
                    trip={tripForStaff}
                    staff={staff}
                    compact
                />
            </div>

            {/* Seat stats */}
            <div className="px-4 py-3">
                <div className="mb-2.5 flex items-center justify-between gap-3">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Asientos</p>
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-muted-foreground">
                        <Gauge className="h-3.5 w-3.5" aria-hidden="true" />
                        {Math.round(occupancyPercent)}% ocupado
                    </span>
                </div>
                <div className="grid grid-cols-2 gap-x-4 gap-y-3 sm:grid-cols-4 xl:grid-cols-2">
                    <div className="flex flex-col">
                        <span className="text-lg font-extrabold text-foreground leading-none">{ticketStats.total}</span>
                        <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">Total</span>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-lg font-extrabold text-status-full leading-none">{ticketStats.sold}</span>
                        <span className="text-[10px] text-status-full font-semibold uppercase tracking-wider">Ocupados</span>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-lg font-extrabold text-status-medium leading-none">{ticketStats.reserved}</span>
                        <span className="text-[10px] text-status-medium font-semibold uppercase tracking-wider">Reservados</span>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-lg font-extrabold text-primary leading-none">{ticketStats.available}</span>
                        <span className="text-[10px] text-primary font-semibold uppercase tracking-wider">Disponibles</span>
                    </div>
                </div>
                <div
                    role="progressbar"
                    aria-valuenow={Math.round(occupancyPercent)}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-label="Ocupación del viaje"
                    className="mt-3 w-full bg-muted rounded-full h-1.5"
                >
                    <div
                        className="h-1.5 rounded-full transition-all bg-status-available"
                        style={{ width: `${Math.min(occupancyPercent, 100)}%` }}
                    />
                </div>
                <p className="sr-only">{Math.round(occupancyPercent)}% ocupado</p>
            </div>
        </section>
    )
}
