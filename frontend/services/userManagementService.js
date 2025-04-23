// Servicio para gestionar usuarios desde el panel de administración
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

// Obtener todos los usuarios con filtros y paginación
const getUsers = async (params = {}) => {
  try {
    const apiBaseUrl = getApiBaseUrl()
    const headers = getAuthHeader()

    // Construir query string para los parámetros
    const queryParams = new URLSearchParams()

    if (params.skip !== undefined) queryParams.append('skip', params.skip)
    if (params.limit !== undefined) queryParams.append('limit', params.limit)
    if (params.search) queryParams.append('search', params.search)
    if (params.role) queryParams.append('role', params.role)
    if (params.is_active !== undefined) queryParams.append('is_active', params.is_active)

    const queryString = queryParams.toString() ? `?${queryParams.toString()}` : ''

    const response = await fetch(`${apiBaseUrl}/users${queryString}`, {
      method: 'GET',
      headers: {
        ...headers,
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.detail || `Error al obtener usuarios: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error('Error al obtener usuarios:', error)
    throw error
  }
}

// Obtener un usuario por ID
const getUserById = async (userId) => {
  try {
    const apiBaseUrl = getApiBaseUrl()
    const headers = getAuthHeader()

    const response = await fetch(`${apiBaseUrl}/users/${userId}`, {
      method: 'GET',
      headers: {
        ...headers,
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.detail || `Error al obtener usuario: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error(`Error al obtener usuario con ID ${userId}:`, error)
    throw error
  }
}

// Crear un nuevo usuario
const createUser = async (userData) => {
  try {
    const apiBaseUrl = getApiBaseUrl()
    const headers = getAuthHeader()

    const response = await fetch(`${apiBaseUrl}/users`, {
      method: 'POST',
      headers: {
        ...headers,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(userData)
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.detail || `Error al crear usuario: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error('Error al crear usuario:', error)
    throw error
  }
}

// Actualizar un usuario existente
const updateUser = async (userId, userData) => {
  try {
    const apiBaseUrl = getApiBaseUrl()
    const headers = getAuthHeader()

    const response = await fetch(`${apiBaseUrl}/users/${userId}`, {
      method: 'PUT',
      headers: {
        ...headers,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(userData)
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.detail || `Error al actualizar usuario: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error(`Error al actualizar usuario con ID ${userId}:`, error)
    throw error
  }
}

// Eliminar un usuario
const deleteUser = async (userId) => {
  try {
    const apiBaseUrl = getApiBaseUrl()
    const headers = getAuthHeader()

    const response = await fetch(`${apiBaseUrl}/users/${userId}`, {
      method: 'DELETE',
      headers: {
        ...headers,
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.detail || `Error al eliminar usuario: ${response.status}`)
    }

    return true
  } catch (error) {
    console.error(`Error al eliminar usuario con ID ${userId}:`, error)
    throw error
  }
}

// Activar un usuario
const activateUser = async (userId) => {
  try {
    const apiBaseUrl = getApiBaseUrl()
    const headers = getAuthHeader()

    const response = await fetch(`${apiBaseUrl}/users/${userId}/activate`, {
      method: 'PATCH',
      headers: {
        ...headers,
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.detail || `Error al activar usuario: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error(`Error al activar usuario con ID ${userId}:`, error)
    throw error
  }
}

// Desactivar un usuario
const deactivateUser = async (userId) => {
  try {
    const apiBaseUrl = getApiBaseUrl()
    const headers = getAuthHeader()

    const response = await fetch(`${apiBaseUrl}/users/${userId}/deactivate`, {
      method: 'PATCH',
      headers: {
        ...headers,
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.detail || `Error al desactivar usuario: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error(`Error al desactivar usuario con ID ${userId}:`, error)
    throw error
  }
}

// Obtener todos los roles disponibles
const getRoles = async () => {
  try {
    const apiBaseUrl = getApiBaseUrl()
    const headers = getAuthHeader()

    const response = await fetch(`${apiBaseUrl}/roles`, {
      method: 'GET',
      headers: {
        ...headers,
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.detail || `Error al obtener roles: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error('Error al obtener roles:', error)
    throw error
  }
}

export default {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  activateUser,
  deactivateUser,
  getRoles
}
