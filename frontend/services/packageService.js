// Servicio para gestionar los datos de paquetes con soporte para múltiples items
import { useRuntimeConfig } from 'nuxt/app'
import apiFetch from '~/utils/api'

// Obtener el token de autenticación del localStorage
const getAuthToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('auth_token')
  }
  return null
}

// Obtener la URL base de la API
const getApiBaseUrl = () => {
  const config = useRuntimeConfig()
  return config.public.apiBaseUrl
}

const BASE_PATH = '/packages'

// Valid package statuses
export const PACKAGE_STATUSES = {
  REGISTERED_AT_OFFICE: 'registered_at_office',
  ASSIGNED_TO_TRIP: 'assigned_to_trip',
  IN_TRANSIT: 'in_transit',
  ARRIVED_AT_DESTINATION: 'arrived_at_destination',
  DELIVERED: 'delivered'
}

export const PACKAGE_STATUS_LABELS = {
  registered_at_office: 'En oficina',
  assigned_to_trip: 'Asignada a viaje',
  in_transit: 'En tránsito',
  arrived_at_destination: 'En destino',
  delivered: 'Entregada'
}

export const PACKAGE_STATUS_COLORS = {
  registered_at_office: { bg: 'bg-yellow-100', text: 'text-yellow-800', border: 'border-yellow-300', dot: 'bg-yellow-500' },
  assigned_to_trip: { bg: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-300', dot: 'bg-blue-500' },
  in_transit: { bg: 'bg-orange-100', text: 'text-orange-800', border: 'border-orange-300', dot: 'bg-orange-500' },
  arrived_at_destination: { bg: 'bg-emerald-100', text: 'text-emerald-800', border: 'border-emerald-300', dot: 'bg-emerald-500' },
  delivered: { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-300', dot: 'bg-green-500' }
}

/**
 * Fetches all packages with summary information, optionally with query parameters.
 */
export const getAllPackages = async (params = {}) => {
  const query = new URLSearchParams(params).toString()
  return apiFetch(`${BASE_PATH}${query ? '?' + query : ''}`)
}

/**
 * Fetches unassigned packages (registered_at_office, no trip).
 */
export const getUnassignedPackages = async (params = {}) => {
  const query = new URLSearchParams(params).toString()
  return apiFetch(`${BASE_PATH}/unassigned${query ? '?' + query : ''}`)
}

/**
 * Fetches a single package by its ID with all items included.
 */
export const getPackageById = async (id) => {
  return apiFetch(`${BASE_PATH}/${id}`)
}

/**
 * Fetches a package by its tracking number.
 */
export const getPackageByTrackingNumber = async (trackingNumber) => {
  return apiFetch(`${BASE_PATH}/tracking/${trackingNumber}`)
}

/**
 * Creates a new package with multiple items (no trip required).
 */
export const createPackage = async (packageData) => {
  return apiFetch(BASE_PATH, {
    method: 'POST',
    body: packageData,
  })
}

/**
 * Updates an existing package (general information, not items).
 */
export const updatePackage = async (id, packageData) => {
  return apiFetch(`${BASE_PATH}/${id}`, {
    method: 'PUT',
    body: packageData,
  })
}

/**
 * Deletes a package by its ID (including all items).
 */
export const deletePackage = async (id) => {
  return apiFetch(`${BASE_PATH}/${id}`, {
    method: 'DELETE',
  })
}

// === TRIP ASSIGNMENT ===

/**
 * Assigns a package to a trip. Changes status to 'assigned_to_trip'.
 */
export const assignPackageToTrip = async (packageId, tripId) => {
  return apiFetch(`${BASE_PATH}/${packageId}/assign-trip`, {
    method: 'PUT',
    body: { trip_id: tripId },
  })
}

/**
 * Unassigns a package from a trip. Returns to 'registered_at_office'.
 */
export const unassignPackageFromTrip = async (packageId) => {
  return apiFetch(`${BASE_PATH}/${packageId}/unassign-trip`, {
    method: 'PUT',
  })
}

/**
 * Updates the status of a package with history tracking.
 */
export const updatePackageStatus = async (packageId, newStatus, changedByUserId = null) => {
  return apiFetch(`${BASE_PATH}/${packageId}/update-status`, {
    method: 'PUT',
    body: {
      new_status: newStatus,
      changed_by_user_id: changedByUserId
    },
  })
}

// === PACKAGE ITEMS MANAGEMENT ===

export const getPackageItems = async (packageId) => {
  return apiFetch(`${BASE_PATH}/${packageId}/items`)
}

export const addPackageItem = async (packageId, itemData) => {
  return apiFetch(`${BASE_PATH}/${packageId}/items`, {
    method: 'POST',
    body: itemData,
  })
}

export const updatePackageItem = async (itemId, itemData) => {
  return apiFetch(`${BASE_PATH}/items/${itemId}`, {
    method: 'PUT',
    body: itemData,
  })
}

export const deletePackageItem = async (itemId) => {
  return apiFetch(`${BASE_PATH}/items/${itemId}`, {
    method: 'DELETE',
  })
}

// === PACKAGE FILTERING AND SEARCH ===

export const getPackagesBySender = async (clientId) => {
  return apiFetch(`${BASE_PATH}/by-sender/${clientId}`)
}

export const getPackagesByRecipient = async (clientId) => {
  return apiFetch(`${BASE_PATH}/by-recipient/${clientId}`)
}

export const getPackagesByTrip = async (tripId) => {
  return apiFetch(`${BASE_PATH}/by-trip/${tripId}`)
}

export const searchPackages = async (term) => {
  try {
    const pkg = await getPackageByTrackingNumber(term)
    return [pkg]
  } catch (error) {
    console.warn('Package not found by tracking number:', term)
    return []
  }
}

// === UTILITY FUNCTIONS ===

export const calculatePackageTotal = (items) => {
  return items.reduce((total, item) => {
    return total + (item.quantity * item.unit_price)
  }, 0)
}

export const calculateItemsCount = (items) => {
  return items.reduce((total, item) => total + item.quantity, 0)
}

export const validatePackageData = (packageData) => {
  const errors = []

  if (!packageData.tracking_number || packageData.tracking_number.length < 3) {
    errors.push('Número de tracking debe tener al menos 3 caracteres')
  }

  if (!packageData.items || packageData.items.length === 0) {
    errors.push('El paquete debe tener al menos un item')
  }

  if (packageData.items) {
    packageData.items.forEach((item, index) => {
      if (!item.description || item.description.trim() === '') {
        errors.push(`Item ${index + 1}: La descripción es requerida`)
      }
      if (!item.quantity || item.quantity <= 0) {
        errors.push(`Item ${index + 1}: La cantidad debe ser mayor a 0`)
      }
      if (!item.unit_price || item.unit_price <= 0) {
        errors.push(`Item ${index + 1}: El precio unitario debe ser mayor a 0`)
      }
    })
  }

  if (!packageData.sender_id) {
    errors.push('El remitente es requerido')
  }

  if (!packageData.recipient_id) {
    errors.push('El destinatario es requerido')
  }

  // trip_id ya NO es requerido

  return {
    isValid: errors.length === 0,
    errors
  }
}

export default {
  // Core CRUD
  getAllPackages,
  getUnassignedPackages,
  getPackageById,
  createPackage,
  updatePackage,
  deletePackage,
  searchPackages,

  // Trip assignment
  assignPackageToTrip,
  unassignPackageFromTrip,
  updatePackageStatus,

  // Items
  getPackageItems,
  addPackageItem,
  updatePackageItem,
  deletePackageItem,

  // Filtering
  getPackagesBySender,
  getPackagesByRecipient,
  getPackagesByTrip,
  getPackageByTrackingNumber,

  // Utilities
  calculatePackageTotal,
  calculateItemsCount,
  validatePackageData,

  // Constants
  PACKAGE_STATUSES,
  PACKAGE_STATUS_LABELS,
  PACKAGE_STATUS_COLORS
}
