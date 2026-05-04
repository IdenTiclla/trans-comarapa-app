import { useEffect, useState, useCallback } from 'react'
import { financialService } from '@/services/financial.service'
import type { WithdrawalRecord } from '@/services/financial.service'
import { API_BASE_URL } from '@/lib/constants'

export function useWithdrawalHistory() {
  const [withdrawals, setWithdrawals] = useState<WithdrawalRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')

  const fetchWithdrawals = useCallback(async () => {
    setLoading(true)
    try {
      const data = await financialService.getWithdrawals(
        undefined,
        dateFrom || undefined,
        dateTo || undefined,
      )
      setWithdrawals(data)
    } catch {
      setWithdrawals([])
    } finally {
      setLoading(false)
    }
  }, [dateFrom, dateTo])

  useEffect(() => {
    fetchWithdrawals()
  }, [fetchWithdrawals])

  const handleExport = () => {
    const params = new URLSearchParams()
    if (dateFrom) params.append('date_from', dateFrom)
    if (dateTo) params.append('date_to', dateTo)
    const qs = params.toString()
    window.open(
      `${API_BASE_URL}/financial/withdrawals/csv${qs ? `?${qs}` : ''}`,
      '_blank',
    )
  }

  const totalAmount = withdrawals.reduce((sum, w) => sum + w.amount, 0)

  return {
    withdrawals,
    loading,
    dateFrom,
    setDateFrom,
    dateTo,
    setDateTo,
    fetchWithdrawals,
    handleExport,
    totalAmount,
  }
}
