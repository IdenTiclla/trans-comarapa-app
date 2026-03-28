import React, { useState, useEffect, useMemo } from 'react'
import { locationService } from '@/services/location.service'

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
        <div className="bg-white rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900">
                        {isEditing ? 'Editar Ruta' : 'Nueva Ruta'}
                    </h3>
                    <button onClick={onCancel} className="text-gray-400 hover:text-gray-500">
                        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
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
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
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
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
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
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
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
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
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
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
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
                                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                placeholder="HH:MM"
                            />
                        </div>
                        <button
                            type="button"
                            onClick={addLocalSchedule}
                            disabled={!newScheduleTime}
                            className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                        >
                            <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                            Agregar
                        </button>
                    </div>
                    {scheduleError && (
                        <p className="mb-2 text-sm text-red-600">{scheduleError}</p>
                    )}

                    {localSchedules.length === 0 ? (
                        <div className="text-center py-4 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                            <svg className="mx-auto h-8 w-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <p className="mt-1 text-sm text-gray-500">Sin horarios configurados</p>
                        </div>
                    ) : (
                        <div className="space-y-2 max-h-40 overflow-y-auto">
                            {sortedLocalSchedules.map((schedule, index) => (
                                <div
                                    key={schedule._localId || schedule.id}
                                    className={`flex items-center justify-between p-2 rounded-lg border ${schedule.is_active ? 'border-gray-200 bg-white' : 'border-gray-100 bg-gray-50'}`}
                                >
                                    <div className="flex items-center gap-2">
                                        <span
                                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-semibold ${schedule.is_active ? 'bg-indigo-100 text-indigo-800' : 'bg-gray-200 text-gray-500'}`}
                                        >
                                            <svg className="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
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
                                                <svg className="h-4 w-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                </svg>
                                            ) : (
                                                <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                                </svg>
                                            )}
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => removeLocalSchedule(index)}
                                            className="p-1 rounded hover:bg-red-50 text-red-600 hover:text-red-900"
                                            title="Eliminar"
                                        >
                                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        disabled={loading}
                    >
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                        disabled={loading || sameLocationError}
                    >
                        {loading ? (
                            <span className="inline-flex items-center">
                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Guardando...
                            </span>
                        ) : (
                            <span>{isEditing ? 'Actualizar' : 'Crear'}</span>
                        )}
                    </button>
                </div>
            </form>
        </div>
    )
}
