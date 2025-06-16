<template>
  <div class="mt-8">
    <!-- Modern Header with Statistics -->
    <div class="bg-gradient-to-r from-purple-600 to-pink-700 rounded-xl shadow-lg overflow-hidden">
      <div class="flex">
        <button
          @click="$emit('toggle-packages')"
          class="flex-1 px-6 py-4 hover:bg-black/10 focus:outline-none transition-colors duration-200"
        >
          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-4">
              <div class="flex items-center justify-center w-12 h-12 bg-white/20 rounded-lg">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <div class="text-left">
                <h3 class="text-xl font-semibold text-white">
                  Gestión de Encomiendas
                </h3>
                <p class="text-purple-100 text-sm">Gestión de paquetes del viaje</p>
              </div>
            </div>
            <div class="flex items-center space-x-6">
              <!-- Statistics Cards -->
              <div class="hidden md:flex items-center space-x-4">
                <div class="text-center">
                  <div class="text-2xl font-bold text-white">{{ packages.length }}</div>
                  <div class="text-xs text-purple-100">Total</div>
                </div>
                <div class="text-center">
                  <div class="text-2xl font-bold text-green-300">{{ getPackageCountByStatus('delivered') + getPackageCountByStatus('entregado') }}</div>
                  <div class="text-xs text-purple-100">Entregados</div>
                </div>
                <div class="text-center">
                  <div class="text-2xl font-bold text-yellow-300">{{ getPackageCountByStatus('in transit') + getPackageCountByStatus('en transito') }}</div>
                  <div class="text-xs text-purple-100">En tránsito</div>
                </div>
              </div>
              <div class="flex items-center justify-center w-10 h-10 bg-white/20 rounded-lg">
                <ChevronDownIcon v-if="!showPackages" class="w-5 h-5 text-white" />
                <ChevronUpIcon v-else class="w-5 h-5 text-white" />
              </div>
            </div>
          </div>
        </button>
        <div class="flex items-center px-3 py-4">
          <!-- Register Package Button -->
          <AppButton
            variant="secondary"
            size="sm"
            @click="$emit('open-package-modal')"
            v-if="trip && (trip.status === 'scheduled' || trip.status === 'boarding')"
            class="bg-white/20 hover:bg-white/30 text-white border-white/30 hover:border-white/50"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Registrar
          </AppButton>
        </div>
      </div>
    </div>

    <div v-if="showPackages" class="mt-4">
      <div v-if="isLoadingPackages" class="flex justify-center py-6">
        <p class="text-gray-500 italic">Cargando paquetes...</p>
      </div>
      <div v-else-if="packagesError" class="bg-red-50 border border-red-200 rounded-md p-4">
        <p class="text-red-700 text-sm">{{ packagesError }}</p>
      </div>
      <div v-else-if="packages.length === 0" class="bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200 rounded-xl p-8 text-center">
        <div class="flex items-center justify-center w-16 h-16 bg-purple-100 rounded-full mx-auto mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
        </div>
        <h4 class="text-lg font-semibold text-purple-900 mb-2">Sin encomiendas registradas</h4>
        <p class="text-purple-700 text-sm mb-6">Este viaje aún no tiene paquetes registrados</p>
        <AppButton
          variant="primary"
          size="md"
          @click="$emit('open-package-modal')"
          v-if="trip && (trip.status === 'scheduled' || trip.status === 'boarding')"
          class="bg-gradient-to-r from-purple-600 to-pink-700 hover:from-purple-700 hover:to-pink-800 shadow-lg"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Registrar Primera Encomienda
        </AppButton>
      </div>
      <!-- Iterate over grouped packages -->
      <div v-else class="space-y-4">
        <div v-for="(packagesInStatus, status) in groupedPackages" :key="status" class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <button
            @click="$emit('toggle-packages-by-status', status)"
            class="w-full flex justify-between items-center px-6 py-4 hover:bg-gray-50 focus:outline-none transition-colors duration-200"
          >
            <div class="flex items-center space-x-3">
              <div :class="getStatusIconClass(status)" class="flex items-center justify-center w-10 h-10 rounded-lg">
                <component :is="getStatusIcon(status)" class="w-5 h-5" />
              </div>
              <div class="text-left">
                <h4 class="text-lg font-semibold text-gray-900">
                  {{ getStatusLabel(status) }}
                </h4>
                <p class="text-sm text-gray-600">{{ packagesInStatus.length }} paquete{{ packagesInStatus.length !== 1 ? 's' : '' }}</p>
              </div>
            </div>
            <ChevronDownIcon v-if="!showPackagesByStatus[status]" class="w-5 h-5 text-gray-400" />
            <ChevronUpIcon v-else class="w-5 h-5 text-gray-400" />
          </button>

          <div v-if="showPackagesByStatus[status]" class="p-6 bg-gray-50 border-t border-gray-200">
            <div class="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              <div
                v-for="pkg in packagesInStatus"
                :key="pkg.id"
                class="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200 ease-in-out overflow-hidden group"
              >
                <!-- Package Header -->
                <div class="p-6 pb-4">
                  <div class="flex items-start justify-between mb-4">
                    <div class="flex items-center space-x-3">
                      <div class="flex items-center justify-center w-10 h-10 bg-purple-100 rounded-lg">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                        </svg>
                      </div>
                      <div>
                        <h4 class="text-lg font-semibold text-gray-900">
                          Paquete #{{ pkg.id }}
                        </h4>
                        <span 
                          class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                          :class="getPackageStatusClass(pkg.status)"
                        >
                          {{ getPackageStatusLabel(pkg.status) }}
                        </span>
                      </div>
                    </div>
                  </div>

                  <!-- Package Details -->
                  <div class="space-y-4">
                    <!-- Description -->
                    <div class="flex items-center p-3 bg-gray-50 rounded-lg">
                      <div class="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-lg mr-3">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
                          <path fill-rule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clip-rule="evenodd" />
                        </svg>
                      </div>
                      <div class="flex-1">
                        <p class="text-sm font-medium text-gray-900">Descripción</p>
                        <p class="text-sm text-gray-600">{{ pkg.name }}</p>
                      </div>
                    </div>

                    <!-- Sender and Recipient Row -->
                    <div class="grid grid-cols-1 gap-3">
                      <div class="flex items-center p-3 bg-gray-50 rounded-lg">
                        <div class="flex items-center justify-center w-8 h-8 bg-green-100 rounded-lg mr-3">
                          <UserCircleIcon class="w-4 h-4 text-green-600" />
                        </div>
                        <div class="flex-1">
                          <p class="text-xs font-medium text-gray-900">Remitente</p>
                          <p class="text-sm text-gray-600">{{ pkg.sender?.firstname }} {{ pkg.sender?.lastname }}</p>
                        </div>
                      </div>
                      <div class="flex items-center p-3 bg-gray-50 rounded-lg">
                        <div class="flex items-center justify-center w-8 h-8 bg-orange-100 rounded-lg mr-3">
                          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-orange-600" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                          </svg>
                        </div>
                        <div class="flex-1">
                          <p class="text-xs font-medium text-gray-900">Destinatario</p>
                          <p class="text-sm text-gray-600">{{ pkg.recipient?.firstname }} {{ pkg.recipient?.lastname }}</p>
                        </div>
                      </div>
                    </div>

                    <!-- Price -->
                    <div class="flex items-center p-3 bg-gray-50 rounded-lg">
                      <div class="flex items-center justify-center w-8 h-8 bg-yellow-100 rounded-lg mr-3">
                        <CurrencyDollarIcon class="w-4 h-4 text-yellow-600" />
                      </div>
                      <div>
                        <p class="text-xs font-medium text-gray-900">Precio</p>
                        <p class="text-sm font-semibold text-gray-900">Bs. {{ pkg.price?.toFixed(2) }}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Action Buttons -->
                <div class="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end space-x-3">
                  <AppButton size="sm" variant="secondary-outline" class="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    Ver Detalles
                  </AppButton>
                  <AppButton 
                    v-if="pkg.status !== 'delivered' && pkg.status !== 'entregado'" 
                    size="sm" 
                    variant="primary"
                    class="flex items-center"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Actualizar
                  </AppButton>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { ChevronDownIcon, ChevronUpIcon, UserCircleIcon, CurrencyDollarIcon, CheckCircleIcon, ClockIcon, TruckIcon, XCircleIcon } from '@heroicons/vue/24/outline/index.js'
import AppButton from '@/components/AppButton.vue'

const props = defineProps({
  packages: {
    type: Array,
    required: true
  },
  isLoadingPackages: {
    type: Boolean,
    required: true
  },
  packagesError: {
    type: String,
    default: null
  },
  showPackages: {
    type: Boolean,
    required: true
  },
  groupedPackages: {
    type: Object,
    required: true
  },
  showPackagesByStatus: {
    type: Object,
    required: true
  },
  trip: {
    type: Object,
    required: true
  }
})

defineEmits([
  'toggle-packages',
  'toggle-packages-by-status',
  'open-package-modal'
])

// Helper functions for UI
const getPackageCountByStatus = (status) => {
  return props.packages.filter(pkg => pkg.status === status).length
}

const getStatusIcon = (status) => {
  const icons = {
    'delivered': CheckCircleIcon,
    'entregado': CheckCircleIcon,
    'in transit': TruckIcon,
    'en transito': TruckIcon,
    'pending': ClockIcon,
    'pendiente': ClockIcon,
    'cancelled': XCircleIcon,
    'cancelado': XCircleIcon
  }
  return icons[status] || ClockIcon
}

const getStatusIconClass = (status) => {
  const classes = {
    'delivered': 'bg-green-100 text-green-600',
    'entregado': 'bg-green-100 text-green-600',
    'in transit': 'bg-blue-100 text-blue-600',
    'en transito': 'bg-blue-100 text-blue-600',
    'pending': 'bg-yellow-100 text-yellow-600',
    'pendiente': 'bg-yellow-100 text-yellow-600',
    'cancelled': 'bg-red-100 text-red-600',
    'cancelado': 'bg-red-100 text-red-600'
  }
  return classes[status] || 'bg-gray-100 text-gray-600'
}

const getStatusLabel = (status) => {
  const labels = {
    'delivered': 'Entregados',
    'entregado': 'Entregados',
    'in transit': 'En Tránsito',
    'en transito': 'En Tránsito',
    'pending': 'Pendientes',
    'pendiente': 'Pendientes',
    'cancelled': 'Cancelados',
    'cancelado': 'Cancelados'
  }
  return labels[status] || status?.charAt(0).toUpperCase() + status?.slice(1)
}

const getPackageStatusClass = (status) => {
  const classes = {
    'delivered': 'bg-green-100 text-green-800',
    'entregado': 'bg-green-100 text-green-800',
    'in transit': 'bg-blue-100 text-blue-800',
    'en transito': 'bg-blue-100 text-blue-800',
    'pending': 'bg-yellow-100 text-yellow-800',
    'pendiente': 'bg-yellow-100 text-yellow-800',
    'cancelled': 'bg-red-100 text-red-800',
    'cancelado': 'bg-red-100 text-red-800'
  }
  return classes[status] || 'bg-gray-100 text-gray-800'
}

const getPackageStatusLabel = (status) => {
  const labels = {
    'delivered': 'Entregado',
    'entregado': 'Entregado',
    'in transit': 'En Tránsito',
    'en transito': 'En Tránsito',
    'pending': 'Pendiente',
    'pendiente': 'Pendiente',
    'cancelled': 'Cancelado',
    'cancelado': 'Cancelado'
  }
  return labels[status] || status?.charAt(0).toUpperCase() + status?.slice(1) || 'N/D'
}
</script> 