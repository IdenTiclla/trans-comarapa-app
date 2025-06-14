// Servicio para gestionar usuarios desde el panel de administración
import apiFetch from '~/utils/api'

// Obtener todos los usuarios con filtros y paginación
const getUsers = async (params = {}) => {
  try {
    // Construir query string para los parámetros
    const queryParams = new URLSearchParams()

    if (params.skip !== undefined) queryParams.append('skip', params.skip)
    if (params.limit !== undefined) queryParams.append('limit', params.limit)
    if (params.search) queryParams.append('search', params.search)
    if (params.role) queryParams.append('role', params.role)
    if (params.is_active !== undefined) queryParams.append('is_active', params.is_active)

    const queryString = queryParams.toString() ? `?${queryParams.toString()}` : ''

    return await apiFetch(`/users${queryString}`)
  } catch (error) {
    console.error('Error al obtener usuarios:', error)
    throw error
  }
}

// Obtener un usuario por ID
const getUserById = async (userId) => {
  try {
    return await apiFetch(`/users/${userId}`)
  } catch (error) {
    console.error(`Error al obtener usuario con ID ${userId}:`, error)
    throw error
  }
}

// Crear un nuevo usuario
const createUser = async (userData) => {
  try {
    return await apiFetch('/users', {
      method: 'POST',
      body: userData
    })
  } catch (error) {
    console.error('Error al crear usuario:', error)
    throw error
  }
}

// Actualizar un usuario existente
const updateUser = async (userId, userData) => {
  try {
    return await apiFetch(`/users/${userId}`, {
      method: 'PUT',
      body: userData
    })
  } catch (error) {
    console.error(`Error al actualizar usuario con ID ${userId}:`, error)
    throw error
  }
}

// Eliminar un usuario
const deleteUser = async (userId) => {
  try {
    await apiFetch(`/users/${userId}`, {
      method: 'DELETE'
    })
    return true
  } catch (error) {
    console.error(`Error al eliminar usuario con ID ${userId}:`, error)
    throw error
  }
}

// Activar un usuario
const activateUser = async (userId) => {
  try {
    return await apiFetch(`/users/${userId}/activate`, {
      method: 'PATCH'
    })
  } catch (error) {
    console.error(`Error al activar usuario con ID ${userId}:`, error)
    throw error
  }
}

// Desactivar un usuario
const deactivateUser = async (userId) => {
  try {
    return await apiFetch(`/users/${userId}/deactivate`, {
      method: 'PATCH'
    })
  } catch (error) {
    console.error(`Error al desactivar usuario con ID ${userId}:`, error)
    throw error
  }
}

// Obtener todos los roles disponibles
const getRoles = async () => {
  try {
    return await apiFetch('/roles')
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
