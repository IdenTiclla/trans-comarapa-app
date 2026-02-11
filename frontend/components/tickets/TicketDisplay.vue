<template>
  <div 
    class="ticket-container bg-white rounded-lg overflow-hidden mx-auto"
    :class="previewMode 
      ? 'border-2 border-blue-300 max-w-md shadow-md scale-90 transform origin-top' 
      : 'border-4 border-blue-400 max-w-4xl shadow-2xl'"
  >
    <!-- Header principal con logo y información de la empresa -->
    <div 
      class="ticket-header bg-gradient-to-r from-cyan-400 to-blue-500 text-white"
      :class="previewMode 
        ? 'px-2 py-1 border-b-2 border-blue-500' 
        : 'px-4 py-3 border-b-4 border-blue-600'"
    >
      <div class="flex items-start justify-between">
        <!-- Lado izquierdo: Logo del bus y texto -->
        <div class="flex items-start space-x-3">
          <!-- Logo del bus -->
          <div class="flex-shrink-0">
            <svg 
              class="text-white" 
              :class="previewMode ? 'w-8 h-6' : 'w-16 h-12'"
              fill="currentColor" 
              viewBox="0 0 100 60"
            >
              <rect x="10" y="20" width="70" height="25" rx="5" fill="currentColor"/>
              <rect x="15" y="15" width="60" height="8" rx="3" fill="currentColor"/>
              <circle cx="25" cy="50" r="6" fill="currentColor"/>
              <circle cx="65" cy="50" r="6" fill="currentColor"/>
              <rect x="20" y="25" width="8" height="6" fill="white"/>
              <rect x="32" y="25" width="8" height="6" fill="white"/>
              <rect x="44" y="25" width="8" height="6" fill="white"/>
              <rect x="56" y="25" width="8" height="6" fill="white"/>
            </svg>
          </div>
          
          <!-- Texto principal -->
          <div>
            <div class="flex items-baseline space-x-2 mb-1">
              <h1 :class="previewMode ? 'text-lg font-bold' : 'text-2xl font-bold'">TRANS</h1>
              <h2 :class="previewMode ? 'text-lg font-bold italic' : 'text-2xl font-bold italic'">Comarapa</h2>
            </div>
            <div class="leading-tight" :class="previewMode ? 'text-xs' : 'text-xs'">
              <p class="font-medium">SINDICATO MIXTO DE TRANSPORTISTAS DE LARGA</p>
              <p class="font-medium">Y CORTA DISTANCIA "MANUEL MARIA CABALLERO"</p>
            </div>
          </div>
        </div>
        
        <!-- Centro: Resolución -->
        <div class="text-center">
          <p :class="previewMode ? 'text-xs font-bold' : 'text-sm font-bold'">Resolución Suprema 17996</p>
        </div>
        
        <!-- Lado derecho: Águila -->
        <div class="flex-shrink-0">
          <svg 
            class="text-white" 
            :class="previewMode ? 'w-8 h-8' : 'w-16 h-16'" 
            fill="currentColor" 
            viewBox="0 0 100 100"
          >
            <path d="M50 10 L30 30 L20 50 L30 60 L50 55 L70 60 L80 50 L70 30 Z"/>
            <path d="M50 15 L40 25 L50 35 L60 25 Z"/>
            <circle cx="45" cy="25" r="2"/>
            <circle cx="55" cy="25" r="2"/>
          </svg>
        </div>
      </div>
      
      <!-- Información de oficinas -->
      <div 
        class="grid grid-cols-2 gap-x-8"
        :class="previewMode ? 'mt-1 text-xs' : 'mt-2 text-xs'"
      >
        <div>
          <p><span class="font-medium">Of. Santa Cruz:</span> Av. Doble Vía La Guardia 4to. Anillo • <span class="font-medium">Cel.:</span> 781-75576</p>
          <p><span class="font-medium">Of. Comarapa:</span> Av. Comarapa • <span class="font-medium">Cel.:</span> 781-75578</p>
        </div>
        <div>
          <p><span class="font-medium">Of. San Isidro:</span> <span class="font-medium">Cel.:</span> 785-15650</p>
          <p><span class="font-medium">Of. Los Negros:</span> <span class="font-medium">Cel.:</span> 690-29690</p>
        </div>
      </div>
    </div>

    <!-- Área principal del boleto -->
    <div class="bg-white relative">
      <!-- Boleto label en la esquina superior derecha -->
      <div 
        class="absolute right-4"
        :class="previewMode ? 'top-1' : 'top-2'"
      >
        <div 
          class="bg-blue-500 text-white rounded-lg"
          :class="previewMode ? 'px-3 py-1' : 'px-6 py-2'"
        >
          <h3 
            class="font-bold"
            :class="previewMode ? 'text-sm' : 'text-xl'"
          >
            BOLETO
          </h3>
        </div>
      </div>

      <div :class="previewMode ? 'px-3 py-2 pt-8' : 'px-4 py-4 pt-16'">
        <!-- Fila NOMBRE y N° -->
        <div 
          :class="previewMode ? 'border-2 border-blue-400 mb-2' : 'border-4 border-blue-500 mb-2'"
        >
          <div class="flex">
            <!-- NOMBRE -->
            <div 
              class="bg-blue-500 text-white font-bold"
              :class="previewMode ? 'px-3 py-2 text-base' : 'px-4 py-3 text-lg'"
            >
              NOMBRE:
            </div>
            <!-- Espacio para el nombre -->
            <div 
              class="flex-grow bg-white text-gray-700"
              :class="previewMode 
                ? 'border-r-2 border-blue-400 px-3 py-2 text-base' 
                : 'border-r-4 border-blue-500 px-4 py-3'"
            >
              {{ getFullName() }}
            </div>
            <!-- N° -->
            <div 
              class="bg-white text-right"
              :class="previewMode ? 'px-3 py-2' : 'px-6 py-3'"
            >
              <span 
                class="text-red-600 font-bold"
                :class="previewMode ? 'text-lg' : 'text-2xl'"
              >
                N° {{ ticket.id || '115032' }}
              </span>
            </div>
          </div>
        </div>

        <!-- Fila Bs, Destino, N° -->
        <div 
          class="grid grid-cols-12"
          :class="previewMode ? 'gap-2 mb-2' : 'gap-2 mb-2'"
        >
          <!-- Bs. -->
          <div 
            class="col-span-2"
            :class="previewMode ? 'border-2 border-blue-400' : 'border-4 border-blue-500'"
          >
            <div 
              class="bg-blue-500 text-white text-center font-bold"
              :class="previewMode ? 'py-1 text-sm' : 'py-2'"
            >
              Bs.
            </div>
            <div 
              class="bg-white text-center font-bold"
              :class="previewMode ? 'py-2 text-base' : 'py-4 text-xl'"
            >
              {{ formatPrice(ticket.price) }}
            </div>
          </div>

          <!-- Destino -->
          <div 
            class="col-span-7"
            :class="previewMode ? 'border-2 border-blue-400' : 'border-4 border-blue-500'"
          >
            <div 
              class="bg-blue-500 text-white text-center font-bold"
              :class="previewMode ? 'py-1 text-sm' : 'py-2'"
            >
              Destino:
            </div>
            <div 
              class="bg-white text-center font-bold"
              :class="previewMode ? 'py-2 text-base' : 'py-4 text-lg'"
            >
              {{ getDestination() }}
            </div>
          </div>

          <!-- N° -->
          <div 
            class="col-span-3"
            :class="previewMode ? 'border-2 border-blue-400' : 'border-4 border-blue-500'"
          >
            <div 
              class="bg-blue-500 text-white text-center font-bold"
              :class="previewMode ? 'py-1 text-sm' : 'py-2'"
            >
              N°
            </div>
            <div 
              class="bg-white text-center font-bold"
              :class="[
                previewMode ? 'py-2 text-base' : 'py-4',
                getSeatNumberClass()
              ]"
            >
              {{ getSeatNumbers() }}
            </div>
          </div>
        </div>

        <!-- Fila Fecha y Horarios -->
        <div 
          class="grid grid-cols-12 mb-4"
          :class="previewMode ? 'gap-1' : 'gap-2'"
        >
          <!-- Fecha -->
          <div 
            class="col-span-4"
            :class="previewMode ? 'border-2 border-blue-400' : 'border-4 border-blue-500'"
          >
            <div 
              class="bg-blue-500 text-white text-center font-bold"
              :class="previewMode ? 'py-1 text-xs' : 'py-2'"
            >
              Fecha
            </div>
            <div :class="previewMode ? 'bg-white p-1' : 'bg-white p-2'">
              <div class="grid grid-cols-3 gap-1">
                <div 
                  class="border-2 border-blue-300 text-center font-bold"
                  :class="previewMode ? 'py-1 text-xs' : 'py-2'"
                >
                  {{ getDayFromDate() }}
                </div>
                <div 
                  class="border-2 border-blue-300 text-center font-bold"
                  :class="previewMode ? 'py-1 text-xs' : 'py-2'"
                >
                  {{ getMonthFromDate() }}
                </div>
                <div 
                  class="border-2 border-blue-300 text-center font-bold"
                  :class="previewMode ? 'py-1 text-xs' : 'py-2'"
                >
                  {{ getYearFromDate() }}
                </div>
              </div>
            </div>
          </div>

          <!-- Hora en Oficina -->
          <div 
            class="col-span-4"
            :class="previewMode ? 'border-2 border-blue-400' : 'border-4 border-blue-500'"
          >
            <div 
              class="bg-blue-500 text-white text-center font-bold"
              :class="previewMode ? 'py-1 text-xs' : 'py-2'"
            >
              Hora en Oficina:
            </div>
            <div :class="previewMode ? 'bg-white p-1' : 'bg-white p-2'">
              <div 
                class="flex justify-center mb-2"
                :class="previewMode ? 'space-x-1' : 'space-x-2'"
              >
                <span 
                  class="bg-blue-100 rounded font-bold text-blue-600"
                  :class="previewMode ? 'px-1 py-0.5 text-xs' : 'px-3 py-1'"
                >
                  {{ getOfficeTimeAmPm() }}
                </span>
              </div>
              <div 
                class="text-center font-bold"
                :class="previewMode ? 'text-xs' : 'text-lg'"
              >
                {{ getCurrentTime() }}
              </div>
            </div>
          </div>

          <!-- Hora Salida -->
          <div 
            class="col-span-4"
            :class="previewMode ? 'border-2 border-blue-400' : 'border-4 border-blue-500'"
          >
            <div 
              class="bg-blue-500 text-white text-center font-bold"
              :class="previewMode ? 'py-1 text-xs' : 'py-2'"
            >
              Hora Salida:
            </div>
            <div :class="previewMode ? 'bg-white p-1' : 'bg-white p-2'">
              <div 
                class="flex justify-center mb-2"
                :class="previewMode ? 'space-x-1' : 'space-x-2'"
              >
                <span 
                  class="bg-blue-100 rounded font-bold text-blue-600"
                  :class="previewMode ? 'px-1 py-0.5 text-xs' : 'px-3 py-1'"
                >
                  {{ getDepartureTimeAmPm() }}
                </span>
              </div>
              <div 
                class="text-center font-bold"
                :class="previewMode ? 'text-xs' : 'text-lg'"
              >
                {{ getDepartureTime() }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Footer -->
    <div 
      class="bg-gradient-to-r from-cyan-400 to-blue-500 text-white"
      :class="previewMode 
        ? 'px-2 py-1 border-t-2 border-blue-500' 
        : 'px-4 py-3 border-t-4 border-blue-600'"
    >
              <div :class="previewMode ? 'grid grid-cols-12 gap-1' : 'grid grid-cols-12 gap-4'">
          <!-- NO SE ACEPTAN DEVOLUCIONES -->
          <div class="col-span-4">
            <div class="text-center">
              <p 
                class="font-bold mb-1"
                :class="previewMode ? 'text-xs' : 'text-lg'"
              >
                NO SE ACEPTAN
              </p>
              <p 
                class="font-bold mb-2"
                :class="previewMode ? 'text-xs' : 'text-lg'"
              >
                DEVOLUCIONES
              </p>
              <p 
                class="italic"
                :class="previewMode ? 'text-xs' : 'text-sm'"
              >
                Gracias por su preferencia!!!
              </p>
            </div>
          </div>

          <!-- HORARIOS -->
          <div class="col-span-8">
            <div 
              class="bg-blue-600 rounded"
              :class="previewMode ? 'px-1 py-1' : 'px-3 py-2'"
            >
              <h4 
                class="text-center font-bold mb-2"
                :class="previewMode ? 'text-xs' : 'text-sm'"
              >
                HORARIOS DE SALIDA DE SANTA CRUZ A COMARAPA
              </h4>
              <div 
                class="leading-tight"
                :class="previewMode ? 'text-xs' : 'text-xs'"
              >
                <p><span class="font-bold">De lunes a Jueves son:</span> 10:30 am., 14:00 pm., 18:30 pm., 20:30 pm.</p>
                <p><span class="font-bold">Solo viernes sábado y domingo:</span></p>
                <p>10:30 am., 14:00 pm., 18:30 pm., 20:30 pm., 22:00 pm.</p>
                <p><span class="font-bold">DE COMARAPA A SANTA CRUZ</span> de Lunes a Sábado son:</p>
                <p>8:00 am., 14:00 pm., 20:30 pm., 23:30 pm.</p>
                <p><span class="font-bold">Solo domingo:</span> 8:30 am., 12:00 del medio día, 14:00 pm., 20:30 pm., 23:30 pm.</p>
              </div>
            </div>
          </div>
        </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  ticket: {
    type: Object,
    required: true
  },
  trip: {
    type: Object,
    required: true
  },
  previewMode: {
    type: Boolean,
    default: false
  }
})

// Computed properties para formatear la información
const formatPrice = (price) => {
  return price ? parseFloat(price).toFixed(2) : '0.00'
}

const getDestination = () => {
  // Priorizar destination del ticket si está disponible
  if (props.ticket?.destination) {
    return props.ticket.destination
  }
  // Fallback a la información de la ruta
  if (props.trip?.route?.destination) {
    return props.trip.route.destination
  }
  return props.ticket.trip?.route?.destination || 'Destino'
}

const getFullName = () => {
  const client = props.ticket.client
  if (client) {
    return `${client.firstname || ''} ${client.lastname || ''}`.trim()
  }
  return 'Cliente'
}

const getDayFromDate = () => {
  const date = props.trip?.trip_datetime || props.ticket.trip?.trip_datetime
  if (date) {
    return new Date(date).getDate().toString().padStart(2, '0')
  }
  return new Date().getDate().toString().padStart(2, '0')
}

const getMonthFromDate = () => {
  const date = props.trip?.trip_datetime || props.ticket.trip?.trip_datetime
  if (date) {
    return (new Date(date).getMonth() + 1).toString().padStart(2, '0')
  }
  return (new Date().getMonth() + 1).toString().padStart(2, '0')
}

const getYearFromDate = () => {
  const date = props.trip?.trip_datetime || props.ticket.trip?.trip_datetime
  if (date) {
    return new Date(date).getFullYear().toString().slice(-2)
  }
  return new Date().getFullYear().toString().slice(-2)
}

const getCurrentTime = () => {
  const datetime = props.trip?.trip_datetime || props.ticket.trip?.trip_datetime
  if (datetime) {
    const departureDate = new Date(datetime)
    // Restar 30 minutos a la hora de salida
    const officeTime = new Date(departureDate.getTime() - (30 * 60 * 1000))
    return officeTime.toLocaleTimeString('es-BO', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    })
  }
  // Fallback si no hay datetime disponible
  const now = new Date()
  const officeTime = new Date(now.getTime() - (30 * 60 * 1000))
  return officeTime.toLocaleTimeString('es-BO', { 
    hour: '2-digit', 
    minute: '2-digit',
    hour12: false 
  })
}

const getDepartureTime = () => {
  const datetime = props.trip?.trip_datetime || props.ticket.trip?.trip_datetime
  if (datetime) {
    const date = new Date(datetime)
    return date.toLocaleTimeString('es-BO', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    })
  }
  return '00:00'
}

const getSeatNumberClass = () => {
  // Manejar múltiples asientos
  let seatNumbers = ''
  if (props.ticket.seats && Array.isArray(props.ticket.seats)) {
    seatNumbers = props.ticket.seats.map(seat => seat.seat_number).join(', ')
  } else if (props.ticket.seat?.seat_number) {
    seatNumbers = props.ticket.seat.seat_number.toString()
  } else {
    seatNumbers = '36'
  }
  
  // Si hay múltiples asientos (contiene comas) o el texto es muy largo
  if (seatNumbers.includes(',') || seatNumbers.length > 4) {
    return props.previewMode ? 'text-sm leading-tight' : 'text-lg leading-tight' // Texto más pequeño para múltiples asientos
  } else if (seatNumbers.length > 2) {
    return props.previewMode ? 'text-base' : 'text-xl' // Texto mediano para números de 3-4 dígitos
  } else {
    return props.previewMode ? 'text-lg' : 'text-2xl' // Texto grande para números cortos (1-2 dígitos)
  }
}

const getSeatNumbers = () => {
  if (props.ticket.seats && Array.isArray(props.ticket.seats)) {
    return props.ticket.seats.map(seat => seat.seat_number).join(', ')
  } else if (props.ticket.seat?.seat_number) {
    return props.ticket.seat.seat_number
  } else {
    return '36'
  }
}

// Funciones para determinar AM/PM
const getOfficeTimeAmPm = () => {
  const datetime = props.trip?.trip_datetime || props.ticket.trip?.trip_datetime
  if (datetime) {
    const departureDate = new Date(datetime)
    const officeTime = new Date(departureDate.getTime() - (30 * 60 * 1000))
    return officeTime.getHours() < 12 ? 'AM' : 'PM'
  }
  const now = new Date()
  const officeTime = new Date(now.getTime() - (30 * 60 * 1000))
  return officeTime.getHours() < 12 ? 'AM' : 'PM'
}

const getDepartureTimeAmPm = () => {
  const datetime = props.trip?.trip_datetime || props.ticket.trip?.trip_datetime
  if (datetime) {
    const date = new Date(datetime)
    return date.getHours() < 12 ? 'AM' : 'PM'
  }
  return 'AM'
}
</script>

<style scoped>
.ticket-container {
  font-family: 'Arial', sans-serif;
  max-width: 950px;
  background: white;
}

.ticket-header {
  background: linear-gradient(135deg, #00bcd4 0%, #2196f3 100%);
}

.ticket-footer {
  background: linear-gradient(135deg, #00bcd4 0%, #2196f3 100%);
}

/* Bordes azules específicos */
.border-blue-500 {
  border-color: #3b82f6;
}

.border-blue-600 {
  border-color: #2563eb;
}

.border-blue-400 {
  border-color: #60a5fa;
}

.bg-blue-500 {
  background-color: #3b82f6;
}

.bg-blue-600 {
  background-color: #2563eb;
}

/* Grid sistema para layout horizontal */
.grid-cols-12 {
  grid-template-columns: repeat(12, minmax(0, 1fr));
}

/* Print styles */
@media print {
  .ticket-container {
    max-width: none;
    width: 210mm;
    box-shadow: none;
    border: 2px solid #000;
    margin: 0;
  }
  
  .bg-gradient-to-r,
  .bg-gradient-to-l,
  .bg-blue-500,
  .bg-blue-600 {
    background: #3b82f6 !important;
    -webkit-print-color-adjust: exact;
    color-adjust: exact;
  }
  
  .border-4 {
    border-width: 2px !important;
  }
  
  .text-xs {
    font-size: 10px !important;
  }
  
  .text-sm {
    font-size: 12px !important;
  }
  
  .text-base {
    font-size: 14px !important;
  }
  
  .text-lg {
    font-size: 16px !important;
  }
  
  .text-xl {
    font-size: 18px !important;
  }
  
  .text-2xl {
    font-size: 20px !important;
  }
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .ticket-container {
    max-width: 100%;
    margin: 0;
  }
  
  .grid-cols-12 {
    display: block;
  }
  
  .col-span-2,
  .col-span-3,
  .col-span-4,
  .col-span-5,
  .col-span-7,
  .col-span-8 {
    width: 100%;
    margin-bottom: 0.5rem;
  }
  
  .text-xl {
    font-size: 1.125rem;
  }
  
  .text-lg {
    font-size: 1rem;
  }
  
  .px-6 {
    padding-left: 1rem;
    padding-right: 1rem;
  }
  
  .flex {
    flex-direction: column;
  }
  
  .flex-grow {
    flex-grow: initial;
  }
}

@media (max-width: 480px) {
  .grid-cols-2 {
    grid-template-columns: 1fr;
    gap: 0.5rem;
  }
  
  .grid-cols-3 {
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 0.25rem;
  }
  
  .text-sm {
    font-size: 0.75rem;
  }
  
  .px-4 {
    padding-left: 0.75rem;
    padding-right: 0.75rem;
  }
  
  .border-4 {
    border-width: 2px;
  }
}

/* Ensure proper spacing for horizontal layout */
.col-span-1 { grid-column: span 1 / span 1; }
.col-span-2 { grid-column: span 2 / span 2; }
.col-span-3 { grid-column: span 3 / span 3; }
.col-span-4 { grid-column: span 4 / span 4; }
.col-span-5 { grid-column: span 5 / span 5; }
.col-span-6 { grid-column: span 6 / span 6; }
.col-span-7 { grid-column: span 7 / span 7; }
.col-span-8 { grid-column: span 8 / span 8; }
.col-span-9 { grid-column: span 9 / span 9; }
.col-span-10 { grid-column: span 10 / span 10; }
.col-span-11 { grid-column: span 11 / span 11; }
.col-span-12 { grid-column: span 12 / span 12; }

/* Bordes gruesos específicos */
.border-4 {
  border-width: 4px;
}

.border-2 {
  border-width: 2px;
}

/* Colores de texto específicos */
.text-red-600 {
  color: #dc2626;
}

.text-blue-600 {
  color: #2563eb;
}

.text-gray-700 {
  color: #374151;
}

/* Flexbox específico para el layout del nombre */
.flex-grow {
  flex-grow: 1;
}

.flex-shrink-0 {
  flex-shrink: 0;
}
</style> 