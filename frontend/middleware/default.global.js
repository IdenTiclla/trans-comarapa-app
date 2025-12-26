// Middleware global que se ejecuta en todas las páginas
// NOTA: La autenticación principal se maneja en auth.global.ts
import { useAuthStore } from '~/stores/auth'

export default defineNuxtRouteMiddleware(async (to) => {
  // Si estamos en el servidor, no hacer nada
  if (process.server) return
  
  const authStore = useAuthStore()
  
  // Rutas públicas que no requieren autenticación (incluyendo landing page)
  const publicRoutes = ['/', '/login', '/about', '/services', '/welcome']
  
  // Si la ruta es pública, permitir el acceso sin verificación
  if (publicRoutes.includes(to.path)) {
    // Si el usuario ya está autenticado y trata de acceder a login, redirigir al dashboard
    if (authStore.isAuthenticated && to.path === '/login') {
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
          return navigateTo('/dashboards/dashboard-client')
      }
    }
    // Permitir acceso a la landing page y otras rutas públicas
    return
  }
  
  // Si el usuario no está autenticado y trata de acceder a una ruta protegida, redirigir a login
  if (!authStore.isAuthenticated) {
    return navigateTo('/login')
  }
  
  // NOTA: Verificación de token deshabilitada para evitar bucles infinitos
  // La verificación de token ocurre cuando las API calls individuales lo necesitan
  // Los otros middleware (auth.global.ts) manejan la autenticación básica
})
