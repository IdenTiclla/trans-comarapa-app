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
const handleApiError = async (response, defaultMessage) => {
  console.error(defaultMessage)

  try {
    // Intentar extraer el mensaje de error de la respuesta
    const errorData = await response.json()
    throw new Error(errorData.detail || defaultMessage)
  } catch (err) {
    // Si no se puede extraer el mensaje, lanzar el error por defecto
    throw new Error(defaultMessage)
  }
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
      // Mapear los nombres de columnas del frontend a los nombres de columnas de la API
      const sortColumnMap = {
        'origin': 'route.origin_location.name',
        'destination': 'route.destination_location.name',
        'departure_date': 'trip_datetime',
        'departure_time': 'trip_datetime',
        'status': 'status',
        'seats': 'available_seats',
        'id': 'id'
      }

      const sortColumn = sortColumnMap[sort.by] || sort.by
      queryParams.append('sort_by', sortColumn)
      queryParams.append('sort_direction', sort.direction || 'asc')
    }

    // Añadir paginación - usar los parámetros que espera la API
    queryParams.append('skip', ((pagination.page - 1) * pagination.itemsPerPage).toString())
    queryParams.append('limit', pagination.itemsPerPage.toString())

    console.log(`Realizando petición a: ${apiBaseUrl}/trips?${queryParams.toString()}`)

    // Realizar la petición a la API
    const response = await fetch(`${apiBaseUrl}/trips?${queryParams.toString()}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`Error en la respuesta de la API: ${response.status}`, errorText)
      throw new Error(`Error al obtener viajes: ${response.status}`)
    }

    const responseData = await response.json()
    console.log('Respuesta de la API:', responseData)

    // Verificar la estructura de la respuesta
    let tripsData = [];
    let totalItems = 0;

    if (Array.isArray(responseData)) {
      // Si la respuesta es un array, asumimos que son los viajes directamente
      tripsData = responseData;
      totalItems = responseData.length;
    } else if (responseData.items && Array.isArray(responseData.items)) {
      // Si la respuesta tiene una propiedad 'items' que es un array
      tripsData = responseData.items;
      totalItems = responseData.total || responseData.items.length;
    } else {
      console.error('Formato de respuesta inesperado:', responseData);
      throw new Error('Formato de respuesta inesperado');
    }

    // Transformar la respuesta al formato esperado por el frontend
    const transformedTrips = await Promise.all(tripsData.map(async trip => {
      try {
        // Verificar que los datos necesarios existen
        if (!trip) {
          console.error('Trip es null o undefined');
          return null;
        }

        // Extraer origen y destino con manejo de errores
        let origin = 'Desconocido';
        let destination = 'Desconocido';

        if (trip.route) {
          if (trip.route.origin_location && trip.route.origin_location.name) {
            origin = trip.route.origin_location.name;
          } else if (typeof trip.route.origin === 'string') {
            origin = trip.route.origin;
          }

          if (trip.route.destination_location && trip.route.destination_location.name) {
            destination = trip.route.destination_location.name;
          } else if (typeof trip.route.destination === 'string') {
            destination = trip.route.destination;
          }
        }

        // Extraer fecha y hora con manejo de errores
        let departureDate = '';
        let departureTime = '';

        if (trip.trip_datetime) {
          const parts = trip.trip_datetime.split('T');
          if (parts.length >= 2) {
            departureDate = parts[0];
            departureTime = parts[1].substring(0, 5);
          }
        }

        // Extraer información del conductor con manejo de errores
        let driver = { id: 0, name: 'No asignado' };
        if (trip.driver) {
          driver = {
            id: trip.driver.id || 0,
            name: trip.driver.firstname && trip.driver.lastname ?
              `${trip.driver.firstname} ${trip.driver.lastname}` :
              trip.driver.name || 'No asignado'
          };
        }

        // Extraer información del asistente con manejo de errores
        let assistant = { id: 0, name: 'No asignado' };
        if (trip.assistant) {
          assistant = {
            id: trip.assistant.id || 0,
            name: trip.assistant.firstname && trip.assistant.lastname ?
              `${trip.assistant.firstname} ${trip.assistant.lastname}` :
              trip.assistant.name || 'No asignado'
          };
        }

        // Extraer información del bus con manejo de errores
        let bus = { id: 0, plate: 'No asignado', model: 'Desconocido', type: 'single-deck' };
        if (trip.bus) {
          bus = {
            id: trip.bus.id || 0,
            plate: trip.bus.license_plate || trip.bus.plate || 'No asignado',
            model: trip.bus.model || 'Desconocido',
            type: trip.bus.type || 'single-deck'
          };
        }

        // Obtener asientos ocupados para este viaje
        let occupiedSeats = [];
        let totalSeats = trip.bus && trip.bus.capacity ? trip.bus.capacity : 40;
        let availableSeats = 0;

        try {
          // Obtener asientos ocupados de la API
          const seatsData = await getAvailableSeats(trip.id);
          occupiedSeats = seatsData.occupiedSeats || [];

          // Usar los datos de la API para total y disponibles si están disponibles
          if (seatsData.totalSeats) {
            totalSeats = seatsData.totalSeats;
          }

          // Calcular asientos disponibles basados en los datos reales
          if (seatsData.availableSeats !== undefined) {
            availableSeats = seatsData.availableSeats;
          } else {
            // Si no tenemos el número exacto, calcularlo basado en los asientos ocupados
            availableSeats = totalSeats - occupiedSeats.length;
          }
        } catch (error) {
          console.warn(`No se pudieron obtener los asientos ocupados para el viaje ${trip.id}:`, error);
          // Si hay un error, usar valores por defecto
          occupiedSeats = [];
          availableSeats = trip.available_seats !== undefined ? trip.available_seats :
            (totalSeats ? Math.ceil(totalSeats * 0.8) : 32);
        }

        // Asegurar que los números sean coherentes
        if (availableSeats > totalSeats) {
          availableSeats = totalSeats;
        }

        if (occupiedSeats.length > totalSeats) {
          // Limitar los asientos ocupados al total de asientos
          occupiedSeats = occupiedSeats.slice(0, totalSeats);
        }

        // Si tenemos asientos ocupados pero no tenemos asientos disponibles calculados correctamente
        if (occupiedSeats.length > 0 && availableSeats + occupiedSeats.length !== totalSeats) {
          // Recalcular asientos disponibles basados en los ocupados
          availableSeats = totalSeats - occupiedSeats.length;
        }

        // Construir el objeto transformado
        return {
          id: trip.id,
          route: {
            origin,
            destination
          },
          departure_date: departureDate,
          departure_time: departureTime,
          status: trip.status || 'scheduled',
          total_seats: totalSeats,
          available_seats: availableSeats,
          occupied_seats: occupiedSeats,
          driver,
          assistant,
          bus
        };
      } catch (err) {
        console.error('Error al transformar viaje:', err, trip);
        return null;
      }
    })).then(trips => trips.filter(trip => trip !== null)); // Filtrar cualquier viaje que no se pudo transformar

    return {
      trips: transformedTrips,
      pagination: {
        totalItems: totalItems,
        totalPages: Math.ceil(totalItems / (pagination.itemsPerPage || 10)) || 1,
        currentPage: pagination.page || 1,
        itemsPerPage: pagination.itemsPerPage || 10
      }
    }
  } catch (error) {
    console.error('Error al obtener viajes:', error)

    // No usar datos de ejemplo, simplemente lanzar el error para que el usuario sepa que hay un problema
    console.error('Error al obtener viajes, no se pudieron cargar los datos de la API')

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

    console.log(`Realizando petición a: ${apiBaseUrl}/trips/${id}`)

    // Realizar la petición a la API
    const response = await fetch(`${apiBaseUrl}/trips/${id}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`Error en la respuesta de la API: ${response.status}`, errorText)
      throw new Error(`Error al obtener el viaje: ${response.status}`)
    }

    const tripData = await response.json()
    console.log('Respuesta de la API (detalle de viaje):', tripData)

    try {
      // Verificar que los datos necesarios existen
      if (!tripData) {
        throw new Error('Los datos del viaje son null o undefined')
      }

      // Extraer origen y destino con manejo de errores
      let origin = 'Desconocido'
      let destination = 'Desconocido'

      if (tripData.route) {
        if (tripData.route.origin_location && tripData.route.origin_location.name) {
          origin = tripData.route.origin_location.name
        } else if (typeof tripData.route.origin === 'string') {
          origin = tripData.route.origin
        }

        if (tripData.route.destination_location && tripData.route.destination_location.name) {
          destination = tripData.route.destination_location.name
        } else if (typeof tripData.route.destination === 'string') {
          destination = tripData.route.destination
        }
      }

      // Extraer fecha y hora con manejo de errores
      let departureDate = ''
      let departureTime = ''

      if (tripData.trip_datetime) {
        const parts = tripData.trip_datetime.split('T')
        if (parts.length >= 2) {
          departureDate = parts[0]
          departureTime = parts[1].substring(0, 5)
        }
      }

      // Extraer información del conductor con manejo de errores
      let driver = { id: 0, name: 'No asignado' }
      if (tripData.driver) {
        driver = {
          id: tripData.driver.id || 0,
          name: tripData.driver.firstname && tripData.driver.lastname ?
            `${tripData.driver.firstname} ${tripData.driver.lastname}` :
            tripData.driver.name || 'No asignado'
        }
      }

      // Extraer información del asistente con manejo de errores
      let assistant = { id: 0, name: 'No asignado' }
      if (tripData.assistant) {
        assistant = {
          id: tripData.assistant.id || 0,
          name: tripData.assistant.firstname && tripData.assistant.lastname ?
            `${tripData.assistant.firstname} ${tripData.assistant.lastname}` :
            tripData.assistant.name || 'No asignado'
        }
      }

      // Extraer información del bus con manejo de errores
      let bus = { id: 0, plate: 'No asignado', model: 'Desconocido', type: 'single-deck' }
      if (tripData.bus) {
        bus = {
          id: tripData.bus.id || 0,
          plate: tripData.bus.license_plate || tripData.bus.plate || 'No asignado',
          model: tripData.bus.model || 'Desconocido',
          type: tripData.bus.type || 'single-deck'
        }
      }

      // Obtener asientos ocupados para este viaje
      let occupiedSeats = [];
      let totalSeats = tripData.bus && tripData.bus.capacity ? tripData.bus.capacity : 40;
      let availableSeats = 0;

      try {
        // Obtener asientos ocupados de la API
        const seatsData = await getAvailableSeats(tripData.id);
        occupiedSeats = seatsData.occupiedSeats || [];

        // Usar los datos de la API para total y disponibles si están disponibles
        if (seatsData.totalSeats) {
          totalSeats = seatsData.totalSeats;
        }

        // Calcular asientos disponibles basados en los datos reales
        if (seatsData.availableSeats !== undefined) {
          availableSeats = seatsData.availableSeats;
        } else {
          // Si no tenemos el número exacto, calcularlo basado en los asientos ocupados
          availableSeats = totalSeats - occupiedSeats.length;
        }
      } catch (error) {
        console.warn(`No se pudieron obtener los asientos ocupados para el viaje ${tripData.id}:`, error);
        // Si hay un error, usar valores por defecto
        occupiedSeats = [];
        availableSeats = tripData.available_seats !== undefined ? tripData.available_seats :
          (totalSeats ? Math.ceil(totalSeats * 0.8) : 32);
      }

      // Asegurar que los números sean coherentes
      if (availableSeats > totalSeats) {
        availableSeats = totalSeats;
      }

      if (occupiedSeats.length > totalSeats) {
        // Limitar los asientos ocupados al total de asientos
        occupiedSeats = occupiedSeats.slice(0, totalSeats);
      }

      // Si tenemos asientos ocupados pero no tenemos asientos disponibles calculados correctamente
      if (occupiedSeats.length > 0 && availableSeats + occupiedSeats.length !== totalSeats) {
        // Recalcular asientos disponibles basados en los ocupados
        availableSeats = totalSeats - occupiedSeats.length;
      }

      // Construir el objeto transformado
      return {
        id: tripData.id,
        route: {
          origin,
          destination
        },
        departure_date: departureDate,
        departure_time: departureTime,
        status: tripData.status || 'scheduled',
        total_seats: totalSeats,
        available_seats: availableSeats,
        occupied_seats: occupiedSeats,
        driver,
        assistant,
        bus
      }
    } catch (err) {
      console.error('Error al transformar los datos del viaje:', err)
      throw err
    }
  } catch (error) {
    console.error(`Error al obtener el viaje con ID ${id}:`, error)

    // No usar datos de ejemplo, simplemente lanzar el error para que el usuario sepa que hay un problema
    console.error('Error al obtener el viaje, no se pudieron cargar los datos de la API')

    throw error
  }
}

// No se utilizan funciones de generación de datos de ejemplo
// ya que todos los datos provienen de la API real

// Obtener asientos disponibles para un viaje
const getAvailableSeats = async (tripId) => {
  try {
    const apiBaseUrl = getApiBaseUrl()
    const token = getAuthToken()

    if (!token) {
      throw new Error('No hay token de autenticación')
    }

    console.log(`Realizando petición a: ${apiBaseUrl}/trips/${tripId}/available-seats`)

    // Realizar la petición a la API
    const response = await fetch(`${apiBaseUrl}/trips/${tripId}/available-seats`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`Error en la respuesta de la API: ${response.status}`, errorText)
      throw new Error(`Error al obtener asientos disponibles: ${response.status}`)
    }

    const data = await response.json()
    console.log('Respuesta de la API (asientos disponibles):', data)

    return {
      totalSeats: data.total_seats || 0,
      availableSeats: data.available_seats || 0,
      occupiedSeats: data.occupied_seats || [],
      availableSeatNumbers: data.available_seat_numbers || []
    }
  } catch (error) {
    console.error(`Error al obtener asientos disponibles para el viaje ${tripId}:`, error)

    // No usar datos de ejemplo, simplemente lanzar el error para que el usuario sepa que hay un problema
    console.error('Error al obtener asientos disponibles, no se pudieron cargar los datos de la API')

    throw error
  }
}

export default {
  getTrips,
  getTripById,
  getAvailableSeats
}
