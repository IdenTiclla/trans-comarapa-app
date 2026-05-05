import { Check, X, Ticket } from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatDateTime } from '@/pages/tickets/ticket-detail/helpers'
import { getTicketStatusNumber, makeGetTicketHistoryDate } from './helpers'

interface Step {
  num: number
  label: string
  historyKey: string
  icon: 'check' | 'ticket' | 'x'
}

const STEPS: Step[] = [
  { num: 1, label: 'Pendiente', historyKey: 'pending', icon: 'ticket' },
  { num: 2, label: 'Confirmado', historyKey: 'confirmed', icon: 'check' },
  { num: 3, label: 'Completado', historyKey: 'completed', icon: 'check' },
]

interface Props {
  ticket: Record<string, unknown>
}

export function TicketJourneyProgress({ ticket }: Props) {
  const state = ticket.state as string | undefined
  const isCancelled = state === 'cancelled'
  const statusNum = getTicketStatusNumber(state)
  const getHistoryDate = makeGetTicketHistoryDate(ticket)
  const createdAt = ticket.created_at as string | null | undefined

  if (isCancelled) {
    const cancelDate = getHistoryDate('cancelled')
    return (
      <div className="bg-white rounded-xl shadow-sm border-l-4 border-l-rose-500 border-y border-r border-y-gray-100 border-r-gray-100 p-8">
        <h2 className="text-sm font-bold tracking-widest text-gray-800 uppercase mb-10">Progreso del Boleto</h2>
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-rose-500 text-white flex items-center justify-center shadow-sm">
            <X className="w-5 h-5" strokeWidth={3} />
          </div>
          <div>
            <span className="text-sm font-bold uppercase text-rose-600">Cancelado</span>
            <span className="block text-[10px] text-gray-500 mt-0.5">{formatDateTime(cancelDate)}</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border-l-4 border-l-[#16499B] border-y border-r border-y-gray-100 border-r-gray-100 p-8">
      <h2 className="text-sm font-bold tracking-widest text-gray-800 uppercase mb-10">Progreso del Boleto</h2>

      <div className="relative flex justify-between items-start max-w-3xl mx-auto px-4">
        <div className="absolute top-4 left-10 right-10 h-[2px] bg-gray-200 -z-10" />
        <div
          className="absolute top-4 left-10 h-[2px] bg-[#16499B] -z-10 transition-all duration-500"
          style={{ width: `calc(${statusNum > 1 ? (statusNum - 1) * 50 : 0}% - 20px)` }}
        />

        {STEPS.map((step) => {
          const active = statusNum >= step.num
          const dateSource = step.historyKey === 'pending'
            ? getHistoryDate(step.historyKey) || createdAt
            : getHistoryDate(step.historyKey)
          const Icon = step.icon === 'ticket' ? Ticket : Check

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
