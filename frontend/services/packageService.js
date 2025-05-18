// Servicio para gestionar los datos de paquetes
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
 * Fetches all packages, optionally with query parameters.
 * @param {object} params - Query parameters (e.g., for pagination, filtering).
 * @returns {Promise<Array>} A promise that resolves to an array of packages.
 */
export const getAllPackages = async (params = {}) => {
  const query = new URLSearchParams(params).toString()
  return apiFetch(`${BASE_PATH}${query ? '?' + query : ''}`)
}

/**
 * Fetches a single package by its ID.
 * @param {string|number} id - The ID of the package.
 * @returns {Promise<object>} A promise that resolves to the package object.
 */
export const getPackageById = async (id) => {
  return apiFetch(`${BASE_PATH}/${id}`)
}

/**
 * Creates a new package.
 * @param {object} packageData - The data for the new package.
 * @returns {Promise<object>} A promise that resolves to the created package object.
 */
export const createPackage = async (packageData) => {
  return apiFetch(BASE_PATH, {
    method: 'POST',
    body: packageData,
  })
}

/**
 * Updates an existing package.
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
 * Deletes a package by its ID.
 * @param {string|number} id - The ID of the package to delete.
 * @returns {Promise<void>} A promise that resolves when the package is deleted.
 */
export const deletePackage = async (id) => {
  return apiFetch(`${BASE_PATH}/${id}`, {
    method: 'DELETE',
  })
}

/**
 * Searches for packages based on a query term.
 * @param {string} term - The search term.
 * @returns {Promise<Array>} A promise that resolves to an array of matching packages.
 */
export const searchPackages = async (term) => {
  const queryParams = new URLSearchParams({ search: term })
  return apiFetch(`${BASE_PATH}/search?${queryParams.toString()}`)
}

// Obtener todos los paquetes
const getPackages = async (filters = {}, pagination = { page: 1, itemsPerPage: 10 }) => {
  try {
    const apiBaseUrl = getApiBaseUrl()
    const token = getAuthToken()

    if (!token) {
      throw new Error('No hay token de autenticación')
    }

    // Construir los parámetros de consulta
    const queryParams = new URLSearchParams()

    // Añadir filtros
    if (filters.sender_id) queryParams.append('sender_id', filters.sender_id)
    if (filters.recipient_id) queryParams.append('recipient_id', filters.recipient_id)
    if (filters.trip_id) queryParams.append('trip_id', filters.trip_id)
    if (filters.status) queryParams.append('status', filters.status)
    if (filters.date_from) queryParams.append('date_from', filters.date_from)
    if (filters.date_to) queryParams.append('date_to', filters.date_to)

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

    // Transformar los datos si es necesario
    const packages = Array.isArray(data) ? data : data.items || []
    const totalItems = data.total || packages.length

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
    
    // Simulación de datos para desarrollo
    console.warn('Usando datos simulados para paquetes')
    
    // Generar datos de ejemplo
    const packages = Array.from({ length: 10 }, (_, i) => ({
      id: i + 1,
      description: `Paquete ${i + 1}`,
      weight: Math.random() * 10 + 0.5, // Entre 0.5 y 10.5 kg
      sender_id: Math.floor(Math.random() * 10) + 1,
      recipient_id: Math.floor(Math.random() * 10) + 1,
      trip_id: Math.floor(Math.random() * 5) + 1,
      status: ['pending', 'in_transit', 'delivered'][Math.floor(Math.random() * 3)],
      created_at: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString() // Hasta 7 días atrás
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

// Obtener paquetes recientes
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
    queryParams.append('sort', 'created_at:desc')

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
      throw new Error(`Error al obtener paquetes recientes: ${response.status}`)
    }

    const data = await response.json()
    console.log('Respuesta de la API (paquetes recientes):', data)

    // Transformar los datos si es necesario
    const packages = Array.isArray(data) ? data : data.items || []

    return packages
  } catch (error) {
    console.error('Error al obtener paquetes recientes:', error)
    
    // Simulación de datos para desarrollo
    console.warn('Usando datos simulados para paquetes recientes')
    
    // Generar datos de ejemplo
    return Array.from({ length: limit }, (_, i) => ({
      id: i + 1,
      description: `Paquete ${i + 1}`,
      weight: Math.random() * 10 + 0.5, // Entre 0.5 y 10.5 kg
      sender_id: Math.floor(Math.random() * 10) + 1,
      recipient_id: Math.floor(Math.random() * 10) + 1,
      trip_id: Math.floor(Math.random() * 5) + 1,
      status: ['pending', 'in_transit', 'delivered'][Math.floor(Math.random() * 3)],
      created_at: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000).toISOString() // Hasta 1 día atrás
    }))
  }
}

export default {
  getAllPackages,
  getPackageById,
  createPackage,
  updatePackage,
  deletePackage,
  searchPackages,
  getPackages,
  getRecentPackages
}
