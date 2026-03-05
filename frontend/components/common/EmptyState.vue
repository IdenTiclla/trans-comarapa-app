<template>
  <div class="text-center py-12 px-4 bg-white rounded-2xl shadow-sm border border-gray-100">
    <div class="max-w-md mx-auto flex flex-col items-center">
      <!-- Icon Slot -->
      <div v-if="$slots.icon" class="flex items-center justify-center w-20 h-20 mx-auto mb-6 bg-gray-50 rounded-full text-gray-400">
        <slot name="icon"></slot>
      </div>
      <!-- Default Icon if no slot provided -->
      <div v-else class="flex items-center justify-center w-20 h-20 mx-auto mb-6 bg-gray-50 rounded-full text-gray-400">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
        </svg>
      </div>
      
      <!-- Title -->
      <h3 class="text-xl sm:text-2xl font-bold text-gray-900 mb-2">{{ title }}</h3>
      
      <!-- Description -->
      <p class="text-sm sm:text-base text-gray-500 mb-6 text-center">{{ description }}</p>
      
      <!-- Action Slot -->
      <div v-if="$slots.action" class="flex flex-col sm:flex-row gap-3 justify-center w-full">
        <slot name="action"></slot>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    default: '',
  }
})
</script>
