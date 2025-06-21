// Plugin global para interceptar errores HTTP 401 y hacer logout automático
import { useAuthStore } from '~/stores/auth'

export default defineNuxtPlugin((nuxtApp) => {
  // Solo en el cliente
  if (import.meta.server) return

  const authStore = useAuthStore()

  // Interceptar todas las llamadas $fetch
  nuxtApp.hook('app:created', () => {
    // Guardar la función original de $fetch
    const originalFetch = globalThis.$fetch

    // Sobrescribir $fetch con nuestro interceptor
    globalThis.$fetch = new Proxy(originalFetch, {
      async apply(target, thisArg, argumentsList) {
        try {
          // Ejecutar la llamada original
          return await target.apply(thisArg, argumentsList)
        } catch (error) {
          // Interceptar errores 401 (Unauthorized)
          if (error.status === 401 || error.statusCode === 401) {
            console.warn('🔒 Sesión expirada detectada. Cerrando sesión automáticamente...')
            
            // Hacer logout automático
            await authStore.logout()
            
            // Redirigir al login
            await navigateTo('/login')
            
            // Opcional: mostrar notificación
            if (window && typeof window.alert === 'function') {
              setTimeout(() => {
                alert('Su sesión ha expirado. Por favor, inicie sesión nuevamente.')
              }, 100)
            }
            
            // Re-throw el error para que los componentes puedan manejarlo si necesario
            throw new Error('Sesión expirada. Redirigiendo al login...')
          }
          
          // Para otros errores, simplemente re-throw
          throw error
        }
      }
    })
  })

  // También interceptar fetch nativo para casos edge
  if (typeof window !== 'undefined' && window.fetch) {
    const originalWindowFetch = window.fetch
    
    window.fetch = new Proxy(originalWindowFetch, {
      async apply(target, thisArg, argumentsList) {
        try {
          const response = await target.apply(thisArg, argumentsList)
          
          // Verificar si la respuesta es 401
          if (response.status === 401) {
            console.warn('🔒 Sesión expirada detectada en fetch nativo. Cerrando sesión automáticamente...')
            
            await authStore.logout()
            await navigateTo('/login')
            
            if (window && typeof window.alert === 'function') {
              setTimeout(() => {
                alert('Su sesión ha expirado. Por favor, inicie sesión nuevamente.')
              }, 100)
            }
          }
          
          return response
        } catch (error) {
          throw error
        }
      }
    })
  }
})