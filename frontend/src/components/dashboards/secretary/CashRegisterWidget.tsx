import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import type { CashRegister, DailySummary } from '@/types/cash-register'
import { ROUTES } from '@/lib/routes'

interface Props {
  loading: boolean
  cashRegister: CashRegister | null
  dailySummary: DailySummary | null
  onNavigate: (path: string) => void
}

export function CashRegisterWidget({ loading, cashRegister, dailySummary, onNavigate }: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl font-bold">Mi Caja</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div role="status" aria-live="polite" className="flex justify-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" aria-hidden="true" />
            <span className="sr-only">Cargando caja registradora...</span>
          </div>
        ) : cashRegister?.status === 'open' ? (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" aria-hidden="true" />
              <span className="text-sm font-semibold text-green-700">Caja Abierta</span>
              <span className="sr-only"> — datos actualizados en tiempo real</span>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Saldo inicial:</span>
                <span className="font-medium">{cashRegister.initial_balance.toFixed(2)} Bs</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Ingresos del día:</span>
                <span className="font-medium text-green-600">+{(dailySummary?.total_in ?? 0).toFixed(2)} Bs</span>
              </div>
              <div className="flex justify-between border-t pt-2">
                <span className="text-gray-900 font-medium">Efectivo esperado:</span>
                <span className="font-bold text-emerald-700">{(dailySummary?.expected_balance ?? cashRegister.initial_balance).toFixed(2)} Bs</span>
              </div>
            </div>
            <Button variant="link" size="sm" onClick={() => onNavigate(ROUTES.ADMIN.CASH_REGISTER)} className="w-full mt-2">
              Ver detalles →
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded-full" />
              <span className="text-sm font-semibold text-red-700">Caja Cerrada</span>
            </div>
            <p className="text-sm text-gray-600">No hay una caja abierta para tu oficina.</p>
            <Button onClick={() => onNavigate(ROUTES.ADMIN.CASH_REGISTER)} className="w-full">
              Abrir Caja
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
