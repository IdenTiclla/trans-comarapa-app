import { useWithdrawalHistory } from '@/hooks/use-withdrawal-history'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Download, Loader2, Filter } from 'lucide-react'
import FormDatePicker from '@/components/forms/FormDatePicker'
import { LOCALE } from '@/lib/locale-config'

function formatCurrency(value: number): string {
  return `Bs. ${value.toLocaleString(LOCALE, { minimumFractionDigits: 2 })}`
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString(LOCALE, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

function formatDateTime(dateStr: string): string {
  return new Date(dateStr).toLocaleString(LOCALE, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function Component() {
  const {
    withdrawals, loading, dateFrom, setDateFrom, dateTo, setDateTo,
    fetchWithdrawals, handleExport, totalAmount,
  } = useWithdrawalHistory()

  return (
    <div className="w-full space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
        <div className="flex items-end gap-3">
          <FormDatePicker
            label="Desde"
            value={dateFrom}
            onChange={(date) => setDateFrom(date ? date.toISOString().split('T')[0] : '')}
          />
          <FormDatePicker
            label="Hasta"
            value={dateTo}
            onChange={(date) => setDateTo(date ? date.toISOString().split('T')[0] : '')}
          />
          <div className="flex flex-col justify-end h-full">
            <Button variant="outline" size="sm" onClick={fetchWithdrawals} className="mb-[1.5px] h-12 rounded-xl">
              <Filter className="h-4 w-4 mr-2" />
              Filtrar
            </Button>
          </div>
        </div>
        </div>
        <Button onClick={handleExport}>
          <Download className="h-4 w-4 mr-2" />
          Exportar CSV
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <>
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-gray-500">Total de retiros en el período</p>
              <p className="text-2xl font-bold text-red-600">{formatCurrency(totalAmount)}</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-0">
              {withdrawals.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  No hay retiros registrados
                </div>
              ) : (
                <div className="overflow-x-auto">
                  {/* eslint-disable-next-line no-restricted-syntax */}
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-muted/50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Oficina</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Monto</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Motivo</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Registrado por</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha/Hora</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {withdrawals.map((w) => (
                        <tr key={w.id} className="hover:bg-muted/30">
                          <td className="px-4 py-3 text-sm text-gray-900">{formatDate(w.date)}</td>
                          <td className="px-4 py-3 text-sm font-medium text-gray-900">{w.office_name}</td>
                          <td className="px-4 py-3 text-sm text-red-600 text-right font-bold">{formatCurrency(w.amount)}</td>
                          <td className="px-4 py-3 text-sm text-gray-600">{w.description || '-'}</td>
                          <td className="px-4 py-3 text-sm text-gray-600">{w.registered_by || '-'}</td>
                          <td className="px-4 py-3 text-sm text-gray-500">{formatDateTime(w.created_at)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
