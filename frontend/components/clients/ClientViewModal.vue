<template>
  <div v-if="show" class="fixed inset-0 z-50 overflow-y-auto">
    <div class="flex items-center justify-center min-h-screen pt-4 px-4 pb-20">
      <div class="fixed inset-0 bg-gray-500 bg-opacity-75" @click="$emit('close')"></div>
      
      <div class="bg-white rounded-2xl p-6 max-w-4xl w-full shadow-xl relative">
        <div class="flex items-center justify-between mb-6">
          <div>
            <h3 class="text-2xl font-bold text-gray-900">
              {{ client?.full_name || getClientName(client) }}
            </h3>
            <div class="flex items-center space-x-3 mt-2">
              <span v-if="client?.initials" class="inline-flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
                {{ client.initials }}
              </span>
              <span v-if="client?.age !== undefined" class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium"
                    :class="getAgeColorClass(client.age_category)">
                {{ client.age }} años ({{ getAgeLabel(client.age_category) }})
              </span>
              <span v-if="client?.is_minor === false" class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                Mayor de edad
              </span>
            </div>
          </div>
          <button @click="$emit('close')" class="text-gray-400 hover:text-gray-500">
            <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <!-- Información Personal -->
          <div class="space-y-4">
            <h4 class="text-lg font-semibold text-gray-900 border-b pb-2">Información Personal</h4>
            <div>
              <label class="text-sm font-medium text-gray-500">Nombres</label>
              <p class="text-gray-900 font-medium">{{ client?.firstname || 'No registrado' }}</p>
            </div>
            <div>
              <label class="text-sm font-medium text-gray-500">Apellidos</label>
              <p class="text-gray-900 font-medium">{{ client?.lastname || 'No registrado' }}</p>
            </div>
            <div>
              <label class="text-sm font-medium text-gray-500">Documento de Identidad</label>
              <p class="text-gray-900 font-mono">{{ client?.document_id || 'No registrado' }}</p>
            </div>
            <div v-if="client?.birth_date">
              <label class="text-sm font-medium text-gray-500">Fecha de Nacimiento</label>
              <p class="text-gray-900">{{ formatDate(client.birth_date) }}</p>
            </div>
          </div>

          <!-- Información de Contacto -->
          <div class="space-y-4">
            <h4 class="text-lg font-semibold text-gray-900 border-b pb-2">Contacto</h4>
            <div>
              <label class="text-sm font-medium text-gray-500">Teléfono</label>
              <p class="text-gray-900 font-mono">{{ client?.phone || 'No registrado' }}</p>
            </div>
            <div>
              <label class="text-sm font-medium text-gray-500">Email</label>
              <p class="text-gray-900 break-all">{{ client?.email || 'No registrado' }}</p>
            </div>
            <div>
              <label class="text-sm font-medium text-gray-500">Dirección</label>
              <p class="text-gray-900">{{ client?.address || 'No registrada' }}</p>
            </div>
          </div>

          <!-- Información de Ubicación -->
          <div class="space-y-4">
            <h4 class="text-lg font-semibold text-gray-900 border-b pb-2">Ubicación</h4>
            <div>
              <label class="text-sm font-medium text-gray-500">Ciudad</label>
              <p class="text-gray-900">{{ client?.city || 'No registrada' }}</p>
            </div>
            <div>
              <label class="text-sm font-medium text-gray-500">Departamento</label>
              <p class="text-gray-900">{{ client?.state || 'No registrado' }}</p>
            </div>
            <div v-if="client?.created_at">
              <label class="text-sm font-medium text-gray-500">Cliente desde</label>
              <p class="text-gray-900">{{ formatDate(client.created_at) }}</p>
            </div>
          </div>
        </div>

        <div class="flex justify-between items-center mt-8 pt-6 border-t">
          <div class="text-sm text-gray-500">
            <span v-if="client?.updated_at">
              Última actualización: {{ formatDate(client.updated_at) }}
            </span>
          </div>
          <div class="flex space-x-3">
            <button @click="$emit('close')" 
              class="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400">
              Cerrar
            </button>
            <button @click="$emit('edit', client)" 
              class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              Editar Cliente
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { usePersonData } from '~/composables/usePersonData'

defineProps({
  show: Boolean,
  client: Object
})

const { getEffectiveName } = usePersonData()

// Función auxiliar para obtener el nombre del cliente
const getClientName = (client) => {
  return getEffectiveName(client)
}

// Función para obtener la clase CSS según la categoría de edad
const getAgeColorClass = (ageCategory) => {
  switch (ageCategory) {
    case 'senior':
      return 'bg-purple-100 text-purple-800'
    case 'adult':
      return 'bg-blue-100 text-blue-800'
    case 'minor':
      return 'bg-orange-100 text-orange-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

// Función para obtener la etiqueta de la categoría de edad
const getAgeLabel = (ageCategory) => {
  switch (ageCategory) {
    case 'senior':
      return 'Adulto Mayor'
    case 'adult':
      return 'Adulto'
    case 'minor':
      return 'Menor'
    default:
      return 'N/A'
  }
}

// Función para formatear fechas
const formatDate = (dateString) => {
  if (!dateString) return 'No registrada'
  
  try {
    const date = new Date(dateString)
    return date.toLocaleDateString('es-BO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  } catch (error) {
    return 'Fecha inválida'
  }
}

defineEmits(['close', 'edit'])
</script> 