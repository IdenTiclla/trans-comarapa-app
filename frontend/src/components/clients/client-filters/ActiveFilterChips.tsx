import { Button } from '@/components/ui/button'
import { X } from 'lucide-react'
import { describeDateFilter, getStatusText } from './helpers'
import type { Filters } from './types'

interface Props {
  filters: Filters
  onClearKey: (k: keyof Filters) => void
  onClearDates: () => void
}

interface ChipProps {
  label: string
  onClear: () => void
  ariaLabel: string
}

function Chip({ label, onClear, ariaLabel }: ChipProps) {
  return (
    <div className="bg-blue-50 text-blue-700 text-xs rounded-full px-3 py-1.5 flex items-center shadow-sm border border-blue-100">
      {label}
      <Button
        variant="ghost"
        size="icon"
        onClick={onClear}
        aria-label={ariaLabel}
        className="ml-1 h-4 w-4 text-blue-500 hover:text-blue-700 hover:bg-transparent p-0"
      >
        <X className="h-3 w-3" />
      </Button>
    </div>
  )
}

export function ActiveFilterChips({ filters, onClearKey, onClearDates }: Props) {
  const hasDateFilter = Boolean(filters.dateFrom || filters.dateTo)

  return (
    <div className="flex flex-wrap gap-2 max-w-full overflow-x-auto pb-1">
      {filters.city && (
        <Chip
          label={`Ciudad: ${filters.city}`}
          onClear={() => onClearKey('city')}
          ariaLabel="Quitar filtro de ciudad"
        />
      )}
      {filters.is_minor !== '' && (
        <Chip
          label={`Tipo: ${filters.is_minor === 'true' ? 'Menores' : 'Adultos'}`}
          onClear={() => onClearKey('is_minor')}
          ariaLabel="Quitar filtro de tipo de cliente"
        />
      )}
      {filters.status !== 'active' && (
        <Chip
          label={`Estado: ${getStatusText(filters.status)}`}
          onClear={() => onClearKey('status')}
          ariaLabel="Quitar filtro de estado"
        />
      )}
      {hasDateFilter && (
        <Chip
          label={`Fecha: ${describeDateFilter(filters.dateFrom, filters.dateTo)}`}
          onClear={onClearDates}
          ariaLabel="Quitar filtro de fechas"
        />
      )}
    </div>
  )
}
