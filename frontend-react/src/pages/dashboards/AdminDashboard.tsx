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

function getCurrentDate() {
  return new Intl.DateTimeFormat('es-ES', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date())
}

export function Component() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const { user } = useAuth()
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-slate-100 w-full">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200 w-full">
        <div className="w-full px-2 sm:px-4 lg:px-6 py-4">
          <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4">
            <div className="flex items-center space-x-4">
              <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-indigo-600 to-indigo-700 rounded-xl shadow-lg">
                <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Panel de Administración</h1>
                <p className="text-gray-700">
                  Bienvenido, {user?.firstname} {user?.lastname}
                </p>
              </div>
            </div>
            <div className="hidden md:flex items-center space-x-2 text-sm text-gray-600">
              <span className="font-medium">{getCurrentDate()}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full px-2 sm:px-4 lg:px-6 py-6">
        {isLoading && (
          <div className="flex justify-center items-center py-20">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4" />
              <p className="text-gray-700 text-lg font-medium">Cargando estadísticas...</p>
            </div>
          </div>
        )}

        {!isLoading && error && (
          <div className="bg-red-50 border-l-4 border-red-500 rounded-lg p-6 shadow-sm mb-6">
            <h3 className="text-lg font-semibold text-red-800">Error al cargar datos</h3>
            <p className="text-red-700 mt-1">{error}</p>
            <button
              onClick={() => dispatch(fetchDashboardStats('today'))}
              className="mt-3 text-sm bg-red-100 hover:bg-red-200 text-red-800 font-medium px-4 py-2 rounded-lg"
            >
              Intentar nuevamente
            </button>
          </div>
        )}

        {!isLoading && !error && (
          <>
            {/* Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
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

            {/* Quick Actions */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {[
                { label: 'Gestionar Usuarios', desc: 'Administrar cuentas', path: '/admin/users', color: 'blue' },
                { label: 'Gestionar Buses', desc: 'Flota de vehículos', path: '/admin/buses', color: 'green' },
                { label: 'Gestionar Rutas', desc: 'Rutas y horarios', path: '/admin/routes', color: 'purple' },
                { label: 'Ver Viajes', desc: 'Programación de viajes', path: '/trips', color: 'orange' },
              ].map((a) => (
                <div
                  key={a.path}
                  onClick={() => navigate(a.path)}
                  className={`group bg-white rounded-2xl p-4 lg:p-6 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer border border-gray-200 hover:border-${a.color}-300 transform hover:-translate-y-1`}
                >
                  <h3 className={`text-base lg:text-lg font-semibold text-gray-900 group-hover:text-${a.color}-700 transition-colors`}>
                    {a.label}
                  </h3>
                  <p className="text-gray-600 text-sm">{a.desc}</p>
                </div>
              ))}
            </div>

            {/* Financial KPIs */}
            {cashSummary && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <div
                  onClick={() => navigate('/admin/financial')}
                  className="bg-white rounded-2xl p-4 lg:p-6 shadow-lg border border-gray-200 cursor-pointer hover:shadow-xl transition-all hover:border-green-300"
                >
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
                </div>
                <div
                  onClick={() => navigate('/admin/withdrawals')}
                  className="bg-white rounded-2xl p-4 lg:p-6 shadow-lg border border-gray-200 cursor-pointer hover:shadow-xl transition-all hover:border-red-300"
                >
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
                </div>
                <div className="bg-white rounded-2xl p-4 lg:p-6 shadow-lg border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500">Cajas Abiertas</p>
                      <p className="text-xl font-bold text-indigo-600">{cashSummary.registers_open ?? 0}</p>
                    </div>
                    <div className="bg-indigo-100 p-3 rounded-xl">
                      <svg className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                    </div>
                  </div>
                </div>
                <div
                  onClick={() => navigate('/admin/financial')}
                  className="bg-white rounded-2xl p-4 lg:p-6 shadow-lg border border-gray-200 cursor-pointer hover:shadow-xl transition-all hover:border-emerald-300"
                >
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
                </div>
              </div>
            )}

            {/* Content Grid */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
                <div className="bg-blue-50 px-6 py-4 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold text-gray-900">Próximos Viajes</h2>
                    <button onClick={() => navigate('/trips')} className="text-blue-700 hover:text-blue-800 font-medium text-sm">
                      Ver todos
                    </button>
                  </div>
                </div>
                <div className="p-6">
                  <UpcomingTrips />
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
                <div className="bg-green-50 px-6 py-4 border-b border-gray-200">
                  <h2 className="text-xl font-bold text-gray-900">Ventas Recientes</h2>
                </div>
                <RecentSales />
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
