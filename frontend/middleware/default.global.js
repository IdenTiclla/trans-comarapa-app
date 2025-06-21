// Middleware global que se ejecuta en todas las páginas
import { useAuthStore } from '~/stores/auth'

export default defineNuxtRouteMiddleware(async (to) => {
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
  
  // VALIDACIÓN ADICIONAL: Verificar que el token sea válido en el servidor
  // Solo para rutas protegidas (no públicas)
  try {
    // Importar authService dinámicamente para evitar problemas de SSR
    const { default: authService } = await import('~/services/authService')
    
    // Intentar verificar el token en el servidor
    const tokenVerification = await authService.verifyToken()
    
    // Si llegamos aquí, el token es válido
    console.log('✅ Token válido - acceso permitido a', to.path)
    
    // Actualizar datos del usuario si es necesario
    if (tokenVerification && tokenVerification.user_id !== authStore.user?.id) {
      console.log('🔄 Actualizando datos del usuario desde servidor')
      authStore.user = {
        id: tokenVerification.user_id,
        email: tokenVerification.email,
        role: tokenVerification.role,
        firstname: tokenVerification.firstname,
        lastname: tokenVerification.lastname
      }
    }
    
  } catch (error) {
    console.warn('🔒 Token inválido o expirado, cerrando sesión automáticamente')
    
    // Token inválido o expirado - hacer logout automático
    await authStore.logout()
    
    // Redirigir al login
    return navigateTo('/login')
  }
})
