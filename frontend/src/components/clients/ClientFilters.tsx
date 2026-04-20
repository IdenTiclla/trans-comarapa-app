import { useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Check, Search, X } from 'lucide-react'
import FormInput from '@/components/forms/FormInput'
import { useClientFilters } from './client-filters/use-client-filters'
import { FiltersHeader } from './client-filters/FiltersHeader'
import { BasicFilters } from './client-filters/BasicFilters'
import { AdvancedFilters } from './client-filters/AdvancedFilters'
import { ActiveFilterChips } from './client-filters/ActiveFilterChips'
import { countActive } from './client-filters/helpers'
import type { ClientFiltersProps } from './client-filters/types'

export default function ClientFilters({ initialFilters = {}, onFilterChange, onSortChange }: ClientFiltersProps) {
  const s = useClientFilters({ initialFilters, onFilterChange, onSortChange })
  const activeFiltersCount = useMemo(() => countActive(s.filters), [s.filters])

  return (
    <div className="bg-white shadow-lg rounded-xl p-6 mb-6 border border-gray-100 transition-all duration-300 hover:shadow-xl">
      <FiltersHeader
        activeFiltersCount={activeFiltersCount}
        autoApply={s.autoApply}
        setAutoApply={s.setAutoApply}
        showAdvancedFilters={s.showAdvancedFilters}
        setShowAdvancedFilters={s.setShowAdvancedFilters}
      />

      <div className="mb-1">
        <FormInput
          value={s.filters.search}
          onChange={(e) => s.handleFilterChange('search', e.target.value)}
          placeholder="Buscar cliente por nombre, CI o teléfono..."
          className="py-3 bg-gray-50 shadow-sm transition-colors duration-200 focus:bg-white"
          leftIcon={<Search className="h-5 w-5 text-blue-500" />}
        />
      </div>

      <BasicFilters
        filters={s.filters}
        onChange={s.handleFilterChange}
        onClear={s.clearFilter}
      />

      {s.showAdvancedFilters && (
        <AdvancedFilters
          filters={s.filters}
          sortBy={s.sortBy}
          sortDirection={s.sortDirection}
          onChange={s.handleFilterChange}
          onSortChange={s.handleSortChange}
        />
      )}

      <div className="mt-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center w-full sm:w-auto">
          {activeFiltersCount > 0 && (
            <ActiveFilterChips
              filters={s.filters}
              onClearKey={s.clearFilter}
              onClearDates={s.clearDateFilters}
            />
          )}
        </div>
        <div className="flex space-x-3 w-full sm:w-auto justify-end">
          <Button
            variant="outline"
            onClick={s.resetFilters}
            aria-label="Limpiar todos los filtros"
            className="py-2.5 px-5"
          >
            <X className="h-4 w-4 mr-1.5" />
            Limpiar filtros
          </Button>
          {!s.autoApply && (
            <Button
              onClick={s.applyFilters}
              aria-label="Aplicar filtros"
              className="py-2.5 px-5 bg-blue-600 hover:bg-blue-700"
            >
              <Check className="h-4 w-4 mr-1.5" />
              Aplicar filtros
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
