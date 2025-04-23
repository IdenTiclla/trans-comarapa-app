// Servicio para gestionar los datos de ventas
import { useRuntimeConfig } from 'nuxt/app'

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

// Obtener todas las ventas (tickets y paquetes)
const getSales = async (filters = {}, pagination = { page: 1, itemsPerPage: 10 }) => {
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
    if (filters.type) queryParams.append('type', filters.type) // 'ticket' o 'package'
    if (filters.status) queryParams.append('status', filters.status)
    if (filters.date_from) queryParams.append('date_from', filters.date_from)
    if (filters.date_to) queryParams.append('date_to', filters.date_to)

    // Añadir paginación
    queryParams.append('skip', ((pagination.page - 1) * pagination.itemsPerPage).toString())
    queryParams.append('limit', pagination.itemsPerPage.toString())

    console.log(`Realizando petición a: ${apiBaseUrl}/sales?${queryParams.toString()}`)

    // Realizar la petición a la API
    // Nota: Este endpoint podría no existir aún, por lo que simulamos la respuesta
    try {
      const response = await fetch(`${apiBaseUrl}/sales?${queryParams.toString()}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error(`Error al obtener ventas: ${response.status}`)
      }

      const data = await response.json()
      console.log('Respuesta de la API (ventas):', data)

      // Transformar los datos si es necesario
      const sales = Array.isArray(data) ? data : data.items || []
      const totalItems = data.total || sales.length

      return {
        sales,
        pagination: {
          totalItems,
          totalPages: Math.ceil(totalItems / pagination.itemsPerPage) || 1,
          currentPage: pagination.page || 1,
          itemsPerPage: pagination.itemsPerPage || 10
        }
      }
    } catch (error) {
      console.error('Error al obtener ventas de la API:', error)

      // Simulación de datos para desarrollo
      console.warn('Usando datos simulados para ventas')

      // Generar datos de ejemplo
      const sales = Array.from({ length: pagination.itemsPerPage }, (_, i) => {
        const isTicket = Math.random() > 0.3 // 70% probabilidad de ser boleto
        const baseId = (pagination.page - 1) * pagination.itemsPerPage + i + 1

        if (isTicket) {
          return {
            id: baseId,
            type: 'ticket',
            reference: `T-${10000 + baseId}`,
            client_name: `Cliente ${Math.floor(Math.random() * 20) + 1}`,
            amount: Math.floor(Math.random() * 100) + 50, // Entre 50 y 150 Bs
            date: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(), // Hasta 7 días atrás
            status: ['paid', 'cancelled', 'refunded'][Math.floor(Math.random() * 3)],
            trip_id: Math.floor(Math.random() * 10) + 1
          }
        } else {
          return {
            id: baseId,
            type: 'package',
            reference: `P-${10000 + baseId}`,
            client_name: `Cliente ${Math.floor(Math.random() * 20) + 1}`,
            amount: Math.floor(Math.random() * 50) + 20, // Entre 20 y 70 Bs
            date: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(), // Hasta 7 días atrás
            status: ['paid', 'cancelled', 'refunded'][Math.floor(Math.random() * 3)],
            trip_id: Math.floor(Math.random() * 10) + 1
          }
        }
      })

      return {
        sales,
        pagination: {
          totalItems: 50,
          totalPages: 5,
          currentPage: pagination.page || 1,
          itemsPerPage: pagination.itemsPerPage || 10
        }
      }
    }
  } catch (error) {
    console.error('Error al obtener ventas:', error)
    throw error
  }
}

// Obtener ventas recientes
const getRecentSales = async (limit = 5) => {
  try {
    const apiBaseUrl = getApiBaseUrl()
    const token = getAuthToken()

    if (!token) {
      throw new Error('No hay token de autenticación')
    }

    // Construir los parámetros de consulta
    const queryParams = new URLSearchParams()
    queryParams.append('limit', limit.toString())

    console.log(`Realizando petición a: ${apiBaseUrl}/stats/sales/recent?${queryParams.toString()}`)

    // Realizar la petición a la API
    const response = await fetch(`${apiBaseUrl}/stats/sales/recent?${queryParams.toString()}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      throw new Error(`Error al obtener ventas recientes: ${response.status}`)
    }

    const data = await response.json()
    console.log('Respuesta de la API (ventas recientes):', data)

    // Transformar los datos si es necesario
    const sales = Array.isArray(data) ? data : data.items || []

    return sales
  } catch (error) {
    console.error('Error al obtener ventas recientes:', error)

    // Simulación de datos para desarrollo en caso de error
    console.warn('Usando datos simulados para ventas recientes')

    // Generar datos de ejemplo
    return Array.from({ length: limit }, (_, i) => {
      const isTicket = Math.random() > 0.3 // 70% probabilidad de ser boleto

      if (isTicket) {
        return {
          id: i + 1,
          type: 'ticket',
          reference: `T-${10000 + i + 1}`,
          client_name: `Cliente ${Math.floor(Math.random() * 20) + 1}`,
          amount: Math.floor(Math.random() * 100) + 50, // Entre 50 y 150 Bs
          date: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000).toISOString(), // Hasta 1 día atrás
          status: 'paid',
          trip_id: Math.floor(Math.random() * 10) + 1
        }
      } else {
        return {
          id: i + 1,
          type: 'package',
          reference: `P-${10000 + i + 1}`,
          client_name: `Cliente ${Math.floor(Math.random() * 20) + 1}`,
          amount: Math.floor(Math.random() * 50) + 20, // Entre 20 y 70 Bs
          date: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000).toISOString(), // Hasta 1 día atrás
          status: 'paid',
          trip_id: Math.floor(Math.random() * 10) + 1
        }
      }
    })
  }
}

// Obtener resumen de ventas por período
const getSalesSummary = async (period = 'today') => {
  try {
    const apiBaseUrl = getApiBaseUrl()
    const token = getAuthToken()

    if (!token) {
      throw new Error('No hay token de autenticación')
    }

    // Construir los parámetros de consulta
    const queryParams = new URLSearchParams()
    queryParams.append('period', period)

    console.log(`Realizando petición a: ${apiBaseUrl}/stats/sales/summary?${queryParams.toString()}`)

    // Realizar la petición a la API
    const response = await fetch(`${apiBaseUrl}/stats/sales/summary?${queryParams.toString()}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      throw new Error(`Error al obtener resumen de ventas: ${response.status}`)
    }

    const data = await response.json()
    console.log('Respuesta de la API (resumen de ventas):', data)

    return data
  } catch (error) {
    console.error('Error al obtener resumen de ventas:', error)

    // Simulación de datos para desarrollo en caso de error
    console.warn('Usando datos simulados para resumen de ventas')

    // Datos simulados basados en el período
    let totalAmount = 0
    let ticketCount = 0
    let packageCount = 0
    let trend = 0

    switch (period) {
      case 'today':
        totalAmount = Math.floor(Math.random() * 3000) + 1000 // Entre 1000 y 4000 Bs
        ticketCount = Math.floor(Math.random() * 30) + 10 // Entre 10 y 40
        packageCount = Math.floor(Math.random() * 15) + 5 // Entre 5 y 20
        trend = Math.floor(Math.random() * 30) - 10 // Entre -10% y +20%
        break
      case 'week':
        totalAmount = Math.floor(Math.random() * 15000) + 5000 // Entre 5000 y 20000 Bs
        ticketCount = Math.floor(Math.random() * 100) + 50 // Entre 50 y 150
        packageCount = Math.floor(Math.random() * 50) + 20 // Entre 20 y 70
        trend = Math.floor(Math.random() * 20) - 5 // Entre -5% y +15%
        break
      case 'month':
        totalAmount = Math.floor(Math.random() * 50000) + 20000 // Entre 20000 y 70000 Bs
        ticketCount = Math.floor(Math.random() * 300) + 200 // Entre 200 y 500
        packageCount = Math.floor(Math.random() * 150) + 100 // Entre 100 y 250
        trend = Math.floor(Math.random() * 15) - 5 // Entre -5% y +10%
        break
      default:
        totalAmount = Math.floor(Math.random() * 3000) + 1000 // Entre 1000 y 4000 Bs
        ticketCount = Math.floor(Math.random() * 30) + 10 // Entre 10 y 40
        packageCount = Math.floor(Math.random() * 15) + 5 // Entre 5 y 20
        trend = Math.floor(Math.random() * 30) - 10 // Entre -10% y +20%
    }

    return {
      totalAmount,
      ticketCount,
      packageCount,
      trend,
      period
    }
  }
}

export default {
  getSales,
  getRecentSales,
  getSalesSummary
}
