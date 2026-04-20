import { Button } from '@/components/ui/button'
import { Clock, Eye, EyeOff, Plus, Trash2 } from 'lucide-react'
import FormInput from '@/components/forms/FormInput'
import { cn } from '@/lib/utils'
import { formatTime } from './helpers'
import type { Schedule } from './types'

interface Props {
  newScheduleTime: string
  setNewScheduleTime: (v: string) => void
  scheduleError: string
  sortedLocalSchedules: Schedule[]
  onAdd: () => void
  onToggle: (index: number) => void
  onRemove: (index: number) => void
}

export function ScheduleEditor({
  newScheduleTime, setNewScheduleTime, scheduleError, sortedLocalSchedules,
  onAdd, onToggle, onRemove,
}: Props) {
  return (
    <div className="border-t border-gray-100 pt-5">
      <div className="flex items-center gap-2 mb-4">
        <Clock className="w-4 h-4 text-primary" />
        <span className="text-xs font-black text-gray-400 uppercase tracking-widest">
          Horarios de Salida
        </span>
      </div>

      <div className="flex gap-2 items-end mb-4">
        <div className="flex-1">
          <FormInput
            type="time"
            label=""
            value={newScheduleTime}
            onChange={(e) => setNewScheduleTime(e.target.value)}
            placeholder="HH:MM"
            className="h-12"
          />
        </div>
        <Button
          type="button"
          onClick={onAdd}
          disabled={!newScheduleTime}
          aria-label="Añadir horario"
          className="h-12 rounded-xl font-bold px-4"
        >
          <Plus className="h-4 w-4 mr-1" />
          Añadir
        </Button>
      </div>

      {scheduleError && (
        <p className="mb-3 text-xs font-bold text-red-500 bg-red-50 p-2 rounded-lg border border-red-100">
          {scheduleError}
        </p>
      )}

      {sortedLocalSchedules.length === 0 ? (
        <div className="text-center py-6 bg-gray-50/50 rounded-2xl border border-dashed border-gray-200">
          <Clock className="mx-auto h-8 w-8 text-gray-300 mb-2" />
          <p className="text-xs font-bold text-gray-400 tracking-wider uppercase">Sin horarios configurados</p>
        </div>
      ) : (
        <div className="space-y-2 max-h-40 overflow-y-auto">
          {sortedLocalSchedules.map((schedule, index) => (
            <div
              key={schedule._localId || schedule.id}
              className={cn(
                'flex items-center justify-between p-2 rounded-lg border',
                schedule.is_active ? 'border-gray-200 bg-white' : 'border-gray-100 bg-muted/50',
              )}
            >
              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    'inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-semibold',
                    schedule.is_active ? 'bg-primary/10 text-primary' : 'bg-gray-200 text-gray-500',
                  )}
                >
                  <Clock className="w-3.5 h-3.5 mr-1" />
                  {formatTime(schedule.departure_time)}
                </span>
                {!schedule.is_active && <span className="text-xs text-gray-400">Inactivo</span>}
              </div>

              <div className="flex items-center gap-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => onToggle(index)}
                  aria-label={schedule.is_active ? 'Desactivar horario' : 'Activar horario'}
                  className="h-7 w-7"
                >
                  {schedule.is_active
                    ? <Eye className="h-4 w-4 text-green-600" />
                    : <EyeOff className="h-4 w-4 text-gray-400" />}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => onRemove(index)}
                  aria-label="Eliminar horario"
                  className="h-7 w-7 text-red-600 hover:text-red-900 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
