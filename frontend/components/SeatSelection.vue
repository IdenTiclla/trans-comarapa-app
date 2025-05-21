<template>
  <div class="seat-selection">
    <div class="bg-white shadow-md rounded-lg overflow-hidden">
      <div class="px-6 py-4 border-b border-gray-200">
        <h3 class="text-lg font-medium text-gray-900">Selección de Asientos</h3>
      </div>

      <div class="p-6">
        <div v-if="!trip" class="text-center py-4">
          <p class="text-gray-500">Seleccione un viaje para ver los asientos disponibles</p>
        </div>

        <div v-else>
          <div class="mb-6">
            <div class="flex flex-col sm:flex-row sm:justify-between sm:items-center">
              <div>
                <h4 class="text-base font-medium text-gray-900">{{ trip.route.origin }} → {{ trip.route.destination }}</h4>
                <p class="text-sm text-gray-500">{{ formatDate(trip.trip_datetime) }} - {{ formatTime(trip.departure_time, trip.trip_datetime) }}</p>
              </div>
              <div class="mt-2 sm:mt-0">
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {{ trip.available_seats }} asientos disponibles
                </span>
              </div>
            </div>
          </div>

          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-1">Cantidad de asientos</label>
            <div class="flex items-center">
              <button
                @click="decrementQuantity"
                class="p-2 rounded-l border border-gray-300 bg-gray-50 text-gray-500 hover:bg-gray-100"
                :disabled="quantity <= 1"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clip-rule="evenodd" />
                </svg>
              </button>
              <input
                type="number"
                v-model="quantity"
                min="1"
                :max="trip.available_seats"
                class="w-16 text-center border-t border-b border-gray-300 py-2"
                @change="validateQuantity"
              />
              <button
                @click="incrementQuantity"
                class="p-2 rounded-r border border-gray-300 bg-gray-50 text-gray-500 hover:bg-gray-100"
                :disabled="quantity >= trip.available_seats"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd" />
                </svg>
              </button>
            </div>
          </div>

          <div class="mb-6">
            <BusSeatMapPrint
              :trip="trip"
              :occupied-seats="occupiedSeats"
              :initial-selected-seats="selectedSeats"
              :selection-enabled="true"
              :max-selections="quantity"
              @seat-selected="handleSeatSelected"
              @seat-deselected="handleSeatDeselected"
              @selection-change="handleSelectionChange"
            />
          </div>

          <div class="flex justify-end">
            <button
              @click="confirmSelection"
              class="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              :disabled="selectedSeats.length !== quantity"
            >
              Confirmar selección
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import BusSeatMapPrint from './BusSeatMapPrint.vue'

const props = defineProps({
  trip: {
    type: Object,
    default: null
  },
  initialSelectedSeats: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['selection-confirmed'])

// Estado
const quantity = ref(props.initialSelectedSeats.length || 1)
const selectedSeats = ref(props.initialSelectedSeats || [])
const occupiedSeats = ref([])

// Validar cantidad
const validateQuantity = () => {
  if (!props.trip) return

  // Asegurarse de que la cantidad sea un número válido
  let value = parseInt(quantity.value)
  if (isNaN(value) || value < 1) {
    value = 1
  } else if (value > props.trip.available_seats) {
    value = props.trip.available_seats
  }

  quantity.value = value

  // Ajustar selección si es necesario
  if (selectedSeats.value.length > value) {
    selectedSeats.value = selectedSeats.value.slice(0, value)
  }
}

// Incrementar cantidad
const incrementQuantity = () => {
  if (quantity.value < props.trip.available_seats) {
    quantity.value++
  }
}

// Decrementar cantidad
const decrementQuantity = () => {
  if (quantity.value > 1) {
    quantity.value--

    // Ajustar selección si es necesario
    if (selectedSeats.value.length > quantity.value) {
      selectedSeats.value = selectedSeats.value.slice(0, quantity.value)
    }
  }
}

// Manejar selección de asiento individual
const handleSeatSelected = (seat) => {
  // Verificar si ya tenemos el máximo de asientos seleccionados
  if (selectedSeats.value.length >= quantity.value) {
    // Si ya tenemos el máximo, no hacer nada
    return
  }

  // Agregar el asiento a la selección
  if (!selectedSeats.value.find(s => s.id === seat.id)) {
    selectedSeats.value.push(seat)
  }
}

// Manejar deselección de asiento individual
const handleSeatDeselected = (seat) => {
  // Eliminar el asiento de la selección
  const index = selectedSeats.value.findIndex(s => s.id === seat.id)
  if (index !== -1) {
    selectedSeats.value.splice(index, 1)
  }
}

// Manejar cambio de selección
const handleSelectionChange = (seats) => {
  selectedSeats.value = seats
}

// Confirmar selección
const confirmSelection = () => {
  if (selectedSeats.value.length === quantity.value) {
    emit('selection-confirmed', selectedSeats.value)
  }
}

// Formatear fecha (Improved robustness)
const formatDate = (dateString) => {
  if (!dateString) return 'Fecha no disp.';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Fecha inv.'; // Check for invalid date object
    return new Intl.DateTimeFormat('es-ES', {
      weekday: 'short', // Using short to save space if needed
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    }).format(date);
  } catch (e) {
    return 'Error fecha';
  }
}

// Helper to format time (can be adapted from [id].vue or simplified)
const formatTime = (timeString, dateString) => {
  if (!timeString) return 'Hora no esp.';
  if (timeString.includes('T')) { // Handles if timeString is a full ISO datetime
    const date = new Date(timeString);
    if (isNaN(date.getTime())) return 'Hora inv.';
    return date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
  }
  // If timeString is just HH:MM:SS and we have a dateString for context
  if (dateString && timeString.match(/^\d{2}:\d{2}:\d{2}$/)) {
    const [hours, minutes] = timeString.split(':');
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Hora inv.';
    date.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0, 0);
    return date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
  }
  // Fallback for HH:MM or HH:MM:SS without date context
  const parts = timeString.split(':');
  if (parts.length >= 2) {
    return `${parts[0]}:${parts[1]}`;
  }
  return timeString; // Return as is if not parsable
};

// Observar cambios en las propiedades
watch(() => props.trip, (newTrip) => {
  if (newTrip) {
    // Simular asientos ocupados (en un entorno real, esto vendría del backend)
    const occupied = []
    for (let i = 1; i <= (newTrip.bus.type === 'single-deck' ? 40 : 60); i++) {
      if (Math.random() < 0.3) { // 30% de probabilidad de estar ocupado
        occupied.push(i)
      }
    }
    occupiedSeats.value = occupied

    // Resetear selección
    selectedSeats.value = []
    quantity.value = 1
  }
})

watch(() => props.initialSelectedSeats, (newVal) => {
  selectedSeats.value = newVal
  quantity.value = newVal.length || 1
})
</script>
