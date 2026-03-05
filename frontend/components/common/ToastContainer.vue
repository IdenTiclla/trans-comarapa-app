<template>
  <div class="fixed top-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none w-full max-w-sm px-4 sm:px-0">
    <TransitionGroup name="toast" tag="div" class="flex flex-col gap-2">
      <div 
        v-for="toast in toasts" 
        :key="toast.id"
        class="pointer-events-auto overflow-hidden rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 w-full bg-white"
      >
        <div class="p-4 border-l-4" :class="getToastBorderClass(toast.type)">
          <div class="flex items-start">
            <div class="flex-shrink-0">
              <component :is="getToastIcon(toast.type)" class="h-6 w-6" :class="getToastIconClass(toast.type)" aria-hidden="true" />
            </div>
            <div class="ml-3 w-0 flex-1 pt-0.5">
              <p class="text-sm font-medium text-gray-900">{{ toast.title }}</p>
              <p v-if="toast.message" class="mt-1 text-sm text-gray-500">{{ toast.message }}</p>
            </div>
            <div class="ml-4 flex-shrink-0 flex">
              <button 
                @click="removeToast(toast.id)" 
                class="bg-white rounded-md inline-flex text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <span class="sr-only">Cerrar</span>
                <svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </TransitionGroup>
  </div>
</template>

<script setup>
import { useToast } from '~/composables/useToast'
import { h } from 'vue'

const { toasts, removeToast } = useToast()

const getToastBorderClass = (type) => {
  const classes = {
    success: 'border-green-500',
    error: 'border-red-500',
    warning: 'border-yellow-500',
    info: 'border-blue-500'
  }
  return classes[type] || classes.info
}

const getToastIconClass = (type) => {
  const classes = {
    success: 'text-green-500',
    error: 'text-red-500',
    warning: 'text-yellow-500',
    info: 'text-blue-500'
  }
  return classes[type] || classes.info
}

const getToastIcon = (type) => {
  if (type === 'success') {
    return () => h('svg', { fill: 'none', viewBox: '0 0 24 24', stroke: 'currentColor', strokeWidth: '2' }, [
      h('path', { strokeLinecap: 'round', strokeLinejoin: 'round', d: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' })
    ])
  }
  if (type === 'error') {
    return () => h('svg', { fill: 'none', viewBox: '0 0 24 24', stroke: 'currentColor', strokeWidth: '2' }, [
      h('path', { strokeLinecap: 'round', strokeLinejoin: 'round', d: 'M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z' })
    ])
  }
  if (type === 'warning') {
    return () => h('svg', { fill: 'none', viewBox: '0 0 24 24', stroke: 'currentColor', strokeWidth: '2' }, [
      h('path', { strokeLinecap: 'round', strokeLinejoin: 'round', d: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z' })
    ])
  }
  return () => h('svg', { fill: 'none', viewBox: '0 0 24 24', stroke: 'currentColor', strokeWidth: '2' }, [
    h('path', { strokeLinecap: 'round', strokeLinejoin: 'round', d: 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z' })
  ])
}
</script>

<style scoped>
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}
.toast-enter-from {
  opacity: 0;
  transform: translateX(30px);
}
.toast-leave-to {
  opacity: 0;
  transform: scale(0.9);
}
</style>
