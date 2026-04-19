import { ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { MyTrip, TripTab } from './types'
import { STATUS_LABELS, STATUS_COLORS, TRANSITION_CONFIG } from './constants'
import { TripPassengersTable } from './TripPassengersTable'
import { TripPackagesTable } from './TripPackagesTable'
import { BoardingChecklist } from './BoardingChecklist'

interface Props {
  trip: MyTrip
  expanded: boolean
  onToggle: () => void
  formatTime: (d: string) => string
  showDate?: boolean
  formatDate?: (d: string) => string
  tab: TripTab
  onTabChange: (t: TripTab) => void
  onTransition: (tripId: number, action: string, label: string) => void
  transitioning: number | null
}

export function TripCard({
  trip,
  expanded,
  onToggle,
  formatTime,
  showDate,
  formatDate,
  tab,
  onTabChange,
  onTransition,
  transitioning,
}: Props) {
  const transition = TRANSITION_CONFIG[trip.status]
  const packages = trip.packages ?? []

  function handleTransitionClick(e: React.MouseEvent) {
    e.stopPropagation()
    if (!transition) return
    if (transition.confirm && !window.confirm(`¿Confirmar "${transition.label}"?`)) return
    onTransition(trip.id, transition.action, transition.label)
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <Button
        variant="ghost"
        onClick={onToggle}
        aria-expanded={expanded}
        aria-label={`Detalles del viaje ${trip.route.origin} a ${trip.route.destination}`}
        className="h-auto w-full justify-start rounded-none px-4 py-4 text-left hover:bg-gray-50 whitespace-normal"
      >
        <div className="flex w-full items-center justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-1">
              <span className="text-lg font-semibold text-gray-900">
                {trip.route.origin} → {trip.route.destination}
              </span>
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[trip.status] || 'bg-gray-100 text-gray-800'}`}>
                {STATUS_LABELS[trip.status] || trip.status}
              </span>
            </div>
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <span>{showDate && formatDate ? formatDate(trip.trip_datetime) + ' · ' : ''}{formatTime(trip.trip_datetime)}</span>
              {trip.bus && <span>{trip.bus.brand} {trip.bus.model} · {trip.bus.license_plate}</span>}
            </div>
          </div>
          <div className="flex items-center gap-4 ml-4">
            <div className="text-right">
              <div className="text-sm font-medium text-gray-900">{trip.occupied_seats}/{trip.total_seats}</div>
              <div className="text-xs text-gray-500">pasajeros</div>
            </div>
            <div className="text-right">
              <div className="text-sm font-medium text-gray-900">{trip.package_count}</div>
              <div className="text-xs text-gray-500">encomiendas</div>
            </div>
            <svg className={`h-5 w-5 text-gray-400 transition-transform ${expanded ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </Button>

      {transition && (
        <div className="px-4 pb-4">
          <Button
            onClick={handleTransitionClick}
            disabled={transitioning === trip.id}
            className={cn('w-full h-11 rounded-xl text-sm font-bold shadow-lg transition-all duration-300 active:scale-[0.98]', transition.color)}
          >
            {transitioning === trip.id ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Actualizando...</span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <span>{transition.label}</span>
                <ChevronRight className="h-4 w-4" />
              </div>
            )}
          </Button>
        </div>
      )}

      {expanded && (
        <div className="border-t border-gray-100">
          <div className="flex border-b border-gray-100" role="tablist">
            {(['passengers', 'packages', 'checklist'] as TripTab[]).map(key => {
              const labels: Record<TripTab, string> = { passengers: 'Pasajeros', packages: 'Encomiendas', checklist: 'Verificación' }
              const active = tab === key
              return (
                <Button
                  key={key}
                  type="button"
                  variant="ghost"
                  role="tab"
                  aria-selected={active}
                  onClick={() => onTabChange(key)}
                  className={cn(
                    'flex-1 rounded-none px-4 py-2 text-sm font-medium transition-colors',
                    active ? 'text-primary border-b-2 border-primary hover:text-primary' : 'text-gray-500 hover:text-gray-700',
                  )}
                >
                  {labels[key]}
                </Button>
              )
            })}
          </div>

          <div className="px-4 py-4">
            {tab === 'passengers' && <TripPassengersTable passengers={trip.passengers} />}
            {tab === 'packages' && <TripPackagesTable packages={packages} />}
            {tab === 'checklist' && <BoardingChecklist tripId={trip.id} passengers={trip.passengers} />}
          </div>
        </div>
      )}
    </div>
  )
}
