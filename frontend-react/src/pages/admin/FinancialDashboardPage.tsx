import { useEffect, useState } from 'react'
import { financialService } from '@/services/financial.service'
import type { OfficeFinancialSummary, FinancialTotals, OfficeCollection } from '@/services/financial.service'
import { toast } from 'sonner'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { DollarSign, TrendingUp, TrendingDown, Loader2 } from 'lucide-react'

function formatCurrency(value: number): string {
  return `Bs. ${value.toLocaleString('es-BO', { minimumFractionDigits: 2 })}`
}

function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { variant: 'default' | 'secondary' | 'destructive'; label: string }> = {
    open: { variant: 'default', label: 'Abierta' },
    closed: { variant: 'secondary', label: 'Cerrada' },
    no_register: { variant: 'destructive', label: 'Sin caja' },
  }
  const c = config[status] ?? config.no_register
  return <Badge variant={c.variant}>{c.label}</Badge>
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
    <div className="w-full space-y-6">
      <div className="flex items-center justify-end">
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-600">Fecha:</label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <>
          {totals && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Total Ingresos</CardTitle>
                  <TrendingUp className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-green-600">{formatCurrency(totals.total_in)}</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Total Retiros</CardTitle>
                  <TrendingDown className="h-4 w-4 text-red-600" />
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-red-600">{formatCurrency(totals.total_out)}</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Disponible Total</CardTitle>
                  <DollarSign className="h-4 w-4 text-primary" />
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-primary">{formatCurrency(totals.total_available)}</p>
                </CardContent>
              </Card>
            </div>
          )}

          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Oficina</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Bal. Inicial</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Ingresos</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Retiros</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Disponible</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {offices.map((office) => (
                      <tr key={office.office_id} className="hover:bg-muted/30">
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
            </CardContent>
          </Card>

          {collections.length > 0 && (
            <Card>
              <CardHeader className="bg-amber-50 border-b border-amber-100 px-4 py-3">
                <CardTitle className="text-sm font-semibold text-amber-800">
                  Cobros de Encomiendas por Oficina (POR COBRAR)
                </CardTitle>
                <p className="text-xs text-amber-600 mt-0.5">
                  Desglose de cobros realizados en destino
                </p>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-muted/50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Oficina</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Transacciones</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Total Cobrado</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {collections.map((col) => (
                        <tr key={col.office_id} className="hover:bg-muted/30">
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
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  )
}
