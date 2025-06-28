import { $fetch } from 'ofetch'
import { useRuntimeConfig } from '#app' // Nuxt 3 auto-import
import { useAuthStore } from '~/stores/auth'

// The helper functions getApiBaseUrl, getAuthToken, and handleApiError previously here are removed.
// All API call logic should now go through the apiFetch instance below.

export const apiFetch = $fetch.create({
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
      console.warn('API request returned 401. Attempting to handle...')

      // NO intentar refresh automático para el endpoint de login
      // Permitir que el error 401 se propague naturalmente para mostrar "credenciales incorrectas"
      if (options.url === '/auth/login') {
        console.log('Login failed with 401, allowing error to propagate')
        // No hacer nada, dejar que el error se propague
        return
      }

      if (options.url === '/auth/refresh') {
        console.error('Refresh token request failed with 401. Logging out.')
        authStore.logout(true) // Skip server logout to avoid additional 401 errors
        await navigateTo('/login')
        return
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
        return
      }

      // Marcar que se está intentando un refresh para evitar múltiples intentos simultáneos
      if (options._retryCount >= 1) {
        console.error('Too many retry attempts, logging out')
        authStore.logout(true) // Skip server logout to avoid additional 401 errors
        await navigateTo('/login')
        return
      }

      try {
        if (authStore.refreshToken && typeof authStore.refreshToken === 'function') {
          console.log('Attempting to refresh token...');
          await authStore.refreshToken();
          console.log('Token refreshed, retrying original request to:', options.url);
          // Retry the original request with new cookies
          const retryOptions = { ...options, _retryCount: (options._retryCount || 0) + 1 };
          return apiFetch(options.url, retryOptions);
        } else {
          console.warn('No refresh token function available. Logging out.');
          authStore.logout(true); // Skip server logout to avoid additional 401 errors
          await navigateTo('/login');
        }
      } catch (refreshError) {
        console.error('Error during token refresh or retrying request:', refreshError);
        authStore.logout(true); // Skip server logout to avoid additional 401 errors
        await navigateTo('/login');
      } 
    }
    // If not a 401 or if refresh failed, the error will be re-thrown by $fetch, 
    // allowing service/store/component to catch it.
  },
})

export default apiFetch
