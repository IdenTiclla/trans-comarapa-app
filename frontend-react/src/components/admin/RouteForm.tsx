import React, { useState, useEffect, useMemo } from 'react'
import { locationService } from '@/services/location.service'
import { Button } from '@/components/ui/button'
import { X, Plus, Clock, Eye, EyeOff, Trash2, Loader2 } from 'lucide-react'

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
        <div className="bg-card rounded-xl shadow-2xl border w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900">
                        {isEditing ? 'Editar Ruta' : 'Nueva Ruta'}
                    </h3>
                    <button onClick={onCancel} className="text-gray-400 hover:text-gray-500">
                        <X className="h-6 w-6" />
                    </button>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="px-6 py-4 space-y-4">
                <div>
                    <label htmlFor="origin" className="block text-sm font-medium text-gray-700">Origen</label>
                    <select
                        id="origin"
                        value={form.origin_location_id}
                        onChange={(e) => setForm({ ...form, origin_location_id: e.target.value })}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-ring sm:text-sm"
                        required
                    >
                        <option value="" disabled>Seleccionar origen</option>
                        {availableOrigins.map(loc => (
                            <option key={loc.id} value={loc.id}>
                                {loc.name}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label htmlFor="destination" className="block text-sm font-medium text-gray-700">Destino</label>
                    <select
                        id="destination"
                        value={form.destination_location_id}
                        onChange={(e) => setForm({ ...form, destination_location_id: e.target.value })}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-ring sm:text-sm"
                        required
                    >
                        <option value="" disabled>Seleccionar destino</option>
                        {availableDestinations.map(loc => (
                            <option key={loc.id} value={loc.id}>
                                {loc.name}
                            </option>
                        ))}
                    </select>
                    {sameLocationError && (
                        <p className="mt-1 text-sm text-red-600">El origen y destino deben ser diferentes</p>
                    )}
                </div>

                <div>
                    <label htmlFor="distance" className="block text-sm font-medium text-gray-700">Distancia (km)</label>
                    <input
                        id="distance"
                        type="number"
                        value={form.distance}
                        onChange={(e) => setForm({ ...form, distance: e.target.value })}
                        step="0.1"
                        min="0.1"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-ring sm:text-sm"
                        required
                    />
                </div>

                <div>
                    <label htmlFor="duration" className="block text-sm font-medium text-gray-700">Duración (horas)</label>
                    <input
                        id="duration"
                        type="number"
                        value={form.duration}
                        onChange={(e) => setForm({ ...form, duration: e.target.value })}
                        step="0.5"
                        min="0.1"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-ring sm:text-sm"
                        required
                    />
                </div>

                <div>
                    <label htmlFor="price" className="block text-sm font-medium text-gray-700">Precio (Bs.)</label>
                    <input
                        id="price"
                        type="number"
                        value={form.price}
                        onChange={(e) => setForm({ ...form, price: e.target.value })}
                        step="0.5"
                        min="0.1"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-ring sm:text-sm"
                        required
                    />
                </div>

                <div className="border-t border-gray-200 pt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Horarios de Salida
                    </label>

                    <div className="flex gap-2 items-end mb-3">
                        <div className="flex-1">
                            <input
                                type="time"
                                value={newScheduleTime}
                                onChange={(e) => setNewScheduleTime(e.target.value)}
                                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-ring sm:text-sm"
                                placeholder="HH:MM"
                            />
                        </div>
                        <Button
                            type="button"
                            size="sm"
                            onClick={addLocalSchedule}
                            disabled={!newScheduleTime}
                        >
                            <Plus className="h-4 w-4 mr-1" />
                            Agregar
                        </Button>
                    </div>
                    {scheduleError && (
                        <p className="mb-2 text-sm text-red-600">{scheduleError}</p>
                    )}

                    {localSchedules.length === 0 ? (
                        <div className="text-center py-4 bg-muted/50 rounded-lg border border-dashed border-gray-300">
                            <Clock className="mx-auto h-8 w-8 text-gray-400" />
                            <p className="mt-1 text-sm text-gray-500">Sin horarios configurados</p>
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

                <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={onCancel}
                        disabled={loading}
                    >
                        Cancelar
                    </Button>
                    <Button
                        type="submit"
                        disabled={loading || sameLocationError}
                    >
                        {loading ? (
                            <span className="inline-flex items-center">
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Guardando...
                            </span>
                        ) : (
                            <span>{isEditing ? 'Actualizar' : 'Crear'}</span>
                        )}
                    </Button>
                </div>
            </form>
        </div>
    )
}
