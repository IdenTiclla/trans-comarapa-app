<template>
  <div class="bg-white rounded-lg shadow-md overflow-hidden">
    <div class="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
      <h3 class="text-lg font-semibold text-gray-900">Detalles del Usuario</h3>
      <button 
        @click="$emit('close')" 
        class="text-gray-500 hover:text-gray-700 transition-colors duration-200"
        title="Cerrar"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
    
    <div v-if="loading" class="p-10 text-center">
      <svg class="animate-spin h-10 w-10 text-indigo-500 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
      <p class="mt-4 text-gray-600">Cargando información del usuario...</p>
    </div>
    
    <div v-else-if="error" class="p-10 text-center">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10 text-red-500 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <p class="mt-4 text-red-600">{{ error }}</p>
      <button 
        @click="$emit('refresh')" 
        class="mt-4 px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
      >
        Intentar nuevamente
      </button>
    </div>
    
    <div v-else class="p-6">
      <!-- Cabecera con avatar y nombre -->
      <div class="flex flex-col sm:flex-row items-center sm:items-start mb-8">
        <div class="h-24 w-24 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-3xl font-semibold text-white shadow-md">
          {{ getInitials(user.firstname, user.lastname) }}
        </div>
        <div class="mt-4 sm:mt-0 sm:ml-6 text-center sm:text-left">
          <h2 class="text-2xl font-bold text-gray-900">{{ user.firstname }} {{ user.lastname }}</h2>
          <p class="text-gray-600">@{{ user.username }}</p>
          <div class="mt-2 flex flex-wrap justify-center sm:justify-start gap-2">
            <span :class="getRoleBadgeClass(user.role)" class="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full">
              {{ getRoleLabel(user.role) }}
            </span>
            <span :class="user.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'" class="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full">
              {{ user.is_active ? 'Activo' : 'Inactivo' }}
            </span>
            <span v-if="user.is_admin" class="bg-purple-100 text-purple-800 px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full">
              Administrador
            </span>
          </div>
        </div>
      </div>
      
      <!-- Información principal -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <div class="bg-gray-50 rounded-lg p-6 shadow-sm">
          <h4 class="font-medium text-gray-700 border-b pb-2 mb-4 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Información de Cuenta
          </h4>
          
          <div class="space-y-4">
            <div class="flex justify-between">
              <p class="text-sm text-gray-500">ID de Usuario</p>
              <p class="font-medium text-gray-900">{{ user.id }}</p>
            </div>
            
            <div class="flex justify-between">
              <p class="text-sm text-gray-500">Correo Electrónico</p>
              <p class="font-medium text-gray-900">{{ user.email }}</p>
            </div>
            
            <div class="flex justify-between">
              <p class="text-sm text-gray-500">Fecha de Creación</p>
              <p class="font-medium text-gray-900">{{ formatDate(user.created_at) }}</p>
            </div>
            
            <div class="flex justify-between">
              <p class="text-sm text-gray-500">Última Actualización</p>
              <p class="font-medium text-gray-900">{{ formatDate(user.updated_at) }}</p>
            </div>
          </div>
        </div>
        
        <div v-if="user.related_entity" class="bg-gray-50 rounded-lg p-6 shadow-sm">
          <h4 class="font-medium text-gray-700 border-b pb-2 mb-4 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Información de {{ getRoleLabel(user.role) }}
          </h4>
          
          <div class="space-y-4">
            <div v-if="user.related_entity.entity_id" class="flex justify-between">
              <p class="text-sm text-gray-500">ID de {{ getRoleLabel(user.role) }}</p>
              <p class="font-medium text-gray-900">{{ user.related_entity.entity_id }}</p>
            </div>
            
            <div v-if="user.related_entity.phone" class="flex justify-between">
              <p class="text-sm text-gray-500">Teléfono</p>
              <p class="font-medium text-gray-900">{{ user.related_entity.phone }}</p>
            </div>
            
            <div v-if="user.related_entity.birth_date" class="flex justify-between">
              <p class="text-sm text-gray-500">Fecha de Nacimiento</p>
              <p class="font-medium text-gray-900">{{ formatDate(user.related_entity.birth_date) }}</p>
            </div>
            
            <div v-if="user.related_entity.license_number" class="flex justify-between">
              <p class="text-sm text-gray-500">Número de Licencia</p>
              <p class="font-medium text-gray-900">{{ user.related_entity.license_number }}</p>
            </div>
            
            <div v-if="user.related_entity.experience_years !== undefined" class="flex justify-between">
              <p class="text-sm text-gray-500">Años de Experiencia</p>
              <p class="font-medium text-gray-900">{{ user.related_entity.experience_years }}</p>
            </div>
            
            <div v-if="user.related_entity.address" class="flex justify-between">
              <p class="text-sm text-gray-500">Dirección</p>
              <p class="font-medium text-gray-900">{{ user.related_entity.address }}</p>
            </div>
            
            <div v-if="user.related_entity.city" class="flex justify-between">
              <p class="text-sm text-gray-500">Ciudad</p>
              <p class="font-medium text-gray-900">{{ user.related_entity.city }}</p>
            </div>
            
            <div v-if="user.related_entity.state" class="flex justify-between">
              <p class="text-sm text-gray-500">Estado/Provincia</p>
              <p class="font-medium text-gray-900">{{ user.related_entity.state }}</p>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Botones de acción -->
      <div class="mt-8 flex flex-wrap justify-end gap-3">
        <button 
          @click="$emit('edit', user)" 
          class="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
        >
          <span class="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Editar Usuario
          </span>
        </button>
        <button 
          v-if="user.is_active" 
          @click="$emit('deactivate', user)" 
          class="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-yellow-600 hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 transition-colors duration-200"
        >
          <span class="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
            </svg>
            Desactivar Usuario
          </span>
        </button>
        <button 
          v-else 
          @click="$emit('activate', user)" 
          class="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors duration-200"
        >
          <span class="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Activar Usuario
          </span>
        </button>
        <button 
          @click="$emit('delete', user)" 
          class="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-200"
        >
          <span class="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Eliminar Usuario
          </span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  user: {
    type: Object,
    default: () => ({})
  },
  loading: {
    type: Boolean,
    default: false
  },
  error: {
    type: String,
    default: null
  }
})

const emit = defineEmits(['close', 'edit', 'delete', 'activate', 'deactivate', 'refresh'])

// Funciones auxiliares
const getInitials = (firstname, lastname) => {
  const first = firstname ? firstname.charAt(0).toUpperCase() : ''
  const last = lastname ? lastname.charAt(0).toUpperCase() : ''
  return `${first}${last}`
}

const formatDate = (dateString) => {
  if (!dateString) return 'N/A'
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric'
  }).format(date)
}

const getRoleLabel = (role) => {
  switch (role) {
    case 'admin':
      return 'Administrador'
    case 'secretary':
      return 'Secretaria'
    case 'driver':
      return 'Conductor'
    case 'assistant':
      return 'Asistente'
    case 'client':
      return 'Cliente'
    default:
      return role
  }
}

const getRoleBadgeClass = (role) => {
  switch (role) {
    case 'admin':
      return 'bg-purple-100 text-purple-800'
    case 'secretary':
      return 'bg-blue-100 text-blue-800'
    case 'driver':
      return 'bg-green-100 text-green-800'
    case 'assistant':
      return 'bg-yellow-100 text-yellow-800'
    case 'client':
      return 'bg-gray-100 text-gray-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}
</script>
