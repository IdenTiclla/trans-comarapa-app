import { getApiBaseUrl, getAuthToken } from '~/utils/api'

// Obtener todos los clientes
const getClients = async (filters = {}, pagination = { page: 1, itemsPerPage: 10 }) => {
  try {
    const apiBaseUrl = getApiBaseUrl()
    const token = getAuthToken()

    if (!token) {
      throw new Error('No hay token de autenticación')
    }

    // Construir los parámetros de consulta
    const queryParams = new URLSearchParams()

    // Añadir filtros
    if (filters.search) queryParams.append('search', filters.search)
    if (filters.ci) queryParams.append('ci', filters.ci)
    if (filters.phone) queryParams.append('phone', filters.phone)

    // Añadir paginación
    queryParams.append('skip', ((pagination.page - 1) * pagination.itemsPerPage).toString())
    queryParams.append('limit', pagination.itemsPerPage.toString())

    console.log(`Realizando petición a: ${apiBaseUrl}/clients?${queryParams.toString()}`)

    // Realizar la petición a la API
    const response = await fetch(`${apiBaseUrl}/clients?${queryParams.toString()}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`Error en la respuesta de la API: ${response.status}`, errorText)
      throw new Error(`Error al obtener clientes: ${response.status}`)
    }

    const data = await response.json()
    console.log('Respuesta de la API (clientes):', data)

    return {
      clients: data.items || [],
      pagination: {
        totalItems: data.total || 0,
        totalPages: Math.ceil((data.total || 0) / pagination.itemsPerPage) || 1,
        currentPage: pagination.page || 1,
        itemsPerPage: pagination.itemsPerPage || 10
      }
    }
  } catch (error) {
    console.error('Error al obtener clientes:', error)
    throw error
  }
}

// Buscar clientes por término de búsqueda
const searchClients = async (searchTerm) => {
  try {
    const apiBaseUrl = getApiBaseUrl()
    const token = getAuthToken()

    if (!token) {
      throw new Error('No hay token de autenticación')
    }

    // Construir los parámetros de consulta
    const queryParams = new URLSearchParams()
    queryParams.append('search', searchTerm)
    queryParams.append('limit', '10') // Limitar a 10 resultados para búsqueda rápida

    console.log(`Realizando petición a: ${apiBaseUrl}/clients?${queryParams.toString()}`)

    // Realizar la petición a la API
    const response = await fetch(`${apiBaseUrl}/clients?${queryParams.toString()}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`Error en la respuesta de la API: ${response.status}`, errorText)
      throw new Error(`Error al buscar clientes: ${response.status}`)
    }

    const data = await response.json()
    console.log('Respuesta de la API (búsqueda de clientes):', data)

    return data.items || []
  } catch (error) {
    console.error('Error al buscar clientes:', error)
    throw error
  }
}

// Obtener un cliente por ID
const getClientById = async (id) => {
  try {
    const apiBaseUrl = getApiBaseUrl()
    const token = getAuthToken()

    if (!token) {
      throw new Error('No hay token de autenticación')
    }

    console.log(`Realizando petición a: ${apiBaseUrl}/clients/${id}`)

    // Realizar la petición a la API
    const response = await fetch(`${apiBaseUrl}/clients/${id}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`Error en la respuesta de la API: ${response.status}`, errorText)
      throw new Error(`Error al obtener el cliente: ${response.status}`)
    }

    const client = await response.json()
    console.log('Respuesta de la API (detalle de cliente):', client)

    return client
  } catch (error) {
    console.error(`Error al obtener el cliente con ID ${id}:`, error)
    throw error
  }
}

// Crear un nuevo cliente
const createClient = async (clientData) => {
  try {
    const apiBaseUrl = getApiBaseUrl()
    const token = getAuthToken()

    if (!token) {
      throw new Error('No hay token de autenticación')
    }

    console.log(`Realizando petición a: ${apiBaseUrl}/clients`)
    console.log('Datos del cliente:', clientData)

    // Realizar la petición a la API
    const response = await fetch(`${apiBaseUrl}/clients`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(clientData)
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`Error en la respuesta de la API: ${response.status}`, errorText)
      throw new Error(`Error al crear el cliente: ${response.status}`)
    }

    const client = await response.json()
    console.log('Respuesta de la API (cliente creado):', client)

    return client
  } catch (error) {
    console.error('Error al crear el cliente:', error)
    throw error
  }
}

// Actualizar un cliente existente
const updateClient = async (id, clientData) => {
  try {
    const apiBaseUrl = getApiBaseUrl()
    const token = getAuthToken()

    if (!token) {
      throw new Error('No hay token de autenticación')
    }

    console.log(`Realizando petición a: ${apiBaseUrl}/clients/${id}`)
    console.log('Datos actualizados del cliente:', clientData)

    // Realizar la petición a la API
    const response = await fetch(`${apiBaseUrl}/clients/${id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(clientData)
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`Error en la respuesta de la API: ${response.status}`, errorText)
      throw new Error(`Error al actualizar el cliente: ${response.status}`)
    }

    const client = await response.json()
    console.log('Respuesta de la API (cliente actualizado):', client)

    return client
  } catch (error) {
    console.error(`Error al actualizar el cliente con ID ${id}:`, error)
    throw error
  }
}

export default {
  getClients,
  searchClients,
  getClientById,
  createClient,
  updateClient
}
