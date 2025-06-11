// Middleware global que se ejecuta en todas las páginas
import { useAuthStore } from '~/stores/auth'

export default defineNuxtRouteMiddleware((to) => {
  // Si estamos en el servidor, no hacer nada
  if (process.server) return
  
  const authStore = useAuthStore()
  
  // Función helper para redirigir al dashboard según el rol
  const redirectToDashboard = () => {
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
        return navigateTo('/dashboards/dashboard-client') // fallback por defecto
    }
  }
  
  // Si está en la ruta raíz ("/"), redirigir según estado de autenticación
  if (to.path === '/') {
    if (authStore.isAuthenticated) {
      return redirectToDashboard()
    } else {
      // Pequeño delay para asegurar que el layout se cargue correctamente
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve(navigateTo('/login'))
        }, 50)
      })
    }
  }
  
  // Rutas públicas que no requieren autenticación
  const publicRoutes = ['/login', '/about', '/services', '/welcome']
  
  // Si la ruta es pública, permitir el acceso
  if (publicRoutes.includes(to.path)) {
    // Si el usuario ya está autenticado y trata de acceder a login, redirigir al dashboard
    if (authStore.isAuthenticated && to.path === '/login') {
      return redirectToDashboard()
    }
    return
  }
  
  // Si el usuario no está autenticado y trata de acceder a una ruta protegida, redirigir a login
  if (!authStore.isAuthenticated) {
    return navigateTo('/login')
  }
})
