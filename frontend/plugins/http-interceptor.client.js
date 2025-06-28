// Plugin global para interceptar errores HTTP 401 y hacer logout automático
import { useAuthStore } from '~/stores/auth'

export default defineNuxtPlugin((nuxtApp) => {
  // Solo en el cliente
  if (import.meta.server) return

  const authStore = useAuthStore()
  
  // Flag para prevenir loops infinitos
  let isLoggingOut = false
  
  // TEMPORALMENTE DESHABILITADO para debug de login
  console.log('🔒 HTTP Interceptor temporalmente deshabilitado para debug')
  return

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
            // Prevenir loops infinitos
            if (isLoggingOut) {
              console.log('🔒 Ya estamos en proceso de logout, no haciendo nada más')
              throw error
            }
            
            // Verificar si es una URL que NO debe hacer logout automático
            const url = argumentsList[0]
            console.log('🔒 URL detectada:', url)
            
            const isAuthEndpoint = url && (
              url.includes('/auth/login') || 
              url.includes('/auth/logout') || 
              url.includes('/auth/register') ||
              url.endsWith('/login') ||
              url.endsWith('/logout') ||
              url.endsWith('/register')
            )
            
            if (isAuthEndpoint) {
              console.log('🔒 Error 401 en endpoint de autenticación, no haciendo logout automático')
              // Para endpoints de auth, simplemente re-throw el error sin logout
              throw error
            }
            
            console.warn('🔒 Sesión expirada detectada. Cerrando sesión automáticamente...')
            
            // Marcar que estamos haciendo logout
            isLoggingOut = true
            
            try {
              // Hacer logout automático solo para endpoints protegidos
              await authStore.logout()
              
              // Redirigir al login
              await navigateTo('/login')
              
              // Opcional: mostrar notificación
              if (window && typeof window.alert === 'function') {
                setTimeout(() => {
                  alert('Su sesión ha expirado. Por favor, inicie sesión nuevamente.')
                }, 100)
              }
            } finally {
              // Resetear flag después de un tiempo
              setTimeout(() => {
                isLoggingOut = false
              }, 2000)
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
            // Prevenir loops infinitos
            if (isLoggingOut) {
              console.log('🔒 Ya estamos en proceso de logout en fetch nativo, no haciendo nada más')
              return response
            }
            
            // Verificar si es una URL que NO debe hacer logout automático
            const url = argumentsList[0]
            console.log('🔒 URL de fetch nativo detectada:', url)
            
            const isAuthEndpoint = url && (
              url.includes('/auth/login') || 
              url.includes('/auth/logout') || 
              url.includes('/auth/register') ||
              url.endsWith('/login') ||
              url.endsWith('/logout') ||
              url.endsWith('/register')
            )
            
            if (isAuthEndpoint) {
              console.log('🔒 Error 401 en fetch nativo de endpoint de autenticación, no haciendo logout automático')
              return response
            }
            
            console.warn('🔒 Sesión expirada detectada en fetch nativo. Cerrando sesión automáticamente...')
            
            // Marcar que estamos haciendo logout
            isLoggingOut = true
            
            try {
              await authStore.logout()
              await navigateTo('/login')
              
              if (window && typeof window.alert === 'function') {
                setTimeout(() => {
                  alert('Su sesión ha expirado. Por favor, inicie sesión nuevamente.')
                }, 100)
              }
            } finally {
              // Resetear flag después de un tiempo
              setTimeout(() => {
                isLoggingOut = false
              }, 2000)
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