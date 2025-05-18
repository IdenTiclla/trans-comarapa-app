import { useAuthStore } from '~/stores/auth';

export default defineNuxtPlugin(async (nuxtApp) => {
  if (process.server) {
    return; // Don't run on server
  }

  // console.log('[Auth Init Plugin] Running...');
  try {
    const authStore = useAuthStore(nuxtApp.$pinia);
    // Check if already initialized or if token exists to avoid redundant calls if not strictly necessary
    // However, init() is idempotent in the current auth.js store
    authStore.init();
    // console.log('[Auth Init Plugin] Auth store initialized. Token:', authStore.token ? 'Exists' : 'None');
  } catch (error) {
    console.error('[Auth Init Plugin] Error initializing auth store:', error);
  }
}); 