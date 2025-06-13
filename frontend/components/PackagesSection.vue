<template>
  <div class="mt-8">
    <div class="flex justify-between items-center mb-4">
      <button
        @click="$emit('toggle-packages')"
        class="flex-1 flex justify-between items-center px-4 py-3 bg-gray-100 hover:bg-gray-200 rounded-lg shadow focus:outline-none transition-colors duration-150"
      >
        <h3 class="text-lg font-medium text-gray-800">
          Paquetes ({{ packages.length }})
        </h3>
        <ChevronDownIcon v-if="!showPackages" class="w-6 h-6 text-gray-600" />
        <ChevronUpIcon v-else class="w-6 h-6 text-gray-600" />
      </button>
      
      <!-- Botón para registrar paquete -->
      <AppButton
        variant="primary"
        size="sm"
        @click="$emit('open-package-modal')"
        class="ml-3"
        v-if="trip && (trip.status === 'scheduled' || trip.status === 'boarding')"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
        Registrar Paquete
      </AppButton>
    </div>

    <div v-if="showPackages" class="mt-4">
      <div v-if="isLoadingPackages" class="flex justify-center py-6">
        <p class="text-gray-500 italic">Cargando paquetes...</p>
      </div>
      <div v-else-if="packagesError" class="bg-red-50 border border-red-200 rounded-md p-4">
        <p class="text-red-700 text-sm">{{ packagesError }}</p>
      </div>
      <div v-else-if="packages.length === 0" class="bg-blue-50 border border-blue-200 rounded-md p-4 text-center">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 mx-auto text-blue-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
        <p class="text-blue-700 text-sm font-medium mb-2">No hay paquetes registrados para este viaje</p>
        <p class="text-blue-600 text-xs mb-4">¿Desea registrar el primer paquete?</p>
        <AppButton
          variant="primary"
          size="sm"
          @click="$emit('open-package-modal')"
          v-if="trip && (trip.status === 'scheduled' || trip.status === 'boarding')"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Registrar Primer Paquete
        </AppButton>
      </div>
      <!-- Iterate over grouped packages -->
      <div v-else class="space-y-4">
        <div v-for="(packagesInStatus, status) in groupedPackages" :key="status">
          <button
            @click="$emit('toggle-packages-by-status', status)"
            class="w-full flex justify-between items-center px-4 py-2.5 bg-gray-50 hover:bg-gray-100 rounded-md shadow-sm focus:outline-none transition-colors duration-150 border border-gray-200"
          >
            <h4 class="text-md font-medium text-gray-700">
              {{ status.charAt(0).toUpperCase() + status.slice(1) }} ({{ packagesInStatus.length }})
            </h4>
            <ChevronDownIcon v-if="!showPackagesByStatus[status]" class="w-5 h-5 text-gray-500" />
            <ChevronUpIcon v-else class="w-5 h-5 text-gray-500" />
          </button>

          <div v-if="showPackagesByStatus[status]" class="mt-3 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            <div
              v-for="pkg in packagesInStatus"
              :key="pkg.id"
              class="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 hover:shadow-lg transition-shadow duration-200 ease-in-out flex flex-col"
            >
              <div class="p-5 flex-grow">
                <div class="flex justify-between items-start mb-4">
                  <h4 class="text-md font-semibold text-gray-800">
                    Paquete #{{ pkg.id }}
                  </h4>
                  <span 
                    class="px-2.5 py-1 text-xs font-semibold rounded-full tracking-wide"
                    :class="{
                      'bg-green-100 text-green-800': pkg.status === 'delivered' || pkg.status === 'entregado',
                      'bg-yellow-100 text-yellow-800': pkg.status === 'in transit' || pkg.status === 'en transito',
                      'bg-blue-100 text-blue-800': pkg.status === 'pending' || pkg.status === 'pendiente',
                      'bg-red-100 text-red-800': pkg.status === 'cancelled' || pkg.status === 'cancelado',
                      'bg-gray-100 text-gray-800': pkg.status === 'unknown' || !pkg.status,
                    }"
                  >
                    {{ pkg.status ? pkg.status.charAt(0).toUpperCase() + pkg.status.slice(1) : 'N/D' }}
                  </span>
                </div>

                <div class="space-y-3 text-sm text-gray-600">
                  <div class="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-3 text-gray-400 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                      <path fill-rule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clip-rule="evenodd" />
                    </svg>
                    <div>
                      <p class="font-medium text-gray-800">Descripción</p>
                      <p class="text-gray-600">{{ pkg.name }}</p>
                    </div>
                  </div>
                  <div class="flex items-center">
                    <UserCircleIcon class="w-5 h-5 mr-3 text-gray-400 flex-shrink-0" />
                    <div>
                      <p class="font-medium text-gray-800">Remitente</p>
                      <p>{{ pkg.sender?.firstname }} {{ pkg.sender?.lastname }}</p>
                    </div>
                  </div>
                  <div class="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-3 text-gray-400 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                    </svg>
                    <div>
                      <p class="font-medium text-gray-800">Destinatario</p>
                      <p>{{ pkg.recipient?.firstname }} {{ pkg.recipient?.lastname }}</p>
                    </div>
                  </div>
                  <div class="flex items-center">
                    <CurrencyDollarIcon class="w-5 h-5 mr-3 text-gray-400 flex-shrink-0" />
                    <div>
                      <p class="font-medium text-gray-800">Precio</p>
                      <p>Bs. {{ pkg.price?.toFixed(2) }}</p>
                    </div>
                  </div>
                </div>
              </div>
              <div class="px-5 py-3 bg-gray-50/70 border-t border-gray-100 flex justify-end space-x-2">
                <AppButton size="sm" variant="secondary-outline">Ver Detalles</AppButton>
                <AppButton v-if="pkg.status !== 'delivered' && pkg.status !== 'entregado'" size="sm" variant="primary">Actualizar Estado</AppButton>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ChevronDownIcon, ChevronUpIcon, UserCircleIcon, CurrencyDollarIcon } from '@heroicons/vue/24/outline/index.js'
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
</script> 