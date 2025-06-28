// Servicio para gestionar el perfil del usuario autenticado
// 🔒 FASE 3: Migrado a endpoint unificado /users/me/profile
import apiFetch from '~/utils/api'

// Obtener el perfil unificado del usuario actual
const getProfile = async () => {
  try {
    const data = await apiFetch('/users/me/profile', {
      method: 'GET'
    })
    return data
  } catch (error) {
    console.error('Error al obtener el perfil:', error.data?.detail || error.message || error)
    throw error
  }
}

// Actualizar el perfil del usuario
const updateProfile = async (profileData) => {
  try {
    const data = await apiFetch('/users/me/profile', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(profileData)
    })
    return data
  } catch (error) {
    console.error('Error al actualizar el perfil:', error.data?.detail || error.message || error)
    throw error
  }
}

// Cambiar la contraseña del usuario
const changePassword = async (passwordData) => {
  try {
    const data = await apiFetch('/users/me/change-password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(passwordData)
    })
    return data
  } catch (error) {
    console.error('Error al cambiar la contraseña:', error.data?.detail || error.message || error)
    throw error
  }
}

// Subir avatar del usuario
const uploadAvatar = async (formData) => {
  try {
    const data = await apiFetch('/users/me/avatar', {
      method: 'POST',
      body: formData
    })
    return data
  } catch (error) {
    console.error('Error al subir avatar:', error.data?.detail || error.message || error)
    throw error
  }
}

// Eliminar avatar del usuario
const deleteAvatar = async () => {
  try {
    const data = await apiFetch('/users/me/avatar', {
      method: 'DELETE'
    })
    return data
  } catch (error) {
    console.error('Error al eliminar avatar:', error.data?.detail || error.message || error)
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