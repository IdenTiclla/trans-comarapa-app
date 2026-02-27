<template>
  <div v-if="showModal" class="fixed inset-0 z-50 overflow-y-auto">
    <div class="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
      <!-- Overlay -->
      <div class="fixed inset-0 transition-opacity" @click="$emit('close')">
        <div class="absolute inset-0 bg-gray-500 opacity-75"></div>
      </div>

      <span class="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>

      <!-- Modal content -->
      <div
        class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-3xl sm:w-full"
        @click.stop
      >
        <div class="bg-gradient-to-r from-indigo-600 to-indigo-500 px-6 py-4">
          <div class="flex items-center justify-between">
            <div>
              <h3 class="text-lg font-medium text-white">Cargar Encomiendas al Viaje</h3>
              <p class="text-sm text-indigo-200">Seleccione las encomiendas para cargar al bus</p>
            </div>
            <button @click="$emit('close')" class="text-white hover:text-gray-200">
              <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div class="px-6 py-4 max-h-[60vh] overflow-y-auto">
          <!-- Search -->
          <div class="mb-4">
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg class="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                v-model="searchQuery"
                type="text"
                class="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="Buscar por tracking, remitente, destinatario..."
              />
            </div>
          </div>

          <!-- Loading -->
          <div v-if="loading" class="text-center py-8">
            <svg class="animate-spin h-8 w-8 text-indigo-600 mx-auto" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p class="mt-2 text-sm text-gray-500">Cargando encomiendas disponibles...</p>
          </div>

          <!-- Empty -->
          <div v-else-if="filteredPackages.length === 0" class="text-center py-8">
            <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
            <p class="mt-2 text-sm text-gray-500">
              {{ searchQuery ? 'No se encontraron encomiendas' : 'No hay encomiendas pendientes' }}
            </p>
          </div>

          <!-- Package list -->
          <div v-else class="space-y-2">
            <div class="flex items-center justify-between pb-2 border-b border-gray-200">
              <label class="flex items-center cursor-pointer">
                <input type="checkbox" :checked="allSelected" @change="toggleSelectAll"
                  class="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500" />
                <span class="ml-2 text-sm font-medium text-gray-700">Seleccionar todo ({{ filteredPackages.length }})</span>
              </label>
              <span class="text-sm text-gray-500">{{ selectedIds.length }} seleccionadas</span>
            </div>

            <div
              v-for="pkg in filteredPackages"
              :key="pkg.id"
              :class="[
                'flex items-center p-3 rounded-lg border cursor-pointer transition-colors',
                selectedIds.includes(pkg.id) ? 'bg-indigo-50 border-indigo-300' : 'bg-white border-gray-200 hover:bg-gray-50'
              ]"
              @click="toggleSelect(pkg.id)"
            >
              <input type="checkbox" :checked="selectedIds.includes(pkg.id)"
                class="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 flex-shrink-0"
                @click.stop @change="toggleSelect(pkg.id)" />
              <div class="ml-3 flex-1 min-w-0">
                <div class="flex items-center justify-between">
                  <span class="text-sm font-medium text-gray-900">#{{ pkg.tracking_number }}</span>
                  <span class="text-sm font-semibold text-indigo-700">Bs. {{ (pkg.total_amount || 0).toFixed(2) }}</span>
                </div>
                <div class="flex items-center text-xs text-gray-500 mt-1 space-x-3">
                  <span>📤 {{ pkg.sender_name || 'N/A' }}</span>
                  <span>→</span>
                  <span>📥 {{ pkg.recipient_name || 'N/A' }}</span>
                </div>
                <div class="text-xs text-gray-400 mt-0.5">
                  {{ pkg.total_items_count || 0 }} items · {{ formatDate(pkg.created_at) }}
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div class="bg-gray-50 px-6 py-4 flex justify-between items-center border-t border-gray-200">
          <div class="text-sm text-gray-600">
            <span v-if="selectedIds.length > 0" class="font-medium text-indigo-700">
              {{ selectedIds.length }} encomienda{{ selectedIds.length > 1 ? 's' : '' }} seleccionada{{ selectedIds.length > 1 ? 's' : '' }}
            </span>
            <span v-else class="text-gray-400">Ninguna seleccionada</span>
          </div>
          <div class="flex space-x-3">
            <button @click="$emit('close')"
              class="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
              Cancelar
            </button>
            <button @click="confirmAssignment"
              :disabled="selectedIds.length === 0 || assigning"
              class="px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed">
              {{ assigning ? 'Asignando...' : `Cargar ${selectedIds.length || ''} al Viaje` }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { usePackageStore } from '~/stores/packageStore'

const props = defineProps({
  showModal: { type: Boolean, default: false },
  tripId: { type: [Number, String], required: true }
})

const emit = defineEmits(['close', 'packages-assigned'])

const packageStore = usePackageStore()
const searchQuery = ref('')
const selectedIds = ref([])
const loading = ref(false)
const assigning = ref(false)

watch(() => props.showModal, async (newVal) => {
  if (newVal) {
    loading.value = true
    selectedIds.value = []
    searchQuery.value = ''
    try {
      await packageStore.fetchUnassignedPackages()
    } catch (error) {
      console.error('Error loading unassigned packages:', error)
    } finally {
      loading.value = false
    }
  }
})

const filteredPackages = computed(() => {
  const packages = packageStore.getUnassignedPackages || []
  if (!searchQuery.value.trim()) return packages
  const term = searchQuery.value.toLowerCase()
  return packages.filter(pkg =>
    (pkg.tracking_number && pkg.tracking_number.toLowerCase().includes(term)) ||
    (pkg.sender_name && pkg.sender_name.toLowerCase().includes(term)) ||
    (pkg.recipient_name && pkg.recipient_name.toLowerCase().includes(term))
  )
})

const allSelected = computed(() =>
  filteredPackages.value.length > 0 && filteredPackages.value.every(p => selectedIds.value.includes(p.id))
)

const toggleSelect = (id) => {
  const idx = selectedIds.value.indexOf(id)
  if (idx === -1) selectedIds.value.push(id)
  else selectedIds.value.splice(idx, 1)
}

const toggleSelectAll = () => {
  if (allSelected.value) selectedIds.value = []
  else selectedIds.value = filteredPackages.value.map(p => p.id)
}

const confirmAssignment = async () => {
  if (selectedIds.value.length === 0) return
  assigning.value = true
  try {
    for (const pkgId of selectedIds.value) {
      await packageStore.assignToTrip(pkgId, Number(props.tripId))
    }
    emit('packages-assigned')
    emit('close')
  } catch (error) {
    console.error('Error assigning packages:', error)
  } finally {
    assigning.value = false
  }
}

const formatDate = (dateString) => {
  if (!dateString) return 'N/A'
  return new Date(dateString).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })
}
</script>
