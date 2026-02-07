<template>
  <div class="bg-white rounded-lg shadow-xl w-full max-h-[90vh] overflow-y-auto" :class="formWidth">
    <!-- Header -->
    <div class="px-6 py-4 border-b border-gray-200">
      <div class="flex items-center justify-between">
        <div>
          <h3 class="text-lg font-semibold text-gray-900">
            {{ isEditing ? 'Editar Bus' : 'Nuevo Bus' }}
          </h3>
          <p class="text-sm text-gray-500 mt-1">
            Paso {{ currentStep }} de 2: {{ currentStep === 1 ? 'Datos Basicos' : 'Planilla de Asientos' }}
          </p>
        </div>
        <button
          @click="$emit('cancel')"
          class="text-gray-400 hover:text-gray-500"
        >
          <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <!-- Indicador de pasos -->
      <div class="mt-4">
        <div class="flex items-center">
          <button
            type="button"
            @click="currentStep = 1"
            class="flex items-center focus:outline-none"
            :disabled="loading"
          >
            <div
              class="w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors"
              :class="currentStep >= 1 ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-600'"
            >
              1
            </div>
            <span class="ml-2 text-sm font-medium" :class="currentStep >= 1 ? 'text-indigo-600' : 'text-gray-500'">
              Datos
            </span>
          </button>
          <div class="w-16 h-0.5 mx-3" :class="currentStep >= 2 ? 'bg-indigo-600' : 'bg-gray-200'"></div>
          <button
            type="button"
            @click="goToStep2"
            class="flex items-center focus:outline-none"
            :disabled="loading || !canGoToStep2"
          >
            <div
              class="w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors"
              :class="currentStep >= 2 ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-600'"
            >
              2
            </div>
            <span class="ml-2 text-sm font-medium" :class="currentStep >= 2 ? 'text-indigo-600' : 'text-gray-500'">
              Planilla
            </span>
          </button>
        </div>
      </div>
    </div>

    <!-- Paso 1: Datos Basicos -->
    <form v-if="currentStep === 1" @submit.prevent="handleStep1Submit" class="px-6 py-4 space-y-4">
      <!-- Placa -->
      <div>
        <label for="license_plate" class="block text-sm font-medium text-gray-700">
          Placa <span class="text-red-500">*</span>
        </label>
        <input
          id="license_plate"
          v-model="form.license_plate"
          type="text"
          required
          maxlength="10"
          class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm uppercase"
          placeholder="Ej: 2312ABX"
        />
        <p v-if="errors.license_plate" class="mt-1 text-sm text-red-600">{{ errors.license_plate }}</p>
      </div>

      <!-- Modelo -->
      <div>
        <label for="model" class="block text-sm font-medium text-gray-700">
          Modelo <span class="text-red-500">*</span>
        </label>
        <input
          id="model"
          v-model="form.model"
          type="text"
          required
          maxlength="100"
          class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          placeholder="Ej: Sprinter 515"
        />
        <p v-if="errors.model" class="mt-1 text-sm text-red-600">{{ errors.model }}</p>
      </div>

      <!-- Marca -->
      <div>
        <label for="brand" class="block text-sm font-medium text-gray-700">
          Marca
        </label>
        <input
          id="brand"
          v-model="form.brand"
          type="text"
          maxlength="50"
          class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          placeholder="Ej: Mercedes-Benz"
        />
      </div>

      <!-- Color -->
      <div>
        <label for="color" class="block text-sm font-medium text-gray-700">
          Color
        </label>
        <select
          id="color"
          v-model="form.color"
          class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        >
          <option value="">Seleccionar color</option>
          <option v-for="color in colors" :key="color" :value="color">{{ color }}</option>
        </select>
      </div>

      <!-- Numero de Pisos -->
      <div>
        <label for="floors" class="block text-sm font-medium text-gray-700">
          Numero de Pisos <span class="text-red-500">*</span>
        </label>
        <select
          id="floors"
          v-model.number="form.floors"
          required
          class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        >
          <option :value="1">1 Piso</option>
          <option :value="2">2 Pisos</option>
        </select>
        <p class="mt-1 text-xs text-gray-500">
          La capacidad se calculara automaticamente basada en la planilla de asientos.
        </p>
      </div>

      <!-- Capacidad actual (solo para edicion) -->
      <div v-if="isEditing" class="p-3 bg-gray-50 rounded-lg">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-700">Capacidad actual</p>
            <p class="text-2xl font-bold text-indigo-600">{{ form.capacity }} asientos</p>
          </div>
          <button
            type="button"
            @click="goToStep2"
            class="inline-flex items-center px-3 py-2 border border-indigo-300 text-sm font-medium rounded-md text-indigo-700 bg-indigo-50 hover:bg-indigo-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
            Editar Planilla
          </button>
        </div>
      </div>

      <!-- Botones -->
      <div class="pt-4 flex justify-end gap-3 border-t border-gray-200">
        <button
          type="button"
          @click="$emit('cancel')"
          :disabled="loading"
          class="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
        >
          Cancelar
        </button>
        <button
          v-if="isEditing"
          type="submit"
          :disabled="loading"
          class="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
        >
          <svg v-if="loading" class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Actualizar
        </button>
        <button
          v-else
          type="submit"
          :disabled="loading"
          class="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
        >
          Siguiente: Disenar Planilla
          <svg class="ml-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </form>

    <!-- Paso 2: Editor de Planilla -->
    <div v-if="currentStep === 2" class="px-6 py-4">
      <!-- Tabs para pisos (si hay 2 pisos) -->
      <div v-if="form.floors === 2" class="mb-4">
        <div class="border-b border-gray-200">
          <nav class="-mb-px flex space-x-8">
            <button
              type="button"
              @click="activeDeck = 'FIRST'"
              class="py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap"
              :class="activeDeck === 'FIRST' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'"
            >
              Piso 1
              <span class="ml-2 py-0.5 px-2 rounded-full text-xs" :class="activeDeck === 'FIRST' ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-100 text-gray-600'">
                {{ firstDeckSeatCount }}
              </span>
            </button>
            <button
              type="button"
              @click="activeDeck = 'SECOND'"
              class="py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap"
              :class="activeDeck === 'SECOND' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'"
            >
              Piso 2
              <span class="ml-2 py-0.5 px-2 rounded-full text-xs" :class="activeDeck === 'SECOND' ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-100 text-gray-600'">
                {{ secondDeckSeatCount }}
              </span>
            </button>
          </nav>
        </div>
      </div>

      <!-- Editor de asientos -->
      <SeatLayoutEditor
        v-model="seats"
        :floors="form.floors"
        :deck="activeDeck"
        :initial-rows="currentDeckRows"
        @update:rows="handleRowsUpdate"
      />

      <!-- Resumen de asientos -->
      <div class="mt-4 p-4 bg-gray-50 rounded-lg">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-700">Total de asientos: {{ totalSeatCount }}</p>
            <p v-if="form.floors === 2" class="text-xs text-gray-500">
              Piso 1: {{ firstDeckSeatCount }} | Piso 2: {{ secondDeckSeatCount }}
            </p>
          </div>
          <div v-if="totalSeatCount === 0" class="text-sm text-amber-600 flex items-center">
            <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            Debe agregar al menos un asiento
          </div>
        </div>
      </div>

      <!-- Botones -->
      <div class="pt-4 flex justify-between border-t border-gray-200 mt-4">
        <button
          type="button"
          @click="currentStep = 1"
          :disabled="loading"
          class="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
        >
          <svg class="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
          Anterior
        </button>
        <button
          type="button"
          @click="handleSaveBus"
          :disabled="loading || totalSeatCount === 0"
          class="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
        >
          <svg v-if="loading" class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          {{ isEditing ? 'Guardar Cambios' : 'Crear Bus' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, watch, computed, onMounted } from 'vue'
import SeatLayoutEditor from '~/components/admin/SeatLayoutEditor.vue'

const props = defineProps({
  bus: {
    type: Object,
    default: null
  },
  loading: {
    type: Boolean,
    default: false
  },
  isEditing: {
    type: Boolean,
    default: false
  },
  existingSeats: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['submit', 'cancel'])

// Lista de colores disponibles
const colors = [
  'Blanco',
  'Negro',
  'Gris',
  'Plateado',
  'Rojo',
  'Azul',
  'Verde',
  'Amarillo',
  'Naranja',
  'Celeste',
  'Morado',
  'Rosa',
  'Marron',
  'Beige',
  'Dorado'
]

// Estado del formulario
const currentStep = ref(1)
const activeDeck = ref('FIRST')

const form = reactive({
  license_plate: '',
  capacity: null,
  model: '',
  brand: '',
  color: '',
  floors: 1
})

const seats = ref([])

// Filas por piso (independientes)
const rowsPerDeck = reactive({
  FIRST: 10,
  SECOND: 10
})

// Computed para obtener las filas del piso activo
const currentDeckRows = computed(() => rowsPerDeck[activeDeck.value])

// Computed para verificar si se puede ir al paso 2
const canGoToStep2 = computed(() => {
  return form.license_plate.trim() !== '' && form.model.trim() !== ''
})

// Handler para actualizar filas del piso activo
const handleRowsUpdate = (newRows) => {
  rowsPerDeck[activeDeck.value] = newRows
}

// Ir al paso 2 validando primero
const goToStep2 = () => {
  if (validateStep1()) {
    currentStep.value = 2
  }
}

const errors = reactive({
  license_plate: '',
  model: ''
})

// Computed: ancho del formulario segun el paso
const formWidth = computed(() => {
  if (currentStep.value === 2) {
    return 'max-w-4xl'
  }
  return 'max-w-md'
})

// Computed: conteo de asientos por piso
const firstDeckSeatCount = computed(() => {
  return seats.value.filter(s => s.deck === 'FIRST').length
})

const secondDeckSeatCount = computed(() => {
  return seats.value.filter(s => s.deck === 'SECOND').length
})

const totalSeatCount = computed(() => {
  return seats.value.length
})

// Inicializar formulario con datos del bus si existe
const initForm = () => {
  if (props.bus) {
    form.license_plate = props.bus.license_plate || ''
    form.capacity = props.bus.capacity || null
    form.model = props.bus.model || ''
    form.brand = props.bus.brand || ''
    form.color = props.bus.color || ''
    form.floors = props.bus.floors || 1
  } else {
    form.license_plate = ''
    form.capacity = null
    form.model = ''
    form.brand = ''
    form.color = ''
    form.floors = 1
  }
  currentStep.value = 1
  activeDeck.value = 'FIRST'

  // Cargar asientos existentes si es modo edición
  if (props.isEditing && props.existingSeats.length > 0) {
    seats.value = props.existingSeats.map(seat => ({
      seat_number: seat.seat_number,
      deck: seat.deck,
      row: seat.row,
      column: seat.column
    }))

    // Calcular filas por piso basado en asientos existentes
    const firstDeckSeats = seats.value.filter(s => s.deck === 'FIRST')
    const secondDeckSeats = seats.value.filter(s => s.deck === 'SECOND')

    rowsPerDeck.FIRST = firstDeckSeats.length > 0
      ? Math.max(...firstDeckSeats.map(s => s.row), 10)
      : 10
    rowsPerDeck.SECOND = secondDeckSeats.length > 0
      ? Math.max(...secondDeckSeats.map(s => s.row), 10)
      : 10
  } else {
    seats.value = []
    rowsPerDeck.FIRST = 10
    rowsPerDeck.SECOND = 10
  }
}

// Validar paso 1
const validateStep1 = () => {
  let isValid = true
  errors.license_plate = ''
  errors.model = ''

  if (!form.license_plate || form.license_plate.trim() === '') {
    errors.license_plate = 'La placa es requerida'
    isValid = false
  }

  if (!form.model || form.model.trim() === '') {
    errors.model = 'El modelo es requerido'
    isValid = false
  }

  return isValid
}

// Manejar envio del paso 1
const handleStep1Submit = () => {
  if (!validateStep1()) return

  if (props.isEditing) {
    // En modo edicion, enviar directamente
    const busData = {
      license_plate: form.license_plate.toUpperCase().trim(),
      capacity: form.capacity,
      model: form.model.trim(),
      brand: form.brand?.trim() || null,
      color: form.color || null,
      floors: form.floors
    }
    emit('submit', busData)
  } else {
    // En modo crear, ir al paso 2
    currentStep.value = 2
  }
}

// Manejar guardado de bus (crear o actualizar) desde paso 2
const handleSaveBus = () => {
  if (totalSeatCount.value === 0) return

  const busData = {
    license_plate: form.license_plate.toUpperCase().trim(),
    capacity: totalSeatCount.value,
    model: form.model.trim(),
    brand: form.brand?.trim() || null,
    color: form.color || null,
    floors: form.floors,
    seats: seats.value.map(seat => ({
      seat_number: seat.seat_number,
      deck: seat.deck,
      row: seat.row,
      column: seat.column
    })),
    // Flag para indicar si se actualizaron asientos (en modo edición)
    seatsModified: props.isEditing
  }

  emit('submit', busData)
}

// Observar cambios en el prop bus
watch(() => props.bus, () => {
  initForm()
}, { immediate: true })

onMounted(() => {
  initForm()
})
</script>
