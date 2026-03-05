import { useEffect, useState, useMemo, useCallback, type FormEvent } from 'react'
import { useNavigate, useSearchParams } from 'react-router'
import { useAppDispatch, useAppSelector } from '@/store'
import { createTrip, selectTripLoading, selectTripError } from '@/store/trip.slice'
import { fetchRoutesWithSchedules } from '@/store/route.slice'
import { fetchBuses, selectBuses, selectBusLoading } from '@/store/bus.slice'
import { fetchDrivers, selectDrivers } from '@/store/driver.slice'
import { fetchAssistants, selectAssistants } from '@/store/assistant.slice'
import { fetchSecretaries, selectSecretaries } from '@/store/secretary.slice'
import FormInput from '@/components/forms/FormInput'
import FormSelect from '@/components/forms/FormSelect'
import ConfirmDialog from '@/components/common/ConfirmDialog'
import NotificationModal from '@/components/common/NotificationModal'

function formatDateStr(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

const COMMON_TIMES = ['05:00', '06:00', '07:00', '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00']
const formatCurrency = (amount?: number) => amount ? new Intl.NumberFormat('es-BO', { style: 'currency', currency: 'BOB', minimumFractionDigits: 2 }).format(amount) : 'Precio no definido'

export function Component() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const tripLoading = useAppSelector(selectTripLoading)
  const tripError = useAppSelector(selectTripError)
  const routesWithSchedules = useAppSelector((s: any) => s.route.routesWithSchedules) as any[]
  const routeLoading = useAppSelector((s: any) => s.route.isLoading)
  const buses = useAppSelector(selectBuses) as any[]
  const busLoading = useAppSelector(selectBusLoading)
  const drivers = useAppSelector(selectDrivers) as any[]
  const assistants = useAppSelector(selectAssistants) as any[]
  const secretaries = useAppSelector(selectSecretaries) as any[]
  const auth = useAppSelector((s: any) => s.auth)

  const today = formatDateStr(new Date())

  const [routeId, setRouteId] = useState(searchParams.get('route_id') || '')
  const [departureDate, setDepartureDate] = useState(searchParams.get('date') || today)
  const [departureTime, setDepartureTime] = useState(searchParams.get('time') || '')
  const [busId, setBusId] = useState('')
  const [driverId, setDriverId] = useState('')
  const [assistantId, setAssistantId] = useState('')
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)

  useEffect(() => {
    dispatch(fetchRoutesWithSchedules())
    dispatch(fetchBuses({}))
    dispatch(fetchDrivers({}))
    dispatch(fetchAssistants({}))
    dispatch(fetchSecretaries())
  }, [dispatch])

  const selectedRoute = useMemo(() => {
    if (!routeId) return null
    return (routesWithSchedules || []).find((r: any) => r.id === Number(routeId))
  }, [routeId, routesWithSchedules])

  const routeOptions = useMemo(() =>
    (routesWithSchedules || []).map((r: any) => ({
      value: r.id,
      label: `${r.origin_location?.name} → ${r.destination_location?.name} (${formatCurrency(r.price)})`,
    })), [routesWithSchedules])

  const busOptions = useMemo(() =>
    (buses || []).map((b: any) => ({
      value: b.id,
      label: `${b.license_plate} - ${b.model} (${b.capacity} asientos${b.floors === 2 ? ', 2 pisos' : ''})`,
    })), [buses])

  const driverOptions = useMemo(() =>
    [{ value: '', label: 'Sin asignar' }, ...(drivers || []).map((d: any) => ({
      value: d.id,
      label: `${d.firstname} ${d.lastname}${d.license_number ? ` (${d.license_number})` : ''}`,
    }))], [drivers])

  const assistantOptions = useMemo(() =>
    [{ value: '', label: 'Sin asignar' }, ...(assistants || []).map((a: any) => ({
      value: a.id,
      label: `${a.firstname} ${a.lastname}`,
    }))], [assistants])

  const routeScheduleTimes = useMemo(() => {
    if (!selectedRoute?.schedules) return []
    return selectedRoute.schedules
      .filter((s: any) => s.is_active)
      .map((s: any) => { const p = s.departure_time.split(':'); return `${p[0].padStart(2, '0')}:${p[1]}` })
      .sort()
  }, [selectedRoute])

  const dateOptions = useMemo(() => {
    const t = new Date()
    const tom = new Date(t); tom.setDate(tom.getDate() + 1)
    const da = new Date(t); da.setDate(da.getDate() + 2)
    return [
      { label: 'Hoy', value: formatDateStr(t) },
      { label: 'Mañana', value: formatDateStr(tom) },
      { label: 'Pasado mañana', value: formatDateStr(da) },
    ]
  }, [])

  const isFormValid = routeId && departureDate && departureDate >= today && departureTime && busId
  const isLoadingData = routeLoading || busLoading

  const executeTripCreation = useCallback(async () => {
    if (!isFormValid) return
    const tripDatetime = `${departureDate}T${departureTime}:00`
    const payload: Record<string, unknown> = {
      route_id: Number(routeId),
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
      setShowSuccessModal(true)
    }
  }, [isFormValid, routeId, departureDate, departureTime, busId, driverId, assistantId, auth, dispatch, secretaries])

  const handleSubmit = useCallback((e: FormEvent) => {
    e.preventDefault()
    if (!isFormValid) return
    setShowConfirmDialog(true)
  }, [isFormValid])

  return (
    <div className="py-6">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-10 text-center">
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">Crear Nuevo Viaje</h1>
          <p className="mt-3 text-base text-gray-500 max-w-2xl mx-auto">
            Configura un nuevo viaje seleccionando la ruta, horario, vehículo asignado y el personal a bordo.
          </p>
        </div>

        {/* Errors */}
        {tripError && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex">
              <svg className="h-5 w-5 text-red-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" /></svg>
              <div className="ml-3"><h3 className="text-sm font-medium text-red-800">Error al procesar el formulario</h3><p className="text-sm text-red-700 mt-1">{tripError}</p></div>
            </div>
          </div>
        )}

        {isLoadingData && (
          <div className="mb-6 bg-blue-50 border border-blue-200 rounded-md p-4 flex items-center">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600 mr-3" />
            <span className="text-sm text-blue-800">Cargando datos necesarios para el formulario...</span>
          </div>
        )}

        <div className="bg-white shadow-xl rounded-2xl overflow-hidden border border-gray-100">
          <div className="px-8 py-10">
            <form onSubmit={handleSubmit} noValidate>
              <fieldset disabled={tripLoading || isLoadingData}>
                <div className="space-y-8">
                  {/* Route & Schedule */}
                  <div>
                    <h2 className="text-lg font-medium text-gray-900 mb-4">Ruta y Horario</h2>
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                      <div className="sm:col-span-2">
                        <FormSelect id="route_id" label="Ruta" value={routeId} onChange={setRouteId} options={routeOptions} placeholder="Seleccione una ruta" required />
                        {selectedRoute && (
                          <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-md flex items-center gap-4 text-sm text-blue-800">
                            <span>{selectedRoute.distance} km</span>
                            <span>{selectedRoute.duration}h</span>
                            <span className="font-semibold">{formatCurrency(selectedRoute.price)}</span>
                          </div>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de salida <span className="text-red-500">*</span></label>
                        <div className="flex flex-wrap gap-2 mb-2">
                          {dateOptions.map((o) => (
                            <button key={o.value} type="button" onClick={() => setDepartureDate(o.value)} className={`px-3 py-1 text-xs font-medium rounded-full border transition-colors ${departureDate === o.value ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'}`}>{o.label}</button>
                          ))}
                        </div>
                        <FormInput type="date" id="departure_date" value={departureDate} onChange={(e) => setDepartureDate(e.target.value)} min={today} required />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Hora de salida <span className="text-red-500">*</span></label>
                        {routeScheduleTimes.length > 0 ? (
                          <div className="mb-2">
                            <p className="text-xs text-gray-500 mb-1">Horarios programados:</p>
                            <div className="flex flex-wrap gap-1">
                              {routeScheduleTimes.map((t: string) => (
                                <button key={t} type="button" onClick={() => setDepartureTime(t)} className={`px-3 py-1.5 text-xs font-semibold rounded-full border-2 transition-colors ${departureTime === t ? 'bg-blue-600 text-white border-blue-600' : 'bg-blue-50 text-blue-700 border-blue-300 hover:bg-blue-100'}`}>{t}</button>
                              ))}
                            </div>
                          </div>
                        ) : routeId ? (
                          <div className="mb-2">
                            <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded px-2 py-1">Sin horarios configurados. Ingrese la hora manualmente.</p>
                            <div className="grid grid-cols-4 gap-1 mt-2">
                              {COMMON_TIMES.map((t) => (
                                <button key={t} type="button" onClick={() => setDepartureTime(t)} className={`px-2 py-1 text-xs font-medium rounded border transition-colors ${departureTime === t ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'}`}>{t}</button>
                              ))}
                            </div>
                          </div>
                        ) : null}
                        <FormInput type="time" id="departure_time" value={departureTime} onChange={(e) => setDepartureTime(e.target.value)} required />
                      </div>
                    </div>
                  </div>

                  {/* Vehicle & Staff */}
                  <div>
                    <h2 className="text-lg font-medium text-gray-900 mb-4">Vehículo y Personal</h2>
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                      <div className="sm:col-span-2">
                        <FormSelect id="bus_id" label="Bus" value={busId} onChange={setBusId} options={busOptions} placeholder="Seleccione un bus" required />
                      </div>
                      <FormSelect id="driver_id" label="Conductor" value={driverId} onChange={setDriverId} options={driverOptions} placeholder="Sin asignar" />
                      <FormSelect id="assistant_id" label="Asistente" value={assistantId} onChange={setAssistantId} options={assistantOptions} placeholder="Sin asignar" />
                    </div>
                  </div>
                </div>
              </fieldset>

              <div className="mt-8 pt-6 border-t border-gray-200 flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-3">
                <button type="button" onClick={() => navigate(-1)} className="w-full sm:w-auto inline-flex justify-center items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50" disabled={tripLoading}>Cancelar</button>
                <button type="submit" disabled={tripLoading || isLoadingData || !isFormValid} className="w-full sm:w-auto inline-flex justify-center items-center px-6 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed">
                  {tripLoading ? (<><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />Creando viaje...</>) : (<><svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>Crear Viaje</>)}
                </button>
              </div>
              {!isFormValid && <p className="mt-2 text-sm text-gray-500">Complete los campos de ruta, fecha, hora y bus para continuar</p>}
            </form>
          </div>
        </div>

        <ConfirmDialog
          open={showConfirmDialog}
          onOpenChange={setShowConfirmDialog}
          type="info"
          title="Confirmar creación de viaje"
          message={`Ruta: ${selectedRoute?.origin_location?.name} → ${selectedRoute?.destination_location?.name}\nFecha: ${departureDate}\nHora: ${departureTime}\nBus: ${busOptions.find((o: any) => o.value === Number(busId))?.label || ''}`}
          confirmText="Crear Viaje"
          cancelText="Revisar"
          onConfirm={executeTripCreation}
        />

        <NotificationModal
          open={showSuccessModal}
          onOpenChange={setShowSuccessModal}
          type="success"
          title="Viaje creado exitosamente"
          message="El viaje ha sido programado correctamente."
          buttonText="Ver Tablero"
          onClose={() => navigate('/trips')}
        />
      </div>
    </div>
  )
}
