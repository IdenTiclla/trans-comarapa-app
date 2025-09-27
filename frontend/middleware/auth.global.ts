export default defineNuxtRouteMiddleware(async (to, from) => {
  // Si estamos en el lado del cliente
  if (process.client) {
    try {
      // Importar dinámicamente para evitar problemas de inicialización
      const { useAuthStore } = await import('~/stores/auth')
      const authStore = useAuthStore()

      // authStore.init() is likely already called by the auth-init plugin,
      // but calling it here ensures state is loaded before check if plugin hasn't run yet for some reason.
      // It should be idempotent.
      // 🔒 FASE 2: Ya no verificamos token, solo si hay datos de usuario
      if (!authStore.user) { // Check user data instead of token
        authStore.init();
      }

      // Si el usuario no está autenticado y no está en la página de login, redirigir a login
      if (!authStore.isAuthenticated && to.path !== '/login') {
        // console.log('[Auth Middleware] Not authenticated, redirecting to /login. Current path:', to.path);
        return navigateTo('/login')
      }

      // Si el usuario está autenticado y está intentando acceder a la página de login, redirigir al dashboard apropiado
      if (authStore.isAuthenticated && to.path === '/login') {
        // Redirigir al dashboard según el rol del usuario
        const user = authStore.user
        if (user && user.role) {
          let dashboardPath = ''
          switch (user.role) {
            case 'secretary':
              dashboardPath = '/dashboards/dashboard-secretary'
              break
            case 'admin':
              dashboardPath = '/dashboards/dashboard-admin'
              break
            case 'driver':
              dashboardPath = '/dashboards/dashboard-driver'
              break
            case 'assistant':
              dashboardPath = '/dashboards/dashboard-assistant'
              break
            case 'client':
              dashboardPath = '/dashboards/dashboard-client'
              break
            default:
              dashboardPath = '/dashboards/dashboard-secretary' // fallback
          }
          return navigateTo(dashboardPath)
        }
        // Fallback si no hay rol definido
        return navigateTo('/dashboards/dashboard-secretary')
      }
    } catch (error) {
      console.error('Error en middleware de autenticación:', error)
      // En caso de error, redirigir a login por seguridad
      if (to.path !== '/login') {
        return navigateTo('/login')
      }
    }
  }
  // No action needed on server-side for this specific middleware logic focusing on client-side auth state
}) 