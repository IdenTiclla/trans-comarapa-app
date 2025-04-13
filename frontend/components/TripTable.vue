<template>
  <div class="overflow-hidden bg-white shadow-lg rounded-xl border border-gray-100 transition-all duration-300 hover:shadow-xl">
    <!-- Tabla de viajes -->
    <div class="overflow-x-auto">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50 border-b border-gray-200">
          <tr>
            <th
              v-for="column in columns"
              :key="column.key"
              scope="col"
              class="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer transition-colors duration-200 hover:bg-gray-100"
              @click="handleSort(column.key)"
            >
              {{ column.label }}
              <span v-if="sortBy === column.key" class="ml-1 inline-flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" v-if="sortDirection === 'asc'">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7" />
                </svg>
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" v-else>
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                </svg>
              </span>
            </th>
            <th scope="col" class="relative px-6 py-3">
              <span class="sr-only">Acciones</span>
            </th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-if="loading" class="animate-pulse">
            <td :colspan="columns.length + 1" class="px-6 py-8">
              <div class="flex flex-col items-center justify-center">
                <div class="rounded-full bg-gray-200 h-12 w-12 mb-3"></div>
                <div class="h-4 bg-gray-200 rounded w-32 mb-2"></div>
                <div class="h-3 bg-gray-100 rounded w-24"></div>
              </div>
            </td>
          </tr>
          <tr v-else-if="trips.length === 0">
            <td :colspan="columns.length + 1" class="px-6 py-8">
              <div class="flex flex-col items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 text-gray-300 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p class="text-gray-600 font-medium">No se encontraron viajes</p>
                <p class="text-gray-400 text-sm mt-1">Intenta con otros criterios de búsqueda</p>
              </div>
            </td>
          </tr>
          <tr v-for="trip in trips" :key="trip.id" class="hover:bg-blue-50 transition-colors duration-150">
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="text-sm font-semibold text-gray-900">#{{ trip.id }}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap" colspan="2">
              <div class="flex items-center">
                <span class="text-sm font-medium text-gray-900">{{ trip.route.origin }}</span>
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mx-2 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
                <span class="text-sm font-medium text-gray-900">{{ trip.route.destination }}</span>
              </div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="flex flex-col">
                <span class="text-sm font-medium text-gray-900">{{ formatDate(trip.departure_date) }}</span>
              </div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="flex flex-col">
                <span class="text-sm font-medium text-gray-900">{{ formatTime(trip.departure_time) }}</span>
              </div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <span
                class="px-3 py-1 inline-flex items-center text-xs leading-5 font-semibold rounded-full shadow-sm border"
                :class="getStatusClass(trip.status)"
              >
                <span class="w-1.5 h-1.5 rounded-full mr-1.5" :class="getStatusDotClass(trip.status)"></span>
                {{ getStatusText(trip.status) }}
              </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="flex items-center">
                <span class="text-sm font-medium text-gray-900">{{ trip.available_seats }}</span>
                <span class="mx-1 text-gray-500">/</span>
                <span class="text-sm text-gray-700">{{ trip.total_seats }}</span>
                <div class="ml-2 w-16 bg-gray-200 rounded-full h-2">
                  <div
                    class="h-2 rounded-full transition-all duration-300"
                    :class="{
                      'bg-green-500': trip.available_seats / trip.total_seats > 0.5,
                      'bg-yellow-500': trip.available_seats / trip.total_seats <= 0.5 && trip.available_seats / trip.total_seats > 0.2,
                      'bg-red-500': trip.available_seats / trip.total_seats <= 0.2
                    }"
                    :style="{ width: `${(trip.available_seats / trip.total_seats) * 100}%` }"
                  ></div>
                </div>
              </div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
              <div class="flex space-x-2 justify-end">
                <button
                  @click="$emit('view-trip', trip.id)"
                  class="text-blue-600 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 rounded-lg px-3 py-1.5 transition-colors duration-200 flex items-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  Ver
                </button>
                <button
                  @click="$emit('edit-trip', trip.id)"
                  class="text-indigo-600 hover:text-indigo-900 bg-indigo-50 hover:bg-indigo-100 rounded-lg px-3 py-1.5 transition-colors duration-200 flex items-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Editar
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Paginación -->
    <div class="bg-gray-50 px-4 py-4 flex items-center justify-between border-t border-gray-200 sm:px-6 rounded-b-xl">
      <div class="flex-1 flex justify-between sm:hidden">
        <button
          @click="$emit('page-change', currentPage - 1)"
          :disabled="currentPage === 1"
          :class="[
            currentPage === 1 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-700 hover:bg-gray-50 hover:text-gray-900',
            'relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm transition-colors duration-200'
          ]"
        >
          Anterior
        </button>
        <button
          @click="$emit('page-change', currentPage + 1)"
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
              @click="$emit('page-change', currentPage - 1)"
              :disabled="currentPage === 1"
              :class="[
                currentPage === 1 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-600 hover:bg-gray-50 hover:text-gray-900',
                'relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 text-sm font-medium transition-colors duration-200'
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
                    ? 'z-10 bg-blue-100 border-blue-500 text-blue-700 font-semibold shadow-sm'
                    : 'bg-white border-gray-300 text-gray-600 hover:bg-gray-50 hover:text-gray-900',
                  'relative inline-flex items-center px-4 py-2 border text-sm font-medium transition-colors duration-200'
                ]"
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
              @click="$emit('page-change', currentPage + 1)"
              :disabled="currentPage === totalPages"
              :class="[
                currentPage === totalPages ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-600 hover:bg-gray-50 hover:text-gray-900',
                'relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 text-sm font-medium transition-colors duration-200'
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
import { computed } from 'vue'

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
  if (!timeString) return ''

  // Si ya tiene formato HH:MM, devolverlo directamente
  if (/^\d{2}:\d{2}$/.test(timeString)) {
    return timeString
  }

  try {
    // Si es una hora ISO (con segundos y posiblemente milisegundos)
    if (timeString.includes(':')) {
      // Extraer solo las horas y minutos
      const parts = timeString.split(':')
      return `${parts[0]}:${parts[1]}`
    }

    // Si es otro formato, intentar convertirlo
    const date = new Date(`2000-01-01T${timeString}`)
    return date.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    })
  } catch (error) {
    console.error('Error al formatear la hora:', error)
    return timeString || ''
  }
}

// Obtener clase CSS según el estado
const getStatusClass = (status) => {
  switch (status) {
    case 'scheduled':
      return 'bg-blue-50 text-blue-700 border-blue-200'
    case 'in_progress':
      return 'bg-green-50 text-green-700 border-green-200'
    case 'completed':
      return 'bg-gray-50 text-gray-700 border-gray-200'
    case 'cancelled':
      return 'bg-red-50 text-red-700 border-red-200'
    default:
      return 'bg-gray-50 text-gray-700 border-gray-200'
  }
}

// Obtener clase CSS para el punto de estado
const getStatusDotClass = (status) => {
  switch (status) {
    case 'scheduled':
      return 'bg-blue-500'
    case 'in_progress':
      return 'bg-green-500'
    case 'completed':
      return 'bg-gray-500'
    case 'cancelled':
      return 'bg-red-500'
    default:
      return 'bg-gray-500'
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
