// Middleware para controlar el acceso basado en roles
import { useAuthStore } from '~/stores/auth'

export default defineNuxtRouteMiddleware((to, from) => {
  const authStore = useAuthStore()
  
  // Si no hay roles requeridos definidos en la ruta, permitir el acceso
  if (!to.meta.requiredRoles) {
    return
  }
  
  // Si el usuario no está autenticado, redirigir a la página de inicio de sesión
  if (!authStore.isAuthenticated) {
    return navigateTo('/login')
  }
  
  // Obtener el rol del usuario
  const userRole = authStore.userRole
  
  // Si el rol del usuario no está en la lista de roles permitidos, redirigir a la página de dashboard correspondiente
  if (!to.meta.requiredRoles.includes(userRole)) {
    // Redirigir al dashboard específico según el rol
    switch (userRole) {
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
})
