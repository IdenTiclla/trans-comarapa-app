<template>
  <div class="bg-white rounded-lg shadow p-6">
    <h3 class="text-lg font-semibold text-gray-900 mb-4">Búsqueda Rápida</h3>
    
    <div class="space-y-4">
      <div>
        <FormSelect
          id="search-type"
          label="Buscar por"
          v-model="searchType"
          :options="[
            { value: 'client', label: 'Cliente' },
            { value: 'ticket', label: 'Boleto' },
            { value: 'trip', label: 'Viaje' },
            { value: 'package', label: 'Paquete' }
          ]"
        />
      </div>
      
      <div>
        <FormInput
          id="search-query"
          :label="getSearchLabel()"
          v-model="searchQuery"
          type="text"
          :placeholder="getSearchPlaceholder()"
          @keyup.enter="handleSearch"
        >
          <template #suffix>
            <div class="absolute inset-y-0 right-0 flex items-center pr-3">
              <button @click="handleSearch" class="text-gray-400 hover:text-gray-500 hover:bg-transparent border-none p-0 bg-transparent flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
            </div>
          </template>
        </FormInput>
      </div>
      
      <div class="pt-2">
        <button
          @click="handleSearch"
          class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Buscar
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import FormInput from '~/components/forms/FormInput.vue'
import FormSelect from '~/components/forms/FormSelect.vue'

const router = useRouter()
const searchType = ref('client')
const searchQuery = ref('')

const getSearchLabel = () => {
  switch (searchType.value) {
    case 'client':
      return 'Nombre o CI del cliente'
    case 'ticket':
      return 'Número de boleto'
    case 'trip':
      return 'Origen o destino'
    case 'package':
      return 'Número de paquete o destinatario'
    default:
      return 'Término de búsqueda'
  }
}

const getSearchPlaceholder = () => {
  switch (searchType.value) {
    case 'client':
      return 'Ej: Juan Pérez o 12345678'
    case 'ticket':
      return 'Ej: T-12345'
    case 'trip':
      return 'Ej: Santa Cruz o Comarapa'
    case 'package':
      return 'Ej: P-12345 o María López'
    default:
      return 'Ingrese término de búsqueda'
  }
}

const handleSearch = () => {
  if (!searchQuery.value.trim()) return
  
  // Aquí implementarías la lógica de búsqueda
  // Por ahora, simplemente navegamos a una página de resultados simulada
  router.push({
    path: `/search-results`,
    query: {
      type: searchType.value,
      q: searchQuery.value
    }
  })
}
</script>
