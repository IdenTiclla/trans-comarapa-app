<template>
  <div v-if="isDoubleDeck" class="deck-selector bg-white border border-gray-200 rounded-2xl p-4 mb-6 shadow-sm">
    <!-- Deck selector tabs -->
    <div class="flex bg-gray-100 rounded-xl p-1">
      <button
        @click="$emit('deck-changed', firstDeckValue)"
        :class="[
          'flex-1 flex items-center justify-center px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg text-sm font-medium transition-all duration-200',
          isFirstDeckSelected
            ? 'bg-blue-600 text-white shadow-md'
            : 'text-gray-600 hover:text-gray-800 hover:bg-gray-200'
        ]"
      >
        <span class="mr-1.5">🔽</span>
        <span class="hidden sm:inline">Planta</span>
        <span class="sm:hidden">P.</span>
        <span class="ml-1">Baja</span>
        <span v-if="firstDeckSeatsCount !== null" class="ml-1.5 text-xs opacity-75">
          ({{ firstDeckSeatsCount }})
        </span>
      </button>

      <button
        @click="$emit('deck-changed', secondDeckValue)"
        :class="[
          'flex-1 flex items-center justify-center px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg text-sm font-medium transition-all duration-200',
          isSecondDeckSelected
            ? 'bg-blue-600 text-white shadow-md'
            : 'text-gray-600 hover:text-gray-800 hover:bg-gray-200'
        ]"
      >
        <span class="mr-1.5">🔼</span>
        <span class="hidden sm:inline">Planta</span>
        <span class="sm:hidden">P.</span>
        <span class="ml-1">Alta</span>
        <span v-if="secondDeckSeatsCount !== null" class="ml-1.5 text-xs opacity-75">
          ({{ secondDeckSeatsCount }})
        </span>
      </button>
    </div>

    <!-- Seat statistics for current deck -->
    <div class="mt-3 flex items-center justify-between bg-gray-50 rounded-xl p-3 border border-gray-100">
      <div class="flex items-center space-x-2 min-w-0">
        <div class="w-2.5 h-2.5 bg-blue-600 rounded-full animate-pulse flex-shrink-0"></div>
        <span class="text-xs sm:text-sm font-semibold text-gray-700 truncate">
          {{ getDeckDisplayName() }}
        </span>
      </div>

      <div class="flex items-center space-x-2 sm:space-x-4 flex-shrink-0">
        <div class="text-center">
          <span class="text-base sm:text-lg font-black text-indigo-600">{{ totalFilteredSeatsCount }}</span>
          <p class="text-[10px] sm:text-xs text-gray-500">Total</p>
        </div>
        <div class="w-px h-6 sm:h-8 bg-gray-200"></div>
        <div class="text-center">
          <span class="text-base sm:text-lg font-black text-red-600">{{ occupiedSeatsCount }}</span>
          <p class="text-[10px] sm:text-xs text-gray-500">Ocupados</p>
        </div>
        <div class="w-px h-6 sm:h-8 bg-gray-200"></div>
        <div class="text-center">
          <span class="text-base sm:text-lg font-black text-amber-600">{{ reservedSeatsCount }}</span>
          <p class="text-[10px] sm:text-xs text-gray-500">Reservados</p>
        </div>
        <div class="w-px h-6 sm:h-8 bg-gray-200"></div>
        <div class="text-center">
          <span class="text-base sm:text-lg font-black text-emerald-600">{{ availableSeatsCount }}</span>
          <p class="text-[10px] sm:text-xs text-gray-500">Disponibles</p>
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
  },
  occupiedSeatsCount: {
    type: Number,
    default: 0
  },
  reservedSeatsCount: {
    type: Number,
    default: 0
  },
  availableSeatsCount: {
    type: Number,
    default: 0
  },
  totalFilteredSeatsCount: {
    type: Number,
    default: 0
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

/* Accessibility improvements */
@media (prefers-reduced-motion: reduce) {
  .deck-selector button,
  .animate-pulse {
    transition: none;
    animation: none;
  }
}
</style>
