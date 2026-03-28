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

function StaffField({
    label,
    icon,
    currentName,
    editing,
    saving,
    selectedId,
    options,
    onEdit,
    onCancel,
    onSave,
    onChangeId,
}: {
    label: string
    icon: React.ReactNode
    currentName: string
    editing: boolean
    saving: boolean
    selectedId: string
    options: any[]
    onEdit: () => void
    onCancel: () => void
    onSave: () => void
    onChangeId: (id: string) => void
}) {
    if (editing) {
        return (
            <div className="bg-indigo-50 rounded-lg p-3 border-2 border-indigo-300 transition-all">
                <p className="text-[10px] text-indigo-500 font-semibold uppercase mb-1.5">{label}</p>
                <select
                    value={selectedId}
                    onChange={(e) => onChangeId(e.target.value)}
                    className="w-full text-sm border-gray-300 rounded-md py-1.5 px-2 bg-white focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400"
                    autoFocus
                >
                    <option value="">Sin asignar</option>
                    {(options || []).map((o: any) => (
                        <option key={o.id} value={o.id}>{o.firstname} {o.lastname}</option>
                    ))}
                </select>
                <div className="flex gap-2 mt-2">
                    <button
                        onClick={onSave}
                        disabled={saving}
                        className="flex-1 inline-flex items-center justify-center gap-1 px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-md transition-colors disabled:opacity-50"
                    >
                        {saving ? (
                            <div className="animate-spin rounded-full h-3 w-3 border-2 border-white border-t-transparent" />
                        ) : (
                            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                        )}
                        Guardar
                    </button>
                    <button
                        onClick={onCancel}
                        className="px-3 py-1.5 text-xs font-semibold text-gray-600 bg-white hover:bg-gray-100 rounded-md border border-gray-300 transition-colors"
                    >
                        Cancelar
                    </button>
                </div>
            </div>
        )
    }

    return (
        <button
            onClick={onEdit}
            className="w-full text-left bg-gray-50 hover:bg-indigo-50 rounded-lg p-3 border border-gray-200 hover:border-indigo-300 transition-all group cursor-pointer"
        >
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 min-w-0">
                    <span className="text-gray-400 group-hover:text-indigo-500 transition-colors flex-shrink-0">
                        {icon}
                    </span>
                    <div className="min-w-0">
                        <p className="text-[10px] text-gray-400 font-medium uppercase">{label}</p>
                        <p className={`font-semibold text-sm truncate ${currentName === 'No asignado' ? 'text-gray-400 italic' : 'text-gray-900'}`}>
                            {currentName}
                        </p>
                    </div>
                </div>
                <svg className="h-4 w-4 text-gray-300 group-hover:text-indigo-500 transition-colors flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
            </div>
        </button>
    )
}

export function TripStaffEditor({ drivers, assistants, trip, staff }: Props) {
    const driverName = trip.driver ? `${trip.driver.firstname} ${trip.driver.lastname}` : 'No asignado'
    const assistantName = trip.assistant ? `${trip.assistant.firstname} ${trip.assistant.lastname}` : 'No asignado'

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <StaffField
                label="Conductor"
                icon={
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                }
                currentName={driverName}
                editing={staff.editingDriver}
                saving={staff.savingDriver}
                selectedId={staff.selectedDriverId}
                options={drivers}
                onEdit={() => staff.setEditingDriver(true)}
                onCancel={() => staff.setEditingDriver(false)}
                onSave={staff.saveDriver}
                onChangeId={staff.setSelectedDriverId}
            />
            <StaffField
                label="Asistente"
                icon={
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                }
                currentName={assistantName}
                editing={staff.editingAssistant}
                saving={staff.savingAssistant}
                selectedId={staff.selectedAssistantId}
                options={assistants}
                onEdit={() => staff.setEditingAssistant(true)}
                onCancel={() => staff.setEditingAssistant(false)}
                onSave={staff.saveAssistant}
                onChangeId={staff.setSelectedAssistantId}
            />
        </div>
    )
}
