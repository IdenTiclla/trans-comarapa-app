<template>
  <div class="min-h-screen bg-gray-50 flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full text-center space-y-8 bg-white p-10 rounded-2xl shadow-xl border border-gray-100 relative overflow-hidden">
      <!-- Decorative background elements -->
      <div class="absolute -top-24 -right-24 w-48 h-48 bg-indigo-50 rounded-full opacity-50 blur-3xl"></div>
      <div class="absolute -bottom-24 -left-24 w-48 h-48 bg-blue-50 rounded-full opacity-50 blur-3xl"></div>

      <div class="relative z-10">
        <div class="mx-auto flex items-center justify-center h-24 w-24 rounded-full bg-red-100 mb-8" v-if="error.statusCode !== 404">
          <svg class="h-12 w-12 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <div class="mx-auto flex items-center justify-center h-24 w-24 rounded-full bg-indigo-100 mb-8" v-else>
          <svg class="h-12 w-12 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        <h2 class="mt-2 text-7xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-blue-600 drop-shadow-sm">
          {{ displayStatusCode }}
        </h2>
        <h3 class="mt-6 text-2xl font-bold text-gray-900 tracking-tight sm:text-3xl">
          {{ getErrorTitle }}
        </h3>
        <p class="mt-4 text-base text-gray-600">
          {{ getErrorMessage }}
        </p>
      </div>
      
      <div class="mt-8 flex flex-col sm:flex-row justify-center gap-4 relative z-10">
        <AppButton 
          v-if="error.statusCode !== 404"
          variant="outline" 
          size="lg" 
          @click="handleRetry"
          class="w-full sm:w-auto"
        >
          Reintentar
        </AppButton>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, onMounted, onUnmounted } from 'vue'
import AppButton from '~/components/common/AppButton.vue'

const props = defineProps({
  error: {
    type: Object,
    default: () => ({})
  }
})

const isOffline = ref(false)

const updateOnlineStatus = () => {
  isOffline.value = !navigator.onLine
}

onMounted(() => {
  window.addEventListener('online', updateOnlineStatus)
  window.addEventListener('offline', updateOnlineStatus)
  updateOnlineStatus()
})

onUnmounted(() => {
  window.removeEventListener('online', updateOnlineStatus)
  window.removeEventListener('offline', updateOnlineStatus)
})

const displayStatusCode = computed(() => {
  if (isOffline.value) return 'OFFLINE'
  return props.error.statusCode || '500'
})

const getErrorTitle = computed(() => {
  if (isOffline.value) return 'Sin conexión a internet'
  
  if (props.error.statusCode === 404) {
    return 'Página no encontrada'
  }
  if (props.error.statusCode === 403) {
    return 'Acceso denegado'
  }
  if (props.error.statusCode === 401) {
    return 'Sesión expirada'
  }
  if (props.error.statusCode === 408 || props.error.statusCode === 504) {
    return 'Tiempo de espera agotado'
  }
  return 'Ha ocurrido un error inesperado'
})

const getErrorMessage = computed(() => {
  if (isOffline.value) return 'Por favor, verifica tu conexión a internet e intenta nuevamente.'
  
  if (props.error.statusCode === 404) {
    return 'Lo sentimos, no pudimos encontrar la página que estás buscando.'
  }
  if (props.error.statusCode === 403) {
    return 'No tienes permisos para acceder a este recurso.'
  }
  if (props.error.statusCode === 401) {
    return 'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.'
  }
  if (props.error.statusCode === 408 || props.error.statusCode === 504) {
    return 'El servidor tardó demasiado en responder. Por favor, intenta de nuevo.'
  }
  return props.error.message || 'Por favor, intenta nuevamente más tarde o contacta al soporte técnico.'
})

const handleError = () => {
  const redirectPath = props.error.statusCode === 401 ? '/login' : '/'
  
  if (typeof clearError !== 'undefined') {
    clearError({ redirect: redirectPath })
  } else if (typeof navigateTo !== 'undefined') {
    navigateTo(redirectPath)
  } else {
    window.location.href = redirectPath
  }
}

const handleRetry = () => {
  if (typeof clearError !== 'undefined') {
    clearError()
  } else {
    window.location.reload()
  }
}
</script>
