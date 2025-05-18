<template>
  <div>
    <div class="py-6">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center mb-6">
          <h1 class="text-2xl font-semibold text-gray-900">Viajes</h1>
          <AppButton
            variant="primary"
            @click="navigateTo('/trips/new')"
          >
            Nuevo Viaje
          </AppButton>
        </div>

        <!-- Filtros -->
        <TripFilters
          :initial-filters="pageFilters"
          @filter-change="handleFilterChange"
        />

        <!-- Alerta de error -->
        <div v.if="tripStore.error" class="my-4 p-4 bg-red-100 text-red-700 border border-red-400 rounded">
          <p>Error al cargar los viajes: {{ tripStore.error }}</p>
        </div>

        <!-- Tabla de viajes -->
        <TripTable
          :trips="tripStore.trips"
          :loading="tripStore.isLoading"
          :current-page="tripStore.pagination.currentPage"
          :total-items="tripStore.pagination.totalItems"
          :items-per-page="tripStore.pagination.itemsPerPage"
          :sort-by="pageSortBy"
          :sort-direction="pageSortDirection"
          @page-change="handlePageChange"
          @sort-change="handleSortChange"
          @view-trip="handleViewTrip"
          @edit-trip="handleEditTrip"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, watch } from 'vue';
import { useRouter, navigateTo } from '#app'; // Using Nuxt 3 auto-imports
import { useTripStore } from '~/stores/tripStore';

// Componentes (Assuming these are correctly imported or auto-imported by Nuxt)
// import TripFilters from '~/components/TripFilters.vue'; 
// import TripTable from '~/components/TripTable.vue';
// import AppButton from '~/components/AppButton.vue';

const router = useRouter();
const tripStore = useTripStore();

// Local state for page-specific controls that trigger store actions
const pageFilters = reactive({
  origin: '',
  destination: '',
  date: '',
  status: '',
  search: '',
  dateFrom: '',
  dateTo: '',
  minSeats: ''
});

// Local refs for sort, to be passed to the store action
// The store itself doesn't need to hold sortBy/sortDirection if they are always passed in fetchTrips params
const pageSortBy = ref(tripStore.pagination.sortBy || 'trip_datetime'); // Default from store or a sensible default
const pageSortDirection = ref(tripStore.pagination.sortDirection || 'desc');

const loadTrips = () => {
  tripStore.fetchTrips({
    page: tripStore.pagination.currentPage, // Use current page from store for reloads
    itemsPerPage: tripStore.pagination.itemsPerPage,
    sortBy: pageSortBy.value,
    sortDirection: pageSortDirection.value,
    filters: { ...pageFilters } // Pass a copy of the filters
  });
};

onMounted(() => {
  // Initial load. If store has default page 1, it will use that.
  loadTrips(); 
});

// Manejar cambio de página
const handlePageChange = (newPage) => {
  // Update store's current page, then fetch.
  // Or, more directly, pass the new page to fetchTrips
  tripStore.fetchTrips({
    page: newPage,
    itemsPerPage: tripStore.pagination.itemsPerPage,
    sortBy: pageSortBy.value,
    sortDirection: pageSortDirection.value,
    filters: { ...pageFilters }
  });
};

// Manejar cambio de ordenamiento
const handleSortChange = ({ column, direction }) => {
  pageSortBy.value = column;
  pageSortDirection.value = direction;
  // Reset to page 1 when sort changes, and then fetch.
  tripStore.fetchTrips({
    page: 1, 
    itemsPerPage: tripStore.pagination.itemsPerPage,
    sortBy: pageSortBy.value,
    sortDirection: pageSortDirection.value,
    filters: { ...pageFilters }
  });
};

// Manejar cambio de filtros
const handleFilterChange = (newFilters) => {
  Object.assign(pageFilters, newFilters);
  // Reset to page 1 when filters change, and then fetch.
  tripStore.fetchTrips({
    page: 1,
    itemsPerPage: tripStore.pagination.itemsPerPage,
    sortBy: pageSortBy.value,
    sortDirection: pageSortDirection.value,
    filters: { ...pageFilters }
  });
};

// Manejar ver viaje
const handleViewTrip = (tripId) => {
  router.push(`/trips/${tripId}`);
};

// Manejar editar viaje
const handleEditTrip = (tripId) => {
  router.push(`/trips/${tripId}/edit`);
};

// No definePageMeta needed here if auth.global.ts is active
// definePageMeta({
//   middleware: ['auth'] 
// })
</script>
