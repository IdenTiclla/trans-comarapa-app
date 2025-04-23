<template>
  <div class="bg-white rounded-lg shadow-md overflow-hidden">
    <!-- Cabecera de la tabla -->
    <div class="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
      <h3 class="text-lg font-semibold text-gray-900">Usuarios del Sistema</h3>
      <div class="flex space-x-2">
        <button 
          @click="$emit('refresh')" 
          class="text-gray-500 hover:text-gray-700 transition-colors duration-200"
          title="Actualizar lista"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
        <button 
          @click="$emit('create')" 
          class="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1 rounded text-sm flex items-center transition-colors duration-200"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          Nuevo Usuario
        </button>
      </div>
    </div>

    <!-- Filtros -->
    <div class="px-6 py-3 bg-gray-50 border-b border-gray-200">
      <div class="flex flex-wrap gap-4">
        <div class="flex-1 min-w-[200px]">
          <label class="block text-sm font-medium text-gray-700 mb-1">Buscar</label>
          <div class="relative">
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg class="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clip-rule="evenodd" />
              </svg>
            </div>
            <input 
              v-model="searchTerm" 
              type="text" 
              placeholder="Nombre, email, usuario..." 
              class="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200"
              @input="onSearchInput"
            />
          </div>
        </div>
        <div class="w-40">
          <label class="block text-sm font-medium text-gray-700 mb-1">Rol</label>
          <select 
            v-model="selectedRole" 
            class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200"
            @change="onFilterChange"
          >
            <option value="">Todos</option>
            <option v-for="role in roles" :key="role" :value="role">
              {{ getRoleLabel(role) }}
            </option>
          </select>
        </div>
        <div class="w-40">
          <label class="block text-sm font-medium text-gray-700 mb-1">Estado</label>
          <select 
            v-model="selectedStatus" 
            class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200"
            @change="onFilterChange"
          >
            <option value="">Todos</option>
            <option value="true">Activos</option>
            <option value="false">Inactivos</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Tabla de usuarios -->
    <div class="overflow-x-auto">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Usuario
            </th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Email
            </th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Rol
            </th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Estado
            </th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Creado
            </th>
            <th scope="col" class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Acciones
            </th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-if="loading">
            <td colspan="6" class="px-6 py-10 text-center">
              <div class="flex justify-center">
                <svg class="animate-spin h-8 w-8 text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </div>
              <p class="mt-2 text-sm text-gray-500">Cargando usuarios...</p>
            </td>
          </tr>
          <tr v-else-if="error">
            <td colspan="6" class="px-6 py-4 text-center">
              <div class="flex justify-center text-red-500 mb-2">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p class="text-sm text-red-500">{{ error }}</p>
              <button 
                @click="$emit('refresh')" 
                class="mt-2 text-sm text-indigo-600 hover:text-indigo-800 transition-colors duration-200"
              >
                Intentar nuevamente
              </button>
            </td>
          </tr>
          <tr v-else-if="users.length === 0">
            <td colspan="6" class="px-6 py-10 text-center">
              <div class="flex justify-center text-gray-400 mb-2">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <p class="text-sm text-gray-500">No se encontraron usuarios</p>
              <p v-if="searchTerm || selectedRole || selectedStatus !== ''" class="mt-1 text-sm text-gray-500">
                Prueba a cambiar los filtros de búsqueda
              </p>
            </td>
          </tr>
          <tr v-for="user in users" :key="user.id" class="hover:bg-gray-50 transition-colors duration-150">
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="flex items-center">
                <div class="flex-shrink-0 h-10 w-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-medium">
                  {{ getInitials(user.firstname, user.lastname) }}
                </div>
                <div class="ml-4">
                  <div class="text-sm font-medium text-gray-900">{{ user.firstname }} {{ user.lastname }}</div>
                  <div class="text-sm text-gray-500">@{{ user.username }}</div>
                </div>
              </div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="text-sm text-gray-900">{{ user.email }}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <span :class="getRoleBadgeClass(user.role)" class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full">
                {{ getRoleLabel(user.role) }}
              </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <span :class="user.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'" class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full">
                {{ user.is_active ? 'Activo' : 'Inactivo' }}
              </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              {{ formatDate(user.created_at) }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
              <div class="flex justify-end space-x-2">
                <button @click="$emit('view', user)" class="text-blue-600 hover:text-blue-900 transition-colors duration-200" title="Ver detalles">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </button>
                <button @click="$emit('edit', user)" class="text-indigo-600 hover:text-indigo-900 transition-colors duration-200" title="Editar">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
                <button 
                  v-if="user.is_active" 
                  @click="$emit('deactivate', user)" 
                  class="text-yellow-600 hover:text-yellow-900 transition-colors duration-200" 
                  title="Desactivar"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                  </svg>
                </button>
                <button 
                  v-else 
                  @click="$emit('activate', user)" 
                  class="text-green-600 hover:text-green-900 transition-colors duration-200" 
                  title="Activar"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </button>
                <button @click="$emit('delete', user)" class="text-red-600 hover:text-red-900 transition-colors duration-200" title="Eliminar">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Paginación -->
    <div class="px-6 py-3 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
      <div class="flex-1 flex justify-between sm:hidden">
        <button 
          @click="$emit('page-change', currentPage - 1)" 
          :disabled="currentPage === 1" 
          :class="currentPage === 1 ? 'bg-gray-300 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'"
          class="relative inline-flex items-center px-4 py-2 text-sm font-medium text-white rounded-md transition-colors duration-200"
        >
          Anterior
        </button>
        <button 
          @click="$emit('page-change', currentPage + 1)" 
          :disabled="currentPage === totalPages" 
          :class="currentPage === totalPages ? 'bg-gray-300 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'"
          class="ml-3 relative inline-flex items-center px-4 py-2 text-sm font-medium text-white rounded-md transition-colors duration-200"
        >
          Siguiente
        </button>
      </div>
      <div class="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
        <div>
          <p class="text-sm text-gray-700">
            Mostrando <span class="font-medium">{{ startItem }}</span> a <span class="font-medium">{{ endItem }}</span> de <span class="font-medium">{{ totalItems }}</span> resultados
          </p>
        </div>
        <div>
          <nav class="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
            <button 
              @click="$emit('page-change', currentPage - 1)" 
              :disabled="currentPage === 1" 
              :class="currentPage === 1 ? 'cursor-not-allowed' : 'hover:bg-gray-50'"
              class="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 transition-colors duration-200"
            >
              <span class="sr-only">Anterior</span>
              <svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fill-rule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clip-rule="evenodd" />
              </svg>
            </button>
            <template v-for="page in displayedPages" :key="page">
              <span 
                v-if="page === '...'" 
                class="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700"
              >
                ...
              </span>
              <button 
                v-else 
                @click="$emit('page-change', page)" 
                :class="page === currentPage ? 'z-10 bg-indigo-50 border-indigo-500 text-indigo-600' : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'"
                class="relative inline-flex items-center px-4 py-2 border text-sm font-medium transition-colors duration-200"
              >
                {{ page }}
              </button>
            </template>
            <button 
              @click="$emit('page-change', currentPage + 1)" 
              :disabled="currentPage === totalPages" 
              :class="currentPage === totalPages ? 'cursor-not-allowed' : 'hover:bg-gray-50'"
              class="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 transition-colors duration-200"
            >
              <span class="sr-only">Siguiente</span>
              <svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
              </svg>
            </button>
          </nav>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onBeforeUnmount } from 'vue'

const props = defineProps({
  users: {
    type: Array,
    default: () => []
  },
  loading: {
    type: Boolean,
    default: false
  },
  error: {
    type: String,
    default: null
  },
  roles: {
    type: Array,
    default: () => []
  },
  pagination: {
    type: Object,
    default: () => ({
      total: 0,
      skip: 0,
      limit: 10,
      pages: 1
    })
  },
  currentPage: {
    type: Number,
    default: 1
  }
})

const emit = defineEmits([
  'refresh', 
  'create', 
  'view', 
  'edit', 
  'delete', 
  'activate', 
  'deactivate', 
  'page-change',
  'filter-change',
  'search'
])

// Estado local para filtros
const searchTerm = ref('')
const selectedRole = ref('')
const selectedStatus = ref('')

// Calcular valores para la paginación
const totalItems = computed(() => props.pagination.total || 0)
const totalPages = computed(() => props.pagination.pages || 1)
const startItem = computed(() => {
  if (totalItems.value === 0) return 0
  return (props.currentPage - 1) * props.pagination.limit + 1
})
const endItem = computed(() => {
  const end = props.currentPage * props.pagination.limit
  return end > totalItems.value ? totalItems.value : end
})

// Calcular páginas a mostrar en la paginación
const displayedPages = computed(() => {
  const pages = []
  const maxPagesToShow = 5
  
  if (totalPages.value <= maxPagesToShow) {
    // Mostrar todas las páginas si son pocas
    for (let i = 1; i <= totalPages.value; i++) {
      pages.push(i)
    }
  } else {
    // Siempre mostrar la primera página
    pages.push(1)
    
    // Calcular el rango de páginas a mostrar alrededor de la página actual
    let startPage = Math.max(2, props.currentPage - 1)
    let endPage = Math.min(totalPages.value - 1, props.currentPage + 1)
    
    // Ajustar si estamos cerca del inicio o del final
    if (props.currentPage <= 2) {
      endPage = 4
    } else if (props.currentPage >= totalPages.value - 1) {
      startPage = totalPages.value - 3
    }
    
    // Añadir elipsis si es necesario
    if (startPage > 2) {
      pages.push('...')
    }
    
    // Añadir páginas intermedias
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i)
    }
    
    // Añadir elipsis si es necesario
    if (endPage < totalPages.value - 1) {
      pages.push('...')
    }
    
    // Siempre mostrar la última página
    pages.push(totalPages.value)
  }
  
  return pages
})

// Funciones auxiliares
const getInitials = (firstname, lastname) => {
  const first = firstname ? firstname.charAt(0).toUpperCase() : ''
  const last = lastname ? lastname.charAt(0).toUpperCase() : ''
  return `${first}${last}`
}

const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('es-ES', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
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

// Manejadores de eventos
let searchTimeout = null

const onSearchInput = () => {
  // Debounce para evitar muchas llamadas al API
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    emit('search', searchTerm.value)
  }, 500)
}

const onFilterChange = () => {
  emit('filter-change', {
    role: selectedRole.value,
    is_active: selectedStatus.value === '' ? undefined : selectedStatus.value === 'true'
  })
}

// Limpiar timeout al desmontar
onBeforeUnmount(() => {
  if (searchTimeout) {
    clearTimeout(searchTimeout)
  }
})
</script>
