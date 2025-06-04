<template>
  <div>
    <!-- Loading State -->
    <div v-if="loading" class="grid grid-cols-1 gap-6">
      <div v-for="n in 3" :key="n" class="bg-white shadow-lg rounded-xl border border-gray-100 p-6 animate-pulse">
        <div class="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
        <div class="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
        <div class="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
        <div class="h-10 bg-gray-200 rounded w-full mb-4"></div>
        <div class="flex justify-end space-x-3">
          <div class="h-8 bg-gray-200 rounded w-20"></div>
          <div class="h-8 bg-gray-200 rounded w-20"></div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else-if="!trips || trips.length === 0" class="text-center py-12">
      <svg xmlns="http://www.w3.org/2000/svg" class="mx-auto h-16 w-16 text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0zM18.364 5.636A9 9 0 005.636 18.364m12.728 0A9 9 0 005.636 5.636" />
      </svg>
      <h3 class="text-xl font-semibold text-gray-700">No se encontraron viajes</h3>
      <p class="text-gray-500 mt-1">Intenta ajustar tus filtros o revisa más tarde.</p>
    </div>

    <!-- Trip Cards List -->
    <div v-else class="grid grid-cols-1 gap-6">
      <TripCard
        v-for="trip in trips"
        :key="trip.id"
        :trip="trip"
        @view-trip="$emit('view-trip', $event)"
        @edit-trip="$emit('edit-trip', $event)"
      />
    </div>

    <!-- Pagination -->
    <div v-if="!loading && trips && trips.length > 0 && totalPages > 1" class="mt-8 bg-gray-50 px-4 py-4 flex items-center justify-between border-t border-gray-200 sm:px-6 rounded-b-xl shadow-md">
      <div class="flex-1 flex justify-between sm:hidden">
        <button
          @click="handlePageChange(currentPage - 1)"
          :disabled="currentPage === 1"
          :class="[
            currentPage === 1 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-700 hover:bg-gray-50 hover:text-gray-900',
            'relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm transition-colors duration-200'
          ]"
        >
          Anterior
        </button>
        <button
          @click="handlePageChange(currentPage + 1)"
          :disabled="currentPage === totalPages"
          :class="[
            currentPage === totalPages ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-700 hover:bg-gray-50 hover:text-gray-900',
            'ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm transition-colors duration-200'
          ]"
        >
          Siguiente
        </button>
      </div>
      <div class="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
        <div>
          <p class="text-sm text-gray-700">
            Mostrando
            <span class="font-semibold text-gray-900">{{ startItem }}</span>
            a
            <span class="font-semibold text-gray-900">{{ endItem }}</span>
            de
            <span class="font-semibold text-gray-900">{{ totalItems }}</span>
            resultados
          </p>
        </div>
        <div>
          <nav class="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
            <button
              @click="handlePageChange(currentPage - 1)"
              :disabled="currentPage === 1"
              :class="[
                currentPage === 1 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-600 hover:bg-gray-50 hover:text-gray-900',
                'relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 text-sm font-medium transition-colors duration-200'
              ]"
              aria-label="Página anterior"
            >
              <span class="sr-only">Anterior</span>
              <svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fill-rule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clip-rule="evenodd" />
              </svg>
            </button>

            <template v-for="page in displayedPages" :key="page">
              <button
                v-if="page !== '...'"
                @click="handlePageChange(page)"
                :class="[
                  page === currentPage
                    ? 'z-10 bg-blue-100 border-blue-500 text-blue-700 font-semibold shadow-sm'
                    : 'bg-white border-gray-300 text-gray-600 hover:bg-gray-50 hover:text-gray-900',
                  'relative inline-flex items-center px-4 py-2 border text-sm font-medium transition-colors duration-200'
                ]"
                :aria-current="page === currentPage ? 'page' : undefined"
              >
                {{ page }}
              </button>
              <span
                v-else
                class="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-gray-50 text-sm font-medium text-gray-500"
              >
                ...
              </span>
            </template>

            <button
              @click="handlePageChange(currentPage + 1)"
              :disabled="currentPage === totalPages"
              :class="[
                currentPage === totalPages ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-600 hover:bg-gray-50 hover:text-gray-900',
                'relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 text-sm font-medium transition-colors duration-200'
              ]"
              aria-label="Página siguiente"
            >
              <span class="sr-only">Siguiente</span>
              <svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
              </svg>
            </button>
          </nav>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import TripCard from './TripCard.vue';

const props = defineProps({
  trips: {
    type: Array,
    default: () => [],
  },
  loading: {
    type: Boolean,
    default: false,
  },
  currentPage: {
    type: Number,
    default: 1,
  },
  totalItems: {
    type: Number,
    default: 0,
  },
  itemsPerPage: {
    type: Number,
    default: 10, // Default, should match store or page setting
  },
});

const emit = defineEmits(['page-change', 'view-trip', 'edit-trip']);

const totalPages = computed(() => {
  if (props.totalItems === 0 || props.itemsPerPage === 0) return 1;
  return Math.ceil(props.totalItems / props.itemsPerPage);
});

const startItem = computed(() => {
  if (props.totalItems === 0) return 0;
  return (props.currentPage - 1) * props.itemsPerPage + 1;
});

const endItem = computed(() => {
  const end = props.currentPage * props.itemsPerPage;
  return Math.min(end, props.totalItems);
});

// Pagination display logic (simplified from TripTable for now)
const displayedPages = computed(() => {
  const pages = [];
  const maxDisplayed = 5; // Max number of page buttons to show (excluding prev/next)
  
  if (totalPages.value <= maxDisplayed + 2) { // Show all pages if not too many
    for (let i = 1; i <= totalPages.value; i++) {
      pages.push(i);
    }
  } else {
    pages.push(1); // Always show first page
    let start = Math.max(2, props.currentPage - Math.floor((maxDisplayed - 2) / 2));
    let end = Math.min(totalPages.value - 1, start + maxDisplayed - 3);

    if (end === totalPages.value -1 && (end - start +1) < (maxDisplayed -2)){
        start = Math.max(2, end - (maxDisplayed - 3));
    }

    if (start > 2) {
      pages.push('...');
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    if (end < totalPages.value - 1) {
      pages.push('...');
    }
    pages.push(totalPages.value); // Always show last page
  }
  return pages;
});

const handlePageChange = (page) => {
  if (page < 1 || page > totalPages.value || page === props.currentPage) {
    return;
  }
  emit('page-change', page);
};

</script>

<style scoped>
/* Styles for the grid and cards */
.grid {
  /* Ensure consistent spacing, handled by gap-6 utility */
}
</style> 