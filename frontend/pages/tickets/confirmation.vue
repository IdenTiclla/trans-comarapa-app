<template>
  <div>
    <div class="py-6">
      <div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div v-if="loading" class="flex justify-center py-12">
          <p class="text-gray-500">Cargando confirmación...</p>
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
        <div v-else-if="confirmedTrip && primaryTicket" class="bg-white shadow overflow-hidden sm:rounded-lg">
          <div class="px-4 py-5 sm:px-6 border-b border-gray-200 bg-green-50">
            <div class="flex items-center">
              <div class="flex-shrink-0 bg-green-100 rounded-full p-2">
                <svg class="h-8 w-8 text-green-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div class="ml-4">
                <h3 class="text-lg leading-6 font-medium text-gray-900">¡Venta completada con éxito!</h3>
                <p class="text-sm text-gray-500">Los boletos han sido emitidos correctamente.</p>
              </div>
            </div>
          </div>
          
          <div class="px-4 py-5 sm:p-6">
            <h4 class="text-base font-medium text-gray-900 mb-4">Detalles de la venta</h4>
            
            <dl class="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
              <div>
                <dt class="text-sm font-medium text-gray-500">Número de referencia</dt>
                <dd class="mt-1 text-sm text-gray-900">T-{{ primaryTicket.id || 'N/A' }}</dd>
              </div>
              <div>
                <dt class="text-sm font-medium text-gray-500">Fecha de emisión</dt>
                <dd class="mt-1 text-sm text-gray-900">{{ formatDate(primaryTicket.created_at || new Date()) }}</dd>
              </div>
              <div>
                <dt class="text-sm font-medium text-gray-500">Cliente</dt>
                <dd class="mt-1 text-sm text-gray-900">{{ confirmedClient ? confirmedClient.firstname + ' ' + confirmedClient.lastname : 'N/A' }}</dd>
              </div>
              <div>
                <dt class="text-sm font-medium text-gray-500">Método de pago</dt>
                <dd class="mt-1 text-sm text-gray-900">{{ primaryTicket.payment_method || 'N/A' }}</dd>
              </div>
              <div>
                <dt class="text-sm font-medium text-gray-500">Viaje</dt>
                <dd class="mt-1 text-sm text-gray-900">{{ confirmedTrip.route?.origin }} → {{ confirmedTrip.route?.destination }}</dd>
              </div>
              <div>
                <dt class="text-sm font-medium text-gray-500">Fecha y hora</dt>
                <dd class="mt-1 text-sm text-gray-900">{{ formatDate(confirmedTrip.departure_date) }} - {{ confirmedTrip.departure_time }}</dd>
              </div>
              <div>
                <dt class="text-sm font-medium text-gray-500">Asientos</dt>
                <dd class="mt-1 text-sm text-gray-900">{{ seatNumbersDisplay || 'N/A' }}</dd>
              </div>
              <div>
                <dt class="text-sm font-medium text-gray-500">Total</dt>
                <dd class="mt-1 text-sm font-semibold text-gray-900">Bs. {{ totalAmountDisplay || '0.00' }}</dd>
              </div>
            </dl>
            
            <div class="mt-8 border-t border-gray-200 pt-6">
              <div class="flex justify-between">
                <button 
                  @click="printTicket"
                  class="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <svg class="h-5 w-5 mr-2 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                  </svg>
                  Imprimir boleto
                </button>
                <button 
                  @click="router.push('/dashboard')"
                  class="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Volver al dashboard
                </button>
              </div>
            </div>
          </div>
        </div>
        
        <div class="mt-6 flex justify-center">
          <button 
            @click="router.push('/trips')"
            class="text-sm font-medium text-blue-600 hover:text-blue-800"
          >
            Volver a la lista de viajes
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '~/stores/auth'
import { useTripStore } from '~/stores/tripStore'
import { useTicketStore } from '~/stores/ticketStore'
import { useClientStore } from '~/stores/clientStore'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const tripStore = useTripStore()
const ticketStore = useTicketStore()
const clientStore = useClientStore()

const loading = ref(true)
const error = ref(null)
const confirmedTrip = ref(null)
const fetchedTickets = ref([]) // To store all fetched ticket objects
const confirmedClient = ref(null)

// Comprobar autenticación
if (!authStore.isAuthenticated) {
  router.push('/login')
}

onMounted(async () => {
  loading.value = true
  error.value = null
  try {
    const tripId = route.query.tripId
    const ticketIdsParam = route.query.ids

    if (!tripId || !ticketIdsParam) {
      throw new Error('Información de viaje o boletos no encontrada en la URL.')
    }

    // Fetch trip details
    await tripStore.fetchTripById(tripId)
    if (tripStore.error || !tripStore.currentTrip) {
      throw new Error(tripStore.error || 'No se pudo cargar la información del viaje.')
    }
    confirmedTrip.value = tripStore.currentTrip

    // Fetch ticket details
    const ticketIdArray = ticketIdsParam.split(',')
    if (ticketIdArray.length > 0) {
      for (const ticketId of ticketIdArray) {
        await ticketStore.fetchTicketById(ticketId)
        if (ticketStore.error || !ticketStore.currentTicket) {
          console.warn(`No se pudo cargar el boleto ID: ${ticketId}. Error: ${ticketStore.error}`)
          // Decide if this is a critical error or if we can proceed
        } else {
          fetchedTickets.value.push({...ticketStore.currentTicket}) // Store a copy
        }
      }
    }
    
    if (fetchedTickets.value.length === 0) {
        throw new Error('No se pudieron cargar los detalles de los boletos.')
    }

    // Fetch client details using the client_id from the first fetched ticket
    const firstTicket = fetchedTickets.value[0]
    if (firstTicket && firstTicket.client_id) {
      await clientStore.fetchClientById(firstTicket.client_id)
      if (clientStore.error || !clientStore.currentClient) {
        console.warn(`No se pudo cargar el cliente ID: ${firstTicket.client_id}. Error: ${clientStore.error}`)
        // Client info might be optional for confirmation, so not throwing critical error
      } else {
        confirmedClient.value = clientStore.currentClient
      }
    }
  } catch (err) {
    console.error("Error en onMounted (confirmation.vue):", err)
    error.value = err.message || 'Ocurrió un error al cargar los detalles de la confirmación.'
  } finally {
    loading.value = false
  }
})

const primaryTicket = computed(() => {
  return fetchedTickets.value.length > 0 ? fetchedTickets.value[0] : null
})

const seatNumbersDisplay = computed(() => {
  // Assuming seat numbers are stored in ticket.seat.number or similar
  // This needs to be adjusted based on the actual structure of ticketStore.currentTicket.seat
  return fetchedTickets.value.map(t => t.seat?.number || t.seat_id).join(', ') || route.query.ids
})

const totalAmountDisplay = computed(() => {
  // Sum price of all tickets
  return fetchedTickets.value.reduce((sum, ticket) => sum + (parseFloat(ticket.price) || 0), 0).toFixed(2)
})

// Formatear fecha
const formatDate = (dateStringOrDate) => {
  if (!dateStringOrDate) return 'Fecha no disponible';
  const date = new Date(dateStringOrDate)
  return new Intl.DateTimeFormat('es-ES', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: 'numeric',
    minute: 'numeric'
  }).format(date)
}

// Imprimir boleto
const printTicket = () => {
  window.print()
}

// Definir la metadata de la página
definePageMeta({
  // middleware: ['auth'] // Aplicar middleware de autenticación - REMOVED as auth.global.ts handles this
})
</script>
