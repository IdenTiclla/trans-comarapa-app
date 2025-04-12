// Middleware para proteger rutas que requieren autenticación
import { useAuthStore } from '~/stores/auth'

export default defineNuxtRouteMiddleware((to, from) => {
  const authStore = useAuthStore()
  
  // Si el usuario no está autenticado, redirigir a la página de inicio de sesión
  if (!authStore.isAuthenticated) {
    return navigateTo('/login')
  }
})
