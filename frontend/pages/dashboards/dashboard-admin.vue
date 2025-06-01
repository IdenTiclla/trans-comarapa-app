<template>
  <div class="space-y-8">
    <h1 class="text-3xl font-bold text-gray-900">Panel de Administración</h1>

    <!-- Gráficos de Ingresos -->
    <section>
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-xl font-semibold text-gray-900">Métricas de Ingresos a lo Largo del Tiempo</h2>
      </div>
      <div class="grid grid-cols-1 gap-6 sm:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
        <!-- Monthly Ticket Revenue -->
        <MonthlyMetricsChart
          title="Ingresos por Boletos"
          :chartData="monthlyTicketRevenueData.data"
          :isLoading="monthlyTicketRevenueData.isLoading"
          :error="monthlyTicketRevenueData.error"
          :trend="monthlyTicketRevenueData.trend"
          :valueFormatter="(value) => `Bs. ${value?.toLocaleString() || '0'}`"
          barColor="#3b82f6"
          @periodChanged="handleTicketRevenuePeriodChange"
        />
        
        <!-- Monthly Package Revenue -->
        <MonthlyMetricsChart
          title="Ingresos por Paquetes"
          :chartData="monthlyPackageRevenueData.data"
          :isLoading="monthlyPackageRevenueData.isLoading"
          :error="monthlyPackageRevenueData.error"
          :trend="monthlyPackageRevenueData.trend"
          :valueFormatter="(value) => `Bs. ${value?.toLocaleString() || '0'}`"
          barColor="#10b981"
          @periodChanged="handlePackageRevenuePeriodChange"
        />
        
        <!-- Monthly Total Revenue -->
        <MonthlyMetricsChart
          title="Ingresos Totales"
          :chartData="monthlyRevenueChartData.data"
          :isLoading="monthlyRevenueChartData.isLoading"
          :error="monthlyRevenueChartData.error"
          :trend="monthlyRevenueChartData.trend"
          :valueFormatter="(value) => `Bs. ${value?.toLocaleString() || '0'}`"
          barColor="#8b5cf6"
          @periodChanged="handleRevenuePeriodChange"
        />
      </div>
    </section>

    <!-- Metricas para viajes-->
    <section>
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-xl font-semibold text-gray-900">Métricas de Viajes a lo Largo del Tiempo</h2>
      </div>
      <div class="grid grid-cols-1 gap-6 sm:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
        <!-- Monthly Total Trips -->
        <MonthlyMetricsChart
          title="Viajes Realizados por Mes"
          :chartData="monthlyTripData.data"
          :isLoading="monthlyTripData.isLoading"
          :error="monthlyTripData.error"
          :trend="monthlyTripData.trend"
          :valueFormatter="(value) => value?.toLocaleString() || '0'"
          barColor="#f59e0b"
          @periodChanged="handleTripPeriodChange"
        />
        
        <!-- Monthly Completed Trips -->
        <MonthlyMetricsChart
          title="Viajes Completados por Mes"
          :chartData="monthlyCompletedTripData.data"
          :isLoading="monthlyCompletedTripData.isLoading"
          :error="monthlyCompletedTripData.error"
          :trend="monthlyCompletedTripData.trend"
          :valueFormatter="(value) => value?.toLocaleString() || '0'"
          barColor="#10b981"
          @periodChanged="handleCompletedTripPeriodChange"
        />
        
        <!-- Monthly Cancelled Trips -->
        <MonthlyMetricsChart
          title="Viajes Cancelados por Mes"
          :chartData="monthlyCancelledTripData.data"
          :isLoading="monthlyCancelledTripData.isLoading"
          :error="monthlyCancelledTripData.error"
          :trend="monthlyCancelledTripData.trend"
          :valueFormatter="(value) => value?.toLocaleString() || '0'"
          barColor="#ef4444"
          @periodChanged="handleCancelledTripPeriodChange"
        />
      </div>
      
      <!-- Tarjetas adicionales para métricas complementarias -->
      <div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-2 mt-6">
        <!-- Viajes en curso -->
        <DashboardStatCard 
          title="Viajes en curso" 
          :value="inProgressTripsData.isLoading ? 'Cargando...' : inProgressTripsData.count" 
          :change="inProgressTripsData.isLoading ? '' : inProgressTripsData.trend" 
          :changeColor="inProgressTripsData.trend && parseFloat(inProgressTripsData.trend) < 0 ? 'text-red-600' : 'text-green-600'"
        />
        <!-- Ocupación promedio por viaje -->
        <DashboardStatCard 
          title="Ocupación promedio por viaje" 
          :value="averageOccupancyData.isLoading ? 'Cargando...' : averageOccupancyData.percentage" 
          :change="averageOccupancyData.isLoading ? '' : averageOccupancyData.trend" 
          :changeColor="averageOccupancyData.trend && parseFloat(averageOccupancyData.trend) < 0 ? 'text-red-600' : 'text-green-600'"
        />
      </div>
    </section>

    <!-- Tarjetas de Resumen para metricas de boletos -->
    <section>
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-xl font-semibold text-gray-900">Métricas de Boletos a lo Largo del Tiempo</h2>
      </div>
      <div class="grid grid-cols-1 gap-6 sm:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
        <!-- Monthly Tickets Sold -->
        <MonthlyMetricsChart
          title="Boletos Vendidos por Mes"
          :chartData="monthlyTicketData.data"
          :isLoading="monthlyTicketData.isLoading"
          :error="monthlyTicketData.error"
          :trend="monthlyTicketData.trend"
          :valueFormatter="(value) => value?.toLocaleString() || '0'"
          barColor="#3b82f6"
          @periodChanged="handleTicketPeriodChange"
        />
        
        <!-- Monthly Reservations -->
        <MonthlyMetricsChart
          title="Reservas por Mes"
          :chartData="monthlyReservationData.data"
          :isLoading="monthlyReservationData.isLoading"
          :error="monthlyReservationData.error"
          :trend="monthlyReservationData.trend"
          :valueFormatter="(value) => value?.toLocaleString() || '0'"
          barColor="#f59e0b"
          @periodChanged="handleReservationPeriodChange"
        />
        
        <!-- Monthly Cancelled Tickets -->
        <MonthlyMetricsChart
          title="Boletos Cancelados por Mes"
          :chartData="monthlyCancelledTicketData.data"
          :isLoading="monthlyCancelledTicketData.isLoading"
          :error="monthlyCancelledTicketData.error"
          :trend="monthlyCancelledTicketData.trend"
          :valueFormatter="(value) => value?.toLocaleString() || '0'"
          barColor="#ef4444"
          @periodChanged="handleCancelledTicketPeriodChange"
        />
      </div>
    </section>
    
    <!-- Tarjetas de Resumen -->
    <section>
      <h2 class="text-xl font-semibold text-gray-900">Métricas de Paquetes</h2>
      <div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <DashboardStatCard 
          title="Paquetes Entregados" 
          :value="deliveredPackagesData.isLoading ? 'Cargando...' : deliveredPackagesData.count" 
          :change="deliveredPackagesData.isLoading ? '' : deliveredPackagesData.trend" 
          :changeColor="deliveredPackagesData.trend && parseFloat(deliveredPackagesData.trend) < 0 ? 'text-red-600' : 'text-green-600'"
        />
        <DashboardStatCard 
          title="Paquetes Pendientes de Entrega" 
          :value="pendingPackagesData.isLoading ? 'Cargando...' : pendingPackagesData.count" 
          :change="pendingPackagesData.isLoading ? '' : pendingPackagesData.trend" 
          :changeColor="pendingPackagesData.trend && parseFloat(pendingPackagesData.trend) < 0 ? 'text-green-600' : 'text-red-600'"
        />
        <DashboardStatCard 
          title="Paquetes Cancelados" 
          :value="cancelledPackagesData.isLoading ? 'Cargando...' : cancelledPackagesData.count" 
          :change="cancelledPackagesData.isLoading ? '' : cancelledPackagesData.trend" 
          :changeColor="cancelledPackagesData.trend && parseFloat(cancelledPackagesData.trend) < 0 ? 'text-green-600' : 'text-red-600'"
        />
        <DashboardStatCard 
          title="Tiempo promedio de entrega" 
          :value="averageDeliveryTimeData.isLoading ? 'Cargando...' : averageDeliveryTimeData.hours" 
          :change="averageDeliveryTimeData.isLoading ? '' : averageDeliveryTimeData.trend" 
          :changeColor="averageDeliveryTimeData.trend && parseFloat(averageDeliveryTimeData.trend) < 0 ? 'text-green-600' : 'text-red-600'"
        />
        
      </div>

    </section>
    
    <section>
      <h2 class="text-xl font-semibold text-gray-900">Métricas de Personal</h2>
      <div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <DashboardStatCard 
          title="Usuarios Registrados" 
          :value="registeredUsersData.isLoading ? 'Cargando...' : registeredUsersData.count" 
          :change="registeredUsersData.isLoading ? '' : registeredUsersData.trend" 
          :changeColor="registeredUsersData.trend && parseFloat(registeredUsersData.trend) < 0 ? 'text-red-600' : 'text-green-600'"
        />
        <DashboardStatCard 
          title="Choferes Activos" 
          :value="activeDriversData.isLoading ? 'Cargando...' : activeDriversData.count" 
          :change="activeDriversData.isLoading ? '' : activeDriversData.trend" 
          :changeColor="activeDriversData.trend && parseFloat(activeDriversData.trend) < 0 ? 'text-red-600' : 'text-green-600'"
        />
        <DashboardStatCard 
          title="Buses Activos" 
          :value="activeBusesData.isLoading ? 'Cargando...' : activeBusesData.count" 
          :change="activeBusesData.isLoading ? '' : activeBusesData.trend" 
          :changeColor="activeBusesData.trend && parseFloat(activeBusesData.trend) < 0 ? 'text-red-600' : 'text-green-600'"
        />
        <DashboardStatCard 
          title="Secretarias Activas" 
          :value="activeSecretariesData.isLoading ? 'Cargando...' : activeSecretariesData.count" 
          :change="activeSecretariesData.isLoading ? '' : activeSecretariesData.trend" 
          :changeColor="activeSecretariesData.trend && parseFloat(activeSecretariesData.trend) < 0 ? 'text-red-600' : 'text-green-600'"
        />
        <DashboardStatCard 
          title="Ayudantes Activos" 
          :value="activeAssistantsData.isLoading ? 'Cargando...' : activeAssistantsData.count" 
          :change="activeAssistantsData.isLoading ? '' : activeAssistantsData.trend" 
          :changeColor="activeAssistantsData.trend && parseFloat(activeAssistantsData.trend) < 0 ? 'text-red-600' : 'text-green-600'"
        />
        
      </div>
    </section>

    <!-- metricas de clientes-->
    <section>
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-xl font-semibold text-gray-900">Métricas de Clientes a lo Largo del Tiempo</h2>
      </div>
      <div class="grid grid-cols-1 gap-6 sm:grid-cols-1 lg:grid-cols-2">
        <!-- Monthly Client Feedback -->
        <MonthlyMetricsChart
          title="Feedback de Clientes por Mes"
          :chartData="monthlyClientFeedbackData.data"
          :isLoading="monthlyClientFeedbackData.isLoading"
          :error="monthlyClientFeedbackData.error"
          :trend="monthlyClientFeedbackData.trend"
          :valueFormatter="(value) => `${value?.toFixed(1) || '0.0'}/5`"
          barColor="#8b5cf6"
          @periodChanged="handleClientFeedbackPeriodChange"
        />
        
        <!-- Monthly Registered Clients -->
        <MonthlyMetricsChart
          title="Clientes Registrados por Mes"
          :chartData="monthlyRegisteredClientsData.data"
          :isLoading="monthlyRegisteredClientsData.isLoading"
          :error="monthlyRegisteredClientsData.error"
          :trend="monthlyRegisteredClientsData.trend"
          :valueFormatter="(value) => value?.toLocaleString() || '0'"
          barColor="#06b6d4"
          @periodChanged="handleRegisteredClientsPeriodChange"
        />
      </div>
    </section>


    <!-- Key Metrics Over Time -->
    <section>
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-xl font-semibold text-gray-900">Métricas Clave a lo Largo del Tiempo</h2>
      </div>
      <div class="grid grid-cols-1 gap-6 sm:grid-cols-1 lg:grid-cols-2 xl:grid-cols-4">
        <!-- Monthly Ticket Stats -->
        <MonthlyMetricsChart
          title="Tickets Vendidos por Mes"
          :chartData="monthlyTicketData.data"
          :isLoading="monthlyTicketData.isLoading"
          :error="monthlyTicketData.error"
          :trend="monthlyTicketData.trend"
          :valueFormatter="(value) => value?.toLocaleString() || '0'"
          barColor="#3b82f6"
          @periodChanged="handleTicketPeriodChange"
        />
        
        <!-- Monthly Reservations Stats -->
        <MonthlyMetricsChart
          title="Reservas por Mes"
          :chartData="monthlyReservationData.data"
          :isLoading="monthlyReservationData.isLoading"
          :error="monthlyReservationData.error"
          :trend="monthlyReservationData.trend"
          :valueFormatter="(value) => value?.toLocaleString() || '0'"
          barColor="#ef4444"
          @periodChanged="handleReservationPeriodChange"
        />
        
        <!-- Monthly Package Stats -->
        <MonthlyMetricsChart
          title="Paquetes Enviados por Mes"
          :chartData="monthlyPackageData.data"
          :isLoading="monthlyPackageData.isLoading"
          :error="monthlyPackageData.error"
          :trend="monthlyPackageData.trend"
          :valueFormatter="(value) => value?.toLocaleString() || '0'"
          barColor="#10b981"
          @periodChanged="handlePackagePeriodChange"
        />
        
        <!-- Monthly Trip Stats -->
        <MonthlyMetricsChart
          title="Viajes Realizados por Mes"
          :chartData="monthlyTripData.data"
          :isLoading="monthlyTripData.isLoading"
          :error="monthlyTripData.error"
          :trend="monthlyTripData.trend"
          :valueFormatter="(value) => value?.toLocaleString() || '0'"
          barColor="#f59e0b"
          @periodChanged="handleTripPeriodChange"
        />
      </div>
    </section>

    <!-- Monthly Revenue Chart Section -->
    <section>
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-xl font-semibold text-gray-900">Análisis de Ingresos</h2>
      </div>
      <div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <!-- Monthly Revenue Chart -->
        <MonthlyMetricsChart
          title="Ingresos por Mes"
          :chartData="monthlyRevenueChartData.data"
          :isLoading="monthlyRevenueChartData.isLoading"
          :error="monthlyRevenueChartData.error"
          :trend="monthlyRevenueChartData.trend"
          :valueFormatter="(value) => `Bs. ${value?.toLocaleString() || '0'}`"
          barColor="#8b5cf6"
          @periodChanged="handleRevenuePeriodChange"
        />
      </div>
    </section>

    <!-- Recent Activity -->
    <section>
      <h2 class="text-xl font-semibold text-gray-900 mb-4">Actividad Reciente</h2>
      <div class="bg-white shadow overflow-hidden sm:rounded-lg">
        <div v-if="isLoadingActivities" class="p-6 text-center text-gray-500">
          Cargando actividades...
        </div>
        <div v-else-if="errorLoadingActivities" class="p-6 text-center text-red-500">
          {{ errorLoadingActivities }}
        </div>
        <div v-else-if="recentActivities.length === 0" class="p-6 text-center text-gray-500">
          No hay actividad reciente para mostrar.
      </div>
        <table v-else class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actividad</th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Detalles</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="activity in recentActivities" :key="activity.id">
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ formatDate(activity.created_at) }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ activity.activity_type || activity.activity }}</td>
              <td class="px-6 py-4 text-sm text-gray-500">{{ activity.details }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <!-- Métricas de Paquetes a lo Largo del Tiempo -->
    <section>
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-xl font-semibold text-gray-900">Métricas de Paquetes a lo Largo del Tiempo</h2>
      </div>
      <div class="grid grid-cols-1 gap-6 sm:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
        <!-- Monthly Packages Sent -->
        <MonthlyMetricsChart
          title="Paquetes Enviados por Mes"
          :chartData="monthlyPackageData.data"
          :isLoading="monthlyPackageData.isLoading"
          :error="monthlyPackageData.error"
          :trend="monthlyPackageData.trend"
          :valueFormatter="(value) => value?.toLocaleString() || '0'"
          barColor="#10b981"
          @periodChanged="handlePackagePeriodChange"
        />
        
        <!-- Monthly Delivered Packages -->
        <MonthlyMetricsChart
          title="Paquetes Entregados por Mes"
          :chartData="monthlyDeliveredPackagesData.data"
          :isLoading="monthlyDeliveredPackagesData.isLoading"
          :error="monthlyDeliveredPackagesData.error"
          :trend="monthlyDeliveredPackagesData.trend"
          :valueFormatter="(value) => value?.toLocaleString() || '0'"
          barColor="#22c55e"
          @periodChanged="handleDeliveredPackagesPeriodChange"
        />
      </div>
      
      <!-- Tarjetas adicionales para métricas complementarias -->
      <div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-2 mt-6">
        <!-- Paquetes pendientes -->
        <DashboardStatCard 
          title="Paquetes Pendientes de Entrega" 
          :value="pendingPackagesData.isLoading ? 'Cargando...' : pendingPackagesData.count" 
          :change="pendingPackagesData.isLoading ? '' : pendingPackagesData.trend" 
          :changeColor="pendingPackagesData.trend && parseFloat(pendingPackagesData.trend) < 0 ? 'text-green-600' : 'text-red-600'"
        />
        <!-- Tiempo promedio de entrega -->
        <DashboardStatCard 
          title="Tiempo promedio de entrega" 
          :value="averageDeliveryTimeData.isLoading ? 'Cargando...' : averageDeliveryTimeData.hours" 
          :change="averageDeliveryTimeData.isLoading ? '' : averageDeliveryTimeData.trend" 
          :changeColor="averageDeliveryTimeData.trend && parseFloat(averageDeliveryTimeData.trend) < 0 ? 'text-green-600' : 'text-red-600'"
        />
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useAuthStore } from '~/stores/auth'
import { activityService } from '~/services/activityService'
import statsService from '~/services/statsService'
import DashboardStatCard from '~/components/DashboardStatCard.vue'
import MonthlyMetricsChart from '~/components/MonthlyMetricsChart.vue'

const authStore = useAuthStore()
const userInfo = computed(() => authStore.user || {})

const recentActivities = ref([])
const isLoadingActivities = ref(false)
const errorLoadingActivities = ref(null)

// Reactive data for Ingresos Paquetes
const packageRevenueData = ref({
  amount: '0',
  trend: '0%',
  isLoading: true,
  error: null
})

// Reactive data for Total Revenue
const totalRevenueData = ref({
  amount: '0',
  trend: '0%',
  isLoading: true,
  error: null
})

// Reactive data for Trip Metrics
const inProgressTripsData = ref({
  count: '0',
  trend: '0%',
  isLoading: true,
  error: null
})

const averageOccupancyData = ref({
  percentage: '0%',
  trend: '0%',
  isLoading: true,
  error: null
})

const totalTripsData = ref({
  count: '0',
  trend: '0%',
  isLoading: true,
  error: null
})

// Reactive data for Package Metrics
const deliveredPackagesData = ref({
  count: '0',
  trend: '0%',
  isLoading: true,
  error: null
})

const pendingPackagesData = ref({
  count: '0',
  trend: '0%',
  isLoading: true,
  error: null
})

const cancelledPackagesData = ref({
  count: '0',
  trend: '0%',
  isLoading: true,
  error: null
})

const averageDeliveryTimeData = ref({
  hours: '0h',
  trend: '0%',
  isLoading: true,
  error: null
})

// Reactive data for Staff Metrics
const registeredUsersData = ref({
  count: '0',
  trend: '0%',
  isLoading: true,
  error: null
})

const activeDriversData = ref({
  count: '0',
  trend: '0%',
  isLoading: true,
  error: null
})

const activeBusesData = ref({
  count: '0',
  trend: '0%',
  isLoading: true,
  error: null
})

const activeSecretariesData = ref({
  count: '0',
  trend: '0%',
  isLoading: true,
  error: null
})

const activeAssistantsData = ref({
  count: '0',
  trend: '0%',
  isLoading: true,
  error: null
})

// Función para formatear la fecha (puedes ajustarla según tus necesidades)
const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  
  try {
    // Si es un string, parsearlo primero
    const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
    
    // Verificar si la fecha es válida
    if (isNaN(date.getTime())) {
      console.warn('Invalid date:', dateString);
      return 'Fecha inválida';
    }
    
    // Formatear la fecha
    const options = { 
      year: 'numeric', 
      month: '2-digit', 
      day: '2-digit', 
      hour: '2-digit', 
      minute: '2-digit',
      timeZone: 'America/La_Paz' // Zona horaria de Bolivia
    };
    return date.toLocaleString('es-ES', options);
  } catch (e) {
    console.error('Error formatting date:', e, dateString);
    return 'Error de fecha';
  }
};

async function loadPackageRevenueStats() {
  packageRevenueData.value.isLoading = true
  packageRevenueData.value.error = null
  try {
    const stats = await statsService.getPackageStats('month') // Fetch for the last month
    packageRevenueData.value.amount = `Bs. ${stats.amount.toLocaleString()}`
    packageRevenueData.value.trend = `${stats.trend >= 0 ? '+' : ''}${stats.trend.toFixed(0)}%`
  } catch (error) {
    console.error('Error loading package revenue stats:', error)
    packageRevenueData.value.error = 'Error al cargar ingresos de paquetes'
    packageRevenueData.value.amount = 'N/A'
    packageRevenueData.value.trend = ''
  } finally {
    packageRevenueData.value.isLoading = false
  }
}

async function loadTotalRevenueStats() {
  totalRevenueData.value.isLoading = true
  totalRevenueData.value.error = null
  try {
    const stats = await statsService.getSalesSummary('month') // Fetch for the last month
    totalRevenueData.value.amount = `Bs. ${stats.totalAmount.toLocaleString()}`
    totalRevenueData.value.trend = `${stats.trend >= 0 ? '+' : ''}${stats.trend.toFixed(0)}%`
  } catch (error) {
    console.error('Error loading total revenue stats:', error)
    totalRevenueData.value.error = 'Error al cargar ingresos totales'
    totalRevenueData.value.amount = 'N/A'
    totalRevenueData.value.trend = ''
  } finally {
    totalRevenueData.value.isLoading = false
  }
}

// Funciones para cargar estadísticas de viajes restantes
async function loadInProgressTripsStats() {
  inProgressTripsData.value.isLoading = true
  inProgressTripsData.value.error = null
  try {
    const stats = await statsService.getInProgressTripsStats('month')
    inProgressTripsData.value.count = stats.count.toLocaleString()
    inProgressTripsData.value.trend = `${stats.trend >= 0 ? '+' : ''}${stats.trend.toFixed(0)}%`
  } catch (error) {
    console.error('Error loading in-progress trips stats:', error)
    inProgressTripsData.value.error = 'Error al cargar viajes en curso'
    inProgressTripsData.value.count = 'N/A'
    inProgressTripsData.value.trend = ''
  } finally {
    inProgressTripsData.value.isLoading = false
  }
}

async function loadAverageOccupancyStats() {
  averageOccupancyData.value.isLoading = true
  averageOccupancyData.value.error = null
  try {
    const stats = await statsService.getAverageOccupancyStats('month')
    averageOccupancyData.value.percentage = `${stats.percentage || stats.count}%`
    averageOccupancyData.value.trend = `${stats.trend >= 0 ? '+' : ''}${stats.trend.toFixed(0)}%`
  } catch (error) {
    console.error('Error loading average occupancy stats:', error)
    averageOccupancyData.value.error = 'Error al cargar ocupación promedio'
    averageOccupancyData.value.percentage = 'N/A'
    averageOccupancyData.value.trend = ''
  } finally {
    averageOccupancyData.value.isLoading = false
  }
}

async function loadTotalTripsStats() {
  totalTripsData.value.isLoading = true
  totalTripsData.value.error = null
  try {
    const stats = await statsService.getTripStats('month')
    totalTripsData.value.count = stats.count.toLocaleString()
    totalTripsData.value.trend = `${stats.trend >= 0 ? '+' : ''}${stats.trend.toFixed(0)}%`
  } catch (error) {
    console.error('Error loading total trips stats:', error)
    totalTripsData.value.error = 'Error al cargar estadísticas de viajes'
    totalTripsData.value.count = 'N/A'
    totalTripsData.value.trend = ''
  } finally {
    totalTripsData.value.isLoading = false
  }
}

// Funciones para cargar estadísticas de paquetes
async function loadDeliveredPackagesStats() {
  deliveredPackagesData.value.isLoading = true
  deliveredPackagesData.value.error = null
  try {
    const stats = await statsService.getDeliveredPackagesStats('month')
    deliveredPackagesData.value.count = stats.count.toLocaleString()
    deliveredPackagesData.value.trend = `${stats.trend >= 0 ? '+' : ''}${stats.trend.toFixed(0)}%`
  } catch (error) {
    console.error('Error loading delivered packages stats:', error)
    deliveredPackagesData.value.error = 'Error al cargar paquetes entregados'
    deliveredPackagesData.value.count = 'N/A'
    deliveredPackagesData.value.trend = ''
  } finally {
    deliveredPackagesData.value.isLoading = false
  }
}

async function loadPendingPackagesStats() {
  pendingPackagesData.value.isLoading = true
  pendingPackagesData.value.error = null
  try {
    const stats = await statsService.getPendingPackagesStats('month')
    pendingPackagesData.value.count = stats.count.toLocaleString()
    pendingPackagesData.value.trend = `${stats.trend >= 0 ? '+' : ''}${stats.trend.toFixed(0)}%`
  } catch (error) {
    console.error('Error loading pending packages stats:', error)
    pendingPackagesData.value.error = 'Error al cargar paquetes pendientes'
    pendingPackagesData.value.count = 'N/A'
    pendingPackagesData.value.trend = ''
  } finally {
    pendingPackagesData.value.isLoading = false
  }
}

async function loadCancelledPackagesStats() {
  cancelledPackagesData.value.isLoading = true
  cancelledPackagesData.value.error = null
  try {
    const stats = await statsService.getCancelledPackagesStats('month')
    cancelledPackagesData.value.count = stats.count.toLocaleString()
    cancelledPackagesData.value.trend = `${stats.trend >= 0 ? '+' : ''}${stats.trend.toFixed(0)}%`
  } catch (error) {
    console.error('Error loading cancelled packages stats:', error)
    cancelledPackagesData.value.error = 'Error al cargar paquetes cancelados'
    cancelledPackagesData.value.count = 'N/A'
    cancelledPackagesData.value.trend = ''
  } finally {
    cancelledPackagesData.value.isLoading = false
  }
}

async function loadAverageDeliveryTimeStats() {
  averageDeliveryTimeData.value.isLoading = true
  averageDeliveryTimeData.value.error = null
  try {
    const stats = await statsService.getAverageDeliveryTimeStats('month')
    averageDeliveryTimeData.value.hours = stats.display || `${stats.hours || stats.count}h`
    averageDeliveryTimeData.value.trend = `${stats.trend >= 0 ? '+' : ''}${stats.trend.toFixed(0)}%`
  } catch (error) {
    console.error('Error loading average delivery time stats:', error)
    averageDeliveryTimeData.value.error = 'Error al cargar tiempo promedio de entrega'
    averageDeliveryTimeData.value.hours = 'N/A'
    averageDeliveryTimeData.value.trend = ''
  } finally {
    averageDeliveryTimeData.value.isLoading = false
  }
}

// Funciones para cargar estadísticas de personal
async function loadRegisteredUsersStats() {
  registeredUsersData.value.isLoading = true
  registeredUsersData.value.error = null
  try {
    const stats = await statsService.getRegisteredUsersStats('month')
    registeredUsersData.value.count = stats.count.toLocaleString()
    registeredUsersData.value.trend = `${stats.trend >= 0 ? '+' : ''}${stats.trend.toFixed(0)}%`
  } catch (error) {
    console.error('Error loading registered users stats:', error)
    registeredUsersData.value.error = 'Error al cargar usuarios registrados'
    registeredUsersData.value.count = 'N/A'
    registeredUsersData.value.trend = ''
  } finally {
    registeredUsersData.value.isLoading = false
  }
}

async function loadActiveDriversStats() {
  activeDriversData.value.isLoading = true
  activeDriversData.value.error = null
  try {
    const stats = await statsService.getActiveDriversStats()
    activeDriversData.value.count = stats.count.toLocaleString()
    activeDriversData.value.trend = `${stats.trend >= 0 ? '+' : ''}${stats.trend.toFixed(0)}%`
  } catch (error) {
    console.error('Error loading active drivers stats:', error)
    activeDriversData.value.error = 'Error al cargar choferes activos'
    activeDriversData.value.count = 'N/A'
    activeDriversData.value.trend = ''
  } finally {
    activeDriversData.value.isLoading = false
  }
}

async function loadActiveBusesStats() {
  activeBusesData.value.isLoading = true
  activeBusesData.value.error = null
  try {
    const stats = await statsService.getActiveBusesStats()
    activeBusesData.value.count = stats.count.toLocaleString()
    activeBusesData.value.trend = `${stats.trend >= 0 ? '+' : ''}${stats.trend.toFixed(0)}%`
  } catch (error) {
    console.error('Error loading active buses stats:', error)
    activeBusesData.value.error = 'Error al cargar buses activos'
    activeBusesData.value.count = 'N/A'
    activeBusesData.value.trend = ''
  } finally {
    activeBusesData.value.isLoading = false
  }
}

async function loadActiveSecretariesStats() {
  activeSecretariesData.value.isLoading = true
  activeSecretariesData.value.error = null
  try {
    const stats = await statsService.getActiveSecretariesStats()
    activeSecretariesData.value.count = stats.count.toLocaleString()
    activeSecretariesData.value.trend = `${stats.trend >= 0 ? '+' : ''}${stats.trend.toFixed(0)}%`
  } catch (error) {
    console.error('Error loading active secretaries stats:', error)
    activeSecretariesData.value.error = 'Error al cargar secretarias activas'
    activeSecretariesData.value.count = 'N/A'
    activeSecretariesData.value.trend = ''
  } finally {
    activeSecretariesData.value.isLoading = false
  }
}

async function loadActiveAssistantsStats() {
  activeAssistantsData.value.isLoading = true
  activeAssistantsData.value.error = null
  try {
    const stats = await statsService.getActiveAssistantsStats()
    activeAssistantsData.value.count = stats.count.toLocaleString()
    activeAssistantsData.value.trend = `${stats.trend >= 0 ? '+' : ''}${stats.trend.toFixed(0)}%`
  } catch (error) {
    console.error('Error loading active assistants stats:', error)
    activeAssistantsData.value.error = 'Error al cargar ayudantes activos'
    activeAssistantsData.value.count = 'N/A'
    activeAssistantsData.value.trend = ''
  } finally {
    activeAssistantsData.value.isLoading = false
  }
}

// Datos reactivos para métricas mensuales
const monthlyTicketData = ref({
  data: [],
  isLoading: true,
  error: null,
  trend: 0
})

const monthlyPackageData = ref({
  data: [],
  isLoading: true,
  error: null,
  trend: 0
})

const monthlyTripData = ref({
  data: [],
  isLoading: true,
  error: null,
  trend: 0
})

const monthlyRevenueChartData = ref({
  data: [],
  isLoading: true,
  error: null,
  trend: 0
})

const monthlyReservationData = ref({
  data: [],
  isLoading: true,
  error: null,
  trend: 0
})

// Datos reactivos para gráficos de ingresos específicos
const monthlyTicketRevenueData = ref({
  data: [],
  isLoading: true,
  error: null,
  trend: 0
})

const monthlyPackageRevenueData = ref({
  data: [],
  isLoading: true,
  error: null,
  trend: 0
})

// Datos reactivos para gráfico de boletos cancelados mensuales
const monthlyCancelledTicketData = ref({
  data: [],
  isLoading: true,
  error: null,
  trend: 0
})

// Datos reactivos para gráficos de viajes mensuales
const monthlyCompletedTripData = ref({
  data: [],
  isLoading: true,
  error: null,
  trend: 0
})

const monthlyCancelledTripData = ref({
  data: [],
  isLoading: true,
  error: null,
  trend: 0
})

// Datos reactivos para gráficos de clientes mensuales
const monthlyClientFeedbackData = ref({
  data: [],
  isLoading: true,
  error: null,
  trend: 0
})

const monthlyRegisteredClientsData = ref({
  data: [],
  isLoading: true,
  error: null,
  trend: 0
})

// Datos reactivos para gráficos de paquetes mensuales
const monthlyDeliveredPackagesData = ref({
  data: [],
  isLoading: true,
  error: null,
  trend: 0
})

// Funciones para cargar estadísticas mensuales
async function loadMonthlyTicketStats(months = 6) {
  monthlyTicketData.value.isLoading = true
  monthlyTicketData.value.error = null
  try {
    console.log('🔄 Cargando estadísticas mensuales de tickets...')
    const stats = await statsService.getMonthlyTicketStats(months)
    monthlyTicketData.value.data = stats.data || []
    monthlyTicketData.value.trend = stats.trend || 0
    console.log('✅ Datos mensuales de tickets cargados:', stats)
  } catch (error) {
    console.error('❌ Error loading monthly ticket stats:', error)
    monthlyTicketData.value.error = 'Error al cargar estadísticas mensuales de tickets'
    monthlyTicketData.value.data = []
  } finally {
    monthlyTicketData.value.isLoading = false
  }
}

async function loadMonthlyPackageStats(months = 6) {
  monthlyPackageData.value.isLoading = true
  monthlyPackageData.value.error = null
  try {
    console.log('🔄 Cargando estadísticas mensuales de paquetes...')
    const stats = await statsService.getMonthlyPackageStats(months)
    monthlyPackageData.value.data = stats.data || []
    monthlyPackageData.value.trend = stats.trend || 0
    console.log('✅ Datos mensuales de paquetes cargados:', stats)
  } catch (error) {
    console.error('❌ Error loading monthly package stats:', error)
    monthlyPackageData.value.error = 'Error al cargar estadísticas mensuales de paquetes'
    monthlyPackageData.value.data = []
  } finally {
    monthlyPackageData.value.isLoading = false
  }
}

async function loadMonthlyTripStats(months = 6) {
  monthlyTripData.value.isLoading = true
  monthlyTripData.value.error = null
  try {
    console.log('🔄 Cargando estadísticas mensuales de viajes...')
    const stats = await statsService.getMonthlyTripStats(months)
    monthlyTripData.value.data = stats.data || []
    monthlyTripData.value.trend = stats.trend || 0
    console.log('✅ Datos mensuales de viajes cargados:', stats)
  } catch (error) {
    console.error('❌ Error loading monthly trip stats:', error)
    monthlyTripData.value.error = 'Error al cargar estadísticas mensuales de viajes'
    monthlyTripData.value.data = []
  } finally {
    monthlyTripData.value.isLoading = false
  }
}

async function loadMonthlyRevenueStats(months = 6) {
  monthlyRevenueChartData.value.isLoading = true
  monthlyRevenueChartData.value.error = null
  try {
    console.log('🔄 Cargando estadísticas mensuales de ingresos...')
    const stats = await statsService.getMonthlyRevenueStats(months)
    monthlyRevenueChartData.value.data = stats.data || []
    monthlyRevenueChartData.value.trend = stats.trend || 0
    console.log('✅ Datos mensuales de ingresos cargados:', stats)
  } catch (error) {
    console.error('❌ Error loading monthly revenue stats:', error)
    monthlyRevenueChartData.value.error = 'Error al cargar estadísticas mensuales de ingresos'
    monthlyRevenueChartData.value.data = []
  } finally {
    monthlyRevenueChartData.value.isLoading = false
  }
}

async function loadMonthlyReservationStats(months = 6) {
  monthlyReservationData.value.isLoading = true
  monthlyReservationData.value.error = null
  try {
    console.log('🔄 Cargando estadísticas mensuales de reservas...')
    const stats = await statsService.getMonthlyReservationStats(months)
    monthlyReservationData.value.data = stats.data || []
    monthlyReservationData.value.trend = stats.trend || 0
    console.log('✅ Datos mensuales de reservas cargados:', stats)
  } catch (error) {
    console.error('❌ Error loading monthly reservation stats:', error)
    monthlyReservationData.value.error = 'Error al cargar estadísticas mensuales de reservas'
    monthlyReservationData.value.data = []
  } finally {
    monthlyReservationData.value.isLoading = false
  }
}

// Funciones de manejo de cambios de período
const handleTicketPeriodChange = (months) => {
  console.log('📅 Cambiando período de tickets a:', months, 'meses')
  loadMonthlyTicketStats(months)
}

const handlePackagePeriodChange = (months) => {
  console.log('📅 Cambiando período de paquetes a:', months, 'meses')
  loadMonthlyPackageStats(months)
}

const handleTripPeriodChange = (months) => {
  console.log('📅 Cambiando período de viajes a:', months, 'meses')
  loadMonthlyTripStats(months)
}

const handleRevenuePeriodChange = (months) => {
  console.log('📅 Cambiando período de ingresos a:', months, 'meses')
  loadMonthlyRevenueStats(months)
}

const handleReservationPeriodChange = (months) => {
  console.log('📅 Cambiando período de reservas a:', months, 'meses')
  loadMonthlyReservationStats(months)
}

// Funciones de manejo de cambios de período para gráficos de ingresos específicos
const handleTicketRevenuePeriodChange = (months) => {
  console.log('📅 Cambiando período de ingresos por boletos a:', months, 'meses')
  loadMonthlyTicketRevenueStats(months)
}

const handlePackageRevenuePeriodChange = (months) => {
  console.log('📅 Cambiando período de ingresos por paquetes a:', months, 'meses')
  loadMonthlyPackageRevenueStats(months)
}

// Función de manejo de cambio de período para boletos cancelados
const handleCancelledTicketPeriodChange = (months) => {
  console.log('📅 Cambiando período de boletos cancelados a:', months, 'meses')
  loadMonthlyCancelledTicketStats(months)
}

// Funciones de manejo de cambio de período para viajes
const handleCompletedTripPeriodChange = (months) => {
  console.log('📅 Cambiando período de viajes completados a:', months, 'meses')
  loadMonthlyCompletedTripStats(months)
}

const handleCancelledTripPeriodChange = (months) => {
  console.log('📅 Cambiando período de viajes cancelados a:', months, 'meses')
  loadMonthlyCancelledTripStats(months)
}

// Funciones de manejo de cambio de período para clientes
const handleClientFeedbackPeriodChange = (months) => {
  console.log('📅 Cambiando período de feedback de clientes a:', months, 'meses')
  loadMonthlyClientFeedbackStats(months)
}

const handleRegisteredClientsPeriodChange = (months) => {
  console.log('📅 Cambiando período de clientes registrados a:', months, 'meses')
  loadMonthlyRegisteredClientsStats(months)
}

// Función de manejo de cambio de período para paquetes entregados
const handleDeliveredPackagesPeriodChange = (months) => {
  console.log('📅 Cambiando período de paquetes entregados a:', months, 'meses')
  loadMonthlyDeliveredPackagesStats(months)
}

async function loadRecentActivities() {
  isLoadingActivities.value = true
  errorLoadingActivities.value = null
  try {
    recentActivities.value = await activityService.fetchRecentActivities()
  } catch (error) {
    console.error('Error loading recent activities in component:', error)
    errorLoadingActivities.value = 'No se pudieron cargar las actividades recientes.'
    recentActivities.value = []
  } finally {
    isLoadingActivities.value = false
  }
}

onMounted(() => {
  loadRecentActivities()
  loadPackageRevenueStats()
  loadTotalRevenueStats()
  loadInProgressTripsStats()
  loadAverageOccupancyStats()
  loadTotalTripsStats()
  loadDeliveredPackagesStats()
  loadPendingPackagesStats()
  loadCancelledPackagesStats()
  loadAverageDeliveryTimeStats()
  loadRegisteredUsersStats()
  loadActiveDriversStats()
  loadActiveBusesStats()
  loadActiveSecretariesStats()
  loadActiveAssistantsStats()
  
  // Cargar estadísticas mensuales
  loadMonthlyTicketStats()
  loadMonthlyReservationStats()
  loadMonthlyPackageStats()
  loadMonthlyTripStats()
  loadMonthlyRevenueStats()
  
  // Cargar estadísticas de ingresos específicos
  loadMonthlyTicketRevenueStats()
  loadMonthlyPackageRevenueStats()
  
  // Cargar estadísticas de boletos cancelados mensuales
  loadMonthlyCancelledTicketStats()
  
  // Cargar estadísticas de viajes mensuales
  loadMonthlyCompletedTripStats()
  loadMonthlyCancelledTripStats()
  
  // Cargar estadísticas de clientes mensuales
  loadMonthlyClientFeedbackStats()
  loadMonthlyRegisteredClientsStats()
  loadMonthlyDeliveredPackagesStats()
})

definePageMeta({
  requiredRoles: ['admin']
})

// Aquí iría la lógica para cargar los datos del dashboard
// Por ejemplo, llamadas a la API para obtener bookings, revenue, etc.

// Funciones para cargar estadísticas mensuales de ingresos específicos
async function loadMonthlyTicketRevenueStats(months = 6) {
  monthlyTicketRevenueData.value.isLoading = true
  monthlyTicketRevenueData.value.error = null
  try {
    console.log('🔄 Cargando estadísticas mensuales de ingresos por boletos...')
    const stats = await statsService.getMonthlyTicketRevenueStats(months)
    monthlyTicketRevenueData.value.data = stats.data || []
    monthlyTicketRevenueData.value.trend = stats.trend || 0
    console.log('✅ Datos mensuales de ingresos por boletos cargados:', stats)
  } catch (error) {
    console.error('❌ Error loading monthly ticket revenue stats:', error)
    monthlyTicketRevenueData.value.error = 'Error al cargar estadísticas mensuales de ingresos por boletos'
    monthlyTicketRevenueData.value.data = []
  } finally {
    monthlyTicketRevenueData.value.isLoading = false
  }
}

async function loadMonthlyPackageRevenueStats(months = 6) {
  monthlyPackageRevenueData.value.isLoading = true
  monthlyPackageRevenueData.value.error = null
  try {
    console.log('🔄 Cargando estadísticas mensuales de ingresos por paquetes...')
    const stats = await statsService.getMonthlyPackageRevenueStats(months)
    monthlyPackageRevenueData.value.data = stats.data || []
    monthlyPackageRevenueData.value.trend = stats.trend || 0
    console.log('✅ Datos mensuales de ingresos por paquetes cargados:', stats)
  } catch (error) {
    console.error('❌ Error loading monthly package revenue stats:', error)
    monthlyPackageRevenueData.value.error = 'Error al cargar estadísticas mensuales de ingresos por paquetes'
    monthlyPackageRevenueData.value.data = []
  } finally {
    monthlyPackageRevenueData.value.isLoading = false
  }
}

async function loadMonthlyCancelledTicketStats(months = 6) {
  monthlyCancelledTicketData.value.isLoading = true
  monthlyCancelledTicketData.value.error = null
  try {
    console.log('🔄 Cargando estadísticas mensuales de boletos cancelados...')
    const stats = await statsService.getMonthlyCancelledTicketStats(months)
    monthlyCancelledTicketData.value.data = stats.data || []
    monthlyCancelledTicketData.value.trend = stats.trend || 0
    console.log('✅ Datos mensuales de boletos cancelados cargados:', stats)
  } catch (error) {
    console.error('❌ Error loading monthly cancelled ticket stats:', error)
    monthlyCancelledTicketData.value.error = 'Error al cargar estadísticas mensuales de boletos cancelados'
    monthlyCancelledTicketData.value.data = []
  } finally {
    monthlyCancelledTicketData.value.isLoading = false
  }
}

async function loadMonthlyCompletedTripStats(months = 6) {
  monthlyCompletedTripData.value.isLoading = true
  monthlyCompletedTripData.value.error = null
  try {
    console.log('🔄 Cargando estadísticas mensuales de viajes completados...')
    const stats = await statsService.getMonthlyCompletedTripStats(months)
    monthlyCompletedTripData.value.data = stats.data || []
    monthlyCompletedTripData.value.trend = stats.trend || 0
    console.log('✅ Datos mensuales de viajes completados cargados:', stats)
  } catch (error) {
    console.error('❌ Error loading monthly completed trip stats:', error)
    monthlyCompletedTripData.value.error = 'Error al cargar estadísticas mensuales de viajes completados'
    monthlyCompletedTripData.value.data = []
  } finally {
    monthlyCompletedTripData.value.isLoading = false
  }
}

async function loadMonthlyCancelledTripStats(months = 6) {
  monthlyCancelledTripData.value.isLoading = true
  monthlyCancelledTripData.value.error = null
  try {
    console.log('🔄 Cargando estadísticas mensuales de viajes cancelados...')
    const stats = await statsService.getMonthlyCancelledTripStats(months)
    monthlyCancelledTripData.value.data = stats.data || []
    monthlyCancelledTripData.value.trend = stats.trend || 0
    console.log('✅ Datos mensuales de viajes cancelados cargados:', stats)
  } catch (error) {
    console.error('❌ Error loading monthly cancelled trip stats:', error)
    monthlyCancelledTripData.value.error = 'Error al cargar estadísticas mensuales de viajes cancelados'
    monthlyCancelledTripData.value.data = []
  } finally {
    monthlyCancelledTripData.value.isLoading = false
  }
}

async function loadMonthlyClientFeedbackStats(months = 6) {
  monthlyClientFeedbackData.value.isLoading = true
  monthlyClientFeedbackData.value.error = null
  try {
    console.log('🔄 Cargando estadísticas mensuales de feedback de clientes...')
    const stats = await statsService.getMonthlyClientFeedbackStats(months)
    monthlyClientFeedbackData.value.data = stats.data || []
    monthlyClientFeedbackData.value.trend = stats.trend || 0
    console.log('✅ Datos mensuales de feedback de clientes cargados:', stats)
  } catch (error) {
    console.error('❌ Error loading monthly client feedback stats:', error)
    monthlyClientFeedbackData.value.error = 'Error al cargar estadísticas mensuales de feedback de clientes'
    monthlyClientFeedbackData.value.data = []
  } finally {
    monthlyClientFeedbackData.value.isLoading = false
  }
}

async function loadMonthlyRegisteredClientsStats(months = 6) {
  monthlyRegisteredClientsData.value.isLoading = true
  monthlyRegisteredClientsData.value.error = null
  try {
    console.log('🔄 Cargando estadísticas mensuales de clientes registrados...')
    const stats = await statsService.getMonthlyRegisteredClientsStats(months)
    monthlyRegisteredClientsData.value.data = stats.data || []
    monthlyRegisteredClientsData.value.trend = stats.trend || 0
    console.log('✅ Datos mensuales de clientes registrados cargados:', stats)
  } catch (error) {
    console.error('❌ Error loading monthly registered clients stats:', error)
    monthlyRegisteredClientsData.value.error = 'Error al cargar estadísticas mensuales de clientes registrados'
    monthlyRegisteredClientsData.value.data = []
  } finally {
    monthlyRegisteredClientsData.value.isLoading = false
  }
}

async function loadMonthlyDeliveredPackagesStats(months = 6) {
  monthlyDeliveredPackagesData.value.isLoading = true
  monthlyDeliveredPackagesData.value.error = null
  try {
    console.log('🔄 Cargando estadísticas mensuales de paquetes entregados...')
    const stats = await statsService.getMonthlyDeliveredPackagesStats(months)
    monthlyDeliveredPackagesData.value.data = stats.data || []
    monthlyDeliveredPackagesData.value.trend = stats.trend || 0
    console.log('✅ Datos mensuales de paquetes entregados cargados:', stats)
  } catch (error) {
    console.error('❌ Error loading monthly delivered packages stats:', error)
    monthlyDeliveredPackagesData.value.error = 'Error al cargar estadísticas mensuales de paquetes entregados'
    monthlyDeliveredPackagesData.value.data = []
  } finally {
    monthlyDeliveredPackagesData.value.isLoading = false
  }
}
</script>

<style scoped>
/* Estilos específicos para esta página si son necesarios */
</style>
