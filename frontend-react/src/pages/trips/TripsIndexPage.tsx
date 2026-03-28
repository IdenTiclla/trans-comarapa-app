import { useEffect, useState, useMemo, useCallback } from 'react'
import { useNavigate } from 'react-router'
import { useAppDispatch, useAppSelector } from '@/store'
import { fetchTrips, selectTrips, selectTripLoading, selectTripError } from '@/store/trip.slice'
import { fetchRoutesWithSchedules } from '@/store/route.slice'
import TripCardList from '@/components/trips/TripCardList'
import CreateTripModal from '@/components/trips/CreateTripModal'

function formatDateStr(date: Date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

const getTodayStr = () => formatDateStr(new Date())
const getTomorrowStr = () => { const d = new Date(); d.setDate(d.getDate() + 1); return formatDateStr(d) }
const getDayAfterStr = () => { const d = new Date(); d.setDate(d.getDate() + 2); return formatDateStr(d) }

export function Component() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const trips = useAppSelector(selectTrips) as Record<string, unknown>[]
  const tripLoading = useAppSelector(selectTripLoading)
  const tripError = useAppSelector(selectTripError)
  const routesWithSchedules = useAppSelector((s: any) => s.route.routesWithSchedules) as Record<string, unknown>[]
  const routeLoading = useAppSelector((s: any) => s.route.isLoading)
  const routeError = useAppSelector((s: any) => s.route.error)

  const [selectedDate, setSelectedDate] = useState(getTodayStr())
  const [createModal, setCreateModal] = useState<{ routeId: number; routeLabel: string; date: string; time: string } | null>(null)

  const isLoading = tripLoading || routeLoading
  const hasError = tripError || routeError

  const loadData = useCallback((date: string) => {
    const dateFrom = `${date}T00:00:00`
    const dateTo = `${date}T23:59:59`
    dispatch(fetchRoutesWithSchedules())
    dispatch(fetchTrips({ sort_by: 'trip_datetime', sort_direction: 'asc', date_from: dateFrom, date_to: dateTo, limit: 100 } as any))
  }, [dispatch])

  useEffect(() => { loadData(selectedDate) }, [selectedDate, loadData])

  const formattedDate = useMemo(() => {
    try {
      const [y, m, d] = selectedDate.split('-')
      const date = new Date(Number(y), Number(m) - 1, Number(d))
      const f = new Intl.DateTimeFormat('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(date)
      return f.charAt(0).toUpperCase() + f.slice(1)
    } catch { return selectedDate }
  }, [selectedDate])

  const scheduleBoard = useMemo(() => {
    const routes = routesWithSchedules || []
    const board: any[] = []
    for (const route of routes as any[]) {
      const activeSchedules = (route.schedules || []).filter((s: any) => s.is_active)
      if (activeSchedules.length === 0) continue
      const slots = activeSchedules.map((schedule: any) => {
        const parts = schedule.departure_time.split(':')
        const timeHHMM = `${parts[0].padStart(2, '0')}:${parts[1]}`
        const matchingTrip = trips.find((t: any) => {
          if (t.route_id !== route.id) return false
          try {
            const td = new Date(t.trip_datetime as string)
            const tripDateStr = `${td.getFullYear()}-${String(td.getMonth() + 1).padStart(2, '0')}-${String(td.getDate()).padStart(2, '0')}`
            if (tripDateStr !== selectedDate) return false
            return `${String(td.getHours()).padStart(2, '0')}:${String(td.getMinutes()).padStart(2, '0')}` === timeHHMM
          } catch { return false }
        })
        return {
          schedule, time: timeHHMM, trip: matchingTrip || null,
          route: { id: route.id, origin: route.origin_location?.name || 'Desconocido', destination: route.destination_location?.name || 'Desconocido', price: route.price },
        }
      })
      slots.sort((a: any, b: any) => a.time.localeCompare(b.time))
      board.push({ route: { id: route.id, origin: route.origin_location?.name || 'Desconocido', destination: route.destination_location?.name || 'Desconocido', price: route.price }, slots })
    }
    return board
  }, [routesWithSchedules, trips, selectedDate])

  const quickStats = useMemo(() => {
    let totalSchedules = 0, tripsCreated = 0, emptySlots = 0
    for (const group of scheduleBoard) for (const slot of group.slots) { totalSchedules++; if (slot.trip) { tripsCreated++ } else { emptySlots++ } }
    return { totalSchedules, tripsCreated, emptySlots, totalRoutes: scheduleBoard.length }
  }, [scheduleBoard])

  const isToday = selectedDate === getTodayStr()
  const isTomorrow = selectedDate === getTomorrowStr()
  const isDayAfter = selectedDate === getDayAfterStr()

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-slate-100 w-full">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200 w-full">
        <div className="w-full px-2 sm:px-4 lg:px-6 py-4">
          <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4">
            <div className="flex items-center space-x-4">
              <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-indigo-600 to-purple-700 rounded-xl shadow-lg">
                <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Tablero de Viajes</h1>
                <p className="text-gray-700">{formattedDate}</p>
              </div>
            </div>
            <div className="flex items-center flex-wrap gap-2">
              {[{ label: 'Hoy', active: isToday, fn: () => setSelectedDate(getTodayStr()) },
              { label: 'Mañana', active: isTomorrow, fn: () => setSelectedDate(getTomorrowStr()) },
              { label: 'Pasado mañana', active: isDayAfter, fn: () => setSelectedDate(getDayAfterStr()) },
              ].map((btn) => (
                <button key={btn.label} onClick={btn.fn} className={`px-3 py-2 text-sm font-medium rounded-lg border transition-colors ${btn.active ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'}`}>{btn.label}</button>
              ))}
              <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className="pl-3 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white shadow-sm" />
            </div>
          </div>
        </div>
      </div>

      {/* Main */}
      <div className="w-full px-2 sm:px-4 lg:px-6 py-6 overflow-x-hidden">
        {/* Quick Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          {[{ value: quickStats.totalSchedules, label: 'Horarios del dia', color: 'text-indigo-600' },
          { value: quickStats.tripsCreated, label: 'Viajes creados', color: 'text-green-600' },
          { value: quickStats.emptySlots, label: 'Sin viaje', color: 'text-orange-600' },
          { value: quickStats.totalRoutes, label: 'Rutas activas', color: 'text-purple-600' },
          ].map((s) => (
            <div key={s.label} className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
              <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
              <div className="text-sm text-gray-600">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Error */}
        {hasError && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-500 rounded-lg p-6 shadow-sm">
            <div className="flex items-center">
              <svg className="h-6 w-6 text-red-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" /></svg>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-red-800">Error al cargar datos</h3>
                <p className="text-red-700 mt-1">{tripError || routeError}</p>
                <button onClick={() => loadData(selectedDate)} className="mt-3 text-sm bg-red-100 hover:bg-red-200 text-red-800 font-medium px-4 py-2 rounded-lg transition-colors border border-red-300">Intentar nuevamente</button>
              </div>
            </div>
          </div>
        )}

        {/* Schedule Board */}
        <TripCardList
          scheduleBoard={scheduleBoard}
          loading={isLoading}
          selectedDate={selectedDate}
          onViewTrip={(id) => navigate(`/trips/${id}`)}
          onEditTrip={(id) => navigate(`/trips/${id}/edit`)}
          onCreateTrip={({ routeId, date, time }) => {
            const routeGroup = scheduleBoard.find((g: any) => g.route.id === routeId)
            const routeLabel = routeGroup ? `${routeGroup.route.origin} → ${routeGroup.route.destination}` : ''
            setCreateModal({ routeId, routeLabel, date, time })
          }}
        />
      </div>

      {createModal && (
        <CreateTripModal
          open
          onClose={() => setCreateModal(null)}
          onCreated={() => { setCreateModal(null); loadData(selectedDate) }}
          routeId={createModal.routeId}
          routeLabel={createModal.routeLabel}
          date={createModal.date}
          time={createModal.time}
        />
      )}
    </div>
  )
}
