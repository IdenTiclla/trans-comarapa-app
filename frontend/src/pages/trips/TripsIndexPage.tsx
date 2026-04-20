import { useEffect, useState, useMemo, useCallback } from 'react'
import { useNavigate } from 'react-router'
import { useAppDispatch, useAppSelector } from '@/store'
import { fetchTrips, selectTrips, selectTripLoading, selectTripError } from '@/store/trip.slice'
import { fetchRoutesWithSchedules } from '@/store/route.slice'
import TripCardList from '@/components/trips/TripCardList'
import CreateTripModal from '@/components/trips/CreateTripModal'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Calendar, AlertCircle, RefreshCw, Printer, ChevronDown } from 'lucide-react'
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover'
import { CalendarView } from '@/components/ui/calendar-view'

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

  // Stats computed from loaded trips
  const boardStats = useMemo(() => {
    let totalSeats = 0
    let soldTickets = 0
    let estimatedRevenue = 0
    const activeRoutes = scheduleBoard.length

    for (const group of scheduleBoard) {
      for (const slot of group.slots) {
        if (slot.trip) {
          const total = (slot.trip.total_seats as number) ?? 0
          const available = (slot.trip.available_seats as number) ?? 0
          const occupied = Math.max(0, total - available)
          totalSeats += total
          soldTickets += occupied
          estimatedRevenue += occupied * (group.route.price ?? 0)
        }
      }
    }

    return { totalSeats, soldTickets, estimatedRevenue, activeRoutes }
  }, [scheduleBoard])

  const isToday = selectedDate === getTodayStr()
  const isTomorrow = selectedDate === getTomorrowStr()
  const isDayAfter = selectedDate === getDayAfterStr()

  return (
    <div className="w-full space-y-4">
      {/* Header + Date Controls */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Tablero de Viajes Diarios</h1>
          
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-2 mt-0.5 h-auto p-0 text-sm text-muted-foreground hover:text-primary hover:bg-transparent cursor-pointer group">
                <Calendar className="h-3.5 w-3.5" />
                <span className="font-medium group-hover:underline underline-offset-4 decoration-primary/30">{formattedDate}</span>
                <ChevronDown className="h-3 w-3 opacity-50 group-hover:opacity-100 transition-opacity" />
                <span className="text-border mx-1">|</span>
                <span className="text-primary font-medium">{boardStats.activeRoutes} Rutas Activas</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent align="start" className="w-auto p-4 border shadow-xl bg-card rounded-xl">
              <CalendarView 
                value={selectedDate} 
                onChange={(date) => setSelectedDate(date)} 
              />
            </PopoverContent>
          </Popover>
        </div>
        <div className="flex items-center flex-wrap gap-1.5">
          {[
            { label: 'Hoy', active: isToday, fn: () => setSelectedDate(getTodayStr()) },
            { label: 'Mañana', active: isTomorrow, fn: () => setSelectedDate(getTomorrowStr()) },
            { label: 'Pasado', active: isDayAfter, fn: () => setSelectedDate(getDayAfterStr()) },
          ].map((btn) => (
            <Button
              key={btn.label}
              variant={btn.active ? 'default' : 'outline'}
              size="sm"
              className="h-7 text-xs"
              onClick={btn.fn}
            >
              {btn.label}
            </Button>
          ))}
          
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="h-7 text-xs gap-2 font-medium">
                <Calendar className="h-3 w-3" />
                Elegir fecha
              </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-auto p-4 border shadow-xl bg-card rounded-xl">
              <CalendarView 
                value={selectedDate} 
                onChange={(date) => setSelectedDate(date)} 
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Error */}
      {hasError && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-semibold text-red-800">Error al cargar datos</h3>
                <p className="text-sm text-red-700 mt-1">{tripError || routeError}</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => loadData(selectedDate)}
                  className="mt-3 border-red-300 text-red-800 hover:bg-red-100"
                >
                  Intentar nuevamente
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Schedule Board */}
      <TripCardList
        scheduleBoard={scheduleBoard}
        loading={isLoading}
        selectedDate={selectedDate}
        onViewTrip={(id) => navigate(`/trips/${id}`)}
        onSellTicket={(id) => navigate(`/trips/${id}`)}
        onCreateTrip={({ routeId, date, time }) => {
          const routeGroup = scheduleBoard.find((g: any) => g.route.id === routeId)
          const routeLabel = routeGroup ? `${routeGroup.route.origin} → ${routeGroup.route.destination}` : ''
          setCreateModal({ routeId, routeLabel, date, time })
        }}
      />

      {/* Footer Stats Bar */}
      {!isLoading && scheduleBoard.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t">
          <div className="flex items-center gap-6">
            <div>
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Total Asientos</p>
              <p className="text-xl font-bold text-foreground">{boardStats.totalSeats}</p>
            </div>
            <div>
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Boletos Vendidos</p>
              <p className="text-xl font-bold text-foreground">{boardStats.soldTickets}</p>
            </div>
            <div>
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Ingresos Estimados</p>
              <p className="text-xl font-bold text-primary">Bs. {boardStats.estimatedRevenue.toLocaleString('es-BO')}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="gap-1.5 h-8" onClick={() => window.print()}>
              <Printer className="h-3.5 w-3.5" />
              Imprimir Manifiesto
            </Button>
            <Button
              size="sm"
              className="gap-1.5 h-8 bg-[#7c2d12] hover:bg-[#9a3412]"
              onClick={() => loadData(selectedDate)}
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Sincronizar Datos
            </Button>
          </div>
        </div>
      )}

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
