<template>
  <div class="bg-white rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
    <!-- Header -->
    <div class="px-6 py-4 border-b border-gray-200">
      <div class="flex items-center justify-between">
        <div>
          <h3 class="text-lg font-semibold text-gray-900">Horarios de Salida</h3>
          <p class="text-sm text-gray-500 mt-1">
            {{ route?.origin_location?.name }} → {{ route?.destination_location?.name }}
          </p>
        </div>
        <button @click="$emit('close')" class="text-gray-400 hover:text-gray-500">
          <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>

    <!-- Agregar nuevo horario -->
    <div class="px-6 py-4 border-b border-gray-200">
      <div class="flex gap-2 items-end">
        <div class="flex-1">
          <label for="new-time" class="block text-sm font-medium text-gray-700">Nuevo horario</label>
          <input
            id="new-time"
            type="time"
            v-model="newTime"
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        </div>
        <button
          @click="addSchedule"
          :disabled="!newTime || addingSchedule"
          class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
        >
          <svg v-if="addingSchedule" class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Agregar
        </button>
      </div>
      <p v-if="errorMessage" class="mt-2 text-sm text-red-600">{{ errorMessage }}</p>
    </div>

    <!-- Lista de horarios -->
    <div class="px-6 py-4">
      <div v-if="sortedSchedules.length === 0" class="text-center py-6">
        <svg class="mx-auto h-10 w-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p class="mt-2 text-sm text-gray-500">No hay horarios configurados</p>
      </div>

      <div v-else class="space-y-2">
        <div
          v-for="schedule in sortedSchedules"
          :key="schedule.id"
          class="flex items-center justify-between p-3 rounded-lg border"
          :class="schedule.is_active ? 'border-gray-200 bg-white' : 'border-gray-100 bg-gray-50'"
        >
          <div class="flex items-center gap-3">
            <span
              class="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold"
              :class="schedule.is_active ? 'bg-indigo-100 text-indigo-800' : 'bg-gray-200 text-gray-500'"
            >
              <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {{ formatTime(schedule.departure_time) }}
            </span>
            <span v-if="!schedule.is_active" class="text-xs text-gray-400">Inactivo</span>
          </div>

          <div class="flex items-center gap-1">
            <!-- Toggle activo/inactivo -->
            <button
              @click="toggleActive(schedule)"
              class="p-1.5 rounded hover:bg-gray-100"
              :title="schedule.is_active ? 'Desactivar' : 'Activar'"
            >
              <svg v-if="schedule.is_active" class="h-5 w-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              <svg v-else class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
              </svg>
            </button>

            <!-- Eliminar -->
            <button
              @click="removeSchedule(schedule)"
              class="p-1.5 rounded hover:bg-red-50 text-red-600 hover:text-red-900"
              title="Eliminar"
            >
              <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Footer -->
    <div class="px-6 py-3 border-t border-gray-200 flex justify-end">
      <button
        @click="$emit('close')"
        class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
      >
        Cerrar
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  route: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['close', 'add', 'update', 'remove'])

const newTime = ref('')
const addingSchedule = ref(false)
const errorMessage = ref('')

const sortedSchedules = computed(() => {
  if (!props.route?.schedules) return []
  return [...props.route.schedules].sort((a, b) => {
    return a.departure_time.localeCompare(b.departure_time)
  })
})

const formatTime = (timeStr) => {
  if (!timeStr) return ''
  // Handle "HH:MM:SS" or "HH:MM" format
  const parts = timeStr.split(':')
  const hours = parseInt(parts[0])
  const minutes = parts[1]
  return `${hours.toString().padStart(2, '0')}:${minutes}`
}

const addSchedule = async () => {
  if (!newTime.value) return
  addingSchedule.value = true
  errorMessage.value = ''
  try {
    await emit('add', props.route.id, { departure_time: newTime.value + ':00', is_active: true })
    newTime.value = ''
  } catch (err) {
    errorMessage.value = err?.data?.detail || err?.message || 'Error al agregar horario'
  } finally {
    addingSchedule.value = false
  }
}

const toggleActive = async (schedule) => {
  try {
    await emit('update', props.route.id, schedule.id, { is_active: !schedule.is_active })
  } catch (err) {
    errorMessage.value = err?.data?.detail || err?.message || 'Error al actualizar horario'
  }
}

const removeSchedule = async (schedule) => {
  try {
    await emit('remove', props.route.id, schedule.id)
  } catch (err) {
    errorMessage.value = err?.data?.detail || err?.message || 'Error al eliminar horario'
  }
}
</script>
