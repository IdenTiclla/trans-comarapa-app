<template>
  <div v-if="busType === 'double-deck' || busType === 'double_deck'" class="deck-selector bg-white border border-gray-200 rounded-2xl p-4 mb-6 shadow-sm">
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between">
      <!-- Deck selector tabs -->
      <div class="flex bg-gray-100 rounded-xl p-1 mb-4 sm:mb-0">
        <button
          @click="$emit('deck-changed', 'lower')"
          :class="[
            'flex-1 flex items-center justify-center px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200',
            selectedDeck === 'lower'
              ? 'bg-blue-600 text-white shadow-md transform scale-105'
              : 'text-gray-600 hover:text-gray-800 hover:bg-gray-200'
          ]"
        >
          <span class="mr-2">🔽</span>
          <span class="hidden sm:inline">Planta</span>
          <span class="sm:hidden">P.</span>
          <span class="ml-1">Baja</span>
          <span v-if="lowerSeatsCount !== null" class="ml-2 text-xs opacity-75">
            ({{ lowerSeatsCount }})
          </span>
        </button>
        
        <button
          @click="$emit('deck-changed', 'upper')"
          :class="[
            'flex-1 flex items-center justify-center px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200',
            selectedDeck === 'upper'
              ? 'bg-blue-600 text-white shadow-md transform scale-105'
              : 'text-gray-600 hover:text-gray-800 hover:bg-gray-200'
          ]"
        >
          <span class="mr-2">🔼</span>
          <span class="hidden sm:inline">Planta</span>
          <span class="sm:hidden">P.</span>
          <span class="ml-1">Alta</span>
          <span v-if="upperSeatsCount !== null" class="ml-2 text-xs opacity-75">
            ({{ upperSeatsCount }})
          </span>
        </button>
      </div>

      <!-- Current deck info -->
      <div class="flex items-center space-x-3">
        <div class="flex items-center space-x-2">
          <div class="w-3 h-3 bg-blue-600 rounded-full animate-pulse"></div>
          <span class="text-sm font-medium text-gray-700">
            {{ getDeckDisplayName() }}
          </span>
        </div>
        
        <div v-if="currentDeckSeatsCount !== null" class="bg-gray-100 px-3 py-1 rounded-full">
          <span class="text-xs font-semibold text-gray-600">
            {{ currentDeckSeatsCount }} asientos
          </span>
        </div>
      </div>
    </div>
    
    <!-- Visual deck indicator -->
    <div class="mt-4 flex justify-center">
      <div class="flex items-center space-x-2 bg-gradient-to-r from-blue-50 to-indigo-50 px-4 py-2 rounded-xl border border-blue-100">
        <div class="flex flex-col items-center space-y-1">
          <div :class="[
            'w-6 h-3 rounded-sm border-2 transition-all duration-200',
            selectedDeck === 'upper' ? 'bg-blue-600 border-blue-700' : 'bg-gray-200 border-gray-300'
          ]"></div>
          <div :class="[
            'w-6 h-3 rounded-sm border-2 transition-all duration-200',
            selectedDeck === 'lower' ? 'bg-blue-600 border-blue-700' : 'bg-gray-200 border-gray-300'
          ]"></div>
        </div>
        <div class="text-xs text-gray-600 ml-2">
          <div class="font-medium">Vista lateral</div>
          <div class="text-gray-500">del bus</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  busType: {
    type: String,
    required: true,
    validator: (value) => ['single-deck', 'double-deck', 'single_deck', 'double_deck'].includes(value)
  },
  selectedDeck: {
    type: String,
    required: true,
    validator: (value) => ['main', 'lower', 'upper'].includes(value)
  },
  seats: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['deck-changed'])

// Count seats by deck
const lowerSeatsCount = computed(() => {
  if (props.busType !== 'double-deck' && props.busType !== 'double_deck') return null
  return props.seats.filter(seat => seat.deck === 'lower').length
})

const upperSeatsCount = computed(() => {
  if (props.busType !== 'double-deck' && props.busType !== 'double_deck') return null
  return props.seats.filter(seat => seat.deck === 'upper').length
})

const currentDeckSeatsCount = computed(() => {
  if (props.busType === 'single-deck' || props.busType === 'single_deck') {
    return props.seats.filter(seat => seat.deck === 'main' || !seat.deck).length
  }
  
  if (props.selectedDeck === 'lower') {
    return lowerSeatsCount.value
  } else if (props.selectedDeck === 'upper') {
    return upperSeatsCount.value
  }
  
  return 0
})

// Get display name for current deck
const getDeckDisplayName = () => {
  switch (props.selectedDeck) {
    case 'lower':
      return 'Planta Baja'
    case 'upper':
      return 'Planta Alta'
    case 'main':
    default:
      return 'Planta Única'
  }
}
</script>

<style scoped>
.deck-selector {
  transition: all 0.3s ease;
}

/* Enhanced hover effects */
.deck-selector button:hover {
  transform: translateY(-1px);
}

.deck-selector button:active {
  transform: translateY(0);
}

/* Animation for deck indicator */
@keyframes deck-pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.7;
  }
}

.animate-pulse {
  animation: deck-pulse 2s infinite;
}

/* Responsive improvements */
@media (max-width: 640px) {
  .deck-selector {
    margin-left: -0.5rem;
    margin-right: -0.5rem;
  }
}

/* Accessibility improvements */
@media (prefers-reduced-motion: reduce) {
  .deck-selector button,
  .animate-pulse {
    transition: none;
    animation: none;
  }
}
</style>