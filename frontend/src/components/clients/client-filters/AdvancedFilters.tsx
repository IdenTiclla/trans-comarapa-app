import { SlidersHorizontal } from 'lucide-react'
import FormInput from '@/components/forms/FormInput'
import FormSelect from '@/components/forms/FormSelect'
import type { Filters } from './types'

interface Props {
  filters: Filters
  sortBy: string
  sortDirection: string
  onChange: (key: keyof Filters, value: string) => void
  onSortChange: (col: string, dir: string) => void
}

export function AdvancedFilters({ filters, sortBy, sortDirection, onChange, onSortChange }: Props) {
  return (
    <div className="border-t border-gray-200 pt-5 mt-5">
      <h4 className="text-sm font-semibold text-gray-800 mb-4 flex items-center">
        <SlidersHorizontal className="h-4 w-4 mr-1 text-blue-500" />
        Filtros avanzados
      </h4>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <span className="block text-sm font-medium text-gray-700 mb-1">Fecha de registro</span>
          <div className="grid grid-cols-2 gap-3">
            <FormInput
              label="Desde"
              type="date"
              value={filters.dateFrom}
              onChange={(e) => onChange('dateFrom', e.target.value)}
              className="py-2 bg-gray-50 shadow-sm focus:bg-white"
            />
            <FormInput
              label="Hasta"
              type="date"
              value={filters.dateTo}
              onChange={(e) => onChange('dateTo', e.target.value)}
              className="py-2 bg-gray-50 shadow-sm focus:bg-white"
            />
          </div>
        </div>

        <div>
          <span className="block text-sm font-medium text-gray-700 mb-1">Ordenar por</span>
          <div className="grid grid-cols-2 gap-3">
            <FormSelect
              value={sortBy}
              onChange={(val) => onSortChange(val, sortDirection)}
              options={[
                { label: 'Fecha de registro', value: 'created_at' },
                { label: 'Nombre', value: 'name' },
                { label: 'Documento', value: 'document_id' },
                { label: 'Ciudad', value: 'city' },
              ]}
              className="py-2.5 bg-gray-50 shadow-sm focus:bg-white"
            />
            <FormSelect
              value={sortDirection}
              onChange={(val) => onSortChange(sortBy, val)}
              options={[
                { label: 'Descendente', value: 'desc' },
                { label: 'Ascendente', value: 'asc' },
              ]}
              className="py-2.5 bg-gray-50 shadow-sm focus:bg-white"
            />
          </div>
        </div>
      </div>
    </div>
  )
}
