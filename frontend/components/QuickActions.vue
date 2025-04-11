<template>
  <div class="bg-white rounded-lg shadow">
    <div class="px-6 py-4 border-b border-gray-200">
      <h3 class="text-lg font-semibold text-gray-900">Acciones Rápidas</h3>
    </div>
    <div class="p-6 grid grid-cols-2 gap-4">
      <button 
        v-for="action in actions" 
        :key="action.label"
        class="flex flex-col items-center justify-center p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
        @click="$emit('action-click', action.id)"
      >
        <component :is="action.icon" class="h-8 w-8 text-gray-500 mb-2" />
        <span class="text-sm font-medium text-gray-700">{{ action.label }}</span>
      </button>
    </div>
  </div>
</template>

<script setup>
defineProps({
  actions: {
    type: Array,
    required: true
  }
})

defineEmits(['action-click'])
</script>
