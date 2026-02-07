<template>
  <div class="seat-layout-editor">
    <!-- Header con controles -->
    <div class="flex flex-wrap items-center justify-between gap-4 mb-4 p-4 bg-gray-50 rounded-lg">
      <div class="flex items-center gap-4">
        <div class="flex items-center gap-2">
          <label for="rows" class="text-sm font-medium text-gray-700">Filas:</label>
          <div class="flex items-center gap-1">
            <button
              type="button"
              @click="decrementRows"
              :disabled="rows <= 1"
              class="w-8 h-8 flex items-center justify-center border border-gray-300 rounded-l-md bg-gray-50 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4" />
              </svg>
            </button>
            <input
              id="rows"
              v-model.number="rows"
              type="number"
              min="1"
              max="20"
              class="w-12 h-8 px-2 py-1 border-t border-b border-gray-300 text-sm text-center focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button
              type="button"
              @click="incrementRows"
              :disabled="rows >= 20"
              class="w-8 h-8 flex items-center justify-center border border-gray-300 rounded-r-md bg-gray-50 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <div class="flex items-center gap-2">
        <button
          type="button"
          @click="fillAll"
          class="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
        >
          <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16m-7 6h7" />
          </svg>
          Llenar Todo
        </button>
        <button
          type="button"
          @click="clearAll"
          class="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
          Limpiar Todo
        </button>
      </div>

      <div class="flex items-center gap-2 px-3 py-1.5 bg-indigo-100 rounded-md">
        <svg class="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
        <span class="text-sm font-medium text-indigo-700">Asientos: {{ seatCount }}</span>
      </div>
    </div>

    <!-- Instrucciones -->
    <div class="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
      <p class="text-sm text-blue-700">
        <span class="font-medium">Instrucciones:</span> Haz click en una celda vacia para agregar un asiento, o click en un asiento existente para eliminarlo.
      </p>
    </div>

    <div class="flex flex-col lg:flex-row gap-6">
      <!-- Grid del bus -->
      <div class="flex-1">
        <div class="bg-white border-2 border-gray-200 rounded-lg p-4 overflow-x-auto">
          <!-- Frente del bus -->
          <div class="text-center mb-4">
            <div class="inline-flex items-center px-4 py-1 bg-gray-100 rounded-full text-sm text-gray-600">
              <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 10l7-7m0 0l7 7m-7-7v18" />
              </svg>
              FRENTE DEL BUS
            </div>
          </div>

          <!-- Grid de asientos -->
          <div class="flex flex-col items-center gap-2">
            <div
              v-for="row in rows"
              :key="row"
              class="flex items-center gap-1"
            >
              <!-- Numero de fila -->
              <span class="w-6 text-xs text-gray-400 text-right mr-2">{{ row }}</span>

              <!-- Columnas izquierda (1, 2) -->
              <div
                v-for="col in [1, 2]"
                :key="`${row}-${col}`"
                @click="toggleSeat(row, col)"
                class="w-12 h-12 border-2 rounded-lg flex items-center justify-center transition-all cursor-pointer select-none"
                :class="getCellClass(row, col)"
              >
                <template v-if="getSeatAt(row, col)">
                  <div class="w-full h-full bg-indigo-600 rounded-lg flex items-center justify-center text-white font-medium text-sm hover:bg-indigo-700 transition-colors">
                    {{ getSeatAt(row, col).seat_number }}
                  </div>
                </template>
                <template v-else>
                  <svg class="w-5 h-5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                  </svg>
                </template>
              </div>

              <!-- Pasillo -->
              <div class="w-8 h-12 flex items-center justify-center">
                <div class="w-1 h-full bg-gray-200 rounded-full"></div>
              </div>

              <!-- Columnas derecha (3, 4) -->
              <div
                v-for="col in [3, 4]"
                :key="`${row}-${col}`"
                @click="toggleSeat(row, col)"
                class="w-12 h-12 border-2 rounded-lg flex items-center justify-center transition-all cursor-pointer select-none"
                :class="getCellClass(row, col)"
              >
                <template v-if="getSeatAt(row, col)">
                  <div class="w-full h-full bg-indigo-600 rounded-lg flex items-center justify-center text-white font-medium text-sm hover:bg-indigo-700 transition-colors">
                    {{ getSeatAt(row, col).seat_number }}
                  </div>
                </template>
                <template v-else>
                  <svg class="w-5 h-5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                  </svg>
                </template>
              </div>
            </div>
          </div>

          <!-- Parte trasera del bus -->
          <div class="text-center mt-4">
            <div class="inline-flex items-center px-4 py-1 bg-gray-100 rounded-full text-sm text-gray-600">
              <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
              PARTE TRASERA
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Leyenda -->
    <div class="mt-4 flex flex-wrap gap-4 text-sm text-gray-600">
      <div class="flex items-center gap-2">
        <div class="w-6 h-6 bg-indigo-600 rounded"></div>
        <span>Asiento (click para quitar)</span>
      </div>
      <div class="flex items-center gap-2">
        <div class="w-6 h-6 border-2 border-dashed border-gray-300 rounded flex items-center justify-center">
          <svg class="w-3 h-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
        </div>
        <span>Vacio (click para agregar)</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

const props = defineProps({
  modelValue: {
    type: Array,
    default: () => []
  },
  floors: {
    type: Number,
    default: 1
  },
  deck: {
    type: String,
    default: 'FIRST',
    validator: (value) => ['FIRST', 'SECOND'].includes(value)
  },
  initialRows: {
    type: Number,
    default: 10
  }
})

const emit = defineEmits(['update:modelValue', 'update:rows'])

// Estado local
const rows = ref(props.initialRows)

// Asientos del deck actual
const currentDeckSeats = computed(() => {
  return props.modelValue.filter(seat => seat.deck === props.deck)
})

// Contador de asientos del deck actual
const seatCount = computed(() => currentDeckSeats.value.length)

// Obtener asiento en una posicion especifica
const getSeatAt = (row, col) => {
  return currentDeckSeats.value.find(seat => seat.row === row && seat.column === col)
}

// Obtener clase CSS para una celda
const getCellClass = (row, col) => {
  const hasSeat = getSeatAt(row, col)

  if (hasSeat) {
    return 'border-transparent'
  }

  return 'border-dashed border-gray-300 hover:border-indigo-400 hover:bg-indigo-50'
}

// Incrementar filas
const incrementRows = () => {
  if (rows.value < 20) {
    rows.value++
    emit('update:rows', rows.value)
  }
}

// Decrementar filas (solo si no hay asientos en la ultima fila)
const decrementRows = () => {
  if (rows.value <= 1) return

  // Verificar si hay asientos en la ultima fila
  const seatsInLastRow = currentDeckSeats.value.filter(s => s.row === rows.value)
  if (seatsInLastRow.length > 0) {
    // Eliminar asientos de la ultima fila antes de reducir
    const newSeats = props.modelValue.filter(
      seat => !(seat.deck === props.deck && seat.row === rows.value)
    )
    renumberSeats(newSeats)
    emit('update:modelValue', newSeats)
  }

  rows.value--
  emit('update:rows', rows.value)
}

// Toggle asiento (agregar si no existe, quitar si existe)
const toggleSeat = (row, col) => {
  if (getSeatAt(row, col)) {
    removeSeat(row, col)
  } else {
    addSeat(row, col)
  }
}

// Agregar un asiento en una posicion
const addSeat = (row, col) => {
  const newSeats = [...props.modelValue]

  // Agregar el nuevo asiento
  newSeats.push({
    seat_number: 0, // Se renumerara
    deck: props.deck,
    row: row,
    column: col
  })

  // Renumerar todos los asientos
  renumberSeats(newSeats)

  emit('update:modelValue', newSeats)
}

// Eliminar un asiento de una posicion
const removeSeat = (row, col) => {
  const newSeats = props.modelValue.filter(
    seat => !(seat.deck === props.deck && seat.row === row && seat.column === col)
  )

  // Renumerar todos los asientos
  renumberSeats(newSeats)

  emit('update:modelValue', newSeats)
}

// Llenar todas las posiciones
const fillAll = () => {
  // Eliminar asientos del deck actual
  const otherDeckSeats = props.modelValue.filter(seat => seat.deck !== props.deck)
  const newSeats = [...otherDeckSeats]

  // Agregar asientos en todas las posiciones
  for (let row = 1; row <= rows.value; row++) {
    for (let col = 1; col <= 4; col++) {
      newSeats.push({
        seat_number: 0,
        deck: props.deck,
        row: row,
        column: col
      })
    }
  }

  // Renumerar todos los asientos
  renumberSeats(newSeats)

  emit('update:modelValue', newSeats)
}

// Limpiar todos los asientos del deck actual
const clearAll = () => {
  const otherDeckSeats = props.modelValue.filter(seat => seat.deck !== props.deck)
  emit('update:modelValue', otherDeckSeats)
}

// Renumerar asientos ordenados por piso, fila y columna
const renumberSeats = (seats) => {
  // Separar por piso
  const firstDeckSeats = seats.filter(s => s.deck === 'FIRST')
  const secondDeckSeats = seats.filter(s => s.deck === 'SECOND')

  // Ordenar cada piso
  const sortSeats = (deckSeats) => {
    return deckSeats.sort((a, b) => {
      if (a.row !== b.row) return a.row - b.row
      return a.column - b.column
    })
  }

  sortSeats(firstDeckSeats)
  sortSeats(secondDeckSeats)

  // Renumerar
  let seatNumber = 1
  firstDeckSeats.forEach(seat => {
    seat.seat_number = seatNumber++
  })
  secondDeckSeats.forEach(seat => {
    seat.seat_number = seatNumber++
  })
}

// Ajustar filas cuando hay asientos que exceden el numero actual
watch(() => props.modelValue, (newSeats) => {
  const deckSeats = newSeats.filter(s => s.deck === props.deck)
  if (deckSeats.length > 0) {
    const maxRow = Math.max(...deckSeats.map(s => s.row))
    if (maxRow > rows.value) {
      rows.value = maxRow
    }
  }
}, { immediate: true })

// Sincronizar filas con el prop initialRows cuando cambie de piso
watch(() => props.initialRows, (newInitialRows) => {
  rows.value = newInitialRows
}, { immediate: true })
</script>

<style scoped>
.seat-layout-editor {
  user-select: none;
}
</style>
