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
import { ref, onMounted } from 'vue'

const props = defineProps({
  limit: {
    type: Number,
    default: 5
  }
})

const emit = defineEmits(['view-all'])

const sales = ref([])
const loading = ref(true)
const error = ref(null)

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
    // Simulación de datos para desarrollo
    await new Promise(resolve => setTimeout(resolve, 800))
    
    // Datos de ejemplo
    sales.value = [
      {
        id: 1,
        client_name: 'Juan Pérez',
        type: 'ticket',
        reference: 'T-12345',
        amount: 150.00,
        date: new Date(Date.now() - 1800000).toISOString() // 30 minutos atrás
      },
      {
        id: 2,
        client_name: 'María López',
        type: 'package',
        reference: 'P-54321',
        amount: 75.50,
        date: new Date(Date.now() - 3600000).toISOString() // 1 hora atrás
      },
      {
        id: 3,
        client_name: 'Carlos Rodríguez',
        type: 'ticket',
        reference: 'T-12346',
        amount: 200.00,
        date: new Date(Date.now() - 5400000).toISOString() // 1.5 horas atrás
      },
      {
        id: 4,
        client_name: 'Ana Martínez',
        type: 'ticket',
        reference: 'T-12347',
        amount: 150.00,
        date: new Date(Date.now() - 7200000).toISOString() // 2 horas atrás
      }
    ]
  } catch (err) {
    console.error('Error al cargar las ventas:', err)
    error.value = 'No se pudieron cargar las ventas. Intente nuevamente.'
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchRecentSales()
})
</script>
