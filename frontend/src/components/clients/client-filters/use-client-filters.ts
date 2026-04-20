import { useEffect, useRef, useState } from 'react'
import { cleanFilters } from './helpers'
import type { Filters } from './types'

interface Args {
  initialFilters: Filters
  onFilterChange: (f: Filters) => void
  onSortChange: (s: { column: string; direction: string }) => void
}

export function useClientFilters({ initialFilters, onFilterChange, onSortChange }: Args) {
  const [filters, setFilters] = useState<Filters>({
    search: initialFilters.search || '',
    city: initialFilters.city || '',
    is_minor: initialFilters.is_minor || '',
    status: initialFilters.status || 'active',
    dateFrom: initialFilters.dateFrom || '',
    dateTo: initialFilters.dateTo || '',
  })
  const [sortBy, setSortBy] = useState(initialFilters.sortBy || 'created_at')
  const [sortDirection, setSortDirection] = useState(initialFilters.sortDirection || 'desc')
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false)
  const [autoApply, setAutoApply] = useState(true)

  const firstSearchRun = useRef(true)
  useEffect(() => {
    if (firstSearchRun.current) {
      firstSearchRun.current = false
      return
    }
    if (!autoApply) return
    const timer = setTimeout(() => onFilterChange(cleanFilters(filters)), 300)
    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.search])

  const applyFilters = () => onFilterChange(cleanFilters(filters))

  const handleFilterChange = (key: keyof Filters, value: string) => {
    setFilters((prev) => {
      const updated = { ...prev, [key]: value }
      if (autoApply) setTimeout(() => onFilterChange(cleanFilters(updated)), 0)
      return updated
    })
  }

  const handleSortChange = (col: string, dir: string) => {
    setSortBy(col)
    setSortDirection(dir)
    onSortChange({ column: col, direction: dir })
  }

  const clearFilter = (key: keyof Filters) => {
    handleFilterChange(key, key === 'status' ? 'active' : '')
  }

  const clearDateFilters = () => {
    setFilters((prev) => {
      const updated = { ...prev, dateFrom: '', dateTo: '' }
      if (autoApply) setTimeout(() => onFilterChange(cleanFilters(updated)), 0)
      return updated
    })
  }

  const resetFilters = () => {
    setFilters({ search: '', city: '', is_minor: '', status: 'active', dateFrom: '', dateTo: '' })
    setSortBy('created_at')
    setSortDirection('desc')
    onFilterChange({ status: 'active' })
    onSortChange({ column: 'created_at', direction: 'desc' })
  }

  return {
    filters, setFilters,
    sortBy, sortDirection,
    showAdvancedFilters, setShowAdvancedFilters,
    autoApply, setAutoApply,
    applyFilters,
    handleFilterChange,
    handleSortChange,
    clearFilter,
    clearDateFilters,
    resetFilters,
  }
}
