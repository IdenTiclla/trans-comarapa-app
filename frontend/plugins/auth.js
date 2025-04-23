// Plugin para inicializar el store de autenticación
import { useAuthStore } from '~/stores/auth'

export default defineNuxtPlugin((nuxtApp) => {
  // Obtener el store de autenticación
  const authStore = useAuthStore()

  // Inicializar el store con los datos del localStorage
  authStore.init()

  // Verificar la autenticación en cada navegación
  nuxtApp.hook('page:start', () => {
    // Inicializar el store de autenticación
    authStore.init()
  })
})
