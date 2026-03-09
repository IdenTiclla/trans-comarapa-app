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
    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
                <div className="flex-1 space-y-4">
                    {/* Status + ID */}
                    <div className="flex items-center gap-3">
                        <span className={`px-3 py-1 text-xs font-semibold rounded-full ${STATUS_BADGE[trip.status] || 'bg-gray-100 text-gray-800'}`}>{STATUS_MAP[trip.status] || trip.status}</span>
                        <span className="text-lg font-bold text-gray-900">Viaje #{trip.id}</span>
                    </div>

                    {/* Info grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                        <div><p className="text-gray-500 text-xs">Fecha</p><p className="font-semibold text-gray-900">{formatDate(trip.trip_datetime)}</p></div>
                        <div><p className="text-gray-500 text-xs">Hora</p><p className="font-semibold text-gray-900">{trip.departure_time ? formatTimeAmPm(trip.departure_time) : 'N/A'}</p></div>
                        <div><p className="text-gray-500 text-xs">Bus</p><p className="font-semibold text-gray-900">{trip.bus?.license_plate || 'N/A'}</p></div>
                        <div><p className="text-gray-500 text-xs">Precio</p><p className="font-semibold text-gray-900">Bs. {trip.route?.price || trip.price || 'N/A'}</p></div>
                    </div>

                    {/* Staff editor */}
                    <TripStaffEditor
                        drivers={drivers}
                        assistants={assistants}
                        trip={trip}
                        staff={staff}
                    />
                </div>

                {/* Ticket Stats */}
                <div className="lg:w-64 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-4 border border-indigo-200">
                    <h4 className="text-sm font-bold text-gray-900 mb-3">Ocupación</h4>
                    <div className="space-y-2">
                        <div className="flex justify-between text-sm"><span className="text-gray-600">Total asientos</span><span className="font-bold">{ticketStats.total}</span></div>
                        <div className="flex justify-between text-sm"><span className="text-green-600">Vendidos</span><span className="font-bold text-green-700">{ticketStats.sold}</span></div>
                        <div className="flex justify-between text-sm"><span className="text-yellow-600">Reservados</span><span className="font-bold text-yellow-700">{ticketStats.reserved}</span></div>
                        <div className="flex justify-between text-sm"><span className="text-blue-600">Disponibles</span><span className="font-bold text-blue-700">{ticketStats.available}</span></div>
                        <div className="mt-3 w-full bg-gray-200 rounded-full h-2.5">
                            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 h-2.5 rounded-full transition-all" style={{ width: `${ticketStats.total > 0 ? ((ticketStats.sold + ticketStats.reserved) / ticketStats.total) * 100 : 0}%` }} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
