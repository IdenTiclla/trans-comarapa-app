import { useReportsPage } from '@/hooks/use-reports-page'
import { ReportsHeader } from './reports/ReportsHeader'
import { ReportTabs } from './reports/ReportTabs'
import { TicketReport } from './reports/TicketReport'
import { PackageReport } from './reports/PackageReport'
import { CashReport } from './reports/CashReport'

export function Component() {
  const {
    isAdmin, year, setYear, month, setMonth,
    officeId, setOfficeId, offices, tab, setTab,
    data, loading, handleDownload, years,
  } = useReportsPage()

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
