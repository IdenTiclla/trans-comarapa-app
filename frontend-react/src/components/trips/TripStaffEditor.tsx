import { Button } from '@/components/ui/button'
import { Check, Pencil, User, Users } from 'lucide-react'

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
            <div className="bg-primary/5 rounded-lg p-3 border-2 border-primary/30">
                <p className="text-[10px] text-primary font-semibold uppercase mb-1.5">{label}</p>
                <select
                    value={selectedId}
                    onChange={(e) => onChangeId(e.target.value)}
                    className="w-full text-sm border border-input rounded-md py-1.5 px-2 bg-background focus:ring-2 focus:ring-ring focus:border-ring"
                    autoFocus
                >
                    <option value="">Sin asignar</option>
                    {(options || []).map((o: any) => (
                        <option key={o.id} value={o.id}>{o.firstname} {o.lastname}</option>
                    ))}
                </select>
                <div className="flex gap-2 mt-2">
                    <Button size="sm" onClick={onSave} disabled={saving} className="flex-1 gap-1 h-7 text-xs">
                        {saving ? (
                            <div className="animate-spin rounded-full h-3 w-3 border-2 border-white border-t-transparent" />
                        ) : (
                            <Check className="h-3 w-3" />
                        )}
                        Guardar
                    </Button>
                    <Button size="sm" variant="outline" onClick={onCancel} className="h-7 text-xs">
                        Cancelar
                    </Button>
                </div>
            </div>
        )
    }

    return (
        <button
            onClick={onEdit}
            className="w-full text-left bg-muted/50 hover:bg-primary/5 rounded-lg p-3 border border-transparent hover:border-primary/20 transition-all group cursor-pointer"
        >
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 min-w-0">
                    <span className="text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0">
                        {icon}
                    </span>
                    <div className="min-w-0">
                        <p className="text-[10px] text-muted-foreground font-medium uppercase">{label}</p>
                        <p className={`font-semibold text-sm truncate ${currentName === 'No asignado' ? 'text-muted-foreground italic' : 'text-foreground'}`}>
                            {currentName}
                        </p>
                    </div>
                </div>
                <Pencil className="h-3.5 w-3.5 text-muted-foreground/50 group-hover:text-primary transition-colors flex-shrink-0" />
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
                icon={<User className="h-5 w-5" />}
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
                icon={<Users className="h-5 w-5" />}
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
