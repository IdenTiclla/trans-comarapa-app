<template>
  <div class="min-h-screen bg-gray-100">
    <!-- Header -->
    <header class="bg-white shadow">
      <div class="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
        <div>
          <h1 class="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p class="text-gray-600 mt-1">Panel de {{ getRoleName }}</p>
        </div>
        <div class="flex items-center space-x-4">
          <span class="text-gray-700">Bienvenid{{ authStore.user?.role === 'secretary' ? 'a' : 'o' }}, {{ authStore.fullName }}</span>
          <button
            @click="handleLogout"
            class="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            Cerrar sesión
          </button>
        </div>
      </div>
    </header>

    <!-- Main content -->
    <main>
      <div class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <!-- Dashboard content -->
        <div class="px-4 py-6 sm:px-0">
          <div class="bg-gray-50 rounded-lg p-6">
            <h2 class="text-2xl font-semibold mb-2">Panel de {{ getRoleName }}</h2>
            <p class="text-gray-600 mb-6">Bienvenid{{ authStore.user?.role === 'secretary' ? 'a' : 'o' }} al sistema de gestión de Trans Comarapa.</p>

            <!-- Contenido específico para secretarias -->
            <div v-if="authStore.user?.role === 'secretary'" class="space-y-6">
              <!-- Estadísticas -->
              <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
                <StatCard
                  title="Boletos Vendidos Hoy"
                  value="24"
                  :icon="icons.ticketIcon"
                  bgColor="bg-blue-500"
                  :trend="15"
                  trendText="vs. ayer"
                />
                <StatCard
                  title="Ingresos del Día"
                  value="Bs. 3,600"
                  :icon="icons.moneyIcon"
                  bgColor="bg-green-500"
                  :trend="8"
                  trendText="vs. ayer"
                />
                <StatCard
                  title="Paquetes Registrados"
                  value="12"
                  :icon="icons.packageIcon"
                  bgColor="bg-purple-500"
                  :trend="-5"
                  trendText="vs. ayer"
                />
                <StatCard
                  title="Viajes Programados"
                  value="8"
                  :icon="icons.busIcon"
                  bgColor="bg-orange-500"
                  :trend="0"
                  trendText="vs. ayer"
                />
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
                </div>
              </div>
            </div>

            <!-- Contenido para administradores -->
            <div v-else-if="authStore.user?.role === 'admin'" class="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              <div class="bg-white p-4 rounded-lg shadow">
                <h3 class="font-semibold text-lg mb-2">Usuarios</h3>
                <p>Administración de usuarios del sistema</p>
                <button class="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">
                  Gestionar usuarios
                </button>
              </div>

              <div class="bg-white p-4 rounded-lg shadow">
                <h3 class="font-semibold text-lg mb-2">Reportes</h3>
                <p>Generación de reportes y estadísticas</p>
                <button class="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">
                  Ver reportes
                </button>
              </div>

              <div class="bg-white p-4 rounded-lg shadow">
                <h3 class="font-semibold text-lg mb-2">Configuración</h3>
                <p>Configuración del sistema</p>
                <button class="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">
                  Configurar sistema
                </button>
              </div>
            </div>

            <!-- Contenido para conductores -->
            <div v-else-if="authStore.user?.role === 'driver'" class="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              <div class="bg-white p-4 rounded-lg shadow">
                <h3 class="font-semibold text-lg mb-2">Mis viajes</h3>
                <p>Viajes asignados y programados</p>
                <button class="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">
                  Ver mis viajes
                </button>
              </div>

              <div class="bg-white p-4 rounded-lg shadow">
                <h3 class="font-semibold text-lg mb-2">Pasajeros</h3>
                <p>Lista de pasajeros por viaje</p>
                <button class="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">
                  Ver pasajeros
                </button>
              </div>

              <div class="bg-white p-4 rounded-lg shadow">
                <h3 class="font-semibold text-lg mb-2">Mi perfil</h3>
                <p>Información personal y licencia</p>
                <button class="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">
                  Ver perfil
                </button>
              </div>
            </div>

            <!-- Contenido para asistentes -->
            <div v-else-if="authStore.user?.role === 'assistant'" class="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              <div class="bg-white p-4 rounded-lg shadow">
                <h3 class="font-semibold text-lg mb-2">Mis viajes</h3>
                <p>Viajes asignados y programados</p>
                <button class="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">
                  Ver mis viajes
                </button>
              </div>

              <div class="bg-white p-4 rounded-lg shadow">
                <h3 class="font-semibold text-lg mb-2">Pasajeros</h3>
                <p>Atención a pasajeros</p>
                <button class="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">
                  Ver pasajeros
                </button>
              </div>

              <div class="bg-white p-4 rounded-lg shadow">
                <h3 class="font-semibold text-lg mb-2">Paquetes</h3>
                <p>Control de paquetes y envíos</p>
                <button class="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">
                  Ver paquetes
                </button>
              </div>
            </div>

            <!-- Contenido para clientes -->
            <div v-else-if="authStore.user?.role === 'client'" class="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              <div class="bg-white p-4 rounded-lg shadow">
                <h3 class="font-semibold text-lg mb-2">Mis boletos</h3>
                <p>Historial de boletos y reservas</p>
                <button class="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">
                  Ver mis boletos
                </button>
              </div>

              <div class="bg-white p-4 rounded-lg shadow">
                <h3 class="font-semibold text-lg mb-2">Mis paquetes</h3>
                <p>Seguimiento de paquetes enviados y recibidos</p>
                <button class="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">
                  Ver mis paquetes
                </button>
              </div>

              <div class="bg-white p-4 rounded-lg shadow">
                <h3 class="font-semibold text-lg mb-2">Mi perfil</h3>
                <p>Información personal y preferencias</p>
                <button class="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">
                  Ver perfil
                </button>
              </div>
            </div>

            <!-- Contenido genérico para otros roles -->
            <div v-else class="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              <div class="bg-white p-4 rounded-lg shadow">
                <h3 class="font-semibold text-lg mb-2">Mi perfil</h3>
                <p>Información personal y preferencias</p>
                <button class="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">
                  Ver perfil
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'
import { useRouter } from 'vue-router'
import { onMounted, computed, reactive } from 'vue'
import StatCard from '~/components/StatCard.vue'
import UpcomingTrips from '~/components/UpcomingTrips.vue'
import RecentSales from '~/components/RecentSales.vue'
import QuickActions from '~/components/QuickActions.vue'
import QuickSearch from '~/components/QuickSearch.vue'

const authStore = useAuthStore()
const router = useRouter()

// Comprobar autenticación al montar el componente
onMounted(() => {
  // Si el usuario no está autenticado, redirigir a login
  if (!authStore.isAuthenticated) {
    router.push('/login')
  }
})

// Iconos para las tarjetas de estadísticas
const icons = reactive({
  ticketIcon: {
    template: `
      <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
      </svg>
    `
  },
  moneyIcon: {
    template: `
      <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    `
  },
  packageIcon: {
    template: `
      <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
      </svg>
    `
  },
  busIcon: {
    template: `
      <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path d="M8 11V6.5m0 4.5v4.5m0-4.5h8m-8 0a4 4 0 110-8h8a4 4 0 110 8m-8 0a4 4 0 100 8h8a4 4 0 100-8" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" />
      </svg>
    `
  },
  userIcon: {
    template: `
      <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    `
  },
  searchIcon: {
    template: `
      <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    `
  },
  reportIcon: {
    template: `
      <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    `
  },
  addIcon: {
    template: `
      <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
      </svg>
    `
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

// Obtener el nombre del rol para mostrar en el dashboard
const getRoleName = computed(() => {
  switch (authStore.user?.role) {
    case 'secretary':
      return 'Secretaria';
    case 'driver':
      return 'Conductor';
    case 'assistant':
      return 'Asistente';
    case 'admin':
      return 'Administrador';
    case 'client':
      return 'Cliente';
    default:
      return 'Usuario';
  }
})

// Función para manejar el cierre de sesión
const handleLogout = () => {
  authStore.logout()
  router.push('/login')
}

// Definir la metadata de la página
definePageMeta({
  middleware: ['auth'] // Aplicar middleware de autenticación
})
</script>
