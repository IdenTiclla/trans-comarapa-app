import { locationService } from '@/services/location.service'
import { Button } from '@/components/ui/button'
import { X, Plus, Clock, Eye, EyeOff, Trash2, Loader2, MapPinned, Route as RouteIcon } from 'lucide-react'
import FormSelect from '@/components/forms/FormSelect'
import FormInput from '@/components/forms/FormInput'
import { cn } from '@/lib/utils'

interface RouteFormProps {
    route?: any
    loading?: boolean
    isEditing?: boolean
    onSubmit: (data: any) => void
    onCancel: () => void
}

let localIdCounter = 0

export default function RouteForm({
    route,
    loading = false,
    isEditing = false,
    onSubmit,
    onCancel
}: RouteFormProps) {
    const [locations, setLocations] = useState<any[]>([])
    const [newScheduleTime, setNewScheduleTime] = useState('')
    const [scheduleError, setScheduleError] = useState('')
    const [localSchedules, setLocalSchedules] = useState<any[]>([])

    const [form, setForm] = useState({
        origin_location_id: '',
        destination_location_id: '',
        distance: '',
        duration: '',
        price: ''
    })

    const loadLocations = async () => {
        try {
            const data = await locationService.getAll()
            setLocations(data)
        } catch (err) {
            console.error('Error loading locations:', err)
        }
    }

    useEffect(() => {
        loadLocations()
    }, [])

    useEffect(() => {
        if (route) {
            setForm({
                origin_location_id: route.origin_location_id || '',
                destination_location_id: route.destination_location_id || '',
                distance: route.distance || '',
                duration: route.duration || '',
                price: route.price || ''
            })
            if (route.schedules && route.schedules.length > 0) {
                setLocalSchedules(route.schedules.map((s: any) => ({
                    id: s.id,
                    route_id: s.route_id,
                    departure_time: s.departure_time,
                    is_active: s.is_active,
                    _isNew: false,
                    _localId: ++localIdCounter
                })))
            } else {
                setLocalSchedules([])
            }
        } else {
            setForm({
                origin_location_id: '',
                destination_location_id: '',
                distance: '',
                duration: '',
                price: ''
            })
            setLocalSchedules([])
        }
    }, [route])

    const sameLocationError = Boolean(
        form.origin_location_id &&
        form.destination_location_id &&
        form.origin_location_id === form.destination_location_id
    )

    const availableOrigins = locations
    const availableDestinations = useMemo(() => {
        return locations.filter(loc => loc.id.toString() !== form.origin_location_id.toString())
    }, [locations, form.origin_location_id])

    const sortedLocalSchedules = useMemo(() => {
        return [...localSchedules].sort((a, b) => {
            return a.departure_time.localeCompare(b.departure_time)
        })
    }, [localSchedules])

    const formatTime = (timeStr: string) => {
        if (!timeStr) return ''
        const parts = timeStr.split(':')
        const hours = parseInt(parts[0])
        const minutes = parts[1]
        return `${hours.toString().padStart(2, '0')}:${minutes}`
    }

    const addLocalSchedule = () => {
        if (!newScheduleTime) return
        setScheduleError('')

        const timeWithSeconds = newScheduleTime.length === 5
            ? newScheduleTime + ':00'
            : newScheduleTime

        const exists = localSchedules.some(s => {
            const existing = s.departure_time.substring(0, 5)
            return existing === newScheduleTime.substring(0, 5)
        })

        if (exists) {
            setScheduleError('Este horario ya existe')
            return
        }

        setLocalSchedules([
            ...localSchedules,
            {
                _localId: ++localIdCounter,
                departure_time: timeWithSeconds,
                is_active: true,
                _isNew: true
            }
        ])
        setNewScheduleTime('')
    }

    const removeLocalSchedule = (sortedIndex: number) => {
        const sortedItem = sortedLocalSchedules[sortedIndex]
        const realIndex = localSchedules.findIndex(s =>
            (s._localId && s._localId === sortedItem._localId) ||
            (s.id && s.id === sortedItem.id)
        )
        if (realIndex !== -1) {
            const newSchedules = [...localSchedules]
            newSchedules.splice(realIndex, 1)
            setLocalSchedules(newSchedules)
        }
    }

    const toggleScheduleActive = (sortedIndex: number) => {
        const sortedItem = sortedLocalSchedules[sortedIndex]
        const realIndex = localSchedules.findIndex(s =>
            (s._localId && s._localId === sortedItem._localId) ||
            (s.id && s.id === sortedItem.id)
        )
        if (realIndex !== -1) {
            const newSchedules = [...localSchedules]
            newSchedules[realIndex] = {
                ...newSchedules[realIndex],
                is_active: !newSchedules[realIndex].is_active
            }
            setLocalSchedules(newSchedules)
        }
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (sameLocationError) return

        const finalData = {
            ...form,
            schedules: localSchedules.map(s => ({
                id: s.id || null,
                departure_time: s.departure_time,
                is_active: s.is_active,
                _isNew: s._isNew || false
            }))
        }
        onSubmit(finalData)
    }

    return (
        <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col">
            <div className="px-6 py-5 bg-gradient-to-br from-gray-900 via-gray-800 to-navy-900 border-b border-white/10 text-white shrink-0">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-white/10 rounded-xl">
                            <RouteIcon className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold tracking-tight">
                                {isEditing ? 'Editar Ruta' : 'Nueva Ruta'}
                            </h3>
                            <p className="text-gray-400 text-xs font-medium">Configura el itinerario y precios</p>
                        </div>
                    </div>
                    <button onClick={onCancel} className="text-gray-400 hover:text-white hover:bg-white/10 p-2 rounded-xl transition-all">
                        <X className="h-5 w-5" />
                    </button>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 py-6 space-y-5 custom-scrollbar">
                <div className="grid grid-cols-2 gap-4">
                    <FormSelect
                        label="Origen"
                        id="origin"
                        value={form.origin_location_id}
                        onChange={(val) => setForm({ ...form, origin_location_id: String(val) })}
                        required
                        options={availableOrigins.map(loc => ({
                            label: loc.name,
                            value: loc.id
                        }))}
                        placeholder="Seleccionar..."
                    />

                    <FormSelect
                        label="Destino"
                        id="destination"
                        value={form.destination_location_id}
                        onChange={(val) => setForm({ ...form, destination_location_id: String(val) })}
                        required
                        options={availableDestinations.map(loc => ({
                            label: loc.name,
                            value: loc.id
                        }))}
                        placeholder="Seleccionar..."
                        error={sameLocationError ? 'Origen y destino deben ser diferentes' : undefined}
                    />
                </div>

                <div className="grid grid-cols-3 gap-3">
                    <FormInput
                        label="Distancia (km)"
                        id="distance"
                        type="number"
                        value={form.distance}
                        onChange={(e) => setForm({ ...form, distance: e.target.value })}
                        step="0.1"
                        min="0.1"
                        required
                    />
                    <FormInput
                        label="Duración (hrs)"
                        id="duration"
                        type="number"
                        value={form.duration}
                        onChange={(e) => setForm({ ...form, duration: e.target.value })}
                        step="0.5"
                        min="0.1"
                        required
                    />
                    <FormInput
                        label="Precio (Bs.)"
                        id="price"
                        type="number"
                        value={form.price}
                        onChange={(e) => setForm({ ...form, price: e.target.value })}
                        step="0.5"
                        min="0.1"
                        required
                    />
                </div>

                <div className="border-t border-gray-100 pt-5">
                    <div className="flex items-center gap-2 mb-4">
                        <Clock className="w-4 h-4 text-primary" />
                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest">
                            Horarios de Salida
                        </label>
                    </div>

                    <div className="flex gap-2 items-end mb-4">
                        <div className="flex-1">
                            <FormInput
                                type="time"
                                label=""
                                value={newScheduleTime}
                                onChange={(e) => setNewScheduleTime(e.target.value)}
                                placeholder="HH:MM"
                                className="h-12"
                            />
                        </div>
                        <Button
                            type="button"
                            onClick={addLocalSchedule}
                            disabled={!newScheduleTime}
                            className="h-12 rounded-xl font-bold px-4"
                        >
                            <Plus className="h-4 w-4 mr-1" />
                            Añadir
                        </Button>
                    </div>
                    {scheduleError && (
                        <p className="mb-3 text-xs font-bold text-red-500 bg-red-50 p-2 rounded-lg border border-red-100 animate-in shake-in-1">{scheduleError}</p>
                    )}

                    {localSchedules.length === 0 ? (
                        <div className="text-center py-6 bg-gray-50/50 rounded-2xl border border-dashed border-gray-200">
                            <Clock className="mx-auto h-8 w-8 text-gray-300 mb-2" />
                            <p className="text-xs font-bold text-gray-400 tracking-wider uppercase">Sin horarios configurados</p>
                        </div>
                    ) : (
                        <div className="space-y-2 max-h-40 overflow-y-auto">
                            {sortedLocalSchedules.map((schedule, index) => (
                                <div
                                    key={schedule._localId || schedule.id}
                                    className={`flex items-center justify-between p-2 rounded-lg border ${schedule.is_active ? 'border-gray-200 bg-white' : 'border-gray-100 bg-muted/50'}`}
                                >
                                    <div className="flex items-center gap-2">
                                        <span
                                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-semibold ${schedule.is_active ? 'bg-primary/10 text-primary' : 'bg-gray-200 text-gray-500'}`}
                                        >
                                            <Clock className="w-3.5 h-3.5 mr-1" />
                                            {formatTime(schedule.departure_time)}
                                        </span>
                                        {!schedule.is_active && <span className="text-xs text-gray-400">Inactivo</span>}
                                    </div>

                                    <div className="flex items-center gap-1">
                                        <button
                                            type="button"
                                            onClick={() => toggleScheduleActive(index)}
                                            className="p-1 rounded hover:bg-gray-100"
                                            title={schedule.is_active ? 'Desactivar' : 'Activar'}
                                        >
                                            {schedule.is_active ? (
                                                <Eye className="h-4 w-4 text-green-600" />
                                            ) : (
                                                <EyeOff className="h-4 w-4 text-gray-400" />
                                            )}
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => removeLocalSchedule(index)}
                                            className="p-1 rounded hover:bg-red-50 text-red-600 hover:text-red-900"
                                            title="Eliminar"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="flex justify-end gap-3 pt-6 border-t border-gray-100 mt-2">
                    <Button
                        type="button"
                        variant="ghost"
                        onClick={onCancel}
                        disabled={loading}
                        className="rounded-xl font-bold px-6 h-12 hover:bg-gray-50"
                    >
                        Cancelar
                    </Button>
                    <Button
                        type="submit"
                        disabled={loading || sameLocationError}
                        className="rounded-xl font-bold px-10 h-12 shadow-lg shadow-primary/20"
                    >
                        {loading ? (
                            <div className="flex items-center gap-2">
                                <Loader2 className="h-4 w-4 animate-spin" />
                                <span>Guardando...</span>
                            </div>
                        ) : (
                            <span>{isEditing ? 'Actualizar Ruta' : 'Crear Ruta'}</span>
                        )}
                    </Button>
                </div>
            </form>
        </div>
    )
}
