// Servicio para gestionar la autenticación
import { useRuntimeConfig } from 'nuxt/app'
import apiFetch from '~/utils/api'

// Obtener la URL base de la API
const getApiBaseUrl = () => {
  const config = useRuntimeConfig()
  return config.public.apiBaseUrl
}

// Iniciar sesión
const login = async (email, password) => {
  try {
    const formData = new URLSearchParams()
    formData.append('username', email)
    formData.append('password', password)

    // apiFetch already includes baseURL. /auth/login is the endpoint.
    // It also handles errors globally, but we can catch for specific login logic.
    const data = await apiFetch('/auth/login', {
      method: 'POST',
      headers: {
        // apiFetch adds Authorization if a token exists, but for login, it's not needed initially.
        // Content-Type is important for FastAPI's OAuth2PasswordRequestForm
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData,
    })

    // 🔒 FASE 2: Los tokens ahora se almacenan en cookies httpOnly por el backend
    // Solo necesitamos guardar los datos del usuario en localStorage
    if (data && data.access_token) {
      if (typeof window !== 'undefined') {
        const userInfo = {
          id: data.user_id,
          role: data.role,
          firstname: data.firstname || '',
          lastname: data.lastname || '',
          email: email,
          person: data.person || null // 🆕 Incluir datos de person si existen
        }
        localStorage.setItem('user_data', JSON.stringify(userInfo))
        localStorage.setItem('user_email', email)
      }
    }
    return data
  } catch (error) {
    console.error('Error específico en authService.login:', error.data?.detail || error.message || error)
    // Re-throw the error so the store can catch it and set its error state
    // error.data might contain the actual error message from the server via ofetch
    let errorMessage = error.data?.detail || error.message || 'Error de conexión'
    
    // Traducir mensajes de error comunes del backend
    if (errorMessage === 'Incorrect email or password') {
      errorMessage = 'Email o contraseña incorrectos'
    }
    
    throw new Error(errorMessage)
  }
}

// Cerrar sesión
const logout = async (skipServerLogout = false) => {
  // Solo intentar logout en servidor si hay una sesión activa
  if (!skipServerLogout && getUserData()) {
    try {
      // 🔒 FASE 2: Llamar al endpoint de logout para limpiar cookies httpOnly
      await apiFetch('/auth/logout', {
        method: 'POST',
        credentials: 'include' // Importante: incluir cookies en la petición
      })
    } catch (error) {
      // Silenciar errores 401 ya que indican que no hay sesión válida
      if (error.status !== 401) {
        console.warn('Error al notificar logout al servidor:', error)
      }
      // Continuamos con la limpieza local aunque falle la notificación al servidor
    }
  }
  
  if (typeof window !== 'undefined') {
    // Ya no manejamos tokens en localStorage, solo datos del usuario
    localStorage.removeItem('user_data')
    localStorage.removeItem('user_email')
    
    // Limpiar cualquier token legacy que pueda existir
    localStorage.removeItem('auth_token')
    localStorage.removeItem('refresh_token')
  }
}

// Verificar si el usuario está autenticado
// 🔒 FASE 2: La autenticación ahora se basa en cookies httpOnly
// Usamos la existencia de datos de usuario como indicador inicial
const isAuthenticated = () => {
  if (typeof window !== 'undefined') {
    // Verificar si tenemos datos de usuario (indicador de sesión activa)
    const userData = localStorage.getItem('user_data')
    return !!userData && userData !== 'undefined'
  }
  return false
}

// Obtener el token de autenticación
// 🔒 FASE 2: Los tokens ahora están en cookies httpOnly
// Esta función se mantiene para compatibilidad pero devuelve null
// ya que los tokens se envían automáticamente en las cookies
const getToken = () => {
  // En FASE 2, los tokens se manejan vía cookies httpOnly
  // El navegador los envía automáticamente con credentials: 'include'
  return null
}

// Obtener los datos del usuario
const getUserData = () => {
  if (typeof window !== 'undefined') {
    const userData = localStorage.getItem('user_data')
    if (userData && userData !== 'undefined') {
      try {
        return JSON.parse(userData)
      } catch (error) {
        console.error('Error al analizar los datos del usuario:', error)
        localStorage.removeItem('user_data')
      }
    }
  }
  return null
}

// Verificar si el token es válido en el servidor
// 🔒 FASE 2: Los tokens se envían automáticamente vía cookies
const verifyToken = async () => {
  try {
    const response = await apiFetch('/auth/verify', {
      credentials: 'include' // Incluir cookies httpOnly
    })

    return response
  } catch (error) {
    console.error('Token verification failed:', error)
    throw error
  }
}

// Refrescar el token
// 🔒 FASE 2: Los tokens se manejan vía cookies httpOnly
const refreshToken = async () => {
  try {
    const data = await apiFetch('/auth/refresh', {
      method: 'POST',
      credentials: 'include', // Incluir cookies httpOnly (refresh_token)
      headers: {
        'Content-Type': 'application/json'
      }
    })

    // Las nuevas cookies se establecen automáticamente por el backend
    // Solo necesitamos actualizar los datos del usuario si han cambiado
    if (data && data.user_id && typeof window !== 'undefined') {
      const currentUserData = getUserData()
      if (currentUserData) {
        const updatedUserInfo = {
          ...currentUserData,
          firstname: data.firstname || currentUserData.firstname,
          lastname: data.lastname || currentUserData.lastname,
          person: data.person || currentUserData.person
        }
        localStorage.setItem('user_data', JSON.stringify(updatedUserInfo))
      }
    }
    
    return data
  } catch (error) {
    console.error('Error específico en authService.refreshToken:', error.data?.detail || error.message || error)
    // Si falla el refresh, hacer logout
    await logout()
    throw new Error(error.data?.detail || error.message || 'Failed to refresh token')
  }
}

export default {
  login,
  logout,
  isAuthenticated,
  getToken,
  getUserData,
  refreshToken,
  verifyToken
}
