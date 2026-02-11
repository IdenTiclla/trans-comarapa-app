<template>
  <div class="bg-white rounded-2xl border border-gray-200 transition-all duration-300 hover:shadow-xl hover:border-gray-300 transform hover:-translate-y-1 p-6 flex flex-col justify-between shadow-lg focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-offset-2">
    <!-- Header Section -->
    <div class="flex justify-between items-start mb-4">
      <div class="flex-1 min-w-0">
        <div class="flex items-center space-x-3 mb-2">
          <div class="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl shadow-lg flex-shrink-0">
            <span class="text-white font-bold text-sm">
              {{ client.initials || getInitials(client.full_name || `${client.firstname} ${client.lastname}`) }}
            </span>
          </div>
          <div class="min-w-0 flex-1">
            <h3 class="text-lg font-bold text-gray-900 truncate">
              {{ client.full_name || `${client.firstname} ${client.lastname}` }}
            </h3>
            <div class="flex items-center space-x-2 text-sm text-gray-700">
              <!-- Mostrar categoría de edad si está disponible -->
              <span v-if="client.age_category" 
                    class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium"
                    :class="getAgeCategoryClass(client.age_category)">
                {{ getAgeCategoryIcon(client.age_category) }} {{ getAgeCategoryLabel(client.age_category) }}
              </span>
              <!-- Fallback para is_minor si no hay age_category -->
              <span v-else-if="client.is_minor !== undefined" 
                    class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium"
                    :class="client.is_minor ? 'bg-orange-100 text-orange-800' : 'bg-blue-100 text-blue-800'">
                {{ client.is_minor ? '👶 Menor' : '👤 Adulto' }}
              </span>
              <!-- Mostrar edad si está disponible -->
              <span v-if="client.age !== undefined" class="text-xs text-gray-600">
                {{ client.age }} años
              </span>
            </div>
          </div>
        </div>
      </div>
      <div class="flex items-center space-x-1 flex-shrink-0">
        <span :class="getStatusClass()">
          {{ getStatusText() }}
        </span>
      </div>
    </div>

    <!-- Client Information -->
    <div class="space-y-4 mb-6">
      <!-- Document ID -->
      <div class="flex items-center space-x-3">
        <div class="flex items-center justify-center w-8 h-8 bg-gray-100 rounded-lg flex-shrink-0">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <div class="min-w-0 flex-1">
          <p class="text-sm text-gray-600 font-medium">Documento</p>
          <p class="text-sm font-semibold text-gray-900 truncate">
            {{ client.document_id || 'Sin CI' }}
          </p>
        </div>
      </div>

      <!-- Phone -->
      <div class="flex items-center space-x-3">
        <div class="flex items-center justify-center w-8 h-8 bg-green-100 rounded-lg flex-shrink-0">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
          </svg>
        </div>
        <div class="min-w-0 flex-1">
          <p class="text-sm text-gray-600 font-medium">Teléfono</p>
          <p class="text-sm font-semibold text-gray-900 truncate">
            {{ client.phone || 'Sin teléfono' }}
          </p>
        </div>
      </div>

      <!-- Email -->
      <div v-if="client.email" class="flex items-center space-x-3">
        <div class="flex items-center justify-center w-8 h-8 bg-purple-100 rounded-lg flex-shrink-0">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 7.89a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>
        <div class="min-w-0 flex-1">
          <p class="text-sm text-gray-600 font-medium">Email</p>
          <p class="text-sm font-semibold text-gray-900 truncate">
            {{ client.email }}
          </p>
        </div>
      </div>

      <!-- Location -->
      <div v-if="client.city || client.state" class="flex items-center space-x-3">
        <div class="flex items-center justify-center w-8 h-8 bg-orange-100 rounded-lg flex-shrink-0">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </div>
        <div class="min-w-0 flex-1">
          <p class="text-sm text-gray-600 font-medium">Ubicación</p>
          <p class="text-sm font-semibold text-gray-900 truncate">
            {{ [client.city, client.state].filter(Boolean).join(', ') || 'Sin ubicación' }}
          </p>
        </div>
      </div>
    </div>

    <!-- Registration Date -->
    <div class="border-t border-gray-200 pt-4 mb-6">
      <div class="flex items-center justify-between text-sm">
        <span class="text-gray-600">Registrado:</span>
        <span class="font-medium text-gray-900">{{ formatDate(client.created_at) }}</span>
      </div>
    </div>

    <!-- Actions -->
    <div class="flex space-x-2">
      <button
        @click="$emit('view-client', client)"
        class="flex-1 inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 hover:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200"
        :aria-label="`Ver detalles de ${client.full_name || `${client.firstname} ${client.lastname}`}`"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
        <span>Ver</span>
      </button>

      <button
        @click="$emit('edit-client', client)"
        class="flex-1 inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-indigo-700 bg-indigo-50 border border-indigo-200 rounded-lg hover:bg-indigo-100 hover:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all duration-200"
        :aria-label="`Editar ${client.full_name || `${client.firstname} ${client.lastname}`}`"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
        <span>Editar</span>
      </button>

      <button
        @click="$emit('delete-client', client)"
        class="px-3 py-2 text-sm font-medium text-red-700 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 hover:border-red-300 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-all duration-200"
        :aria-label="`Eliminar ${client.full_name || `${client.firstname} ${client.lastname}`}`"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  client: {
    type: Object,
    required: true,
  },
})

defineEmits(['view-client', 'edit-client', 'delete-client'])

// Methods
const getInitials = (name) => {
  if (!name) return 'CL'
  const parts = name.split(' ')
  if (parts.length >= 2) {
    return (parts[0].charAt(0) + parts[1].charAt(0)).toUpperCase()
  }
  return name.charAt(0).toUpperCase() + (name.charAt(1) || '').toUpperCase()
}

const getAgeCategoryClass = (category) => {
  switch (category) {
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

const getAgeCategoryIcon = (category) => {
  switch (category) {
    case 'senior':
      return '👴'
    case 'adult':
      return '👤'
    case 'minor':
      return '👶'
    default:
      return '👤'
  }
}

const getAgeCategoryLabel = (category) => {
  switch (category) {
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

const getStatusText = () => {
  if (props.client.status === 'active') return 'Activo'
  return 'Inactivo'
}

const getStatusClass = () => {
  if (props.client.status === 'active') {
    return 'inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800 border border-green-200'
  }
  return 'inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800 border border-red-200'
}

const formatDate = (dateTimeString) => {
  if (!dateTimeString) return 'Fecha no disponible'
  try {
    const date = new Date(dateTimeString)
    return new Intl.DateTimeFormat('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).format(date)
  } catch (error) {
    return 'Fecha inválida'
  }
}
</script> 