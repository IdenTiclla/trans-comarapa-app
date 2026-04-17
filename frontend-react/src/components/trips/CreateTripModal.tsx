import { useState, useEffect, useMemo, useCallback } from 'react'
import { useAppDispatch, useAppSelector } from '@/store'
import { createTrip } from '@/store/trip.slice'
import { fetchBuses, selectBuses, selectBusLoading } from '@/store/bus.slice'
import { fetchDrivers, selectDrivers } from '@/store/driver.slice'
import { fetchAssistants, selectAssistants } from '@/store/assistant.slice'
import { fetchSecretaries, selectSecretaries } from '@/store/secretary.slice'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { X, Loader2, MapPin, Clock } from 'lucide-react'
import FormSelect from '@/components/forms/FormSelect'

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
      <div className="relative bg-card rounded-xl shadow-2xl w-full max-w-md mx-4 overflow-hidden border">
        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-foreground">Crear Viaje</h2>
            <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="mt-3 p-3 bg-primary/5 rounded-lg text-sm border border-primary/10">
            <div className="flex items-center gap-2 text-foreground font-semibold">
              <MapPin className="h-4 w-4 text-primary" />
              {routeLabel}
            </div>
            <div className="flex items-center gap-2 mt-1 text-muted-foreground">
              <Clock className="h-4 w-4" />
              {new Date(date + 'T00:00:00').toLocaleDateString('es-BO', { weekday: 'long', day: 'numeric', month: 'long' })} - {time}
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-4">
          {busLoading ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground py-2">
              <Loader2 className="h-4 w-4 animate-spin text-primary" />
              Cargando buses...
            </div>
          ) : (
            <FormSelect
              label="Bus *"
              value={busId}
              onChange={(val) => setBusId(val)}
              options={busOptions}
              placeholder="Seleccionar bus..."
            />
          )}

          <FormSelect
            label="Conductor"
            value={driverId}
            onChange={(val) => setDriverId(val)}
            options={driverOptions}
            placeholder="Sin asignar"
          />

          <FormSelect
            label="Asistente"
            value={assistantId}
            onChange={(val) => setAssistantId(val)}
            options={assistantOptions}
            placeholder="Sin asignar"
          />
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-muted/50 border-t flex gap-3 justify-end">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={submitting}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!busId || submitting}
          >
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Creando...
              </>
            ) : 'Crear Viaje'}
          </Button>
        </div>
      </div>
    </div>
  )
}
