import { useEffect, useRef, useState } from 'react'
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
import DashboardStatCard from '@/components/dashboard/DashboardStatCard'
import UpcomingTrips from '@/components/dashboard/UpcomingTrips'
import RecentSales from '@/components/dashboard/RecentSales'
import QuickSearch from '@/components/dashboard/QuickSearch'
import PendingCollections from '@/components/packages/PendingCollections'
import { activityService } from '@/services/activity.service'
import { cashRegisterService } from '@/services/cash-register.service'
import type { CashRegister, DailySummary } from '@/types/cash-register'
import { Card, CardHeader, CardTitle, CardContent, CardAction } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface Activity {
  id: number
  activity_type: string
  details: string | null
  user_id: number | null
  created_at: string
}

function getRelativeTime(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'Hace un momento'
  if (diffMins < 60) return `Hace ${diffMins} minutos`
  if (diffHours < 24) return `Hace ${diffHours} hora${diffHours > 1 ? 's' : ''}`
  if (diffDays < 7) return `Hace ${diffDays} día${diffDays > 1 ? 's' : ''}`
  return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })
}

function getActivityColors(type: string): { bg: string; dot: string } {
  switch (type.toLowerCase()) {
    case 'ticket':
    case 'ticket_sold':
      return { bg: 'bg-blue-100', dot: 'bg-blue-600' }
    case 'package':
    case 'package_registered':
      return { bg: 'bg-green-100', dot: 'bg-green-600' }
    case 'trip':
    case 'trip_created':
      return { bg: 'bg-purple-100', dot: 'bg-purple-600' }
    case 'cash':
    case 'cash_register':
      return { bg: 'bg-orange-100', dot: 'bg-orange-600' }
    default:
      return { bg: 'bg-gray-100', dot: 'bg-gray-600' }
  }
}

export function Component() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const { user } = useAuth()
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const [recentActivities, setRecentActivities] = useState<Activity[]>([])
  const [activitiesLoading, setActivitiesLoading] = useState(true)
  const [cashRegister, setCashRegister] = useState<CashRegister | null>(null)
  const [dailySummary, setDailySummary] = useState<DailySummary | null>(null)
  const [cashLoading, setCashLoading] = useState(true)

  const ticketStats = useAppSelector(selectTicketStats)
  const packageStats = useAppSelector(selectPackageStats)
  const tripStats = useAppSelector(selectTripStats)
  const salesSummary = useAppSelector(selectSalesSummary)
  const isLoading = useAppSelector(selectStatsLoading)
  const error = useAppSelector(selectStatsError)

  useEffect(() => {
    dispatch(fetchDashboardStats('today'))
    intervalRef.current = setInterval(() => dispatch(fetchDashboardStats('today')), 5 * 60 * 1000)
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [dispatch])

  useEffect(() => {
    const loadActivities = async () => {
      try {
        setActivitiesLoading(true)
        const data = await activityService.getRecentActivities()
        setRecentActivities((data as Activity[]).slice(0, 5))
      } catch {
        setRecentActivities([])
      } finally {
        setActivitiesLoading(false)
      }
    }
    loadActivities()
  }, [])

  useEffect(() => {
    const loadCashRegister = async () => {
      const officeId = user?.office_id
      if (!officeId) {
        setCashLoading(false)
        return
      }
      try {
        setCashLoading(true)
        const register = await cashRegisterService.getCurrentRegister(officeId)
        setCashRegister(register)
        if (register?.id) {
          const summary = await cashRegisterService.getDailySummary(register.id)
          setDailySummary(summary)
        } else {
          setDailySummary(null)
        }
      } catch {
        setCashRegister(null)
        setDailySummary(null)
      } finally {
        setCashLoading(false)
      }
    }
    loadCashRegister()
  }, [user?.office_id])

  const quickActions = [
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
            {/* Stat Cards */}
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

            {/* Quick Actions */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {quickActions.map((action) => (
                <div
                  key={action.id}
                  onClick={action.onClick}
                  className={`group bg-white rounded-2xl p-4 lg:p-6 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer border border-gray-200 ${action.hoverBorder} transform hover:-translate-y-1`}
                >
                  <div className="flex items-center space-x-3 lg:space-x-4">
                    <div
                      className={`flex items-center justify-center w-10 h-10 lg:w-12 lg:h-12 ${action.iconBg} rounded-xl transition-colors flex-shrink-0`}
                    >
                      {action.icon}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3
                        className={`text-base lg:text-lg font-semibold text-gray-900 ${action.textHover} transition-colors truncate`}
                      >
                        {action.label}
                      </h3>
                      <p className="text-gray-600 text-sm truncate">{action.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Main Grid */}
            <div className="grid grid-cols-1 xl:grid-cols-4 gap-4 lg:gap-6">
              {/* Left Column */}
              <div className="xl:col-span-3 space-y-6">
                {/* Upcoming Trips */}
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

                {/* Recent Sales */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-xl font-bold">Ventas Recientes</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <RecentSales onViewAll={() => navigate('/sales')} />
                  </CardContent>
                </Card>
              </div>

              {/* Right Sidebar */}
              <div className="xl:col-span-1 space-y-6">
                {/* Quick Search */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-xl font-bold">Búsqueda Rápida</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <QuickSearch />
                  </CardContent>
                </Card>

                {/* Cash Register Widget */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-xl font-bold">Mi Caja</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {cashLoading ? (
                      <div className="flex justify-center py-4">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
                      </div>
                    ) : cashRegister?.status === 'open' ? (
                      <div className="space-y-4">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                          <span className="text-sm font-semibold text-green-700">Caja Abierta</span>
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
                        <Button
                          variant="link"
                          size="sm"
                          onClick={() => navigate('/admin/cash-register')}
                          className="w-full mt-2"
                        >
                          Ver detalles →
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 bg-red-500 rounded-full" />
                          <span className="text-sm font-semibold text-red-700">Caja Cerrada</span>
                        </div>
                        <p className="text-sm text-gray-600">
                          No hay una caja abierta para tu oficina.
                        </p>
                        <Button
                          onClick={() => navigate('/admin/cash-register')}
                          className="w-full"
                        >
                          Abrir Caja
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Pending Collections */}
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

                {/* Recent Activity */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-xl font-bold">Actividad Reciente</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {activitiesLoading ? (
                      <div className="flex justify-center py-4">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
                      </div>
                    ) : recentActivities.length === 0 ? (
                      <p className="text-sm text-gray-500 text-center py-4">Sin actividad reciente</p>
                    ) : (
                      <div className="space-y-4">
                        {recentActivities.map((activity) => {
                          const colors = getActivityColors(activity.activity_type)
                          return (
                            <div key={activity.id} className="flex items-start space-x-3">
                              <div className={`flex items-center justify-center w-8 h-8 ${colors.bg} rounded-full flex-shrink-0 mt-1`}>
                                <div className={`w-2 h-2 ${colors.dot} rounded-full`} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm text-gray-900 font-medium truncate">
                                  {activity.details || activity.activity_type}
                                </p>
                                <p className="text-xs text-gray-600 mt-1">{getRelativeTime(activity.created_at)}</p>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
