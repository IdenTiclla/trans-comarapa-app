import FormSelect from '@/components/forms/FormSelect'
import { CITIES, type Filters } from './types'

interface Props {
  filters: Filters
  onChange: (key: keyof Filters, value: string) => void
  onClear: (key: keyof Filters) => void
}

export function BasicFilters({ filters, onChange, onClear }: Props) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-1">
      <FormSelect
        label="Ciudad"
        value={filters.city}
        onChange={(val) => onChange('city', val)}
        options={[{ label: 'Todas', value: '' }, ...CITIES.map((c) => ({ label: c, value: c }))]}
        clearable
        onClear={() => onClear('city')}
        className="py-2.5 bg-gray-50 shadow-sm focus:bg-white"
      />
      <FormSelect
        label="Tipo de Cliente"
        value={filters.is_minor}
        onChange={(val) => onChange('is_minor', val)}
        options={[
          { label: 'Todos', value: '' },
          { label: 'Adultos', value: 'false' },
          { label: 'Menores de edad', value: 'true' },
        ]}
        clearable
        onClear={() => onClear('is_minor')}
        className="py-2.5 bg-gray-50 shadow-sm focus:bg-white"
      />
      <FormSelect
        label="Estado"
        value={filters.status}
        onChange={(val) => onChange('status', val)}
        options={[
          { label: 'Activos', value: 'active' },
          { label: 'Todos', value: 'all' },
          { label: 'Inactivos', value: 'inactive' },
        ]}
        clearable
        onClear={() => onClear('status')}
        className="py-2.5 bg-gray-50 shadow-sm focus:bg-white"
      />
    </div>
  )
}
