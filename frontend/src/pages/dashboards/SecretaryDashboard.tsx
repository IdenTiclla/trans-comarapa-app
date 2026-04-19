import { useNavigate } from 'react-router'
import { useAppDispatch, useAppSelector } from '@/store'
import { useAuth } from '@/hooks/use-auth'
import {
  fetchDashboardStats,
  selectTicketStats,
  selectPackageStats,
  selectTripStats,
  selectSalesSummary,
  selectStatsLoading,
  selectStatsError,
} from '@/store/stats.slice'
import UpcomingTrips from '@/components/dashboard/UpcomingTrips'
import RecentSales from '@/components/dashboard/RecentSales'
import QuickSearch from '@/components/dashboard/QuickSearch'
import PendingCollections from '@/components/packages/PendingCollections'
import { Card, CardHeader, CardTitle, CardContent, CardAction } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { StatCards } from '@/components/dashboards/secretary/StatCards'
import { QuickActions, type QuickAction } from '@/components/dashboards/secretary/QuickActions'
import { CashRegisterWidget } from '@/components/dashboards/secretary/CashRegisterWidget'
import { RecentActivityWidget } from '@/components/dashboards/secretary/RecentActivityWidget'
import { useSecretaryDashboard } from '@/components/dashboards/secretary/use-secretary-dashboard'

export function Component() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const { user } = useAuth()

  const ticketStats = useAppSelector(selectTicketStats)
  const packageStats = useAppSelector(selectPackageStats)
  const tripStats = useAppSelector(selectTripStats)
  const salesSummary = useAppSelector(selectSalesSummary)
  const isLoading = useAppSelector(selectStatsLoading)
  const error = useAppSelector(selectStatsError)

  const { recentActivities, activitiesLoading, cashRegister, dailySummary, cashLoading } =
    useSecretaryDashboard(user?.office_id)

  const quickActions: QuickAction[] = [
    {
      id: 'new-ticket',
      label: 'Vender Boletos',
      description: 'Gestionar venta de boletos',
      icon: (
        <svg className="h-5 w-5 lg:h-6 lg:w-6 text-blue-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
        </svg>
      ),
      iconBg: 'bg-blue-100 group-hover:bg-blue-200',
      hoverBorder: 'hover:border-blue-300',
      textHover: 'group-hover:text-blue-700',
      onClick: () => navigate('/trips'),
    },
    {
      id: 'new-package',
      label: 'Nuevo Paquete',
      description: 'Registrar nuevo paquete',
      icon: (
        <svg className="h-5 w-5 lg:h-6 lg:w-6 text-green-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      ),
      iconBg: 'bg-green-100 group-hover:bg-green-200',
      hoverBorder: 'hover:border-green-300',
      textHover: 'group-hover:text-green-700',
      onClick: () => navigate('/packages/new'),
    },
    {
      id: 'search-client',
      label: 'Buscar Cliente',
      description: 'Buscar información de clientes',
      icon: (
        <svg className="h-5 w-5 lg:h-6 lg:w-6 text-purple-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      ),
      iconBg: 'bg-purple-100 group-hover:bg-purple-200',
      hoverBorder: 'hover:border-purple-300',
      textHover: 'group-hover:text-purple-700',
      onClick: () => navigate('/clients'),
    },
    {
      id: 'daily-report',
      label: 'Reporte Diario',
      description: 'Ver reportes del día',
      icon: (
        <svg className="h-5 w-5 lg:h-6 lg:w-6 text-orange-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      iconBg: 'bg-orange-100 group-hover:bg-orange-200',
      hoverBorder: 'hover:border-orange-300',
      textHover: 'group-hover:text-orange-700',
      onClick: () => navigate('/reports'),
    },
  ]

  return (
    <div>
      <div className="px-2 sm:px-4 lg:px-6 py-6">
        {isLoading && (
          <div className="flex justify-center items-center py-20">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
              <p className="text-muted-foreground text-lg font-medium">Cargando estadísticas...</p>
            </div>
          </div>
        )}

        {!isLoading && error && (
          <div className="mb-6">
            <div className="bg-red-50 border-l-4 border-red-500 rounded-lg p-6 shadow-sm">
              <div className="flex items-center">
                <div className="ml-4">
                  <h3 className="text-lg font-semibold text-red-800">Error al cargar datos</h3>
                  <p className="text-red-700 mt-1">{error}</p>
                  <Button
                    variant="outline"
                    onClick={() => dispatch(fetchDashboardStats('today'))}
                    className="mt-3"
                  >
                    Intentar nuevamente
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {!isLoading && !error && (
          <>
            <StatCards
              ticketStats={ticketStats}
              packageStats={packageStats}
              tripStats={tripStats}
              salesSummary={salesSummary}
            />

            <QuickActions actions={quickActions} />

            <div className="grid grid-cols-1 xl:grid-cols-4 gap-4 lg:gap-6">
              <div className="xl:col-span-3 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-xl font-bold">Próximos Viajes</CardTitle>
                    <CardAction>
                      <Button variant="link" size="sm" onClick={() => navigate('/trips')}>
                        Ver todos
                      </Button>
                    </CardAction>
                  </CardHeader>
                  <CardContent>
                    <UpcomingTrips />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-xl font-bold">Ventas Recientes</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <RecentSales onViewAll={() => navigate('/sales')} />
                  </CardContent>
                </Card>
              </div>

              <div className="xl:col-span-1 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-xl font-bold">Búsqueda Rápida</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <QuickSearch />
                  </CardContent>
                </Card>

                <CashRegisterWidget
                  loading={cashLoading}
                  cashRegister={cashRegister}
                  dailySummary={dailySummary}
                  onNavigate={navigate}
                />

                <Card>
                  <CardHeader>
                    <CardTitle className="text-xl font-bold">Cobros Pendientes</CardTitle>
                  </CardHeader>
                  <CardContent className="px-4">
                    <PendingCollections
                      officeId={user?.office_id}
                      limit={5}
                      showTitle={false}
                      compact={true}
                      onViewAll={() => navigate('/packages/pending-collections')}
                    />
                  </CardContent>
                </Card>

                <RecentActivityWidget loading={activitiesLoading} activities={recentActivities} />
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
