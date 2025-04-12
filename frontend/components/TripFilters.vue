<template>
  <div class="bg-white shadow-md rounded-lg p-6 mb-6">
    <h3 class="text-lg font-medium text-gray-900 mb-4">Filtros</h3>
    
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <!-- Origen -->
      <div>
        <label for="origin" class="block text-sm font-medium text-gray-700 mb-1">Origen</label>
        <select 
          id="origin" 
          v-model="filters.origin"
          class="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        >
          <option value="">Todos</option>
          <option v-for="location in locations" :key="location" :value="location">
            {{ location }}
          </option>
        </select>
      </div>
      
      <!-- Destino -->
      <div>
        <label for="destination" class="block text-sm font-medium text-gray-700 mb-1">Destino</label>
        <select 
          id="destination" 
          v-model="filters.destination"
          class="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        >
          <option value="">Todos</option>
          <option v-for="location in locations" :key="location" :value="location">
            {{ location }}
          </option>
        </select>
      </div>
      
      <!-- Fecha -->
      <div>
        <label for="date" class="block text-sm font-medium text-gray-700 mb-1">Fecha</label>
        <input 
          type="date" 
          id="date" 
          v-model="filters.date"
          class="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
      </div>
      
      <!-- Estado -->
      <div>
        <label for="status" class="block text-sm font-medium text-gray-700 mb-1">Estado</label>
        <select 
          id="status" 
          v-model="filters.status"
          class="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        >
          <option value="">Todos</option>
          <option value="scheduled">Programado</option>
          <option value="in_progress">En progreso</option>
          <option value="completed">Completado</option>
          <option value="cancelled">Cancelado</option>
        </select>
      </div>
    </div>
    
    <div class="mt-4 flex justify-end space-x-3">
      <button 
        @click="resetFilters"
        class="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
      >
        Limpiar
      </button>
      <button 
        @click="applyFilters"
        class="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
      >
        Aplicar
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'

const props = defineProps({
  initialFilters: {
    type: Object,
    default: () => ({})
  }
})

const emit = defineEmits(['filter-change'])

// Lista de ubicaciones (normalmente vendría del backend)
const locations = [
  'Santa Cruz',
  'Comarapa',
  'Cochabamba',
  'La Paz',
  'Sucre',
  'Tarija',
  'Oruro',
  'Potosí',
  'Trinidad',
  'Cobija'
]

// Estado de los filtros
const filters = reactive({
  origin: props.initialFilters.origin || '',
  destination: props.initialFilters.destination || '',
  date: props.initialFilters.date || '',
  status: props.initialFilters.status || ''
})

// Aplicar filtros
const applyFilters = () => {
  emit('filter-change', { ...filters })
}

// Resetear filtros
const resetFilters = () => {
  filters.origin = ''
  filters.destination = ''
  filters.date = ''
  filters.status = ''
  emit('filter-change', { ...filters })
}
</script>
