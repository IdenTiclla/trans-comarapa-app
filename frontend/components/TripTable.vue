<template>
  <div class="overflow-hidden bg-white shadow-md rounded-lg">
    <!-- Tabla de viajes -->
    <div class="overflow-x-auto">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th 
              v-for="column in columns" 
              :key="column.key"
              scope="col" 
              class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
              @click="handleSort(column.key)"
            >
              {{ column.label }}
              <span v-if="sortBy === column.key" class="ml-1">
                {{ sortDirection === 'asc' ? '↑' : '↓' }}
              </span>
            </th>
            <th scope="col" class="relative px-6 py-3">
              <span class="sr-only">Acciones</span>
            </th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-if="loading" class="animate-pulse">
            <td :colspan="columns.length + 1" class="px-6 py-4">
              <div class="flex justify-center">
                <p class="text-gray-500">Cargando viajes...</p>
              </div>
            </td>
          </tr>
          <tr v-else-if="trips.length === 0">
            <td :colspan="columns.length + 1" class="px-6 py-4">
              <div class="flex justify-center">
                <p class="text-gray-500">No se encontraron viajes</p>
              </div>
            </td>
          </tr>
          <tr v-for="trip in trips" :key="trip.id" class="hover:bg-gray-50">
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="text-sm font-medium text-gray-900">{{ trip.id }}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="text-sm text-gray-900">{{ trip.route.origin }}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="text-sm text-gray-900">{{ trip.route.destination }}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="text-sm text-gray-900">{{ formatDate(trip.departure_date) }}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="text-sm text-gray-900">{{ formatTime(trip.departure_time) }}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <span 
                class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full" 
                :class="getStatusClass(trip.status)"
              >
                {{ getStatusText(trip.status) }}
              </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
              {{ trip.available_seats }} / {{ trip.total_seats }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
              <button 
                @click="$emit('view-trip', trip.id)"
                class="text-blue-600 hover:text-blue-900 mr-3"
              >
                Ver
              </button>
              <button 
                @click="$emit('edit-trip', trip.id)"
                class="text-indigo-600 hover:text-indigo-900"
              >
                Editar
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    
    <!-- Paginación -->
    <div class="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
      <div class="flex-1 flex justify-between sm:hidden">
        <button 
          @click="$emit('page-change', currentPage - 1)" 
          :disabled="currentPage === 1"
          :class="[
            currentPage === 1 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-700 hover:bg-gray-50',
            'relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md'
          ]"
        >
          Anterior
        </button>
        <button 
          @click="$emit('page-change', currentPage + 1)" 
          :disabled="currentPage === totalPages"
          :class="[
            currentPage === totalPages ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-700 hover:bg-gray-50',
            'ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md'
          ]"
        >
          Siguiente
        </button>
      </div>
      <div class="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
        <div>
          <p class="text-sm text-gray-700">
            Mostrando 
            <span class="font-medium">{{ startItem }}</span>
            a
            <span class="font-medium">{{ endItem }}</span>
            de
            <span class="font-medium">{{ totalItems }}</span>
            resultados
          </p>
        </div>
        <div>
          <nav class="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
            <button 
              @click="$emit('page-change', currentPage - 1)" 
              :disabled="currentPage === 1"
              :class="[
                currentPage === 1 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-500 hover:bg-gray-50',
                'relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 text-sm font-medium'
              ]"
            >
              <span class="sr-only">Anterior</span>
              <svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fill-rule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clip-rule="evenodd" />
              </svg>
            </button>
            
            <template v-for="page in displayedPages" :key="page">
              <button 
                v-if="page !== '...'"
                @click="$emit('page-change', page)" 
                :class="[
                  page === currentPage 
                    ? 'z-10 bg-blue-50 border-blue-500 text-blue-600' 
                    : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50',
                  'relative inline-flex items-center px-4 py-2 border text-sm font-medium'
                ]"
              >
                {{ page }}
              </button>
              <span 
                v-else
                class="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700"
              >
                ...
              </span>
            </template>
            
            <button 
              @click="$emit('page-change', currentPage + 1)" 
              :disabled="currentPage === totalPages"
              :class="[
                currentPage === totalPages ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-500 hover:bg-gray-50',
                'relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 text-sm font-medium'
              ]"
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
import { computed, ref } from 'vue'

const props = defineProps({
  trips: {
    type: Array,
    required: true
  },
  loading: {
    type: Boolean,
    default: false
  },
  currentPage: {
    type: Number,
    default: 1
  },
  totalItems: {
    type: Number,
    default: 0
  },
  itemsPerPage: {
    type: Number,
    default: 10
  },
  sortBy: {
    type: String,
    default: 'departure_date'
  },
  sortDirection: {
    type: String,
    default: 'asc'
  }
})

const emit = defineEmits(['page-change', 'sort-change', 'view-trip', 'edit-trip'])

// Columnas de la tabla
const columns = [
  { key: 'id', label: 'ID' },
  { key: 'origin', label: 'Origen' },
  { key: 'destination', label: 'Destino' },
  { key: 'departure_date', label: 'Fecha' },
  { key: 'departure_time', label: 'Hora' },
  { key: 'status', label: 'Estado' },
  { key: 'seats', label: 'Asientos' }
]

// Cálculos para la paginación
const totalPages = computed(() => Math.ceil(props.totalItems / props.itemsPerPage))
const startItem = computed(() => ((props.currentPage - 1) * props.itemsPerPage) + 1)
const endItem = computed(() => Math.min(startItem.value + props.itemsPerPage - 1, props.totalItems))

// Páginas a mostrar en la paginación
const displayedPages = computed(() => {
  const pages = []
  const maxVisiblePages = 5
  
  if (totalPages.value <= maxVisiblePages) {
    // Si hay pocas páginas, mostrar todas
    for (let i = 1; i <= totalPages.value; i++) {
      pages.push(i)
    }
  } else {
    // Siempre mostrar la primera página
    pages.push(1)
    
    // Calcular el rango de páginas a mostrar alrededor de la página actual
    let startPage = Math.max(2, props.currentPage - 1)
    let endPage = Math.min(totalPages.value - 1, props.currentPage + 1)
    
    // Ajustar si estamos cerca del inicio o del final
    if (props.currentPage <= 3) {
      endPage = 4
    } else if (props.currentPage >= totalPages.value - 2) {
      startPage = totalPages.value - 3
    }
    
    // Añadir elipsis si es necesario
    if (startPage > 2) {
      pages.push('...')
    }
    
    // Añadir páginas intermedias
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i)
    }
    
    // Añadir elipsis si es necesario
    if (endPage < totalPages.value - 1) {
      pages.push('...')
    }
    
    // Siempre mostrar la última página
    pages.push(totalPages.value)
  }
  
  return pages
})

// Formatear fecha
const formatDate = (dateString) => {
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).format(date)
}

// Formatear hora
const formatTime = (timeString) => {
  return timeString
}

// Obtener clase CSS según el estado
const getStatusClass = (status) => {
  switch (status) {
    case 'scheduled':
      return 'bg-blue-100 text-blue-800'
    case 'in_progress':
      return 'bg-green-100 text-green-800'
    case 'completed':
      return 'bg-gray-100 text-gray-800'
    case 'cancelled':
      return 'bg-red-100 text-red-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
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

// Manejar ordenamiento
const handleSort = (column) => {
  let direction = 'asc'
  if (props.sortBy === column && props.sortDirection === 'asc') {
    direction = 'desc'
  }
  emit('sort-change', { column, direction })
}
</script>
