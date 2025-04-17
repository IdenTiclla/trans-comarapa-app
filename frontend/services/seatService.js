// Servicio para gestionar los asientos
import { useRuntimeConfig } from 'nuxt/app'

const getAuthToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('auth_token')
  }
  return null
}

const getApiBaseUrl = () => {
  const config = useRuntimeConfig()
  return config.public.apiBaseUrl
}

const handleApiError = async (response, defaultMessage) => {
  let message = defaultMessage
  try {
    const data = await response.json()
    if (data && data.detail) message = data.detail
  } catch {}
  throw new Error(message)
}

// Obtener asientos por bus
const getSeatsByBus = async (busId) => {
  const apiBaseUrl = getApiBaseUrl()
  const token = getAuthToken()
  const response = await fetch(`${apiBaseUrl}/api/v1/seats/bus/${busId}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  })
  if (!response.ok) return handleApiError(response, 'Error al obtener asientos del bus')
  return response.json()
}

// Obtener asientos por viaje
const getSeatsByTrip = async (tripId) => {
  const apiBaseUrl = getApiBaseUrl()
  const token = getAuthToken()
  const response = await fetch(`${apiBaseUrl}/api/v1/seats/trip/${tripId}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  })
  if (!response.ok) return handleApiError(response, 'Error al obtener asientos del viaje')
  return response.json()
}

// Crear asiento
const createSeat = async (seatData) => {
  const apiBaseUrl = getApiBaseUrl()
  const token = getAuthToken()
  const response = await fetch(`${apiBaseUrl}/api/v1/seats`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(seatData)
  })
  if (!response.ok) return handleApiError(response, 'Error al crear asiento')
  return response.json()
}

// Actualizar asiento
const updateSeat = async (seatId, seatData) => {
  const apiBaseUrl = getApiBaseUrl()
  const token = getAuthToken()
  const response = await fetch(`${apiBaseUrl}/api/v1/seats/${seatId}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(seatData)
  })
  if (!response.ok) return handleApiError(response, 'Error al actualizar asiento')
  return response.json()
}

// Eliminar asiento
const deleteSeat = async (seatId) => {
  const apiBaseUrl = getApiBaseUrl()
  const token = getAuthToken()
  const response = await fetch(`${apiBaseUrl}/api/v1/seats/${seatId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  })
  if (!response.ok) return handleApiError(response, 'Error al eliminar asiento')
  return true
}

export default {
  getSeatsByBus,
  getSeatsByTrip,
  createSeat,
  updateSeat,
  deleteSeat
} 