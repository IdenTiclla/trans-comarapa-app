import { Button } from '@/components/ui/button'
import { Check, User, Users } from 'lucide-react'

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

function StaffDisplayCard({
    label,
    icon,
    name,
    onClick,
}: {
    label: string
    icon: React.ReactNode
    name: string
    onClick: () => void
}) {
    const isEmpty = name === 'No asignado'
    return (
        <button
            onClick={onClick}
            className="flex items-center gap-3 text-left w-full rounded-xl border border-border/60 px-4 py-3 hover:border-primary/40 hover:bg-primary/5 transition-all cursor-pointer"
        >
            <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                {icon}
            </div>
            <div className="min-w-0">
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">{label}</p>
                <p className={`text-sm font-semibold truncate ${isEmpty ? 'text-muted-foreground italic' : 'text-foreground'}`}>
                    {name}
                </p>
            </div>
        </button>
    )
}

function StaffEditCard({
    label,
    selectedId,
    options,
    saving,
    onChangeId,
    onSave,
    onCancel,
}: {
    label: string
    selectedId: string
    options: any[]
    saving: boolean
    onChangeId: (id: string) => void
    onSave: () => void
    onCancel: () => void
}) {
    return (
        <div className="rounded-xl border-2 border-primary/30 bg-primary/5 px-4 py-3">
            <p className="text-[10px] text-primary font-semibold uppercase tracking-wider mb-1.5">{label}</p>
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

export function TripStaffEditor({ drivers, assistants, trip, staff }: Props) {
    const driverName = trip.driver ? `${trip.driver.firstname} ${trip.driver.lastname}` : 'No asignado'
    const assistantName = trip.assistant ? `${trip.assistant.firstname} ${trip.assistant.lastname}` : 'No asignado'

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Conductor */}
            {staff.editingDriver ? (
                <StaffEditCard
                    label="Conductor"
                    selectedId={staff.selectedDriverId}
                    options={drivers}
                    saving={staff.savingDriver}
                    onChangeId={staff.setSelectedDriverId}
                    onSave={staff.saveDriver}
                    onCancel={() => staff.setEditingDriver(false)}
                />
            ) : (
                <StaffDisplayCard
                    label="Conductor"
                    icon={<User className="h-4 w-4 text-primary" />}
                    name={driverName}
                    onClick={() => staff.setEditingDriver(true)}
                />
            )}

            {/* Asistente */}
            {staff.editingAssistant ? (
                <StaffEditCard
                    label="Asistente"
                    selectedId={staff.selectedAssistantId}
                    options={assistants}
                    saving={staff.savingAssistant}
                    onChangeId={staff.setSelectedAssistantId}
                    onSave={staff.saveAssistant}
                    onCancel={() => staff.setEditingAssistant(false)}
                />
            ) : (
                <StaffDisplayCard
                    label="Asistente"
                    icon={<Users className="h-4 w-4 text-primary" />}
                    name={assistantName}
                    onClick={() => staff.setEditingAssistant(true)}
                />
            )}
        </div>
    )
}
