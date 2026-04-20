export interface Filters {
  search?: string
  city?: string
  is_minor?: string
  status?: string
  dateFrom?: string
  dateTo?: string
  sortBy?: string
  sortDirection?: string
}

export interface ClientFiltersProps {
  initialFilters?: Filters
  onFilterChange: (filters: Filters) => void
  onSortChange: (sort: { column: string; direction: string }) => void
}

export const CITIES = [
  'Santa Cruz', 'Comarapa', 'Cochabamba', 'La Paz', 'Sucre',
  'Tarija', 'Oruro', 'Potosí', 'Trinidad', 'Cobija',
]
