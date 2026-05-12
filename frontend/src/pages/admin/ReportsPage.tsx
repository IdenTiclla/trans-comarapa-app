import { useReportsPage } from '@/hooks/use-reports-page'
import { useDocumentTitle } from '@/hooks/use-document-title'
import { ReportsHeader } from './reports/ReportsHeader'
import { ReportTabs } from './reports/ReportTabs'
import { TicketReport } from './reports/TicketReport'
import { PackageReport } from './reports/PackageReport'
import { CashReport } from './reports/CashReport'

export function Component() {
  useDocumentTitle('Reportes')
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
          <div role="status" aria-live="polite" className="flex justify-center py-16">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600" aria-hidden="true" />
            <span className="sr-only">Cargando reportes...</span>
          </div>
        ) : !data ? (
          <div className="bg-white rounded-xl shadow-sm p-8 text-center text-gray-500">
            No se pudieron cargar los datos del reporte.
          </div>
        ) : (
          <>
            {tab === 'tickets' && <div role="tabpanel" id="report-panel-tickets" aria-labelledby="report-tab-tickets"><TicketReport data={data} /></div>}
            {tab === 'packages' && <div role="tabpanel" id="report-panel-packages" aria-labelledby="report-tab-packages"><PackageReport data={data} /></div>}
            {tab === 'cash' && <div role="tabpanel" id="report-panel-cash" aria-labelledby="report-tab-cash"><CashReport data={data} /></div>}
          </>
        )}
      </div>
    </div>
  )
}
