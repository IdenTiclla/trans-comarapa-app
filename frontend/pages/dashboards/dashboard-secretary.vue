<template>
  <div class="container mx-auto px-4 py-8">
    <!-- Header del Dashboard -->
    <div class="bg-white rounded-lg shadow-lg p-6 mb-6">
      <div class="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div>
          <h1 class="text-2xl font-bold text-gray-800">Dashboard de Secretaria</h1>
          <client-only>
            <p class="text-gray-600 mt-1">Bienvenida, {{ userInfo.firstname }} {{ userInfo.lastname }}</p>
          </client-only>
        </div>
        <div class="flex items-center space-x-2">
          <client-only>
            <span class="text-sm text-gray-500">{{ getCurrentDate() }}</span>
          </client-only>
        </div>
      </div>
    </div>

    <!-- Estadísticas -->
    <div v-if="statsStore.isLoading" class="flex justify-center py-12">
      <p class="text-gray-500">Cargando estadísticas...</p>
    </div>
    <div v-else-if="statsStore.error" class="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
      <div class="flex">
        <div class="flex-shrink-0">
          <svg class="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
          </svg>
        </div>
        <div class="ml-3">
          <h3 class="text-sm font-medium text-red-800">{{ statsStore.error }}</h3>
          <div class="mt-2 text-sm text-red-700">
            <p>No se pudieron cargar las estadísticas. Intente recargar la página.</p>
          </div>
        </div>
      </div>
    </div>
    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
      <StatCard
        title="Boletos Vendidos Hoy"
        :value="ticketStatsDisplay.count !== null ? ticketStatsDisplay.count : '...'"
        :icon="icons.ticketIcon"
        bgColor="bg-blue-500"
        :trend="ticketStatsDisplay.trend !== null ? ticketStatsDisplay.trend : 0"
        trendText="vs. ayer"
      />
      <StatCard
        title="Ingresos del Día"
        :value="ticketStatsDisplay.amount !== null ? `Bs. ${ticketStatsDisplay.amount.toLocaleString()}` : '...'"
        :icon="icons.moneyIcon"
        bgColor="bg-green-500"
        :trend="ticketStatsDisplay.trend !== null ? ticketStatsDisplay.trend : 0"
        trendText="vs. ayer"
      />
      <StatCard
        title="Paquetes Registrados"
        :value="packageStatsDisplay.count !== null ? packageStatsDisplay.count : '...'"
        :icon="icons.packageIcon"
        bgColor="bg-purple-500"
        :trend="packageStatsDisplay.trend !== null ? packageStatsDisplay.trend : 0"
        trendText="vs. ayer"
      />
      <StatCard
        title="Viajes Programados"
        :value="tripStatsDisplay.count !== null ? tripStatsDisplay.count : '...'"
        :icon="icons.busIcon"
        bgColor="bg-orange-500"
        :trend="tripStatsDisplay.trend !== null ? tripStatsDisplay.trend : 0"
        trendText="vs. ayer"
      />
    </div>

    <!-- Accesos Rápidos -->
    <div class="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-6 mb-6">
      <!-- Tarjeta de Viajes -->
      <div class="bg-blue-50 rounded-lg p-6 shadow-md">
        <h2 class="text-xl font-semibold text-blue-700 mb-4">Gestión de Viajes</h2>
        <p class="text-gray-600 mb-4">Administra los viajes, horarios y rutas.</p>
        <NuxtLink to="/trips" class="inline-block bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded transition-colors">
          Ver Viajes
        </NuxtLink>
      </div>

      <!-- Tarjeta de Venta de Boletos -->
      <div class="bg-green-50 rounded-lg p-6 shadow-md">
        <h2 class="text-xl font-semibold text-green-700 mb-4">Venta de Boletos</h2>
        <p class="text-gray-600 mb-4">Gestiona la venta de boletos para los diferentes viajes.</p>
        <NuxtLink to="/tickets" class="inline-block bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded transition-colors">
          Vender Boletos
        </NuxtLink>
      </div>

      <!-- Tarjeta de Reportes -->
      <div class="bg-purple-50 rounded-lg p-6 shadow-md">
        <h2 class="text-xl font-semibold text-purple-700 mb-4">Reportes</h2>
        <p class="text-gray-600 mb-4">Accede a reportes de ventas y estadísticas.</p>
        <button class="bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded transition-colors">
          Ver Reportes
        </button>
      </div>
    </div>

    <!-- Contenido principal -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Columna izquierda -->
      <div class="lg:col-span-2 space-y-6">
        <!-- Próximos viajes -->
        <UpcomingTrips @view-all="navigateTo('/trips')" />

        <!-- Ventas recientes -->
        <RecentSales @view-all="navigateTo('/sales')" />
      </div>

      <!-- Columna derecha -->
      <div class="space-y-6">
        <!-- Acciones rápidas -->
        <QuickActions :actions="quickActions" @action-click="handleQuickAction" />

        <!-- Búsqueda rápida -->
        <QuickSearch />

        <!-- Información del usuario -->
        <div class="bg-gray-50 rounded-lg p-6 shadow">
          <h3 class="text-lg font-semibold text-gray-700 mb-4">Información de Usuario</h3>
          <client-only>
            <div class="space-y-2">
              <p><span class="font-medium">Nombre:</span> {{ userInfo.firstname }} {{ userInfo.lastname }}</p>
              <p><span class="font-medium">Rol:</span> {{ userInfo.role }}</p>
              <p><span class="font-medium">Email:</span> {{ userInfo.email }}</p>
            </div>
          </client-only>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useAuthStore } from '~/stores/auth'
import { useStatsStore } from '~/stores/statsStore'
import { useRouter } from 'vue-router'
import { computed, reactive, ref, onMounted, onBeforeUnmount, markRaw } from 'vue'
import StatCard from '~/components/StatCard.vue'
import UpcomingTrips from '~/components/UpcomingTrips.vue'
import RecentSales from '~/components/RecentSales.vue'
import QuickActions from '~/components/QuickActions.vue'
import QuickSearch from '~/components/QuickSearch.vue'

// Obtener información del usuario autenticado
const authStore = useAuthStore()
const statsStore = useStatsStore()
const router = useRouter()
const userInfo = computed(() => authStore.user || {})

// Computed properties for stats display
const ticketStatsDisplay = computed(() => statsStore.getTicketStatsData)
const packageStatsDisplay = computed(() => statsStore.getPackageStatsData)
const tripStatsDisplay = computed(() => statsStore.getTripStatsData)

// Iconos para las tarjetas de estadísticas
const icons = reactive({
  ticketIcon: {
    template: markRaw(`
      <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
      </svg>
    `)
  },
  moneyIcon: {
    template: markRaw(`
      <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    `)
  },
  packageIcon: {
    template: markRaw(`
      <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
      </svg>
    `)
  },
  busIcon: {
    template: markRaw(`
      <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path d="M8 11V6.5m0 4.5v4.5m0-4.5h8m-8 0a4 4 0 110-8h8a4 4 0 110 8m-8 0a4 4 0 100 8h8a4 4 0 100-8" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" />
      </svg>
    `)
  },
  searchIcon: {
    template: markRaw(`
      <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    `)
  },
  reportIcon: {
    template: markRaw(`
      <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    `)
  }
})

// Acciones rápidas para secretarias
const quickActions = [
  { id: 'new-ticket', label: 'Nuevo Boleto', icon: icons.ticketIcon },
  { id: 'new-package', label: 'Nuevo Paquete', icon: icons.packageIcon },
  { id: 'search-client', label: 'Buscar Cliente', icon: icons.searchIcon },
  { id: 'daily-report', label: 'Reporte Diario', icon: icons.reportIcon }
]

// Manejar acciones rápidas
const handleQuickAction = (actionId) => {
  switch (actionId) {
    case 'new-ticket':
      router.push('/tickets/new')
      break
    case 'new-package':
      router.push('/packages/new')
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

// Cargar estadísticas al montar el componente
onMounted(() => {
  loadStats()

  // Actualizar estadísticas cada 5 minutos
  const statsInterval = setInterval(() => {
    loadStats()
  }, 5 * 60 * 1000)

  // Limpiar intervalo al desmontar
  onBeforeUnmount(() => {
    clearInterval(statsInterval)
  })
})

// Definir la metadata de la página
definePageMeta({
  // middleware: ['auth'], // Handled by auth.global.ts
  requiredRoles: ['secretary'], // Example, adjust as needed
})
</script>

