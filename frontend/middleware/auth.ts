export default defineNuxtRouteMiddleware(async (to, from) => {
  // Si estamos en el lado del cliente
  if (process.client) {
    try {
      // Importar dinámicamente para evitar problemas de inicialización
      const { useAuthStore } = await import('~/stores/auth')
      const authStore = useAuthStore()

      // Inicializar el estado de autenticación desde localStorage
      authStore.init()

      // Si el usuario no está autenticado y no está en la página de login, redirigir a login
      if (!authStore.isAuthenticated && to.path !== '/login') {
        return navigateTo('/login')
      }

      // Si el usuario está autenticado y está intentando acceder a la página de login, redirigir al dashboard
      if (authStore.isAuthenticated && to.path === '/login') {
        return navigateTo('/dashboard')
      }
    } catch (error) {
      console.error('Error en middleware de autenticación:', error)
      // En caso de error, redirigir a login por seguridad
      if (to.path !== '/login') {
        return navigateTo('/login')
      }
    }
  }
})
