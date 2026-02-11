<template>
  <div>
    <!-- Empty state -->
    <div v-if="packages.length === 0 && !isLoading" class="text-center py-12 bg-white rounded-lg shadow-sm border border-gray-200">
      <svg xmlns="http://www.w3.org/2000/svg" class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
      </svg>
      <h3 class="mt-2 text-sm font-medium text-gray-900">No hay encomiendas</h3>
      <p class="mt-1 text-sm text-gray-500">Intente ajustar los filtros o cree una nueva encomienda.</p>
    </div>

    <!-- Grid view -->
    <div v-else-if="viewMode === 'grid'" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      <PackageCard 
        v-for="pkg in packages" 
        :key="pkg.id" 
        :pkg="pkg"
        @view-package="$emit('viewPackage', $event)"
        @edit-package="$emit('editPackage', $event)"
        @delete-package="$emit('deletePackage', $event)"
      />
    </div>

    <!-- Table view -->
    <div v-else-if="viewMode === 'table'" class="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Código</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Remitente</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Destinatario</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Precio</th>
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="pkg in packages" :key="pkg.id" class="hover:bg-gray-50 transition-colors">
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                {{ pkg.tracking_code || `#${pkg.id}` }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {{ pkg.sender_name || 'N/A' }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {{ pkg.receiver_name || 'N/A' }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span :class="getStatusClass(pkg.status)" class="inline-flex px-2 py-1 text-xs font-semibold rounded-full">
                  {{ getStatusText(pkg.status) }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ formatDate(pkg.created_at) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                Bs. {{ pkg.price || '0.00' }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div class="flex items-center justify-end space-x-2">
                  <button
                    @click="$emit('viewPackage', pkg.id)"
                    class="text-green-600 hover:text-green-900 p-1 rounded-md hover:bg-green-50 transition-colors"
                    title="Ver detalles"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </button>
                  <button
                    @click="$emit('editPackage', pkg.id)"
                    class="text-blue-600 hover:text-blue-900 p-1 rounded-md hover:bg-blue-50 transition-colors"
                    title="Editar"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button
                    @click="$emit('deletePackage', pkg.id)"
                    class="text-red-600 hover:text-red-900 p-1 rounded-md hover:bg-red-50 transition-colors"
                    title="Eliminar"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Loading state -->
    <div v-if="isLoading">
      <!-- Grid loading -->
      <div v-if="viewMode === 'grid'" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <div v-for="n in 8" :key="`skeleton-${n}`" class="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
          <div class="p-5 animate-pulse">
            <div class="h-6 bg-gray-300 rounded w-3/4 mb-3"></div>
            <div class="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div class="space-y-3">
              <div class="grid grid-cols-3 gap-4">
                <div class="h-4 bg-gray-200 rounded col-span-1"></div>
                <div class="h-4 bg-gray-200 rounded col-span-2"></div>
              </div>
              <div class="grid grid-cols-3 gap-4">
                <div class="h-4 bg-gray-200 rounded col-span-1"></div>
                <div class="h-4 bg-gray-200 rounded col-span-2"></div>
              </div>
              <div class="h-4 bg-gray-200 rounded w-5/6"></div>
            </div>
            <div class="mt-4 pt-4 border-t border-gray-200 flex sm:justify-end space-x-3">
              <div class="h-8 w-20 bg-gray-300 rounded"></div>
              <div class="h-8 w-20 bg-gray-300 rounded"></div>
              <div class="h-8 w-20 bg-gray-300 rounded"></div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Table loading -->
      <div v-else class="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Código</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Remitente</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Destinatario</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Precio</th>
                <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="n in 5" :key="`table-skeleton-${n}`" class="animate-pulse">
                <td class="px-6 py-4 whitespace-nowrap"><div class="h-4 bg-gray-200 rounded w-16"></div></td>
                <td class="px-6 py-4 whitespace-nowrap"><div class="h-4 bg-gray-200 rounded w-24"></div></td>
                <td class="px-6 py-4 whitespace-nowrap"><div class="h-4 bg-gray-200 rounded w-24"></div></td>
                <td class="px-6 py-4 whitespace-nowrap"><div class="h-6 bg-gray-200 rounded-full w-20"></div></td>
                <td class="px-6 py-4 whitespace-nowrap"><div class="h-4 bg-gray-200 rounded w-20"></div></td>
                <td class="px-6 py-4 whitespace-nowrap"><div class="h-4 bg-gray-200 rounded w-16"></div></td>
                <td class="px-6 py-4 whitespace-nowrap text-right">
                  <div class="flex justify-end space-x-2">
                    <div class="h-6 w-6 bg-gray-200 rounded"></div>
                    <div class="h-6 w-6 bg-gray-200 rounded"></div>
                    <div class="h-6 w-6 bg-gray-200 rounded"></div>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import PackageCard from './PackageCard.vue';

const props = defineProps({
  packages: {
    type: Array,
    required: true,
  },
  isLoading: {
    type: Boolean,
    default: false,
  },
  viewMode: {
    type: String,
    default: 'grid',
    validator: (value) => ['grid', 'table'].includes(value)
  }
});

defineEmits(['viewPackage', 'editPackage', 'deletePackage']);

// Helper functions for table view
const formatDate = (dateString) => {
  if (!dateString) return 'N/A'
  const date = new Date(dateString)
  return date.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

const getStatusText = (status) => {
  const statusMap = {
    'pending': 'Pendiente',
    'in_transit': 'En Tránsito',
    'delivered': 'Entregado',
    'cancelled': 'Cancelado'
  }
  return statusMap[status] || status
}

const getStatusClass = (status) => {
  const statusClasses = {
    'pending': 'bg-yellow-100 text-yellow-800',
    'in_transit': 'bg-blue-100 text-blue-800',
    'delivered': 'bg-green-100 text-green-800',
    'cancelled': 'bg-red-100 text-red-800'
  }
  return statusClasses[status] || 'bg-gray-100 text-gray-800'
}
</script>

<style scoped>
/* Add any specific styles for the card list if needed */
</style> 