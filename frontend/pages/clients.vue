<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-50 to-slate-100 w-full">
    <!-- Modern Header with gradient background -->
    <div class="bg-white shadow-sm border-b border-gray-200 w-full">
      <div class="w-full px-2 sm:px-4 lg:px-6 py-4">
        <div class="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4">
          <div class="flex items-center space-x-4">
            <div class="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl shadow-lg">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <div>
              <h1 class="text-2xl font-bold text-gray-900">Gestión de Clientes</h1>
              <p class="text-gray-700">Administra y gestiona la información de tus clientes</p>
            </div>
          </div>
          <div class="flex items-center space-x-4">
            <!-- Quick stats -->
            <div class="hidden md:flex items-center space-x-6 text-sm">
              <div class="text-center">
                <div class="text-lg font-bold text-blue-600">{{ totalClients || '...' }}</div>
                <div class="text-gray-600">Total</div>
              </div>
              <div class="text-center">
                <div class="text-lg font-bold text-green-600">{{ activeClients || '...' }}</div>
                <div class="text-gray-600">Activos</div>
              </div>
              <div class="text-center">
                <div class="text-lg font-bold text-purple-600">{{ newClientsToday || '...' }}</div>
                <div class="text-gray-600">Nuevos hoy</div>
              </div>
            </div>
            <AppButton
              variant="primary"
              @click="showCreateModal = true"
              class="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Nuevo Cliente
            </AppButton>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="w-full px-2 sm:px-4 lg:px-6 py-6 overflow-x-hidden">
      <!-- Quick Action Cards -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div @click="handleQuickAction('new-client')" class="group bg-white rounded-2xl p-4 lg:p-6 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer border border-gray-200 hover:border-blue-300 transform hover:-translate-y-1">
          <div class="flex items-center space-x-3 lg:space-x-4">
            <div class="flex items-center justify-center w-10 h-10 lg:w-12 lg:h-12 bg-blue-100 group-hover:bg-blue-200 rounded-xl transition-colors flex-shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 lg:h-6 lg:w-6 text-blue-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
            </div>
            <div class="min-w-0 flex-1">
              <h3 class="text-base lg:text-lg font-semibold text-gray-900 group-hover:text-blue-700 transition-colors truncate">Nuevo Cliente</h3>
              <p class="text-gray-600 text-sm truncate">Registrar cliente</p>
            </div>
          </div>
        </div>

        <div @click="handleQuickAction('search-client')" class="group bg-white rounded-2xl p-4 lg:p-6 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer border border-gray-200 hover:border-green-300 transform hover:-translate-y-1">
          <div class="flex items-center space-x-3 lg:space-x-4">
            <div class="flex items-center justify-center w-10 h-10 lg:w-12 lg:h-12 bg-green-100 group-hover:bg-green-200 rounded-xl transition-colors flex-shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 lg:h-6 lg:w-6 text-green-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <div class="min-w-0 flex-1">
              <h3 class="text-base lg:text-lg font-semibold text-gray-900 group-hover:text-green-700 transition-colors truncate">Buscar Cliente</h3>
              <p class="text-gray-600 text-sm truncate">Localizar información</p>
            </div>
          </div>
        </div>

        <div @click="handleQuickAction('export-clients')" class="group bg-white rounded-2xl p-4 lg:p-6 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer border border-gray-200 hover:border-purple-300 transform hover:-translate-y-1">
          <div class="flex items-center space-x-3 lg:space-x-4">
            <div class="flex items-center justify-center w-10 h-10 lg:w-12 lg:h-12 bg-purple-100 group-hover:bg-purple-200 rounded-xl transition-colors flex-shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 lg:h-6 lg:w-6 text-purple-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div class="min-w-0 flex-1">
              <h3 class="text-base lg:text-lg font-semibold text-gray-900 group-hover:text-purple-700 transition-colors truncate">Exportar</h3>
              <p class="text-gray-600 text-sm truncate">Descargar datos</p>
            </div>
          </div>
        </div>

        <div @click="handleQuickAction('reports')" class="group bg-white rounded-2xl p-4 lg:p-6 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer border border-gray-200 hover:border-orange-300 transform hover:-translate-y-1">
          <div class="flex items-center space-x-3 lg:space-x-4">
            <div class="flex items-center justify-center w-10 h-10 lg:w-12 lg:h-12 bg-orange-100 group-hover:bg-orange-200 rounded-xl transition-colors flex-shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 lg:h-6 lg:w-6 text-orange-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div class="min-w-0 flex-1">
              <h3 class="text-base lg:text-lg font-semibold text-gray-900 group-hover:text-orange-700 transition-colors truncate">Reportes</h3>
              <p class="text-gray-600 text-sm truncate">Análisis de clientes</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Filters Section -->
      <div class="mb-6">
        <ClientFilters
          :initial-filters="pageFilters"
          @filter-change="handleFilterChange"
          @sort-change="handleSortChange" 
        />
      </div>

      <!-- Error State with better design -->
      <div v-if="error" class="mb-6">
        <div class="bg-red-50 border-l-4 border-red-500 rounded-lg p-6 shadow-sm">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <svg class="h-6 w-6 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
              </svg>
            </div>
            <div class="ml-4">
              <h3 class="text-lg font-semibold text-red-800">Error al cargar clientes</h3>
              <p class="text-red-700 mt-1">{{ error }}</p>
              <button @click="loadClients" class="mt-3 text-sm bg-red-100 hover:bg-red-200 text-red-800 font-medium px-4 py-2 rounded-lg transition-colors border border-red-300">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-2 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Intentar nuevamente
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Client Cards with improved layout -->
      <div class="mb-6">
        <div class="flex items-center justify-between mb-4">
          <div class="flex items-center space-x-4">
            <h2 class="text-xl font-bold text-gray-900">Lista de Clientes</h2>
            <div v-if="!isLoading && filteredClients" class="flex items-center space-x-2 text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <span class="font-medium">{{ filteredClients.length }} clientes encontrados</span>
            </div>
          </div>
          <div class="flex items-center space-x-2">
            <!-- View toggle buttons -->
            <div class="flex bg-gray-100 rounded-lg p-1">
              <button
                @click="viewMode = 'grid'"
                :class="[
                  viewMode === 'grid' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-600 hover:text-gray-900',
                  'p-2 rounded-md transition-colors duration-200'
                ]"
                aria-label="Vista en cuadrícula"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
              </button>
              <button
                @click="viewMode = 'table'"
                :class="[
                  viewMode === 'table' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-600 hover:text-gray-900',
                  'p-2 rounded-md transition-colors duration-200'
                ]"
                aria-label="Vista en tabla"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        <ClientCardList
          :clients="filteredClients"
          :loading="isLoading"
          :current-page="currentPage"
          :total-items="filteredClients.length"
          :items-per-page="itemsPerPage"
          :view-mode="viewMode"
          @page-change="handlePageChange"
          @view-client="viewClient"
          @edit-client="editClient"
          @delete-client="deleteClient"
        />
      </div>
    </div>

    <!-- Create/Edit Modal -->
    <ClientModal
      v-if="showCreateModal || showEditModal"
      :show="showCreateModal || showEditModal"
      :client="selectedClient"
      :is-editing="showEditModal"
      @close="closeModal"
      @save="handleSave"
    />

    <!-- View Modal -->
    <ClientViewModal
      v-if="showViewModal"
      :show="showViewModal"
      :client="selectedClient"
      @close="showViewModal = false"
      @edit="editClient"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, reactive } from 'vue'
import { useClientStore } from '~/stores/clientStore'
import { debounce } from 'lodash-es'

// Meta
definePageMeta({
  title: 'Gestión de Clientes',
  description: 'Administra y gestiona la información de tus clientes'
})

// Store
const clientStore = useClientStore()

// Reactive data
const searchTerm = ref('')
const currentPage = ref(1)
const itemsPerPage = ref(12)
const isLoading = ref(false)
const error = ref(null)
const viewMode = ref('grid')

// Filters similar to trips
const pageFilters = reactive({
  search: '',
  city: '',
  is_minor: '',
  dateFrom: '',
  dateTo: '',
  status: 'active'
})

const pageSortBy = ref('created_at')
const pageSortDirection = ref('desc')

// Modals
const showCreateModal = ref(false)
const showEditModal = ref(false)
const showViewModal = ref(false)
const selectedClient = ref(null)

// Computed properties
const totalClients = computed(() => clientStore.clients.length)
const activeClients = computed(() => clientStore.clients.filter(c => c.status === 'active').length)
const newClientsToday = computed(() => {
  const today = new Date().toDateString()
  return clientStore.clients.filter(c => 
    new Date(c.created_at).toDateString() === today
  ).length
})
const minorClients = computed(() => 
  clientStore.clients.filter(c => c.is_minor === true).length
)

const filteredClients = computed(() => {
  let filtered = clientStore.clients

  // Apply filters
  if (pageFilters.search) {
    const term = pageFilters.search.toLowerCase()
    filtered = filtered.filter(client => 
      (client.name && client.name.toLowerCase().includes(term)) ||
      (client.ci && client.ci.toLowerCase().includes(term)) ||
      (client.phone && client.phone.toLowerCase().includes(term)) ||
      (client.email && client.email.toLowerCase().includes(term))
    )
  }

  if (pageFilters.city) {
    filtered = filtered.filter(client => 
      client.city && client.city.toLowerCase().includes(pageFilters.city.toLowerCase())
    )
  }

  if (pageFilters.is_minor !== '') {
    const isMinor = pageFilters.is_minor === 'true'
    filtered = filtered.filter(client => client.is_minor === isMinor)
  }

  if (pageFilters.status === 'active') {
    filtered = filtered.filter(client => client.status === 'active')
  }

  // Apply date filters
  if (pageFilters.dateFrom) {
    const fromDate = new Date(pageFilters.dateFrom)
    filtered = filtered.filter(client => new Date(client.created_at) >= fromDate)
  }

  if (pageFilters.dateTo) {
    const toDate = new Date(pageFilters.dateTo)
    toDate.setHours(23, 59, 59, 999) // End of day
    filtered = filtered.filter(client => new Date(client.created_at) <= toDate)
  }

  // Apply sorting
  filtered.sort((a, b) => {
    let aValue, bValue
    
    switch (pageSortBy.value) {
      case 'name':
        aValue = (a.name || '').toLowerCase()
        bValue = (b.name || '').toLowerCase()
        break
      case 'created_at':
        aValue = new Date(a.created_at)
        bValue = new Date(b.created_at)
        break
      case 'ci':
        aValue = a.ci || ''
        bValue = b.ci || ''
        break
      default:
        aValue = a[pageSortBy.value] || ''
        bValue = b[pageSortBy.value] || ''
    }

    if (pageSortDirection.value === 'desc') {
      return aValue > bValue ? -1 : aValue < bValue ? 1 : 0
    } else {
      return aValue < bValue ? -1 : aValue > bValue ? 1 : 0
    }
  })

  return filtered
})

const paginatedClients = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value
  return filteredClients.value.slice(start, start + itemsPerPage.value)
})

const totalPages = computed(() => Math.ceil(filteredClients.value.length / itemsPerPage.value))

// Methods
const loadClients = async () => {
  isLoading.value = true
  error.value = null
  try {
    await clientStore.fetchClients()
  } catch (err) {
    error.value = err.message || 'Error al cargar clientes'
  } finally {
    isLoading.value = false
  }
}

const handleQuickAction = (action) => {
  switch (action) {
    case 'new-client':
      showCreateModal.value = true
      break
    case 'search-client':
      // Focus on search or open search modal
      document.querySelector('input[placeholder*="Buscar"]')?.focus()
      break
    case 'export-clients':
      exportClients()
      break
    case 'reports':
      navigateTo('/reports/clients')
      break
    default:
      console.log(`Unknown action: ${action}`)
  }
}

const handleFilterChange = (newFilters) => {
  Object.assign(pageFilters, newFilters)
  currentPage.value = 1 // Reset to first page when filters change
}

const handleSortChange = ({ column, direction }) => {
  pageSortBy.value = column
  pageSortDirection.value = direction
  currentPage.value = 1 // Reset to first page when sorting changes
}

const handlePageChange = (newPage) => {
  currentPage.value = newPage
}

const viewClient = (client) => {
  selectedClient.value = client
  showViewModal.value = true
}

const editClient = (client) => {
  selectedClient.value = client
  showEditModal.value = true
}

const deleteClient = async (client) => {
  if (confirm(`¿Estás seguro de que quieres eliminar a ${client.name}?`)) {
    try {
      await clientStore.deleteClient(client.id)
    } catch (err) {
      error.value = err.message || 'Error al eliminar cliente'
    }
  }
}

const closeModal = () => {
  showCreateModal.value = false
  showEditModal.value = false
  selectedClient.value = null
}

const handleSave = async (clientData) => {
  try {
    if (showEditModal.value && selectedClient.value) {
      await clientStore.updateClient(selectedClient.value.id, clientData)
    } else {
      await clientStore.createClient(clientData)
    }
    closeModal()
  } catch (err) {
    error.value = err.message || 'Error al guardar cliente'
  }
}

const exportClients = () => {
  // TODO: Implement export functionality
  console.log('Exporting clients...')
}

const getInitials = (name) => {
  if (!name) return 'CL'
  const parts = name.split(' ')
  if (parts.length >= 2) {
    return (parts[0].charAt(0) + parts[1].charAt(0)).toUpperCase()
  }
  return name.charAt(0).toUpperCase() + (name.charAt(1) || '').toUpperCase()
}

// Load clients on mount
onMounted(() => {
  loadClients()
})

// Set page title and meta
useHead({
  title: 'Gestión de Clientes - Trans Comarapa',
  meta: [
    { name: 'description', content: 'Administra y gestiona la información de los clientes de Trans Comarapa' }
  ]
})
</script> 