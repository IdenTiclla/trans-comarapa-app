import { TripStaffEditor } from './TripStaffEditor'

import { MapPin, Clock, Bus, Banknote, Layers, Hash, CalendarDays } from 'lucide-react'
import { LOCALE } from '@/lib/locale-config'

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
interface TripInfo { id: number; [k: string]: unknown }

interface Props {
    trip: TripInfo
    ticketStats: TicketStats
    formatDate: (dateString: string) => string
    drivers: Person[]
    assistants: Person[]
    staff: StaffState
    actions?: React.ReactNode
    variant?: 'full' | 'sidebar'
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

export function TripInfoCard({ trip, ticketStats, drivers, assistants, staff, actions, variant = 'full' }: Props) {
    const occupancyPercent = ticketStats.total > 0
        ? ((ticketStats.sold + ticketStats.reserved) / ticketStats.total) * 100
        : 0

    const statusStyle = STATUS_BADGE[trip.status] ?? { bg: 'bg-muted', text: 'text-muted-foreground', dot: 'bg-muted-foreground' }
    const statusLabel = STATUS_MAP[trip.status] ?? trip.status

    if (variant === 'sidebar') {
        return (
            <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
                {/* Header */}
                <div className="px-4 pt-4 pb-3 border-b border-border/60">
                    <div className="flex items-start justify-between gap-2 mb-2">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${statusStyle.bg} ${statusStyle.text}`}>
                            <span className={`h-1.5 w-1.5 rounded-full ${statusStyle.dot}`} />
                            {statusLabel}
                        </span>
                        <span className="text-[11px] font-mono text-muted-foreground">#{trip.id}</span>
                    </div>
                    <h2 className="text-lg font-extrabold text-foreground tracking-tight leading-tight">
                        {trip.route?.origin ?? 'N/D'}
                        <span className="mx-1.5 text-muted-foreground font-normal">→</span>
                        {trip.route?.destination ?? 'N/D'}
                    </h2>
                    <p className="text-xs text-muted-foreground mt-1 font-medium">
                        {formatFullDate(trip.trip_datetime)}
                        {trip.departure_time && ` · ${formatTimeAmPm(trip.departure_time)}`}
                    </p>
                </div>

                {/* Actions */}
                {actions && (
                    <div className="px-4 py-3 border-b border-border/60 flex flex-col gap-2 [&>*]:w-full [&_a]:w-full">
                        {actions}
                    </div>
                )}

                {/* Data list */}
                <div className="px-4 py-3 border-b border-border/60 space-y-3">
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
                        value={trip.departure_time ? formatTimeAmPm(trip.departure_time) : 'N/A'}
                    />
                </div>

                {/* Staff */}
                <div className="px-4 py-3 border-b border-border/60">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2.5">Personal</p>
                    <TripStaffEditor
                        drivers={drivers}
                        assistants={assistants}
                        trip={trip}
                        staff={staff}
                        compact
                    />
                </div>

                {/* Seat stats */}
                <div className="px-4 py-3">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2.5">Asientos</p>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-2">
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
                    <p className="text-[10px] text-muted-foreground mt-1 text-right">{Math.round(occupancyPercent)}% ocupado</p>
                </div>
            </div>
        )
    }

    return (
        <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">

            {/* ── Row 1: Title + time ─────────────────────────────────── */}
            <div className="px-5 pt-5 pb-3 border-b border-border/60">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                    <div>
                        <h2 className="text-2xl font-extrabold text-foreground tracking-tight">
                            {trip.route?.origin ?? 'N/D'}
                            <span className="mx-2 text-muted-foreground font-normal">→</span>
                            {trip.route?.destination ?? 'N/D'}
                        </h2>
                        <p className="text-sm text-muted-foreground mt-0.5 font-medium">
                            {trip.departure_time ? formatTimeAmPm(trip.departure_time) : ''}
                        </p>
                    </div>

                    {/* Status pill + action buttons */}
                    <div className="flex flex-wrap items-center gap-2 flex-shrink-0">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${statusStyle.bg} ${statusStyle.text}`}>
                            <span className={`h-1.5 w-1.5 rounded-full ${statusStyle.dot}`} />
                            {statusLabel}
                        </span>
                        {actions}
                    </div>
                </div>
            </div>

            {/* ── Row 2: Main data grid + Occupancy box ───────────────── */}
            <div className="px-5 py-4 border-b border-border/60">
                <div className="flex flex-col lg:flex-row lg:items-start gap-4">

                    {/* Left: data cells grid */}
                    <div className="flex-1 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-x-6 gap-y-4">
                        <InfoCell
                            icon={<Hash className="h-4 w-4" />}
                            label="Viaje"
                            value={`#${trip.id}`}
                        />
                        <InfoCell
                            icon={<MapPin className="h-4 w-4" />}
                            label="Origen"
                            value={trip.route?.origin ?? 'N/D'}
                        />
                        <InfoCell
                            icon={<MapPin className="h-4 w-4" />}
                            label="Destino"
                            value={trip.route?.destination ?? 'N/D'}
                        />
                        <InfoCell
                            icon={<CalendarDays className="h-4 w-4" />}
                            label="Fecha"
                            value={formatFullDate(trip.trip_datetime)}
                        />
                        <InfoCell
                            icon={<Clock className="h-4 w-4" />}
                            label="Hora"
                            value={trip.departure_time ? formatTimeAmPm(trip.departure_time) : 'N/A'}
                        />
                        <InfoCell
                            icon={<Bus className="h-4 w-4" />}
                            label="Bus"
                            value={trip.bus?.license_plate ?? 'N/A'}
                        />
                        <InfoCell
                            icon={<Banknote className="h-4 w-4" />}
                            label="Precio"
                            value={`Bs. ${trip.route?.price ?? trip.price ?? 'N/A'}`}
                        />
                        <InfoCell
                            icon={<Layers className="h-4 w-4" />}
                            label="Pisos"
                            value={trip.bus?.floors ?? 1}
                        />
                    </div>

                    {/* Right: Occupancy card */}
                    <div className="lg:w-52 flex-shrink-0">
                        <div className="border border-border rounded-xl p-3.5 bg-muted/30">
                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2.5">Ocupación</p>
                            <div className="space-y-1.5">
                                <div className="flex justify-between items-center">
                                    <span className="text-xs text-muted-foreground">Total</span>
                                    <span className="text-sm font-extrabold text-foreground">{ticketStats.total}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-xs text-status-available font-medium">Vendidos</span>
                                    <span className="text-sm font-extrabold text-status-available">{ticketStats.sold}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-xs text-status-medium font-medium">Reservados</span>
                                    <span className="text-sm font-bold text-status-medium">{ticketStats.reserved}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-xs text-primary font-medium">Disponibles</span>
                                    <span className="text-sm font-bold text-primary">{ticketStats.available}</span>
                                </div>
                            </div>
                            {/* Occupancy bar */}
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
                            <p className="text-[10px] text-muted-foreground mt-1 text-right">{Math.round(occupancyPercent)}% ocupado</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Row 3: Staff ────────────────────────────────────────── */}
            <div className="px-5 py-4">
                <TripStaffEditor
                    drivers={drivers}
                    assistants={assistants}
                    trip={trip}
                    staff={staff}
                />
            </div>
        </div>
    )
}
