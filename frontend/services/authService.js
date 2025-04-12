// Servicio para gestionar la autenticación
import { useRuntimeConfig } from 'nuxt/app'

// Obtener la URL base de la API
const getApiBaseUrl = () => {
  const config = useRuntimeConfig()
  return config.public.apiBaseUrl
}

// Iniciar sesión
const login = async (email, password) => {
  try {
    const apiBaseUrl = getApiBaseUrl()

    // Crear un objeto FormData para enviar los datos en el formato que espera OAuth2PasswordRequestForm
    const formData = new URLSearchParams()
    formData.append('username', email)
    formData.append('password', password)

    // Realizar la petición a la API
    const response = await fetch(`${apiBaseUrl}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: formData
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.detail || `Error al iniciar sesión: ${response.status}`)
    }

    const data = await response.json()

    // Guardar el token en localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth_token', data.access_token)

      // Guardar el refresh_token si existe
      if (data.refresh_token) {
        localStorage.setItem('refresh_token', data.refresh_token)
      }

      // Guardar los datos del usuario si existen
      if (data.user) {
        localStorage.setItem('user_data', JSON.stringify(data.user))
      } else {
        // Construir un objeto de usuario a partir de los datos disponibles
        const userInfo = {
          id: data.user_id,
          role: data.role
        }

        // Añadir información específica del rol si está disponible
        if (data.role === 'secretary' && data.secretary_id) {
          userInfo.secretary_id = data.secretary_id
          userInfo.firstname = data.secretary_firstname
          userInfo.lastname = data.secretary_lastname
        } else if (data.role === 'driver' && data.driver_id) {
          userInfo.driver_id = data.driver_id
          userInfo.firstname = data.driver_firstname
          userInfo.lastname = data.driver_lastname
        } else if (data.role === 'assistant' && data.assistant_id) {
          userInfo.assistant_id = data.assistant_id
          userInfo.firstname = data.assistant_firstname
          userInfo.lastname = data.assistant_lastname
        } else if (data.role === 'admin' && data.admin_id) {
          userInfo.admin_id = data.admin_id
          userInfo.firstname = data.admin_firstname
          userInfo.lastname = data.admin_lastname
        }

        localStorage.setItem('user_data', JSON.stringify(userInfo))
      }
    }

    return data
  } catch (error) {
    console.error('Error al iniciar sesión:', error)
    throw error
  }
}

// Cerrar sesión
const logout = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('auth_token')
    localStorage.removeItem('refresh_token')
    localStorage.removeItem('user_data')
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

    // Verificar que userData no sea null, undefined o la cadena "undefined"
    if (userData && userData !== 'undefined') {
      try {
        return JSON.parse(userData)
      } catch (error) {
        console.error('Error al analizar los datos del usuario:', error)
        // Si hay un error al analizar, eliminar los datos corruptos
        localStorage.removeItem('user_data')
      }
    }
  }
  return null
}

// Refrescar el token
const refreshToken = async () => {
  try {
    const apiBaseUrl = getApiBaseUrl()
    const refreshToken = localStorage.getItem('refresh_token')

    if (!refreshToken) {
      throw new Error('No hay token de refresco')
    }

    // Realizar la petición a la API
    const response = await fetch(`${apiBaseUrl}/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        refresh_token: refreshToken
      })
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.detail || `Error al refrescar el token: ${response.status}`)
    }

    const data = await response.json()

    // Guardar el nuevo token en localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth_token', data.access_token)
      localStorage.setItem('refresh_token', data.refresh_token)
    }

    return data
  } catch (error) {
    console.error('Error al refrescar el token:', error)
    // Si hay un error al refrescar el token, cerrar sesión
    logout()
    throw error
  }
}

export default {
  login,
  logout,
  isAuthenticated,
  getToken,
  getUserData,
  refreshToken
}
