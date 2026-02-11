<template>
  <div class="seat-map-container px-4 sm:px-6 md:px-8 pb-6 sm:pb-8">
    <!-- Indicador de pasillo para móviles -->
    <div class="md:hidden flex justify-center mb-4">
      <div class="bg-gradient-to-r from-slate-600 to-gray-700 px-6 py-3 rounded-2xl text-white font-bold text-sm shadow-lg">
        🚌 PASILLO CENTRAL
      </div>
    </div>

    <div class="relative grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] md:gap-6 lg:gap-8 bg-gradient-to-b from-slate-50 to-white p-4 sm:p-6 rounded-3xl border border-gray-100 shadow-inner">
      <!-- Columna izquierda -->
      <div class="left-column md:pr-4">
        <div class="md:hidden mb-4 flex items-center justify-center space-x-2">
          <div class="w-3 h-3 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full"></div>
          <h3 class="text-sm font-bold text-gray-700">Lado Izquierdo</h3>
          <div class="w-3 h-3 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full"></div>
        </div>
        <div class="grid grid-cols-2 gap-3 sm:gap-4">
          <div v-for="seat in leftColumnSeats" :key="seat.id" class="seat-container group">
            <div class="seat-number flex items-center justify-center mb-2">
              <div class="bg-gradient-to-r from-indigo-500 to-blue-600 text-white px-3 py-1 rounded-full text-xs font-bold shadow-md">
                {{ seat.number }}<span class="ml-1 opacity-75">{{ seat.position === 'window' ? '🪟' : '🚶' }}</span>
              </div>
            </div>
            <div
              class="seat-box relative rounded-2xl p-2 sm:p-4 flex flex-col justify-between text-center min-h-[7rem] sm:h-36 transition-all duration-300 transform group-hover:scale-105 cursor-pointer shadow-lg border-2 overflow-hidden"
              :class="getModernSeatClass(seat)"
              @click="toggleSeatSelection(seat)"
              @contextmenu="handleContextMenu($event, seat)"
            >
              <!-- Price Display -->
              <div v-if="getSeatPrice(seat)" class="absolute top-2 right-2">
                <div class="bg-black bg-opacity-75 text-white px-1.5 py-0.5 rounded-full text-[10px] sm:text-xs font-bold">
                  Bs. {{ formatPrice(getSeatPrice(seat)) }}
                </div>
              </div>

              <!-- Passenger info container - Always takes space to maintain consistent height -->
              <div class="flex flex-col justify-center items-center text-center px-1 sm:px-2 pt-6 pb-2 flex-grow min-h-[4rem]">
                  <div class="text-[10px] sm:text-sm leading-tight font-bold text-gray-800 truncate w-full h-4" :class="{'opacity-0': !seat.occupied && seat.status !== 'reserved'}" :title="seat.passenger?.name">
                      {{ (seat.occupied || seat.status === 'reserved') ? (seat.passenger?.name || '') : '' }}
                  </div>
                  <div class="text-[10px] sm:text-xs text-gray-600 font-medium mt-1 h-4" :class="{'opacity-0': !seat.occupied && seat.status !== 'reserved'}">
                      {{ (seat.occupied || seat.status === 'reserved') ? (seat.passenger?.phone || '') : '' }}
                  </div>
                  <div class="text-[10px] sm:text-xs text-blue-600 font-semibold mt-1 truncate w-full h-4" :class="{'opacity-0': !getSeatDestination(seat)}" :title="getSeatDestination(seat)">
                      {{ getSeatDestination(seat) ? `→ ${getSeatDestination(seat)}` : '' }}
                  </div>
              </div>

              <!-- Status Tag -->
              <div class="flex-shrink-0 w-full">
                  <span class="text-[10px] sm:text-xs font-bold px-1 sm:px-2 py-0.5 sm:py-1 rounded-full block truncate text-center" :class="getModernStatusClass(seat)">
                      {{ getSeatStatusText(seat) }}
                  </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Pasillo central con logo (solo visible en escritorio) -->
      <div class="center-aisle hidden md:flex flex-col justify-center items-center px-4">
        <div class="relative">
          <div class="rotate-90 bg-gradient-to-r from-slate-600 to-gray-700 px-6 py-3 rounded-2xl text-white font-black text-sm tracking-[0.3em] shadow-xl whitespace-nowrap">
            🚌 PASILLO
          </div>
          <div class="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 opacity-20 rounded-2xl rotate-90 blur-sm"></div>
        </div>
      </div>

      <!-- Columna derecha -->
      <div class="right-column mt-6 sm:mt-8 md:mt-0 md:pl-4">
        <div class="md:hidden mb-4 flex items-center justify-center space-x-2">
          <div class="w-3 h-3 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-full"></div>
          <h3 class="text-sm font-bold text-gray-700">Lado Derecho</h3>
          <div class="w-3 h-3 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-full"></div>
        </div>
        <div class="grid grid-cols-2 gap-3 sm:gap-4">
          <div v-for="seat in rightColumnSeats" :key="seat.id" class="seat-container group">
            <div class="seat-number flex items-center justify-center mb-2">
              <div class="bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-3 py-1 rounded-full text-xs font-bold shadow-md">
                {{ seat.number }}<span class="ml-1 opacity-75">{{ seat.position === 'window' ? '🪟' : '🚶' }}</span>
              </div>
            </div>
            <div
              class="seat-box relative rounded-2xl p-2 sm:p-4 flex flex-col justify-between text-center min-h-[7rem] sm:h-36 transition-all duration-300 transform group-hover:scale-105 cursor-pointer shadow-lg border-2 overflow-hidden"
              :class="getModernSeatClass(seat)"
              @click="toggleSeatSelection(seat)"
              @contextmenu="handleContextMenu($event, seat)"
            >
              <!-- Price Display -->
              <div v-if="getSeatPrice(seat)" class="absolute top-2 right-2">
                <div class="bg-black bg-opacity-75 text-white px-1.5 py-0.5 rounded-full text-[10px] sm:text-xs font-bold">
                  Bs. {{ formatPrice(getSeatPrice(seat)) }}
                </div>
              </div>

              <!-- Passenger info container - Always takes space to maintain consistent height -->
              <div class="flex flex-col justify-center items-center text-center px-1 sm:px-2 pt-6 pb-2 flex-grow min-h-[4rem]">
                  <div class="text-[10px] sm:text-sm leading-tight font-bold text-gray-800 truncate w-full h-4" :class="{'opacity-0': !seat.occupied && seat.status !== 'reserved'}" :title="seat.passenger?.name">
                      {{ (seat.occupied || seat.status === 'reserved') ? (seat.passenger?.name || '') : '' }}
                  </div>
                  <div class="text-[10px] sm:text-xs text-gray-600 font-medium mt-1 h-4" :class="{'opacity-0': !seat.occupied && seat.status !== 'reserved'}">
                      {{ (seat.occupied || seat.status === 'reserved') ? (seat.passenger?.phone || '') : '' }}
                  </div>
                  <div class="text-[10px] sm:text-xs text-blue-600 font-semibold mt-1 truncate w-full h-4" :class="{'opacity-0': !getSeatDestination(seat)}" :title="getSeatDestination(seat)">
                      {{ getSeatDestination(seat) ? `→ ${getSeatDestination(seat)}` : '' }}
                  </div>
              </div>

              <!-- Status Tag -->
              <div class="flex-shrink-0 w-full">
                  <span class="text-[10px] sm:text-xs font-bold px-1 sm:px-2 py-0.5 sm:py-1 rounded-full block truncate text-center" :class="getModernStatusClass(seat)">
                      {{ getSeatStatusText(seat) }}
                  </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, nextTick } from 'vue'

const props = defineProps({
  seats: {
    type: Array,
    required: true
  },
  selectedSeatIds: {
    type: Array,
    required: true
  },
  disabled: {
    type: Boolean,
    default: false
  },
  maxSelections: {
    type: Number,
    default: 0
  },
  tickets: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits([
  'seat-selected', 
  'seat-deselected', 
  'selection-change',
  'context-menu'
])

// Asientos de la columna izquierda
const leftColumnSeats = computed(() => {
  return props.seats.filter(seat => seat.column === 'left')
})

// Asientos de la columna derecha
const rightColumnSeats = computed(() => {
  return props.seats.filter(seat => seat.column === 'right')
})

// Asientos seleccionados
const selectedSeats = computed(() => {
  return props.seats.filter(seat => props.selectedSeatIds.includes(seat.id))
})

// Nuevas funciones modernas para el diseño
const getModernSeatClass = (seat) => {
  if (seat.occupied) {
    return 'bg-gradient-to-br from-red-100 to-red-200 border-red-300 cursor-not-allowed hover:scale-100'
  } else if (seat.status === 'reserved') {
    return 'bg-gradient-to-br from-amber-100 to-orange-200 border-orange-300 cursor-not-allowed hover:scale-100'
  } else if (props.selectedSeatIds.includes(seat.id)) {
    return 'bg-gradient-to-br from-blue-100 to-indigo-200 border-blue-400 cursor-pointer modern-seat-selected'
  } else {
    return 'bg-gradient-to-br from-emerald-50 to-green-100 border-emerald-300 hover:from-emerald-100 hover:to-green-200 cursor-pointer hover:shadow-xl'
  }
}

const getModernStatusClass = (seat) => {
  if (seat.occupied) {
    return 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg'
  } else if (seat.status === 'reserved') {
    return 'bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-lg'
  } else if (props.selectedSeatIds.includes(seat.id)) {
    return 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg'
  } else {
    return 'bg-gradient-to-r from-emerald-500 to-green-600 text-white shadow-lg'
  }
}


const getSeatStatusText = (seat) => {
  if (seat.occupied) {
    return 'OCUPADO'
  } else if (seat.status === 'reserved') {
    return 'RESERVADO'
  } else if (props.selectedSeatIds.includes(seat.id)) {
    return 'SELECCIONADO'
  } else {
    return 'DISPONIBLE'
  }
}

// Función para sincronizar animaciones de asientos seleccionados
const synchronizeSelectedSeatsAnimation = () => {
  const selectedSeatElements = document.querySelectorAll('.selected-seat-blink')
  
  selectedSeatElements.forEach(element => {
    element.classList.remove('selected-seat-blink')
    element.offsetHeight
    element.classList.add('selected-seat-blink')
  })
}

// Alternar selección de asiento
const toggleSeatSelection = (seat) => {
  if (seat.occupied || seat.status === 'reserved' || props.disabled) return

  const index = props.selectedSeatIds.indexOf(seat.id)
  let newSelectedIds

  if (index === -1) {
    // Si el asiento no está seleccionado, verificar si se puede seleccionar
    if (props.maxSelections > 0 && props.selectedSeatIds.length >= props.maxSelections) {
      return
    }

    // Seleccionar asiento
    newSelectedIds = [...props.selectedSeatIds, seat.id]
    emit('seat-selected', seat, newSelectedIds)
  } else {
    // Deseleccionar asiento
    newSelectedIds = props.selectedSeatIds.filter(id => id !== seat.id)
    emit('seat-deselected', seat, newSelectedIds)
  }

  // Emitir evento de cambio de selección con los asientos actualizados
  const updatedSelectedSeats = props.seats.filter(s => newSelectedIds.includes(s.id))
  emit('selection-change', updatedSelectedSeats)
  
  // Sincronizar animaciones después de un pequeño delay
  nextTick(() => {
    setTimeout(synchronizeSelectedSeatsAnimation, 10)
  })
}

// Abrir menú contextual con clic derecho
const handleContextMenu = (event, seat) => {
  event.preventDefault()
  emit('context-menu', event, seat)
}

// Obtener precio del boleto específico
const getSeatPrice = (seat) => {
  // Solo mostrar precio para asientos ocupados o reservados
  if (!seat.occupied && seat.status !== 'reserved') {
    return null
  }
  
  // Buscar el ticket correspondiente a este asiento
  const ticket = props.tickets.find(t => 
    t.seat && t.seat.seat_number === seat.number
  )
  
  // Retornar el precio del ticket si existe
  return ticket?.price || null
}

// Formatear precio con dos decimales
const formatPrice = (price) => {
  if (price === null || price === undefined) {
    return '0.00'
  }
  return parseFloat(price).toFixed(2)
}

// Obtener destino del boleto
const getSeatDestination = (seat) => {
  // Solo mostrar destino para asientos ocupados o reservados
  if (!seat.occupied && seat.status !== 'reserved') {
    return null
  }
  
  // Buscar el ticket correspondiente a este asiento
  const ticket = props.tickets.find(t => 
    t.seat && t.seat.seat_number === seat.number
  )
  
  if (!ticket) return null
  
  // Priorizar el destino personalizado del ticket
  if (ticket.destination && ticket.destination.trim()) {
    return ticket.destination
  }
  
  // Fallback al destino de la location si existe
  if (ticket.destination_location?.name) {
    return ticket.destination_location.name
  }
  
  return null
}
</script>

<style scoped>
.seat-container {
  margin-bottom: 0.5rem;
}

.seat-box {
  min-height: 3rem;
  height: auto;
  transition: all 0.3s ease;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.seat-box:hover:not([class*="bg-red"]) {
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

/* Nuevos estilos modernos */
.modern-seat-selected {
  animation: modern-seat-pulse 2s infinite;
  box-shadow: 0 0 20px rgba(59, 130, 246, 0.6);
}

@keyframes modern-seat-pulse {
  0%, 100% {
    transform: scale(1);
    box-shadow: 0 0 20px rgba(59, 130, 246, 0.6);
  }
  50% {
    transform: scale(1.05);
    box-shadow: 0 0 30px rgba(59, 130, 246, 0.8);
  }
}

/* Animaciones de hover mejoradas */
.seat-container:hover .seat-box {
  transform: translateY(-2px);
}

/* Transiciones suaves para todos los elementos interactivos */
.seat-box,
.seat-number div {
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Animación para asientos seleccionados - Sincronizada */
@keyframes selected-seat-blink {
  0% {
    background-color: rgb(239 246 255);
    border-color: rgb(96 165 250);
    box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.4);
    transform: scale(1);
  }
  25% {
    background-color: rgb(219 234 254);
    border-color: rgb(59 130 246);
    box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.6);
    transform: scale(1.01);
  }
  50% {
    background-color: rgb(147 197 253);
    border-color: rgb(37 99 235);
    box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.8);
    transform: scale(1.03);
  }
  75% {
    background-color: rgb(219 234 254);
    border-color: rgb(59 130 246);
    box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.6);
    transform: scale(1.01);
  }
  100% {
    background-color: rgb(239 246 255);
    border-color: rgb(96 165 250);
    box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.4);
    transform: scale(1);
  }
}

.selected-seat-blink {
  animation: selected-seat-blink 1.8s ease-in-out infinite;
  animation-fill-mode: both;
  animation-delay: 0s;
  animation-timing-function: ease-in-out;
  transition: all 0.1s ease;
}

/* Mejoras para dispositivos móviles */
@media (max-width: 639px) {
  .seat-number span {
    font-size: 0.6rem;
  }

  .seat-box .text-\[8px\] {
    font-size: 0.5rem;
  }

  .seat-box .text-\[9px\] { 
    font-size: 0.55rem;
  }

  .modern-seat-selected {
    animation: modern-seat-pulse-mobile 1.5s infinite;
  }
  
  @keyframes modern-seat-pulse-mobile {
    0%, 100% {
      transform: scale(1);
      box-shadow: 0 0 10px rgba(59, 130, 246, 0.5);
    }
    50% {
      transform: scale(1.02);
      box-shadow: 0 0 15px rgba(59, 130, 246, 0.7);
    }
  }

  .seat-container:hover .seat-box {
    transform: translateY(-1px);
  }
}

/* Estilos para impresión */
@media print {
  .center-aisle {
    display: none !important;
  }

  .seat-box {
    border: 1px solid #166534 !important;
    page-break-inside: avoid;
    box-shadow: none !important;
    animation: none !important;
    transform: none !important;
  }

  .seat-container {
    page-break-inside: avoid;
  }

  .md\:hidden {
    display: none !important;
  }
}

@media (prefers-reduced-motion: reduce) {
  .seat-box {
    transition: none;
  }
  
  .selected-seat-blink {
    animation: none;
  }
}

/* Contenedor para sincronizar todas las animaciones de asientos */
.seat-map-container {
  animation-play-state: running;
}
</style>