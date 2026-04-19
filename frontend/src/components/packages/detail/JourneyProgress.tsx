import { Check, Truck, Archive } from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatDateTime } from './helpers'

interface Step {
  num: number
  label: string
  historyKey: string
  icon: 'check' | 'truck' | 'archive'
}

const STEPS: Step[] = [
  { num: 1, label: 'Registrado', historyKey: 'registered_at_office', icon: 'check' },
  { num: 2, label: 'Asignado', historyKey: 'assigned_to_trip', icon: 'check' },
  { num: 3, label: 'En Tránsito', historyKey: 'in_transit', icon: 'truck' },
  { num: 4, label: 'En Agencia', historyKey: 'arrived_at_destination', icon: 'check' },
  { num: 5, label: 'Entregado', historyKey: 'delivered', icon: 'archive' },
]

interface Props {
  statusNum: number
  getHistoryDate: (stateName: string) => string | null
  createdAt?: string | null
}

export function JourneyProgress({ statusNum, getHistoryDate, createdAt }: Props) {
  return (
    <div className="bg-white rounded-xl shadow-sm border-l-4 border-l-[#16499B] border-y border-r border-y-gray-100 border-r-gray-100 p-8">
      <h2 className="text-sm font-bold tracking-widest text-gray-800 uppercase mb-10">Progreso del Viaje</h2>

      <div className="relative flex justify-between items-start max-w-5xl mx-auto px-4">
        <div className="absolute top-4 left-10 right-10 h-[2px] bg-gray-200 -z-10" />
        <div
          className="absolute top-4 left-10 h-[2px] bg-[#16499B] -z-10 transition-all duration-500"
          style={{ width: `calc(${statusNum > 1 ? (statusNum - 1) * 25 : 0}% - 20px)` }}
        />

        {STEPS.map((step) => {
          const active = statusNum >= step.num
          const dateSource = step.historyKey === 'registered_at_office'
            ? getHistoryDate(step.historyKey) || createdAt
            : getHistoryDate(step.historyKey)
          const Icon = step.icon === 'truck' ? Truck : step.icon === 'archive' ? Archive : Check

          return (
            <div key={step.num} className={cn('flex flex-col items-center transition-all', !active && 'opacity-50 grayscale')}>
              <div className={cn(
                'w-8 h-8 rounded-full flex items-center justify-center mb-3 transition-colors',
                active ? 'bg-[#16499B] text-white shadow-sm' : 'bg-[#F1F5F9] border-2 border-[#E2E8F0]',
              )}>
                {active ? <Icon className="w-4 h-4" strokeWidth={3} /> : <div className="w-2.5 h-2.5 rounded-full bg-gray-300" />}
              </div>
              <span className={cn('text-[11px] font-bold uppercase', active ? 'text-[#16499B]' : 'text-gray-400')}>{step.label}</span>
              {active && <span className="text-[10px] text-gray-500 mt-1">{formatDateTime(dateSource)}</span>}
            </div>
          )
        })}
      </div>
    </div>
  )
}
