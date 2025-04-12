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
          :initial-filters="filters"
          @filter-change="handleFilterChange"
        />
        
        <!-- Tabla de viajes -->
        <TripTable 
          :trips="trips"
          :loading="loading"
          :current-page="currentPage"
          :total-items="totalItems"
          :items-per-page="itemsPerPage"
          :sort-by="sortBy"
          :sort-direction="sortDirection"
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
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '~/stores/auth'

// Componentes
import TripFilters from '~/components/TripFilters.vue'
import TripTable from '~/components/TripTable.vue'
import AppButton from '~/components/AppButton.vue'

const router = useRouter()
const authStore = useAuthStore()

// Estado
const trips = ref([])
const loading = ref(true)
const currentPage = ref(1)
const totalItems = ref(0)
const itemsPerPage = ref(10)
const sortBy = ref('departure_date')
const sortDirection = ref('asc')
const filters = reactive({
  origin: '',
  destination: '',
  date: '',
  status: ''
})

// Comprobar autenticación al montar el componente
onMounted(() => {
  // Si el usuario no está autenticado, redirigir a login
  if (!authStore.isAuthenticated) {
    router.push('/login')
    return
  }
  
  // Cargar viajes
  fetchTrips()
})

// Cargar viajes
const fetchTrips = async () => {
  loading.value = true
  
  try {
    // En un entorno real, aquí se haría una llamada a la API
    // const response = await fetch(`/api/trips?page=${currentPage.value}&limit=${itemsPerPage.value}&sort=${sortBy.value}&direction=${sortDirection.value}`)
    
    // Simulación de datos para desarrollo
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Generar datos de ejemplo
    const exampleTrips = generateExampleTrips()
    
    // Filtrar según los filtros aplicados
    let filteredTrips = exampleTrips
    
    if (filters.origin) {
      filteredTrips = filteredTrips.filter(trip => trip.route.origin === filters.origin)
    }
    
    if (filters.destination) {
      filteredTrips = filteredTrips.filter(trip => trip.route.destination === filters.destination)
    }
    
    if (filters.date) {
      const filterDate = new Date(filters.date).toISOString().split('T')[0]
      filteredTrips = filteredTrips.filter(trip => trip.departure_date.startsWith(filterDate))
    }
    
    if (filters.status) {
      filteredTrips = filteredTrips.filter(trip => trip.status === filters.status)
    }
    
    // Ordenar
    filteredTrips.sort((a, b) => {
      let valueA, valueB
      
      switch (sortBy.value) {
        case 'id':
          valueA = a.id
          valueB = b.id
          break
        case 'origin':
          valueA = a.route.origin
          valueB = b.route.origin
          break
        case 'destination':
          valueA = a.route.destination
          valueB = b.route.destination
          break
        case 'departure_date':
          valueA = a.departure_date
          valueB = b.departure_date
          break
        case 'departure_time':
          valueA = a.departure_time
          valueB = b.departure_time
          break
        case 'status':
          valueA = a.status
          valueB = b.status
          break
        case 'seats':
          valueA = a.available_seats
          valueB = b.available_seats
          break
        default:
          valueA = a.departure_date
          valueB = b.departure_date
      }
      
      if (sortDirection.value === 'asc') {
        return valueA > valueB ? 1 : -1
      } else {
        return valueA < valueB ? 1 : -1
      }
    })
    
    // Paginación
    totalItems.value = filteredTrips.length
    const start = (currentPage.value - 1) * itemsPerPage.value
    const end = start + itemsPerPage.value
    trips.value = filteredTrips.slice(start, end)
    
  } catch (error) {
    console.error('Error al cargar los viajes:', error)
    // Aquí se podría mostrar un mensaje de error
  } finally {
    loading.value = false
  }
}

// Generar datos de ejemplo
const generateExampleTrips = () => {
  const statuses = ['scheduled', 'in_progress', 'completed', 'cancelled']
  const routes = [
    { origin: 'Santa Cruz', destination: 'Comarapa' },
    { origin: 'Comarapa', destination: 'Santa Cruz' },
    { origin: 'Santa Cruz', destination: 'Cochabamba' },
    { origin: 'Cochabamba', destination: 'Santa Cruz' },
    { origin: 'Santa Cruz', destination: 'La Paz' },
    { origin: 'La Paz', destination: 'Santa Cruz' },
    { origin: 'Cochabamba', destination: 'La Paz' },
    { origin: 'La Paz', destination: 'Cochabamba' }
  ]
  
  const trips = []
  
  for (let i = 1; i <= 50; i++) {
    const route = routes[Math.floor(Math.random() * routes.length)]
    const status = statuses[Math.floor(Math.random() * statuses.length)]
    const totalSeats = 40
    const availableSeats = status === 'cancelled' ? 0 : Math.floor(Math.random() * totalSeats)
    
    // Generar fecha aleatoria en los próximos 30 días
    const date = new Date()
    date.setDate(date.getDate() + Math.floor(Math.random() * 30))
    const departureDate = date.toISOString().split('T')[0]
    
    // Generar hora aleatoria
    const hours = String(Math.floor(Math.random() * 24)).padStart(2, '0')
    const minutes = String(Math.floor(Math.random() * 60)).padStart(2, '0')
    const departureTime = `${hours}:${minutes}`
    
    trips.push({
      id: i,
      route,
      departure_date: departureDate,
      departure_time: departureTime,
      status,
      total_seats: totalSeats,
      available_seats: availableSeats
    })
  }
  
  return trips
}

// Manejar cambio de página
const handlePageChange = (page) => {
  currentPage.value = page
  fetchTrips()
}

// Manejar cambio de ordenamiento
const handleSortChange = ({ column, direction }) => {
  sortBy.value = column
  sortDirection.value = direction
  fetchTrips()
}

// Manejar cambio de filtros
const handleFilterChange = (newFilters) => {
  Object.assign(filters, newFilters)
  currentPage.value = 1 // Resetear a la primera página
  fetchTrips()
}

// Manejar ver viaje
const handleViewTrip = (tripId) => {
  router.push(`/trips/${tripId}`)
}

// Manejar editar viaje
const handleEditTrip = (tripId) => {
  router.push(`/trips/${tripId}/edit`)
}

// Definir la metadata de la página
definePageMeta({
  middleware: ['auth'] // Aplicar middleware de autenticación
})
</script>
