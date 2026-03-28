import { useEffect, useState } from 'react'
import { financialService } from '@/services/financial.service'
import type { OfficeFinancialSummary, FinancialTotals, OfficeCollection } from '@/services/financial.service'
import { toast } from 'sonner'

function formatCurrency(value: number): string {
  return `Bs. ${value.toLocaleString('es-BO', { minimumFractionDigits: 2 })}`
}

function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { bg: string; text: string; label: string }> = {
    open: { bg: 'bg-green-100', text: 'text-green-800', label: 'Abierta' },
    closed: { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Cerrada' },
    no_register: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Sin caja' },
  }
  const c = config[status] ?? config.no_register
  return (
    <span className={`px-2 py-1 text-xs font-medium rounded-full ${c.bg} ${c.text}`}>
      {c.label}
    </span>
  )
}

export function Component() {
  const [offices, setOffices] = useState<OfficeFinancialSummary[]>([])
  const [totals, setTotals] = useState<FinancialTotals | null>(null)
  const [collections, setCollections] = useState<OfficeCollection[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split('T')[0]
  )

  const fetchData = async () => {
    setLoading(true)
    try {
      const [summaryResponse, collectionsData] = await Promise.all([
        financialService.getOfficesSummary(selectedDate),
        financialService.getCollectionsByOffice(selectedDate)
      ])
      setOffices(summaryResponse.offices)
      setTotals(summaryResponse.totals)
      setCollections(collectionsData)
    } catch {
      toast.error('Error al cargar datos financieros')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [selectedDate])

  return (
    <div className="min-h-screen bg-gray-50 w-full">
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="w-full px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Dashboard Financiero</h1>
              <p className="text-gray-600 text-sm mt-1">Resumen de caja por oficina</p>
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-600">Fecha:</label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="w-full px-4 sm:px-6 lg:px-8 py-6">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600" />
          </div>
        ) : (
          <>
            {totals && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                <div className="bg-white rounded-xl shadow p-4 border border-gray-200">
                  <p className="text-sm text-gray-500">Total Ingresos</p>
                  <p className="text-xl font-bold text-green-600">{formatCurrency(totals.total_in)}</p>
                </div>
                <div className="bg-white rounded-xl shadow p-4 border border-gray-200">
                  <p className="text-sm text-gray-500">Total Retiros</p>
                  <p className="text-xl font-bold text-red-600">{formatCurrency(totals.total_out)}</p>
                </div>
                <div className="bg-white rounded-xl shadow p-4 border border-gray-200">
                  <p className="text-sm text-gray-500">Disponible Total</p>
                  <p className="text-xl font-bold text-indigo-600">{formatCurrency(totals.total_available)}</p>
                </div>
              </div>
            )}

            <div className="bg-white rounded-xl shadow border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Oficina</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Bal. Inicial</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Ingresos</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Retiros</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Disponible</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {offices.map((office) => (
                      <tr key={office.office_id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">{office.office_name}</td>
                        <td className="px-4 py-3"><StatusBadge status={office.status} /></td>
                        <td className="px-4 py-3 text-sm text-gray-900 text-right">{formatCurrency(office.initial_balance)}</td>
                        <td className="px-4 py-3 text-sm text-green-600 text-right font-medium">{formatCurrency(office.total_in)}</td>
                        <td className="px-4 py-3 text-sm text-red-600 text-right font-medium">{formatCurrency(office.total_out)}</td>
                        <td className="px-4 py-3 text-sm text-gray-900 text-right font-bold">{formatCurrency(office.available_cash)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {collections.length > 0 && (
              <div className="bg-white rounded-xl shadow border border-gray-200 overflow-hidden mt-6">
                <div className="px-4 py-3 bg-amber-50 border-b border-amber-100">
                  <h2 className="text-sm font-semibold text-amber-800">
                    Cobros de Encomiendas por Oficina (POR COBRAR)
                  </h2>
                  <p className="text-xs text-amber-600 mt-0.5">
                    Desglose de cobros realizados en destino
                  </p>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Oficina</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Transacciones</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Total Cobrado</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {collections.map((col) => (
                        <tr key={col.office_id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm font-medium text-gray-900">{col.office_name}</td>
                          <td className="px-4 py-3 text-sm text-gray-600 text-right">{col.transactions_count}</td>
                          <td className="px-4 py-3 text-sm text-amber-700 text-right font-bold">{formatCurrency(col.total_collected)}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-amber-50">
                      <tr>
                        <td className="px-4 py-3 text-sm font-bold text-gray-900" colSpan={2}>Total General</td>
                        <td className="px-4 py-3 text-sm text-amber-800 text-right font-bold">
                          {formatCurrency(collections.reduce((sum, c) => sum + c.total_collected, 0))}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
