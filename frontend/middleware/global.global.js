// Middleware global que se ejecuta en todas las páginas
import { useAuthStore } from '~/stores/auth'

export default defineNuxtRouteMiddleware((to, from) => {
  // Si estamos en el servidor, no hacer nada
  if (process.server) return
  
  const authStore = useAuthStore()
  
  // Rutas públicas que no requieren autenticación
  const publicRoutes = ['/login']
  
  // Si la ruta es pública, permitir el acceso
  if (publicRoutes.includes(to.path)) {
    return
  }
  
  // Si el usuario no está autenticado, redirigir a la página de inicio de sesión
  if (!authStore.isAuthenticated) {
    return navigateTo('/login')
  }
})
