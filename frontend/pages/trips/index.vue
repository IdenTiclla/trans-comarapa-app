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
          @sort-change="handleSortChange" 
        />

        <!-- Alerta de error -->
        <div v-if="tripStore.error" class="my-4 p-4 bg-red-100 text-red-700 border border-red-400 rounded">
          <p>Error al cargar los viajes: {{ tripStore.error }}</p>
        </div>

        <!-- Lista de tarjetas de viajes -->
        <TripCardList
          :trips="tripStore.trips"
          :loading="tripStore.isLoading"
          :current-page="tripStore.pagination.currentPage"
          :total-items="tripStore.pagination.totalItems"
          :items-per-page="tripStore.pagination.itemsPerPage"
          @page-change="handlePageChange"
          @view-trip="handleViewTrip"
          @edit-trip="handleEditTrip"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { useRouter, navigateTo } from '#app';
import { useTripStore } from '~/stores/tripStore';
import TripFilters from '~/components/TripFilters.vue'; 
import TripCardList from '~/components/TripCardList.vue';
// import AppButton from '~/components/AppButton.vue'; // Asumiendo que AppButton es global o auto-importado

const router = useRouter();
const tripStore = useTripStore();

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

const pageSortBy = ref(tripStore.pagination.sortBy || 'trip_datetime');
const pageSortDirection = ref(tripStore.pagination.sortDirection || 'desc');

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

// No definePageMeta needed here if auth.global.ts is active
// definePageMeta({
//   middleware: ['auth'] 
// })
</script>
