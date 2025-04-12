// Plugin para inicializar el store de autenticación
import { useAuthStore } from '~/stores/auth'

export default defineNuxtPlugin(({ app }) => {
  const authStore = useAuthStore()
  
  // Inicializar el store con los datos del localStorage
  authStore.init()
})
