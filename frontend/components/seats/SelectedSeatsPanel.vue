<template>
  <div v-if="selectionEnabled && selectedSeats.length > 0" class="selected-seats-panel">
    <!-- Panel principal con diseño mejorado -->
    <div class="bg-gradient-to-r from-indigo-50 via-blue-50 to-purple-50 border border-indigo-200 rounded-2xl shadow-lg backdrop-blur-sm mx-4 sm:mx-6 md:mx-8 mb-6">
      <!-- Header del panel -->
      <div class="px-6 py-4 border-b border-indigo-100">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-3">
            <div class="bg-gradient-to-r from-indigo-500 to-blue-600 p-2.5 rounded-xl shadow-lg">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
            </div>
            <div>
              <h3 class="text-lg font-bold text-gray-800">Asientos Seleccionados</h3>
              <p class="text-sm text-gray-600">{{ selectedSeats.length }} {{ selectedSeats.length === 1 ? 'asiento seleccionado' : 'asientos seleccionados' }}</p>
            </div>
          </div>
          
          <!-- Badge con contador -->
          <div class="bg-gradient-to-r from-indigo-500 to-blue-600 text-white px-4 py-2 rounded-full shadow-lg">
            <span class="text-lg font-bold">{{ selectedSeats.length }}</span>
          </div>
        </div>
      </div>

      <!-- Lista de asientos seleccionados -->
      <div class="px-6 py-4">
        <div class="mb-4">
          <label class="block text-sm font-semibold text-gray-700 mb-3">Asientos seleccionados:</label>
          <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
            <div
              v-for="seat in selectedSeats" 
              :key="seat.id" 
              class="group relative bg-white border-2 border-indigo-200 rounded-xl p-3 hover:border-indigo-400 hover:shadow-md transition-all duration-200 cursor-pointer"
            >
              <!-- Indicador de posición -->
              <div class="absolute top-1 right-1">
                <span class="text-xs text-gray-400">
                  {{ seat.position === 'window' ? '🪟' : '🚶' }}
                </span>
              </div>
              
              <!-- Número del asiento -->
              <div class="text-center">
                <div class="text-lg font-bold text-indigo-600 mb-1">{{ seat.number }}</div>
                <div class="text-xs text-gray-500 font-medium">
                  {{ seat.position === 'window' ? 'Ventana' : 'Pasillo' }}
                </div>
              </div>
              
              <!-- Botón de remover -->
              <button 
                @click="$emit('remove-seat', seat)"
                class="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1.5 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 transform hover:scale-110"
                aria-label="Quitar asiento"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        <!-- Información de resumen -->
        <div class="bg-white rounded-xl p-4 mb-4 border border-gray-200">
          <div class="grid grid-cols-3 gap-4 text-center">
            <div>
              <div class="text-2xl font-bold text-indigo-600">{{ selectedSeats.length }}</div>
              <div class="text-sm text-gray-600">Total</div>
            </div>
            <div>
              <div class="text-2xl font-bold text-emerald-600">{{ windowSeats }}</div>
              <div class="text-sm text-gray-600">Ventana</div>
            </div>
            <div>
              <div class="text-2xl font-bold text-blue-600">{{ aisleSeats }}</div>
              <div class="text-sm text-gray-600">Pasillo</div>
            </div>
          </div>
        </div>

        <!-- Botones de acción mejorados -->
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button 
            @click="$emit('sell-ticket')"
            class="bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center justify-center space-x-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
            <span>Vender Tickets</span>
          </button>
          
          <button 
            @click="$emit('reserve-seat')"
            class="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center justify-center space-x-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span>Reservar Asientos</span>
          </button>
          
          <button 
            @click="$emit('clear-selection')"
            class="bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center justify-center space-x-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            <span>Limpiar</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  selectedSeats: {
    type: Array,
    required: true
  },
  selectionEnabled: {
    type: Boolean,
    default: true
  }
})

defineEmits([
  'sell-ticket',
  'reserve-seat', 
  'clear-selection',
  'remove-seat'
])

// Computed properties para estadísticas
const windowSeats = computed(() => {
  return props.selectedSeats.filter(seat => seat.position === 'window').length
})

const aisleSeats = computed(() => {
  return props.selectedSeats.filter(seat => seat.position === 'aisle').length
})
</script>

<style scoped>
.selected-seats-panel {
  animation: slideUp 0.3s ease-out;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Efectos hover mejorados */
.group:hover .group-hover\:opacity-100 {
  opacity: 1;
}

/* Animaciones suaves */
button {
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

button:active {
  transform: scale(0.98);
}

/* Estilos responsivos mejorados */
@media (max-width: 640px) {
  .selected-seats-panel {
    margin: 0 1rem 1.5rem 1rem;
  }
}

/* Estilos para impresión */
@media print {
  .selected-seats-panel {
    display: none !important;
  }
}

/* Efectos de glassmorphism */
.bg-gradient-to-r.from-indigo-50 {
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
}
</style>