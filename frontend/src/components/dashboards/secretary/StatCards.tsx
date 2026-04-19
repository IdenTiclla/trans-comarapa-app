import DashboardStatCard from '@/components/dashboard/DashboardStatCard'

interface Props {
  ticketStats: { count: number; trend?: any }
  packageStats: { count: number; trend?: any }
  tripStats: { count: number; trend?: any }
  salesSummary: { totalAmount?: number; trend?: any }
}

export function StatCards({ ticketStats, packageStats, tripStats, salesSummary }: Props) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <DashboardStatCard
        title="Boletos Vendidos Hoy"
        value={ticketStats.count}
        trend={ticketStats.trend}
        borderColor="border-blue-600"
        iconBgColor="bg-blue-100"
        icon={
          <svg className="h-6 w-6 lg:h-8 lg:w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
          </svg>
        }
      />
      <DashboardStatCard
        title="Ingresos del Día"
        value={`Bs. ${(salesSummary.totalAmount ?? 0).toLocaleString()}`}
        trend={salesSummary.trend}
        borderColor="border-green-600"
        iconBgColor="bg-green-100"
        icon={
          <svg className="h-6 w-6 lg:h-8 lg:w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        }
      />
      <DashboardStatCard
        title="Paquetes Registrados"
        value={packageStats.count}
        trend={packageStats.trend}
        borderColor="border-purple-600"
        iconBgColor="bg-purple-100"
        icon={
          <svg className="h-6 w-6 lg:h-8 lg:w-8 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
        }
      />
      <DashboardStatCard
        title="Viajes Programados"
        value={tripStats.count}
        trend={tripStats.trend}
        borderColor="border-orange-600"
        iconBgColor="bg-orange-100"
        icon={
          <svg className="h-6 w-6 lg:h-8 lg:w-8 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path d="M8 11V6.5m0 4.5v4.5m0-4.5h8m-8 0a4 4 0 110-8h8a4 4 0 110 8m-8 0a4 4 0 100 8h8a4 4 0 100-8" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
          </svg>
        }
      />
    </div>
  )
}
