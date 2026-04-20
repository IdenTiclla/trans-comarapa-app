/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useMemo } from 'react'
import FormInput from '@/components/forms/FormInput'
import { Clock, Plus, Trash2, CheckCircle, XCircle, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

interface RouteScheduleManagerProps {
    route: any
    onClose: () => void
    onAdd: (routeId: string | number, data: any) => Promise<void>
    onUpdate: (routeId: string | number, scheduleId: string | number, data: any) => Promise<void>
    onRemove: (routeId: string | number, scheduleId: string | number) => Promise<void>
}

export default function RouteScheduleManager({
    route,
    onClose,
    onAdd,
    onUpdate,
    onRemove
}: RouteScheduleManagerProps) {
    const [newTime, setNewTime] = useState('')
    const [addingSchedule, setAddingSchedule] = useState(false)
    const [errorMessage, setErrorMessage] = useState('')

    const sortedSchedules = useMemo(() => {
        if (!route?.schedules) return []
        return [...route.schedules].sort((a: any, b: any) => {
            return a.departure_time.localeCompare(b.departure_time)
        })
    }, [route])

    const formatTime = (timeStr: string) => {
        if (!timeStr) return ''
        const parts = timeStr.split(':')
        const hours = parseInt(parts[0])
        const minutes = parts[1]
        return `${hours.toString().padStart(2, '0')}:${minutes}`
    }

    const addSchedule = async () => {
        if (!newTime) return
        setAddingSchedule(true)
        setErrorMessage('')
        try {
            await onAdd(route.id, { departure_time: newTime + ':00', is_active: true })
            setNewTime('')
        } catch (err: any) {
            setErrorMessage(err?.data?.detail || err?.message || 'Error al agregar horario')
        } finally {
            setAddingSchedule(false)
        }
    }

    const toggleActive = async (schedule: any) => {
        try {
            await onUpdate(route.id, schedule.id, { is_active: !schedule.is_active })
        } catch (err: any) {
            setErrorMessage(err?.data?.detail || err?.message || 'Error al actualizar horario')
        }
    }

    const removeSchedule = async (schedule: any) => {
        try {
            await onRemove(route.id, schedule.id)
        } catch (err: any) {
            setErrorMessage(err?.data?.detail || err?.message || 'Error al eliminar horario')
        }
    }

    return (
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col border border-gray-100">
            <div className="px-6 py-5 bg-gradient-to-r from-indigo-600 to-indigo-700">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-white/10 rounded-xl backdrop-blur-sm">
                            <Clock className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-white tracking-tight">Horarios de Salida</h3>
                            <p className="text-indigo-100 text-xs font-medium opacity-80">
                                {route?.origin_location?.name} → {route?.destination_location?.name}
                            </p>
                        </div>
                    </div>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={onClose}
                        aria-label="Cerrar"
                        className="text-white/70 hover:text-white hover:bg-white/10 rounded-xl"
                    >
                        <X className="h-5 w-5" />
                    </Button>
                </div>
            </div>

            <div className="px-6 py-6 border-b border-gray-50 bg-gray-50/30">
                <div className="flex gap-3 items-end">
                    <div className="flex-1">
                        <FormInput
                            id="new-time"
                            label="Nuevo horario"
                            type="time"
                            value={newTime}
                            onChange={(e) => setNewTime(e.target.value)}
                            placeholder="00:00"
                        />
                    </div>
                    <div className="pb-1.5 flex flex-col justify-end h-full">
                        <Button
                            onClick={addSchedule}
                            disabled={!newTime || addingSchedule}
                            className="bg-indigo-600 hover:bg-indigo-700 min-h-[48px] rounded-xl font-bold"
                        >
                            {addingSchedule ? (
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                            ) : (
                                <>
                                    <Plus className="w-4 h-4 mr-2" />
                                    Agregar
                                </>
                            )}
                        </Button>
                    </div>
                </div>
                {errorMessage && (
                    <div className="mt-3 p-3 bg-red-50 border border-red-100 rounded-xl text-xs text-red-600 font-medium animate-in slide-in-from-top-1">
                        {errorMessage}
                    </div>
                )}
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-4 custom-scrollbar">
                {sortedSchedules.length === 0 ? (
                    <div className="text-center py-12 bg-gray-50/50 rounded-2xl border border-dashed border-gray-200">
                        <Clock className="mx-auto h-12 w-12 text-gray-300" />
                        <p className="mt-3 text-sm font-medium text-gray-500 italic">No hay horarios configurados</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {sortedSchedules.map((schedule: any) => (
                            <div
                                key={schedule.id}
                                className={cn(
                                    "flex items-center justify-between p-4 rounded-2xl border transition-all duration-300 group",
                                    schedule.is_active 
                                        ? "border-gray-100 bg-white shadow-sm hover:shadow-md hover:border-indigo-100" 
                                        : "border-gray-100 bg-gray-50/50 opacity-70"
                                )}
                            >
                                <div className="flex items-center gap-4">
                                    <div className={cn(
                                        "w-12 h-12 rounded-xl flex items-center justify-center transition-colors",
                                        schedule.is_active ? "bg-indigo-50 text-indigo-600" : "bg-gray-200 text-gray-500"
                                    )}>
                                        <Clock className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <div className="text-base font-bold text-gray-900 tracking-tight">
                                            {formatTime(schedule.departure_time)}
                                        </div>
                                        <div className={cn(
                                            "text-[10px] font-bold uppercase tracking-widest mt-0.5",
                                            schedule.is_active ? "text-green-500" : "text-gray-400"
                                        )}>
                                            {schedule.is_active ? 'Activo' : 'Inactivo'}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => toggleActive(schedule)}
                                        aria-label={schedule.is_active ? 'Desactivar horario' : 'Activar horario'}
                                        className={cn(
                                            "rounded-xl transition-all duration-200",
                                            schedule.is_active
                                                ? "text-green-600 bg-green-50 hover:bg-green-100"
                                                : "text-gray-400 bg-gray-100 hover:bg-gray-200"
                                        )}
                                    >
                                        {schedule.is_active ? <CheckCircle className="h-5 w-5" /> : <XCircle className="h-5 w-5" />}
                                    </Button>

                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => removeSchedule(schedule)}
                                        aria-label="Eliminar horario"
                                        className="rounded-xl text-red-400 hover:text-red-600 bg-red-50 hover:bg-red-100 transition-all duration-200 opacity-0 group-hover:opacity-100"
                                    >
                                        <Trash2 className="h-5 w-5" />
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
                <Button
                    onClick={onClose}
                    variant="outline"
                    className="w-full h-11 rounded-xl font-bold border-gray-200 text-gray-600 hover:bg-gray-100"
                >
                    Cerrar Panel
                </Button>
            </div>
        </div>
    )
}
