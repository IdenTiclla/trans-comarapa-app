import { useState, useCallback } from 'react'
import { CheckCircle2 } from 'lucide-react'
import FormCheckbox from '@/components/forms/FormCheckbox'
import { cn } from '@/lib/utils'
import type { Passenger } from './types'

interface Props {
  tripId: number
  passengers: Passenger[]
}

export function BoardingChecklist({ tripId, passengers }: Props) {
  const storageKey = `boarding-checklist-${tripId}`

  const [checked, setChecked] = useState<Set<number>>(() => {
    try {
      const stored = localStorage.getItem(storageKey)
      return stored ? new Set(JSON.parse(stored)) : new Set()
    } catch {
      return new Set()
    }
  })

  const toggleCheck = useCallback((ticketId: number) => {
    setChecked(prev => {
      const next = new Set(prev)
      if (next.has(ticketId)) next.delete(ticketId)
      else next.add(ticketId)
      localStorage.setItem(storageKey, JSON.stringify([...next]))
      return next
    })
  }, [storageKey])

  if (passengers.length === 0) {
    return <p className="text-sm text-gray-500 italic">Sin pasajeros para verificar.</p>
  }

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center mb-3">
        <span className="text-sm text-gray-600">
          {checked.size} de {passengers.length} verificados
        </span>
        <div className="w-32 bg-gray-200 rounded-full h-2">
          <div
            className="bg-primary h-2 rounded-full transition-all"
            style={{ width: `${passengers.length > 0 ? (checked.size / passengers.length) * 100 : 0}%` }}
          />
        </div>
      </div>
      {passengers.map(p => (
        <div
          key={p.ticket_id}
          onClick={() => toggleCheck(p.ticket_id)}
          className={cn(
            'flex items-center gap-4 p-4 rounded-2xl border cursor-pointer transition-all duration-300',
            checked.has(p.ticket_id)
              ? 'bg-primary/5 border-primary/20 shadow-sm'
              : 'bg-white border-gray-100 hover:bg-gray-50 hover:border-gray-200',
          )}
        >
          <FormCheckbox
            checked={checked.has(p.ticket_id)}
            onChange={() => toggleCheck(p.ticket_id)}
            label=""
            id={`check-${p.ticket_id}`}
          />
          <div className="flex flex-1 items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={cn(
                'w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm',
                checked.has(p.ticket_id) ? 'bg-primary/10 text-primary' : 'bg-gray-100 text-gray-500',
              )}>
                #{p.seat_number}
              </div>
              <span className={cn(
                'font-bold transition-all duration-300',
                checked.has(p.ticket_id) ? 'text-gray-400 line-through' : 'text-gray-900',
              )}>
                {p.client_name}
              </span>
            </div>
            {checked.has(p.ticket_id) && (
              <CheckCircle2 className="h-5 w-5 text-primary animate-in zoom-in duration-300" />
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
