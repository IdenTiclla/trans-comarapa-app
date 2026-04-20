import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { ChevronDown } from 'lucide-react'
import FormCheckbox from '@/components/forms/FormCheckbox'

interface Props {
  activeFiltersCount: number
  autoApply: boolean
  setAutoApply: (v: boolean) => void
  showAdvancedFilters: boolean
  setShowAdvancedFilters: (v: boolean) => void
}

export function FiltersHeader({
  activeFiltersCount, autoApply, setAutoApply, showAdvancedFilters, setShowAdvancedFilters,
}: Props) {
  return (
    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-5 gap-3">
      <div className="flex items-center">
        <h3 className="text-lg font-semibold text-gray-800">Filtros</h3>
        {activeFiltersCount > 0 && (
          <div className="ml-2 px-3 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full shadow-sm">
            {activeFiltersCount} activo{activeFiltersCount !== 1 ? 's' : ''}
          </div>
        )}
      </div>
      <div className="flex items-center flex-wrap gap-3">
        <div className="flex items-center bg-gray-50 rounded-lg px-3 pt-3 pb-0 border border-gray-200 hover:bg-gray-100 transition-colors">
          <FormCheckbox
            checked={autoApply}
            onChange={(checked) => setAutoApply(checked)}
            label="Aplicar automáticamente"
          />
        </div>
        <Button
          variant="ghost"
          onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
          aria-expanded={showAdvancedFilters}
          aria-label={showAdvancedFilters ? 'Ocultar filtros avanzados' : 'Mostrar filtros avanzados'}
          className="text-sm font-medium text-blue-600 hover:text-blue-800 flex items-center bg-blue-50 hover:bg-blue-100 border border-blue-100 h-auto px-3 py-1.5 rounded-lg"
        >
          {showAdvancedFilters ? 'Ocultar filtros avanzados' : 'Mostrar filtros avanzados'}
          <ChevronDown className={cn('h-4 w-4 ml-1 transition-transform', showAdvancedFilters && 'rotate-180')} />
        </Button>
      </div>
    </div>
  )
}
