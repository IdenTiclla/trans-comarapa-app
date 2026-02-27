/**
 * Unified authentication middleware.
 * 
 * Consolidates the previously split default.global.js and auth.global.ts
 * into a single middleware that handles:
 * - Public route access
 * - Redirect authenticated users away from login
 * - Redirect unauthenticated users to login
 */
export default defineNuxtRouteMiddleware(async (to) => {
  // Skip server-side
  if (process.server) return

  // Public routes that do not require authentication
  const publicRoutes = ['/', '/login', '/about', '/services', '/welcome']

  try {
    const { useAuthStore } = await import('~/stores/auth')
    const authStore = useAuthStore()

    // Ensure auth state is initialized
    if (!authStore.user) {
      authStore.init()
    }

    const isPublicRoute = publicRoutes.includes(to.path)

    // If authenticated and heading to login, redirect to role dashboard
    if (authStore.isAuthenticated && to.path === '/login') {
      return navigateTo(getDashboardPath(authStore.user?.role))
    }

    // Public routes: allow access without authentication
    if (isPublicRoute) return

    // Protected routes: require authentication
    if (!authStore.isAuthenticated) {
      return navigateTo('/login')
    }
  } catch (error) {
    console.error('Error en middleware de autenticación:', error)
    if (!publicRoutes.includes(to.path)) {
      return navigateTo('/login')
    }
  }
})

/**
 * Returns the dashboard path for a given user role.
 */
function getDashboardPath(role?: string): string {
  const dashboards: Record<string, string> = {
    admin: '/dashboards/dashboard-admin',
    secretary: '/dashboards/dashboard-secretary',
    driver: '/dashboards/dashboard-driver',
    assistant: '/dashboards/dashboard-assistant',
    client: '/dashboards/dashboard-client',
  }
  return dashboards[role ?? ''] ?? '/dashboards/dashboard-secretary'
}