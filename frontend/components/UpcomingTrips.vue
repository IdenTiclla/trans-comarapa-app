<template>
  <div class="bg-white rounded-lg shadow overflow-hidden">
    <div class="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
      <h3 class="text-lg font-semibold text-gray-900">Próximos Viajes</h3>
      <button
        v-if="!loading"
        @click="fetchUpcomingTrips"
        class="text-gray-500 hover:text-gray-700"
        title="Actualizar viajes"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
      </button>
    </div>
    <div class="divide-y divide-gray-200">
      <div v-if="loading" class="p-4 text-center">
        <p class="text-gray-500">Cargando viajes...</p>
      </div>
      <div v-else-if="error" class="p-4 text-center">
        <p class="text-red-500">{{ error }}</p>
      </div>
      <div v-else-if="trips.length === 0" class="p-4 text-center">
        <p class="text-gray-500">No hay viajes programados próximamente</p>
      </div>
      <div v-else v-for="trip in trips" :key="trip.id" class="p-4 hover:bg-gray-50">
        <div class="flex justify-between items-center">
          <div>
            <p class="font-medium text-gray-900">{{ trip.route.origin }} → {{ trip.route.destination }}</p>
            <p class="text-sm text-gray-500">{{ formatDate(trip.departure_date || trip.trip_datetime) }}</p>
          </div>
          <div class="text-right">
            <p class="text-sm font-medium" :class="getStatusColor(trip.status)">
              {{ getStatusText(trip.status) }}
            </p>
            <p class="text-sm text-gray-500">{{ trip.available_seats }} asientos disponibles</p>
          </div>
        </div>
      </div>
    </div>
    <div class="px-6 py-3 bg-gray-50 text-right">
      <button
        class="text-sm font-medium text-blue-600 hover:text-blue-800"
        @click="$emit('view-all')"
      >
        Ver todos los viajes →
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import tripService from '~/services/tripService'

const props = defineProps({
  limit: {
    type: Number,
    default: 5
  },
  autoRefresh: {
    type: Boolean,
    default: true
  },
  refreshInterval: {
    type: Number,
    default: 60000 // 1 minuto por defecto
  }
})

const emit = defineEmits(['view-all'])

const trips = ref([])
const loading = ref(true)
const error = ref(null)
let refreshTimer = null

// Función para formatear fechas
const formatDate = (dateString) => {
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('es-ES', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    hour: 'numeric',
    minute: 'numeric'
  }).format(date)
}

// Función para obtener el color según el estado
const getStatusColor = (status) => {
  switch (status) {
    case 'scheduled':
      return 'text-blue-600'
    case 'in_progress':
      return 'text-green-600'
    case 'completed':
      return 'text-gray-600'
    case 'cancelled':
      return 'text-red-600'
    default:
      return 'text-gray-600'
  }
}

// Función para obtener el texto según el estado
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

// Cargar los próximos viajes
const fetchUpcomingTrips = async () => {
  loading.value = true
  error.value = null

  try {
    // Construct parameters for the service
    const params = {
      upcoming: true, // The service might translate this or pass it if backend supports
      status: 'scheduled,in_progress', // Explicitly request these statuses
      limit: props.limit,
      page: 1, // Fetching the first page for upcoming trips display
      // Add any default sorting if necessary, e.g.:
      // sort_by: 'trip_datetime',
      // sort_direction: 'asc',
    };

    const result = await tripService.getTrips(params);
    
    // The service now returns the direct API response.
    // The cURL output shows the trips array is under the key "trips"
    if (Array.isArray(result)) {
      // This case might occur if the API directly returns an array under some conditions
      trips.value = result;
    } else if (result && Array.isArray(result.trips)) {
      trips.value = result.trips;
    } else {
      console.warn('Unexpected response structure from getTrips. Expected array or {trips: []}:', result);
      trips.value = []; // Default to empty if structure is not recognized
    }

  } catch (err) {
    console.error('Error al cargar los viajes:', err.data?.detail || err.message, err);
    error.value = err.data?.detail || 'No se pudieron cargar los viajes. Intente nuevamente.';
  } finally {
    loading.value = false
  }
}

// Configurar actualización automática
const setupAutoRefresh = () => {
  // Limpiar el temporizador existente si hay uno
  if (refreshTimer) {
    clearInterval(refreshTimer)
    refreshTimer = null
  }

  // Configurar nuevo temporizador si autoRefresh está habilitado
  if (props.autoRefresh) {
    refreshTimer = setInterval(() => {
      fetchUpcomingTrips()
    }, props.refreshInterval)
  }
}

// Observar cambios en las propiedades de actualización automática
watch(() => props.autoRefresh, setupAutoRefresh)
watch(() => props.refreshInterval, setupAutoRefresh)

onMounted(() => {
  fetchUpcomingTrips()
  setupAutoRefresh()
})

// Limpiar el temporizador cuando el componente se desmonta
onBeforeUnmount(() => {
  if (refreshTimer) {
    clearInterval(refreshTimer)
    refreshTimer = null
  }
})
</script>
