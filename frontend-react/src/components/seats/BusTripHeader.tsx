import FormSelect from '@/components/forms/FormSelect'

interface BusTripHeaderProps {
    trip: any
    occupiedSeatsCount?: number
    reservedSeatsCount?: number
    availableSeatsCount?: number
    totalSeatsCount?: number | null
    editable?: boolean
    drivers?: any[]
    assistants?: any[]
    editingDriver?: boolean
    editingAssistant?: boolean
    selectedDriverId?: number | null
    selectedAssistantId?: number | null
    savingDriver?: boolean
    savingAssistant?: boolean
    isDoubleDeck?: boolean

    onStartEditDriver: () => void
    onSaveDriver: () => void
    onCancelEditDriver: () => void
    onUpdateSelectedDriverId: (id: number | null) => void
    onStartEditAssistant: () => void
    onSaveAssistant: () => void
    onCancelEditAssistant: () => void
    onUpdateSelectedAssistantId: (id: number | null) => void
}

export default function BusTripHeader({
    trip,
    occupiedSeatsCount = 0,
    reservedSeatsCount = 0,
    availableSeatsCount = 0,
    totalSeatsCount = null,
    editable = false,
    drivers = [],
    assistants = [],
    editingDriver = false,
    editingAssistant = false,
    selectedDriverId = null,
    selectedAssistantId = null,
    savingDriver = false,
    savingAssistant = false,
    isDoubleDeck = false,
    onStartEditDriver,
    onSaveDriver,
    onCancelEditDriver,
    onUpdateSelectedDriverId,
    onStartEditAssistant,
    onSaveAssistant,
    onCancelEditAssistant,
    onUpdateSelectedAssistantId
}: BusTripHeaderProps) {

    const getDayName = (dateString?: string) => {
        if (!dateString) return 'Día no disponible'
        const date = new Date(dateString)
        if (isNaN(date.getTime())) return 'Fecha inválida'
        return new Intl.DateTimeFormat('es-ES', { weekday: 'long' }).format(date)
    }

    const formatShortDate = (dateString?: string) => {
        if (!dateString) return 'Fecha no disponible'
        const date = new Date(dateString)
        if (isNaN(date.getTime())) return 'Fecha inválida'
        return new Intl.DateTimeFormat('es-ES', { day: '2-digit', month: '2-digit', year: '2-digit' }).format(date)
    }

    const formatTimeWithAmPm = (timeString?: string) => {
        if (!timeString) return 'Hora no especificada'
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

    return (
        <div className="border-b border-gray-200 pb-3 mb-4 bg-gradient-to-br from-slate-50 via-white to-blue-50 p-4 overflow-hidden rounded-t-2xl sm:rounded-none backdrop-blur-md print:bg-none print:border-b-2 print:border-green-800">
            <div className="flex items-center mb-4">
                <div className="mr-3 bg-gradient-to-br from-indigo-100 to-blue-100 p-2 rounded-xl flex-shrink-0 shadow-md">
                    <svg className="h-8 w-8 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l-5.447-2.724A1 1 0 0 1 3 16.382V5.618a1 1 0 0 1 .553-.894L9 2l6 3 6-3v13l-6 3-6-3z" />
                    </svg>
                </div>
                <div>
                    <h2 className="text-base sm:text-lg font-black text-gray-800 tracking-tight bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">TRANS COMARAPA</h2>
                    <p className="text-[10px] sm:text-xs text-gray-600 font-medium leading-tight">SINDICATO MIXTO DE TRANSPORTISTAS "MANUEL MARÍA CABALLERO"</p>
                </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-2 mb-3">
                <div className="bg-gradient-to-r from-emerald-500 to-teal-600 px-3 py-2 text-center rounded-lg shadow-md">
                    <span className="text-xs font-semibold text-white opacity-90 block">ORIGEN</span>
                    <p className="text-sm font-bold text-white truncate">{trip?.route?.origin || 'N/D'}</p>
                </div>
                <div className="bg-gradient-to-r from-blue-500 to-indigo-600 px-3 py-2 text-center rounded-lg shadow-md">
                    <span className="text-xs font-semibold text-white opacity-90 block">DESTINO</span>
                    <p className="text-sm font-bold text-white truncate">{trip?.route?.destination || 'N/D'}</p>
                </div>
                <div className="bg-gradient-to-b from-purple-500 to-purple-600 rounded-lg px-2 py-2 text-center shadow-md">
                    <div className="text-white font-bold text-xs opacity-90">DÍA</div>
                    <div className="text-white font-black text-sm capitalize">{getDayName(trip?.trip_datetime)}</div>
                </div>
                <div className="bg-gradient-to-b from-pink-500 to-rose-600 rounded-lg px-2 py-2 text-center shadow-md">
                    <div className="text-white font-bold text-xs opacity-90">FECHA</div>
                    <div className="text-white font-black text-sm">{formatShortDate(trip?.trip_datetime)}</div>
                </div>
                <div className="bg-gradient-to-b from-orange-500 to-red-600 rounded-lg px-2 py-2 text-center shadow-md">
                    <div className="text-white font-bold text-xs opacity-90">HORA</div>
                    <div className="text-white font-black text-sm">{formatTimeWithAmPm(trip?.departure_time)}</div>
                </div>
            </div>
        </div>
    )
}
