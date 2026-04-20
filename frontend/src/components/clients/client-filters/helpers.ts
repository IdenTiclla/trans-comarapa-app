import type { Filters } from './types'

export const formatDate = (dateStr?: string) => {
  if (!dateStr) return ''
  try {
    return new Intl.DateTimeFormat('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' })
      .format(new Date(dateStr))
  } catch { return '' }
}

export const getStatusText = (status?: string) => {
  if (status === 'active') return 'Activos'
  if (status === 'all') return 'Todos'
  if (status === 'inactive') return 'Inactivos'
  return 'Desconocido'
}

export const cleanFilters = (filters: Filters): Filters => {
  const out = { ...filters }
  ;(Object.keys(out) as Array<keyof Filters>).forEach((k) => {
    if (k !== 'is_minor' && !out[k]) delete out[k]
  })
  return out
}

export const countActive = (filters: Filters) => {
  let count = 0
  if (filters.search) count++
  if (filters.city) count++
  if (filters.is_minor !== '') count++
  if (filters.status !== 'active') count++
  if (filters.dateFrom || filters.dateTo) count++
  return count
}

export const describeDateFilter = (dateFrom?: string, dateTo?: string) => {
  if (dateFrom && dateTo) return `${formatDate(dateFrom)} - ${formatDate(dateTo)}`
  if (dateFrom) return `Desde ${formatDate(dateFrom)}`
  if (dateTo) return `Hasta ${formatDate(dateTo)}`
  return ''
}
