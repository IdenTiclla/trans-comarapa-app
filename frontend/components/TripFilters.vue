<template>
  <div class="bg-white shadow-lg rounded-xl p-6 mb-6 border border-gray-100 transition-all duration-300 hover:shadow-xl">
    <!-- Encabezado con contador de filtros activos -->
    <div class="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-5 gap-3">
      <div class="flex items-center">
        <h3 class="text-lg font-semibold text-gray-800">Filtros</h3>
        <div v-if="activeFiltersCount > 0" class="ml-2 px-3 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full shadow-sm transition-all duration-200 hover:bg-blue-200">
          {{ activeFiltersCount }} activo{{ activeFiltersCount !== 1 ? 's' : '' }}
        </div>
      </div>
      <div class="flex items-center flex-wrap gap-3">
        <div class="flex items-center bg-gray-50 rounded-lg px-3 py-1.5 border border-gray-200 transition-colors duration-200 hover:bg-gray-100">
          <input
            id="auto-apply"
            type="checkbox"
            v-model="autoApply"
            class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label for="auto-apply" class="ml-2 block text-sm font-medium text-gray-700 cursor-pointer">Aplicar automáticamente</label>
        </div>
        <button
          @click="toggleAdvancedFilters"
          class="text-sm font-medium text-blue-600 hover:text-blue-800 flex items-center bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100 transition-all duration-200 hover:bg-blue-100"
        >
          {{ showAdvancedFilters ? 'Ocultar filtros avanzados' : 'Mostrar filtros avanzados' }}
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 ml-1 transition-transform duration-200" :class="{ 'transform rotate-180': showAdvancedFilters }" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>
    </div>

    <!-- Búsqueda rápida -->
    <div class="mb-5">
      <div class="relative rounded-lg shadow-sm">
        <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <svg class="h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clip-rule="evenodd" />
          </svg>
        </div>
        <input
          type="text"
          v-model="filters.search"
          placeholder="Buscar viaje por ID, origen o destino..."
          class="pl-12 py-3 block w-full rounded-lg border-gray-300 bg-gray-50 shadow-sm focus:border-blue-500 focus:ring-blue-500 focus:bg-white transition-colors duration-200"
          @input="handleSearchInput"
        />
      </div>
    </div>

    <!-- Filtros básicos -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-5 mb-5">
      <!-- Origen -->
      <div>
        <label for="origin" class="block text-sm font-medium text-gray-700 mb-2">Origen</label>
        <div class="relative">
          <select
            id="origin"
            v-model="filters.origin"
            class="block w-full rounded-lg border-gray-300 bg-gray-50 shadow-sm focus:border-blue-500 focus:ring-blue-500 pr-8 py-2.5 transition-colors duration-200 focus:bg-white"
            @change="handleFilterChange"
          >
            <option value="">Todos</option>
            <option v-for="location in locations" :key="location" :value="location">
              {{ location }}
            </option>
          </select>
          <button
            v-if="filters.origin"
            @click="clearFilter('origin')"
            class="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors duration-200"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      <!-- Destino -->
      <div>
        <label for="destination" class="block text-sm font-medium text-gray-700 mb-2">Destino</label>
        <div class="relative">
          <select
            id="destination"
            v-model="filters.destination"
            class="block w-full rounded-lg border-gray-300 bg-gray-50 shadow-sm focus:border-blue-500 focus:ring-blue-500 pr-8 py-2.5 transition-colors duration-200 focus:bg-white"
            @change="handleFilterChange"
          >
            <option value="">Todos</option>
            <option v-for="location in locations" :key="location" :value="location">
              {{ location }}
            </option>
          </select>
          <button
            v-if="filters.destination"
            @click="clearFilter('destination')"
            class="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      <!-- Estado -->
      <div>
        <label for="status" class="block text-sm font-medium text-gray-700 mb-2">Estado</label>
        <div class="relative">
          <select
            id="status"
            v-model="filters.status"
            class="block w-full rounded-lg border-gray-300 bg-gray-50 shadow-sm focus:border-blue-500 focus:ring-blue-500 pr-8 py-2.5 transition-colors duration-200 focus:bg-white"
            @change="handleFilterChange"
          >
            <option value="">Todos</option>
            <option value="scheduled">Programado</option>
            <option value="in_progress">En progreso</option>
            <option value="completed">Completado</option>
            <option value="cancelled">Cancelado</option>
          </select>
          <button
            v-if="filters.status"
            @click="clearFilter('status')"
            class="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>

    <!-- Filtros avanzados -->
    <div v-if="showAdvancedFilters" class="border-t border-gray-200 pt-5 mt-5">
      <h4 class="text-sm font-semibold text-gray-800 mb-4 flex items-center">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
        </svg>
        Filtros avanzados
      </h4>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
        <!-- Rango de fechas -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Rango de fechas</label>
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label for="date_from" class="block text-xs text-gray-500 mb-1 font-medium">Desde</label>
              <input
                type="date"
                id="date_from"
                v-model="filters.dateFrom"
                class="block w-full rounded-lg border-gray-300 bg-gray-50 shadow-sm focus:border-blue-500 focus:ring-blue-500 py-2 transition-colors duration-200 focus:bg-white"
                @change="handleFilterChange"
              />
            </div>
            <div>
              <label for="date_to" class="block text-xs text-gray-500 mb-1 font-medium">Hasta</label>
              <input
                type="date"
                id="date_to"
                v-model="filters.dateTo"
                class="block w-full rounded-lg border-gray-300 bg-gray-50 shadow-sm focus:border-blue-500 focus:ring-blue-500 py-2 transition-colors duration-200 focus:bg-white"
                @change="handleFilterChange"
              />
            </div>
          </div>
        </div>

        <!-- Asientos disponibles -->
        <div>
          <label for="min_seats" class="block text-sm font-medium text-gray-700 mb-2">Mínimo de asientos disponibles</label>
          <input
            type="number"
            id="min_seats"
            v-model="filters.minSeats"
            min="0"
            class="block w-full rounded-lg border-gray-300 bg-gray-50 shadow-sm focus:border-blue-500 focus:ring-blue-500 py-2.5 transition-colors duration-200 focus:bg-white"
            @change="handleFilterChange"
          />
        </div>
      </div>
    </div>

    <!-- Botones de acción -->
    <div class="mt-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div class="flex items-center w-full sm:w-auto">
        <!-- Chips de filtros activos -->
        <div v-if="activeFiltersCount > 0" class="flex flex-wrap gap-2 max-w-full overflow-x-auto pb-1">
          <div
            v-if="filters.origin"
            class="bg-blue-50 text-blue-700 text-xs rounded-full px-3 py-1.5 flex items-center shadow-sm border border-blue-100 transition-all duration-200 hover:bg-blue-100"
          >
            Origen: {{ filters.origin }}
            <button @click="clearFilter('origin')" class="ml-1 text-blue-500 hover:text-blue-700 transition-colors duration-200">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div
            v-if="filters.destination"
            class="bg-blue-50 text-blue-700 text-xs rounded-full px-3 py-1.5 flex items-center shadow-sm border border-blue-100 transition-all duration-200 hover:bg-blue-100"
          >
            Destino: {{ filters.destination }}
            <button @click="clearFilter('destination')" class="ml-1 text-blue-500 hover:text-blue-700 transition-colors duration-200">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div
            v-if="filters.status"
            class="bg-blue-50 text-blue-700 text-xs rounded-full px-3 py-1.5 flex items-center shadow-sm border border-blue-100 transition-all duration-200 hover:bg-blue-100"
          >
            Estado: {{ getStatusText(filters.status) }}
            <button @click="clearFilter('status')" class="ml-1 text-blue-500 hover:text-blue-700 transition-colors duration-200">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div
            v-if="hasDateFilter"
            class="bg-blue-50 text-blue-700 text-xs rounded-full px-3 py-1.5 flex items-center shadow-sm border border-blue-100 transition-all duration-200 hover:bg-blue-100"
          >
            Fecha: {{ formatDateFilter }}
            <button @click="clearDateFilters()" class="ml-1 text-blue-500 hover:text-blue-700 transition-colors duration-200">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div
            v-if="filters.minSeats"
            class="bg-blue-50 text-blue-700 text-xs rounded-full px-3 py-1.5 flex items-center shadow-sm border border-blue-100 transition-all duration-200 hover:bg-blue-100"
          >
            Min. asientos: {{ filters.minSeats }}
            <button @click="clearFilter('minSeats')" class="ml-1 text-blue-500 hover:text-blue-700 transition-colors duration-200">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </div>
      <div class="flex space-x-3 w-full sm:w-auto justify-end">
        <button
          @click="resetFilters"
          class="inline-flex justify-center items-center py-2.5 px-5 border border-gray-300 shadow-sm text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
          Limpiar filtros
        </button>
        <button
          v-if="!autoApply"
          @click="applyFilters"
          class="inline-flex justify-center items-center py-2.5 px-5 border border-transparent shadow-sm text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
          </svg>
          Aplicar filtros
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch } from 'vue'

const props = defineProps({
  initialFilters: {
    type: Object,
    default: () => ({})
  }
})

const emit = defineEmits(['filter-change'])

// Lista de ubicaciones (normalmente vendría del backend)
const locations = [
  'Santa Cruz',
  'Comarapa',
  'Cochabamba',
  'La Paz',
  'Sucre',
  'Tarija',
  'Oruro',
  'Potosí',
  'Trinidad',
  'Cobija'
]

// Estado de los filtros
const filters = reactive({
  origin: props.initialFilters.origin || '',
  destination: props.initialFilters.destination || '',
  date: props.initialFilters.date || '',
  status: props.initialFilters.status || '',
  search: '',
  dateFrom: '',
  dateTo: '',
  minSeats: ''
})

// Estado de la UI
const showAdvancedFilters = ref(false)
const autoApply = ref(false)

// Contador de filtros activos
const activeFiltersCount = computed(() => {
  let count = 0
  if (filters.origin) count++
  if (filters.destination) count++
  if (filters.status) count++
  if (filters.date || filters.dateFrom || filters.dateTo) count++
  if (filters.minSeats) count++
  if (filters.search) count++
  return count
})

// Verificar si hay filtros de fecha activos
const hasDateFilter = computed(() => {
  return filters.date || filters.dateFrom || filters.dateTo
})

// Formatear filtro de fecha para mostrar en chip
const formatDateFilter = computed(() => {
  if (filters.date) {
    return formatDate(filters.date)
  } else if (filters.dateFrom && filters.dateTo) {
    return `${formatDate(filters.dateFrom)} - ${formatDate(filters.dateTo)}`
  } else if (filters.dateFrom) {
    return `Desde ${formatDate(filters.dateFrom)}`
  } else if (filters.dateTo) {
    return `Hasta ${formatDate(filters.dateTo)}`
  }
  return ''
})

// Formatear fecha
const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).format(date)
}

// Obtener texto según el estado
const getStatusText = (status) => {
  switch (status) {
    case 'scheduled':
      return 'Programado'
    case 'in_progress':
      return 'En progreso'
    case 'completed':
      return 'Completado'
    case 'cancelled':
      return 'Cancelado'
    default:
      return 'Desconocido'
  }
}

// Mostrar/ocultar filtros avanzados
const toggleAdvancedFilters = () => {
  showAdvancedFilters.value = !showAdvancedFilters.value
}

// Manejar cambio en la búsqueda
const handleSearchInput = () => {
  if (autoApply.value) {
    // Aplicar con un pequeño retraso para evitar demasiadas llamadas
    clearTimeout(searchTimeout.value)
    searchTimeout.value = setTimeout(() => {
      applyFilters()
    }, 300)
  }
}

// Variable para almacenar el timeout de búsqueda
const searchTimeout = ref(null)

// Manejar cambio en los filtros
const handleFilterChange = () => {
  if (autoApply.value) {
    applyFilters()
  }
}

// Limpiar un filtro específico
const clearFilter = (filterName) => {
  filters[filterName] = ''
  if (autoApply.value) {
    applyFilters()
  }
}

// Limpiar filtros de fecha
const clearDateFilters = () => {
  filters.date = ''
  filters.dateFrom = ''
  filters.dateTo = ''
  if (autoApply.value) {
    applyFilters()
  }
}

// Aplicar filtros
const applyFilters = () => {
  // Convertir el filtro de fecha simple al rango si está presente
  if (filters.date && !filters.dateFrom) {
    filters.dateFrom = filters.date
    filters.dateTo = filters.date
  }

  // Preparar los filtros para enviar al backend
  const filtersToSend = {
    search: filters.search || '',
    origin: filters.origin || '',
    destination: filters.destination || '',
    status: filters.status || '',
    dateFrom: filters.dateFrom || '',
    dateTo: filters.dateTo || '',
    minSeats: filters.minSeats || ''
  }

  // Limpiar valores vacíos
  Object.keys(filtersToSend).forEach(key => {
    if (!filtersToSend[key]) {
      delete filtersToSend[key]
    }
  })

  emit('filter-change', filtersToSend)
}

// Resetear filtros
const resetFilters = () => {
  filters.origin = ''
  filters.destination = ''
  filters.date = ''
  filters.status = ''
  filters.search = ''
  filters.dateFrom = ''
  filters.dateTo = ''
  filters.minSeats = ''
  
  // Enviar filtros vacíos
  emit('filter-change', {})
}
</script>
