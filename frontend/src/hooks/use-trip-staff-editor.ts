import { useState, useEffect } from 'react'
import { apiFetch } from '@/lib/api'
import { toast } from 'sonner'

function notify(type: 'success' | 'error', title: string, message: string) {
    if (type === 'success') toast.success(title, { description: message })
    else toast.error(title, { description: message })
}

interface StaffTrip {
    driver?: { id?: number | string } | null
    assistant?: { id?: number | string } | null
    [key: string]: unknown
}

export function useTripStaffEditor(tripId: number, trip: StaffTrip | null, refreshTrip: () => void) {
    const [editingDriver, setEditingDriver] = useState(false)
    const [editingAssistant, setEditingAssistant] = useState(false)
    const [selectedDriverId, setSelectedDriverId] = useState<string>('')
    const [selectedAssistantId, setSelectedAssistantId] = useState<string>('')
    const [savingDriver, setSavingDriver] = useState(false)
    const [savingAssistant, setSavingAssistant] = useState(false)

    useEffect(() => {
        if (trip) {
            setSelectedDriverId(String(trip.driver?.id || ''))
            setSelectedAssistantId(String(trip.assistant?.id || ''))
        }
    }, [trip])

    const saveDriver = async () => {
        setSavingDriver(true)
        try {
            await apiFetch(`/trips/${tripId}`, { method: 'PUT', body: { driver_id: selectedDriverId ? Number(selectedDriverId) : null } })
            setEditingDriver(false)
            notify('success', 'Conductor actualizado', 'El conductor ha sido actualizado.')
            refreshTrip()
        } catch { notify('error', 'Error', 'No se pudo actualizar el conductor.') }
        finally { setSavingDriver(false) }
    }

    const saveAssistant = async () => {
        setSavingAssistant(true)
        try {
            await apiFetch(`/trips/${tripId}`, { method: 'PUT', body: { assistant_id: selectedAssistantId ? Number(selectedAssistantId) : null } })
            setEditingAssistant(false)
            notify('success', 'Asistente actualizado', 'El asistente ha sido actualizado.')
            refreshTrip()
        } catch { notify('error', 'Error', 'No se pudo actualizar el asistente.') }
        finally { setSavingAssistant(false) }
    }

    return {
        editingDriver,
        setEditingDriver,
        editingAssistant,
        setEditingAssistant,
        selectedDriverId,
        setSelectedDriverId,
        selectedAssistantId,
        setSelectedAssistantId,
        savingDriver,
        savingAssistant,
        saveDriver,
        saveAssistant,
    }
}
