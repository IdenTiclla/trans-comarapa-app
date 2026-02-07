<template>
  <div v-if="isDoubleDeck" class="deck-selector bg-white border border-gray-200 rounded-2xl p-4 mb-6 shadow-sm">
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between">
      <!-- Deck selector tabs -->
      <div class="flex bg-gray-100 rounded-xl p-1 mb-4 sm:mb-0">
        <button
          @click="$emit('deck-changed', firstDeckValue)"
          :class="[
            'flex-1 flex items-center justify-center px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200',
            isFirstDeckSelected
              ? 'bg-blue-600 text-white shadow-md transform scale-105'
              : 'text-gray-600 hover:text-gray-800 hover:bg-gray-200'
          ]"
        >
          <span class="mr-2">🔽</span>
          <span class="hidden sm:inline">Planta</span>
          <span class="sm:hidden">P.</span>
          <span class="ml-1">Baja</span>
          <span v-if="firstDeckSeatsCount !== null" class="ml-2 text-xs opacity-75">
            ({{ firstDeckSeatsCount }})
          </span>
        </button>
        
        <button
          @click="$emit('deck-changed', secondDeckValue)"
          :class="[
            'flex-1 flex items-center justify-center px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200',
            isSecondDeckSelected
              ? 'bg-blue-600 text-white shadow-md transform scale-105'
              : 'text-gray-600 hover:text-gray-800 hover:bg-gray-200'
          ]"
        >
          <span class="mr-2">🔼</span>
          <span class="hidden sm:inline">Planta</span>
          <span class="sm:hidden">P.</span>
          <span class="ml-1">Alta</span>
          <span v-if="secondDeckSeatsCount !== null" class="ml-2 text-xs opacity-75">
            ({{ secondDeckSeatsCount }})
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
            isSecondDeckSelected ? 'bg-blue-600 border-blue-700' : 'bg-gray-200 border-gray-300'
          ]"></div>
          <div :class="[
            'w-6 h-3 rounded-sm border-2 transition-all duration-200',
            isFirstDeckSelected ? 'bg-blue-600 border-blue-700' : 'bg-gray-200 border-gray-300'
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
    default: null,
    validator: (value) => value === null || ['single-deck', 'double-deck', 'single_deck', 'double_deck'].includes(value)
  },
  floors: {
    type: Number,
    default: null
  },
  selectedDeck: {
    type: String,
    required: true,
    validator: (value) => ['main', 'lower', 'upper', 'FIRST', 'SECOND'].includes(value)
  },
  seats: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['deck-changed'])

// Determine if this is a double deck bus
const isDoubleDeck = computed(() => {
  if (props.floors !== null) return props.floors >= 2
  if (props.busType) return props.busType === 'double-deck' || props.busType === 'double_deck'
  return false
})

// Determine which naming convention is in use
const usesFirstSecond = computed(() => {
  return props.selectedDeck === 'FIRST' || props.selectedDeck === 'SECOND'
})

const firstDeckValue = computed(() => usesFirstSecond.value ? 'FIRST' : 'lower')
const secondDeckValue = computed(() => usesFirstSecond.value ? 'SECOND' : 'upper')

const isFirstDeckSelected = computed(() => {
  return props.selectedDeck === 'FIRST' || props.selectedDeck === 'lower'
})

const isSecondDeckSelected = computed(() => {
  return props.selectedDeck === 'SECOND' || props.selectedDeck === 'upper'
})

// Count seats by deck - supports both naming conventions
const firstDeckSeatsCount = computed(() => {
  if (!isDoubleDeck.value) return null
  return props.seats.filter(seat => seat.deck === 'FIRST' || seat.deck === 'lower').length
})

const secondDeckSeatsCount = computed(() => {
  if (!isDoubleDeck.value) return null
  return props.seats.filter(seat => seat.deck === 'SECOND' || seat.deck === 'upper').length
})

const currentDeckSeatsCount = computed(() => {
  if (!isDoubleDeck.value) {
    return props.seats.filter(seat => seat.deck === 'main' || seat.deck === 'FIRST' || !seat.deck).length
  }
  
  if (isFirstDeckSelected.value) {
    return firstDeckSeatsCount.value
  } else if (isSecondDeckSelected.value) {
    return secondDeckSeatsCount.value
  }
  
  return 0
})

// Get display name for current deck
const getDeckDisplayName = () => {
  if (isFirstDeckSelected.value) return 'Planta Baja'
  if (isSecondDeckSelected.value) return 'Planta Alta'
  return 'Planta Unica'
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
