<template>
  <button 
    :class="[
      'rounded transition-colors flex items-center justify-center font-medium focus:outline-none focus:ring-2 focus:ring-offset-2',
      sizeClasses,
      variantClasses,
      { 'opacity-50 cursor-not-allowed': disabled || loading }
    ]"
    :disabled="disabled || loading"
    @click="$emit('click')"
  >
    <svg v-if="loading" class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
    <slot v-else></slot>
  </button>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  variant: {
    type: String,
    default: 'primary',
    validator: (value) => ['primary', 'secondary', 'success', 'danger', 'default', 'outline', 'danger-outline', 'warning'].includes(value)
  },
  size: {
    type: String,
    default: 'md',
    validator: (value) => ['sm', 'md', 'lg'].includes(value)
  },
  disabled: {
    type: Boolean,
    default: false
  },
  loading: {
    type: Boolean,
    default: false
  }
})

defineEmits(['click'])

const sizeClasses = computed(() => {
  switch (props.size) {
    case 'sm': return 'px-3 py-1.5 text-sm';
    case 'lg': return 'px-6 py-3 text-lg';
    case 'md':
    default: return 'px-4 py-2 text-base';
  }
});

const variantClasses = computed(() => {
  switch (props.variant) {
    case 'primary': return 'bg-blue-600 hover:bg-blue-700 text-white border border-transparent focus:ring-blue-500';
    case 'secondary': return 'bg-gray-600 hover:bg-gray-700 text-white border border-transparent focus:ring-gray-500';
    case 'success': return 'bg-green-600 hover:bg-green-700 text-white border border-transparent focus:ring-green-500';
    case 'danger': return 'bg-red-600 hover:bg-red-700 text-white border border-transparent focus:ring-red-500';
    case 'warning': return 'bg-yellow-500 hover:bg-yellow-600 text-white border border-transparent focus:ring-yellow-500';
    case 'outline': return 'bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 focus:ring-indigo-500';
    case 'danger-outline': return 'bg-white hover:bg-red-50 text-red-600 border border-red-300 focus:ring-red-500';
    default: return 'bg-gray-200 hover:bg-gray-300 text-gray-800 border border-transparent focus:ring-gray-500';
  }
});
</script>
