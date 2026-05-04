import { useCallback, useEffect, useState } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { reportService, type ReportParams } from '@/services/report.service'
import { officeService } from '@/services/office.service'
import type { Office, Tab } from '@/pages/admin/reports/constants'

export function useReportsPage() {
  const { user } = useAuth()
  const isAdmin = user?.role === 'admin'

  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth() + 1)
  const [officeId, setOfficeId] = useState<number | undefined>(undefined)
  const [offices, setOffices] = useState<Office[]>([])
  const [tab, setTab] = useState<Tab>('tickets')
  const [data, setData] = useState<Record<string, unknown> | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isAdmin) {
      officeService
        .getAll()
        .then((o: Office[]) => setOffices(o))
        .catch(() => {})
    }
  }, [isAdmin])

  const loadReport = useCallback(async () => {
    const params: ReportParams = { year, month, office_id: officeId }
    setLoading(true)
    try {
      let result
      if (tab === 'tickets') result = await reportService.monthlyTickets(params)
      else if (tab === 'packages')
        result = await reportService.monthlyPackages(params)
      else result = await reportService.monthlyCash(params)
      setData(result)
    } catch {
      setData(null)
    } finally {
      setLoading(false)
    }
  }, [tab, year, month, officeId])

  useEffect(() => {
    loadReport()
  }, [loadReport])

  const handleDownload = () => {
    reportService.downloadCsv(tab, { year, month, office_id: officeId })
  }

  const years = Array.from({ length: 5 }, (_, i) => now.getFullYear() - i)

  return {
    isAdmin,
    year,
    setYear,
    month,
    setMonth,
    officeId,
    setOfficeId,
    offices,
    tab,
    setTab,
    data,
    loading,
    handleDownload,
    years,
  }
}
