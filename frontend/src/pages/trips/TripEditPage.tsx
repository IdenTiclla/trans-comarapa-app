import { useEffect, useState, useMemo, useCallback, type FormEvent } from 'react'
import { useParams, useNavigate } from 'react-router'
import { useAppDispatch, useAppSelector } from '@/store'
import { fetchTripById, updateTrip, selectCurrentTrip, selectTripLoading, selectTripError } from '@/store/trip.slice'
import { fetchRoutes, selectRoutes } from '@/store/route.slice'
import { fetchBuses, selectBuses } from '@/store/bus.slice'
import { fetchDrivers, selectDrivers } from '@/store/driver.slice'
import { fetchAssistants, selectAssistants } from '@/store/assistant.slice'
import FormInput from '@/components/forms/FormInput'
import FormSelect from '@/components/forms/FormSelect'
import { Button } from '@/components/ui/button'

const STATUS_OPTIONS = [
  { value: 'scheduled', label: 'Programado' },
  { value: 'in_progress', label: 'En progreso' },
  { value: 'completed', label: 'Completado' },
  { value: 'cancelled', label: 'Cancelado' },
]

export function Component() {
  const { id } = useParams()
  const tripId = Number(id)
  const navigate = useNavigate()
  const dispatch = useAppDispatch()

  const currentTrip = useAppSelector(selectCurrentTrip) as any
  const tripLoading = useAppSelector(selectTripLoading)
  const tripError = useAppSelector(selectTripError)
  const routes = useAppSelector(selectRoutes) as any[]
  const buses = useAppSelector(selectBuses) as any[]
  const drivers = useAppSelector(selectDrivers) as any[]
  const assistants = useAppSelector(selectAssistants) as any[]

  const [formLoading, setFormLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [pageError, setPageError] = useState<string | null>(null)

  const [routeId, setRouteId] = useState('')
  const [departureDate, setDepartureDate] = useState('')
  const [departureTime, setDepartureTime] = useState('')
  const [status, setStatus] = useState('scheduled')
  const [busId, setBusId] = useState('')
  const [driverId, setDriverId] = useState('')
  const [assistantId, setAssistantId] = useState('')

  useEffect(() => {
    const load = async () => {
      setFormLoading(true)
      setPageError(null)
      try {
        await Promise.all([
          dispatch(fetchTripById(tripId)),
          dispatch(fetchRoutes({})),
          dispatch(fetchBuses({})),
          dispatch(fetchDrivers({})),
          dispatch(fetchAssistants({})),
        ])
      } catch {
        setPageError('No se pudo cargar la información necesaria.')
      } finally {
        setFormLoading(false)
      }
    }
    load()
  }, [dispatch, tripId])

  // Populate form when trip loads
  useEffect(() => {
    if (currentTrip) {
      setRouteId(String(currentTrip.route?.id || currentTrip.route_id || ''))
      if (currentTrip.trip_datetime) {
        const dt = new Date(currentTrip.trip_datetime)
        setDepartureDate(`${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}-${String(dt.getDate()).padStart(2, '0')}`)
        setDepartureTime(`${String(dt.getHours()).padStart(2, '0')}:${String(dt.getMinutes()).padStart(2, '0')}`)
      }
      setStatus(currentTrip.status || 'scheduled')
      setBusId(String(currentTrip.bus?.id || currentTrip.bus_id || ''))
      setDriverId(String(currentTrip.driver?.id || currentTrip.driver_id || ''))
      setAssistantId(String(currentTrip.assistant?.id || currentTrip.assistant_id || ''))
    }
  }, [currentTrip])

  const routeOptions = useMemo(() => (routes || []).map((r: any) => ({
    value: r.id, label: `${r.origin_location?.name || r.origin} → ${r.destination_location?.name || r.destination}`,
  })), [routes])

  const busOptions = useMemo(() => (buses || []).map((b: any) => ({
    value: b.id, label: `${b.license_plate || b.plate} - ${b.model}`,
  })), [buses])

  const driverOptions = useMemo(() =>
    [{ value: '', label: 'Sin asignar' }, ...(drivers || []).map((d: any) => ({ value: d.id, label: `${d.firstname} ${d.lastname}` }))],
    [drivers])

  const assistantOptions = useMemo(() =>
    [{ value: '', label: 'Sin asignar' }, ...(assistants || []).map((a: any) => ({ value: a.id, label: `${a.firstname} ${a.lastname}` }))],
    [assistants])

  const handleSubmit = useCallback(async (e: FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setPageError(null)
    try {
      const payload: Record<string, unknown> = {
        route_id: Number(routeId),
        trip_datetime: `${departureDate}T${departureTime}:00`,
        status,
        bus_id: Number(busId),
        driver_id: driverId ? Number(driverId) : null,
        assistant_id: assistantId ? Number(assistantId) : null,
      }
      const result = await dispatch(updateTrip({ id: tripId, data: payload }))
      if (result.meta.requestStatus === 'fulfilled') {
        navigate(`/trips/${tripId}`)
      } else {
        setPageError('No se pudieron guardar los cambios.')
      }
    } catch (err: any) {
      setPageError(err?.message || 'No se pudieron guardar los cambios.')
    } finally {
      setSubmitting(false)
    }
  }, [routeId, departureDate, departureTime, status, busId, driverId, assistantId, dispatch, tripId, navigate])

  if (formLoading) {
    return <div className="py-12 flex justify-center"><p className="text-gray-500">Cargando información del viaje...</p></div>
  }

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-semibold text-gray-900 mb-6">Editar Viaje #{tripId}</h1>

        {(pageError || tripError) && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
            <div className="flex">
              <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" /></svg>
              <div className="ml-3"><h3 className="text-sm font-medium text-red-800">{pageError || tripError}</h3></div>
            </div>
          </div>
        )}

        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                <div className="sm:col-span-3"><FormSelect id="route_id" label="Ruta" value={routeId} onChange={setRouteId} options={routeOptions} placeholder="Seleccione una ruta" required /></div>
                <div className="sm:col-span-3"><FormInput type="date" id="departure_date" label="Fecha de salida" value={departureDate} onChange={(e) => setDepartureDate(e.target.value)} required /></div>
                <div className="sm:col-span-3"><FormInput type="time" id="departure_time" label="Hora de salida" value={departureTime} onChange={(e) => setDepartureTime(e.target.value)} required /></div>
                <div className="sm:col-span-3"><FormSelect id="status" label="Estado" value={status} onChange={setStatus} options={STATUS_OPTIONS} required /></div>
                <div className="sm:col-span-3"><FormSelect id="bus_id" label="Bus" value={busId} onChange={setBusId} options={busOptions} placeholder="Seleccione un bus" required /></div>
                <div className="sm:col-span-3"><FormSelect id="driver_id" label="Conductor" value={driverId} onChange={setDriverId} options={driverOptions} /></div>
                <div className="sm:col-span-3"><FormSelect id="assistant_id" label="Asistente" value={assistantId} onChange={setAssistantId} options={assistantOptions} /></div>
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <Button type="button" variant="outline" onClick={() => navigate(-1)}>Cancelar</Button>
                <Button type="submit" disabled={submitting || tripLoading} className="bg-blue-600 hover:bg-blue-700">{submitting ? 'Guardando...' : 'Guardar Cambios'}</Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
