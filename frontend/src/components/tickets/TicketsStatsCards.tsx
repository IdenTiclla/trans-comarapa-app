import { formatCurrency } from './tickets-helpers'

interface Props {
  stats: { confirmed: number; pending: number; cancelled: number; totalRevenue: number }
  comparison: { confirmed: number; pending: number; cancelled: number; totalRevenue: number }
}

export function TicketsStatsCards({ stats, comparison }: Props) {
  const cards = [
    { title: 'Boletos Confirmados', val: stats.confirmed, comp: comparison.confirmed },
    { title: 'Boletos Reservados', val: stats.pending, comp: comparison.pending },
    { title: 'Boletos Cancelados', val: stats.cancelled, comp: comparison.cancelled },
    { title: 'Total Ingresos', val: formatCurrency(stats.totalRevenue), comp: comparison.totalRevenue, accent: true },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {cards.map((s, i) => (
        <div
          key={i}
          className="bg-card rounded-lg border p-4"
        >
          <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">{s.title}</p>
          <p className={`text-2xl font-bold mt-1 ${s.accent ? 'text-primary' : 'text-foreground'}`}>{s.val}</p>
          <p className="text-xs mt-1 text-muted-foreground">
            {s.comp === 0 ? 'Sin cambios vs ayer' : `${s.comp > 0 ? '+' : ''}${s.comp}% vs ayer`}
          </p>
        </div>
      ))}
    </div>
  )
}
