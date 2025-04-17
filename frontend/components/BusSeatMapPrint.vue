<template>
  <div class="bus-seat-map-print">
    <div v-if="loading" class="flex justify-center py-6">
      <div class="animate-pulse flex space-x-4">
        <div class="rounded-full bg-gray-200 h-10 w-10"></div>
        <div class="flex-1 space-y-4 py-1">
          <div class="h-4 bg-gray-200 rounded w-3/4"></div>
          <div class="space-y-2">
            <div class="h-4 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    </div>

    <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-lg p-4 mb-4 shadow-sm">
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

    <div v-else class="print-layout bg-white rounded-lg shadow-md overflow-hidden">
      <!-- Cabecera -->
      <div class="header border-b-2 border-green-600 pb-4 mb-6 bg-gradient-to-r from-green-50 to-white p-4 overflow-hidden">
        <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div class="flex items-center">
            <div class="bus-icon mr-3 bg-green-100 p-2 rounded-full">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 text-green-600" viewBox="0 0 20 20" fill="currentColor">
                <path d="M8 11V6.5m0 4.5v4.5m0-4.5h8m-8 0a4 4 0 110-8h8a4 4 0 110 8m-8 0a4 4 0 100 8h8a4 4 0 100-8" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" />
              </svg>
            </div>
            <div>
              <h2 class="text-2xl font-bold text-green-700 tracking-tight">TRANS COMARAPA</h2>
              <p class="text-xs text-green-600">SINDICATO MIXTO DE TRANSPORTISTAS DE LARCA</p>
              <p class="text-xs text-green-600">"CORONEL MANUEL MARÍA CABALLERO"</p>
            </div>
          </div>
          <div class="md:w-1/3">
            <div class="grid grid-cols-2 gap-2 bg-white rounded-md shadow-sm">
              <div class="border-2 border-green-600 p-2 text-center rounded-tl-md rounded-bl-md">
                <span class="text-xs font-medium text-green-700">DE:</span>
                <p class="text-sm font-bold">{{ trip.route ? trip.route.origin : 'No definido' }}</p>
              </div>
              <div class="border-2 border-green-600 p-2 text-center rounded-tr-md rounded-br-md">
                <span class="text-xs font-medium text-green-700">A:</span>
                <p class="text-sm font-bold">{{ trip.route ? trip.route.destination : 'No definido' }}</p>
              </div>
            </div>
          </div>
        </div>

        <div class="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="bg-white p-3 rounded-md shadow-sm border border-gray-100">
            <p class="text-sm mb-1"><span class="font-medium text-gray-600">Conductor:</span> <span class="font-semibold text-gray-800">{{ trip.driver ? trip.driver.name : 'No asignado' }}</span></p>
            <p class="text-sm"><span class="font-medium text-gray-600">Placa:</span> <span class="font-semibold text-gray-800">{{ trip.bus ? trip.bus.plate : 'No asignado' }}</span></p>
          </div>
          <div class="grid grid-cols-3 gap-2">
            <div class="border-2 border-green-600 rounded-t-md text-center bg-green-600">
              <span class="text-xs text-white font-bold">DÍA</span>
            </div>
            <div class="border-2 border-green-600 rounded-t-md text-center bg-green-600">
              <span class="text-xs text-white font-bold">FECHA</span>
            </div>
            <div class="border-2 border-green-600 rounded-t-md text-center bg-green-600">
              <span class="text-xs text-white font-bold">HORA</span>
            </div>
            <div class="border-2 border-green-600 rounded-b-md p-1 text-center bg-white">
              <span class="text-sm font-medium">{{ getDayName(trip.departure_date) }}</span>
            </div>
            <div class="border-2 border-green-600 rounded-b-md p-1 text-center bg-white">
              <span class="text-sm font-medium">{{ formatShortDate(trip.departure_date) }}</span>
            </div>
            <div class="border-2 border-green-600 rounded-b-md p-1 text-center bg-white">
              <span class="text-sm font-medium">{{ trip.departure_time }}</span>
            </div>
          </div>
        </div>

        <div class="mt-6 text-center">
          <h3 class="text-xl font-bold text-green-700 bg-green-50 py-2 rounded-md shadow-sm inline-block px-6">PLANILLA DE PASAJEROS</h3>
          <p v-if="trip.total_seats" class="mt-2 text-sm text-gray-600">Bus con capacidad para {{ trip.total_seats }} pasajeros</p>
        </div>
      </div>

      <!-- Mapa de asientos -->
      <div class="seat-map-container px-2 sm:px-4 pb-4">
        <!-- Indicador de pasillo para móviles -->
        <div class="md:hidden flex justify-center mb-4">
          <div class="bg-green-600 bg-opacity-10 px-4 py-2 rounded-full text-green-700 font-bold text-sm">
            PASILLO CENTRAL
          </div>
        </div>

        <div class="relative grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-6">
          <!-- Columna izquierda -->
          <div class="left-column">
            <h3 class="text-sm font-medium text-gray-500 mb-2 md:hidden">Lado Izquierdo</h3>
            <div class="grid grid-cols-2 gap-2 sm:gap-3">
              <div v-for="seat in leftColumnSeats" :key="seat.id" class="seat-container">
                <div class="seat-number flex items-center mb-1">
                  <span class="text-xs font-semibold bg-green-100 text-green-800 px-2 py-0.5 rounded-full">{{ seat.number }}{{ seat.position === 'window' ? ' V' : ' P' }}</span>
                </div>
                <div
                  class="seat-box border-2 rounded-md p-2 sm:p-3 transition-all duration-200 transform hover:scale-105"
                  :class="getSeatClass(seat)"
                  @click="toggleSeatSelection(seat)"
                >
                  <div class="flex justify-between items-center">
                    <span class="text-xs font-medium">Destino:</span>
                    <span class="text-xs font-medium">Bs.</span>
                  </div>
                  <div class="text-center">
                    <span class="text-xs font-bold px-2 py-1 rounded inline-block" :class="{
                      'bg-red-100 text-red-800': seat.occupied,
                      'bg-blue-100 text-blue-800': selectedSeatIds.includes(seat.id),
                      'bg-gray-50 text-gray-400': !seat.occupied && !selectedSeatIds.includes(seat.id)
                    }">
                      {{ seat.occupied ? 'OCUPADO' : selectedSeatIds.includes(seat.id) ? 'SELECCIONADO' : 'DISPONIBLE' }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Pasillo central con logo (solo visible en escritorio) -->
          <div class="center-aisle hidden md:flex absolute left-1/2 transform -translate-x-1/2 h-full flex-col justify-center items-center">
            <div class="h-full flex items-center">
              <div class="rotate-90 bg-green-600 bg-opacity-10 px-4 py-2 rounded-full text-green-700 font-bold text-xl tracking-widest">
                PASILLO
              </div>
            </div>
          </div>

          <!-- Columna derecha -->
          <div class="right-column mt-6 md:mt-0">
            <h3 class="text-sm font-medium text-gray-500 mb-2 md:hidden">Lado Derecho</h3>
            <div class="grid grid-cols-2 gap-2 sm:gap-3">
              <div v-for="seat in rightColumnSeats" :key="seat.id" class="seat-container">
                <div class="seat-number flex items-center mb-1">
                  <span class="text-xs font-semibold bg-green-100 text-green-800 px-2 py-0.5 rounded-full">{{ seat.number }}{{ seat.position === 'window' ? ' V' : ' P' }}</span>
                </div>
                <div
                  class="seat-box border-2 rounded-md p-2 sm:p-3 transition-all duration-200 transform hover:scale-105"
                  :class="getSeatClass(seat)"
                  @click="toggleSeatSelection(seat)"
                >
                  <div class="flex justify-between items-center">
                    <span class="text-xs font-medium">Destino:</span>
                    <span class="text-xs font-medium">Bs.</span>
                  </div>
                  <div class="text-center">
                    <span class="text-xs font-bold px-2 py-1 rounded inline-block" :class="{
                      'bg-red-100 text-red-800': seat.occupied,
                      'bg-blue-100 text-blue-800': selectedSeatIds.includes(seat.id),
                      'bg-gray-50 text-gray-400': !seat.occupied && !selectedSeatIds.includes(seat.id)
                    }">
                      {{ seat.occupied ? 'OCUPADO' : selectedSeatIds.includes(seat.id) ? 'SELECCIONADO' : 'DISPONIBLE' }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Leyenda -->
      <div class="legend mt-6 mb-4 px-2 sm:px-4">
        <div class="flex flex-wrap justify-center items-center gap-3 sm:gap-6 bg-gray-50 py-3 rounded-md shadow-sm">
          <div class="flex items-center">
            <div class="w-5 h-5 bg-gray-50 border-2 border-green-600 rounded mr-2 flex items-center justify-center">
              <span class="text-[8px] text-gray-400 font-bold">DISP</span>
            </div>
            <span class="text-xs sm:text-sm text-gray-700">Disponible</span>
          </div>
          <div class="flex items-center">
            <div class="w-5 h-5 bg-blue-100 border-2 border-blue-600 rounded mr-2 flex items-center justify-center">
              <span class="text-[8px] text-blue-800 font-bold">SEL</span>
            </div>
            <span class="text-xs sm:text-sm text-gray-700">Seleccionado</span>
          </div>
          <div class="flex items-center">
            <div class="w-5 h-5 bg-red-100 border-2 border-red-600 rounded mr-2 flex items-center justify-center">
              <span class="text-[8px] text-red-800 font-bold">OCU</span>
            </div>
            <span class="text-xs sm:text-sm text-gray-700">Ocupado</span>
          </div>
        </div>
      </div>

      <!-- Información de asientos seleccionados -->
      <div v-if="selectionEnabled && selectedSeats.length > 0" class="mt-6 mx-2 sm:mx-4 mb-4 bg-blue-50 p-3 sm:p-4 rounded-lg border border-blue-100">
        <h4 class="text-sm font-medium text-blue-800 mb-2 flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
            <path fill-rule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clip-rule="evenodd" />
          </svg>
          Asientos seleccionados: <span class="ml-1 bg-blue-200 text-blue-800 px-2 py-0.5 rounded-full text-xs">{{ selectedSeats.length }}</span>
        </h4>
        <div class="flex flex-wrap gap-2">
          <span
            v-for="seat in selectedSeats"
            :key="seat.id"
            class="inline-flex items-center px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium bg-blue-100 text-blue-800 shadow-sm"
          >
            {{ seat.number }}{{ seat.position === 'window' ? 'V' : 'P' }}
            <button
              @click="toggleSeatSelection(seat)"
              class="ml-1 sm:ml-2 text-blue-600 hover:text-blue-800 focus:outline-none"
              aria-label="Quitar asiento"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3 sm:h-4 sm:w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
              </svg>
            </button>
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'

const props = defineProps({
  trip: {
    type: Object,
    required: true
  },
  occupiedSeats: {
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
  }
})

const emit = defineEmits(['seat-selected', 'seat-deselected', 'selection-change'])

const loading = ref(true)
const error = ref(null)
const seats = ref([])
const selectedSeatIds = ref(props.initialSelectedSeats.map(seat => seat.id))

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

// Obtener clase CSS según el estado del asiento
const getSeatClass = (seat) => {
  if (seat.occupied) {
    return 'bg-red-50 border-red-400 cursor-not-allowed'
  } else if (selectedSeatIds.value.includes(seat.id)) {
    return 'bg-blue-50 border-blue-400 cursor-pointer shadow-sm'
  } else {
    return 'bg-white border-green-400 hover:bg-green-50 cursor-pointer'
  }
}

// Alternar selección de asiento
const toggleSeatSelection = (seat) => {
  if (seat.occupied || props.disabled) return

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
}

// Cargar asientos
const loadSeats = async () => {
  loading.value = true
  error.value = null

  try {
    // No necesitamos hacer una llamada a la API porque ya tenemos los datos del viaje
    // Solo simulamos un breve retraso para mostrar el estado de carga
    await new Promise(resolve => setTimeout(resolve, 300))

    // Generar asientos según el diseño de la planilla y el número total de asientos
    const generatedSeats = []

    // Obtener el número total de asientos del bus
    const totalSeats = props.trip && props.trip.total_seats ? props.trip.total_seats : 44 // Por defecto 44 asientos

    // Calcular el número de filas necesarias (cada fila tiene 4 asientos)
    const totalRows = Math.ceil(totalSeats / 4)

    // Columna izquierda (asientos 1V, 2P, 5V, 6P, etc.)
    // Según la planilla, los asientos van: 1V, 2P, 5V, 6P, 9V, 10P, etc.
    for (let i = 0; i < totalRows; i++) {
      // Asiento de ventana (números impares: 1, 5, 9, 13, 17, 21, 25, 29, 33, 37, 41)
      const windowSeatNumber = i * 4 + 1
      // Asiento de pasillo (números pares: 2, 6, 10, 14, 18, 22, 26, 30, 34, 38, 42)
      const aisleSeatNumber = i * 4 + 2

      // Verificar si estos asientos están dentro del rango total de asientos
      if (windowSeatNumber <= totalSeats) {
        // Determinar si los asientos están ocupados usando los datos reales
        const windowSeatOccupied = props.trip && props.trip.occupied_seats ?
          props.trip.occupied_seats.includes(windowSeatNumber) :
          props.occupiedSeats.includes(windowSeatNumber)

        // Asiento de ventana
        generatedSeats.push({
          id: windowSeatNumber,
          number: windowSeatNumber,
          position: 'window',
          column: 'left',
          occupied: windowSeatOccupied
        })
      }

      if (aisleSeatNumber <= totalSeats) {
        // Determinar si los asientos están ocupados usando los datos reales
        const aisleSeatOccupied = props.trip && props.trip.occupied_seats ?
          props.trip.occupied_seats.includes(aisleSeatNumber) :
          props.occupiedSeats.includes(aisleSeatNumber)

        // Asiento de pasillo
        generatedSeats.push({
          id: aisleSeatNumber,
          number: aisleSeatNumber,
          position: 'aisle',
          column: 'left',
          occupied: aisleSeatOccupied
        })
      }
    }

    // Columna derecha (asientos 3V, 4P, 7V, 8P, etc.)
    // Según la planilla, los asientos van: 3V, 4P, 7V, 8P, 11V, 12P, etc.
    for (let i = 0; i < totalRows; i++) {
      // Asiento de ventana (números impares: 3, 7, 11, 15, 19, 23, 27, 31, 35, 39, 43)
      const windowSeatNumber = i * 4 + 3
      // Asiento de pasillo (números pares: 4, 8, 12, 16, 20, 24, 28, 32, 36, 40, 44)
      const aisleSeatNumber = i * 4 + 4

      // Verificar si estos asientos están dentro del rango total de asientos
      if (windowSeatNumber <= totalSeats) {
        // Determinar si los asientos están ocupados usando los datos reales
        const windowSeatOccupied = props.trip && props.trip.occupied_seats ?
          props.trip.occupied_seats.includes(windowSeatNumber) :
          props.occupiedSeats.includes(windowSeatNumber)

        // Asiento de ventana
        generatedSeats.push({
          id: windowSeatNumber,
          number: windowSeatNumber,
          position: 'window',
          column: 'right',
          occupied: windowSeatOccupied
        })
      }

      if (aisleSeatNumber <= totalSeats) {
        // Determinar si los asientos están ocupados usando los datos reales
        const aisleSeatOccupied = props.trip && props.trip.occupied_seats ?
          props.trip.occupied_seats.includes(aisleSeatNumber) :
          props.occupiedSeats.includes(aisleSeatNumber)

        // Asiento de pasillo
        generatedSeats.push({
          id: aisleSeatNumber,
          number: aisleSeatNumber,
          position: 'aisle',
          column: 'right',
          occupied: aisleSeatOccupied
        })
      }
    }

    seats.value = generatedSeats

  } catch (err) {
    console.error('Error al cargar los asientos:', err)
    error.value = 'No se pudieron cargar los asientos. Intente nuevamente.'
  } finally {
    loading.value = false
  }
}

// Obtener nombre del día
const getDayName = (dateString) => {
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('es-ES', { weekday: 'long' }).format(date)
}

// Formatear fecha corta
const formatShortDate = (dateString) => {
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('es-ES', { day: '2-digit', month: '2-digit', year: '2-digit' }).format(date)
}

// Observar cambios en las propiedades
watch(() => props.trip, () => {
  loadSeats()
})

watch(() => props.occupiedSeats, () => {
  loadSeats()
})

watch(() => props.initialSelectedSeats, (newVal) => {
  selectedSeatIds.value = newVal.map(seat => seat.id)
})

// Cargar asientos al montar el componente
onMounted(() => {
  loadSeats()
})
</script>

<style scoped>
.print-layout {
  max-width: 900px;
  margin: 0 auto;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.seat-container {
  margin-bottom: 0.75rem;
}

.seat-box {
  min-height: 4.5rem;
  height: 4.5rem;
  transition: all 0.3s ease;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.seat-box:hover:not([class*="bg-red"]) {
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

/* Animación para asientos seleccionados */
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

.bg-blue-50 {
  animation: pulse 2s infinite;
}

/* Mejoras para dispositivos móviles */
@media (max-width: 768px) {
  .print-layout {
    max-width: 100%;
    padding: 0;
  }

  .seat-box {
    min-height: 3.5rem;
    height: 3.5rem;
    padding: 0.5rem !important;
  }

  .seat-number span {
    font-size: 0.65rem;
  }

  /* Reducir el tamaño de los textos en móviles */
  .seat-box .text-xs {
    font-size: 0.65rem;
  }

  /* Ajustar el espacio entre filas de asientos */
  .seat-container {
    margin-bottom: 0.5rem;
  }

  /* Mejorar la visualización de la cabecera en móviles */
  .header h2 {
    font-size: 1.25rem;
  }

  .header p {
    font-size: 0.65rem;
  }
}

/* Ajustes para tablets */
@media (min-width: 769px) and (max-width: 1024px) {
  .seat-box {
    min-height: 4rem;
    height: 4rem;
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
  }

  .header {
    background: none !important;
    border-bottom: 2px solid #166534 !important;
  }

  /* Asegurar que todo el contenido se imprima */
  html, body {
    width: 100%;
    height: 100%;
    margin: 0;
    padding: 0;
  }

  /* Ajustar el tamaño de los asientos para impresión */
  .seat-container {
    page-break-inside: avoid;
  }

  /* Ocultar elementos innecesarios para impresión */
  .md\:hidden {
    display: none !important;
  }
}

/* Mejoras de accesibilidad */
@media (prefers-reduced-motion: reduce) {
  .seat-box {
    transition: none;
  }

  .bg-blue-50 {
    animation: none;
  }
}
</style>
