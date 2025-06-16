<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-50 to-slate-100 w-full">
    <!-- Modern Header with gradient background -->
    <div class="bg-white shadow-sm border-b border-gray-200 w-full">
      <div class="w-full px-2 sm:px-4 lg:px-6 py-4">
        <div class="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4">
          <div class="flex items-center space-x-4">
            <div class="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-indigo-600 to-purple-700 rounded-xl shadow-lg">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 11V6.5m0 4.5v4.5m0-4.5h8m-8 0a4 4 0 110-8h8a4 4 0 110 8m-8 0a4 4 0 100 8h8a4 4 0 100-8" />
              </svg>
            </div>
            <div>
              <h1 class="text-2xl font-bold text-gray-900">Gestión de Viajes</h1>
              <p class="text-gray-700">Administra y organiza todos los viajes</p>
            </div>
          </div>
          <div class="flex items-center space-x-4">
            <!-- Quick stats -->
            <div class="hidden md:flex items-center space-x-6 text-sm">
              <div class="text-center">
                <div class="text-lg font-bold text-indigo-600">{{ quickStats.totalTrips || '...' }}</div>
                <div class="text-gray-600">Total</div>
              </div>
              <div class="text-center">
                <div class="text-lg font-bold text-green-600">{{ quickStats.scheduledTrips || '...' }}</div>
                <div class="text-gray-600">Programados</div>
              </div>
              <div class="text-center">
                <div class="text-lg font-bold text-orange-600">{{ quickStats.inProgressTrips || '...' }}</div>
                <div class="text-gray-600">En curso</div>
              </div>
            </div>
            <AppButton
              variant="primary"
              @click="navigateTo('/trips/new')"
              class="bg-gradient-to-r from-indigo-600 to-purple-700 hover:from-indigo-700 hover:to-purple-800 shadow-lg"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Nuevo Viaje
            </AppButton>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="w-full px-2 sm:px-4 lg:px-6 py-6 overflow-x-hidden">
      <!-- Quick Action Cards -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div @click="handleQuickAction('new-trip')" class="group bg-white rounded-2xl p-4 lg:p-6 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer border border-gray-200 hover:border-indigo-300 transform hover:-translate-y-1">
          <div class="flex items-center space-x-3 lg:space-x-4">
            <div class="flex items-center justify-center w-10 h-10 lg:w-12 lg:h-12 bg-indigo-100 group-hover:bg-indigo-200 rounded-xl transition-colors flex-shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 lg:h-6 lg:w-6 text-indigo-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <div class="min-w-0 flex-1">
              <h3 class="text-base lg:text-lg font-semibold text-gray-900 group-hover:text-indigo-700 transition-colors truncate">Nuevo Viaje</h3>
              <p class="text-gray-600 text-sm truncate">Crear viaje programado</p>
            </div>
          </div>
        </div>

        <div @click="handleQuickAction('routes')" class="group bg-white rounded-2xl p-4 lg:p-6 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer border border-gray-200 hover:border-green-300 transform hover:-translate-y-1">
          <div class="flex items-center space-x-3 lg:space-x-4">
            <div class="flex items-center justify-center w-10 h-10 lg:w-12 lg:h-12 bg-green-100 group-hover:bg-green-200 rounded-xl transition-colors flex-shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 lg:h-6 lg:w-6 text-green-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
            </div>
            <div class="min-w-0 flex-1">
              <h3 class="text-base lg:text-lg font-semibold text-gray-900 group-hover:text-green-700 transition-colors truncate">Rutas</h3>
              <p class="text-gray-600 text-sm truncate">Gestionar rutas</p>
            </div>
          </div>
        </div>

        <div @click="handleQuickAction('schedule')" class="group bg-white rounded-2xl p-4 lg:p-6 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer border border-gray-200 hover:border-blue-300 transform hover:-translate-y-1">
          <div class="flex items-center space-x-3 lg:space-x-4">
            <div class="flex items-center justify-center w-10 h-10 lg:w-12 lg:h-12 bg-blue-100 group-hover:bg-blue-200 rounded-xl transition-colors flex-shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 lg:h-6 lg:w-6 text-blue-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div class="min-w-0 flex-1">
              <h3 class="text-base lg:text-lg font-semibold text-gray-900 group-hover:text-blue-700 transition-colors truncate">Horarios</h3>
              <p class="text-gray-600 text-sm truncate">Ver calendario</p>
            </div>
          </div>
        </div>

        <div @click="handleQuickAction('reports')" class="group bg-white rounded-2xl p-4 lg:p-6 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer border border-gray-200 hover:border-purple-300 transform hover:-translate-y-1">
          <div class="flex items-center space-x-3 lg:space-x-4">
            <div class="flex items-center justify-center w-10 h-10 lg:w-12 lg:h-12 bg-purple-100 group-hover:bg-purple-200 rounded-xl transition-colors flex-shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 lg:h-6 lg:w-6 text-purple-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div class="min-w-0 flex-1">
              <h3 class="text-base lg:text-lg font-semibold text-gray-900 group-hover:text-purple-700 transition-colors truncate">Reportes</h3>
              <p class="text-gray-600 text-sm truncate">Análisis de viajes</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Filters Section -->
      <div class="mb-6">
        <TripFilters
          :initial-filters="pageFilters"
          @filter-change="handleFilterChange"
          @sort-change="handleSortChange" 
        />
      </div>

      <!-- Error State with better design -->
      <div v-if="tripStore.error" class="mb-6">
        <div class="bg-red-50 border-l-4 border-red-500 rounded-lg p-6 shadow-sm">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <svg class="h-6 w-6 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
              </svg>
            </div>
            <div class="ml-4">
              <h3 class="text-lg font-semibold text-red-800">Error al cargar viajes</h3>
              <p class="text-red-700 mt-1">{{ tripStore.error }}</p>
              <button @click="loadTrips" class="mt-3 text-sm bg-red-100 hover:bg-red-200 text-red-800 font-medium px-4 py-2 rounded-lg transition-colors border border-red-300">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-2 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Intentar nuevamente
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Trip Cards with improved layout -->
      <div class="mb-6">
        <div class="flex items-center justify-between mb-4">
          <div class="flex items-center space-x-4">
            <h2 class="text-xl font-bold text-gray-900">Lista de Viajes</h2>
            <div v-if="!tripStore.isLoading && tripStore.trips" class="flex items-center space-x-2 text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <span class="font-medium">{{ tripStore.pagination.totalItems }} viajes encontrados</span>
            </div>
          </div>
          <div class="flex items-center space-x-2">
            <!-- View toggle buttons -->
            <div class="flex bg-gray-100 rounded-lg p-1">
              <button
                @click="viewMode = 'grid'"
                :class="[
                  viewMode === 'grid' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-600 hover:text-gray-900',
                  'p-2 rounded-md transition-colors duration-200'
                ]"
                aria-label="Vista en cuadrícula"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
              </button>
              <button
                @click="viewMode = 'list'"
                :class="[
                  viewMode === 'list' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-600 hover:text-gray-900',
                  'p-2 rounded-md transition-colors duration-200'
                ]"
                aria-label="Vista en lista"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        <TripCardList
          :trips="tripStore.trips"
          :loading="tripStore.isLoading"
          :current-page="tripStore.pagination.currentPage"
          :total-items="tripStore.pagination.totalItems"
          :items-per-page="tripStore.pagination.itemsPerPage"
          :view-mode="viewMode"
          @page-change="handlePageChange"
          @view-trip="handleViewTrip"
          @edit-trip="handleEditTrip"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue';
import { useRouter, navigateTo } from '#app';
import { useTripStore } from '~/stores/tripStore';
import TripFilters from '~/components/TripFilters.vue'; 
import TripCardList from '~/components/TripCardList.vue';

const router = useRouter();
const tripStore = useTripStore();

// View mode for trips display
const viewMode = ref('grid');

// Set default filters to show upcoming trips
const getCurrentDateString = () => {
  return new Date().toISOString().split('T')[0];
};

const getDateInDays = (days) => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().split('T')[0];
};

const pageFilters = reactive({
  origin: '',
  destination: '',
  date: '',
  status: 'scheduled', // Default to scheduled trips
  search: '',
  dateFrom: getCurrentDateString(), // From today
  dateTo: getDateInDays(30), // Next 30 days
  minSeats: ''
});

const pageSortBy = ref(tripStore.pagination.sortBy || 'trip_datetime');
const pageSortDirection = ref(tripStore.pagination.sortDirection || 'asc'); // Show nearest first

// Quick stats computed from trips data
const quickStats = computed(() => {
  if (!tripStore.trips || tripStore.trips.length === 0) {
    return {
      totalTrips: 0,
      scheduledTrips: 0,
      inProgressTrips: 0,
      completedTrips: 0
    };
  }

  return {
    totalTrips: tripStore.pagination.totalItems || tripStore.trips.length,
    scheduledTrips: tripStore.trips.filter(trip => trip.status === 'scheduled').length,
    inProgressTrips: tripStore.trips.filter(trip => trip.status === 'in_progress').length,
    completedTrips: tripStore.trips.filter(trip => trip.status === 'completed').length
  };
});

const loadTrips = () => {
  tripStore.fetchTrips({
    page: tripStore.pagination.currentPage,
    itemsPerPage: tripStore.pagination.itemsPerPage,
    sortBy: pageSortBy.value,
    sortDirection: pageSortDirection.value,
    filters: { ...pageFilters }
  });
};

onMounted(() => {
  loadTrips(); 
});

const handlePageChange = (newPage) => {
  tripStore.fetchTrips({
    page: newPage,
    itemsPerPage: tripStore.pagination.itemsPerPage,
    sortBy: pageSortBy.value,
    sortDirection: pageSortDirection.value,
    filters: { ...pageFilters }
  });
};

const handleSortChange = ({ column, direction }) => {
  pageSortBy.value = column;
  pageSortDirection.value = direction;
  tripStore.fetchTrips({
    page: 1, 
    itemsPerPage: tripStore.pagination.itemsPerPage,
    sortBy: pageSortBy.value,
    sortDirection: pageSortDirection.value,
    filters: { ...pageFilters }
  });
};

const handleFilterChange = (newFilters) => {
  Object.assign(pageFilters, newFilters);
  tripStore.fetchTrips({
    page: 1,
    itemsPerPage: tripStore.pagination.itemsPerPage,
    sortBy: pageSortBy.value,
    sortDirection: pageSortDirection.value,
    filters: { ...pageFilters }
  });
};

const handleViewTrip = (tripId) => {
  router.push(`/trips/${tripId}`);
};

const handleEditTrip = (tripId) => {
  router.push(`/trips/${tripId}/edit`);
};

const handleQuickAction = (action) => {
  switch (action) {
    case 'new-trip':
      navigateTo('/trips/new');
      break;
    case 'routes':
      navigateTo('/routes');
      break;
    case 'schedule':
      // Add schedule view or calendar
      console.log('Navigate to schedule view');
      break;
    case 'reports':
      navigateTo('/reports/trips');
      break;
    default:
      console.log(`Unknown action: ${action}`);
  }
};

// Set page title and meta
useHead({
  title: 'Gestión de Viajes - Trans Comarapa',
  meta: [
    { name: 'description', content: 'Administra y organiza todos los viajes de Trans Comarapa' }
  ]
});

// No definePageMeta needed here if auth.global.ts is active
// definePageMeta({
//   middleware: ['auth'] 
// })
</script>
