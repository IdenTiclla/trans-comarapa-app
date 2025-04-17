import { getApiBaseUrl, getAuthToken } from '~/utils/api'

// Obtener todos los tickets
const getTickets = async (filters = {}, pagination = { page: 1, itemsPerPage: 10 }) => {
  try {
    const apiBaseUrl = getApiBaseUrl()
    const token = getAuthToken()

    if (!token) {
      throw new Error('No hay token de autenticación')
    }

    // Construir los parámetros de consulta
    const queryParams = new URLSearchParams()

    // Añadir filtros
    if (filters.client_id) queryParams.append('client_id', filters.client_id)
    if (filters.trip_id) queryParams.append('trip_id', filters.trip_id)
    if (filters.status) queryParams.append('status', filters.status)
    if (filters.date_from) queryParams.append('date_from', filters.date_from)
    if (filters.date_to) queryParams.append('date_to', filters.date_to)

    // Añadir paginación
    queryParams.append('skip', ((pagination.page - 1) * pagination.itemsPerPage).toString())
    queryParams.append('limit', pagination.itemsPerPage.toString())

    console.log(`Realizando petición a: ${apiBaseUrl}/tickets?${queryParams.toString()}`)

    // Realizar la petición a la API
    const response = await fetch(`${apiBaseUrl}/tickets?${queryParams.toString()}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`Error en la respuesta de la API: ${response.status}`, errorText)
      throw new Error(`Error al obtener tickets: ${response.status}`)
    }

    const data = await response.json()
    console.log('Respuesta de la API (tickets):', data)

    return {
      tickets: data.items || [],
      pagination: {
        totalItems: data.total || 0,
        totalPages: Math.ceil((data.total || 0) / pagination.itemsPerPage) || 1,
        currentPage: pagination.page || 1,
        itemsPerPage: pagination.itemsPerPage || 10
      }
    }
  } catch (error) {
    console.error('Error al obtener tickets:', error)
    throw error
  }
}

// Obtener un ticket por ID
const getTicketById = async (id) => {
  try {
    const apiBaseUrl = getApiBaseUrl()
    const token = getAuthToken()

    if (!token) {
      throw new Error('No hay token de autenticación')
    }

    console.log(`Realizando petición a: ${apiBaseUrl}/tickets/${id}`)

    // Realizar la petición a la API
    const response = await fetch(`${apiBaseUrl}/tickets/${id}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`Error en la respuesta de la API: ${response.status}`, errorText)
      throw new Error(`Error al obtener el ticket: ${response.status}`)
    }

    const ticket = await response.json()
    console.log('Respuesta de la API (detalle de ticket):', ticket)

    return ticket
  } catch (error) {
    console.error(`Error al obtener el ticket con ID ${id}:`, error)
    throw error
  }
}

// Crear un nuevo ticket
const createTicket = async (ticketData) => {
  try {
    const apiBaseUrl = getApiBaseUrl()
    const token = getAuthToken()

    if (!token) {
      throw new Error('No hay token de autenticación')
    }

    console.log(`Realizando petición a: ${apiBaseUrl}/tickets`)
    console.log('Datos del ticket:', ticketData)

    // Realizar la petición a la API
    const response = await fetch(`${apiBaseUrl}/tickets`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(ticketData)
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`Error en la respuesta de la API: ${response.status}`, errorText)
      throw new Error(`Error al crear el ticket: ${response.status}`)
    }

    const ticket = await response.json()
    console.log('Respuesta de la API (ticket creado):', ticket)

    return ticket
  } catch (error) {
    console.error('Error al crear el ticket:', error)
    throw error
  }
}

// Actualizar un ticket existente
const updateTicket = async (id, ticketData) => {
  try {
    const apiBaseUrl = getApiBaseUrl()
    const token = getAuthToken()

    if (!token) {
      throw new Error('No hay token de autenticación')
    }

    console.log(`Realizando petición a: ${apiBaseUrl}/tickets/${id}`)
    console.log('Datos actualizados del ticket:', ticketData)

    // Realizar la petición a la API
    const response = await fetch(`${apiBaseUrl}/tickets/${id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(ticketData)
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`Error en la respuesta de la API: ${response.status}`, errorText)
      throw new Error(`Error al actualizar el ticket: ${response.status}`)
    }

    const ticket = await response.json()
    console.log('Respuesta de la API (ticket actualizado):', ticket)

    return ticket
  } catch (error) {
    console.error(`Error al actualizar el ticket con ID ${id}:`, error)
    throw error
  }
}

// Cancelar un ticket
const cancelTicket = async (id, reason) => {
  try {
    const apiBaseUrl = getApiBaseUrl()
    const token = getAuthToken()

    if (!token) {
      throw new Error('No hay token de autenticación')
    }

    console.log(`Realizando petición a: ${apiBaseUrl}/tickets/${id}/cancel`)

    // Realizar la petición a la API
    const response = await fetch(`${apiBaseUrl}/tickets/${id}/cancel`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ reason })
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`Error en la respuesta de la API: ${response.status}`, errorText)
      throw new Error(`Error al cancelar el ticket: ${response.status}`)
    }

    const result = await response.json()
    console.log('Respuesta de la API (ticket cancelado):', result)

    return result
  } catch (error) {
    console.error(`Error al cancelar el ticket con ID ${id}:`, error)
    throw error
  }
}

export default {
  getTickets,
  getTicketById,
  createTicket,
  updateTicket,
  cancelTicket
}
