import { TripStaffEditor } from './TripStaffEditor'

import { MapPin, Clock, Bus, Banknote, Layers, Hash, CalendarDays } from 'lucide-react'

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
    scheduled: { bg: 'bg-blue-100', text: 'text-blue-700', dot: 'bg-blue-500' },
    boarding: { bg: 'bg-purple-100', text: 'text-purple-700', dot: 'bg-purple-500' },
    departed: { bg: 'bg-orange-100', text: 'text-orange-700', dot: 'bg-orange-500' },
    in_progress: { bg: 'bg-orange-100', text: 'text-orange-700', dot: 'bg-orange-500' },
    arrived: { bg: 'bg-green-100', text: 'text-green-700', dot: 'bg-green-500' },
    completed: { bg: 'bg-green-100', text: 'text-green-700', dot: 'bg-green-500' },
    cancelled: { bg: 'bg-red-100', text: 'text-red-700', dot: 'bg-red-500' },
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
    const weekday = new Intl.DateTimeFormat('es-ES', { weekday: 'long' }).format(date)
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

interface Props {
    trip: any
    ticketStats: TicketStats
    formatDate: (dateString: string) => string
    drivers: any[]
    assistants: any[]
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

export function TripInfoCard({ trip, ticketStats, formatDate, drivers, assistants, staff, actions }: Props) {
    const occupancyPercent = ticketStats.total > 0
        ? ((ticketStats.sold + ticketStats.reserved) / ticketStats.total) * 100
        : 0

    const statusStyle = STATUS_BADGE[trip.status] ?? { bg: 'bg-muted', text: 'text-muted-foreground', dot: 'bg-muted-foreground' }
    const statusLabel = STATUS_MAP[trip.status] ?? trip.status

    const driverName = trip.driver ? `${trip.driver.firstname} ${trip.driver.lastname}` : 'No asignado'
    const assistantName = trip.assistant ? `${trip.assistant.firstname} ${trip.assistant.lastname}` : 'No asignado'

    return (
        <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">

            {/* ── Row 1: Title + time ─────────────────────────────────── */}
            <div className="px-5 pt-5 pb-3 border-b border-border/60">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                    <div>
                        <h1 className="text-2xl font-extrabold text-foreground tracking-tight">
                            {trip.route?.origin ?? 'N/D'}
                            <span className="mx-2 text-muted-foreground font-normal">→</span>
                            {trip.route?.destination ?? 'N/D'}
                        </h1>
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
                                    <span className="text-xs text-green-600 font-medium">Vendidos</span>
                                    <span className="text-sm font-bold text-green-700">{ticketStats.sold}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-xs text-yellow-600 font-medium">Reservados</span>
                                    <span className="text-sm font-bold text-yellow-700">{ticketStats.reserved}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-xs text-blue-600 font-medium">Disponibles</span>
                                    <span className="text-sm font-bold text-blue-700">{ticketStats.available}</span>
                                </div>
                            </div>
                            {/* Occupancy bar */}
                            <div className="mt-3 w-full bg-muted rounded-full h-1.5">
                                <div
                                    className="h-1.5 rounded-full transition-all bg-green-500"
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
