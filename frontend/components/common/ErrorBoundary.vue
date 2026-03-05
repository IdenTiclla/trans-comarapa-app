<template>
  <div v-if="hasError" class="p-4 rounded-xl border border-red-200 bg-red-50 text-center m-4">
    <div class="inline-flex items-center justify-center w-12 h-12 rounded-full bg-red-100 mb-4">
      <svg class="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    </div>
    <h3 class="text-lg font-medium text-red-900 mb-2">Algo salió mal al cargar esta sección</h3>
    <p class="text-sm text-red-700 mb-4">{{ errorMessage }}</p>
    <button @click="retry" class="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 focus:ring-4 focus:ring-red-200 transition-colors">
      <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
         <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
      </svg>
      Reintentar
    </button>
  </div>
  <slot v-else></slot>
</template>

<script setup>
import { ref, onErrorCaptured } from 'vue'

const hasError = ref(false)
const errorMessage = ref('')

onErrorCaptured((err, instance, info) => {
  console.error('[ErrorBoundary] Error capturado:', err, info)
  hasError.value = true
  errorMessage.value = err.message || 'Error de renderizado en el componente.'
  return false // Evita que se propague hacia arriba (crasheando la página completa)
})

const retry = () => {
  hasError.value = false
  errorMessage.value = ''
}
</script>
