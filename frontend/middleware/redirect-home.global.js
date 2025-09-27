// Middleware para manejar redirección desde página de inicio
export default defineNuxtRouteMiddleware((to, from) => {
  // Solo aplicar a la ruta raíz
  if (to.path !== '/') return
  
  console.log('🔥 HOME REDIRECT: Capturando navegación a página de inicio')
  
  // En el servidor, solo verificar si hay cookies de sesión
  if (process.server) {
    // No podemos acceder a localStorage en el servidor, así que simplemente permitir
    // que el cliente maneje la redirección
    console.log('🔥 HOME REDIRECT: Servidor - dejando que cliente maneje redirección')
    return
  }
  
  // En el cliente, verificar localStorage
  console.log('🔥 HOME REDIRECT: Cliente - verificando sesión')
  
  try {
    // Verificar si hay datos de usuario válidos en localStorage
    const userData = localStorage.getItem('user_data')
    console.log('🔥 HOME REDIRECT: userData en localStorage:', userData)
    
    if (userData && userData !== 'undefined' && userData !== 'null') {
      try {
        const user = JSON.parse(userData)
        console.log('🔥 HOME REDIRECT: Usuario parseado:', user)
        
        // Verificar que el usuario tenga los campos mínimos requeridos
        if (user && user.id && user.role) {
          console.log('🔥 HOME REDIRECT: Usuario válido detectado, rol:', user.role)
          
          // Redirigir al dashboard apropiado según el rol
          let targetPath = ''
          switch (user.role) {
            case 'secretary':
              targetPath = '/dashboards/dashboard-secretary'
              break
            case 'admin':
              targetPath = '/dashboards/dashboard-admin'
              break
            case 'driver':
              targetPath = '/dashboards/dashboard-driver'
              break
            case 'assistant':
              targetPath = '/dashboards/dashboard-assistant'
              break
            case 'client':
              targetPath = '/dashboards/client'
              break
            default:
              console.warn('🔥 HOME REDIRECT: Rol no reconocido:', user.role)
              targetPath = '/login'
          }
          
          console.log(`🔥 HOME REDIRECT: Redirigiendo usuario ${user.role} a ${targetPath}`)
          return navigateTo(targetPath, { replace: true })
        } else {
          console.warn('🔥 HOME REDIRECT: Usuario inválido (sin id o rol):', user)
        }
      } catch (parseError) {
        console.error('🔥 HOME REDIRECT: Error parseando userData:', parseError)
      }
    } else {
      console.log('🔥 HOME REDIRECT: No hay userData válido en localStorage')
    }
    
    // Si llegamos aquí, no hay sesión válida - ir al login
    console.log('🔥 HOME REDIRECT: Sin sesión válida, redirigiendo a login')
    return navigateTo('/login', { replace: true })
    
  } catch (error) {
    console.error('🔥 HOME REDIRECT: Error accediendo a localStorage:', error)
    // En caso de error, ir al login como fallback
    return navigateTo('/login', { replace: true })
  }
})