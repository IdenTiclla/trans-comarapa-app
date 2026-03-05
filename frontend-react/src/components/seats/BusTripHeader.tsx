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

            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-3">
                <div className={`bg-white p-2.5 rounded-lg shadow-sm border transition-all duration-200 ${editingDriver ? 'ring-2 ring-blue-300 border-blue-200' : 'border-gray-100'}`}>
                    <div className="flex items-center">
                        <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full mr-2 flex-shrink-0" />
                        <span className="text-xs text-gray-600 mr-1 flex-shrink-0">Conductor:</span>
                        {!editingDriver ? (
                            <>
                                <span className="text-xs font-bold text-gray-800 truncate flex-1">
                                    {trip?.driver ? `${trip.driver.firstname} ${trip.driver.lastname}` : 'Sin asignar'}
                                </span>
                                {editable && (
                                    <button onClick={onStartEditDriver} className="ml-1 p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-all duration-200 flex-shrink-0" title="Cambiar conductor">
                                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                                    </button>
                                )}
                            </>
                        ) : (
                            <>
                                <div className="flex-1 w-full">
                                    <FormSelect
                                        value={selectedDriverId || ''}
                                        onChange={(value) => onUpdateSelectedDriverId(value ? Number(value) : null)}
                                        options={[
                                            { value: '', label: 'Sin asignar' },
                                            ...drivers.map(driver => ({ value: driver.id, label: `${driver.firstname} ${driver.lastname}` }))
                                        ]}
                                        disabled={savingDriver}
                                    />
                                </div>
                                <div className="flex items-center ml-1 flex-shrink-0">
                                    <button onClick={onSaveDriver} disabled={savingDriver} className="p-1 text-green-600 hover:bg-green-50 rounded-md transition-colors disabled:opacity-50" title="Guardar">
                                        {!savingDriver ? (
                                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                                        ) : (
                                            <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path></svg>
                                        )}
                                    </button>
                                    <button onClick={onCancelEditDriver} disabled={savingDriver} className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors disabled:opacity-50" title="Cancelar">
                                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>

                <div className="bg-white p-2.5 rounded-lg shadow-sm border border-gray-100">
                    <div className="flex items-center justify-center">
                        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-2 flex-shrink-0" />
                        <span className="text-xs text-gray-600 mr-1 flex-shrink-0">Placa:</span>
                        <span className="text-xs font-bold text-gray-800 bg-gray-100 px-1.5 py-0.5 rounded">{trip?.bus?.license_plate || 'N/A'}</span>
                    </div>
                </div>

                <div className={`bg-white p-2.5 rounded-lg shadow-sm border transition-all duration-200 ${editingAssistant ? 'ring-2 ring-purple-300 border-purple-200' : 'border-gray-100'}`}>
                    <div className="flex items-center">
                        <div className="w-1.5 h-1.5 bg-teal-500 rounded-full mr-2 flex-shrink-0" />
                        <span className="text-xs text-gray-600 mr-1 flex-shrink-0">Asistente:</span>
                        {!editingAssistant ? (
                            <>
                                <span className="text-xs font-bold text-gray-800 truncate flex-1">
                                    {trip?.assistant ? `${trip.assistant.firstname} ${trip.assistant.lastname}` : 'Sin asignar'}
                                </span>
                                {editable && (
                                    <button onClick={onStartEditAssistant} className="ml-1 p-1 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-md transition-all duration-200 flex-shrink-0" title="Cambiar asistente">
                                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                                    </button>
                                )}
                            </>
                        ) : (
                            <>
                                <div className="flex-1 w-full">
                                    <FormSelect
                                        value={selectedAssistantId || ''}
                                        onChange={(value) => onUpdateSelectedAssistantId(value ? Number(value) : null)}
                                        options={[
                                            { value: '', label: 'Sin asignar' },
                                            ...assistants.map(assistant => ({ value: assistant.id, label: `${assistant.firstname} ${assistant.lastname}` }))
                                        ]}
                                        disabled={savingAssistant}
                                    />
                                </div>
                                <div className="flex items-center ml-1 flex-shrink-0">
                                    <button onClick={onSaveAssistant} disabled={savingAssistant} className="p-1 text-green-600 hover:bg-green-50 rounded-md transition-colors disabled:opacity-50" title="Guardar">
                                        {!savingAssistant ? (
                                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                                        ) : (
                                            <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path></svg>
                                        )}
                                    </button>
                                    <button onClick={onCancelEditAssistant} disabled={savingAssistant} className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors disabled:opacity-50" title="Cancelar">
                                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {trip?.total_seats && !isDoubleDeck && (
                <div className="flex items-center justify-between bg-white rounded-lg shadow-sm border border-gray-100 p-3">
                    <div className="flex items-center space-x-2">
                        <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                        </svg>
                        <span className="text-sm font-bold text-gray-700">PLANILLA DE PASAJEROS</span>
                    </div>

                    <div className="flex items-center space-x-4">
                        <div className="text-center">
                            <span className="text-lg font-black text-indigo-600">{totalSeatsCount !== null ? totalSeatsCount : trip.total_seats}</span>
                            <p className="text-xs text-gray-500">Total</p>
                        </div>
                        <div className="w-px h-8 bg-gray-200" />
                        <div className="text-center">
                            <span className="text-lg font-black text-red-600">{occupiedSeatsCount}</span>
                            <p className="text-xs text-gray-500">Ocupados</p>
                        </div>
                        <div className="w-px h-8 bg-gray-200" />
                        <div className="text-center">
                            <span className="text-lg font-black text-amber-600">{reservedSeatsCount}</span>
                            <p className="text-xs text-gray-500">Reservados</p>
                        </div>
                        <div className="w-px h-8 bg-gray-200" />
                        <div className="text-center">
                            <span className="text-lg font-black text-emerald-600">{availableSeatsCount}</span>
                            <p className="text-xs text-gray-500">Disponibles</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
