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

/**
 * Fetches all packages with summary information, optionally with query parameters.
 * @param {object} params - Query parameters (e.g., skip, limit, status).
 * @returns {Promise<Array>} A promise that resolves to an array of package summaries.
 */
export const getAllPackages = async (params = {}) => {
  const query = new URLSearchParams(params).toString()
  return apiFetch(`${BASE_PATH}${query ? '?' + query : ''}`)
}

/**
 * Fetches a single package by its ID with all items included.
 * @param {string|number} id - The ID of the package.
 * @returns {Promise<object>} A promise that resolves to the package object with items.
 */
export const getPackageById = async (id) => {
  return apiFetch(`${BASE_PATH}/${id}`)
}

/**
 * Fetches a package by its tracking number.
 * @param {string} trackingNumber - The tracking number of the package.
 * @returns {Promise<object>} A promise that resolves to the package object.
 */
export const getPackageByTrackingNumber = async (trackingNumber) => {
  return apiFetch(`${BASE_PATH}/tracking/${trackingNumber}`)
}

/**
 * Creates a new package with multiple items.
 * @param {object} packageData - The data for the new package including items array.
 * @returns {Promise<object>} A promise that resolves to the created package object.
 */
export const createPackage = async (packageData) => {
  return apiFetch(BASE_PATH, {
    method: 'POST',
    body: packageData,
  })
}

/**
 * Updates an existing package (general information, not items).
 * @param {string|number} id - The ID of the package to update.
 * @param {object} packageData - The updated data for the package.
 * @returns {Promise<object>} A promise that resolves to the updated package object.
 */
export const updatePackage = async (id, packageData) => {
  return apiFetch(`${BASE_PATH}/${id}`, {
    method: 'PUT',
    body: packageData,
  })
}

/**
 * Deletes a package by its ID (including all items).
 * @param {string|number} id - The ID of the package to delete.
 * @returns {Promise<void>} A promise that resolves when the package is deleted.
 */
export const deletePackage = async (id) => {
  return apiFetch(`${BASE_PATH}/${id}`, {
    method: 'DELETE',
  })
}

// === PACKAGE ITEMS MANAGEMENT ===

/**
 * Gets all items of a specific package.
 * @param {string|number} packageId - The ID of the package.
 * @returns {Promise<Array>} A promise that resolves to an array of package items.
 */
export const getPackageItems = async (packageId) => {
  return apiFetch(`${BASE_PATH}/${packageId}/items`)
}

/**
 * Adds a new item to an existing package.
 * @param {string|number} packageId - The ID of the package.
 * @param {object} itemData - The item data (quantity, description, unit_price).
 * @returns {Promise<object>} A promise that resolves to the created item.
 */
export const addPackageItem = async (packageId, itemData) => {
  return apiFetch(`${BASE_PATH}/${packageId}/items`, {
    method: 'POST',
    body: itemData,
  })
}

/**
 * Updates a specific package item.
 * @param {string|number} itemId - The ID of the item to update.
 * @param {object} itemData - The updated item data.
 * @returns {Promise<object>} A promise that resolves to the updated item.
 */
export const updatePackageItem = async (itemId, itemData) => {
  return apiFetch(`${BASE_PATH}/items/${itemId}`, {
    method: 'PUT',
    body: itemData,
  })
}

/**
 * Deletes a specific package item.
 * @param {string|number} itemId - The ID of the item to delete.
 * @returns {Promise<void>} A promise that resolves when the item is deleted.
 */
export const deletePackageItem = async (itemId) => {
  return apiFetch(`${BASE_PATH}/items/${itemId}`, {
    method: 'DELETE',
  })
}

// === PACKAGE FILTERING AND SEARCH ===

/**
 * Gets packages by sender (client ID).
 * @param {string|number} clientId - The ID of the sender client.
 * @returns {Promise<Array>} A promise that resolves to an array of package summaries.
 */
export const getPackagesBySender = async (clientId) => {
  return apiFetch(`${BASE_PATH}/by-sender/${clientId}`)
}

/**
 * Gets packages by recipient (client ID).
 * @param {string|number} clientId - The ID of the recipient client.
 * @returns {Promise<Array>} A promise that resolves to an array of package summaries.
 */
export const getPackagesByRecipient = async (clientId) => {
  return apiFetch(`${BASE_PATH}/by-recipient/${clientId}`)
}

/**
 * Gets packages by trip ID.
 * @param {string|number} tripId - The ID of the trip.
 * @returns {Promise<Array>} A promise that resolves to an array of package summaries.
 */
export const getPackagesByTrip = async (tripId) => {
  return apiFetch(`${BASE_PATH}/by-trip/${tripId}`)
}

/**
 * Searches for packages based on a query term (deprecated, use getPackageByTrackingNumber instead).
 * @param {string} term - The search term.
 * @returns {Promise<Array>} A promise that resolves to an array of matching packages.
 */
export const searchPackages = async (term) => {
  // Try to search by tracking number first
  try {
    const pkg = await getPackageByTrackingNumber(term)
    return [pkg]
  } catch (error) {
    // If not found by tracking number, return empty array or implement other search logic
    console.warn('Package not found by tracking number:', term)
    return []
  }
}

// === ENHANCED METHODS WITH IMPROVED ERROR HANDLING ===

// Obtener todos los paquetes con filtros y paginación mejorados
const getPackages = async (filters = {}, pagination = { page: 1, itemsPerPage: 10 }) => {
  try {
    const apiBaseUrl = getApiBaseUrl()
    const token = getAuthToken()

    if (!token) {
      throw new Error('No hay token de autenticación')
    }

    // Construir los parámetros de consulta para la nueva API
    const queryParams = new URLSearchParams()

    // Añadir filtros
    if (filters.status) queryParams.append('status', filters.status)
    if (filters.sender_id) queryParams.append('sender_id', filters.sender_id)
    if (filters.recipient_id) queryParams.append('recipient_id', filters.recipient_id)
    if (filters.trip_id) queryParams.append('trip_id', filters.trip_id)

    // Añadir paginación
    queryParams.append('skip', ((pagination.page - 1) * pagination.itemsPerPage).toString())
    queryParams.append('limit', pagination.itemsPerPage.toString())

    console.log(`Realizando petición a: ${apiBaseUrl}/packages?${queryParams.toString()}`)

    // Realizar la petición a la API
    const response = await fetch(`${apiBaseUrl}/packages?${queryParams.toString()}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`Error en la respuesta de la API: ${response.status}`, errorText)
      throw new Error(`Error al obtener paquetes: ${response.status}`)
    }

    const data = await response.json()
    console.log('Respuesta de la API (paquetes):', data)

    // La nueva API devuelve un array de PackageSummary directamente
    const packages = Array.isArray(data) ? data : []
    
    // Estimar el total si no viene en la respuesta
    const totalItems = packages.length >= pagination.itemsPerPage ? 
      packages.length + 1 : packages.length

    return {
      packages,
      pagination: {
        totalItems,
        totalPages: Math.ceil(totalItems / pagination.itemsPerPage) || 1,
        currentPage: pagination.page || 1,
        itemsPerPage: pagination.itemsPerPage || 10
      }
    }
  } catch (error) {
    console.error('Error al obtener paquetes:', error)
    
    // Simulación de datos para desarrollo con nueva estructura
    console.warn('Usando datos simulados para paquetes')
    
    // Generar datos de ejemplo con estructura actualizada
    const packages = Array.from({ length: 10 }, (_, i) => ({
      id: i + 1,
      tracking_number: `PKG${(i + 1).toString().padStart(6, '0')}`,
      status: ['registered', 'in_transit', 'delivered'][Math.floor(Math.random() * 3)],
      total_amount: Math.random() * 200 + 50, // Entre 50 y 250 Bs
      total_items_count: Math.floor(Math.random() * 5) + 1, // Entre 1 y 5 items
      sender_name: `Remitente ${i + 1}`,
      recipient_name: `Destinatario ${i + 1}`,
      created_at: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString()
    }))
    
    return {
      packages,
      pagination: {
        totalItems: 25,
        totalPages: 3,
        currentPage: pagination.page || 1,
        itemsPerPage: pagination.itemsPerPage || 10
      }
    }
  }
}

// Obtener paquetes recientes con nueva estructura
const getRecentPackages = async (limit = 5) => {
  try {
    const apiBaseUrl = getApiBaseUrl()
    const token = getAuthToken()

    if (!token) {
      throw new Error('No hay token de autenticación')
    }

    // Construir los parámetros de consulta
    const queryParams = new URLSearchParams()
    queryParams.append('limit', limit.toString())
    // Nota: El backend podría necesitar implementar ordenamiento por fecha

    console.log(`Realizando petición a: ${apiBaseUrl}/packages?${queryParams.toString()}`)

    const response = await fetch(`${apiBaseUrl}/packages?${queryParams.toString()}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`Error en la respuesta de la API: ${response.status}`, errorText)
      throw new Error(`Error al obtener paquetes recientes: ${response.status}`)
    }

    const data = await response.json()
    console.log('Respuesta de la API (paquetes recientes):', data)

    // Tomar solo los primeros elementos hasta el límite
    const packages = Array.isArray(data) ? data.slice(0, limit) : []

    return packages
  } catch (error) {
    console.error('Error al obtener paquetes recientes:', error)
    
    // Simulación de datos para desarrollo
    console.warn('Usando datos simulados para paquetes recientes')
    
    return Array.from({ length: limit }, (_, i) => ({
      id: i + 1,
      tracking_number: `PKG${(i + 1).toString().padStart(6, '0')}`,
      status: ['registered', 'in_transit', 'delivered'][Math.floor(Math.random() * 3)],
      total_amount: Math.random() * 200 + 50,
      total_items_count: Math.floor(Math.random() * 5) + 1,
      sender_name: `Remitente ${i + 1}`,
      recipient_name: `Destinatario ${i + 1}`,
      created_at: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000).toISOString()
    }))
  }
}

// === UTILITY FUNCTIONS ===

/**
 * Calculates the total amount for a package based on its items.
 * @param {Array} items - Array of package items.
 * @returns {number} Total amount.
 */
export const calculatePackageTotal = (items) => {
  return items.reduce((total, item) => {
    return total + (item.quantity * item.unit_price)
  }, 0)
}

/**
 * Calculates the total items count for a package.
 * @param {Array} items - Array of package items.
 * @returns {number} Total items count.
 */
export const calculateItemsCount = (items) => {
  return items.reduce((total, item) => total + item.quantity, 0)
}

/**
 * Validates package data before submission.
 * @param {object} packageData - Package data to validate.
 * @returns {object} Validation result with isValid and errors.
 */
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

  if (!packageData.trip_id) {
    errors.push('El viaje es requerido')
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}

export default {
  // Métodos existentes actualizados
  getAllPackages,
  getPackageById,
  createPackage,
  updatePackage,
  deletePackage,
  searchPackages,
  getPackages,
  getRecentPackages,
  
  // Nuevos métodos para items
  getPackageItems,
  addPackageItem,
  updatePackageItem,
  deletePackageItem,
  
  // Métodos de filtrado
  getPackagesBySender,
  getPackagesByRecipient,
  getPackagesByTrip,
  getPackageByTrackingNumber,
  
  // Utilidades
  calculatePackageTotal,
  calculateItemsCount,
  validatePackageData
}
