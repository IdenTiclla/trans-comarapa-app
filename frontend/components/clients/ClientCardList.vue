<template>
  <div class="w-full">
    <!-- Loading State -->
    <div v-if="loading" class="space-y-6">
      <div v-if="viewMode === 'grid'" class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        <div v-for="n in 6" :key="n" class="bg-white rounded-2xl p-6 shadow-lg border border-gray-200 animate-pulse">
          <div class="flex items-center space-x-4 mb-4">
            <div class="w-12 h-12 bg-gray-200 rounded-full"></div>
            <div class="flex-1">
              <div class="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div class="h-3 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
          <div class="space-y-3">
            <div class="h-3 bg-gray-200 rounded w-full"></div>
            <div class="h-3 bg-gray-200 rounded w-2/3"></div>
            <div class="flex space-x-2 mt-4">
              <div class="h-8 bg-gray-200 rounded w-16"></div>
              <div class="h-8 bg-gray-200 rounded w-16"></div>
            </div>
          </div>
        </div>
      </div>
      <div v-else class="space-y-4">
        <div v-for="n in 5" :key="n" class="bg-white rounded-xl p-4 shadow-sm border border-gray-200 animate-pulse">
          <div class="flex items-center space-x-4">
            <div class="w-12 h-12 bg-gray-200 rounded-full"></div>
            <div class="flex-1 grid grid-cols-4 gap-4">
              <div class="h-4 bg-gray-200 rounded"></div>
              <div class="h-4 bg-gray-200 rounded"></div>
              <div class="h-4 bg-gray-200 rounded"></div>
              <div class="h-4 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else-if="!clients || clients.length === 0" class="text-center py-16 bg-white rounded-2xl shadow-lg border border-gray-100">
      <div class="max-w-md mx-auto">
        <div class="flex items-center justify-center w-20 h-20 mx-auto mb-6 bg-gray-100 rounded-full">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        </div>
        <h3 class="text-2xl font-bold text-gray-900 mb-2">No se encontraron clientes</h3>
        <p class="text-gray-600 mb-6">No hay clientes que coincidan con los filtros seleccionados.</p>
        <div class="flex flex-col sm:flex-row gap-3 justify-center">
          <button @click="$emit('clear-filters')" class="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Limpiar filtros
          </button>
          <button @click="$emit('new-client')" class="inline-flex items-center px-4 py-2 border border-transparent rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Crear nuevo cliente
          </button>
        </div>
      </div>
    </div>

    <!-- Client Cards/Table -->
    <div v-else>
      <!-- Grid View -->
      <div v-if="viewMode === 'grid'" class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        <ClientCard
          v-for="client in paginatedClients"
          :key="client.id"
          :client="client"
          @view-client="$emit('view-client', $event)"
          @edit-client="$emit('edit-client', $event)"
          @delete-client="$emit('delete-client', $event)"
        />
      </div>

      <!-- Table View -->
      <div v-else class="bg-white rounded-2xl shadow-lg overflow-hidden">
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cliente
                </th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Documento
                </th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contacto
                </th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ubicación
                </th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th scope="col" class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="client in paginatedClients" :key="client.id" class="hover:bg-gray-50 transition-colors duration-150">
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center">
                    <div class="flex-shrink-0 h-10 w-10">
                      <div class="h-10 w-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-semibold text-sm">
                        {{ getInitials(client.name) }}
                      </div>
                    </div>
                    <div class="ml-4">
                      <div class="text-sm font-medium text-gray-900">
                        {{ client.name }}
                      </div>
                      <div class="text-sm text-gray-500">
                        {{ client.is_minor ? '👶 Menor de edad' : '👤 Adulto' }}
                      </div>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm text-gray-900">{{ client.ci || 'Sin CI' }}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm text-gray-900">{{ client.phone || 'Sin teléfono' }}</div>
                  <div class="text-sm text-gray-500">{{ client.email || 'Sin email' }}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm text-gray-900">{{ client.city || 'Sin ciudad' }}</div>
                  <div class="text-sm text-gray-500">{{ client.state || 'Sin estado' }}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span :class="getStatusClass(client)">
                    {{ getStatusText(client) }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div class="flex items-center justify-end space-x-2">
                    <button
                      @click="$emit('view-client', client)"
                      class="text-blue-600 hover:text-blue-900 p-2 rounded-md hover:bg-blue-50 transition-colors duration-150"
                      :aria-label="`Ver detalles de ${client.name}`"
                    >
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                      </svg>
                    </button>
                    <button
                      @click="$emit('edit-client', client)"
                      class="text-indigo-600 hover:text-indigo-900 p-2 rounded-md hover:bg-indigo-50 transition-colors duration-150"
                      :aria-label="`Editar ${client.name}`"
                    >
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                      </svg>
                    </button>
                    <button
                      @click="$emit('delete-client', client)"
                      class="text-red-600 hover:text-red-900 p-2 rounded-md hover:bg-red-50 transition-colors duration-150"
                      :aria-label="`Eliminar ${client.name}`"
                    >
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Enhanced Pagination -->
    <div v-if="totalItems > itemsPerPage" class="mt-8 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <!-- Results info -->
        <div class="text-sm text-gray-700">
          <span class="font-medium">{{ startItem }}-{{ endItem }}</span>
          de
          <span class="font-medium">{{ totalItems }}</span>
          clientes
        </div>

        <!-- Pagination controls -->
        <div class="flex items-center gap-2">
          <!-- Previous page button -->
          <button
            @click="handlePageChange(currentPage - 1)"
            :disabled="currentPage === 1"
            :class="[
              currentPage === 1 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-700 hover:bg-gray-50 border-gray-300',
              'relative inline-flex items-center px-3 py-2 rounded-lg border text-sm font-medium transition-colors duration-200'
            ]"
            title="Página anterior"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <!-- Page numbers -->
          <div class="flex items-center gap-1">
            <button
              v-for="page in displayedPages"
              :key="page"
              @click="typeof page === 'number' ? handlePageChange(page) : null"
              :disabled="typeof page !== 'number'"
              :class="[
                typeof page !== 'number' ? 'cursor-default' : '',
                page === currentPage
                  ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                  : typeof page === 'number'
                    ? 'bg-white text-gray-700 hover:bg-gray-50 border-gray-300'
                    : 'bg-transparent text-gray-500 border-transparent cursor-default',
                'relative inline-flex items-center px-3 py-2 rounded-lg border text-sm font-medium transition-colors duration-200 min-w-[2.5rem] justify-center'
              ]"
            >
              {{ page }}
            </button>
          </div>

          <!-- Next page button -->
          <button
            @click="handlePageChange(currentPage + 1)"
            :disabled="currentPage === totalPages"
            :class="[
              currentPage === totalPages ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-700 hover:bg-gray-50 border-gray-300',
              'relative inline-flex items-center px-3 py-2 rounded-lg border text-sm font-medium transition-colors duration-200'
            ]"
            title="Página siguiente"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </button>

          <!-- Last page button -->
          <button
            @click="handlePageChange(totalPages)"
            :disabled="currentPage === totalPages"
            :class="[
              currentPage === totalPages ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-700 hover:bg-gray-50 border-gray-300',
              'relative inline-flex items-center px-3 py-2 rounded-lg border text-sm font-medium transition-colors duration-200'
            ]"
            title="Última página"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 5l7 7-7 7M6 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import ClientCard from './ClientCard.vue'

const props = defineProps({
  clients: {
    type: Array,
    default: () => [],
  },
  loading: {
    type: Boolean,
    default: false,
  },
  currentPage: {
    type: Number,
    default: 1,
  },
  totalItems: {
    type: Number,
    default: 0,
  },
  itemsPerPage: {
    type: Number,
    default: 12,
  },
  viewMode: {
    type: String,
    default: 'grid',
    validator: (value) => ['grid', 'table'].includes(value),
  },
})

const emit = defineEmits(['page-change', 'view-client', 'edit-client', 'delete-client', 'clear-filters', 'new-client'])

// Computed properties
const totalPages = computed(() => {
  if (props.totalItems === 0 || props.itemsPerPage === 0) return 1
  return Math.ceil(props.totalItems / props.itemsPerPage)
})

const startItem = computed(() => {
  if (props.totalItems === 0) return 0
  return (props.currentPage - 1) * props.itemsPerPage + 1
})

const endItem = computed(() => {
  const end = props.currentPage * props.itemsPerPage
  return Math.min(end, props.totalItems)
})

const paginatedClients = computed(() => {
  const start = (props.currentPage - 1) * props.itemsPerPage
  return props.clients.slice(start, start + props.itemsPerPage)
})

// Enhanced pagination display logic
const displayedPages = computed(() => {
  const pages = []
  const maxDisplayed = 5
  const totalPagesValue = totalPages.value
  
  if (totalPagesValue <= maxDisplayed + 2) {
    // Show all pages if not too many
    for (let i = 1; i <= totalPagesValue; i++) {
      pages.push(i)
    }
  } else {
    // Always show first page
    pages.push(1)
    
    let start = Math.max(2, props.currentPage - Math.floor((maxDisplayed - 2) / 2))
    let end = Math.min(totalPagesValue - 1, start + maxDisplayed - 3)

    // Adjust start if we're near the end
    if (end === totalPagesValue - 1 && (end - start + 1) < (maxDisplayed - 2)) {
      start = Math.max(2, end - (maxDisplayed - 3))
    }

    // Add ellipsis if needed
    if (start > 2) {
      pages.push('...')
    }

    // Add middle pages
    for (let i = start; i <= end; i++) {
      pages.push(i)
    }

    // Add ellipsis if needed
    if (end < totalPagesValue - 1) {
      pages.push('...')
    }

    // Always show last page
    if (totalPagesValue > 1) {
      pages.push(totalPagesValue)
    }
  }

  return pages
})

// Methods
const handlePageChange = (page) => {
  if (page >= 1 && page <= totalPages.value && page !== props.currentPage) {
    emit('page-change', page)
  }
}

const getInitials = (name) => {
  if (!name) return 'CL'
  const parts = name.split(' ')
  if (parts.length >= 2) {
    return (parts[0].charAt(0) + parts[1].charAt(0)).toUpperCase()
  }
  return name.charAt(0).toUpperCase() + (name.charAt(1) || '').toUpperCase()
}

const getStatusText = (client) => {
  if (client.status === 'active') return 'Activo'
  return 'Inactivo'
}

const getStatusClass = (client) => {
  if (client.status === 'active') {
    return 'inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800'
  }
  return 'inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800'
}
</script>

<style scoped>
/* Ensure consistent spacing, handled by gap utilities */
.grid {
  /* Additional grid styles if needed */
}
</style> 