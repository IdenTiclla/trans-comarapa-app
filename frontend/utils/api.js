import { $fetch } from 'ofetch'
import { useRuntimeConfig } from '#app' // Nuxt 3 auto-import
import { useAuthStore } from '~/stores/auth'

// Flag global para prevenir múltiples intentos de refresh simultáneos
let isRefreshing = false
let refreshPromise = null

// Flag para detectar cuando estamos en proceso de logout
let isLoggingOut = false

// Error especial para redirecciones por sesión expirada.
// Los componentes no deben mostrar este error al usuario.
export class SessionExpiredError extends Error {
  constructor() {
    super('Session expired, redirecting to login')
    this.name = 'SessionExpiredError'
  }
}

// Función para marcar cuando estamos en proceso de logout
export const setLoggingOut = (value) => {
  isLoggingOut = value
}

export const apiFetch = $fetch.create({
  timeout: 15000, // 15s timeout por defecto
  onRequest({ options }) {
    const config = useRuntimeConfig()

    options.baseURL = config.public.apiBaseUrl

    // 🔒 FASE 3: Solo cookies httpOnly - eliminado soporte para Authorization headers
    // Incluir cookies httpOnly en todas las peticiones para autenticación
    options.credentials = 'include'

    // console.log('[apiFetch] onRequest:', options.method, options.baseURL, options.url)
  },
  async onResponseError({ response, options, error }) {
    // console.error('[apiFetch] onResponseError:', response.status, response._data, error)
    if (response.status === 401) {
      const authStore = useAuthStore()
      console.warn('API request returned 401. Attempting to handle...', options.url)

      // NO intentar refresh automático para endpoints específicos
      // Permitir que el error 401 se propague naturalmente
      if (options.url === '/auth/login') {
        console.log('Login failed with 401, allowing error to propagate')
        // No hacer nada, dejar que el error se propague
        return
      }

      // NO intentar refresh durante logout - simplemente permitir que falle silenciosamente
      if (options.url === '/auth/logout' || isLoggingOut) {
        console.log('Logout failed with 401 (expected), ignoring error')
        // El logout ya limpiará el estado local, no importa si falla en servidor
        return
      }

      if (options.url === '/auth/refresh') {
        console.error('Refresh token request failed with 401. Clearing auth state and redirecting to login.')
        // Resetear flags de refresh
        isRefreshing = false
        refreshPromise = null
        // Limpiar estado inmediatamente sin intentar logout en servidor
        authStore.user = null
        if (typeof window !== 'undefined') {
          localStorage.removeItem('user_data')
          localStorage.removeItem('user_email')
          localStorage.removeItem('auth_token')
          localStorage.removeItem('refresh_token')
        }
        await navigateTo('/login')
        throw new SessionExpiredError()
      }

      // Prevenir bucle infinito: verificar si el usuario está realmente autenticado
      // Si no hay datos de usuario, no intentar refresh ni logout (ya está deslogueado)
      if (!authStore.user) {
        console.warn('No user data available, redirecting to login')
        // Limpiar solo localStorage sin intentar logout en servidor
        if (typeof window !== 'undefined') {
          localStorage.removeItem('user_data')
          localStorage.removeItem('user_email')
          localStorage.removeItem('auth_token')
          localStorage.removeItem('refresh_token')
        }
        await navigateTo('/login')
        throw new SessionExpiredError()
      }

      // Si la verificación de token específicamente falla con 401,
      // las cookies httpOnly probablemente expiraron. Limpiar estado inmediatamente.
      if (options.url === '/auth/verify') {
        console.warn('Token verification failed with 401. Auth cookies expired. Cleaning state.')
        authStore.logout(true) // Skip server logout to avoid additional 401 errors
        await navigateTo('/login')
        throw new SessionExpiredError()
      }

      // Prevenir múltiples intentos de refresh simultáneos
      if (isRefreshing) {
        console.log('Refresh already in progress, waiting...')
        if (refreshPromise) {
          try {
            await refreshPromise
            // Retry the original request after refresh completes
            const retryOptions = { ...options, _retryCount: (options._retryCount || 0) + 1 };
            return apiFetch(options.url, retryOptions);
          } catch (error) {
            if (error instanceof SessionExpiredError) throw error
            console.error('Refresh failed, redirecting to login')
            await navigateTo('/login')
            throw new SessionExpiredError()
          }
        }
        await navigateTo('/login')
        throw new SessionExpiredError()
      }

      // Marcar que se está intentando un refresh para evitar múltiples intentos simultáneos
      if (options._retryCount >= 1) {
        console.error('Too many retry attempts, logging out')
        authStore.logout(true) // Skip server logout to avoid additional 401 errors
        await navigateTo('/login')
        throw new SessionExpiredError()
      }

      try {
        if (authStore.refreshToken && typeof authStore.refreshToken === 'function') {
          console.log('Attempting to refresh token...');

          // Marcar que estamos refrescando y crear promise compartida
          isRefreshing = true
          refreshPromise = authStore.refreshToken()

          try {
            await refreshPromise;
          } finally {
            // Resetear flags obligatoriamente
            isRefreshing = false
            refreshPromise = null
          }

          console.log('Token refreshed, retrying original request to:', options.url);

          // Retry the original request with new cookies
          const retryOptions = { ...options, _retryCount: (options._retryCount || 0) + 1 };
          return apiFetch(options.url, retryOptions);
        } else {
          console.warn('No refresh token function available. Logging out.');
          authStore.logout(true); // Skip server logout to avoid additional 401 errors
          await navigateTo('/login');
          throw new SessionExpiredError()
        }
      } catch (refreshError) {
        if (refreshError instanceof SessionExpiredError) throw refreshError
        console.error('Error during token refresh or retrying request:', refreshError);
        authStore.logout(true); // Skip server logout to avoid additional 401 errors
        await navigateTo('/login');
        throw new SessionExpiredError()
      }
    }
    // If not a 401 or if refresh failed, the error will be re-thrown by $fetch, 
    // allowing service/store/component to catch it.
  },
})

export default apiFetch
