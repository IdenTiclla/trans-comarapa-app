// Servicio para gestionar los datos de viajes
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

// Manejar errores de la API
const handleApiError = (error, defaultMessage) => {
  console.error(defaultMessage, error)

  // Si el error tiene una respuesta JSON, intentar extraer el mensaje
  if (error.response && error.response.json) {
    return error.response.json()
      .then(data => {
        throw new Error(data.detail || defaultMessage)
      })
      .catch(() => {
        throw new Error(defaultMessage)
      })
  }

  throw new Error(defaultMessage)
}

// Obtener todos los viajes
const getTrips = async (filters = {}, sort = {}, pagination = {}) => {
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
    if (filters.origin) queryParams.append('origin', filters.origin)
    if (filters.destination) queryParams.append('destination', filters.destination)
    if (filters.status) queryParams.append('status', filters.status)
    if (filters.date) queryParams.append('date', filters.date)
    if (filters.dateFrom) queryParams.append('date_from', filters.dateFrom)
    if (filters.dateTo) queryParams.append('date_to', filters.dateTo)
    if (filters.minSeats) queryParams.append('min_seats', filters.minSeats)

    // Añadir ordenamiento
    if (sort.by) {
      queryParams.append('sort_by', sort.by)
      queryParams.append('sort_direction', sort.direction || 'asc')
    }

    // Añadir paginación
    queryParams.append('page', pagination.page || 1)
    queryParams.append('per_page', pagination.itemsPerPage || 10)

    // Realizar la petición a la API
    const response = await fetch(`${apiBaseUrl}/trips?${queryParams.toString()}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      return handleApiError(response, `Error al obtener viajes: ${response.status}`)
    }

    const tripsData = await response.json()

    // Transformar la respuesta al formato esperado por el frontend
    const transformedTrips = tripsData.map(trip => ({
      id: trip.id,
      route: {
        origin: trip.route.origin_location.name,
        destination: trip.route.destination_location.name
      },
      departure_date: trip.trip_datetime.split('T')[0],
      departure_time: trip.trip_datetime.split('T')[1].substring(0, 5),
      status: 'scheduled', // Por defecto, todos los viajes están programados
      total_seats: trip.bus.capacity,
      available_seats: Math.floor(trip.bus.capacity * 0.7), // Simulamos que el 70% de los asientos están disponibles
      driver: {
        id: trip.driver.id,
        name: `${trip.driver.firstname} ${trip.driver.lastname}`
      },
      assistant: {
        id: trip.assistant.id,
        name: `${trip.assistant.firstname} ${trip.assistant.lastname}`
      },
      bus: {
        id: trip.bus.id,
        plate: trip.bus.license_plate,
        model: trip.bus.model,
        type: 'single-deck'
      }
    }))

    return {
      trips: transformedTrips,
      pagination: {
        totalItems: transformedTrips.length,
        totalPages: Math.ceil(transformedTrips.length / pagination.itemsPerPage) || 1,
        currentPage: pagination.page || 1,
        itemsPerPage: pagination.itemsPerPage || 10
      }
    }
  } catch (error) {
    console.error('Error al obtener viajes:', error)

    // Si estamos en desarrollo, devolver datos de ejemplo
    if (process.env.NODE_ENV === 'development') {
      console.warn('Usando datos de ejemplo en desarrollo')
      return {
        trips: generateExampleTrips(10),
        pagination: {
          totalItems: 50,
          totalPages: 5,
          currentPage: pagination.page || 1,
          itemsPerPage: pagination.itemsPerPage || 10
        }
      }
    }

    throw error
  }
}

// Obtener un viaje por ID
const getTripById = async (id) => {
  try {
    const apiBaseUrl = getApiBaseUrl()
    const token = getAuthToken()

    if (!token) {
      throw new Error('No hay token de autenticación')
    }

    // Realizar la petición a la API
    const response = await fetch(`${apiBaseUrl}/trips/${id}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      return handleApiError(response, `Error al obtener el viaje: ${response.status}`)
    }

    const tripData = await response.json()

    // Transformar la respuesta al formato esperado por el frontend
    return {
      id: tripData.id,
      route: {
        origin: tripData.route.origin_location.name,
        destination: tripData.route.destination_location.name
      },
      departure_date: tripData.trip_datetime.split('T')[0],
      departure_time: tripData.trip_datetime.split('T')[1].substring(0, 5),
      status: 'scheduled', // Por defecto, todos los viajes están programados
      total_seats: tripData.bus.capacity,
      available_seats: Math.floor(tripData.bus.capacity * 0.7), // Simulamos que el 70% de los asientos están disponibles
      driver: {
        id: tripData.driver.id,
        name: `${tripData.driver.firstname} ${tripData.driver.lastname}`
      },
      assistant: {
        id: tripData.assistant.id,
        name: `${tripData.assistant.firstname} ${tripData.assistant.lastname}`
      },
      bus: {
        id: tripData.bus.id,
        plate: tripData.bus.license_plate,
        model: tripData.bus.model,
        type: 'single-deck'
      }
    }
  } catch (error) {
    console.error(`Error al obtener el viaje con ID ${id}:`, error)

    // Si estamos en desarrollo, devolver datos de ejemplo
    if (process.env.NODE_ENV === 'development') {
      console.warn('Usando datos de ejemplo en desarrollo')
      return generateExampleTrip(parseInt(id))
    }

    throw error
  }
}

// Generar un viaje de ejemplo (para desarrollo)
const generateExampleTrip = (id) => {
  const statuses = ['scheduled', 'in_progress', 'completed', 'cancelled']
  const routes = [
    { origin: 'Santa Cruz', destination: 'Comarapa' },
    { origin: 'Comarapa', destination: 'Santa Cruz' },
    { origin: 'Santa Cruz', destination: 'Cochabamba' },
    { origin: 'Cochabamba', destination: 'Santa Cruz' }
  ]

  const route = routes[id % routes.length]
  const status = statuses[id % statuses.length]
  const totalSeats = 40
  const availableSeats = status === 'cancelled' ? 0 : Math.floor(Math.random() * totalSeats)

  // Generar fecha aleatoria en los próximos 30 días
  const date = new Date()
  date.setDate(date.getDate() + (id % 30))
  const departureDate = date.toISOString().split('T')[0]

  // Generar hora aleatoria
  const hours = String((id * 7) % 24).padStart(2, '0')
  const minutes = String((id * 13) % 60).padStart(2, '0')
  const departureTime = `${hours}:${minutes}`

  // Generar datos adicionales para detalles
  const driver = {
    id: (id % 5) + 1,
    name: ['Juan Pérez', 'Carlos Rodríguez', 'Miguel González', 'Roberto Sánchez', 'Fernando López'][id % 5]
  }

  const assistant = {
    id: (id % 5) + 1,
    name: ['María López', 'Ana García', 'Laura Martínez', 'Sofía Hernández', 'Lucía Díaz'][id % 5]
  }

  const bus = {
    id: (id % 5) + 1,
    plate: `ABC-${100 + id}`,
    model: ['Mercedes Benz O-500', 'Volvo 9800', 'Scania K410', 'Marcopolo Paradiso', 'Irizar i8'][id % 5],
    type: 'single-deck'
  }

  return {
    id: id,
    route,
    departure_date: departureDate,
    departure_time: departureTime,
    status,
    total_seats: totalSeats,
    available_seats: availableSeats,
    driver,
    assistant,
    bus
  }
}

// Generar viajes de ejemplo (para desarrollo)
const generateExampleTrips = (count = 50) => {
  const trips = []

  for (let i = 1; i <= count; i++) {
    trips.push(generateExampleTrip(i))
  }

  return trips
}

export default {
  getTrips,
  getTripById
}
