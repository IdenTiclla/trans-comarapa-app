import { useEffect, useRef } from 'react'
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

  useEffect(() => {
    dispatch(fetchDashboardStats('today'))
    intervalRef.current = setInterval(() => dispatch(fetchDashboardStats('today')), 5 * 60 * 1000)
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [dispatch])

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
      color: 'blue',
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
      color: 'green',
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
      color: 'purple',
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
      color: 'orange',
      onClick: () => navigate('/trips'),
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-slate-100 w-full">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200 w-full">
        <div className="w-full px-2 sm:px-4 lg:px-6 py-4">
          <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4">
            <div className="flex items-center space-x-4">
              <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl shadow-lg">
                <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Dashboard de Secretaría</h1>
                <p className="text-gray-700">
                  Bienvenida, {user?.firstname} {user?.lastname}
                </p>
              </div>
            </div>
            <div className="hidden md:flex items-center space-x-2 text-sm text-gray-600">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="font-medium">{getCurrentDate()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="w-full px-2 sm:px-4 lg:px-6 py-6 overflow-x-hidden">
        {isLoading && (
          <div className="flex justify-center items-center py-20">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
              <p className="text-gray-700 text-lg font-medium">Cargando estadísticas...</p>
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
                  <button
                    onClick={() => dispatch(fetchDashboardStats('today'))}
                    className="mt-3 text-sm bg-red-100 hover:bg-red-200 text-red-800 font-medium px-4 py-2 rounded-lg transition-colors border border-red-300"
                  >
                    Intentar nuevamente
                  </button>
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
                  className={`group bg-white rounded-2xl p-4 lg:p-6 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer border border-gray-200 hover:border-${action.color}-300 transform hover:-translate-y-1`}
                >
                  <div className="flex items-center space-x-3 lg:space-x-4">
                    <div
                      className={`flex items-center justify-center w-10 h-10 lg:w-12 lg:h-12 bg-${action.color}-100 group-hover:bg-${action.color}-200 rounded-xl transition-colors flex-shrink-0`}
                    >
                      {action.icon}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3
                        className={`text-base lg:text-lg font-semibold text-gray-900 group-hover:text-${action.color}-700 transition-colors truncate`}
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
                <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
                  <div className="bg-blue-50 px-6 py-4 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                      <h2 className="text-xl font-bold text-gray-900">Próximos Viajes</h2>
                      <button
                        onClick={() => navigate('/trips')}
                        className="text-blue-700 hover:text-blue-800 font-medium text-sm hover:underline transition-colors"
                      >
                        Ver todos
                      </button>
                    </div>
                  </div>
                  <div className="p-6">
                    <UpcomingTrips />
                  </div>
                </div>

                {/* Recent Sales */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
                  <div className="bg-green-50 px-6 py-4 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                      <h2 className="text-xl font-bold text-gray-900">Ventas Recientes</h2>
                    </div>
                  </div>
                  <RecentSales onViewAll={() => navigate('/sales')} />
                </div>
              </div>

              {/* Right Sidebar */}
              <div className="xl:col-span-1 space-y-6">
                {/* Quick Search */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
                  <div className="bg-purple-50 px-6 py-4 border-b border-gray-200">
                    <h2 className="text-xl font-bold text-gray-900">Búsqueda Rápida</h2>
                  </div>
                  <div className="p-6">
                    <QuickSearch />
                  </div>
                </div>

                {/* Recent Activity */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
                  <div className="bg-orange-50 px-6 py-4 border-b border-gray-200">
                    <h2 className="text-xl font-bold text-gray-900">Actividad Reciente</h2>
                  </div>
                  <div className="p-6">
                    <div className="space-y-4">
                      {[
                        { color: 'blue', text: 'Boleto vendido para el viaje Comarapa - Santa Cruz', time: 'Hace 15 minutos' },
                        { color: 'green', text: 'Paquete registrado para María González', time: 'Hace 32 minutos' },
                        { color: 'purple', text: 'Nuevo viaje programado para mañana', time: 'Hace 1 hora' },
                      ].map((item, i) => (
                        <div key={i} className="flex items-start space-x-3">
                          <div className={`flex items-center justify-center w-8 h-8 bg-${item.color}-100 rounded-full flex-shrink-0 mt-1`}>
                            <div className={`w-2 h-2 bg-${item.color}-600 rounded-full`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-gray-900 font-medium">{item.text}</p>
                            <p className="text-xs text-gray-600 mt-1">{item.time}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
