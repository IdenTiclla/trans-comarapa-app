import { $fetch } from 'ofetch'
import { useRuntimeConfig } from '#app' // Nuxt 3 auto-import
import { useAuthStore } from '~/stores/auth' // Assuming auth store is the source of truth for the token after init

// The helper functions getApiBaseUrl, getAuthToken, and handleApiError previously here are removed.
// All API call logic should now go through the apiFetch instance below.

export const apiFetch = $fetch.create({
  onRequest({ options }) {
    const config = useRuntimeConfig()
    const authStore = useAuthStore()

    options.baseURL = config.public.apiBaseUrl

    const token = authStore.token || (typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null);

    if (token) {
      options.headers = {
        ...options.headers,
        Authorization: `Bearer ${token}`,
      }
    }
    // console.log('[apiFetch] onRequest:', options.method, options.baseURL, options.url, options.headers)
  },
  async onResponseError({ response, options, error }) {
    // console.error('[apiFetch] onResponseError:', response.status, response._data, error)
    if (response.status === 401) {
      const authStore = useAuthStore()
      console.warn('API request returned 401. Attempting to handle...')

      if (options.url === '/auth/refresh') {
        console.error('Refresh token request failed with 401. Logging out.')
        authStore.logout()
        return
      }

      try {
        if (authStore.refreshToken && typeof authStore.refreshToken === 'function') {
          console.log('Attempting to refresh token...');
          await authStore.refreshToken();
          console.log('Token refreshed, retrying original request to:', options.url);
          // Retry the original request. The new token is in the store and will be picked up by onRequest.
          // Create a new options object for the retry, ensuring original method, body, etc., are preserved.
          const retryOptions = { ...options, headers: { ...options.headers } }; // Clone headers
          // Remove the original Authorization header if it was set, onRequest will re-add it with the new token.
          delete retryOptions.headers.Authorization; 
          return apiFetch(options.url, retryOptions); // Use options.url directly as baseURL is handled by apiFetch
        } else {
          console.warn('No refresh token function available. Logging out.');
          authStore.logout();
        }
      } catch (refreshError) {
        console.error('Error during token refresh or retrying request:', refreshError);
        authStore.logout();
      } 
    }
    // If not a 401 or if refresh failed, the error will be re-thrown by $fetch, 
    // allowing service/store/component to catch it.
  },
})

export default apiFetch
