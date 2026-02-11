<template>
  <div class="bg-white p-4 font-mono">
    <!-- Controles de impresión -->
    <div class="no-print mb-6 flex justify-between items-center">
      <a
        :href="`/trips/${tripId}`"
        class="flex items-center text-blue-600 hover:text-blue-800"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clip-rule="evenodd" />
        </svg>
        Volver al Viaje
      </a>
      <button
        @click="printSheet"
        class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center"
      >
        <svg class="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a1 1 0 001-1v-4a1 1 0 00-1-1H9a1 1 0 00-1 1v4a1 1 0 001 1zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
        </svg>
        Imprimir
      </button>
    </div>

    <!-- Mensaje de carga -->
    <div v-if="isLoading" class="flex justify-center py-12">
      <p class="text-gray-500">Cargando planilla de pasajeros...</p>
    </div>

    <!-- Mensaje de error -->
    <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-md p-4 mb-6 no-print">
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

    <!-- Planilla de Pasajeros -->
    <div v-else-if="trip" class="passenger-sheet printable-area" style="position: relative;">
       <!-- ID del Viaje (Posicionado Absolutamente) -->
      <div style="position: absolute; top: 0; right: 0;">
        <div class="border border-red-500 p-1 inline-block">
          <p class="text-red-500 text-xs leading-tight">Nº <span class="font-bold text-base">{{ trip.id.toString().padStart(6, '0') }}</span></p>
        </div>
      </div>

      <!-- Encabezado -->
      <header class="mb-2 flex items-start space-x-4">
        <!-- Columna Izquierda: Logo -->
        <div class="flex-shrink-0" style="width: 25%;">
          <h1 class="text-xl font-bold font-serif" style="letter-spacing: 1px;">TRANS</h1>
          <h1 class="text-3xl font-bold font-serif -mt-2" style="letter-spacing: 1px;">COMARAPA</h1>
          <p class="text-xs scale-90 origin-top-left">SINDICATO MIXTO DE TRANSPORTISTAS</p>
          <p class="text-xs scale-90 origin-top-left">"MANUEL MARIA CABALLERO"</p>
          <div class="mt-1 text-left text-xs">
            <p class="text-xs scale-90 origin-top-left">OF. STA. CRUZ: 78175576</p>
            <p class="text-xs scale-90 origin-top-left">OF. COMARAPA: 781-75578</p>
          </div>
        </div>

        <!-- Columna Central: Detalles -->
        <div class="flex-1 text-center">
          <p class="text-xs font-bold whitespace-nowrap">MAIRANA - YERBA BUENA - AGUA CLARA - LOS NEGROS - MATARAL - QUINE - PALIZADA - SAN ISIDRO - COMARAPA</p>
          <div class="grid grid-cols-2 gap-x-4 mt-1 text-left text-xs">
            <div class="flex items-end">
              <span class="font-bold min-w-[3rem]">Ruta:</span>
              <span class="border-b border-dotted border-black flex-grow ml-1">{{ trip.route?.origin?.name || trip.route?.origin }} - {{ trip.route?.destination?.name || trip.route?.destination }}</span>
            </div>
            <div><!-- Empty div for balance --></div>
            <div class="flex items-end"><span class="font-bold min-w-[3rem]">Conductor:</span><span class="border-b border-dotted border-black flex-grow ml-1">{{ trip.driver?.firstname }} {{ trip.driver?.lastname }}</span></div>
            <div class="flex items-end"><span class="font-bold  min-w-[3rem]">Fecha:</span><span class="border-b border-dotted border-black flex-grow ml-1 text-center">{{ formatDate(trip.trip_datetime) }}</span></div>
            <div class="flex items-end"><span class="font-bold min-w-[3rem]">Lic.:</span><span class="border-b border-dotted border-black flex-grow ml-1">{{ trip.driver?.license_number || '' }}</span></div>
            <div class="flex items-end"><span class="font-bold  min-w-[3rem]">Hora:</span><span class="border-b border-dotted border-black flex-grow ml-1 text-center">{{ formatTime(trip.departure_time) }}</span></div>
            <div class="flex items-end"><span class="font-bold min-w-[3rem]">Ayudante:</span><span class="border-b border-dotted border-black flex-grow ml-1">{{ trip.assistant?.firstname }} {{ trip.assistant?.lastname }}</span></div>
            <div class="flex items-end"><span class="font-bold  min-w-[3rem]">Placa:</span><span class="border-b border-dotted border-black flex-grow ml-1">{{ trip.bus?.license_plate || 'N/A' }}</span></div>
            <div class="flex items-end"><span class="font-bold min-w-[3rem]">Cat.:</span><span class="border-b border-dotted border-black flex-grow ml-1">{{ trip.driver?.license_type || '' }}</span></div>
            <div class="flex items-end"><span class="font-bold  min-w-[3rem]">Marca:</span><span class="border-b border-dotted border-black flex-grow ml-1">{{ trip.bus?.brand || 'N/A' }}</span></div>
            <div class="flex items-end"><span class="font-bold min-w-[3rem]">Modelo:</span><span class="border-b border-dotted border-black flex-grow ml-1">{{ trip.bus?.model || 'N/A' }}</span></div>
            <div class="flex items-end"><span class="font-bold min-w-[3rem]">Color:</span><span class="border-b border-dotted border-black flex-grow ml-1">{{ trip.bus?.color || '' }}</span></div>
          </div>
        </div>
      </header>

      <!-- Tabla de pasajeros -->
      <div class="grid grid-cols-2 gap-x-4 mt-2">
        <!-- Columna Izquierda (Asientos 1-25) -->
        <div>
          <table class="w-full border-collapse">
            <thead class="bg-green-100">
              <tr>
                <th class="border border-green-600 p-0 text-sm w-10">No.</th>
                <th class="border border-green-600 p-0 text-sm">Nombre y Apellido</th>
                <th class="border border-green-600 p-0 text-sm w-20">C.I.</th>
                <th class="border border-green-600 p-0 text-sm w-24">Destino</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="i in 25" :key="`L${i}`">
                <td class="border border-green-600 text-center text-xs h-5">{{ i }}</td>
                <td class="border border-green-600 p-1 text-xs">{{ getPassengerNameForSeat(i) }}</td>
                <td class="border border-green-600 p-1 text-xs">{{ getPassengerDocForSeat(i) }}</td>
                <td class="border border-green-600 p-1 text-xs">{{ getPassengerDestinationForSeat(i) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <!-- Columna Derecha (Asientos 26-50) -->
        <div>
           <table class="w-full border-collapse">
            <thead class="bg-green-100">
              <tr>
                <th class="border border-green-600 p-0 text-sm w-10">No.</th>
                <th class="border border-green-600 p-0 text-sm">Nombre y Apellido</th>
                <th class="border border-green-600 p-0 text-sm w-20">C.I.</th>
                <th class="border border-green-600 p-0 text-sm w-24">Destino</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="i in 25" :key="`R${i}`">
                <td class="border border-green-600 text-center text-xs h-5">{{ i + 25 }}</td>
                <td class="border border-green-600 p-1 text-xs">{{ getPassengerNameForSeat(i + 25) }}</td>
                <td class="border border-green-600 p-1 text-xs">{{ getPassengerDocForSeat(i + 25) }}</td>
                <td class="border border-green-600 p-1 text-xs">{{ getPassengerDestinationForSeat(i + 25) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Mensaje cuando no hay datos -->
    <div v-else class="text-center py-12 no-print">
      <p class="text-gray-500">No hay información del viaje o pasajeros para mostrar.</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useTripStore } from '~/stores/tripStore'

definePageMeta({
  layout: 'print'
})

const route = useRoute()
const tripStore = useTripStore()

const trip = ref(null)
const passengers = ref([])
const passengersBySeat = ref({})
const isLoading = ref(true)
const error = ref(null)

const tripId = computed(() => {
  const param = route.params.id
  if (typeof param === 'string' && param.includes('-sheet')) {
    return parseInt(param.replace('-sheet', ''), 10)
  }
  return parseInt(param, 10)
})

const getPassengerNameForSeat = (seatNumber) => {
  const passenger = passengersBySeat.value[seatNumber]
  return passenger ? `${passenger.client?.firstname || ''} ${passenger.client?.lastname || ''}` : ''
}

const getPassengerDocForSeat = (seatNumber) => {
  const passenger = passengersBySeat.value[seatNumber]
  return passenger ? passenger.client?.document_id || '' : ''
}

const getPassengerDestinationForSeat = (seatNumber) => {
  const passenger = passengersBySeat.value[seatNumber]
  if (!passenger) return ''
  
  // Priorizar el destino personalizado si existe
  if (passenger.destination && passenger.destination.trim()) {
    return passenger.destination
  }
  
  // Si no hay destino personalizado, usar el destino de la ruta
  if (trip.value?.route?.destination?.name) {
    return trip.value.route.destination.name
  }
  
  return ''
}

const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  // add timezone offset to show correct date
  const offset = date.getTimezoneOffset()
  const adjustedDate = new Date(date.getTime() + (offset * 60 * 1000))
  return adjustedDate.toLocaleDateString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
}

const formatTime = (timeString) => {
  if (!timeString) return ''
  // Handles 'HH:mm:ss' and 'HH:mm'
  const timeParts = timeString.split(':')
  const date = new Date()
  date.setHours(parseInt(timeParts[0], 10), parseInt(timeParts[1], 10), 0, 0)
  
  return date.toLocaleTimeString('es-ES', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  })
}

const printSheet = () => {
  window.print()
}

onMounted(async () => {
  try {
    isLoading.value = true
    error.value = null

    await tripStore.fetchTripById(tripId.value)
    trip.value = tripStore.currentTrip

    if (!trip.value) {
      throw new Error('No se pudo cargar la información del viaje.')
    }

    const config = useRuntimeConfig()
    const apiUrl = `${config.public.apiBaseUrl}/tickets/trip/${tripId.value}`
    const response = await fetch(apiUrl)
    
    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`)
    }
    
    const ticketsData = await response.json()
    
    passengers.value = ticketsData
      .filter(ticket => ['confirmed', 'sold', 'paid'].includes(ticket.state))
      .sort((a, b) => {
        const seatA = a.seat?.seat_number || 0
        const seatB = b.seat?.seat_number || 0
        return seatA - seatB
      })

    passengersBySeat.value = passengers.value.reduce((acc, p) => {
      if (p.seat?.seat_number) {
        acc[p.seat.seat_number] = p
      }
      return acc
    }, {})

  } catch (err) {
    console.error('Error loading passenger sheet:', err)
    error.value = err.message || 'Error al cargar la planilla de pasajeros.'
  } finally {
    isLoading.value = false
  }
})
</script>

<style>
@media print {
  .no-print {
    display: none;
  }
  body, html {
    margin: 0;
    padding: 0;
  }
  .printable-area {
    margin: 0;
    padding: 0;
    width: 100%;
    transform: scale(0.95);
    transform-origin: top left;
  }
  @page {
    size: letter landscape;
    margin: 0.25in;
  }
}

.font-serif {
  font-family: "Times New Roman", Times, serif;
}

table, th, td {
  border: 1px solid #2F855A; /* green-600 */
}

th, td {
  padding: 0 2px;
  text-align: left;
  font-size: 9px;
  vertical-align: middle;
}

th {
  font-weight: bold;
}

.h-5 {
  height: 1.25rem; /* 20px */
}
</style>