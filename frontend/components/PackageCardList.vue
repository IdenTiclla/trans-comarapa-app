<template>
  <div>
    <div v-if="packages.length === 0 && !isLoading" class="text-center py-12 bg-white rounded-lg shadow">
      <svg xmlns="http://www.w3.org/2000/svg" class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
      </svg>
      <h3 class="mt-2 text-sm font-medium text-gray-900">No hay encomiendas</h3>
      <p class="mt-1 text-sm text-gray-500">Intente ajustar los filtros o cree una nueva encomienda.</p>
    </div>
    <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      <PackageCard 
        v-for="pkg in packages" 
        :key="pkg.id" 
        :pkg="pkg"
        @view-package="$emit('viewPackage', $event)"
        @edit-package="$emit('editPackage', $event)"
        @delete-package="$emit('deletePackage', $event)"
      />
    </div>
     <div v-if="isLoading" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
        <!-- Placeholder/Skeleton Loader -->
        <div v-for="n in 3" :key="`skeleton-${n}`" class="bg-white shadow-lg rounded-lg overflow-hidden">
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
  }
});

defineEmits(['viewPackage', 'editPackage', 'deletePackage']);
</script>

<style scoped>
/* Add any specific styles for the card list if needed */
</style> 