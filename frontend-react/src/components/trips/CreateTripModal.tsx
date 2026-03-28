import { useState, useEffect, useMemo, useCallback } from 'react'
import { useAppDispatch, useAppSelector } from '@/store'
import { createTrip } from '@/store/trip.slice'
import { fetchBuses, selectBuses, selectBusLoading } from '@/store/bus.slice'
import { fetchDrivers, selectDrivers } from '@/store/driver.slice'
import { fetchAssistants, selectAssistants } from '@/store/assistant.slice'
import { fetchSecretaries, selectSecretaries } from '@/store/secretary.slice'
import { toast } from 'sonner'

interface CreateTripModalProps {
  open: boolean
  onClose: () => void
  onCreated: () => void
  routeId: number
  routeLabel: string
  date: string
  time: string
}

export default function CreateTripModal({
  open,
  onClose,
  onCreated,
  routeId,
  routeLabel,
  date,
  time,
}: CreateTripModalProps) {
  const dispatch = useAppDispatch()
  const buses = useAppSelector(selectBuses) as any[]
  const busLoading = useAppSelector(selectBusLoading)
  const drivers = useAppSelector(selectDrivers) as any[]
  const assistants = useAppSelector(selectAssistants) as any[]
  const secretaries = useAppSelector(selectSecretaries) as any[]
  const auth = useAppSelector((s: any) => s.auth)

  const [busId, setBusId] = useState('')
  const [driverId, setDriverId] = useState('')
  const [assistantId, setAssistantId] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (open) {
      dispatch(fetchBuses({}))
      dispatch(fetchDrivers({}))
      dispatch(fetchAssistants({}))
      dispatch(fetchSecretaries())
      setBusId('')
      setDriverId('')
      setAssistantId('')
    }
  }, [open, dispatch])

  const busOptions = useMemo(() =>
    (buses || []).map((b: any) => ({
      value: String(b.id),
      label: `${b.license_plate} - ${b.model} (${b.capacity} asientos${b.floors === 2 ? ', 2 pisos' : ''})`,
    })), [buses])

  const driverOptions = useMemo(() =>
    (drivers || []).map((d: any) => ({
      value: String(d.id),
      label: `${d.firstname} ${d.lastname}${d.license_number ? ` (${d.license_number})` : ''}`,
    })), [drivers])

  const assistantOptions = useMemo(() =>
    (assistants || []).map((a: any) => ({
      value: String(a.id),
      label: `${a.firstname} ${a.lastname}`,
    })), [assistants])

  const handleSubmit = useCallback(async () => {
    if (!busId) return
    setSubmitting(true)
    try {
      const tripDatetime = `${date}T${time}:00`
      const payload: Record<string, unknown> = {
        route_id: routeId,
        trip_datetime: tripDatetime,
        bus_id: Number(busId),
        status: 'scheduled',
      }
      if (driverId) payload.driver_id = Number(driverId)
      if (assistantId) payload.assistant_id = Number(assistantId)

      const personId = auth?.user?.person?.id
      if (personId) {
        payload.secretary_id = personId
      } else {
        const currentUserId = auth?.user?.id
        const secretary = secretaries.find((s: any) => s.user_id === currentUserId)
        if (secretary) payload.secretary_id = secretary.id
      }

      const result = await dispatch(createTrip(payload))
      if (result.meta.requestStatus === 'fulfilled') {
        toast.success('Viaje creado exitosamente')
        onCreated()
      } else {
        const error = (result as any)?.payload || 'Error al crear viaje'
        toast.error(typeof error === 'string' ? error : 'Error al crear viaje')
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Error al crear viaje')
    } finally {
      setSubmitting(false)
    }
  }, [busId, driverId, assistantId, date, time, routeId, auth, secretaries, dispatch, onCreated])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-900">Crear Viaje</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          {/* Route/date/time summary */}
          <div className="mt-3 p-3 bg-indigo-50 rounded-lg text-sm">
            <p className="font-semibold text-indigo-900">{routeLabel}</p>
            <p className="text-indigo-700 mt-1">
              {new Date(date + 'T00:00:00').toLocaleDateString('es-BO', { weekday: 'long', day: 'numeric', month: 'long' })} - {time}
            </p>
          </div>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-4">
          {/* Bus (required) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Bus <span className="text-red-500">*</span>
            </label>
            {busLoading ? (
              <div className="flex items-center gap-2 text-sm text-gray-500 py-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-600" />
                Cargando buses...
              </div>
            ) : (
              <select
                value={busId}
                onChange={(e) => setBusId(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="">Seleccionar bus...</option>
                {busOptions.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            )}
          </div>

          {/* Driver (optional) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Conductor</label>
            <select
              value={driverId}
              onChange={(e) => setDriverId(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="">Sin asignar</option>
              {driverOptions.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>

          {/* Assistant (optional) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Asistente</label>
            <select
              value={assistantId}
              onChange={(e) => setAssistantId(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="">Sin asignar</option>
              {assistantOptions.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex gap-3 justify-end">
          <button
            onClick={onClose}
            disabled={submitting}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={!busId || submitting}
            className="px-5 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {submitting ? 'Creando...' : 'Crear Viaje'}
          </button>
        </div>
      </div>
    </div>
  )
}
