import { useEffect, useRef, useState } from 'react'
import { useAppDispatch, useAppSelector } from '@/store'
import {
  fetchDashboardStats,
  selectTicketStats,
  selectPackageStats,
  selectTripStats,
  selectSalesSummary,
  selectStatsLoading,
  selectStatsError,
} from '@/store/stats.slice'
import { financialService } from '@/services/financial.service'
import type { CashSummaryResponse } from '@/services/financial.service'

export function useAdminDashboard() {
  const dispatch = useAppDispatch()
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const ticketStats = useAppSelector(selectTicketStats)
  const packageStats = useAppSelector(selectPackageStats)
  const tripStats = useAppSelector(selectTripStats)
  const salesSummary = useAppSelector(selectSalesSummary)
  const isLoading = useAppSelector(selectStatsLoading)
  const error = useAppSelector(selectStatsError)

  const [cashSummary, setCashSummary] = useState<CashSummaryResponse | null>(
    null,
  )

  useEffect(() => {
    dispatch(fetchDashboardStats('today'))
    intervalRef.current = setInterval(
      () => dispatch(fetchDashboardStats('today')),
      5 * 60 * 1000,
    )
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [dispatch])

  useEffect(() => {
    financialService.getCashSummary().then(setCashSummary).catch(() => {})
  }, [])

  const refresh = () => dispatch(fetchDashboardStats('today'))

  return {
    ticketStats,
    packageStats,
    tripStats,
    salesSummary,
    isLoading,
    error,
    cashSummary,
    refresh,
  }
}
