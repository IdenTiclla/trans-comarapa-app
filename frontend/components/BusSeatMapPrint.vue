<template>
  <div class="bus-seat-map-print">
    <div v-if="loading" class="flex justify-center py-6">
      <p>Cargando asientos...</p>
    </div>

    <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-lg p-3 sm:p-4 mb-4 shadow-sm">
      <p class="text-red-700 text-sm">{{ error }}</p>
    </div>

    <div v-else class="print-layout bg-white rounded-lg shadow-md overflow-hidden">
      <!-- Cabecera -->
      <div class="header border-b-2 border-green-600 pb-2 sm:pb-3 mb-2 sm:mb-4 bg-gradient-to-r from-green-50 to-white p-1.5 sm:p-2 md:p-3 overflow-hidden">
        <div class="flex flex-col md:flex-row md:items-start md:justify-between gap-1.5 sm:gap-2 md:gap-3">
          <!-- Logo y Nombre Empresa -->
          <div class="flex items-center flex-grow min-w-0">
            <div class="bus-icon mr-1.5 sm:mr-2 bg-green-100 p-1 sm:p-1.5 rounded-full flex-shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-7 w-7 sm:h-8 md:h-10 text-green-600" viewBox="0 0 20 20" fill="currentColor">
                <path d="M8 11V6.5m0 4.5v4.5m0-4.5h8m-8 0a4 4 0 110-8h8a4 4 0 110 8m-8 0a4 4 0 100 8h8a4 4 0 100-8" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" />
              </svg>
            </div>
            <div class="flex-shrink min-w-0">
              <h2 class="text-xs sm:text-sm md:text-base lg:text-lg font-bold text-green-700 tracking-tight truncate">TRANS COMARAPA</h2>
              <p class="text-[9px] sm:text-[10px] md:text-xs text-green-600 truncate">SINDICATO MIXTO DE TRANSPORTISTAS DE LARGA Y CORTA DISTANCIA</p>
              <p class="text-[9px] sm:text-[10px] md:text-xs text-green-600 truncate">"MANUEL MARÍA CABALLERO"</p>
            </div>
          </div>
          <!-- Origen/Destino -->
          <div class="w-full md:w-auto md:max-w-[200px] lg:max-w-[240px] mt-1.5 md:mt-0 flex-shrink-0">
            <div class="flex flex-col sm:grid sm:grid-cols-2 md:flex md:flex-col gap-1 sm:gap-1.5 bg-white rounded-md shadow-sm">
              <div class="border-2 border-green-600 p-0.5 sm:p-1 md:p-1.5 text-center rounded-md sm:rounded-tl-md sm:rounded-bl-md sm:rounded-r-none">
                <span class="text-[9px] sm:text-[10px] md:text-xs font-medium text-green-700">DE:</span>
                <p class="text-[10px] sm:text-[11px] md:text-xs font-bold break-words">{{ trip.route ? trip.route.origin : 'N/D' }}</p>
              </div>
              <div class="border-2 border-green-600 p-0.5 sm:p-1 md:p-1.5 text-center rounded-md sm:rounded-tr-md sm:rounded-br-md sm:rounded-l-none mt-1 sm:mt-0">
                <span class="text-[9px] sm:text-[10px] md:text-xs font-medium text-green-700">A:</span>
                <p class="text-[10px] sm:text-[11px] md:text-xs font-bold break-words">{{ trip.route ? trip.route.destination : 'N/D' }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Info Conductor/Placa y Fecha/Hora -->
        <div class="mt-2 sm:mt-3 grid grid-cols-1 md:grid-cols-2 gap-1.5 sm:gap-2 md:gap-3">
          <div class="bg-white p-1 sm:p-1.5 md:p-2 rounded-md shadow-sm border border-gray-100 text-[9px] sm:text-[10px] md:text-xs">
            <p class="mb-0.5"><span class="font-medium text-gray-600">Conductor:</span> <span class="font-semibold text-gray-800">{{ trip.driver ? trip.driver.firstname + ' ' + trip.driver.lastname : 'N/A' }}</span></p>
            <p class="mb-0.5"><span class="font-medium text-gray-600">Placa:</span> <span class="font-semibold text-gray-800">{{ trip.bus ? trip.bus.license_plate : 'N/A' }}</span></p>
            <p><span class="font-medium text-gray-600">Asistente:</span> <span class="font-semibold text-gray-800">{{ trip.assistant ? trip.assistant.firstname + ' ' + trip.assistant.lastname : 'N/A' }}</span></p>
          </div>
          <div class="grid grid-cols-3 gap-0.5 sm:gap-1 text-[9px] sm:text-[10px] md:text-xs">
            <div class="border-2 border-green-600 rounded-t-md text-center bg-green-600 py-0.5">
              <span class="text-white font-bold">DÍA</span>
            </div>
            <div class="border-2 border-green-600 rounded-t-md text-center bg-green-600 py-0.5">
              <span class="text-white font-bold">FECHA</span>
            </div>
            <div class="border-2 border-green-600 rounded-t-md text-center bg-green-600 py-0.5">
              <span class="text-white font-bold">HORA</span>
            </div>
            <div class="border-2 border-green-600 rounded-b-md p-0.5 text-center bg-white">
              <span class="font-medium">{{ getDayName(trip.trip_datetime) }}</span>
            </div>
            <div class="border-2 border-green-600 rounded-b-md p-0.5 text-center bg-white">
              <span class="font-medium">{{ formatShortDate(trip.trip_datetime) }}</span>
            </div>
            <div class="border-2 border-green-600 rounded-b-md p-0.5 text-center bg-white">
              <span class="font-medium">{{ trip.departure_time }}</span>
            </div>
          </div>
        </div>

        <!-- Planilla de Pasajeros -->
        <div class="mt-2 sm:mt-3 text-center">
          <h3 class="text-[10px] sm:text-xs md:text-sm lg:text-base font-bold text-green-700 bg-green-50 py-1 rounded-md shadow-sm inline-block px-1.5 sm:px-2">PLANILLA DE PASAJEROS</h3>
          <p v-if="trip.total_seats" class="mt-0.5 sm:mt-1 text-[9px] sm:text-[10px] md:text-xs text-gray-600">
            Bus con capacidad para {{ trip.total_seats }} pasajeros ({{ availableSeatsCount }} disponibles)
          </p>
        </div>
      </div>

      <!-- Mapa de asientos -->
      <div class="seat-map-container px-0.5 sm:px-1 md:px-2 pb-1 sm:pb-2">
        <!-- Indicador de pasillo para móviles -->
        <div class="md:hidden flex justify-center mb-1 sm:mb-1.5">
          <div class="bg-green-600 bg-opacity-10 px-1.5 sm:px-2 py-0.5 rounded-full text-green-700 font-bold text-[9px] sm:text-[10px]">
            PASILLO CENTRAL
          </div>
        </div>

        <div class="relative grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] md:gap-1 lg:gap-2">
          <!-- Columna izquierda -->
          <div class="left-column md:pr-1">
            <h3 class="text-[9px] sm:text-[10px] font-medium text-gray-500 mb-0.5 md:hidden">Lado Izquierdo</h3>
            <div class="grid grid-cols-2 gap-1 sm:gap-1.5">
              <div v-for="seat in leftColumnSeats" :key="seat.id" class="seat-container">
                <div class="seat-number flex items-center mb-0.5">
                  <span class="text-[9px] sm:text-[10px] font-semibold bg-green-100 text-green-800 px-1 py-0.5 rounded-full">{{ seat.number }}{{ seat.position === 'window' ? 'V' : 'P' }}</span>
                </div>
                <div
                  class="seat-box border-2 rounded-md p-1 sm:p-1.5 md:p-1.5 flex flex-col justify-around text-center"
                  :class="getSeatClass(seat)"
                  @click="toggleSeatSelection(seat)"
                  @contextmenu="handleContextMenu($event, seat)"
                >
                  <div class="flex justify-between items-center text-[8px] sm:text-[9px] px-0.5">
                    <span class="font-medium">Destino:</span>
                    <span class="font-medium">Bs.</span>
                  </div>
                  <div>
                    <span class="text-[8px] sm:text-[9px] font-bold px-1 py-0.5 rounded inline-block leading-tight" :class="{
                      'bg-red-100 text-red-800': seat.occupied,
                      'bg-yellow-100 text-yellow-800': seat.status === 'reserved',
                      'bg-blue-100 text-blue-800': selectedSeatIds.includes(seat.id),
                      'bg-gray-50 text-gray-400': !seat.occupied && seat.status !== 'reserved' && !selectedSeatIds.includes(seat.id)
                    }">
                      {{ 
                        seat.occupied ? 'OCUPADO' : 
                        seat.status === 'reserved' ? 'RESERVADO' : 
                        selectedSeatIds.includes(seat.id) ? 'SELECCIONADO' : 
                        'DISPONIBLE' 
                      }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Pasillo central con logo (solo visible en escritorio) -->
          <div class="center-aisle hidden md:flex flex-col justify-start items-center pt-8">
            <div class="rotate-90 bg-green-600 bg-opacity-10 px-1.5 py-1 rounded-full text-green-700 font-bold text-[10px] sm:text-xs md:text-sm tracking-widest whitespace-nowrap">
              PASILLO
            </div>
          </div>

          <!-- Columna derecha -->
          <div class="right-column mt-1 sm:mt-1.5 md:mt-0 md:pl-1">
            <h3 class="text-[9px] sm:text-[10px] font-medium text-gray-500 mb-0.5 md:hidden">Lado Derecho</h3>
            <div class="grid grid-cols-2 gap-1 sm:gap-1.5">
              <div v-for="seat in rightColumnSeats" :key="seat.id" class="seat-container">
                <div class="seat-number flex items-center mb-0.5">
                  <span class="text-[9px] sm:text-[10px] font-semibold bg-green-100 text-green-800 px-1 py-0.5 rounded-full">{{ seat.number }}{{ seat.position === 'window' ? 'V' : 'P' }}</span>
                </div>
                <div
                  class="seat-box border-2 rounded-md p-1 sm:p-1.5 md:p-1.5 flex flex-col justify-around text-center"
                  :class="getSeatClass(seat)"
                  @click="toggleSeatSelection(seat)"
                  @contextmenu="handleContextMenu($event, seat)"
                >
                  <div class="flex justify-between items-center text-[8px] sm:text-[9px] px-0.5">
                    <span class="font-medium">Destino:</span>
                    <span class="font-medium">Bs.</span>
                  </div>
                  <div>
                    <span class="text-[8px] sm:text-[9px] font-bold px-1 py-0.5 rounded inline-block leading-tight" :class="{
                      'bg-red-100 text-red-800': seat.occupied,
                      'bg-yellow-100 text-yellow-800': seat.status === 'reserved',
                      'bg-blue-100 text-blue-800': selectedSeatIds.includes(seat.id),
                      'bg-gray-50 text-gray-400': !seat.occupied && seat.status !== 'reserved' && !selectedSeatIds.includes(seat.id)
                    }">
                      {{ 
                        seat.occupied ? 'OCUPADO' : 
                        seat.status === 'reserved' ? 'RESERVADO' : 
                        selectedSeatIds.includes(seat.id) ? 'SELECCIONADO' : 
                        'DISPONIBLE' 
                      }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Leyenda -->
      <div class="legend mt-1.5 sm:mt-2 mb-1 px-1 sm:px-2 md:px-3">
        <div class="flex flex-wrap justify-center items-center gap-1 sm:gap-1.5 md:gap-2 bg-gray-50 py-1 sm:py-1.5 rounded-md shadow-sm">
          <div class="flex items-center">
            <div class="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-gray-50 border-2 border-green-600 rounded mr-0.5 sm:mr-1 flex items-center justify-center">
              <span class="text-[5px] sm:text-[6px] text-gray-400 font-bold">DISP</span>
            </div>
            <span class="text-[9px] sm:text-[10px] text-gray-700">Disponible</span>
          </div>
          <div class="flex items-center">
            <div class="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-blue-100 border-2 border-blue-600 rounded mr-0.5 sm:mr-1 flex items-center justify-center">
              <span class="text-[5px] sm:text-[6px] text-blue-800 font-bold">SEL</span>
            </div>
            <span class="text-[9px] sm:text-[10px] text-gray-700">Seleccionado</span>
          </div>
          <div class="flex items-center">
            <div class="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-yellow-100 border-2 border-yellow-600 rounded mr-0.5 sm:mr-1 flex items-center justify-center">
              <span class="text-[5px] sm:text-[6px] text-yellow-800 font-bold">RES</span>
            </div>
            <span class="text-[9px] sm:text-[10px] text-gray-700">Reservado</span>
          </div>
          <div class="flex items-center">
            <div class="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-red-100 border-2 border-red-600 rounded mr-0.5 sm:mr-1 flex items-center justify-center">
              <span class="text-[5px] sm:text-[6px] text-red-800 font-bold">OCU</span>
            </div>
            <span class="text-[9px] sm:text-[10px] text-gray-700">Ocupado</span>
          </div>
        </div>
      </div>

      <!-- Información de asientos seleccionados -->
      <div v-if="selectionEnabled && selectedSeats.length > 0" class="mt-1.5 sm:mt-2 mx-1 sm:mx-2 md:mx-3 mb-1 bg-blue-50 p-1 sm:p-1.5 md:p-2 rounded-lg border border-blue-100">
        <h4 class="text-[9px] sm:text-[10px] md:text-xs font-medium text-blue-800 mb-0.5 sm:mb-1 flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3 sm:h-3.5 md:h-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
            <path fill-rule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clip-rule="evenodd" />
          </svg>
          Asientos sel: <span class="ml-1 bg-blue-200 text-blue-800 px-1 sm:px-1.5 py-0.5 rounded-full text-[8px] sm:text-[9px]">{{ selectedSeats.length }}</span>
        </h4>
        <div class="flex flex-wrap gap-0.5 sm:gap-1">
          <span
            v-for="seat in selectedSeats"
            :key="seat.id"
            class="inline-flex items-center px-1.5 py-0.5 rounded-full text-[8px] sm:text-[9px] font-medium bg-blue-100 text-blue-800 shadow-sm"
          >
            {{ seat.number }}{{ seat.position === 'window' ? 'V' : 'P' }}
            <button
              @click="toggleSeatSelection(seat)"
              class="ml-0.5 text-blue-600 hover:text-blue-800 focus:outline-none"
              aria-label="Quitar asiento"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-2 w-2 sm:h-2.5" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
              </svg>
            </button>
          </span>
        </div>
      </div>
    </div>
    
    <!-- Menú contextual -->
    <div 
      v-if="showContextMenu && enableContextMenu" 
      class="fixed bg-white shadow-lg rounded-md border border-gray-200 py-1 z-50"
      :style="{ top: `${contextMenuPosition.y}px`, left: `${contextMenuPosition.x}px` }"
      @click.stop
    >
      <div class="px-3 py-1.5 text-xs text-gray-500 border-b border-gray-100">
        Asiento {{ selectedSeatForContext?.number || '' }}
      </div>
      
      <!-- Opciones para asientos disponibles -->
      <template v-if="!selectedSeatForContext?.status || selectedSeatForContext?.status === 'available'">
        <button 
          @click="sellTicket"
          class="w-full text-left block px-4 py-1.5 text-sm text-blue-600 hover:bg-gray-100"
        >
          Vender
        </button>
        <button 
          @click="reserveSeat"
          class="w-full text-left block px-4 py-1.5 text-sm text-yellow-600 hover:bg-gray-100"
        >
          Reservar
        </button>
      </template>
      
      <!-- Opción común: Ver detalles -->
      <button 
        v-if="selectedSeatForContext?.status === 'reserved' || selectedSeatForContext?.occupied || selectedSeatForContext?.status === 'occupied'"
        @click="viewSeatDetails"
        class="w-full text-left block px-4 py-1.5 text-sm text-gray-700 hover:bg-gray-100"
      >
        Ver detalles
      </button>
      
      <!-- Opciones para asientos reservados -->
      <template v-if="selectedSeatForContext?.status === 'reserved'">
        <button 
          @click="cancelReservation"
          class="w-full text-left block px-4 py-1.5 text-sm text-red-600 hover:bg-gray-100"
        >
          Cancelar reserva
        </button>
      </template>
      
      <!-- Opciones para asientos ocupados -->
      <template v-if="selectedSeatForContext?.occupied || selectedSeatForContext?.status === 'occupied'">
        <button 
          @click="changeSeat"
          class="w-full text-left block px-4 py-1.5 text-sm text-blue-600 hover:bg-gray-100"
        >
          Cambiar asiento
        </button>
        <button 
          @click="rescheduleTrip"
          class="w-full text-left block px-4 py-1.5 text-sm text-green-600 hover:bg-gray-100"
        >
          Reprogramar viaje
        </button>
      </template>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, nextTick } from 'vue'

const props = defineProps({
  trip: {
    type: Object,
    required: true
  },
  occupiedSeats: {
    type: Array,
    default: () => []
  },
  reserved_seat_numbers: {
    type: Array,
    default: () => []
  },
  initialSelectedSeats: {
    type: Array,
    default: () => []
  },
  selectionEnabled: {
    type: Boolean,
    default: true
  },
  maxSelections: {
    type: Number,
    default: 0 // 0 significa sin límite
  },
  disabled: {
    type: Boolean,
    default: false
  },
  enableContextMenu: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits([
  'seat-selected', 
  'seat-deselected', 
  'selection-change', 
  'cancel-reservation', 
  'view-details',
  'change-seat',
  'reschedule-trip',
  'sell-ticket',
  'reserve-seat'
])

const loading = ref(true)
const error = ref(null)
const seats = ref([])
const selectedSeatIds = ref(props.initialSelectedSeats.map(seat => seat.id))

// Estado para el menú contextual
const showContextMenu = ref(false)
const contextMenuPosition = ref({ x: 0, y: 0 })
const selectedSeatForContext = ref(null)

// Asientos seleccionados
const selectedSeats = computed(() => {
  return seats.value.filter(seat => selectedSeatIds.value.includes(seat.id))
})

// Asientos de la columna izquierda (1-21 ventana, 2-22 pasillo)
const leftColumnSeats = computed(() => {
  return seats.value.filter(seat => seat.column === 'left')
})

// Asientos de la columna derecha (23-43 ventana, 24-44 pasillo)
const rightColumnSeats = computed(() => {
  return seats.value.filter(seat => seat.column === 'right')
})

// Add computed property for available seats
const availableSeatsCount = computed(() => {
  if (!props.trip || typeof props.trip.total_seats !== 'number') return 0;
  const occupiedCount = props.trip.occupied_seat_numbers ? props.trip.occupied_seat_numbers.length : 0;
  return props.trip.total_seats - occupiedCount;
})

// Obtener clase CSS según el estado del asiento
const getSeatClass = (seat) => {
  if (seat.occupied) {
    return 'bg-red-50 border-red-400 cursor-not-allowed'
  } else if (seat.status === 'reserved') {
    return 'bg-yellow-50 border-yellow-400 cursor-not-allowed'
  } else if (selectedSeatIds.value.includes(seat.id)) {
    return 'bg-blue-50 border-blue-400 cursor-pointer shadow-sm selected-seat-blink'
  } else {
    return 'bg-white border-green-400 hover:bg-green-50 cursor-pointer'
  }
}

// Función para sincronizar animaciones de asientos seleccionados
const synchronizeSelectedSeatsAnimation = () => {
  // Obtener todos los elementos con la clase de animación
  const selectedSeatElements = document.querySelectorAll('.selected-seat-blink')
  
  // Reiniciar la animación para todos los elementos
  selectedSeatElements.forEach(element => {
    // Remover temporalmente la clase de animación
    element.classList.remove('selected-seat-blink')
    // Forzar un reflow para asegurar que la animación se detenga
    element.offsetHeight
    // Volver a agregar la clase para reiniciar la animación
    element.classList.add('selected-seat-blink')
  })
}

// Alternar selección de asiento
const toggleSeatSelection = (seat) => {
  if (seat.occupied || seat.status === 'reserved' || props.disabled) return

  const index = selectedSeatIds.value.indexOf(seat.id)

  if (index === -1) {
    // Si el asiento no está seleccionado, verificar si se puede seleccionar
    if (props.maxSelections > 0 && selectedSeatIds.value.length >= props.maxSelections) {
      // Si ya se alcanzó el límite de selecciones, no hacer nada
      return
    }

    // Seleccionar asiento
    selectedSeatIds.value.push(seat.id)
    emit('seat-selected', seat)
  } else {
    // Deseleccionar asiento
    selectedSeatIds.value.splice(index, 1)
    emit('seat-deselected', seat)
  }

  // Emitir evento de cambio de selección
  emit('selection-change', selectedSeats.value)
  
  // Sincronizar animaciones después de un pequeño delay para permitir que el DOM se actualice
  nextTick(() => {
    setTimeout(synchronizeSelectedSeatsAnimation, 10)
  })
}

// Cargar asientos
const loadSeats = async () => {
  loading.value = true
  error.value = null

  try {
    // No necesitamos hacer una llamada a la API porque ya tenemos los datos del viaje
    // Solo simulamos un breve retraso para mostrar el estado de carga
    await new Promise(resolve => setTimeout(resolve, 300))

    if (!props.trip || !props.trip.seats_layout) {
      console.warn('BusSeatMapPrint: props.trip.seats_layout no está disponible.');
      seats.value = [];
      loading.value = false;
      error.value = 'No se pudo cargar la información de los asientos desde el viaje.';
      return;
    }

    // Utilizar los asientos proporcionados por el backend a través de props.trip.seats_layout
    const backendSeats = props.trip.seats_layout;
    console.log('Estados de asientos:', backendSeats.map(seat => seat.status));
    console.log('Asientos reservados:', backendSeats.filter(seat => seat.status === 'reserved').length);
    
    // Obtener los tickets para identificar cuáles están en "pending" (reservados)
    // Ya que el backend no distingue entre 'pending' y 'confirmed', ambos los marca como 'occupied'
    const reservedSeatNumbers = props.reserved_seat_numbers || [];
    console.log('Números de asientos reservados:', reservedSeatNumbers);
    
    const generatedSeats = [];

    // Asumimos que el backend ya proporciona todos los detalles necesarios, 
    // incluyendo id (PK), seat_number, y status.
    // La lógica para determinar columna y posición (ventana/pasillo) 
    // puede necesitar ser adaptada o el backend podría proveerla.
    // Por ahora, intentaremos mantener la lógica de columna/posición del frontend si es posible,
    // o simplificarla si el backend no provee 'deck' o 'position' de forma consistente.

    for (const backendSeat of backendSeats) {
      // Determinar columna y posición basado en el número de asiento
      let column = 'unknown';
      let position = 'unknown'; // 'window' o 'aisle'
      const seatNumber = backendSeat.seat_number;
      
      // Verificar si el asiento está reservado (tiene un ticket en estado "pending")
      // En el backend actual, ambos pending y confirmed se marcan como 'occupied'
      // Así que usamos una lista de asientos reservados que pasamos como prop
      const isReserved = reservedSeatNumbers.includes(seatNumber);
      let status = backendSeat.status;
      
      // Si el asiento está ocupado pero también está en la lista de reservados,
      // lo marcamos como 'reserved' en lugar de 'occupied'
      if (status === 'occupied' && isReserved) {
        status = 'reserved';
      }

      // Define typicalSeatsPerRow. This value might eventually come from bus configuration data.
      // For common 2x2 layouts, this is 4.
      // For 2+1 layouts, this would be 3.
      // The logic below should adapt if this value changes.
      const typicalSeatsPerRow = 4; // Assuming 2 seats on left, 2 seats on right separated by aisle

      if (typicalSeatsPerRow > 0) {
        const idxInRowGroup = (seatNumber - 1) % typicalSeatsPerRow;

        // Determine column and position based on typical bus layout (2x2)
        if (idxInRowGroup < typicalSeatsPerRow / 2) { // First half of seats in a row group (e.g., 0, 1 for typicalSeatsPerRow=4)
          column = 'left';
          // For left column: odd is window, even is aisle
          if (seatNumber % 2 !== 0) { 
            position = 'window';
          } else { 
            position = 'aisle';
          }
        } else { // Second half of seats in a row group (e.g., 2, 3 for typicalSeatsPerRow=4)
          column = 'right';
          // For right column: odd is aisle, even is window
          if (seatNumber % 2 !== 0) { 
            position = 'aisle';
          } else { 
            position = 'window';
          }
        }
      } else {
        console.warn(`BusSeatMapPrint: typicalSeatsPerRow is ${typicalSeatsPerRow}. Cannot determine column/position for seat ${seatNumber}.`);
        // column and position will remain 'unknown' as initialized
      }
      
      // Si el backendSeat tiene 'deck', usarlo. Si no, el frontend no puede determinarlo fácilmente.
      const seatDeck = backendSeat.deck || 'main'; 

      generatedSeats.push({
        id: backendSeat.id, // ID Primario del backend
        number: backendSeat.seat_number, // Número de asiento del backend
        status: status, // 'occupied', 'reserved', o 'available'
        occupied: status === 'occupied', // Mantener 'occupied' para compatibilidad con getSeatClass
        position: position, // Inferido o del backend si disponible
        column: column,     // Inferido o del backend si disponible
        deck: seatDeck      // Del backend, o default
      });
    }

    seats.value = generatedSeats.sort((a, b) => a.number - b.number); // Asegurar orden por número de asiento

  } catch (err) {
    console.error('Error al procesar los asientos:', err)
    error.value = 'No se pudieron procesar los asientos. Intente nuevamente.'
    seats.value = [];
  } finally {
    loading.value = false
  }
}

// Obtener nombre del día
const getDayName = (dateString) => {
  if (!dateString) return 'Día no disponible';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return 'Fecha inválida';
  return new Intl.DateTimeFormat('es-ES', { weekday: 'long' }).format(date);
}

// Formatear fecha corta
const formatShortDate = (dateString) => {
  if (!dateString) return 'Fecha no disponible';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return 'Fecha inválida';
  return new Intl.DateTimeFormat('es-ES', { day: '2-digit', month: '2-digit', year: '2-digit' }).format(date);
}

// Observar cambios en las propiedades
watch(() => props.trip, (newTrip) => {
  if (newTrip && newTrip.seats_layout) {
    loadSeats();
  }
}, { deep: true, immediate: true }); // immediate: true para cargar al inicio

watch(() => props.occupiedSeats, () => {
  // Esta prop podría volverse obsoleta si props.trip.seats_layout es la única fuente de verdad
  // Si se mantiene, y se actualiza desde fuera, forzaría un reload de asientos 
  // pero loadSeats ahora depende de props.trip.seats_layout
  // loadSeats() 
}, { deep: true });

watch(() => props.initialSelectedSeats, (newVal) => {
  selectedSeatIds.value = newVal.map(seat => seat.id) // Asegurarse que esto use el ID PK
})

// Añadir watcher para reserved_seat_numbers
watch(() => props.reserved_seat_numbers, () => {
  // Recargar los asientos cuando cambia la lista de asientos reservados
  if (props.trip && props.trip.seats_layout) {
    loadSeats();
  }
}, { deep: true });

// Abrir menú contextual con clic derecho
const handleContextMenu = (event, seat) => {
  if (!props.enableContextMenu) return
  
  // Mostrar menú contextual para todos los asientos
  event.preventDefault()
  showContextMenu.value = true
  contextMenuPosition.value = { x: event.clientX, y: event.clientY }
  selectedSeatForContext.value = seat
}

// Cerrar menú contextual
const closeContextMenu = () => {
  showContextMenu.value = false
  selectedSeatForContext.value = null
}

// Cancelar reserva
const cancelReservation = () => {
  if (selectedSeatForContext.value) {
    emit('cancel-reservation', selectedSeatForContext.value)
    closeContextMenu()
  }
}

// Ver detalles del asiento
const viewSeatDetails = () => {
  if (selectedSeatForContext.value) {
    emit('view-details', selectedSeatForContext.value)
    closeContextMenu()
  }
}

// Cambiar asiento
const changeSeat = () => {
  if (selectedSeatForContext.value) {
    emit('change-seat', selectedSeatForContext.value)
    closeContextMenu()
  }
}

// Reprogramar viaje
const rescheduleTrip = () => {
  if (selectedSeatForContext.value) {
    emit('reschedule-trip', selectedSeatForContext.value)
    closeContextMenu()
  }
}

// Vender boleto
const sellTicket = () => {
  if (selectedSeatForContext.value) {
    emit('sell-ticket', selectedSeatForContext.value)
    closeContextMenu()
  }
}

// Reservar asiento
const reserveSeat = () => {
  if (selectedSeatForContext.value) {
    // Verificar si el asiento del menú contextual está entre los seleccionados globalmente (selectedSeats)
    // selectedSeats es un computed property que obtiene los asientos de selectedSeatIds
    const isContextSeatInGlobalSelection = selectedSeatIds.value.includes(selectedSeatForContext.value.id);

    if (isContextSeatInGlobalSelection && selectedSeats.value.length > 0) {
      // Si el asiento del menú contextual está en la selección global y hay asientos seleccionados,
      // emitir todos los asientos seleccionados globalmente.
      // Asegurarse de que todos los asientos emitidos estén disponibles para reserva.
      const availableSelectedSeats = selectedSeats.value.filter(seat => 
        !seat.occupied && seat.status !== 'reserved' && seat.status !== 'occupied'
      );
      if (availableSelectedSeats.length > 0) {
        emit('reserve-seat', [...availableSelectedSeats]);
      } else {
        // Si ninguno de los seleccionados está disponible, solo emitir el del contexto (si está disponible)
        if (!selectedSeatForContext.value.occupied && selectedSeatForContext.value.status !== 'reserved' && selectedSeatForContext.value.status !== 'occupied') {
          emit('reserve-seat', [selectedSeatForContext.value]);
        } else {
          // Aquí podrías emitir un error o no hacer nada si ni el asiento del contexto está disponible
          console.warn('El asiento del contexto tampoco está disponible para reservar');
        }
      }
    } else {
      // Si no hay selección global o el asiento del menú contextual no está en ella,
      // emitir solo el asiento del menú contextual (si está disponible).
      if (!selectedSeatForContext.value.occupied && selectedSeatForContext.value.status !== 'reserved' && selectedSeatForContext.value.status !== 'occupied') {
        emit('reserve-seat', [selectedSeatForContext.value]);
      } else {
         console.warn('El asiento del contexto no está disponible para reservar');
      }
    }
    closeContextMenu();
  }
};

// Cerrar el menú cuando se hace clic fuera
onMounted(() => {
  document.addEventListener('click', (event) => {
    if (showContextMenu.value) {
      closeContextMenu()
    }
  })
})
</script>

<style scoped>
.print-layout {
  max-width: 900px;
  margin: 0 auto;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

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

/* Animación para asientos seleccionados - Sincronizada */
@keyframes selected-seat-blink {
  0% {
    background-color: rgb(239 246 255); /* bg-blue-50 */
    border-color: rgb(96 165 250); /* border-blue-400 */
    box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.4);
    transform: scale(1);
  }
  25% {
    background-color: rgb(219 234 254); /* bg-blue-100 */
    border-color: rgb(59 130 246); /* border-blue-500 */
    box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.6);
    transform: scale(1.01);
  }
  50% {
    background-color: rgb(147 197 253); /* bg-blue-300 */
    border-color: rgb(37 99 235); /* border-blue-600 */
    box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.8);
    transform: scale(1.03);
  }
  75% {
    background-color: rgb(219 234 254); /* bg-blue-100 */
    border-color: rgb(59 130 246); /* border-blue-500 */
    box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.6);
    transform: scale(1.01);
  }
  100% {
    background-color: rgb(239 246 255); /* bg-blue-50 */
    border-color: rgb(96 165 250); /* border-blue-400 */
    box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.4);
    transform: scale(1);
  }
}

/* Animación global sincronizada para todos los asientos seleccionados */
.selected-seat-blink {
  animation: selected-seat-blink 1.8s ease-in-out infinite;
  /* Usar animation-fill-mode para mantener consistencia */
  animation-fill-mode: both;
  /* Sincronizar todas las animaciones al mismo tiempo */
  animation-delay: 0s;
  /* Asegurar que todas las animaciones usen el mismo timeline */
  animation-timing-function: ease-in-out;
  /* Hacer la transición más suave */
  transition: all 0.1s ease;
}

/* Animación legacy mantenida para compatibilidad */
@keyframes pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.5);
  }
  70% {
    box-shadow: 0 0 0 6px rgba(59, 130, 246, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(59, 130, 246, 0);
  }
}

.bg-blue-50.border-blue-100 {
  animation: pulse 2s infinite;
}

/* Mejoras para dispositivos móviles */
@media (max-width: 639px) {
  .print-layout {
    max-width: 100%;
    padding: 0;
  }

  .seat-number span {
    font-size: 0.6rem;
  }

  .seat-box .text-\[8px\] {
    font-size: 0.5rem;
  }
   .seat-box .text-\[9px\] { 
    font-size: 0.55rem;
  }

  .header h2 {
    font-size: 0.8rem;
  }

  .header p {
    font-size: 0.55rem;
  }
}

/* Estilos para impresión */
@media print {
  .legend,
  button,
  .center-aisle {
    display: none !important;
  }

  .print-layout {
    padding: 0;
    max-width: 100%;
    box-shadow: none;
  }

  .seat-box {
    border: 1px solid #166534 !important;
    page-break-inside: avoid;
    box-shadow: none !important;
    animation: none !important;
    transform: none !important;
  }

  .header {
    background: none !important;
    border-bottom: 2px solid #166534 !important;
  }

  html, body {
    width: 100%;
    height: 100%;
    margin: 0;
    padding: 0;
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
  .bg-blue-50.border-blue-100 {
    animation: none;
  }
  .selected-seat-blink {
    animation: none;
  }
}

/* Contenedor para sincronizar todas las animaciones de asientos */
.seat-map-container {
  /* Forzar repaint para sincronizar animaciones */
  animation-play-state: running;
}
</style>
