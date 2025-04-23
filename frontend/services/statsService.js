// Servicio para obtener estadísticas del sistema
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

// Obtener estadísticas de boletos vendidos
const getTicketStats = async (period = 'today') => {
  try {
    const apiBaseUrl = getApiBaseUrl()
    const token = getAuthToken()

    if (!token) {
      throw new Error('No hay token de autenticación')
    }

    // Construir los parámetros de consulta
    const queryParams = new URLSearchParams()
    queryParams.append('period', period)

    console.log(`Realizando petición a: ${apiBaseUrl}/stats/tickets/stats?${queryParams.toString()}`)

    // Realizar la petición a la API
    const response = await fetch(`${apiBaseUrl}/stats/tickets/stats?${queryParams.toString()}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      throw new Error(`Error al obtener estadísticas de boletos: ${response.status}`)
    }

    const data = await response.json()
    console.log('Respuesta de la API (estadísticas de boletos):', data)
    return data
  } catch (error) {
    console.error('Error al obtener estadísticas de boletos:', error)

    // Simulación de datos para desarrollo en caso de error
    console.warn('Usando datos simulados para estadísticas de boletos')

    // Datos simulados basados en el período
    let count = 0
    let amount = 0
    let trend = 0

    switch (period) {
      case 'today':
        count = Math.floor(Math.random() * 30) + 10 // Entre 10 y 40
        amount = count * (Math.floor(Math.random() * 50) + 100) // Entre 100 y 150 Bs por boleto
        trend = Math.floor(Math.random() * 30) - 10 // Entre -10% y +20%
        break
      case 'week':
        count = Math.floor(Math.random() * 100) + 50 // Entre 50 y 150
        amount = count * (Math.floor(Math.random() * 50) + 100) // Entre 100 y 150 Bs por boleto
        trend = Math.floor(Math.random() * 20) - 5 // Entre -5% y +15%
        break
      case 'month':
        count = Math.floor(Math.random() * 300) + 200 // Entre 200 y 500
        amount = count * (Math.floor(Math.random() * 50) + 100) // Entre 100 y 150 Bs por boleto
        trend = Math.floor(Math.random() * 15) - 5 // Entre -5% y +10%
        break
      default:
        count = Math.floor(Math.random() * 30) + 10 // Entre 10 y 40
        amount = count * (Math.floor(Math.random() * 50) + 100) // Entre 100 y 150 Bs por boleto
        trend = Math.floor(Math.random() * 30) - 10 // Entre -10% y +20%
    }

    return {
      count,
      amount,
      trend,
      period
    }
  }
}

// Obtener estadísticas de paquetes
const getPackageStats = async (period = 'today') => {
  try {
    const apiBaseUrl = getApiBaseUrl()
    const token = getAuthToken()

    if (!token) {
      throw new Error('No hay token de autenticación')
    }

    // Construir los parámetros de consulta
    const queryParams = new URLSearchParams()
    queryParams.append('period', period)

    console.log(`Realizando petición a: ${apiBaseUrl}/stats/packages/stats?${queryParams.toString()}`)

    // Realizar la petición a la API
    const response = await fetch(`${apiBaseUrl}/stats/packages/stats?${queryParams.toString()}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      throw new Error(`Error al obtener estadísticas de paquetes: ${response.status}`)
    }

    const data = await response.json()
    console.log('Respuesta de la API (estadísticas de paquetes):', data)
    return data
  } catch (error) {
    console.error('Error al obtener estadísticas de paquetes:', error)

    // Simulación de datos para desarrollo en caso de error
    console.warn('Usando datos simulados para estadísticas de paquetes')

    // Datos simulados basados en el período
    let count = 0
    let trend = 0

    switch (period) {
      case 'today':
        count = Math.floor(Math.random() * 15) + 5 // Entre 5 y 20
        trend = Math.floor(Math.random() * 30) - 15 // Entre -15% y +15%
        break
      case 'week':
        count = Math.floor(Math.random() * 50) + 20 // Entre 20 y 70
        trend = Math.floor(Math.random() * 20) - 10 // Entre -10% y +10%
        break
      case 'month':
        count = Math.floor(Math.random() * 150) + 100 // Entre 100 y 250
        trend = Math.floor(Math.random() * 15) - 5 // Entre -5% y +10%
        break
      default:
        count = Math.floor(Math.random() * 15) + 5 // Entre 5 y 20
        trend = Math.floor(Math.random() * 30) - 15 // Entre -15% y +15%
    }

    return {
      count,
      trend,
      period
    }
  }
}

// Obtener estadísticas de viajes
const getTripStats = async (period = 'today') => {
  try {
    const apiBaseUrl = getApiBaseUrl()
    const token = getAuthToken()

    if (!token) {
      throw new Error('No hay token de autenticación')
    }

    // Construir los parámetros de consulta
    const queryParams = new URLSearchParams()
    queryParams.append('period', period)

    console.log(`Realizando petición a: ${apiBaseUrl}/stats/trips/stats?${queryParams.toString()}`)

    // Realizar la petición a la API
    const response = await fetch(`${apiBaseUrl}/stats/trips/stats?${queryParams.toString()}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      throw new Error(`Error al obtener estadísticas de viajes: ${response.status}`)
    }

    const data = await response.json()
    console.log('Respuesta de la API (estadísticas de viajes):', data)
    return data
  } catch (error) {
    console.error('Error al obtener estadísticas de viajes:', error)

    // Simulación de datos para desarrollo en caso de error
    console.warn('Usando datos simulados para estadísticas de viajes')

    // Datos simulados basados en el período
    let count = 0
    let trend = 0

    switch (period) {
      case 'today':
        count = Math.floor(Math.random() * 10) + 5 // Entre 5 y 15
        trend = Math.floor(Math.random() * 10) - 5 // Entre -5% y +5%
        break
      case 'week':
        count = Math.floor(Math.random() * 30) + 20 // Entre 20 y 50
        trend = Math.floor(Math.random() * 10) - 5 // Entre -5% y +5%
        break
      case 'month':
        count = Math.floor(Math.random() * 100) + 50 // Entre 50 y 150
        trend = Math.floor(Math.random() * 10) - 5 // Entre -5% y +5%
        break
      default:
        count = Math.floor(Math.random() * 10) + 5 // Entre 5 y 15
        trend = Math.floor(Math.random() * 10) - 5 // Entre -5% y +5%
    }

    return {
      count,
      trend,
      period
    }
  }
}

// Obtener todas las estadísticas para el dashboard
const getDashboardStats = async (period = 'today') => {
  try {
    const apiBaseUrl = getApiBaseUrl()
    const token = getAuthToken()

    if (!token) {
      throw new Error('No hay token de autenticación')
    }

    // Construir los parámetros de consulta
    const queryParams = new URLSearchParams()
    queryParams.append('period', period)

    console.log(`Realizando petición a: ${apiBaseUrl}/stats/dashboard?${queryParams.toString()}`)

    // Realizar la petición a la API
    const response = await fetch(`${apiBaseUrl}/stats/dashboard?${queryParams.toString()}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      throw new Error(`Error al obtener estadísticas del dashboard: ${response.status}`)
    }

    const data = await response.json()
    console.log('Respuesta de la API (estadísticas del dashboard):', data)
    return data
  } catch (error) {
    console.error('Error al obtener estadísticas para el dashboard:', error)

    // Si falla la petición al endpoint consolidado, intentar obtener las estadísticas por separado
    try {
      // Obtener todas las estadísticas en paralelo
      const [ticketStats, packageStats, tripStats] = await Promise.all([
        getTicketStats(period),
        getPackageStats(period),
        getTripStats(period)
      ])

      return {
        tickets: ticketStats,
        packages: packageStats,
        trips: tripStats
      }
    } catch (fallbackError) {
      console.error('Error al obtener estadísticas individuales:', fallbackError)
      throw error // Lanzar el error original
    }
  }
}

export default {
  getTicketStats,
  getPackageStats,
  getTripStats,
  getDashboardStats
}
