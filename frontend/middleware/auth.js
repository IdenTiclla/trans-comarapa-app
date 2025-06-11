// Middleware simple para páginas que requieren autenticación
export default defineNuxtRouteMiddleware((to, from) => {
  if (process.client) {
    const { useAuthStore } = require('~/stores/auth')
    const authStore = useAuthStore()
    
    // Asegurarse de que el estado de autenticación esté inicializado
    authStore.init()
    
    // Si el usuario no está autenticado, redirigir al login
    if (!authStore.isAuthenticated) {
      return navigateTo('/login')
    }
  }
}) 