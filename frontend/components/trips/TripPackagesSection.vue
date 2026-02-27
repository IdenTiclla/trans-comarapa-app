<template>
  <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
    <!-- Header -->
    <div class="bg-gradient-to-r from-indigo-50 to-purple-50 px-4 sm:px-6 py-4 border-b border-gray-200">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="flex items-center justify-center w-10 h-10 bg-indigo-100 rounded-lg">
            <svg class="h-5 w-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
          <div>
            <h3 class="text-lg font-semibold text-gray-900">Encomiendas</h3>
            <p class="text-sm text-gray-500">{{ tripPackages.length }} encomienda{{ tripPackages.length !== 1 ? 's' : '' }} cargadas</p>
          </div>
        </div>
        <button
          @click="$emit('open-assign-modal')"
          class="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm transition-colors"
        >
          <svg class="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Cargar Encomienda
        </button>
      </div>
    </div>

    <!-- Body -->
    <div class="p-4 sm:p-6">
      <!-- Loading -->
      <div v-if="isLoading" class="flex justify-center py-8">
        <svg class="animate-spin h-8 w-8 text-indigo-500" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      </div>

      <!-- Empty state -->
      <div v-else-if="tripPackages.length === 0" class="text-center py-8">
        <div class="flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mx-auto mb-4">
          <svg class="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
        </div>
        <p class="text-gray-500 font-medium">No hay encomiendas cargadas en este viaje</p>
        <p class="text-sm text-gray-400 mt-1">Presione "Cargar Encomienda" para asignar paquetes</p>
      </div>

      <!-- Package list -->
      <div v-else class="space-y-3">
        <!-- Summary bar -->
        <div class="flex items-center justify-between p-3 bg-indigo-50 rounded-lg border border-indigo-200">
          <div class="flex items-center gap-4 text-sm">
            <span class="text-indigo-700 font-medium">📦 {{ tripPackages.length }} encomiendas</span>
            <span class="text-indigo-600">💰 Total: Bs. {{ totalAmount.toFixed(2) }}</span>
          </div>
        </div>

        <!-- Package items -->
        <div
          v-for="pkg in tripPackages"
          :key="pkg.id"
          class="flex items-center justify-between p-4 rounded-lg border border-gray-200 hover:border-indigo-200 bg-white transition-colors"
        >
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2 flex-wrap">
              <span class="text-sm font-semibold text-gray-900">#{{ pkg.tracking_number }}</span>
              <span :class="[getStatusBg(pkg.status), getStatusText(pkg.status), 'px-2 py-0.5 text-xs font-medium rounded-full']">
                {{ getStatusLabel(pkg.status) }}
              </span>
            </div>
            <div class="flex items-center text-sm text-gray-500 mt-1 gap-3">
              <span>📤 {{ pkg.sender_name || 'N/A' }}</span>
              <span class="text-gray-300">→</span>
              <span>📥 {{ pkg.recipient_name || 'N/A' }}</span>
            </div>
            <div class="text-xs text-gray-400 mt-0.5">
              {{ pkg.total_items_count || 0 }} items · Bs. {{ (pkg.total_amount || 0).toFixed(2) }}
            </div>
          </div>

          <!-- Actions -->
          <div class="flex items-center gap-2 ml-3 flex-shrink-0">
            <button
              v-if="pkg.status === 'assigned_to_trip'"
              @click="$emit('unassign-package', pkg.id)"
              class="text-sm text-red-600 hover:text-red-800 font-medium px-2 py-1 rounded hover:bg-red-50 transition-colors"
              title="Quitar del viaje"
            >
              <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  tripPackages: {
    type: Array,
    default: () => []
  },
  isLoading: {
    type: Boolean,
    default: false
  }
})

defineEmits(['open-assign-modal', 'unassign-package'])

const totalAmount = computed(() => {
  return props.tripPackages.reduce((sum, pkg) => sum + (pkg.total_amount || 0), 0)
})

const getStatusLabel = (status) => {
  const labels = {
    registered_at_office: 'En oficina',
    assigned_to_trip: 'Asignada a viaje',
    in_transit: 'En tránsito',
    arrived_at_destination: 'En destino',
    delivered: 'Entregada'
  }
  return labels[status] || status
}

const getStatusBg = (status) => {
  const colors = {
    registered_at_office: 'bg-yellow-100',
    assigned_to_trip: 'bg-blue-100',
    in_transit: 'bg-orange-100',
    arrived_at_destination: 'bg-emerald-100',
    delivered: 'bg-green-100'
  }
  return colors[status] || 'bg-gray-100'
}

const getStatusText = (status) => {
  const colors = {
    registered_at_office: 'text-yellow-800',
    assigned_to_trip: 'text-blue-800',
    in_transit: 'text-orange-800',
    arrived_at_destination: 'text-emerald-800',
    delivered: 'text-green-800'
  }
  return colors[status] || 'text-gray-800'
}
</script>
