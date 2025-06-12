<template>
  <div>
    <!-- Loading State with improved skeleton -->
    <div v-if="loading" :class="[
      viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6' : 'space-y-4'
    ]">
      <div v-for="n in 6" :key="n" class="bg-white shadow-lg rounded-2xl border border-gray-100 p-6 animate-pulse">
        <div class="flex justify-between items-start mb-4">
          <div class="flex-1">
            <div class="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div class="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
          <div class="h-6 bg-gray-200 rounded-full w-20"></div>
        </div>
        <div class="grid grid-cols-2 gap-4 mb-4">
          <div>
            <div class="h-4 bg-gray-200 rounded w-full mb-1"></div>
            <div class="h-4 bg-gray-200 rounded w-3/4"></div>
          </div>
          <div>
            <div class="h-4 bg-gray-200 rounded w-full mb-1"></div>
            <div class="h-4 bg-gray-200 rounded w-3/4"></div>
          </div>
        </div>
        <div class="border-t border-gray-200 pt-4 mt-4">
          <div class="flex justify-center space-x-3 mb-4">
            <div class="w-12 h-12 bg-gray-200 rounded-full"></div>
            <div class="w-12 h-12 bg-gray-200 rounded-full"></div>
            <div class="w-12 h-12 bg-gray-200 rounded"></div>
          </div>
          <div class="h-3 bg-gray-200 rounded-full w-full mb-4"></div>
          <div class="flex justify-end space-x-3">
            <div class="h-8 bg-gray-200 rounded w-16"></div>
            <div class="h-8 bg-gray-200 rounded w-16"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty State with improved design -->
    <div v-else-if="!trips || trips.length === 0" class="text-center py-16 bg-white rounded-2xl shadow-lg border border-gray-100">
      <div class="max-w-md mx-auto">
        <div class="flex items-center justify-center w-20 h-20 mx-auto mb-6 bg-gray-100 rounded-full">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 11V6.5m0 4.5v4.5m0-4.5h8m-8 0a4 4 0 110-8h8a4 4 0 110 8m-8 0a4 4 0 100 8h8a4 4 0 100-8" />
          </svg>
        </div>
        <h3 class="text-2xl font-bold text-gray-900 mb-2">No se encontraron viajes</h3>
        <p class="text-gray-600 mb-6">No hay viajes que coincidan con los filtros seleccionados.</p>
        <div class="flex flex-col sm:flex-row gap-3 justify-center">
          <button @click="$emit('clear-filters')" class="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Limpiar filtros
          </button>
          <button @click="$emit('new-trip')" class="inline-flex items-center px-4 py-2 border border-transparent rounded-lg text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Crear nuevo viaje
          </button>
        </div>
      </div>
    </div>

    <!-- Trip Cards Grid/List -->
    <div v-else>
      <!-- Grid View -->
      <div v-if="viewMode === 'grid'" class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        <TripCard
          v-for="trip in trips"
          :key="trip.id"
          :trip="trip"
          @view-trip="$emit('view-trip', $event)"
          @edit-trip="$emit('edit-trip', $event)"
        />
      </div>

      <!-- List View -->
      <div v-else class="space-y-4">
        <TripCard
          v-for="trip in trips"
          :key="trip.id"
          :trip="trip"
          :list-mode="true"
          @view-trip="$emit('view-trip', $event)"
          @edit-trip="$emit('edit-trip', $event)"
        />
      </div>
    </div>

    <!-- Enhanced Pagination -->
    <div v-if="!loading && trips && trips.length > 0 && totalPages > 1" class="mt-8">
      <div class="bg-white rounded-2xl shadow-lg border border-gray-100 px-6 py-5">
        <!-- Mobile Pagination -->
        <div class="flex justify-between items-center sm:hidden">
          <button
            @click="handlePageChange(currentPage - 1)"
            :disabled="currentPage === 1"
            :class="[
              currentPage === 1 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-indigo-600 text-white hover:bg-indigo-700',
              'relative inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 shadow-sm'
            ]"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
            </svg>
            Anterior
          </button>
          <div class="flex items-center space-x-2">
            <span class="text-sm text-gray-700 font-medium">Página {{ currentPage }} de {{ totalPages }}</span>
          </div>
          <button
            @click="handlePageChange(currentPage + 1)"
            :disabled="currentPage === totalPages"
            :class="[
              currentPage === totalPages ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-indigo-600 text-white hover:bg-indigo-700',
              'relative inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 shadow-sm'
            ]"
          >
            Siguiente
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        <!-- Desktop Pagination -->
        <div class="hidden sm:flex sm:items-center sm:justify-between">
          <div class="flex items-center space-x-4">
            <p class="text-sm text-gray-700">
              Mostrando 
              <span class="font-semibold text-indigo-600">{{ startItem }}</span>
              a 
              <span class="font-semibold text-indigo-600">{{ endItem }}</span>
              de 
              <span class="font-semibold text-indigo-600">{{ totalItems }}</span>
              viajes
            </p>
            <!-- Items per page selector -->
            <div class="flex items-center space-x-2">
              <label for="itemsPerPage" class="text-sm text-gray-700">Mostrar:</label>
              <select
                id="itemsPerPage"
                :value="itemsPerPage"
                @change="$emit('items-per-page-change', parseInt($event.target.value))"
                class="rounded-lg border-gray-300 text-sm focus:border-indigo-500 focus:ring-indigo-500"
              >
                <option value="10">10</option>
                <option value="20">20</option>
                <option value="50">50</option>
                <option value="100">100</option>
              </select>
            </div>
          </div>
          
          <div class="flex items-center space-x-1">
            <!-- First page -->
            <button
              @click="handlePageChange(1)"
              :disabled="currentPage === 1"
              :class="[
                currentPage === 1 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-700 hover:bg-gray-50 border-gray-300',
                'relative inline-flex items-center px-3 py-2 rounded-lg border text-sm font-medium transition-colors duration-200'
              ]"
              title="Primera página"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
              </svg>
            </button>

            <!-- Previous page -->
            <button
              @click="handlePageChange(currentPage - 1)"
              :disabled="currentPage === 1"
              :class="[
                currentPage === 1 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-700 hover:bg-gray-50 border-gray-300',
                'relative inline-flex items-center px-3 py-2 rounded-lg border text-sm font-medium transition-colors duration-200'
              ]"
              title="Página anterior"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            <!-- Page numbers -->
            <div class="flex items-center space-x-1">
              <template v-for="page in displayedPages" :key="page">
                <button
                  v-if="page !== '...'"
                  @click="handlePageChange(page)"
                  :class="[
                    page === currentPage
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                      : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50',
                    'relative inline-flex items-center px-4 py-2 border text-sm font-medium rounded-lg transition-colors duration-200'
                  ]"
                  :aria-current="page === currentPage ? 'page' : undefined"
                >
                  {{ page }}
                </button>
                <span
                  v-else
                  class="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 rounded-lg"
                >
                  ...
                </span>
              </template>
            </div>

            <!-- Next page -->
            <button
              @click="handlePageChange(currentPage + 1)"
              :disabled="currentPage === totalPages"
              :class="[
                currentPage === totalPages ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-700 hover:bg-gray-50 border-gray-300',
                'relative inline-flex items-center px-3 py-2 rounded-lg border text-sm font-medium transition-colors duration-200'
              ]"
              title="Página siguiente"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
              </svg>
            </button>

            <!-- Last page -->
            <button
              @click="handlePageChange(totalPages)"
              :disabled="currentPage === totalPages"
              :class="[
                currentPage === totalPages ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-700 hover:bg-gray-50 border-gray-300',
                'relative inline-flex items-center px-3 py-2 rounded-lg border text-sm font-medium transition-colors duration-200'
              ]"
              title="Última página"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 5l7 7-7 7M6 5l7 7-7 7" />
              </svg>
            </button>
          </div>
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
    default: 10,
  },
  viewMode: {
    type: String,
    default: 'grid',
    validator: (value) => ['grid', 'list'].includes(value),
  },
});

const emit = defineEmits(['page-change', 'view-trip', 'edit-trip', 'clear-filters', 'new-trip', 'items-per-page-change']);

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

// Enhanced pagination display logic
const displayedPages = computed(() => {
  const pages = [];
  const maxDisplayed = 5;
  const totalPagesValue = totalPages.value;
  
  if (totalPagesValue <= maxDisplayed + 2) {
    // Show all pages if not too many
    for (let i = 1; i <= totalPagesValue; i++) {
      pages.push(i);
    }
  } else {
    // Always show first page
    pages.push(1);
    
    let start = Math.max(2, props.currentPage - Math.floor((maxDisplayed - 2) / 2));
    let end = Math.min(totalPagesValue - 1, start + maxDisplayed - 3);

    // Adjust start if we're near the end
    if (end === totalPagesValue - 1 && (end - start + 1) < (maxDisplayed - 2)) {
      start = Math.max(2, end - (maxDisplayed - 3));
    }

    // Add ellipsis if needed
    if (start > 2) {
      pages.push('...');
    }

    // Add middle pages
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    // Add ellipsis if needed
    if (end < totalPagesValue - 1) {
      pages.push('...');
    }

    // Always show last page
    if (totalPagesValue > 1) {
      pages.push(totalPagesValue);
    }
  }

  return pages;
});

const handlePageChange = (page) => {
  if (page >= 1 && page <= totalPages.value && page !== props.currentPage) {
    emit('page-change', page);
  }
};
</script>

<style scoped>
/* Styles for the grid and cards */
.grid {
  /* Ensure consistent spacing, handled by gap-6 utility */
}
</style> 