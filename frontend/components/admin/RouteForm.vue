<template>
  <div class="bg-white rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
    <!-- Header -->
    <div class="px-6 py-4 border-b border-gray-200">
      <div class="flex items-center justify-between">
        <h3 class="text-lg font-semibold text-gray-900">
          {{ isEditing ? 'Editar Ruta' : 'Nueva Ruta' }}
        </h3>
        <button @click="$emit('cancel')" class="text-gray-400 hover:text-gray-500">
          <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>

    <!-- Form -->
    <form @submit.prevent="handleSubmit" class="px-6 py-4 space-y-4">
      <!-- Origen -->
      <div>
        <label for="origin" class="block text-sm font-medium text-gray-700">Origen</label>
        <select
          id="origin"
          v-model="form.origin_location_id"
          class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          required
        >
          <option value="" disabled>Seleccionar origen</option>
          <option
            v-for="loc in availableOrigins"
            :key="loc.id"
            :value="loc.id"
          >
            {{ loc.name }}
          </option>
        </select>
      </div>

      <!-- Destino -->
      <div>
        <label for="destination" class="block text-sm font-medium text-gray-700">Destino</label>
        <select
          id="destination"
          v-model="form.destination_location_id"
          class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          required
        >
          <option value="" disabled>Seleccionar destino</option>
          <option
            v-for="loc in availableDestinations"
            :key="loc.id"
            :value="loc.id"
          >
            {{ loc.name }}
          </option>
        </select>
        <p v-if="sameLocationError" class="mt-1 text-sm text-red-600">El origen y destino deben ser diferentes</p>
      </div>

      <!-- Distancia -->
      <div>
        <label for="distance" class="block text-sm font-medium text-gray-700">Distancia (km)</label>
        <input
          id="distance"
          type="number"
          v-model.number="form.distance"
          step="0.1"
          min="0.1"
          class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          required
        />
      </div>

      <!-- Duracion -->
      <div>
        <label for="duration" class="block text-sm font-medium text-gray-700">Duracion (horas)</label>
        <input
          id="duration"
          type="number"
          v-model.number="form.duration"
          step="0.5"
          min="0.1"
          class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          required
        />
      </div>

      <!-- Precio -->
      <div>
        <label for="price" class="block text-sm font-medium text-gray-700">Precio (Bs.)</label>
        <input
          id="price"
          type="number"
          v-model.number="form.price"
          step="0.5"
          min="0.1"
          class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          required
        />
      </div>

      <!-- Horarios de Salida -->
      <div class="border-t border-gray-200 pt-4">
        <label class="block text-sm font-medium text-gray-700 mb-2">
          Horarios de Salida
        </label>

        <!-- Agregar nuevo horario -->
        <div class="flex gap-2 items-end mb-3">
          <div class="flex-1">
            <input
              type="time"
              v-model="newScheduleTime"
              class="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              placeholder="HH:MM"
            />
          </div>
          <button
            type="button"
            @click="addLocalSchedule"
            :disabled="!newScheduleTime"
            class="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            <svg class="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Agregar
          </button>
        </div>
        <p v-if="scheduleError" class="mb-2 text-sm text-red-600">{{ scheduleError }}</p>

        <!-- Lista de horarios -->
        <div v-if="localSchedules.length === 0" class="text-center py-4 bg-gray-50 rounded-lg border border-dashed border-gray-300">
          <svg class="mx-auto h-8 w-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p class="mt-1 text-sm text-gray-500">Sin horarios configurados</p>
        </div>

        <div v-else class="space-y-2 max-h-40 overflow-y-auto">
          <div
            v-for="(schedule, index) in sortedLocalSchedules"
            :key="schedule._localId || schedule.id"
            class="flex items-center justify-between p-2 rounded-lg border"
            :class="schedule.is_active ? 'border-gray-200 bg-white' : 'border-gray-100 bg-gray-50'"
          >
            <div class="flex items-center gap-2">
              <span
                class="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-semibold"
                :class="schedule.is_active ? 'bg-indigo-100 text-indigo-800' : 'bg-gray-200 text-gray-500'"
              >
                <svg class="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {{ formatTime(schedule.departure_time) }}
              </span>
              <span v-if="!schedule.is_active" class="text-xs text-gray-400">Inactivo</span>
            </div>

            <div class="flex items-center gap-1">
              <!-- Toggle activo/inactivo -->
              <button
                type="button"
                @click="toggleScheduleActive(index)"
                class="p-1 rounded hover:bg-gray-100"
                :title="schedule.is_active ? 'Desactivar' : 'Activar'"
              >
                <svg v-if="schedule.is_active" class="h-4 w-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                <svg v-else class="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                </svg>
              </button>

              <!-- Eliminar -->
              <button
                type="button"
                @click="removeLocalSchedule(index)"
                class="p-1 rounded hover:bg-red-50 text-red-600 hover:text-red-900"
                title="Eliminar"
              >
                <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Buttons -->
      <div class="flex justify-end gap-3 pt-4 border-t border-gray-200">
        <button
          type="button"
          @click="$emit('cancel')"
          class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          :disabled="loading"
        >
          Cancelar
        </button>
        <button
          type="submit"
          class="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          :disabled="loading || sameLocationError"
        >
          <span v-if="loading" class="inline-flex items-center">
            <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Guardando...
          </span>
          <span v-else>{{ isEditing ? 'Actualizar' : 'Crear' }}</span>
        </button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { getAllLocations } from '~/services/locationService'

let localIdCounter = 0

const props = defineProps({
  route: {
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
  }
})

const emit = defineEmits(['submit', 'cancel'])

const locations = ref([])
const newScheduleTime = ref('')
const scheduleError = ref('')
const localSchedules = ref([])

const form = ref({
  origin_location_id: '',
  destination_location_id: '',
  distance: '',
  duration: '',
  price: ''
})

const sameLocationError = computed(() => {
  return form.value.origin_location_id &&
    form.value.destination_location_id &&
    form.value.origin_location_id === form.value.destination_location_id
})

const availableOrigins = computed(() => locations.value)

const availableDestinations = computed(() => {
  return locations.value.filter(loc => loc.id !== form.value.origin_location_id)
})

const sortedLocalSchedules = computed(() => {
  return [...localSchedules.value].sort((a, b) => {
    return a.departure_time.localeCompare(b.departure_time)
  })
})

const formatTime = (timeStr) => {
  if (!timeStr) return ''
  const parts = timeStr.split(':')
  const hours = parseInt(parts[0])
  const minutes = parts[1]
  return `${hours.toString().padStart(2, '0')}:${minutes}`
}

const addLocalSchedule = () => {
  if (!newScheduleTime.value) return
  scheduleError.value = ''

  const timeWithSeconds = newScheduleTime.value.length === 5
    ? newScheduleTime.value + ':00'
    : newScheduleTime.value

  // Check for duplicates
  const exists = localSchedules.value.some(s => {
    const existing = s.departure_time.substring(0, 5)
    return existing === newScheduleTime.value.substring(0, 5)
  })

  if (exists) {
    scheduleError.value = 'Este horario ya existe'
    return
  }

  localSchedules.value.push({
    _localId: ++localIdCounter,
    departure_time: timeWithSeconds,
    is_active: true,
    _isNew: true
  })

  newScheduleTime.value = ''
}

const removeLocalSchedule = (index) => {
  // Find the actual item from the sorted list
  const sortedItem = sortedLocalSchedules.value[index]
  const realIndex = localSchedules.value.findIndex(s =>
    (s._localId && s._localId === sortedItem._localId) ||
    (s.id && s.id === sortedItem.id)
  )
  if (realIndex !== -1) {
    localSchedules.value.splice(realIndex, 1)
  }
}

const toggleScheduleActive = (index) => {
  const sortedItem = sortedLocalSchedules.value[index]
  const realIndex = localSchedules.value.findIndex(s =>
    (s._localId && s._localId === sortedItem._localId) ||
    (s.id && s.id === sortedItem.id)
  )
  if (realIndex !== -1) {
    localSchedules.value[realIndex].is_active = !localSchedules.value[realIndex].is_active
  }
}

const loadLocations = async () => {
  try {
    locations.value = await getAllLocations()
  } catch (err) {
    console.error('Error loading locations:', err)
  }
}

const handleSubmit = () => {
  if (sameLocationError.value) return
  emit('submit', {
    ...form.value,
    schedules: localSchedules.value.map(s => ({
      id: s.id || null,
      departure_time: s.departure_time,
      is_active: s.is_active,
      _isNew: s._isNew || false
    }))
  })
}

watch(() => props.route, (newRoute) => {
  if (newRoute) {
    form.value = {
      origin_location_id: newRoute.origin_location_id,
      destination_location_id: newRoute.destination_location_id,
      distance: newRoute.distance,
      duration: newRoute.duration,
      price: newRoute.price
    }
    // Load existing schedules
    if (newRoute.schedules && newRoute.schedules.length > 0) {
      localSchedules.value = newRoute.schedules.map(s => ({
        id: s.id,
        route_id: s.route_id,
        departure_time: s.departure_time,
        is_active: s.is_active,
        _isNew: false
      }))
    } else {
      localSchedules.value = []
    }
  } else {
    form.value = {
      origin_location_id: '',
      destination_location_id: '',
      distance: '',
      duration: '',
      price: ''
    }
    localSchedules.value = []
  }
}, { immediate: true })

onMounted(() => {
  loadLocations()
})
</script>
