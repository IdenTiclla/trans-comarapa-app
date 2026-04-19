import { formatCurrency } from './tickets-helpers'

interface Props {
  stats: { confirmed: number; pending: number; cancelled: number; totalRevenue: number }
  comparison: { confirmed: number; pending: number; cancelled: number; totalRevenue: number }
}

export function TicketsStatsCards({ stats, comparison }: Props) {
  const cards = [
    { title: 'Boletos Confirmados', val: stats.confirmed, comp: comparison.confirmed, color: 'blue' },
    { title: 'Boletos Reservados', val: stats.pending, comp: comparison.pending, color: 'yellow' },
    { title: 'Boletos Cancelados', val: stats.cancelled, comp: comparison.cancelled, color: 'red' },
    { title: 'Total Ingresos', val: formatCurrency(stats.totalRevenue), comp: comparison.totalRevenue, color: 'green' },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {cards.map((s, i) => (
        <div
          key={i}
          className={`bg-gradient-to-br from-${s.color}-50 to-${s.color}-100 rounded-2xl shadow-sm p-6 border border-${s.color}-200`}
        >
          <p className={`text-sm font-medium text-${s.color}-600`}>{s.title}</p>
          <p className={`text-3xl font-bold text-${s.color}-900`}>{s.val}</p>
          <p
            className={`text-xs mt-1 font-medium ${s.comp > 0 ? 'text-green-600' : s.comp < 0 ? 'text-red-600' : 'text-gray-600'}`}
          >
            {s.comp === 0 ? 'Sin cambios vs ayer' : `${s.comp}% vs ayer`}
          </p>
        </div>
      ))}
    </div>
  )
}
