import { apiFetch } from '@/lib/api'

export interface OfficeFinancialSummary {
  office_id: number
  office_name: string
  status: 'open' | 'closed' | 'no_register'
  initial_balance: number
  total_in: number
  total_out: number
  available_cash: number
}

export interface FinancialTotals {
  total_in: number
  total_out: number
  total_available: number
}

export interface OfficesSummaryResponse {
  offices: OfficeFinancialSummary[]
  totals: FinancialTotals
}

export interface WithdrawalRecord {
  id: number
  date: string
  office_id: number
  office_name: string
  amount: number
  description: string | null
  registered_by: string
  created_at: string
}

export interface CashSummaryResponse {
  total_income_today: number
  total_withdrawals_today: number
  registers_open: number
  total_available: number
}

export interface OfficeCollection {
  office_id: number
  office_name: string
  total_collected: number
  transactions_count: number
}

export const financialService = {
  getOfficesSummary: (targetDate?: string): Promise<OfficesSummaryResponse> => {
    const params = targetDate ? { target_date: targetDate } : {}
    return apiFetch('/financial/offices-summary', { params })
  },

  getWithdrawals: (
    officeId?: number,
    dateFrom?: string,
    dateTo?: string
  ): Promise<WithdrawalRecord[]> => {
    const params: Record<string, unknown> = {}
    if (officeId) params.office_id = officeId
    if (dateFrom) params.date_from = dateFrom
    if (dateTo) params.date_to = dateTo
    return apiFetch('/financial/withdrawals', { params })
  },

  getWithdrawalsCsvUrl: (
    officeId?: number,
    dateFrom?: string,
    dateTo?: string
  ): string => {
    const params = new URLSearchParams()
    if (officeId) params.append('office_id', String(officeId))
    if (dateFrom) params.append('date_from', dateFrom)
    if (dateTo) params.append('date_to', dateTo)
    const qs = params.toString()
    return `/api/v1/financial/withdrawals/csv${qs ? `?${qs}` : ''}`
  },

  getCashSummary: (): Promise<CashSummaryResponse> => {
    return apiFetch('/stats/cash-summary')
  },

  getCollectionsByOffice: (targetDate?: string): Promise<OfficeCollection[]> => {
    const params = targetDate ? { target_date: targetDate } : {}
    return apiFetch('/financial/collections-by-office', { params })
  },
}
