import { SummaryCard } from './SummaryCard'
import { DetailTable } from './DetailTable'
import { BreakdownTable } from './BreakdownTable'
import { PAYMENT_LABELS, fmt } from './constants'

interface TicketRow {
  id: number
  date: string
  client: string
  route: string
  state: string
  payment_method: string
  price: number
}

export function TicketReport({ data }: { data: Record<string, unknown> }) {
  const d = {
    total_count: (data.total_count as number) ?? 0,
    total_revenue: (data.total_revenue as number) ?? 0,
    by_payment_method: (data.by_payment_method as Record<string, { count: number; total: number }>) ?? {},
    by_route: (data.by_route as Record<string, { count: number; total: number }>) ?? {},
    rows: (data.rows as TicketRow[]) ?? [],
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryCard label="Total Boletos" value={String(d.total_count)} color="indigo" />
        <SummaryCard label="Ingresos" value={`Bs ${fmt(d.total_revenue)}`} color="green" />
        {Object.entries(d.by_payment_method).map(([method, info]) => (
          <SummaryCard
            key={method}
            label={PAYMENT_LABELS[method] || method}
            value={`${info.count} — Bs ${fmt(info.total)}`}
            color="blue"
          />
        ))}
      </div>

      <BreakdownTable
        title="Por Ruta"
        labelColumn="Ruta"
        entries={Object.entries(d.by_route)}
        sort
      />

      <DetailTable
        title="Detalle de Boletos"
        columns={['ID', 'Fecha', 'Cliente', 'Ruta', 'Pago', 'Precio']}
        rows={d.rows.map((r) => [
          String(r.id),
          r.date,
          r.client || '—',
          r.route || '—',
          PAYMENT_LABELS[r.payment_method] || r.payment_method,
          `Bs ${fmt(r.price)}`,
        ])}
      />
    </div>
  )
}
