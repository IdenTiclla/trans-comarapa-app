<template>
  <div>
    <div class="py-6">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="mb-6">
          <button
            @click="router.back()"
            class="flex items-center text-blue-600 hover:text-blue-800"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clip-rule="evenodd" />
            </svg>
            Volver
          </button>
        </div>

        <div v-if="loading" class="flex justify-center py-12">
          <p class="text-gray-500">Cargando información del viaje...</p>
        </div>

        <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
          <div class="flex">
            <div class="flex-shrink-0">
              <svg class="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
              </svg>
            </div>
            <div class="ml-3">
              <h3 class="text-sm font-medium text-red-800">{{ error }}</h3>
            </div>
          </div>
        </div>

        <div v-else>
          <div class="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
            <div class="px-4 py-5 sm:px-6 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
              <div>
                <h3 class="text-lg leading-6 font-medium text-gray-900">
                  Detalles del Viaje
                </h3>
                <p class="mt-1 max-w-2xl text-sm text-gray-500">
                  ID: {{ trip.id }}
                </p>
              </div>
              <div>
                <span
                  class="px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full"
                  :class="getStatusClass(trip.status)"
                >
                  {{ getStatusText(trip.status) }}
                </span>
              </div>
            </div>
            <div class="border-t border-gray-200">
              <dl class="divide-y divide-gray-200">
                <div class="px-4 py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6 bg-gray-50">
                  <dt class="text-sm font-medium text-gray-500">Ruta</dt>
                  <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2 font-medium">
                    <div class="flex items-center">
                      <span>{{ trip.route.origin }}</span>
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mx-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                      <span>{{ trip.route.destination }}</span>
                    </div>
                  </dd>
                </div>

                <div class="px-4 py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6 bg-white">
                  <dt class="text-sm font-medium text-gray-500">Fecha de salida</dt>
                  <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {{ formatDate(trip.departure_date) }}
                  </dd>
                </div>

                <div class="px-4 py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6 bg-gray-50">
                  <dt class="text-sm font-medium text-gray-500">Hora de salida</dt>
                  <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2 font-medium">
                    {{ trip.departure_time }}
                  </dd>
                </div>

                <div class="px-4 py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6 bg-white">
                  <dt class="text-sm font-medium text-gray-500">Asientos</dt>
                  <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    <div class="flex flex-col sm:flex-row sm:items-center gap-2">
                      <!-- Asientos disponibles -->
                      <div class="flex items-center">
                        <span class="px-2 py-1 bg-green-100 text-green-800 rounded-md text-xs font-medium cursor-pointer" @click="toggleAvailableSeats">
                          {{ trip.available_seats }} disponibles
                          <span v-if="!showAvailableSeats" class="ml-1">▼</span>
                          <span v-else class="ml-1">▲</span>
                        </span>
                      </div>

                      <!-- Asientos ocupados -->
                      <div v-if="trip.occupied_seats && trip.occupied_seats.length > 0" class="flex items-center">
                        <span class="px-2 py-1 bg-red-100 text-red-800 rounded-md text-xs font-medium cursor-pointer" @click="toggleOccupiedSeats">
                          {{ trip.occupied_seats.length }} ocupados
                          <span v-if="!showOccupiedSeats" class="ml-1">▼</span>
                          <span v-else class="ml-1">▲</span>
                        </span>
                      </div>

                      <!-- Total de asientos -->
                      <div class="flex items-center">
                        <span class="px-2 py-1 bg-gray-100 text-gray-800 rounded-md text-xs font-medium">
                          {{ trip.total_seats }} totales
                        </span>
                      </div>
                    </div>

                    <!-- Lista de asientos disponibles -->
                    <div v-if="showAvailableSeats && trip.available_seat_numbers && trip.available_seat_numbers.length > 0" class="mt-3 bg-green-50 p-3 rounded-md border border-green-100">
                      <h4 class="text-xs font-medium text-green-800 mb-2">Asientos disponibles:</h4>
                      <div class="flex flex-wrap gap-1">
                        <span
                          v-for="seatNumber in sortedAvailableSeats"
                          :key="seatNumber"
                          class="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800"
                        >
                          {{ seatNumber }}
                        </span>
                      </div>
                    </div>

                    <!-- Lista de asientos ocupados -->
                    <div v-if="showOccupiedSeats && trip.occupied_seats && trip.occupied_seats.length > 0" class="mt-3 bg-red-50 p-3 rounded-md border border-red-100">
                      <h4 class="text-xs font-medium text-red-800 mb-2">Asientos ocupados:</h4>
                      <div class="flex flex-wrap gap-1">
                        <span
                          v-for="seatNumber in sortedOccupiedSeats"
                          :key="seatNumber"
                          class="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800"
                        >
                          {{ seatNumber }}
                        </span>
                      </div>
                    </div>
                  </dd>
                </div>

                <div class="px-4 py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6 bg-gray-50">
                  <dt class="text-sm font-medium text-gray-500">Conductor</dt>
                  <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {{ trip.driver ? trip.driver.name : 'No asignado' }}
                  </dd>
                </div>

                <div class="px-4 py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6 bg-white">
                  <dt class="text-sm font-medium text-gray-500">Asistente</dt>
                  <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {{ trip.assistant ? trip.assistant.name : 'No asignado' }}
                  </dd>
                </div>

                <div class="px-4 py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6 bg-gray-50">
                  <dt class="text-sm font-medium text-gray-500">Bus</dt>
                  <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    <div v-if="trip.bus" class="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                      <span class="px-2 py-1 bg-blue-100 text-blue-800 rounded-md text-xs font-medium">{{ trip.bus.plate }}</span>
                      <span class="text-gray-500">{{ trip.bus.model }}</span>
                    </div>
                    <span v-else>No asignado</span>
                  </dd>
                </div>
              </dl>
            </div>
          </div>

          <!-- Mapa de asientos -->
          <div class="mt-6 mb-8">
            <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
              <h3 class="text-lg font-medium text-gray-900">Mapa de Asientos</h3>

              <div class="mt-2 sm:mt-0 flex items-center space-x-4">
                <!-- Asientos disponibles -->
                <div class="flex items-center">
                  <span class="text-xs text-gray-500 mr-2">{{ trip.available_seats }} disponibles</span>
                  <span class="inline-block w-2 h-2 rounded-full bg-green-500 mr-1"></span>
                </div>
                <!-- Asientos ocupados -->
                <div class="flex items-center">
                  <span class="text-xs text-gray-500 mr-2">{{ trip.occupied_seats ? trip.occupied_seats.length : 0 }} ocupados</span>
                  <span class="inline-block w-2 h-2 rounded-full bg-red-500 mr-1"></span>
                </div>
                <!-- Total de asientos -->
                <div class="flex items-center">
                  <span class="text-xs text-gray-500 mr-2">{{ trip.total_seats }} totales</span>
                  <span class="inline-block w-2 h-2 rounded-full bg-gray-500 mr-1"></span>
                </div>
              </div>
            </div>

            <div class="bg-white rounded-lg shadow overflow-hidden">
              <BusSeatMapPrint
                :trip="trip"
                :selection-enabled="false"
              />
            </div>
          </div>

          <div class="flex flex-col sm:flex-row justify-end gap-3 sm:space-x-3">
            <AppButton
              variant="secondary"
              @click="router.push(`/trips/${trip.id}/edit`)"
              class="w-full sm:w-auto order-2 sm:order-1"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Editar
            </AppButton>
            <AppButton
              variant="primary"
              @click="goToSellTicket"
              class="w-full sm:w-auto order-1 sm:order-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
              </svg>
              Vender Boleto
            </AppButton>
          </div>

          <!-- Modal de selección de asientos -->
          <div v-if="showSeatSelection" class="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div class="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto relative">
              <div class="sticky top-0 z-10 bg-white px-4 py-4 sm:px-6 border-b border-gray-200 flex justify-between items-center">
                <h3 class="text-lg font-medium text-gray-900">Venta de Boletos</h3>
                <button
                  @click="showSeatSelection = false"
                  class="text-gray-400 hover:text-gray-500 focus:outline-none"
                  aria-label="Cerrar"
                >
                  <svg class="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div class="p-4 sm:p-6">
                <SeatSelection
                  :trip="trip"
                  @selection-confirmed="handleSeatSelectionConfirmed"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '~/stores/auth'
import tripService from '~/services/tripService'
import AppButton from '~/components/AppButton.vue'
import SeatSelection from '~/components/SeatSelection.vue'
import BusSeatMapPrint from '~/components/BusSeatMapPrint.vue'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const trip = ref(null)
const loading = ref(true)
const error = ref(null)
const showSeatSelection = ref(false)
const showOccupiedSeats = ref(false)
const showAvailableSeats = ref(false)

// Comprobar autenticación al montar el componente
onMounted(() => {
  // Si el usuario no está autenticado, redirigir a login
  if (!authStore.isAuthenticated) {
    router.push('/login')
    return
  }

  // Cargar detalles del viaje
  fetchTripDetails()
})

// Cargar detalles del viaje
const fetchTripDetails = async () => {
  loading.value = true
  error.value = null

  try {
    // Usar el servicio para obtener los detalles del viaje
    trip.value = await tripService.getTripById(route.params.id)

    // Obtener asientos disponibles
    const seatsData = await tripService.getAvailableSeats(route.params.id)

    // Actualizar la información de asientos en el objeto trip
    if (trip.value) {
      trip.value.total_seats = seatsData.totalSeats
      trip.value.available_seats = seatsData.availableSeats
      trip.value.occupied_seats = seatsData.occupiedSeats
      trip.value.available_seat_numbers = seatsData.availableSeatNumbers
    }

    console.log('Detalles del viaje cargados:', trip.value)
    console.log('Información de asientos:', seatsData)

  } catch (err) {
    console.error('Error al cargar los detalles del viaje:', err)
    error.value = 'No se pudieron cargar los detalles del viaje. Intente nuevamente.'
  } finally {
    loading.value = false
  }
}

// Formatear fecha
const formatDate = (dateString) => {
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('es-ES', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).format(date)
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

// Ir directamente a la página de venta de boletos
const goToSellTicket = () => {
  // Redirigir directamente a la página de venta de boletos
  router.push(`/tickets/new?trip=${trip.value.id}`);
}

// Mostrar u ocultar la lista de asientos ocupados
const toggleOccupiedSeats = () => {
  showOccupiedSeats.value = !showOccupiedSeats.value;
  // Si estamos mostrando los asientos ocupados, ocultamos los disponibles para evitar sobrecarga visual
  if (showOccupiedSeats.value && showAvailableSeats.value) {
    showAvailableSeats.value = false;
  }
}

// Mostrar u ocultar la lista de asientos disponibles
const toggleAvailableSeats = () => {
  showAvailableSeats.value = !showAvailableSeats.value;
  // Si estamos mostrando los asientos disponibles, ocultamos los ocupados para evitar sobrecarga visual
  if (showAvailableSeats.value && showOccupiedSeats.value) {
    showOccupiedSeats.value = false;
  }
}

// Asientos disponibles ordenados numéricamente
const sortedAvailableSeats = computed(() => {
  if (!trip.value || !trip.value.available_seat_numbers) return [];

  // Convertir a números y ordenar numéricamente
  return [...trip.value.available_seat_numbers].sort((a, b) => {
    return parseInt(a) - parseInt(b);
  });
});

// Asientos ocupados ordenados numéricamente
const sortedOccupiedSeats = computed(() => {
  if (!trip.value || !trip.value.occupied_seats) return [];

  // Convertir a números y ordenar numéricamente
  return [...trip.value.occupied_seats].sort((a, b) => {
    return parseInt(a) - parseInt(b);
  });
});

// Manejar confirmación de selección de asientos
const handleSeatSelectionConfirmed = (selectedSeats) => {
  console.log('Asientos seleccionados:', selectedSeats)

  // Aquí se implementaría la lógica para continuar con la venta del boleto
  // Por ahora, simplemente cerramos el modal y mostramos un mensaje
  showSeatSelection.value = false

  // Simular redirección a la página de venta de boletos con los asientos seleccionados
  const seatNumbers = selectedSeats.map(seat => seat.number).join(',');
  router.push(`/tickets/new?trip=${trip.value.id}&seats=${seatNumbers}`);
}

// Definir la metadata de la página
definePageMeta({
  middleware: ['auth'] // Aplicar middleware de autenticación
})
</script>
