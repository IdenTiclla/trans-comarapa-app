// Middleware global que se ejecuta en todas las páginas
import { useAuthStore } from '~/stores/auth'

export default defineNuxtRouteMiddleware((to) => {
  // Si estamos en el servidor, no hacer nada
  if (process.server) return
  
  const authStore = useAuthStore()
  
  // Rutas públicas que no requieren autenticación
  const publicRoutes = ['/login']
  
  // Si la ruta es pública, permitir el acceso
  if (publicRoutes.includes(to.path)) {
    // Si el usuario ya está autenticado y trata de acceder a login, redirigir al dashboard
    if (authStore.isAuthenticated && to.path === '/login') {
      // Redirigir al dashboard específico según el rol
      const role = authStore.userRole
      switch (role) {
        case 'admin':
          return navigateTo('/dashboards/dashboard-admin')
        case 'secretary':
          return navigateTo('/dashboards/dashboard-secretary')
        case 'driver':
          return navigateTo('/dashboards/dashboard-driver')
        case 'assistant':
          return navigateTo('/dashboards/dashboard-assistant')
        case 'client':
          return navigateTo('/dashboards/dashboard-client')
        default:
          return navigateTo('/dashboard')
      }
    }
    return
  }
  
  // Si el usuario no está autenticado, redirigir a la página de inicio de sesión
  if (!authStore.isAuthenticated) {
    return navigateTo('/login')
  }
})
