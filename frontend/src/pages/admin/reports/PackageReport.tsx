import { SummaryCard } from './SummaryCard'
import { DetailTable } from './DetailTable'
import { BreakdownTable } from './BreakdownTable'
import { PACKAGE_STATUS_LABELS, fmt } from './constants'

interface PackageRow {
  id: number
  tracking_number: string
  date: string
  sender: string
  recipient: string
  status: string
  payment_status: string
  items_count: number
  amount: number
}

const paymentStatusLabel = (s: string) =>
  s === 'paid_on_send' ? 'Pagado al enviar' : s === 'collect_on_delivery' ? 'Por cobrar' : s

export function PackageReport({ data }: { data: Record<string, unknown> }) {
  const d = {
    total_count: (data.total_count as number) ?? 0,
    total_revenue: (data.total_revenue as number) ?? 0,
    by_status: (data.by_status as Record<string, { count: number; total: number }>) ?? {},
    by_payment_status: (data.by_payment_status as Record<string, { count: number; total: number }>) ?? {},
    rows: (data.rows as PackageRow[]) ?? [],
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryCard label="Total Encomiendas" value={String(d.total_count)} color="indigo" />
        <SummaryCard label="Ingresos" value={`Bs ${fmt(d.total_revenue)}`} color="green" />
        {Object.entries(d.by_payment_status).map(([status, info]) => (
          <SummaryCard
            key={status}
            label={paymentStatusLabel(status)}
            value={`${info.count} — Bs ${fmt(info.total)}`}
            color={status === 'collect_on_delivery' ? 'yellow' : 'blue'}
          />
        ))}
      </div>

      <BreakdownTable
        title="Por Estado"
        labelColumn="Estado"
        entries={Object.entries(d.by_status)}
        labelFor={(k) => PACKAGE_STATUS_LABELS[k] || k}
      />

      <DetailTable
        title="Detalle de Encomiendas"
        columns={['N°', 'Fecha', 'Remitente', 'Destinatario', 'Estado', 'Items', 'Monto']}
        rows={d.rows.map((r) => [
          r.tracking_number,
          r.date,
          r.sender || '—',
          r.recipient || '—',
          PACKAGE_STATUS_LABELS[r.status] || r.status,
          String(r.items_count),
          `Bs ${fmt(r.amount)}`,
        ])}
      />
    </div>
  )
}
