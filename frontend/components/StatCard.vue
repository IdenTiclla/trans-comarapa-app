<template>
  <div class="bg-white rounded-lg shadow p-6">
    <div class="flex items-center">
      <div class="p-3 rounded-full" :class="bgColor">
        <component :is="icon" class="h-8 w-8 text-white" />
      </div>
      <div class="ml-4">
        <p class="text-sm text-gray-500 font-medium">{{ title }}</p>
        <p class="text-2xl font-semibold text-gray-900">{{ value }}</p>
      </div>
    </div>
    <div class="mt-4">
      <p class="text-sm text-gray-500">
        <span v-if="trend > 0" class="text-green-500 font-medium">↑ {{ trend }}%</span>
        <span v-else-if="trend < 0" class="text-red-500 font-medium">↓ {{ Math.abs(trend) }}%</span>
        <span v-else class="text-gray-500 font-medium">0%</span>
        <span class="ml-2">{{ trendText }}</span>
      </p>
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
    type: [String, Number],
    required: true
  },
  icon: {
    type: Object,
    required: true
  },
  bgColor: {
    type: String,
    default: 'bg-blue-500'
  },
  trend: {
    type: Number,
    default: 0
  },
  trendText: {
    type: String,
    default: 'desde el mes pasado'
  }
})
</script>
