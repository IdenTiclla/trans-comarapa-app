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
import { financialService } from '@/services/financial.service'
import type { CashSummaryResponse } from '@/services/financial.service'
import DashboardStatCard from '@/components/dashboard/DashboardStatCard'
import UpcomingTrips from '@/components/dashboard/UpcomingTrips'
import RecentSales from '@/components/dashboard/RecentSales'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export function Component() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  useAuth()
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const ticketStats = useAppSelector(selectTicketStats)
  const packageStats = useAppSelector(selectPackageStats)
  const tripStats = useAppSelector(selectTripStats)
  const salesSummary = useAppSelector(selectSalesSummary)
  const isLoading = useAppSelector(selectStatsLoading)
  const error = useAppSelector(selectStatsError)

  const [cashSummary, setCashSummary] = useState<CashSummaryResponse | null>(null)

  useEffect(() => {
    dispatch(fetchDashboardStats('today'))
    intervalRef.current = setInterval(() => dispatch(fetchDashboardStats('today')), 5 * 60 * 1000)
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [dispatch])

  useEffect(() => {
    financialService.getCashSummary().then(setCashSummary).catch(() => {})
  }, [])

  return (
    <div className="w-full space-y-6">
      {isLoading && (
        <div className="flex justify-center items-center py-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
            <p className="text-gray-700 text-lg font-medium">Cargando estadísticas...</p>
          </div>
        </div>
      )}

      {!isLoading && error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-red-800">Error al cargar datos</h3>
            <p className="text-red-700 mt-1">{error}</p>
            <Button
              variant="outline"
              onClick={() => dispatch(fetchDashboardStats('today'))}
              className="mt-3 border-red-300 text-red-800 hover:bg-red-100"
            >
              Intentar nuevamente
            </Button>
          </CardContent>
        </Card>
      )}

      {!isLoading && !error && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <DashboardStatCard
              title="Boletos Vendidos"
              value={ticketStats.count}
              trend={ticketStats.trend}
              borderColor="border-blue-600"
              iconBgColor="bg-blue-100"
              icon={<svg className="h-6 w-6 lg:h-8 lg:w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" /></svg>}
            />
            <DashboardStatCard
              title="Ingresos"
              value={`Bs. ${(salesSummary.totalAmount ?? 0).toLocaleString()}`}
              trend={salesSummary.trend}
              borderColor="border-green-600"
              iconBgColor="bg-green-100"
              icon={<svg className="h-6 w-6 lg:h-8 lg:w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
            />
            <DashboardStatCard
              title="Paquetes"
              value={packageStats.count}
              trend={packageStats.trend}
              borderColor="border-purple-600"
              iconBgColor="bg-purple-100"
              icon={<svg className="h-6 w-6 lg:h-8 lg:w-8 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>}
            />
            <DashboardStatCard
              title="Viajes"
              value={tripStats.count}
              trend={tripStats.trend}
              borderColor="border-orange-600"
              iconBgColor="bg-orange-100"
              icon={<svg className="h-6 w-6 lg:h-8 lg:w-8 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M8 11V6.5m0 4.5v4.5m0-4.5h8m-8 0a4 4 0 110-8h8a4 4 0 110 8m-8 0a4 4 0 100 8h8a4 4 0 100-8" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} /></svg>}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Gestionar Usuarios', desc: 'Administrar cuentas', path: '/admin/users' },
              { label: 'Gestionar Buses', desc: 'Flota de vehículos', path: '/admin/buses' },
              { label: 'Gestionar Rutas', desc: 'Rutas y horarios', path: '/admin/routes' },
              { label: 'Ver Viajes', desc: 'Programación de viajes', path: '/trips' },
            ].map((a) => (
              <Card
                key={a.path}
                onClick={() => navigate(a.path)}
                className="group cursor-pointer transition-all duration-300 hover:shadow-lg hover:border-primary/30 hover:-translate-y-0.5"
              >
                <CardContent className="p-4 lg:p-6">
                  <h3 className="text-base lg:text-lg font-semibold text-gray-900 group-hover:text-primary transition-colors">
                    {a.label}
                  </h3>
                  <p className="text-gray-500 text-sm">{a.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {cashSummary && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card
                onClick={() => navigate('/admin/financial')}
                className="cursor-pointer hover:shadow-lg transition-all hover:border-green-300"
              >
                <CardContent className="p-4 lg:p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500">Ingresos Hoy</p>
                      <p className="text-xl font-bold text-green-600">
                        Bs. {(cashSummary.total_income_today ?? 0).toLocaleString('es-BO', { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                    <div className="bg-green-100 p-3 rounded-xl">
                      <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card
                onClick={() => navigate('/admin/withdrawals')}
                className="cursor-pointer hover:shadow-lg transition-all hover:border-red-300"
              >
                <CardContent className="p-4 lg:p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500">Retiros Hoy</p>
                      <p className="text-xl font-bold text-red-600">
                        Bs. {(cashSummary.total_withdrawals_today ?? 0).toLocaleString('es-BO', { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                    <div className="bg-red-100 p-3 rounded-xl">
                      <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 lg:p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500">Cajas Abiertas</p>
                      <p className="text-xl font-bold text-primary">{cashSummary.registers_open ?? 0}</p>
                    </div>
                    <div className="bg-primary/10 p-3 rounded-xl">
                      <svg className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card
                onClick={() => navigate('/admin/financial')}
                className="cursor-pointer hover:shadow-lg transition-all hover:border-emerald-300"
              >
                <CardContent className="p-4 lg:p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500">Disponible Total</p>
                      <p className="text-xl font-bold text-emerald-600">
                        Bs. {(cashSummary.total_available ?? 0).toLocaleString('es-BO', { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                    <div className="bg-emerald-100 p-3 rounded-xl">
                      <svg className="h-6 w-6 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      </svg>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-lg font-bold">Próximos Viajes</CardTitle>
                <Button variant="ghost" size="sm" onClick={() => navigate('/trips')} className="text-primary">
                  Ver todos
                </Button>
              </CardHeader>
              <CardContent>
                <UpcomingTrips />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-bold">Ventas Recientes</CardTitle>
              </CardHeader>
              <CardContent>
                <RecentSales />
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  )
}
