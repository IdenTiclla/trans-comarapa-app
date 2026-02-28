<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-50 to-slate-100 w-full">
    <!-- Modern Header with gradient background -->
    <div class="bg-white shadow-sm border-b border-gray-200 w-full">
      <div class="w-full px-2 sm:px-4 lg:px-6 py-4">
        <div class="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4">
          <div class="flex items-center space-x-4">
            <div class="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-green-600 to-green-700 rounded-xl shadow-lg">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <div>
              <h1 class="text-2xl font-bold text-gray-900">Gestión de Encomiendas</h1>
              <p class="text-gray-700">Administra y gestiona el seguimiento de paquetes</p>
            </div>
          </div>
          <div class="flex items-center space-x-4">
            <!-- Quick stats -->
            <div class="hidden md:flex items-center space-x-6 text-sm">
              <div class="text-center">
                <div class="text-lg font-bold text-green-600">{{ totalPackages || '...' }}</div>
                <div class="text-gray-600">Total</div>
              </div>
              <div class="text-center">
                <div class="text-lg font-bold text-blue-600">{{ pendingPackages || '...' }}</div>
                <div class="text-gray-600">Pendientes</div>
              </div>
              <div class="text-center">
                <div class="text-lg font-bold text-orange-600">{{ inTransitPackages || '...' }}</div>
                <div class="text-gray-600">En tránsito</div>
              </div>
              <div class="text-center">
                <div class="text-lg font-bold text-purple-600">{{ deliveredToday || '...' }}</div>
                <div class="text-gray-600">Entregados hoy</div>
              </div>
            </div>
            <AppButton
              variant="primary"
              @click="goToNewPackage"
              class="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 shadow-lg"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Nueva Encomienda
            </AppButton>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="w-full px-2 sm:px-4 lg:px-6 py-6 overflow-x-hidden">
      <!-- Quick Action Cards -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div @click="handleQuickAction('new-package')" class="group bg-white rounded-2xl p-4 lg:p-6 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer border border-gray-200 hover:border-green-300 transform hover:-translate-y-1">
          <div class="flex items-center space-x-3 lg:space-x-4">
            <div class="flex items-center justify-center w-10 h-10 lg:w-12 lg:h-12 bg-green-100 group-hover:bg-green-200 rounded-xl transition-colors flex-shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 lg:h-6 lg:w-6 text-green-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <div class="min-w-0 flex-1">
              <h3 class="text-base lg:text-lg font-semibold text-gray-900 group-hover:text-green-700 transition-colors truncate">Nueva Encomienda</h3>
              <p class="text-gray-600 text-sm truncate">Registrar paquete</p>
            </div>
          </div>
        </div>

        <div @click="handleQuickAction('track-package')" class="group bg-white rounded-2xl p-4 lg:p-6 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer border border-gray-200 hover:border-blue-300 transform hover:-translate-y-1">
          <div class="flex items-center space-x-3 lg:space-x-4">
            <div class="flex items-center justify-center w-10 h-10 lg:w-12 lg:h-12 bg-blue-100 group-hover:bg-blue-200 rounded-xl transition-colors flex-shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 lg:h-6 lg:w-6 text-blue-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <div class="min-w-0 flex-1">
              <h3 class="text-base lg:text-lg font-semibold text-gray-900 group-hover:text-blue-700 transition-colors truncate">Rastrear Paquete</h3>
              <p class="text-gray-600 text-sm truncate">Buscar por código</p>
            </div>
          </div>
        </div>

        <div @click="handleQuickAction('pending-deliveries')" class="group bg-white rounded-2xl p-4 lg:p-6 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer border border-gray-200 hover:border-orange-300 transform hover:-translate-y-1">
          <div class="flex items-center space-x-3 lg:space-x-4">
            <div class="flex items-center justify-center w-10 h-10 lg:w-12 lg:h-12 bg-orange-100 group-hover:bg-orange-200 rounded-xl transition-colors flex-shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 lg:h-6 lg:w-6 text-orange-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div class="min-w-0 flex-1">
              <h3 class="text-base lg:text-lg font-semibold text-gray-900 group-hover:text-orange-700 transition-colors truncate">Entregas Pendientes</h3>
              <p class="text-gray-600 text-sm truncate">Ver pendientes</p>
            </div>
          </div>
        </div>

        <div @click="handleQuickAction('reports')" class="group bg-white rounded-2xl p-4 lg:p-6 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer border border-gray-200 hover:border-purple-300 transform hover:-translate-y-1">
          <div class="flex items-center space-x-3 lg:space-x-4">
            <div class="flex items-center justify-center w-10 h-10 lg:w-12 lg:h-12 bg-purple-100 group-hover:bg-purple-200 rounded-xl transition-colors flex-shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 lg:h-6 lg:w-6 text-purple-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div class="min-w-0 flex-1">
              <h3 class="text-base lg:text-lg font-semibold text-gray-900 group-hover:text-purple-700 transition-colors truncate">Reportes</h3>
              <p class="text-gray-600 text-sm truncate">Estadísticas</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Filters Section -->
      <div class="mb-6">
        <div class="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label for="search" class="block text-sm font-medium text-gray-700 mb-2">Buscar</label>
              <div class="relative">
                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg class="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clip-rule="evenodd" />
                  </svg>
                </div>
                <input 
                  type="text" 
                  id="search" 
                  v-model="searchTerm" 
                  @input="debouncedSearchPackages" 
                  class="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 sm:text-sm"
                  placeholder="Buscar por remitente, destinatario, código..."
                >
              </div>
            </div>
            <div>
              <label for="status-filter" class="block text-sm font-medium text-gray-700 mb-2">Estado</label>
              <select 
                id="status-filter" 
                v-model="statusFilter" 
                @change="applyFilters" 
                class="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 sm:text-sm"
              >
                <option value="all">Todos</option>
                <option value="registered_at_office">En oficina</option>
                <option value="assigned_to_trip">Asignada a viaje</option>
                <option value="in_transit">En tránsito</option>
                <option value="arrived_at_destination">En destino</option>
                <option value="delivered">Entregada</option>
              </select>
            </div>
            <div>
              <label for="date-from" class="block text-sm font-medium text-gray-700 mb-2">Fecha desde</label>
              <input 
                type="date" 
                id="date-from" 
                v-model="dateFrom"
                @change="applyFilters"
                class="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 sm:text-sm"
              >
            </div>
            <div>
              <label for="date-to" class="block text-sm font-medium text-gray-700 mb-2">Fecha hasta</label>
              <input 
                type="date" 
                id="date-to" 
                v-model="dateTo"
                @change="applyFilters"
                class="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 sm:text-sm"
              >
            </div>
          </div>
        </div>
      </div>

      <!-- Error State with better design -->
      <div v-if="packageStore.error" class="mb-6">
        <div class="bg-red-50 border-l-4 border-red-500 rounded-lg p-6 shadow-sm">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <svg class="h-6 w-6 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
              </svg>
            </div>
            <div class="ml-4">
              <h3 class="text-lg font-semibold text-red-800">Error al cargar encomiendas</h3>
              <p class="text-red-700 mt-1">{{ packageStore.error }}</p>
              <button @click="fetchPackagesWithFilters" class="mt-3 text-sm bg-red-100 hover:bg-red-200 text-red-800 font-medium px-4 py-2 rounded-lg transition-colors border border-red-300">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-2 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Intentar nuevamente
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Package List with improved layout -->
      <div class="mb-6">
        <div class="flex items-center justify-between mb-4">
          <div class="flex items-center space-x-4">
            <h2 class="text-xl font-bold text-gray-900">Lista de Encomiendas</h2>
            <div v-if="!packageStore.isLoading && filteredPackages.length > 0" class="flex items-center space-x-2 text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
              <span class="font-medium">{{ filteredPackages.length }} encomiendas encontradas</span>
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

        <PackageCardList 
          :packages="paginatedPackages"
          :is-loading="packageStore.isLoading"
          :view-mode="viewMode"
          @view-package="viewPackage"
          @edit-package="editPackage"
          @delete-package="confirmDeletePackage"
          @deliver-package="handleDeliverPackage"
        />
      </div>

      <!-- Local Pagination -->
      <div v-if="!packageStore.isLoading && filteredPackages.length > itemsPerPage" class="mb-6">
        <div class="bg-white px-6 py-4 rounded-lg shadow-sm border border-gray-200">
          <div class="flex items-center justify-between">
            <div class="text-sm text-gray-700">
              Mostrando {{ (currentPage - 1) * itemsPerPage + 1 }} a {{ Math.min(currentPage * itemsPerPage, filteredPackages.length) }} de {{ filteredPackages.length }} resultados
            </div>
            <div class="flex items-center space-x-2">
              <button
                @click="currentPage = Math.max(1, currentPage - 1)"
                :disabled="currentPage === 1"
                class="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Anterior
              </button>
              <span class="px-3 py-2 text-sm font-medium text-gray-700">
                Página {{ currentPage }} de {{ totalPages }}
              </span>
              <button
                @click="currentPage = Math.min(totalPages, currentPage + 1)"
                :disabled="currentPage === totalPages"
                class="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Siguiente
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal de registro de encomienda -->
    <PackageRegistrationModal
      :show-modal="showRegistrationModal"
      @close="showRegistrationModal = false"
      @package-registered="handlePackageRegistered"
    />

    <!-- Modal de entrega de encomienda -->
    <PackageDeliveryModal
      :show-modal="showDeliveryModal"
      :package-data="selectedPackageForDelivery"
      @close="closeDeliveryModal"
      @confirm="onDeliverPackageConfirm"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { usePackageStore } from '~/stores/packageStore'
import { debounce } from 'lodash-es'
import PackageRegistrationModal from '~/components/packages/PackageRegistrationModal.vue'
import PackageDeliveryModal from '~/components/packages/PackageDeliveryModal.vue'

// Meta
definePageMeta({
  title: 'Gestión de Encomiendas',
  description: 'Administra y gestiona el seguimiento de paquetes'
})

// Store and router
const router = useRouter()
const packageStore = usePackageStore()

// Reactive data
const searchTerm = ref('')
const statusFilter = ref('all')
const dateFrom = ref('')
const dateTo = ref('')
const currentPage = ref(1)
const itemsPerPage = ref(12)
const viewMode = ref('grid')
const showRegistrationModal = ref(false)
const showDeliveryModal = ref(false)
const selectedPackageForDelivery = ref(null)

// Get packages from store
const packages = computed(() => {
  const pkgs = packageStore.packages || []
  console.log('Computed packages:', pkgs.length, 'packages available')
  return pkgs
})

// Computed properties for stats
const totalPackages = computed(() => packages.value.length)
const pendingPackages = computed(() => packages.value.filter(p => p.status === 'registered_at_office').length)
const inTransitPackages = computed(() => packages.value.filter(p => p.status === 'in_transit').length)
const deliveredToday = computed(() => {
  const today = new Date().toDateString()
  return packages.value.filter(p => 
    p.status === 'delivered' && 
    new Date(p.updated_at || p.created_at).toDateString() === today
  ).length
})

// Filtered packages for local filtering
const filteredPackages = computed(() => {
  let filtered = packages.value

  // Apply search filter
  if (searchTerm.value) {
    const term = searchTerm.value.toLowerCase()
    filtered = filtered.filter(pkg => 
      (pkg.sender_name && pkg.sender_name.toLowerCase().includes(term)) ||
      (pkg.receiver_name && pkg.receiver_name.toLowerCase().includes(term)) ||
      (pkg.tracking_code && pkg.tracking_code.toLowerCase().includes(term)) ||
      (pkg.description && pkg.description.toLowerCase().includes(term)) ||
      (pkg.id && pkg.id.toString().includes(term))
    )
  }

  // Apply status filter
  if (statusFilter.value && statusFilter.value !== 'all') {
    filtered = filtered.filter(pkg => pkg.status === statusFilter.value)
  }

  // Apply date filters
  if (dateFrom.value) {
    const fromDate = new Date(dateFrom.value)
    filtered = filtered.filter(pkg => new Date(pkg.created_at) >= fromDate)
  }

  if (dateTo.value) {
    const toDate = new Date(dateTo.value)
    toDate.setHours(23, 59, 59, 999) // End of day
    filtered = filtered.filter(pkg => new Date(pkg.created_at) <= toDate)
  }

  // Sort by created_at desc
  filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))

  return filtered
})

// Paginated packages
const paginatedPackages = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value
  return filteredPackages.value.slice(start, start + itemsPerPage.value)
})

const totalPages = computed(() => Math.ceil(filteredPackages.value.length / itemsPerPage.value))

// Methods for package store interactions
const fetchPackagesWithFilters = async () => {
  const params = {
    page: packageStore.pagination.currentPage,
    limit: 100, // Load more packages for local filtering
    filters: {},
  }
  
  // Only send backend filters for status if we want backend filtering
  // For now, we'll load all and filter locally
  
  try {
    await packageStore.fetchPackages(params)
  } catch (error) {
    console.error('Error fetching packages:', error)
  }
}

const debouncedSearchPackages = debounce(() => {
  currentPage.value = 1
}, 500)

const applyFilters = () => {
  currentPage.value = 1
}

// Quick actions
const handleQuickAction = (action) => {
  switch (action) {
    case 'new-package':
      goToNewPackage()
      break
    case 'track-package':
      // Focus on search field
      document.querySelector('input[placeholder*="código"]')?.focus()
      break
    case 'pending-deliveries':
      statusFilter.value = 'arrived_at_destination'
      applyFilters()
      break
    case 'reports':
      navigateTo('/reports/packages')
      break
    default:
      console.log(`Unknown action: ${action}`)
  }
}

// Navigation methods
const goToNewPackage = () => {
  showRegistrationModal.value = true
}

const handlePackageRegistered = async (pkg) => {
  // Refetch packages after a new one is registered
  try {
    await packageStore.fetchPackages({ limit: 100 })
  } catch (error) {
    console.error('Error refetching packages:', error)
  }
}

const viewPackage = (id) => {
  router.push(`/packages/${id}`)
}

const editPackage = (id) => {
  router.push(`/packages/${id}/edit`)
}

const confirmDeletePackage = async (id) => {
  if (window.confirm('¿Está seguro de que desea eliminar esta encomienda?')) {
    await packageStore.deleteExistingPackage(id)
    // The store action should refetch or update the list
  }
}

// Delivery actions
const handleDeliverPackage = (id) => {
  const pkg = packages.value.find(p => p.id === id)
  if (pkg) {
    selectedPackageForDelivery.value = pkg
    showDeliveryModal.value = true
  }
}

const closeDeliveryModal = () => {
  showDeliveryModal.value = false
  selectedPackageForDelivery.value = null
}

const onDeliverPackageConfirm = async ({ packageId }) => {
  closeDeliveryModal()
  // Refresh packages
  await packageStore.fetchPackages({ limit: 100 })
}

// Lifecycle
onMounted(async () => {
  searchTerm.value = ''
  statusFilter.value = 'all'
  currentPage.value = 1
  
  // Reset store pagination
  packageStore.pagination.currentPage = 1
  
  // Load initial packages
  try {
    await packageStore.fetchPackages({ limit: 100 })
  } catch (error) {
    console.error('Error loading packages:', error)
  }
})

// Watchers for backend pagination (if needed)
watch([() => packageStore.pagination.currentPage, () => packageStore.pagination.itemsPerPage], () => {
  fetchPackagesWithFilters()
}, { immediate: false })

// Reset page when filters change
watch([searchTerm, statusFilter, dateFrom, dateTo], () => {
  currentPage.value = 1
})

// Set page title and meta
useHead({
  title: 'Gestión de Encomiendas - Trans Comarapa',
  meta: [
    { name: 'description', content: 'Administra y gestiona el seguimiento de paquetes de Trans Comarapa' }
  ]
})
</script> 