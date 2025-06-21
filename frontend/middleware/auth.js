// Middleware para páginas que requieren autenticación con validación de token
export default defineNuxtRouteMiddleware(async (to, from) => {
  if (process.client) {
    const authStore = useAuthStore()
    
    // Asegurarse de que el estado de autenticación esté inicializado
    authStore.init()
    
    // Verificación básica: si no hay token, redirigir inmediatamente
    if (!authStore.isAuthenticated) {
      return navigateTo('/login')
    }
    
    // Verificación avanzada: validar token en el servidor
    try {
      // Importar authService dinámicamente para evitar problemas de SSR
      const { default: authService } = await import('~/services/authService')
      
      // Intentar verificar el token en el servidor
      await authService.verifyToken()
      
      // Si llegamos aquí, el token es válido
      console.log('✅ Token válido - acceso permitido')
      
    } catch (error) {
      console.warn('🔒 Token inválido o expirado, cerrando sesión automáticamente')
      
      // Token inválido o expirado - hacer logout automático
      await authStore.logout()
      
      // Redirigir al login
      return navigateTo('/login')
    }
  }
}) 