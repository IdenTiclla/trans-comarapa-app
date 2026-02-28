<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-50 to-slate-100 w-full">
    <!-- Modern Header with full screen width -->
    <div class="bg-white shadow-sm border-b border-gray-200 w-full">
      <div class="w-full px-2 sm:px-4 lg:px-6 py-4">
        <div class="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4">
          <div class="flex items-center space-x-4">
            <div class="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl shadow-lg">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <h1 class="text-2xl font-bold text-gray-900">Dashboard de Secretaría</h1>
              <client-only>
                <p class="text-gray-700">Bienvenida, {{ userInfo.firstname }} {{ userInfo.lastname }}</p>
              </client-only>
            </div>
          </div>
          <div class="flex items-center space-x-4">
            <div class="hidden md:flex items-center space-x-2 text-sm text-gray-600">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <client-only>
                <span class="font-medium">{{ getCurrentDate() }}</span>
              </client-only>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Content with full width and no horizontal scroll -->
    <div class="w-full px-2 sm:px-4 lg:px-6 py-6 overflow-x-hidden">
      <!-- Loading State -->
      <div v-if="statsStore.isLoading" class="flex justify-center items-center py-20">
        <div class="text-center">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p class="text-gray-700 text-lg font-medium">Cargando estadísticas...</p>
        </div>
      </div>

      <!-- Error State -->
      <div v-else-if="statsStore.error" class="mb-6">
        <div class="bg-red-50 border-l-4 border-red-500 rounded-lg p-6 shadow-sm">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <svg class="h-6 w-6 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
              </svg>
            </div>
            <div class="ml-4">
              <h3 class="text-lg font-semibold text-red-800">Error al cargar datos</h3>
              <p class="text-red-700 mt-1">{{ statsStore.error }}</p>
              <button @click="loadStats" class="mt-3 text-sm bg-red-100 hover:bg-red-200 text-red-800 font-medium px-4 py-2 rounded-lg transition-colors border border-red-300">
                Intentar nuevamente
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Statistics Cards - Full Width Grid with responsive design -->
      <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div class="bg-white rounded-2xl p-4 lg:p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border-l-4 border-blue-600">
          <div class="flex items-center justify-between">
            <div class="flex-1 min-w-0">
              <p class="text-gray-600 text-sm font-medium mb-2">Boletos Vendidos Hoy</p>
              <p class="text-2xl lg:text-3xl font-bold text-gray-900 mb-2 truncate">{{ ticketStatsDisplay.count !== null ? ticketStatsDisplay.count : '...' }}</p>
              <div class="flex items-center">
                <svg class="h-4 w-4 mr-1 flex-shrink-0" :class="ticketStatsDisplay.trend >= 0 ? 'text-green-600' : 'text-red-600'" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="ticketStatsDisplay.trend >= 0 ? 'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6' : 'M13 17h8m0 0V9m0 8l-8-8-4 4-6-6'" />
                </svg>
                <span class="text-sm font-medium truncate" :class="ticketStatsDisplay.trend >= 0 ? 'text-green-600' : 'text-red-600'">
                  {{ ticketStatsDisplay.trend }}% vs. ayer
                </span>
              </div>
            </div>
            <div class="ml-4 flex items-center justify-center w-12 h-12 lg:w-16 lg:h-16 bg-blue-100 rounded-xl flex-shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 lg:h-8 lg:w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
              </svg>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-2xl p-4 lg:p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border-l-4 border-green-600">
          <div class="flex items-center justify-between">
            <div class="flex-1 min-w-0">
              <p class="text-gray-600 text-sm font-medium mb-2">Ingresos del Día</p>
              <p class="text-2xl lg:text-3xl font-bold text-gray-900 mb-2 truncate">{{ salesSummaryDisplay.totalAmount !== null ? `Bs. ${salesSummaryDisplay.totalAmount.toLocaleString()}` : '...' }}</p>
              <div class="flex items-center">
                <svg class="h-4 w-4 mr-1 flex-shrink-0" :class="salesSummaryDisplay.trend >= 0 ? 'text-green-600' : 'text-red-600'" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="salesSummaryDisplay.trend >= 0 ? 'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6' : 'M13 17h8m0 0V9m0 8l-8-8-4 4-6-6'" />
                </svg>
                <span class="text-sm font-medium truncate" :class="salesSummaryDisplay.trend >= 0 ? 'text-green-600' : 'text-red-600'">
                  {{ salesSummaryDisplay.trend }}% vs. ayer
                </span>
              </div>
            </div>
            <div class="ml-4 flex items-center justify-center w-12 h-12 lg:w-16 lg:h-16 bg-green-100 rounded-xl flex-shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 lg:h-8 lg:w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-2xl p-4 lg:p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border-l-4 border-purple-600">
          <div class="flex items-center justify-between">
            <div class="flex-1 min-w-0">
              <p class="text-gray-600 text-sm font-medium mb-2">Paquetes Registrados</p>
              <p class="text-2xl lg:text-3xl font-bold text-gray-900 mb-2 truncate">{{ packageStatsDisplay.count !== null ? packageStatsDisplay.count : '...' }}</p>
              <div class="flex items-center">
                <svg class="h-4 w-4 mr-1 flex-shrink-0" :class="packageStatsDisplay.trend >= 0 ? 'text-green-600' : 'text-red-600'" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="packageStatsDisplay.trend >= 0 ? 'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6' : 'M13 17h8m0 0V9m0 8l-8-8-4 4-6-6'" />
                </svg>
                <span class="text-sm font-medium truncate" :class="packageStatsDisplay.trend >= 0 ? 'text-green-600' : 'text-red-600'">
                  {{ packageStatsDisplay.trend }}% vs. ayer
                </span>
              </div>
            </div>
            <div class="ml-4 flex items-center justify-center w-12 h-12 lg:w-16 lg:h-16 bg-purple-100 rounded-xl flex-shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 lg:h-8 lg:w-8 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-2xl p-4 lg:p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border-l-4 border-orange-600">
          <div class="flex items-center justify-between">
            <div class="flex-1 min-w-0">
              <p class="text-gray-600 text-sm font-medium mb-2">Viajes Programados</p>
              <p class="text-2xl lg:text-3xl font-bold text-gray-900 mb-2 truncate">{{ tripStatsDisplay.count !== null ? tripStatsDisplay.count : '...' }}</p>
              <div class="flex items-center">
                <svg class="h-4 w-4 mr-1 flex-shrink-0" :class="tripStatsDisplay.trend >= 0 ? 'text-green-600' : 'text-red-600'" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="tripStatsDisplay.trend >= 0 ? 'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6' : 'M13 17h8m0 0V9m0 8l-8-8-4 4-6-6'" />
                </svg>
                <span class="text-sm font-medium truncate" :class="tripStatsDisplay.trend >= 0 ? 'text-green-600' : 'text-red-600'">
                  {{ tripStatsDisplay.trend }}% vs. ayer
                </span>
              </div>
            </div>
            <div class="ml-4 flex items-center justify-center w-12 h-12 lg:w-16 lg:h-16 bg-orange-100 rounded-xl flex-shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 lg:h-8 lg:w-8 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path d="M8 11V6.5m0 4.5v4.5m0-4.5h8m-8 0a4 4 0 110-8h8a4 4 0 110 8m-8 0a4 4 0 100 8h8a4 4 0 100-8" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      <!-- Quick Actions Section - Full Width -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div @click="handleQuickAction('new-ticket')" class="group bg-white rounded-2xl p-4 lg:p-6 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer border border-gray-200 hover:border-blue-300 transform hover:-translate-y-1">
          <div class="flex items-center space-x-3 lg:space-x-4">
            <div class="flex items-center justify-center w-10 h-10 lg:w-12 lg:h-12 bg-blue-100 group-hover:bg-blue-200 rounded-xl transition-colors flex-shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 lg:h-6 lg:w-6 text-blue-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
              </svg>
            </div>
            <div class="min-w-0 flex-1">
              <h3 class="text-base lg:text-lg font-semibold text-gray-900 group-hover:text-blue-700 transition-colors truncate">Vender Boletos</h3>
              <p class="text-gray-600 text-sm truncate">Gestionar venta de boletos</p>
            </div>
          </div>
        </div>

        <div @click="handleQuickAction('new-package')" class="group bg-white rounded-2xl p-4 lg:p-6 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer border border-gray-200 hover:border-green-300 transform hover:-translate-y-1">
          <div class="flex items-center space-x-3 lg:space-x-4">
            <div class="flex items-center justify-center w-10 h-10 lg:w-12 lg:h-12 bg-green-100 group-hover:bg-green-200 rounded-xl transition-colors flex-shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 lg:h-6 lg:w-6 text-green-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <div class="min-w-0 flex-1">
              <h3 class="text-base lg:text-lg font-semibold text-gray-900 group-hover:text-green-700 transition-colors truncate">Nuevo Paquete</h3>
              <p class="text-gray-600 text-sm truncate">Registrar nuevo paquete</p>
            </div>
          </div>
        </div>

        <div @click="handleQuickAction('search-client')" class="group bg-white rounded-2xl p-4 lg:p-6 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer border border-gray-200 hover:border-purple-300 transform hover:-translate-y-1">
          <div class="flex items-center space-x-3 lg:space-x-4">
            <div class="flex items-center justify-center w-10 h-10 lg:w-12 lg:h-12 bg-purple-100 group-hover:bg-purple-200 rounded-xl transition-colors flex-shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 lg:h-6 lg:w-6 text-purple-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <div class="min-w-0 flex-1">
              <h3 class="text-base lg:text-lg font-semibold text-gray-900 group-hover:text-purple-700 transition-colors truncate">Buscar Cliente</h3>
              <p class="text-gray-600 text-sm truncate">Buscar información de clientes</p>
            </div>
          </div>
        </div>

        <div @click="handleQuickAction('daily-report')" class="group bg-white rounded-2xl p-4 lg:p-6 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer border border-gray-200 hover:border-orange-300 transform hover:-translate-y-1">
          <div class="flex items-center space-x-3 lg:space-x-4">
            <div class="flex items-center justify-center w-10 h-10 lg:w-12 lg:h-12 bg-orange-100 group-hover:bg-orange-200 rounded-xl transition-colors flex-shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 lg:h-6 lg:w-6 text-orange-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div class="min-w-0 flex-1">
              <h3 class="text-base lg:text-lg font-semibold text-gray-900 group-hover:text-orange-700 transition-colors truncate">Reporte Diario</h3>
              <p class="text-gray-600 text-sm truncate">Ver reportes del día</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Main Content Grid - Full Width -->
      <div class="grid grid-cols-1 xl:grid-cols-4 gap-4 lg:gap-6">
        <!-- Left Column - Takes more space (3 columns) -->
        <div class="xl:col-span-3 space-y-6">
          <!-- Upcoming Trips Section -->
          <div class="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
            <div class="bg-blue-50 px-6 py-4 border-b border-gray-200">
              <div class="flex items-center justify-between">
                <h2 class="text-xl font-bold text-gray-900">Próximos Viajes</h2>
                <button @click="navigateTo('/trips')" class="text-blue-700 hover:text-blue-800 font-medium text-sm hover:underline transition-colors">
                  Ver todos
                </button>
              </div>
            </div>
            <div class="p-6">
              <UpcomingTrips @view-all="navigateTo('/trips')" />
            </div>
          </div>

          <!-- Recent Sales Section -->
          <div class="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
            <div class="bg-green-50 px-6 py-4 border-b border-gray-200">
              <div class="flex items-center justify-between">
                <h2 class="text-xl font-bold text-gray-900">Ventas Recientes</h2>
                <button @click="navigateTo('/sales')" class="text-green-700 hover:text-green-800 font-medium text-sm hover:underline transition-colors">
                  Ver todas
                </button>
              </div>
            </div>
            <div class="p-6">
              <RecentSales @view-all="navigateTo('/sales')" />
            </div>
          </div>
        </div>

        <!-- Right Column - Sidebar (1 column) -->
        <div class="xl:col-span-1 space-y-6">
          <!-- Quick Search -->
          <div class="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
            <div class="bg-purple-50 px-6 py-4 border-b border-gray-200">
              <h2 class="text-xl font-bold text-gray-900">Búsqueda Rápida</h2>
            </div>
            <div class="p-6">
              <QuickSearch />
            </div>
          </div>

          <!-- Recent Activity -->
          <div class="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
            <div class="bg-orange-50 px-6 py-4 border-b border-gray-200">
              <h2 class="text-xl font-bold text-gray-900">Actividad Reciente</h2>
            </div>
            <div class="p-6">
              <div class="space-y-4">
                <div class="flex items-start space-x-3">
                  <div class="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-full flex-shrink-0 mt-1">
                    <div class="w-2 h-2 bg-blue-600 rounded-full"></div>
                  </div>
                  <div class="flex-1 min-w-0">
                    <p class="text-sm text-gray-900 font-medium">Boleto vendido para el viaje Comarapa - Santa Cruz</p>
                    <p class="text-xs text-gray-600 mt-1">Hace 15 minutos</p>
                  </div>
                </div>
                <div class="flex items-start space-x-3">
                  <div class="flex items-center justify-center w-8 h-8 bg-green-100 rounded-full flex-shrink-0 mt-1">
                    <div class="w-2 h-2 bg-green-600 rounded-full"></div>
                  </div>
                  <div class="flex-1 min-w-0">
                    <p class="text-sm text-gray-900 font-medium">Paquete registrado para María González</p>
                    <p class="text-xs text-gray-600 mt-1">Hace 32 minutos</p>
                  </div>
                </div>
                <div class="flex items-start space-x-3">
                  <div class="flex items-center justify-center w-8 h-8 bg-purple-100 rounded-full flex-shrink-0 mt-1">
                    <div class="w-2 h-2 bg-purple-600 rounded-full"></div>
                  </div>
                  <div class="flex-1 min-w-0">
                    <p class="text-sm text-gray-900 font-medium">Nuevo viaje programado para mañana</p>
                    <p class="text-xs text-gray-600 mt-1">Hace 1 hora</p>
                  </div>
                </div>
              </div>
            </div>
        </div>
      </div>
    </div>

    <!-- Modals -->
    <PackageRegistrationModal
      :show-modal="showRegistrationModal"
      @close="closeRegistrationModal"
      @package-registered="onPackageRegistered"
    />
  </div>
</div>
</template>

<script setup>
import { useAuthStore } from '~/stores/auth'
import { useStatsStore } from '~/stores/statsStore'
import { useRouter } from 'vue-router'
import { computed, ref, onMounted, onBeforeUnmount } from 'vue'
import PackageRegistrationModal from '~/components/packages/PackageRegistrationModal.vue'

// Obtener información del usuario autenticado
const authStore = useAuthStore()
const statsStore = useStatsStore()
const router = useRouter()
const userInfo = computed(() => authStore.user || {})

// Modals state
const showRegistrationModal = ref(false)

const closeRegistrationModal = () => {
  showRegistrationModal.value = false
}

const onPackageRegistered = (_pkg) => {
  // Recargar estadísticas después de registrar
  loadStats()
}

// Computed properties for stats display
const ticketStatsDisplay = computed(() => statsStore.getTicketStatsData)
const packageStatsDisplay = computed(() => statsStore.getPackageStatsData)
const tripStatsDisplay = computed(() => statsStore.getTripStatsData)
const salesSummaryDisplay = computed(() => statsStore.getSalesSummaryData)


// Manejar acciones rápidas
const handleQuickAction = (actionId) => {
  switch (actionId) {
    case 'new-ticket':
      router.push('/trips')
      break
    case 'new-package':
      showRegistrationModal.value = true
      break
    case 'search-client':
      router.push('/clients')
      break
    case 'daily-report':
      router.push('/reports/daily')
      break
  }
}

// Obtener la fecha actual formateada
const getCurrentDate = () => {
  return new Intl.DateTimeFormat('es-ES', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(new Date())
}

// Cargar estadísticas
const loadStats = async () => {
  await statsStore.fetchDashboardStats()
}

let statsInterval = null

// Cargar estadísticas al montar el componente
onMounted(() => {
  loadStats()

  // Actualizar estadísticas cada 5 minutos
  statsInterval = setInterval(() => {
    loadStats()
  }, 5 * 60 * 1000)
})

// Limpiar intervalo al desmontar
onBeforeUnmount(() => {
  if (statsInterval) clearInterval(statsInterval)
})

// Definir la metadata de la página
definePageMeta({
  // middleware: ['auth'], // Handled by auth.global.ts
  requiredRoles: ['secretary'], // Example, adjust as needed
})
</script>

