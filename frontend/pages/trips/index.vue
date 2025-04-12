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

// Servicios
import tripService from '~/services/tripService'

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
  status: '',
  search: '',
  dateFrom: '',
  dateTo: '',
  minSeats: ''
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
    // Usar el servicio para obtener los viajes
    const result = await tripService.getTrips(
      filters, // Filtros
      { by: sortBy.value, direction: sortDirection.value }, // Ordenamiento
      { page: currentPage.value, itemsPerPage: itemsPerPage.value } // Paginación
    )

    // Actualizar el estado con los datos obtenidos
    trips.value = result.trips
    totalItems.value = result.pagination.totalItems

  } catch (error) {
    console.error('Error al cargar los viajes:', error)
    // Aquí se podría mostrar un mensaje de error
  } finally {
    loading.value = false
  }
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
