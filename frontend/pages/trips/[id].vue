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

        <div v-if="tripStore.isLoading" class="flex justify-center py-12">
          <p class="text-gray-500">Cargando información del viaje...</p>
        </div>

        <div v-else-if="tripStore.error" class="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
          <div class="flex">
            <div class="flex-shrink-0">
              <svg class="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
              </svg>
            </div>
            <div class="ml-3">
              <h3 class="text-sm font-medium text-red-800">{{ tripStore.error }}</h3>
            </div>
          </div>
        </div>

        <div v-else-if="displayedTrip">
          <div class="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
            <div class="px-4 py-5 sm:px-6 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
              <div>
                <h3 class="text-lg leading-6 font-medium text-gray-900">
                  Detalles del Viaje
                </h3>
                <p class="mt-1 max-w-2xl text-sm text-gray-500">
                  ID: {{ displayedTrip.id }}
                </p>
              </div>
              <div>
                <span
                  class="px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full"
                  :class="getStatusClass(displayedTrip.status)"
                >
                  {{ getStatusText(displayedTrip.status) }}
                </span>
              </div>
            </div>
            <div class="border-t border-gray-200">
              <dl class="divide-y divide-gray-200">
                <div class="px-4 py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6 bg-gray-50">
                  <dt class="text-sm font-medium text-gray-500">Ruta</dt>
                  <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2 font-medium">
                    <div class="flex items-center">
                      <span>{{ displayedTrip.route?.origin }}</span>
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mx-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                      <span>{{ displayedTrip.route?.destination }}</span>
                    </div>
                  </dd>
                </div>

                <div class="px-4 py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6 bg-white">
                  <dt class="text-sm font-medium text-gray-500">Fecha de salida</dt>
                  <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {{ formatDate(displayedTrip.trip_datetime) }}
                  </dd>
                </div>

                <div class="px-4 py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6 bg-gray-50">
                  <dt class="text-sm font-medium text-gray-500">Hora de salida</dt>
                  <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2 font-medium">
                    {{ formatTime(displayedTrip.departure_time, displayedTrip.trip_datetime) }}
                  </dd>
                </div>

                <div class="px-4 py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6 bg-white">
                  <dt class="text-sm font-medium text-gray-500">Asientos</dt>
                  <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    <div class="flex flex-col sm:flex-row sm:items-center gap-2">
                      <div class="flex items-center">
                        <span class="px-2 py-1 bg-green-100 text-green-800 rounded-md text-xs font-medium cursor-pointer" @click="toggleAvailableSeats">
                          {{ displayedTrip.available_seats }} disponibles
                          <span v-if="!showAvailableSeats" class="ml-1">▼</span>
                          <span v-else class="ml-1">▲</span>
                        </span>
                      </div>
                      <div v-if="displayedTrip.occupied_seat_numbers && displayedTrip.occupied_seat_numbers.length > 0" class="flex items-center">
                        <span class="px-2 py-1 bg-red-100 text-red-800 rounded-md text-xs font-medium cursor-pointer" @click="toggleOccupiedSeats">
                          {{ displayedTrip.occupied_seat_numbers.length }} ocupados
                          <span v-if="!showOccupiedSeats" class="ml-1">▼</span>
                          <span v-else class="ml-1">▲</span>
                        </span>
                      </div>
                      <div class="flex items-center">
                        <span class="px-2 py-1 bg-gray-100 text-gray-800 rounded-md text-xs font-medium">
                          {{ displayedTrip.total_seats }} totales
                        </span>
                      </div>
                    </div>
                    <div v-if="showAvailableSeats && sortedAvailableSeats.length > 0" class="mt-3 bg-green-50 p-3 rounded-md border border-green-100">
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
                    <div v-if="showOccupiedSeats && sortedOccupiedSeats.length > 0" class="mt-3 bg-red-50 p-3 rounded-md border border-red-100">
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
                    <div v-if="displayedTrip.driver" class="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                      <span class="text-gray-900">{{ displayedTrip.driver.firstname }} {{ displayedTrip.driver.lastname }}</span>
                    </div>
                    <span v-else>No asignado</span>
                  </dd>
                </div>

                <div class="px-4 py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6 bg-white">
                  <dt class="text-sm font-medium text-gray-500">Asistente</dt>
                  <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    <div v-if="displayedTrip.assistant" class="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                      <span class="text-gray-900">{{ displayedTrip.assistant.firstname }} {{ displayedTrip.assistant.lastname }}</span>
                    </div>
                    <span v-else>No asignado</span>
                  </dd>
                </div>

                <div class="px-4 py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6 bg-gray-50">
                  <dt class="text-sm font-medium text-gray-500">Bus</dt>
                  <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    <div v-if="displayedTrip.bus" class="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                      <span class="px-2 py-1 bg-blue-100 text-blue-800 rounded-md text-xs font-medium">{{ displayedTrip.bus.license_plate }}</span>
                      <span class="text-gray-500">{{ displayedTrip.bus.model }}</span>
                    </div>
                    <span v-else>No asignado</span>
                  </dd>
                </div>

                <div class="px-4 py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6 bg-white">
                  <dt class="text-sm font-medium text-gray-500">Secretaria</dt>
                  <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    <div v-if="displayedTrip.secretary" class="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                      <span class="text-gray-900">{{ displayedTrip.secretary.firstname }} {{ displayedTrip.secretary.lastname }}</span>
                    </div>
                    <span v-else>No asignada</span>
                  </dd>
                </div>
              </dl>
            </div>
          </div>

          <!-- Mapa de asientos -->
          <div v-if="displayedTrip" class="mt-6 mb-8">
            <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
              <h3 class="text-lg font-medium text-gray-900">Mapa de Asientos</h3>
              <div class="mt-2 sm:mt-0 flex items-center space-x-4">
                <div class="flex items-center">
                  <span class="text-xs text-gray-500 mr-2">{{ displayedTrip.available_seats }} disponibles</span>
                  <span class="inline-block w-2 h-2 rounded-full bg-green-500 mr-1"></span>
                </div>
                <div class="flex items-center">
                  <span class="text-xs text-gray-500 mr-2">{{ displayedTrip.occupied_seat_numbers ? displayedTrip.occupied_seat_numbers.length : 0 }} ocupados</span>
                  <span class="inline-block w-2 h-2 rounded-full bg-red-500 mr-1"></span>
                </div>
                <div class="flex items-center">
                  <span class="text-xs text-gray-500 mr-2">{{ displayedTrip.total_seats }} totales</span>
                  <span class="inline-block w-2 h-2 rounded-full bg-gray-500 mr-1"></span>
                </div>
              </div>
            </div>

            <div class="bg-white rounded-lg shadow overflow-hidden">
              <BusSeatMapPrint
                :trip="displayedTrip" 
                :selection-enabled="false"
                :reserved_seat_numbers="reservedSeatNumbers"
              />
            </div>
          </div>

          <!-- Sold Tickets Section -->
          <div class="mt-8">
            <button
              @click="toggleSoldTickets"
              class="w-full flex justify-between items-center px-4 py-3 bg-gray-100 hover:bg-gray-200 rounded-lg shadow focus:outline-none transition-colors duration-150"
            >
              <h3 class="text-lg font-medium text-gray-800">
                Boletos Vendidos ({{ soldTickets.length }})
              </h3>
              <ChevronDownIcon v-if="!showSoldTickets" class="w-6 h-6 text-gray-600" />
              <ChevronUpIcon v-else class="w-6 h-6 text-gray-600" />
            </button>

            <div v-if="showSoldTickets" class="mt-4">
              <div v-if="isLoadingSoldTickets" class="flex justify-center py-6">
                <p class="text-gray-500 italic">Cargando boletos vendidos...</p>
                <!-- You can add a spinner here -->
              </div>
              <div v-else-if="soldTicketsError" class="bg-red-50 border border-red-200 rounded-md p-4">
                <p class="text-red-700 text-sm">{{ soldTicketsError }}</p>
              </div>
              <div v-else-if="soldTickets.length === 0" class="bg-blue-50 border border-blue-200 rounded-md p-4">
                <p class="text-blue-700 text-sm">No hay boletos vendidos para este viaje aún.</p>
              </div>
              <!-- Iterate over grouped tickets -->
              <div v-else class="space-y-4">
                <div v-for="(ticketsInState, state) in groupedSoldTickets" :key="state">
                  <button
                    @click="toggleTicketsByState(state)"
                    class="w-full flex justify-between items-center px-4 py-2.5 bg-gray-50 hover:bg-gray-100 rounded-md shadow-sm focus:outline-none transition-colors duration-150 border border-gray-200"
                  >
                    <h4 class="text-md font-medium text-gray-700">
                      {{ state.charAt(0).toUpperCase() + state.slice(1) }} ({{ ticketsInState.length }})
                    </h4>
                    <ChevronDownIcon v-if="!showTicketsByState[state]" class="w-5 h-5 text-gray-500" />
                    <ChevronUpIcon v-else class="w-5 h-5 text-gray-500" />
                  </button>

                  <div v-if="showTicketsByState[state]" class="mt-3 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div
                      v-for="ticket in ticketsInState"
                      :key="ticket.id"
                      class="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 hover:shadow-lg transition-shadow duration-200 ease-in-out"
                    >
                      <div class="p-5">
                        <div class="flex justify-between items-start mb-3">
                          <h4 class="text-md font-semibold text-green-700">
                            Boleto #{{ ticket.id }}
                          </h4>
                          <span 
                            class="px-2 py-0.5 text-xs font-medium rounded-full"
                            :class="{
                              'bg-green-100 text-green-800': ticket.state === 'confirmed',
                              'bg-yellow-100 text-yellow-800': ticket.state === 'pending',
                              'bg-red-100 text-red-800': ticket.state === 'cancelled',
                              'bg-gray-100 text-gray-800': ticket.state === 'completed' || ticket.state === 'used' || ticket.state === 'unknown',
                            }"
                          >
                            {{ ticket.state ? ticket.state.charAt(0).toUpperCase() + ticket.state.slice(1) : 'N/D' }}
                          </span>
                        </div>

                        <div class="space-y-2.5 text-sm text-gray-600">
                          <div class="flex items-center">
                            <UserCircleIcon class="w-5 h-5 mr-2 text-green-500 flex-shrink-0" />
                            <p><span class="font-medium text-gray-700">Pasajero:</span> {{ ticket.client?.firstname }} {{ ticket.client?.lastname }}</p>
                          </div>
                          <div class="flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2 text-green-500 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                             <p><span class="font-medium text-gray-700">Asiento:</span> {{ ticket.seat?.seat_number }} ({{ ticket.seat?.deck }})</p>
                          </div>
                           <div class="flex items-center">
                             <CurrencyDollarIcon class="w-5 h-5 mr-2 text-green-500 flex-shrink-0" />
                             <p><span class="font-medium text-gray-700">Precio:</span> Bs. {{ ticket.price?.toFixed(2) }}</p>
                          </div>
                          <div class="flex items-center">
                             <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2 text-green-500 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                              <path fill-rule="evenodd" d="M5 4a3 3 0 00-3 3v6a3 3 0 003 3h10a3 3 0 003-3V7a3 3 0 00-3-3H5zm-1 9v-1h5v2H5a1 1 0 01-1-1zm7 1h4a1 1 0 001-1v-1h-5v2zm0-4h5V8h-5v2zM4 8h5v2H4V8z" clip-rule="evenodd" />
                            </svg>
                             <p><span class="font-medium text-gray-700">Método Pago:</span> {{ ticket.payment_method || 'N/D' }}</p>
                          </div>
                          <div class="flex items-center">
                            <CalendarIcon class="w-5 h-5 mr-2 text-green-500 flex-shrink-0" />
                            <p><span class="font-medium text-gray-700">Vendido:</span> {{ formatDate(ticket.created_at) }}</p>
                          </div>
                           <div v-if="ticket.secretary" class="flex items-center">
                             <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2 text-green-500 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                              <path fill-rule="evenodd" d="M18 8a6 6 0 11-12 0 6 6 0 0112 0zm-8-3a1 1 0 00-.867.5 1 1 0 01-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clip-rule="evenodd" />
                            </svg>
                             <p><span class="font-medium text-gray-700">Vendido por:</span> {{ ticket.secretary.firstname }} {{ ticket.secretary.lastname }}</p>
                          </div>
                        </div>
                      </div>
                      <div v-if="ticket.state === 'confirmed' || ticket.state === 'pending'" class="px-5 py-3 bg-gray-50 border-t border-gray-100 flex justify-end space-x-2">
                        <AppButton size="sm" variant="danger-outline">Cancelar</AppButton>
                        <AppButton size="sm" variant="primary">Imprimir</AppButton> <!-- Placeholder for future actions -->
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <!-- End Sold Tickets Section -->

          <div v-if="displayedTrip" class="flex flex-col sm:flex-row justify-end gap-3 sm:space-x-3">
            <AppButton
              variant="secondary"
              @click="router.push(`/trips/${displayedTrip.id}/edit`)"
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
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useTripStore } from '@/stores/tripStore'
import AppButton from '@/components/AppButton.vue'
import BusSeatMapPrint from '@/components/BusSeatMapPrint.vue'
import { ChevronDownIcon, ChevronUpIcon, UserCircleIcon, CurrencyDollarIcon, CalendarIcon } from '@heroicons/vue/24/outline/index.js'

const route = useRoute()
const router = useRouter()
const tripStore = useTripStore()
const config = useRuntimeConfig()

const tripId = computed(() => parseInt(route.params.id))
const displayedTrip = computed(() => tripStore.currentTrip)

const showAvailableSeats = ref(false)
const showOccupiedSeats = ref(false)

// New reactive properties for sold tickets
const soldTickets = ref([])
const isLoadingSoldTickets = ref(false)
const soldTicketsError = ref(null)
const showSoldTickets = ref(false) // To toggle visibility of the main sold tickets section

// New reactive state for toggling visibility of tickets grouped by state
const showTicketsByState = ref({});

const groupedSoldTickets = computed(() => {
  if (!soldTickets.value || soldTickets.value.length === 0) {
    return {};
  }
  return soldTickets.value.reduce((acc, ticket) => {
    const state = ticket.state || 'unknown'; // Group tickets with no state under 'unknown'
    if (!acc[state]) {
      acc[state] = [];
    }
    acc[state].push(ticket);
    return acc;
  }, {});
});

// Obtener los números de asientos que tienen tickets en estado "pending" (reservados)
const reservedSeatNumbers = computed(() => {
  if (!soldTickets.value || soldTickets.value.length === 0) {
    return [];
  }
  
  // Filtrar los tickets en estado "pending" y extraer los números de asiento
  return soldTickets.value
    .filter(ticket => ticket.state === 'pending' && ticket.seat)
    .map(ticket => ticket.seat.seat_number);
});

const sortedAvailableSeats = computed(() => {
  if (!displayedTrip.value || !displayedTrip.value.seats_layout) return []
  return displayedTrip.value.seats_layout
    .filter(seat => seat.status === 'available')
    .map(seat => seat.seat_number)
    .sort((a, b) => a - b)
})

const sortedOccupiedSeats = computed(() => {
  if (!displayedTrip.value || !displayedTrip.value.occupied_seat_numbers) return []
  return [...displayedTrip.value.occupied_seat_numbers].sort((a, b) => a - b)
})

onMounted(async () => {
  if (isNaN(tripId.value)) {
    console.error("Invalid trip ID")
    router.push('/trips')
    return
  }
  await tripStore.fetchTripById(tripId.value)
  // If trip details are successfully fetched, then fetch sold tickets
  if (displayedTrip.value && displayedTrip.value.id) {
    await fetchSoldTickets(); // Call fetchSoldTickets on mount
  }
})

const getStatusClass = (status) => {
  switch (status) {
    case 'scheduled': return 'bg-blue-100 text-blue-800'
    case 'boarding': return 'bg-yellow-100 text-yellow-800'
    case 'departed': return 'bg-indigo-100 text-indigo-800'
    case 'arrived': return 'bg-green-100 text-green-800'
    case 'cancelled': return 'bg-red-100 text-red-800'
    case 'delayed': return 'bg-orange-100 text-orange-800'
    default: return 'bg-gray-100 text-gray-800'
  }
}

const getStatusText = (status) => {
  switch (status) {
    case 'scheduled': return 'Programado'
    case 'boarding': return 'Abordando'
    case 'departed': return 'En Ruta'
    case 'arrived': return 'Llegó'
    case 'cancelled': return 'Cancelado'
    case 'delayed': return 'Retrasado'
    default: return status ? status.charAt(0).toUpperCase() + status.slice(1) : 'Desconocido'
  }
}

const formatDate = (dateString) => {
  if (!dateString) return 'Fecha no disponible'
  const options = { year: 'numeric', month: 'long', day: 'numeric' }
  try {
    return new Date(dateString).toLocaleDateString('es-ES', options)
  } catch (e) {
    return 'Fecha inválida'
  }
}

const formatTime = (timeString, dateString) => {
  if (!timeString) return 'Hora no especificada'
  if (timeString.includes('T')) {
    const date = new Date(timeString)
    return date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
  }
  if (dateString && timeString.match(/^\d{2}:\d{2}:\d{2}$/)) {
    const [hours, minutes] = timeString.split(':')
    const date = new Date(dateString)
    date.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0, 0)
    return date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
  }
  const parts = timeString.split(':');
  if (parts.length >= 2) {
    return `${parts[0]}:${parts[1]}`;
  }
  return timeString;
}

const goToSellTicket = () => {
  if (displayedTrip.value && displayedTrip.value.id) {
    router.push(`/tickets/new?trip=${displayedTrip.value.id}`); // Navigate directly
  } else {
    console.warn("Cannot navigate to sell ticket: Trip data not available.");
    // Optionally, show a notification to the user
  }
};

const toggleAvailableSeats = () => {
  showAvailableSeats.value = !showAvailableSeats.value
}

const toggleOccupiedSeats = () => {
  showOccupiedSeats.value = !showOccupiedSeats.value
}

// Method to fetch sold tickets
const fetchSoldTickets = async () => {
  if (!displayedTrip.value || !displayedTrip.value.id) {
    soldTicketsError.value = 'ID del viaje no disponible para cargar boletos.';
    return;
  }
  isLoadingSoldTickets.value = true;
  soldTicketsError.value = null;
  try {
    const apiUrl = `${config.public.apiBaseUrl}/tickets/trip/${displayedTrip.value.id}`;
    // Using $fetch as recommended for client-side fetching after mount
    const responseData = await $fetch(apiUrl, {
      method: 'GET',
      // headers: { ... } // Add any necessary headers, like Authorization if needed
    });

    if (responseData) {
        // Ensure plain objects for Pinia SSR/hydration
        soldTickets.value = JSON.parse(JSON.stringify(responseData));
        console.log('Tickets cargados:', soldTickets.value);
        console.log('Asientos reservados:', reservedSeatNumbers.value);
    } else {
        soldTickets.value = [];
    }
  } catch (err) { 
    console.error("API Error fetching sold tickets:", err);
    // $fetch errors often have a `data` property with more details from the server
    // Also, check err.response for more details if available
    let errorMessage = 'No se pudieron cargar los boletos vendidos. Intente más tarde.';
    if (err.response && err.response._data && err.response._data.detail) {
      errorMessage = err.response._data.detail;
    } else if (err.data && err.data.message) {
      errorMessage = err.data.message;
    } else if (err.message) {
      errorMessage = err.message;
    }
    soldTicketsError.value = errorMessage;
    soldTickets.value = [];
  }
  finally {
    isLoadingSoldTickets.value = false;
  }
}

// Method to toggle sold tickets display and fetch if needed
const toggleSoldTickets = () => {
  showSoldTickets.value = !showSoldTickets.value;
  if (showSoldTickets.value && (soldTickets.value.length === 0 || soldTicketsError.value) && !isLoadingSoldTickets.value) {
    fetchSoldTickets();
  }
  // When closing the main dropdown, also reset individual group visibility if desired
  // if (!showSoldTickets.value) {
  //   showTicketsByState.value = {}; 
  // }
}

// Method to toggle visibility of tickets for a specific state
const toggleTicketsByState = (state) => {
  showTicketsByState.value[state] = !showTicketsByState.value[state];
}

// Watch for changes in displayedTrip.id if the section is already open
watch(() => displayedTrip.value?.id, (newId, oldId) => {
  if (newId && newId !== oldId && showSoldTickets.value) {
    fetchSoldTickets();
  }
});

// Make sure definePageMeta is correctly placed if it's outside script setup
// For Nuxt 3, it's typically auto-imported or used in a separate <script> block if not setup.
// definePageMeta({ middleware: ['auth'] }); // Example, if auth middleware is needed

</script>




