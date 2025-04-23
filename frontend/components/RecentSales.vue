<template>
  <div class="bg-white rounded-lg shadow overflow-hidden">
    <div class="px-6 py-4 border-b border-gray-200">
      <h3 class="text-lg font-semibold text-gray-900">Ventas Recientes</h3>
    </div>
    <div class="divide-y divide-gray-200">
      <div v-if="loading" class="p-4 text-center">
        <p class="text-gray-500">Cargando ventas...</p>
      </div>
      <div v-else-if="error" class="p-4 text-center">
        <p class="text-red-500">{{ error }}</p>
      </div>
      <div v-else-if="sales.length === 0" class="p-4 text-center">
        <p class="text-gray-500">No hay ventas recientes</p>
      </div>
      <div v-else v-for="sale in sales" :key="sale.id" class="p-4 hover:bg-gray-50">
        <div class="flex justify-between items-center">
          <div>
            <p class="font-medium text-gray-900">{{ sale.client_name }}</p>
            <p class="text-sm text-gray-500">{{ sale.type === 'ticket' ? 'Boleto' : 'Paquete' }} #{{ sale.reference }}</p>
          </div>
          <div class="text-right">
            <p class="text-sm font-medium text-gray-900">Bs. {{ sale.amount.toFixed(2) }}</p>
            <p class="text-sm text-gray-500">{{ formatDate(sale.date) }}</p>
          </div>
        </div>
      </div>
    </div>
    <div class="px-6 py-3 bg-gray-50 text-right">
      <button
        class="text-sm font-medium text-blue-600 hover:text-blue-800"
        @click="$emit('view-all')"
      >
        Ver todas las ventas →
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import salesService from '~/services/salesService'

const props = defineProps({
  limit: {
    type: Number,
    default: 5
  },
  autoRefresh: {
    type: Boolean,
    default: true
  },
  refreshInterval: {
    type: Number,
    default: 60000 // 1 minuto por defecto
  }
})

const emit = defineEmits(['view-all'])

const sales = ref([])
const loading = ref(true)
const error = ref(null)
let refreshTimer = null

// Función para formatear fechas
const formatDate = (dateString) => {
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('es-ES', {
    day: 'numeric',
    month: 'short',
    hour: 'numeric',
    minute: 'numeric'
  }).format(date)
}

// Cargar las ventas recientes
const fetchRecentSales = async () => {
  loading.value = true
  error.value = null

  try {
    const recentSales = await salesService.getRecentSales(props.limit)
    sales.value = recentSales
  } catch (err) {
    console.error('Error al cargar las ventas:', err)
    error.value = 'No se pudieron cargar las ventas. Intente nuevamente.'
  } finally {
    loading.value = false
  }
}

// Configurar actualización automática
const setupAutoRefresh = () => {
  // Limpiar el temporizador existente si hay uno
  if (refreshTimer) {
    clearInterval(refreshTimer)
    refreshTimer = null
  }

  // Configurar nuevo temporizador si autoRefresh está habilitado
  if (props.autoRefresh) {
    refreshTimer = setInterval(() => {
      fetchRecentSales()
    }, props.refreshInterval)
  }
}

// Observar cambios en las propiedades de actualización automática
watch(() => props.autoRefresh, setupAutoRefresh)
watch(() => props.refreshInterval, setupAutoRefresh)

onMounted(() => {
  fetchRecentSales()
  setupAutoRefresh()
})

// Limpiar el temporizador cuando el componente se desmonta
onBeforeUnmount(() => {
  if (refreshTimer) {
    clearInterval(refreshTimer)
    refreshTimer = null
  }
})
</script>
