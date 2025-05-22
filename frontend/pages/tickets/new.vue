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

        <h1 class="text-2xl font-semibold text-gray-900 mb-6">Venta de Boletos</h1>

        <div v-if="loading" class="flex justify-center py-12">
          <p class="text-gray-500">Cargando información...</p>
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

        <div v-else class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <!-- Formulario de venta -->
          <div class="md:col-span-2">
            <div class="bg-white shadow overflow-hidden sm:rounded-lg">
              <div class="px-4 py-5 sm:px-6 border-b border-gray-200">
                <h3 class="text-lg leading-6 font-medium text-gray-900">Información del Boleto</h3>
              </div>

              <div class="px-4 py-5 sm:p-6">
                <form @submit.prevent="handleSubmit">
                  <!-- Información del viaje -->
                  <div class="mb-6 p-4 bg-gray-50 rounded-lg">
                    <h4 class="text-base font-medium text-gray-900 mb-2">Detalles del Viaje</h4>
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <p class="text-sm text-gray-500">Origen:</p>
                        <p class="text-sm font-medium">{{ trip.route.origin }}</p>
                      </div>
                      <div>
                        <p class="text-sm text-gray-500">Destino:</p>
                        <p class="text-sm font-medium">{{ trip.route.destination }}</p>
                      </div>
                      <div>
                        <p class="text-sm text-gray-500">Fecha:</p>
                        <p class="text-sm font-medium">{{ formatDate(trip.departure_date) }}</p>
                      </div>
                      <div>
                        <p class="text-sm text-gray-500">Hora:</p>
                        <p class="text-sm font-medium">{{ trip.departure_time }}</p>
                      </div>
                    </div>
                  </div>

                  <!-- Selección de asientos -->
                  <div class="bg-white shadow overflow-hidden sm:rounded-lg">
                    <div class="px-4 py-5 sm:px-6 border-b border-gray-200">
                      <h3 class="text-lg leading-6 font-medium text-gray-900">Selección de Asientos</h3>
                      <p class="mt-1 text-sm text-gray-500">
                        Seleccione los asientos disponibles para la venta
                      </p>
                    </div>
                    <div class="px-4 py-5 sm:p-6">
                      <div class="bg-white border border-gray-200 rounded-lg overflow-hidden mb-4">
                        <BusSeatMapPrint
                          :trip="trip"
                          :occupied-seats="occupiedSeats"
                          :reserved_seat_numbers="reservedSeatNumbers"
                          :initial-selected-seats="selectedSeats"
                          :selection-enabled="true"
                          @seat-selected="handleSeatSelected"
                          @seat-deselected="handleSeatDeselected"
                        />
                      </div>
                    </div>
                  </div>

                  <!-- Información del cliente -->
                  <div class="mb-6">
                    <h4 class="text-base font-medium text-gray-900 mb-4">Información del Cliente</h4>

                    <div class="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                      <!-- Tipo de cliente -->
                      <div class="sm:col-span-3">
                        <label class="block text-sm font-medium text-gray-700 mb-1">Tipo de cliente</label>
                        <div class="flex space-x-4">
                          <div class="flex items-center">
                            <input
                              id="client-type-existing"
                              type="radio"
                              v-model="clientType"
                              value="existing"
                              class="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300"
                            />
                            <label for="client-type-existing" class="ml-2 block text-sm text-gray-700">
                              Cliente existente
                            </label>
                          </div>
                          <div class="flex items-center">
                            <input
                              id="client-type-new"
                              type="radio"
                              v-model="clientType"
                              value="new"
                              class="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300"
                            />
                            <label for="client-type-new" class="ml-2 block text-sm text-gray-700">
                              Nuevo cliente
                            </label>
                          </div>
                        </div>
                      </div>

                      <!-- Cliente existente -->
                      <div v-if="clientType === 'existing'" class="sm:col-span-6">
                        <label for="client-search" class="block text-sm font-medium text-gray-700 mb-1">Buscar cliente</label>
                        <div class="mt-1 flex rounded-md shadow-sm">
                          <input
                            type="text"
                            id="client-search"
                            v-model="clientSearch"
                            class="flex-1 focus:ring-blue-500 focus:border-blue-500 block w-full min-w-0 rounded-none rounded-l-md sm:text-sm border-gray-300"
                            placeholder="Nombre, CI o teléfono"
                            :disabled="searchingClients"
                          />
                          <button
                            type="button"
                            @click="searchClientsByTerm"
                            class="relative -ml-px inline-flex items-center space-x-2 px-4 py-2 border border-gray-300 text-sm font-medium rounded-r-md text-gray-700 bg-gray-50 hover:bg-gray-100 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                            :disabled="searchingClients || !clientSearch || clientSearch.length < 3"
                          >
                            <svg v-if="searchingClients" class="animate-spin -ml-1 mr-2 h-4 w-4 text-gray-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                              <path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clip-rule="evenodd" />
                            </svg>
                            <span>{{ searchingClients ? 'Buscando...' : 'Buscar' }}</span>
                          </button>
                        </div>

                        <!-- Indicador de carga general para la sección de clientes -->
                        <div v-if="searchingClients && (!filteredClients || filteredClients.length === 0)" class="mt-3 text-sm text-gray-500 flex items-center">
                           <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-gray-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                          Buscando clientes...
                        </div>
                        
                        <!-- Lista de clientes (simulada) -->
                        <div v-if="!searchingClients && clientSearch.length >= 3 && filteredClients.length > 0" class="mt-2">
                          <p class="text-sm text-gray-600 mb-1">Resultados de la búsqueda:</p>
                          <div class="border border-gray-300 rounded-md divide-y divide-gray-300 max-h-60 overflow-y-auto shadow-sm">
                            <div
                              v-for="client in filteredClients"
                              :key="client.id"
                              class="p-3 hover:bg-gray-50 cursor-pointer transition-colors duration-150 ease-in-out"
                              @click="selectClient(client)"
                            >
                              <div class="flex justify-between items-center">
                                <div>
                                  <p class="text-sm font-medium text-blue-600">{{ client.name }}</p>
                                  <p class="text-xs text-gray-500">CI: {{ client.ci }}</p>
                                </div>
                                <p class="text-xs text-gray-500 hidden sm:block">Tel: {{ client.phone }}</p>
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                                  <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
                                </svg>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <!-- Mensaje de no resultados -->
                        <div v-if="!searchingClients && clientSearch.length >= 3 && filteredClients.length === 0" class="mt-3 text-sm text-gray-500">
                          No se encontraron clientes que coincidan con "{{ clientSearch }}". Puede <button type="button" @click="clientType = 'new'; clientSearch = ''" class="text-blue-600 hover:underline">crear un nuevo cliente</button>.
                        </div>

                        <!-- Cliente seleccionado -->
                        <div v-if="selectedClient" class="mt-4 p-3 border border-green-300 bg-green-50 rounded-md">
                          <div class="flex justify-between items-center">
                            <div>
                              <p class="text-sm font-medium text-gray-900">{{ selectedClient.name }}</p>
                              <p class="text-sm text-gray-500">CI: {{ selectedClient.ci }} | Tel: {{ selectedClient.phone }}</p>
                            </div>
                            <button
                              type="button"
                              @click="selectedClient = null"
                              class="text-sm text-red-600 hover:text-red-800"
                            >
                              Cambiar
                            </button>
                          </div>
                        </div>
                      </div>

                      <!-- Nuevo cliente -->
                      <div v-if="clientType === 'new'" class="sm:col-span-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                        <div class="sm:col-span-3">
                          <label for="client-name" class="block text-sm font-medium text-gray-700">Nombre completo</label>
                          <div class="mt-1">
                            <input
                              type="text"
                              id="client-name"
                              v-model="newClient.name"
                              class="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                              required
                            />
                          </div>
                        </div>

                        <div class="sm:col-span-3">
                          <label for="client-ci" class="block text-sm font-medium text-gray-700">CI</label>
                          <div class="mt-1">
                            <input
                              type="text"
                              id="client-ci"
                              v-model="newClient.ci"
                              class="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                              required
                            />
                          </div>
                        </div>

                        <div class="sm:col-span-3">
                          <label for="client-phone" class="block text-sm font-medium text-gray-700">Teléfono</label>
                          <div class="mt-1">
                            <input
                              type="tel"
                              id="client-phone"
                              v-model="newClient.phone"
                              class="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                              required
                            />
                          </div>
                        </div>

                        <div class="sm:col-span-3">
                          <label for="client-email" class="block text-sm font-medium text-gray-700">Email (opcional)</label>
                          <div class="mt-1">
                            <input
                              type="email"
                              id="client-email"
                              v-model="newClient.email"
                              class="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                            />
                          </div>
                        </div>

                        <div class="sm:col-span-6">
                          <label for="client-address" class="block text-sm font-medium text-gray-700">Dirección</label>
                          <div class="mt-1">
                            <input
                              type="text"
                              id="client-address"
                              v-model="newClient.address"
                              class="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                              required
                            />
                          </div>
                        </div>

                        <div class="sm:col-span-3">
                          <label for="client-city" class="block text-sm font-medium text-gray-700">Ciudad</label>
                          <div class="mt-1">
                            <input
                              type="text"
                              id="client-city"
                              v-model="newClient.city"
                              class="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                              required
                            />
                          </div>
                        </div>

                        <div class="sm:col-span-3">
                          <label for="client-state" class="block text-sm font-medium text-gray-700">Departamento/Estado</label>
                          <div class="mt-1">
                            <input
                              type="text"
                              id="client-state"
                              v-model="newClient.state"
                              class="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                              required
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- Información de pago -->
                  <div class="mb-6">
                    <h4 class="text-base font-medium text-gray-900 mb-4">Información de Pago</h4>

                    <div class="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                      <div class="sm:col-span-3">
                        <label for="payment-method" class="block text-sm font-medium text-gray-700">Método de pago</label>
                        <div class="mt-1">
                          <select
                            id="payment-method"
                            v-model="paymentMethod"
                            class="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                            required
                          >
                            <option value="cash">Efectivo</option>
                            <option value="card">Tarjeta</option>
                            <option value="transfer">Transferencia</option>
                          </select>
                        </div>
                      </div>

                      <div class="sm:col-span-3">
                        <label for="payment-amount" class="block text-sm font-medium text-gray-700">Monto total (Bs.)</label>
                        <div class="mt-1">
                          <input
                            type="number"
                            id="payment-amount"
                            v-model="totalAmount"
                            class="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                            readonly
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div class="flex justify-end space-x-3">
                    <button
                      type="button"
                      @click="router.back()"
                      class="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      class="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      :disabled="submitting || !isFormValid"
                    >
                      {{ submitting ? 'Procesando...' : 'Completar Venta' }}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>

          <!-- Resumen de la venta -->
          <div>
            <div class="bg-white shadow overflow-hidden sm:rounded-lg sticky top-6">
              <div class="px-4 py-5 sm:px-6 border-b border-gray-200">
                <h3 class="text-lg leading-6 font-medium text-gray-900">Resumen de Venta</h3>
              </div>
              <div class="px-4 py-5 sm:p-6">
                <dl class="space-y-4">
                  <div>
                    <dt class="text-sm font-medium text-gray-500">Viaje</dt>
                    <dd class="mt-1 text-sm text-gray-900">{{ trip.route.origin }} → {{ trip.route.destination }}</dd>
                  </div>
                  <div>
                    <dt class="text-sm font-medium text-gray-500">Fecha y hora</dt>
                    <dd class="mt-1 text-sm text-gray-900">{{ formatDate(trip.departure_date) }} - {{ trip.departure_time }}</dd>
                  </div>
                  <div>
                    <dt class="text-sm font-medium text-gray-500">Asientos</dt>
                    <dd class="mt-1 text-sm text-gray-900">
                      {{ selectedSeatNumbers.length > 0 ? selectedSeatNumbers.join(', ') : 'Ninguno seleccionado' }}
                    </dd>
                  </div>
                  <div>
                    <dt class="text-sm font-medium text-gray-500">Cliente</dt>
                    <dd class="mt-1 text-sm text-gray-900">
                      <span v-if="selectedClient">{{ selectedClient.name }}</span>
                      <span v-else-if="clientType === 'new' && newClient.name">{{ newClient.name }}</span>
                      <span v-else class="text-gray-500">No seleccionado</span>
                    </dd>
                  </div>
                  <div class="pt-4 border-t border-gray-200">
                    <dt class="text-base font-medium text-gray-900">Total</dt>
                    <dd class="mt-1 text-2xl font-semibold text-gray-900">Bs. {{ totalAmount }}</dd>
                  </div>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '~/stores/auth'
import { useTripStore } from '~/stores/tripStore'
import { useClientStore } from '~/stores/clientStore'
import { useTicketStore } from '~/stores/ticketStore'
import BusSeatMapPrint from '~/components/BusSeatMapPrint.vue'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const tripStore = useTripStore()
const clientStore = useClientStore()
const ticketStore = useTicketStore()

// Estado
const loading = ref(true)
const error = ref(null)
const submitting = ref(false)
const searchingClients = ref(false)

const selectedSeats = ref([])
const occupiedSeats = ref([])
const reservedSeatNumbers = ref([])
const clientType = ref('existing')
const clientSearch = ref('')
const selectedClient = ref(null)
const newClient = ref({
  name: '',
  ci: '',
  phone: '',
  email: '',
  address: '',
  city: '',
  state: ''
})
const paymentMethod = ref('cash')
const ticketPrice = ref(0)

// Reactive trip data from store
const trip = computed(() => tripStore.currentTrip)

// Obtener números de asientos seleccionados
const selectedSeatNumbers = computed(() => {
  return selectedSeats.value.map(seat => seat.number)
})

// Clientes filtrados según la búsqueda
const filteredClients = computed(() => clientStore.searchResults || [])

// Función para buscar clientes usando el store
const searchClientsByTerm = async () => {
  if (!clientSearch.value || clientSearch.value.length < 3) {
    clientStore.clearSearchResults()
    return
  }

  searchingClients.value = true
  clientStore.clearError()
  error.value = null

  try {
    await clientStore.searchClients(clientSearch.value)
  } catch (e) {
    console.error('Error al buscar clientes:', e)
    error.value = clientStore.error || 'Error al buscar clientes.'
    clientStore.clearSearchResults()
  } finally {
    searchingClients.value = false
  }
}

// Observar cambios en la búsqueda de clientes
watch(clientSearch, async (newValue, oldValue) => {
  if (newValue && newValue.length >= 3) {
    if (newValue !== oldValue) {
        await searchClientsByTerm()
    }
  } else if (!newValue && clientStore.searchResults && clientStore.searchResults.length > 0) {
    clientStore.clearSearchResults()
  }
}, { deep: true })

// Monto total
const totalAmount = computed(() => {
  return selectedSeats.value.length * (trip.value?.price || ticketPrice.value || 0)
})

// Validación del formulario
const isFormValid = computed(() => {
  if (selectedSeats.value.length === 0) return false

  if (clientType.value === 'existing') {
    return !!selectedClient.value
  } else {
    return newClient.value.name && 
           newClient.value.ci && 
           newClient.value.phone && 
           newClient.value.address && 
           newClient.value.city && 
           newClient.value.state
  }
})

onMounted(async () => {
  if (!authStore.isAuthenticated) {
    router.push('/login')
    return
  }

  // Restricción de rol: Solo secretarios pueden vender boletos
  if (authStore.userRole !== 'secretary') {
    error.value = 'Acceso denegado: Solo los secretarios pueden realizar ventas de boletos.'
    loading.value = false // Detener la carga ya que no se puede continuar
    // Opcionalmente, deshabilitar todo el formulario o redirigir a otra página
    // Por ejemplo: router.push('/unauthorized') o simplemente mostrar el error.
    return;
  }

  const tripId = route.query.trip
  const seatsQueryParam = route.query.seats

  if (!tripId) {
    error.value = 'No se ha especificado un viaje'
    loading.value = false
    return
  }

  await fetchTripDetails(tripId)

  if (seatsQueryParam && trip.value && trip.value.seats) {
    const seatNumbersFromQuery = seatsQueryParam.split(',').map(s => parseInt(s))
    selectedSeats.value = trip.value.seats
      .filter(seat => seatNumbersFromQuery.includes(seat.number))
      .map(seat => ({ ...seat, status: 'selected' }));
  }
})

// Cargar detalles del viaje
const fetchTripDetails = async (tripId) => {
  loading.value = true
  error.value = null

  try {
    await tripStore.fetchTripById(tripId)

    if (tripStore.currentTrip) {
      occupiedSeats.value = tripStore.currentTrip.occupied_seats || []
      
      // Cargar los tickets vendidos para el viaje
      await fetchTicketsForTrip(tripId)
    } else {
      throw new Error("Viaje no encontrado o no se pudo cargar.")
    }

  } catch (err) {
    console.error('Error al cargar los detalles del viaje:', err)
    error.value = tripStore.error || 'No se pudieron cargar los detalles del viaje. Intente nuevamente.'
  } finally {
    loading.value = false
  }
}

// Función para cargar los tickets vendidos del viaje
const fetchTicketsForTrip = async (tripId) => {
  try {
    const config = useRuntimeConfig()
    const apiUrl = `${config.public.apiBaseUrl}/tickets/trip/${tripId}`
    
    const response = await $fetch(apiUrl, {
      method: 'GET'
    })
    
    if (response && Array.isArray(response)) {
      // Filtrar tickets en estado "pending" y extraer los números de asiento
      const pendingTickets = response.filter(ticket => ticket.state === 'pending')
      reservedSeatNumbers.value = pendingTickets
        .filter(ticket => ticket.seat) // Asegurarse de que el ticket tiene asiento
        .map(ticket => ticket.seat.seat_number)
      
      console.log('Asientos reservados cargados:', reservedSeatNumbers.value)
    }
  } catch (err) {
    console.error('Error al cargar los tickets del viaje:', err)
    // No interrumpir el flujo por este error, simplemente loguear
  }
}

// Seleccionar cliente
const selectClient = (client) => {
  selectedClient.value = client
  clientSearch.value = ''
}

// Manejar selección de asiento
const handleSeatSelected = (seat) => {
  // Verificar si el asiento ya está seleccionado
  if (!selectedSeats.value.find(s => s.id === seat.id)) {
    selectedSeats.value.push(seat)
  }
}

// Manejar deseleción de asiento
const handleSeatDeselected = (seat) => {
  // Eliminar el asiento de la selección
  const index = selectedSeats.value.findIndex(s => s.id === seat.id)
  if (index !== -1) {
    selectedSeats.value.splice(index, 1)
  }
}

// Manejar envío del formulario
const handleSubmit = async () => {
  submitting.value = true
  error.value = null
  ticketStore.clearError() // Clear previous ticket errors
  clientStore.clearError() // Clear previous client errors

  let finalClientId = null
  const successfulTickets = []
  const failedTicketSeats = []

  try {
    // 1. Determine Client ID
    if (clientType.value === 'new') {
      const clientData = {
        firstname: newClient.value.name.split(' ')[0] || '',
        lastname: newClient.value.name.split(' ').slice(1).join(' ') || '',
        document_id: newClient.value.ci,
        phone: newClient.value.phone,
        email: newClient.value.email,
        address: newClient.value.address,
        city: newClient.value.city,
        state: newClient.value.state,
        is_minor: false, // Assuming default, adjust if form has this
      }
      console.log('[handleSubmit] Creating new client with data:', JSON.stringify(clientData, null, 2));
      const newlyCreatedClient = await clientStore.createClient(clientData)
      if (clientStore.error) { // Check for error after client creation attempt
        throw new Error(clientStore.error || 'Error al crear el cliente.')
      }
      finalClientId = newlyCreatedClient?.id
      console.log('[handleSubmit] Newly created client ID:', finalClientId);
    } else if (selectedClient.value) {
      finalClientId = selectedClient.value.id
      console.log('[handleSubmit] Using existing client ID:', finalClientId);
    } else {
      throw new Error('Por favor, seleccione un cliente existente o ingrese los datos de un nuevo cliente.')
    }

    if (!finalClientId) {
      throw new Error('No se pudo obtener el ID del cliente.')
    }

    if (!authStore.user || !authStore.user.id) {
      throw new Error('No se pudo obtener el ID del operador. Por favor, inicie sesión nuevamente.');
    }
    console.log('[handleSubmit] Operator User ID:', authStore.user.id);

    if (!trip.value || !trip.value.price || trip.value.price <= 0) {
        throw new Error('El precio del viaje no es válido o no está configurado.');
    }
    console.log('[handleSubmit] Trip price for tickets:', trip.value.price);

    // 2. Create Tickets for each selected seat
    for (const seat of selectedSeats.value) {
      const ticketData = {
        trip_id: trip.value.id,
        seat_id: seat.id, // Ensure seat.id is the PK from backend
        client_id: finalClientId,
        state: 'confirmed', // Or make this selectable if needed
        price: trip.value.price, // Price per ticket from the trip
        payment_method: paymentMethod.value,
        operator_user_id: authStore.user.id, // User ID of the secretary/admin creating the ticket
      }
      console.log(`[handleSubmit] Attempting to create ticket for seat ${seat.number} (ID: ${seat.id}) with data:`, JSON.stringify(ticketData, null, 2));
      try {
        const newTicket = await ticketStore.createNewTicket(ticketData)
        successfulTickets.push(newTicket)
        console.log(`[handleSubmit] Successfully created ticket for seat ${seat.number} (ID: ${seat.id}):`, newTicket);
      } catch (ticketErr) {
        console.error(`[handleSubmit] Failed to create ticket for seat ${seat.number} (ID: ${seat.id}):`, ticketErr);
        failedTicketSeats.push(seat)
        // error.value = ticketStore.error || `Error al crear boleto para asiento ${seat.number}`;
        // Do not throw here, try to process other tickets
      }
    }

    if (failedTicketSeats.length > 0) {
      const failedSeatNumbers = failedTicketSeats.map(s => s.number).join(', ');
      // Accumulate errors or show a summary
      error.value = `No se pudieron crear boletos para los asientos: ${failedSeatNumbers}. ${ticketStore.error || clientStore.error || 'Consulte la consola para más detalles.'}`;
      // Decide on navigation or partial success message here
    } else if (successfulTickets.length > 0) {
      // alert('Venta completada exitosamente!')
      const ticketIds = successfulTickets.map(t => t.id).join(',');
      const currentTripId = trip.value?.id;
      if (currentTripId) {
        router.push(`/tickets/confirmation?tripId=${currentTripId}&ids=${ticketIds}`);
      } else {
        // Fallback or error if tripId is somehow not available, though it should be
        console.error("[handleSubmit] Trip ID not available for confirmation page redirect.");
        error.value = "No se pudo redirigir a la página de confirmación (faltan datos del viaje).";
        // Optionally, redirect to a generic success or error page, or back to trip list
        router.push(`/trips`); 
      }
    } else {
      // This case means no seats were selected or something else went wrong before ticket creation loop
      if (!error.value) { // If no specific error was set before
          error.value = 'No se procesaron boletos. Verifique los datos.';
      }
    }

  } catch (e) {
    console.error('[handleSubmit] Global error:', e);
    error.value = e.message || 'Ocurrió un error al procesar la venta.'
    // Ensure specific store errors are prioritized if available
    if (clientStore.error) error.value = clientStore.error;
    if (ticketStore.error && !clientStore.error) error.value = ticketStore.error; // Only if no client error
  } finally {
    submitting.value = false
  }
}

// Formatear fecha
const formatDate = (dateString) => {
  // Asegurar que dateString es un string no vacío antes de intentar parsear
  if (!dateString || typeof dateString !== 'string' || dateString.trim() === '') {
    // console.warn('formatDate: Fecha no proporcionada, no es string, o es string vacío. Valor:', dateString);
    return 'Fecha no disponible';
  }

  let date;
  try {
    // Intentar crear un objeto Date. Aquí puede ocurrir RangeError para strings inválidos.
    date = new Date(dateString);
  } catch (e) {
    // console.error('formatDate: Error al crear objeto Date. Input:', dateString, 'Error:', e);
    return 'Formato de fecha erróneo';
  }

  // Verificar si el objeto Date creado es válido
  if (isNaN(date.getTime())) {
    // console.warn('formatDate: El objeto Date es inválido (NaN). Input string:', dateString);
    return 'Fecha inválida';
  }

  // Si la fecha es válida, intentar formatearla
  try {
    return new Intl.DateTimeFormat('es-ES', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      timeZone: 'America/La_Paz' // Asegurar zona horaria correcta para Bolivia
    }).format(date);
  } catch (e) {
    // console.error('formatDate: Error al formatear con Intl.DateTimeFormat. Objeto Date:', date, 'Error:', e);
    return 'Error de formateo';
  }
};

// Definir la metadata de la página
// definePageMeta({
//   middleware: ['auth'] // Aplicar middleware de autenticación - REMOVED as auth.global.ts handles this
// })
</script>
