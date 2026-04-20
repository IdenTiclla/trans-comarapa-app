import { useCallback, useEffect, useState } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { reportService, type ReportParams } from '@/services/report.service'
import { officeService } from '@/services/office.service'
import { ReportsHeader } from './reports/ReportsHeader'
import { ReportTabs } from './reports/ReportTabs'
import { TicketReport } from './reports/TicketReport'
import { PackageReport } from './reports/PackageReport'
import { CashReport } from './reports/CashReport'
import type { Office, Tab } from './reports/constants'

export function Component() {
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
      officeService.getAll().then((o: Office[]) => setOffices(o)).catch(() => {})
    }
  }, [isAdmin])

  const loadReport = useCallback(async () => {
    const params: ReportParams = { year, month, office_id: officeId }
    setLoading(true)
    try {
      let result
      if (tab === 'tickets') result = await reportService.monthlyTickets(params)
      else if (tab === 'packages') result = await reportService.monthlyPackages(params)
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-slate-100 w-full">
      <ReportsHeader
        year={year}
        month={month}
        officeId={officeId}
        offices={offices}
        years={years}
        isAdmin={isAdmin}
        onYearChange={setYear}
        onMonthChange={setMonth}
        onOfficeChange={setOfficeId}
        onDownload={handleDownload}
      />

      <div className="w-full px-2 sm:px-4 lg:px-6 py-6 space-y-6">
        <ReportTabs tab={tab} onChange={setTab} />

        {loading ? (
          <div className="flex justify-center py-16">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600" />
          </div>
        ) : !data ? (
          <div className="bg-white rounded-xl shadow-sm p-8 text-center text-gray-500">
            No se pudieron cargar los datos del reporte.
          </div>
        ) : (
          <>
            {tab === 'tickets' && <TicketReport data={data} />}
            {tab === 'packages' && <PackageReport data={data} />}
            {tab === 'cash' && <CashReport data={data} />}
          </>
        )}
      </div>
    </div>
  )
}
