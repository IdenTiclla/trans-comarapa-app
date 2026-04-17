import { apiFetch } from '@/lib/api'

const BASE = '/reports'

export interface ReportParams {
  year: number
  month: number
  office_id?: number
}

function buildQuery(params: ReportParams): string {
  const q = new URLSearchParams()
  q.set('year', String(params.year))
  q.set('month', String(params.month))
  if (params.office_id) q.set('office_id', String(params.office_id))
  return q.toString()
}

export const reportService = {
  monthlyTickets(params: ReportParams) {
    return apiFetch(`${BASE}/monthly/tickets?${buildQuery(params)}`)
  },

  monthlyPackages(params: ReportParams) {
    return apiFetch(`${BASE}/monthly/packages?${buildQuery(params)}`)
  },

  monthlyCash(params: ReportParams) {
    return apiFetch(`${BASE}/monthly/cash?${buildQuery(params)}`)
  },

  downloadCsv(type: 'tickets' | 'packages' | 'cash', params: ReportParams) {
    const url = `/api/v1${BASE}/monthly/${type}/csv?${buildQuery(params)}`
    window.open(url, '_blank')
  },
}
