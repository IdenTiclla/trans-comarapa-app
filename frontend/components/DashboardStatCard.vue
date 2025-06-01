<template>
  <div class="bg-white overflow-hidden shadow rounded-lg">
    <div class="p-5">
      <div class="flex items-center">
        <div class="ml-0 w-0 flex-1">
          <dl>
            <dt class="text-sm font-medium text-gray-500 truncate">{{ title }}</dt>
            <dd class="flex items-baseline">
              <span class="text-2xl font-semibold text-gray-900">{{ value }}</span>
              <span v-if="change" :class="['ml-2 text-sm font-medium', changeColor]">{{ change }}</span>
            </dd>
          </dl>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  title: {
    type: String,
    required: true
  },
  value: {
    type: String,
    required: true
  },
  change: {
    type: String,
    default: ''
  },
  changeColor: {
    type: String,
    default: 'text-green-600' // Default to green for positive changes
  }
})
</script>

<style scoped>
/* Add any specific styles for this card if needed */
</style> 