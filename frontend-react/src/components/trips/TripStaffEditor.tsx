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
    drivers: any[]
    assistants: any[]
    trip: any
    staff: StaffState
}

export function TripStaffEditor({ drivers, assistants, trip, staff }: Props) {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
            {/* Driver */}
            <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-xs text-gray-500">Conductor</p>
                        {staff.editingDriver ? (
                            <div className="flex items-center gap-2 mt-1">
                                <select value={staff.selectedDriverId} onChange={(e) => staff.setSelectedDriverId(e.target.value)} className="text-sm border-gray-300 rounded-md py-1 px-2">
                                    <option value="">Sin asignar</option>
                                    {(drivers || []).map((d: any) => <option key={d.id} value={d.id}>{d.firstname} {d.lastname}</option>)}
                                </select>
                                <button onClick={staff.saveDriver} disabled={staff.savingDriver} className="text-green-600 hover:text-green-800">
                                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                </button>
                                <button onClick={() => staff.setEditingDriver(false)} className="text-red-600 hover:text-red-800">
                                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                </button>
                            </div>
                        ) : (
                            <p className="font-semibold text-gray-900 text-sm">{trip.driver ? `${trip.driver.firstname} ${trip.driver.lastname}` : 'No asignado'}</p>
                        )}
                    </div>
                    {!staff.editingDriver && (
                        <button onClick={() => staff.setEditingDriver(true)} className="text-gray-400 hover:text-indigo-600">
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                        </button>
                    )}
                </div>
            </div>

            {/* Assistant */}
            <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-xs text-gray-500">Asistente</p>
                        {staff.editingAssistant ? (
                            <div className="flex items-center gap-2 mt-1">
                                <select value={staff.selectedAssistantId} onChange={(e) => staff.setSelectedAssistantId(e.target.value)} className="text-sm border-gray-300 rounded-md py-1 px-2">
                                    <option value="">Sin asignar</option>
                                    {(assistants || []).map((a: any) => <option key={a.id} value={a.id}>{a.firstname} {a.lastname}</option>)}
                                </select>
                                <button onClick={staff.saveAssistant} disabled={staff.savingAssistant} className="text-green-600 hover:text-green-800">
                                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                </button>
                                <button onClick={() => staff.setEditingAssistant(false)} className="text-red-600 hover:text-red-800">
                                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                </button>
                            </div>
                        ) : (
                            <p className="font-semibold text-gray-900 text-sm">{trip.assistant ? `${trip.assistant.firstname} ${trip.assistant.lastname}` : 'No asignado'}</p>
                        )}
                    </div>
                    {!staff.editingAssistant && (
                        <button onClick={() => staff.setEditingAssistant(true)} className="text-gray-400 hover:text-indigo-600">
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                        </button>
                    )}
                </div>
            </div>
        </div>
    )
}
