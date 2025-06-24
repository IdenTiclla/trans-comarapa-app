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

    if (data && data.access_token) {
      if (typeof window !== 'undefined') {
        localStorage.setItem('auth_token', data.access_token)
        if (data.refresh_token) {
          localStorage.setItem('refresh_token', data.refresh_token)
        }
        const userInfo = {
          id: data.user_id,
          role: data.role,
          firstname: data.firstname || '',
          lastname: data.lastname || '',
          email: email // Incluir el email en los datos del usuario
        }
        localStorage.setItem('user_data', JSON.stringify(userInfo))
        localStorage.setItem('user_email', email) // Guardar email por separado para migración
      }
    }
    return data
  } catch (error) {
    console.error('Error específico en authService.login:', error.data?.detail || error.message || error)
    // Re-throw the error so the store can catch it and set its error state
    // error.data might contain the actual error message from the server via ofetch
    throw new Error(error.data?.detail || error.message || 'Failed to login')
  }
}

// Cerrar sesión
const logout = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('auth_token')
    localStorage.removeItem('refresh_token')
    localStorage.removeItem('user_data')
    // Potentially notify other tabs/windows, or make an API call to invalidate session/token if backend supports it
  }
}

// Verificar si el usuario está autenticado
const isAuthenticated = () => {
  if (typeof window !== 'undefined') {
    return !!localStorage.getItem('auth_token')
  }
  return false
}

// Obtener el token de autenticación
const getToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('auth_token')
  }
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
const verifyToken = async () => {
  try {
    const token = getToken()
    if (!token) {
      throw new Error('No token available')
    }

    const response = await apiFetch('/auth/verify', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })

    return response
  } catch (error) {
    console.error('Token verification failed:', error)
    throw error
  }
}

// Refrescar el token
const refreshToken = async () => {
  try {
    const currentRefreshToken = localStorage.getItem('refresh_token')
    if (!currentRefreshToken) {
      // No need to proceed if there's no refresh token.
      // The apiFetch onResponseError for 401 might have already logged out.
      throw new Error('No refresh token available.')
    }

    // apiFetch will use its configured baseURL and add Authorization header with the current access_token if present.
    // For refresh token, some APIs might not require Authorization header, or require the refresh token itself as Bearer.
    // Assuming /auth/refresh expects { refresh_token: '...' } in body and no specific auth header, or apiFetch handles it.
    const data = await apiFetch('/auth/refresh', { // Endpoint for refreshing the token
      method: 'POST',
      body: {
        refresh_token: currentRefreshToken, // FastAPI might expect this in body
      },
      // No specific 'Content-Type' header here, apiFetch defaults to JSON for objects usually.
      // If server expects x-www-form-urlencoded, it needs to be set explicitly.
      // The current apiFetch in utils/api.js doesn't automatically set Content-Type for POST like this.
      // We should ensure this matches backend expectations. Assuming JSON for now.
      headers: {
        'Content-Type': 'application/json', // Explicitly set for safety
      }
    })

    if (data && data.access_token) {
      if (typeof window !== 'undefined') {
        localStorage.setItem('auth_token', data.access_token)
        // Backend should also return a new refresh_token if it supports refresh token rotation
        if (data.refresh_token) {
          localStorage.setItem('refresh_token', data.refresh_token)
        }
      }
    }
    return data
  } catch (error) {
    console.error('Error específico en authService.refreshToken:', error.data?.detail || error.message || error)
    // apiFetch's onResponseError for 401 on /auth/refresh should ideally handle logout.
    // Re-throwing allows the store to also react if needed.
    logout() // Ensure logout if refresh fails critically
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
