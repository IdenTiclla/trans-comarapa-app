<template>
  <button 
    :class="[
      'px-4 py-2 rounded transition-colors',
      variant === 'primary' ? 'bg-blue-600 hover:bg-blue-700 text-white' :
      variant === 'secondary' ? 'bg-gray-600 hover:bg-gray-700 text-white' :
      variant === 'success' ? 'bg-green-600 hover:bg-green-700 text-white' :
      variant === 'danger' ? 'bg-red-600 hover:bg-red-700 text-white' :
      'bg-gray-200 hover:bg-gray-300 text-gray-800'
    ]"
    :disabled="disabled"
    @click="$emit('click')"
  >
    <slot></slot>
  </button>
</template>

<script setup>
defineProps({
  variant: {
    type: String,
    default: 'primary',
    validator: (value) => ['primary', 'secondary', 'success', 'danger', 'default'].includes(value)
  },
  disabled: {
    type: Boolean,
    default: false
  }
})

defineEmits(['click'])
</script>
