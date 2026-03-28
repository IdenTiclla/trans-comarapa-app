import { TripStaffEditor } from './TripStaffEditor'

const STATUS_MAP: Record<string, string> = { scheduled: 'Programado', boarding: 'Abordando', departed: 'Despachado', in_progress: 'En Progreso', arrived: 'Llegó', completed: 'Completado', cancelled: 'Cancelado' }
const STATUS_BADGE: Record<string, string> = { scheduled: 'bg-blue-100 text-blue-800', boarding: 'bg-purple-100 text-purple-800', departed: 'bg-orange-100 text-orange-800', in_progress: 'bg-orange-100 text-orange-800', arrived: 'bg-green-100 text-green-800', completed: 'bg-green-100 text-green-800', cancelled: 'bg-red-100 text-red-800' }

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

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            {/* Header with route and branding */}
            <div className="bg-gradient-to-br from-slate-50 via-white to-blue-50 p-4 border-b border-gray-100">
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                        <div className="bg-gradient-to-br from-indigo-100 to-blue-100 p-2 rounded-xl shadow-sm">
                            <svg className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l-5.447-2.724A1 1 0 0 1 3 16.382V5.618a1 1 0 0 1 .553-.894L9 2l6 3 6-3v13l-6 3-6-3z" />
                            </svg>
                        </div>
                        <div>
                            <h2 className="text-sm font-black tracking-tight bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">TRANS COMARAPA</h2>
                            <p className="text-[10px] text-gray-500 font-medium">Viaje #{trip.id}</p>
                        </div>
                    </div>
                    <span className={`px-3 py-1 text-xs font-semibold rounded-full ${STATUS_BADGE[trip.status] || 'bg-gray-100 text-gray-800'}`}>
                        {STATUS_MAP[trip.status] || trip.status}
                    </span>
                </div>

                {/* Route + Date/Time gradient cards */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
                    <div className="bg-gradient-to-r from-emerald-500 to-teal-600 px-3 py-2 text-center rounded-lg shadow-sm">
                        <span className="text-[10px] font-semibold text-white/80 block">ORIGEN</span>
                        <p className="text-sm font-bold text-white truncate">{trip.route?.origin || 'N/D'}</p>
                    </div>
                    <div className="bg-gradient-to-r from-blue-500 to-indigo-600 px-3 py-2 text-center rounded-lg shadow-sm">
                        <span className="text-[10px] font-semibold text-white/80 block">DESTINO</span>
                        <p className="text-sm font-bold text-white truncate">{trip.route?.destination || 'N/D'}</p>
                    </div>
                    <div className="bg-gradient-to-b from-purple-500 to-purple-600 px-3 py-2 text-center rounded-lg shadow-sm">
                        <span className="text-[10px] font-semibold text-white/80 block">DÍA</span>
                        <p className="text-sm font-bold text-white capitalize">{getDayName(trip.trip_datetime)}</p>
                    </div>
                    <div className="bg-gradient-to-b from-pink-500 to-rose-600 px-3 py-2 text-center rounded-lg shadow-sm">
                        <span className="text-[10px] font-semibold text-white/80 block">FECHA</span>
                        <p className="text-sm font-bold text-white">{formatShortDate(trip.trip_datetime)}</p>
                    </div>
                    <div className="bg-gradient-to-b from-orange-500 to-red-600 px-3 py-2 text-center rounded-lg shadow-sm col-span-2 sm:col-span-1">
                        <span className="text-[10px] font-semibold text-white/80 block">HORA</span>
                        <p className="text-sm font-bold text-white">{trip.departure_time ? formatTimeAmPm(trip.departure_time) : 'N/A'}</p>
                    </div>
                </div>
            </div>

            {/* Body: Bus info + Staff + Stats */}
            <div className="p-4">
                <div className="flex flex-col lg:flex-row lg:items-start gap-4">
                    {/* Left: Bus details + Staff */}
                    <div className="flex-1 space-y-4">
                        {/* Bus + Owner info */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                            <div className="bg-gray-50 rounded-lg p-2.5 border border-gray-100">
                                <p className="text-[10px] text-gray-400 font-medium uppercase">Bus</p>
                                <p className="font-semibold text-gray-900">{trip.bus?.license_plate || 'N/A'}</p>
                                {trip.bus?.brand && <p className="text-xs text-gray-500">{trip.bus.brand} {trip.bus.model || ''}</p>}
                            </div>
                            <div className="bg-gray-50 rounded-lg p-2.5 border border-gray-100">
                                <p className="text-[10px] text-gray-400 font-medium uppercase">Precio</p>
                                <p className="font-semibold text-gray-900">Bs. {trip.route?.price ?? trip.price ?? 'N/A'}</p>
                            </div>
                            <div className="bg-gray-50 rounded-lg p-2.5 border border-gray-100">
                                <p className="text-[10px] text-gray-400 font-medium uppercase">Pisos</p>
                                <p className="font-semibold text-gray-900">{trip.bus?.floors || 1}</p>
                            </div>
                            <div className="bg-gray-50 rounded-lg p-2.5 border border-gray-100">
                                <p className="text-[10px] text-gray-400 font-medium uppercase">Dueño</p>
                                <p className="font-semibold text-gray-900">
                                    {trip.bus?.owner
                                        ? `${trip.bus.owner.firstname} ${trip.bus.owner.lastname}`
                                        : 'Sin asignar'}
                                </p>
                            </div>
                        </div>

                        {/* Staff editor */}
                        <TripStaffEditor
                            drivers={drivers}
                            assistants={assistants}
                            trip={trip}
                            staff={staff}
                        />
                    </div>

                    {/* Right: Ticket stats */}
                    <div className="lg:w-56 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-4 border border-indigo-200">
                        <h4 className="text-xs font-bold text-gray-700 mb-2 uppercase tracking-wide">Ocupación</h4>
                        <div className="space-y-1.5">
                            <div className="flex justify-between text-sm"><span className="text-gray-600">Total</span><span className="font-bold">{ticketStats.total}</span></div>
                            <div className="flex justify-between text-sm"><span className="text-green-600">Vendidos</span><span className="font-bold text-green-700">{ticketStats.sold}</span></div>
                            <div className="flex justify-between text-sm"><span className="text-yellow-600">Reservados</span><span className="font-bold text-yellow-700">{ticketStats.reserved}</span></div>
                            <div className="flex justify-between text-sm"><span className="text-blue-600">Disponibles</span><span className="font-bold text-blue-700">{ticketStats.available}</span></div>
                            <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                                <div className="bg-gradient-to-r from-indigo-500 to-purple-600 h-2 rounded-full transition-all" style={{ width: `${occupancyPercent}%` }} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
