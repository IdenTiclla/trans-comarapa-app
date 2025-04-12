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
                  
                  <!-- Asientos seleccionados -->
                  <div class="mb-6">
                    <label class="block text-sm font-medium text-gray-700 mb-1">Asientos seleccionados</label>
                    <div class="flex flex-wrap gap-2">
                      <span 
                        v-for="seatNumber in selectedSeatNumbers" 
                        :key="seatNumber"
                        class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                      >
                        Asiento {{ seatNumber }}
                      </span>
                    </div>
                    <p v-if="selectedSeatNumbers.length === 0" class="text-sm text-red-500 mt-1">
                      No hay asientos seleccionados. Por favor, vuelva a la página del viaje y seleccione asientos.
                    </p>
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
                            class="flex-1 focus:ring-blue-500 focus:border-blue-500 block w-full min-w-0 rounded-md sm:text-sm border-gray-300"
                            placeholder="Nombre, CI o teléfono"
                          />
                          <button 
                            type="button"
                            class="ml-3 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                          >
                            Buscar
                          </button>
                        </div>
                        
                        <!-- Lista de clientes (simulada) -->
                        <div v-if="clientSearch.length > 0" class="mt-2">
                          <div class="border border-gray-300 rounded-md divide-y divide-gray-300 max-h-60 overflow-y-auto">
                            <div 
                              v-for="client in filteredClients" 
                              :key="client.id"
                              class="p-3 hover:bg-gray-50 cursor-pointer"
                              @click="selectClient(client)"
                            >
                              <div class="flex justify-between">
                                <div>
                                  <p class="text-sm font-medium text-gray-900">{{ client.name }}</p>
                                  <p class="text-sm text-gray-500">CI: {{ client.ci }}</p>
                                </div>
                                <p class="text-sm text-gray-500">{{ client.phone }}</p>
                              </div>
                            </div>
                          </div>
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

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

// Estado
const loading = ref(true)
const error = ref(null)
const submitting = ref(false)
const trip = ref(null)
const selectedSeatNumbers = ref([])
const clientType = ref('existing')
const clientSearch = ref('')
const selectedClient = ref(null)
const newClient = ref({
  name: '',
  ci: '',
  phone: '',
  email: ''
})
const paymentMethod = ref('cash')
const ticketPrice = ref(150) // Precio por boleto (en un entorno real, vendría del backend)

// Clientes de ejemplo (en un entorno real, vendrían del backend)
const clients = [
  { id: 1, name: 'Juan Pérez', ci: '12345678', phone: '71234567', email: 'juan@example.com' },
  { id: 2, name: 'María López', ci: '87654321', phone: '76543210', email: 'maria@example.com' },
  { id: 3, name: 'Carlos Rodríguez', ci: '45678912', phone: '73456789', email: 'carlos@example.com' },
  { id: 4, name: 'Ana Martínez', ci: '98765432', phone: '78765432', email: 'ana@example.com' }
]

// Clientes filtrados según la búsqueda
const filteredClients = computed(() => {
  if (!clientSearch.value) return []
  
  const search = clientSearch.value.toLowerCase()
  return clients.filter(client => 
    client.name.toLowerCase().includes(search) || 
    client.ci.includes(search) || 
    client.phone.includes(search)
  )
})

// Monto total
const totalAmount = computed(() => {
  return selectedSeatNumbers.value.length * ticketPrice.value
})

// Validación del formulario
const isFormValid = computed(() => {
  if (selectedSeatNumbers.value.length === 0) return false
  
  if (clientType.value === 'existing') {
    return !!selectedClient.value
  } else {
    return newClient.value.name && newClient.value.ci && newClient.value.phone
  }
})

// Comprobar autenticación al montar el componente
onMounted(() => {
  // Si el usuario no está autenticado, redirigir a login
  if (!authStore.isAuthenticated) {
    router.push('/login')
    return
  }
  
  // Obtener parámetros de la URL
  const tripId = route.query.trip
  const seats = route.query.seats
  
  if (!tripId) {
    error.value = 'No se ha especificado un viaje'
    loading.value = false
    return
  }
  
  if (seats) {
    selectedSeatNumbers.value = seats.split(',')
  }
  
  // Cargar detalles del viaje
  fetchTripDetails(tripId)
})

// Cargar detalles del viaje
const fetchTripDetails = async (tripId) => {
  loading.value = true
  error.value = null
  
  try {
    // En un entorno real, aquí se haría una llamada a la API
    // const response = await fetch(`/api/trips/${tripId}`)
    
    // Simulación de datos para desarrollo
    await new Promise(resolve => setTimeout(resolve, 800))
    
    // Datos de ejemplo
    trip.value = {
      id: parseInt(tripId),
      route: {
        origin: 'Santa Cruz',
        destination: 'Comarapa'
      },
      departure_date: '2023-04-15',
      departure_time: '08:30',
      status: 'scheduled',
      total_seats: 40,
      available_seats: 25,
      price: 150,
      bus: {
        id: 1,
        plate: 'ABC-123',
        model: 'Mercedes Benz O-500',
        type: 'single-deck'
      }
    }
    
    // Actualizar precio del boleto
    ticketPrice.value = trip.value.price
    
  } catch (err) {
    console.error('Error al cargar los detalles del viaje:', err)
    error.value = 'No se pudieron cargar los detalles del viaje. Intente nuevamente.'
  } finally {
    loading.value = false
  }
}

// Seleccionar cliente
const selectClient = (client) => {
  selectedClient.value = client
  clientSearch.value = ''
}

// Manejar envío del formulario
const handleSubmit = async () => {
  if (!isFormValid.value) return
  
  submitting.value = true
  
  try {
    // En un entorno real, aquí se haría una llamada a la API
    // const response = await fetch('/api/tickets', {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/json'
    //   },
    //   body: JSON.stringify({
    //     trip_id: trip.value.id,
    //     seats: selectedSeatNumbers.value,
    //     client: clientType.value === 'existing' ? selectedClient.value.id : newClient.value,
    //     payment_method: paymentMethod.value,
    //     amount: totalAmount.value
    //   })
    // })
    
    // Simulación para desarrollo
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Redirigir a la página de confirmación
    router.push('/tickets/confirmation')
    
  } catch (err) {
    console.error('Error al procesar la venta:', err)
    error.value = 'No se pudo procesar la venta. Intente nuevamente.'
  } finally {
    submitting.value = false
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

// Definir la metadata de la página
definePageMeta({
  middleware: ['auth'] // Aplicar middleware de autenticación
})
</script>
