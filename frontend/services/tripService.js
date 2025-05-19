// Servicio para gestionar los datos de viajes
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

const resourceUrl = '/trips'

// Primary function to get trips, using apiFetch and handling various parameters
export const getTrips = async (params = {}) => {
  // Params can include:
  // For filtering: search, origin, destination, status, date, date_from, date_to, min_seats, upcoming
  // For sorting: sort_by, sort_direction
  // For pagination: page, limit (or itemsPerPage which needs to be mapped to limit)

  const queryParams = { ...params };

  // Map pagination parameters if they come in a different format
  if (params.itemsPerPage && !params.limit) {
    queryParams.limit = params.itemsPerPage;
  }
  // Always remove itemsPerPage as it's frontend-specific
  delete queryParams.itemsPerPage; 

  if (params.page && typeof queryParams.limit === 'number') { // Ensure limit is a number for calculation
    // Assuming page is 1-indexed
    queryParams.skip = (params.page - 1) * queryParams.limit;
    delete queryParams.page; // Remove page if skip is calculated
  } else if (params.page) {
    // If limit isn't available to calculate skip, but page is sent,
    // it's better to remove page to avoid potential conflict if skip is also 0 or undefined.
    // Or, ensure a default limit is used for skip calculation if that's desired.
    // For now, just remove page if skip cannot be reliably calculated with a limit.
    delete queryParams.page;
  }


  // The 'upcoming' filter might be a boolean frontend concept.
  // If backend expects specific date ranges or status for "upcoming":
  if (params.upcoming === true) {
    // Backend route has an 'upcoming' boolean flag which filters by date.
    // We will pass it through.
    // We also ensure that if upcoming is true, we are looking for 'scheduled' or 'in_progress' statuses,
    // unless specific statuses were already provided in the params.
    queryParams.status = queryParams.status || 'scheduled,in_progress';
    // queryParams.upcoming = true; // This line is redundant as upcoming is already in queryParams if params.upcoming was true.
                                 // And if params.upcoming was false or undefined, queryParams.upcoming would also be so.
  } else {
    // If params.upcoming is explicitly false or not provided, remove it to avoid sending upcoming=false to backend if not intended.
    delete queryParams.upcoming;
  }


  try {
    const response = await apiFetch(resourceUrl, { params: queryParams });
    // Assuming the API response for a list of trips is an object like:
    // { items: [...trips], total: N, page: N, limit: N }
    // or just an array [...trips]
    // The store or component should handle the exact structure.
    return response;
  } catch (error) {
    console.error('Error in tripService.getTrips:', error.data?.detail || error.message, error);
    // Propagate the error so the store/component can handle it (e.g., show a message to the user)
    throw error;
  }
};

export const getTripById = async (id) => {
  try {
    return await apiFetch(`${resourceUrl}/${id}`);
  } catch (error) {
    console.error(`Error in tripService.getTripById for id ${id}:`, error.data?.detail || error.message, error);
    throw error;
  }
};

export const createTrip = async (tripData) => {
  try {
    return await apiFetch(resourceUrl, {
      method: 'POST',
      body: tripData,
    });
  } catch (error) {
    console.error('Error in tripService.createTrip:', error.data?.detail || error.message, error);
    throw error;
  }
};

export const updateTrip = async (id, tripData) => {
  try {
    return await apiFetch(`${resourceUrl}/${id}`, {
      method: 'PUT',
      body: tripData,
    });
  } catch (error) {
    console.error(`Error in tripService.updateTrip for id ${id}:`, error.data?.detail || error.message, error);
    throw error;
  }
};

export const deleteTrip = async (id) => {
  try {
    return await apiFetch(`${resourceUrl}/${id}`, {
      method: 'DELETE',
    });
  } catch (error) {
    console.error(`Error in tripService.deleteTrip for id ${id}:`, error.data?.detail || error.message, error);
    throw error;
  }
};


// Example of a more specific function if needed, e.g., for fetching seat details
export const getTripSeats = async (tripId) => {
  try {
    return await apiFetch(`${resourceUrl}/${tripId}/seats`);
  } catch (error) {
    console.error(`Error fetching seats for trip ${tripId}:`, error.data?.detail || error.message, error);
    throw error;
  }
};

// If there are other specific trip-related API calls, they can be added here.
// For example, changing trip status, assigning driver/bus, etc.

export default {
  getTrips,
  getTripById,
  createTrip,
  updateTrip,
  deleteTrip,
  getTripSeats,
  // ... any other exported functions
};
