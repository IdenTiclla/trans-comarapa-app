<template>
  <div v-if="show" class="fixed inset-0 z-50 overflow-hidden">
    <!-- Overlay -->
    <div class="absolute inset-0 bg-black bg-opacity-50 transition-opacity" @click="$emit('close')"></div>
    
    <!-- Modal -->
    <div class="relative flex items-center justify-center min-h-screen p-4">
      <div class="relative bg-white rounded-2xl shadow-2xl w-full max-w-7xl max-h-[90vh] overflow-hidden">
        <!-- Header del Modal -->
        <div class="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 flex items-center justify-between border-b">
          <div class="flex items-center space-x-3">
            <div class="bg-white p-2 rounded-lg">
              <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"></path>
              </svg>
            </div>
            <div>
              <h3 class="text-xl font-bold text-white">
                {{ actionType === 'sell' ? 'Vender Boleto' : 'Reservar Asiento' }}
              </h3>
              <p class="text-blue-100 text-sm">
                Asientos {{ selectedSeats.map(seat => seat.number).join(', ') }} - {{ trip?.route?.origin }} → {{ trip?.route?.destination }}
              </p>
            </div>
          </div>
          <button
            @click="$emit('close')"
            class="text-white hover:bg-white hover:bg-opacity-20 rounded-lg p-2 transition-colors"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>

        <!-- Contenido principal -->
        <div class="flex h-[calc(90vh-80px)]">
          <!-- Panel izquierdo - Formulario -->
          <div class="w-1/2 p-8 overflow-y-auto bg-gray-50">
            <form @submit.prevent="handleSubmit" class="space-y-6">
              <!-- Selección de tipo de cliente -->
              <div class="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <h4 class="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <svg class="w-5 h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                  </svg>
                  Información del Cliente
                </h4>
                
                <div class="grid grid-cols-2 gap-4 mb-4">
                  <label class="flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all hover:bg-gray-50"
                         :class="clientType === 'existing' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'">
                    <input
                      type="radio"
                      v-model="clientType"
                      value="existing"
                      class="sr-only"
                    >
                    <div class="flex items-center space-x-3">
                      <div class="flex-shrink-0">
                        <div class="w-4 h-4 rounded-full border-2 flex items-center justify-center"
                             :class="clientType === 'existing' ? 'border-blue-500 bg-blue-500' : 'border-gray-300'">
                          <div v-if="clientType === 'existing'" class="w-2 h-2 rounded-full bg-white"></div>
                        </div>
                      </div>
                      <div>
                        <div class="font-medium text-gray-900">Cliente Existente</div>
                        <div class="text-sm text-gray-500">Buscar en base de datos</div>
                      </div>
                    </div>
                  </label>

                  <label class="flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all hover:bg-gray-50"
                         :class="clientType === 'new' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'">
                    <input
                      type="radio"
                      v-model="clientType"
                      value="new"
                      class="sr-only"
                    >
                    <div class="flex items-center space-x-3">
                      <div class="flex-shrink-0">
                        <div class="w-4 h-4 rounded-full border-2 flex items-center justify-center"
                             :class="clientType === 'new' ? 'border-blue-500 bg-blue-500' : 'border-gray-300'">
                          <div v-if="clientType === 'new'" class="w-2 h-2 rounded-full bg-white"></div>
                        </div>
                      </div>
                      <div>
                        <div class="font-medium text-gray-900">Cliente Nuevo</div>
                        <div class="text-sm text-gray-500">Crear nuevo registro</div>
                      </div>
                    </div>
                  </label>
                </div>

                <!-- Búsqueda de cliente existente -->
                <div v-if="clientType === 'existing'" class="space-y-4">
                  <div class="relative">
                    <label class="block text-sm font-medium text-gray-700 mb-2">Buscar Cliente</label>
                    <div class="relative">
                      <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                        </svg>
                      </div>
                      <input
                        v-model="clientSearchQuery"
                        @input="debouncedSearch"
                        type="text"
                        placeholder="Buscar por nombre, apellido o CI..."
                        class="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      >
                    </div>
                  </div>

                  <!-- Resultados de búsqueda -->
                  <div v-if="searchingClients" class="flex items-center justify-center py-8">
                    <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>

                  <div v-else-if="hasSearched && foundClients.length > 0 && !hasSelectedExistingClient" class="space-y-2">
                    <p class="text-sm font-medium text-gray-700">Resultados encontrados:</p>
                    <div class="space-y-2 max-h-40 overflow-y-auto">
                      <div
                        v-for="client in foundClients"
                        :key="client.id"
                        @click="selectClient(client)"
                        class="p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-blue-50 hover:border-blue-300 transition-all"
                      >
                        <div class="font-medium text-gray-900">{{ client.firstname }} {{ client.lastname }}</div>
                        <div class="text-sm text-gray-500">CI: {{ client.document_id }}</div>
                      </div>
                    </div>
                  </div>

                  <div v-else-if="hasSearched && foundClients.length === 0 && !hasSelectedExistingClient" class="text-center py-8">
                    <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                    </svg>
                    <p class="mt-2 text-sm text-gray-500">No se encontraron clientes</p>
                  </div>

                  <!-- Cliente seleccionado -->
                  <div v-if="hasSelectedExistingClient" class="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div class="flex items-center justify-between">
                      <div>
                        <h5 class="font-medium text-green-800">Cliente seleccionado</h5>
                        <p class="text-green-700">{{ selectedExistingClient.firstname }} {{ selectedExistingClient.lastname }}</p>
                        <p class="text-sm text-green-600">CI: {{ selectedExistingClient.document_id }}</p>
                      </div>
                      <button
                        @click="clearSelectedClient"
                        type="button"
                        class="text-green-600 hover:text-green-800 transition-colors"
                      >
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>

                <!-- Formulario para cliente nuevo -->
                <div v-if="clientType === 'new'" class="grid grid-cols-2 gap-4">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Nombres *</label>
                    <input
                      v-model="newClientForm.firstname"
                      type="text"
                      required
                      placeholder="Nombres"
                      class="block w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    >
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Apellidos *</label>
                    <input
                      v-model="newClientForm.lastname"
                      type="text"
                      required
                      placeholder="Apellidos"
                      class="block w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    >
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">CI/Documento *</label>
                    <input
                      v-model="newClientForm.document_id"
                      type="text"
                      required
                      placeholder="Carnet de identidad"
                      class="block w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    >
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Teléfono</label>
                    <input
                      v-model="newClientForm.phone"
                      type="text"
                      placeholder="Número de teléfono"
                      class="block w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    >
                  </div>
                </div>
              </div>

              <!-- Información del boleto -->
              <div class="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <h4 class="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <svg class="w-5 h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"></path>
                  </svg>
                  Información del Boleto
                </h4>
                
                <!-- Destino -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Destino *</label>
                  <input
                    v-model="ticketForm.destination"
                    type="text"
                    required
                    placeholder="Ej: Los Negros, Samaipata, Cochabamba..."
                    class="block w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  >
                </div>
                
                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Precio (Bs.) *</label>
                    <div class="relative">
                      <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span class="text-gray-500 text-sm">Bs.</span>
                      </div>
                      <input
                        v-model.number="ticketForm.price"
                        type="number"
                        step="0.01"
                        required
                        placeholder="0.00"
                        class="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      >
                    </div>
                  </div>
                  
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Método de Pago *</label>
                    <select 
                      v-model="ticketForm.payment_method" 
                      required
                      class="block w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      :class="{ 'border-red-500 ring-red-500': !ticketForm.payment_method && hasTriedSubmit }"
                    >
                      <option value="">Seleccionar método</option>
                      <option value="cash">💵 Efectivo</option>
                      <option value="card">💳 Tarjeta</option>
                      <option value="transfer">🏦 Transferencia</option>
                      <option value="qr">📱 QR</option>
                    </select>
                    <p v-if="!ticketForm.payment_method && hasTriedSubmit" class="mt-2 text-sm text-red-600 flex items-center">
                      <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                      </svg>
                      El método de pago es requerido
                    </p>
                  </div>
                </div>
              </div>

              <!-- Mensaje de error -->
              <div v-if="errorMessage" class="bg-red-50 border border-red-200 rounded-lg p-4">
                <div class="flex">
                  <div class="flex-shrink-0">
                    <svg class="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                  </div>
                  <div class="ml-3">
                    <p class="text-sm font-medium text-red-800">{{ errorMessage }}</p>
                  </div>
                </div>
              </div>

              <!-- Botones de acción -->
              <div class="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  @click="$emit('close')"
                  class="px-6 py-3 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-all"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  :disabled="isSubmitting || !canSubmit"
                  class="px-6 py-3 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center"
                >
                  <svg v-if="isSubmitting" class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span v-if="isSubmitting">Procesando...</span>
                  <span v-else>{{ actionType === 'sell' ? '🎫 Vender Boleto' : '📝 Reservar Asiento' }}</span>
                </button>
              </div>
            </form>
          </div>

          <!-- Panel derecho - Previsualización del boleto -->
          <div class="w-1/2 p-8 bg-white border-l border-gray-200">
            <div class="sticky top-0">
              <h4 class="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                <svg class="w-5 h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                </svg>
                Previsualización del Boleto
              </h4>
              
              <!-- Componente de vista previa del boleto -->
              <div class="bg-gray-50 rounded-xl p-4 border border-gray-200 flex justify-center">
                <div class="w-full max-w-lg">
                  <TicketDisplay 
                    v-if="previewTicket"
                    :ticket="previewTicket" 
                    :trip="trip"
                    :preview-mode="true"
                  />
                  <div v-else class="text-center py-12">
                    <svg class="mx-auto h-16 w-16 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                    </svg>
                    <p class="mt-4 text-gray-500 font-medium">La previsualización aparecerá aquí</p>
                    <p class="text-sm text-gray-400">Complete la información del cliente para ver el boleto</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useClientSearch } from '@/composables/useClientSearch'
import { useAuthStore } from '@/stores/auth'
import TicketDisplay from '@/components/TicketDisplay.vue'

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  },
  trip: {
    type: Object,
    required: true
  },
  selectedSeats: {
    type: Array,
    required: true,
    default: () => []
  },
  actionType: {
    type: String,
    required: true,
    validator: value => ['sell', 'reserve'].includes(value)
  }
})

const emit = defineEmits(['close', 'ticket-created'])

// Usar el composable de búsqueda de clientes
const {
  clientType,
  clientSearchQuery,
  foundClients,
  searchingClients,
  hasSearched,
  selectedExistingClient,
  hasSelectedExistingClient,
  searchClients,
  selectExistingClient,
  clearExistingClientSelection,
  resetClientSearch,
  createClient,
  getOrCreateClient
} = useClientSearch()


// Formulario para cliente nuevo
const newClientForm = ref({
  firstname: '',
  lastname: '',
  document_id: '',
  phone: '',
  email: '',
  address: '',
  city: '',
  state: '',
  is_minor: false
})

// Estado del formulario del boleto
const ticketForm = ref({
  price: 0,
  payment_method: '',
  state: 'pending',
  destination: ''
})

const isSubmitting = ref(false)
const hasTriedSubmit = ref(false)
const errorMessage = ref('')

// Computed para verificar si se puede enviar el formulario
const canSubmit = computed(() => {
  const hasClient = clientType.value === 'existing' ? hasSelectedExistingClient.value : 
    (newClientForm.value.firstname && newClientForm.value.lastname && newClientForm.value.document_id)
  
  const hasDestination = ticketForm.value.destination && ticketForm.value.destination.trim()
  
  return hasClient && hasDestination && ticketForm.value.price > 0 && ticketForm.value.payment_method
})

// Computed para la previsualización del boleto
const previewTicket = computed(() => {
  if (props.selectedSeats.length === 0) return null

  // Mostrar preview aunque no esté completo el formulario
  const hasBasicClient = clientType.value === 'existing' ? 
    hasSelectedExistingClient.value : 
    (newClientForm.value.firstname || newClientForm.value.lastname)

  const client = clientType.value === 'existing' ? selectedExistingClient.value : {
    firstname: newClientForm.value.firstname || 'Cliente',
    lastname: newClientForm.value.lastname || '',
    document_id: newClientForm.value.document_id || '',
    phone: newClientForm.value.phone || ''
  }

  // Obtener el nombre del destino del formulario
  const destinationName = ticketForm.value.destination || 
    props.trip?.route?.destination_location?.name || 
    props.trip?.route?.destination || 
    ''

  console.log('Preview destinationName:', destinationName) // Debug log

  return {
    id: 'PREVIEW',
    client,
    destination: destinationName,
    seats: props.selectedSeats.map(seat => ({
      seat_number: seat.number,
      deck: seat.deck || 'Planta Baja'
    })),
    seat: props.selectedSeats.length === 1 ? {
      seat_number: props.selectedSeats[0].number,
      deck: props.selectedSeats[0].deck || 'Planta Baja'
    } : null,
    price: ticketForm.value.price * props.selectedSeats.length,
    payment_method: ticketForm.value.payment_method || 'cash',
    state: props.actionType === 'sell' ? 'confirmed' : 'pending',
    created_at: new Date().toISOString()
  }
})


// Establecer precio inicial basado en la ruta del viaje
watch(() => props.trip, (newTrip) => {
  if (newTrip?.route?.price) {
    ticketForm.value.price = newTrip.route.price
  }
}, { immediate: true })

// Actualizar estado del boleto basado en el tipo de acción
watch(() => props.actionType, (newActionType) => {
  ticketForm.value.state = newActionType === 'sell' ? 'confirmed' : 'pending'
}, { immediate: true })

// Función para buscar clientes con debounce
const debouncedSearch = () => {
  searchClients()
}

// Función para seleccionar cliente
const selectClient = (client) => {
  selectExistingClient(client)
}

// Función para limpiar cliente seleccionado
const clearSelectedClient = () => {
  clearExistingClientSelection()
}

// Función para seleccionar destino
const selectDestination = (destination) => {
  selectExistingDestination(destination)
}

// Función para limpiar destino seleccionado
const clearSelectedDestination = () => {
  clearExistingDestinationSelection()
}

// Manejar envío del formulario
const handleSubmit = async () => {
  hasTriedSubmit.value = true
  errorMessage.value = ''

  if (!canSubmit.value) {
    const hasDestination = destinationType.value === 'existing' ? hasSelectedExistingDestination.value : 
      (newDestinationForm.value.name && newDestinationForm.value.name.trim())
    
    if (!hasDestination) {
      errorMessage.value = 'Debe seleccionar o crear un destino'
    } else if (!ticketForm.value.payment_method) {
      errorMessage.value = 'Debe seleccionar un método de pago'
    }
    return
  }

  try {
    isSubmitting.value = true

    // Crear cliente si es nuevo
    let clientId = selectedExistingClient.value?.id
    if (clientType.value === 'new') {
      const newClient = await createClient(newClientForm.value)
      clientId = newClient.id
    }

    // Validar destino
    if (!ticketForm.value.destination || !ticketForm.value.destination.trim()) {
      throw new Error('Debe ingresar un destino')
    }

    // Buscar los asientos en el layout del viaje
    if (!props.trip?.seats_layout || props.trip.seats_layout.length === 0) {
      throw new Error('No se pudo encontrar información de asientos para este viaje')
    }
    
    const seats = props.trip.seats_layout.filter(s => 
      props.selectedSeats.some(selectedSeat => s.seat_number === selectedSeat.number)
    )
    
    if (seats.length === 0) {
      throw new Error(`No se pudo encontrar los asientos ${props.selectedSeats.map(seat => seat.number).join(', ')} en este viaje`)
    }

    // Crear un boleto por cada asiento
    const config = useRuntimeConfig()
    const authStore = useAuthStore()
    const createdTickets = []

    for (const seat of seats) {
      const ticketData = {
        trip_id: props.trip.id,
        client_id: clientId,
        seat_id: seat.id,
        destination: ticketForm.value.destination.trim(),
        price: ticketForm.value.price,
        payment_method: ticketForm.value.payment_method,
        state: ticketForm.value.state,
        operator_user_id: authStore.user?.id
      }

      const createdTicket = await $fetch(`${config.public.apiBaseUrl}/tickets`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authStore.token}`,
          'Content-Type': 'application/json'
        },
        body: ticketData
      })

      createdTickets.push(createdTicket)
    }

    console.log('Tickets created successfully:', createdTickets)

    // Emitir evento de éxito
    emit('ticket-created', createdTickets)
    emit('close')

  } catch (error) {
    console.error('Error al crear los boletos:', error)
    if (error.message?.includes('payment_method')) {
      errorMessage.value = 'El método de pago es requerido'
    } else if (error.message?.includes('CORS') || error.message?.includes('fetch')) {
      errorMessage.value = 'Error de conexión con el servidor. Verifique que todos los campos estén completos.'
    } else {
      errorMessage.value = error.message || 'Error al crear los boletos'
    }
  } finally {
    isSubmitting.value = false
  }
}


// Limpiar formulario cuando se cierre el modal
watch(() => props.show, (show) => {
  if (!show) {
    // Reset form
    ticketForm.value = {
      price: props.trip?.route?.price || 0,
      payment_method: '',
      state: props.actionType === 'sell' ? 'confirmed' : 'pending',
      destination: ''
    }
    newClientForm.value = {
      firstname: '',
      lastname: '',
      document_id: '',
      phone: '',
      email: '',
      address: '',
      city: '',
      state: '',
      is_minor: false
    }
    resetClientSearch()
    hasTriedSubmit.value = false
    errorMessage.value = ''
  }
})
</script> 