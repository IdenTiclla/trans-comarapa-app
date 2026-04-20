import { SummaryCard } from './SummaryCard'
import { DetailTable } from './DetailTable'
import { BreakdownTable } from './BreakdownTable'
import { TX_TYPE_LABELS, fmt } from './constants'

interface CashRow {
  id: number
  date: string
  opened_at: string
  closed_at: string
  status: string
  initial_balance: number
  final_balance: number
  income: number
  withdrawals: number
  transaction_count: number
}

export function CashReport({ data }: { data: Record<string, unknown> }) {
  const d = {
    total_registers: (data.total_registers as number) ?? 0,
    total_income: (data.total_income as number) ?? 0,
    total_withdrawals: (data.total_withdrawals as number) ?? 0,
    net: (data.net as number) ?? 0,
    by_transaction_type: (data.by_transaction_type as Record<string, { count: number; total: number }>) ?? {},
    rows: (data.rows as CashRow[]) ?? [],
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryCard label="Cajas Registradas" value={String(d.total_registers)} color="indigo" />
        <SummaryCard label="Ingresos" value={`Bs ${fmt(d.total_income)}`} color="green" />
        <SummaryCard label="Retiros" value={`Bs ${fmt(d.total_withdrawals)}`} color="red" />
        <SummaryCard label="Neto" value={`Bs ${fmt(d.net)}`} color="blue" />
      </div>

      <BreakdownTable
        title="Por Tipo de Transacción"
        labelColumn="Tipo"
        entries={Object.entries(d.by_transaction_type)}
        labelFor={(k) => TX_TYPE_LABELS[k] || k}
      />

      <DetailTable
        title="Detalle de Cajas"
        columns={['ID', 'Fecha', 'Apertura', 'Cierre', 'Estado', 'Bal. Inicial', 'Bal. Final', 'Ingresos', 'Retiros', 'Txns']}
        rows={d.rows.map((r) => [
          String(r.id),
          r.date,
          r.opened_at,
          r.closed_at || '—',
          r.status === 'open' ? 'Abierta' : 'Cerrada',
          `Bs ${fmt(r.initial_balance)}`,
          r.final_balance ? `Bs ${fmt(r.final_balance)}` : '—',
          `Bs ${fmt(r.income)}`,
          `Bs ${fmt(r.withdrawals)}`,
          String(r.transaction_count),
        ])}
      />
    </div>
  )
}
