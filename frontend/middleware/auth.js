// Middleware para páginas que requieren autenticación (simplificado)
// NOTA: Este middleware ya no hace verificación de token en servidor para evitar
// bucles infinitos con cookies httpOnly. El middleware auth.global.ts maneja
// la autenticación básica y la verificación de token ocurre cuando es necesario.
export default defineNuxtRouteMiddleware(async (to, from) => {
  if (process.client) {
    const authStore = useAuthStore()

    // Asegurarse de que el estado de autenticación esté inicializado
    authStore.init()

    // Verificación básica: si no hay datos de usuario, redirigir inmediatamente
    if (!authStore.isAuthenticated) {
      return navigateTo('/login')
    }

    // Ya no hacemos verificación de token aquí para evitar bucles infinitos
    // Si el token ha expirado, las llamadas API individuales lo detectarán
    // y manejarán el refresh o logout automáticamente
  }
}) 