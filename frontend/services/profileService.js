// Servicio para gestionar el perfil del usuario autenticado
import { useRuntimeConfig } from 'nuxt/app'
import authService from './authService'

// Obtener la URL base de la API
const getApiBaseUrl = () => {
  const config = useRuntimeConfig()
  return config.public.apiBaseUrl
}

// Obtener el token de autenticación
const getAuthHeader = () => {
  const token = authService.getToken()
  return {
    'Authorization': `Bearer ${token}`
  }
}

// Obtener el perfil del usuario actual
const getProfile = async () => {
  try {
    const apiBaseUrl = getApiBaseUrl()
    const headers = getAuthHeader()

    const response = await fetch(`${apiBaseUrl}/users/me`, {
      method: 'GET',
      headers: {
        ...headers,
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.detail || `Error al obtener el perfil: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error('Error al obtener el perfil:', error)
    throw error
  }
}

// Actualizar el perfil del usuario
const updateProfile = async (profileData) => {
  try {
    const apiBaseUrl = getApiBaseUrl()
    const headers = getAuthHeader()

    const response = await fetch(`${apiBaseUrl}/users/me`, {
      method: 'PUT',
      headers: {
        ...headers,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(profileData)
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.detail || `Error al actualizar el perfil: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error('Error al actualizar el perfil:', error)
    throw error
  }
}

// Cambiar la contraseña del usuario
const changePassword = async (passwordData) => {
  try {
    const apiBaseUrl = getApiBaseUrl()
    const headers = getAuthHeader()

    const response = await fetch(`${apiBaseUrl}/users/me/change-password`, {
      method: 'POST',
      headers: {
        ...headers,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(passwordData)
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.detail || `Error al cambiar la contraseña: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error('Error al cambiar la contraseña:', error)
    throw error
  }
}

// Subir avatar del usuario
const uploadAvatar = async (formData) => {
  try {
    const apiBaseUrl = getApiBaseUrl()
    const headers = getAuthHeader()

    const response = await fetch(`${apiBaseUrl}/users/me/avatar`, {
      method: 'POST',
      headers: {
        ...headers
        // No incluir Content-Type para FormData, el navegador lo establece automáticamente
      },
      body: formData
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.detail || `Error al subir avatar: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error('Error al subir avatar:', error)
    throw error
  }
}

// Eliminar avatar del usuario
const deleteAvatar = async () => {
  try {
    const apiBaseUrl = getApiBaseUrl()
    const headers = getAuthHeader()

    const response = await fetch(`${apiBaseUrl}/users/me/avatar`, {
      method: 'DELETE',
      headers: {
        ...headers,
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.detail || `Error al eliminar avatar: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error('Error al eliminar avatar:', error)
    throw error
  }
}

export default {
  getProfile,
  updateProfile,
  changePassword,
  uploadAvatar,
  deleteAvatar
} 