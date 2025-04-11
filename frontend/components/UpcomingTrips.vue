<template>
  <div class="bg-white rounded-lg shadow overflow-hidden">
    <div class="px-6 py-4 border-b border-gray-200">
      <h3 class="text-lg font-semibold text-gray-900">Próximos Viajes</h3>
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
            <p class="text-sm text-gray-500">{{ formatDate(trip.trip_datetime) }}</p>
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
import { ref, onMounted } from 'vue'
import { useRuntimeConfig } from 'nuxt/app'

const props = defineProps({
  limit: {
    type: Number,
    default: 5
  }
})

const emit = defineEmits(['view-all'])

const trips = ref([])
const loading = ref(true)
const error = ref(null)

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
    const config = useRuntimeConfig()
    const apiBaseUrl = config.public.apiBaseUrl || 'http://localhost:8000/api/v1'
    
    // Simulamos datos para desarrollo
    // En producción, descomentar la siguiente línea y eliminar la simulación
    // const response = await fetch(`${apiBaseUrl}/trips?limit=${props.limit}&upcoming=true`)
    
    // Simulación de datos para desarrollo
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Datos de ejemplo
    trips.value = [
      {
        id: 1,
        route: { origin: 'Santa Cruz', destination: 'Comarapa' },
        trip_datetime: new Date(Date.now() + 3600000).toISOString(), // 1 hora en el futuro
        status: 'scheduled',
        available_seats: 15
      },
      {
        id: 2,
        route: { origin: 'Comarapa', destination: 'Cochabamba' },
        trip_datetime: new Date(Date.now() + 7200000).toISOString(), // 2 horas en el futuro
        status: 'scheduled',
        available_seats: 8
      },
      {
        id: 3,
        route: { origin: 'Santa Cruz', destination: 'La Paz' },
        trip_datetime: new Date(Date.now() + 10800000).toISOString(), // 3 horas en el futuro
        status: 'scheduled',
        available_seats: 22
      }
    ]
  } catch (err) {
    console.error('Error al cargar los viajes:', err)
    error.value = 'No se pudieron cargar los viajes. Intente nuevamente.'
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchUpcomingTrips()
})
</script>
