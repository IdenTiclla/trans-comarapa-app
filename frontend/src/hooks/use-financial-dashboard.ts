import { useEffect, useState, useCallback } from 'react'
import { financialService } from '@/services/financial.service'
import type {
  OfficeFinancialSummary,
  FinancialTotals,
  OfficeCollection,
} from '@/services/financial.service'

export function useFinancialDashboard() {
  const [offices, setOffices] = useState<OfficeFinancialSummary[]>([])
  const [totals, setTotals] = useState<FinancialTotals | null>(null)
  const [collections, setCollections] = useState<OfficeCollection[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split('T')[0],
  )

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const [summaryResponse, collectionsData] = await Promise.all([
        financialService.getOfficesSummary(selectedDate),
        financialService.getCollectionsByOffice(selectedDate),
      ])
      setOffices(summaryResponse.offices)
      setTotals(summaryResponse.totals)
      setCollections(collectionsData)
    } catch {
      setOffices([])
      setTotals(null)
      setCollections([])
    } finally {
      setLoading(false)
    }
  }, [selectedDate])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return { offices, totals, collections, loading, selectedDate, setSelectedDate }
}
