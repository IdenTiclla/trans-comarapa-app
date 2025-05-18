import apiFetch from '~/utils/api';

const resourceUrl = '/routes';

export const getAllRoutes = async (params = {}) => {
  // params could include filters or pagination
  try {
    return await apiFetch(resourceUrl, { params });
  } catch (error) {
    console.error('Error in routeService.getAllRoutes:', error.data?.detail || error.message);
    throw error;
  }
};

export const getRouteById = async (id) => {
  try {
    return await apiFetch(`${resourceUrl}/${id}`);
  } catch (error) {
    console.error(`Error in routeService.getRouteById for id ${id}:`, error.data?.detail || error.message);
    throw error;
  }
};

export const createRoute = async (routeData) => {
  try {
    return await apiFetch(resourceUrl, {
      method: 'POST',
      body: routeData,
    });
  } catch (error) {
    console.error('Error in routeService.createRoute:', error.data?.detail || error.message);
    throw error;
  }
};

export const updateRoute = async (id, routeData) => {
  try {
    return await apiFetch(`${resourceUrl}/${id}`, {
      method: 'PUT',
      body: routeData,
    });
  } catch (error) {
    console.error(`Error in routeService.updateRoute for id ${id}:`, error.data?.detail || error.message);
    throw error;
  }
};

export const deleteRoute = async (id) => {
  try {
    return await apiFetch(`${resourceUrl}/${id}`, {
      method: 'DELETE',
    });
  } catch (error) {
    console.error(`Error in routeService.deleteRoute for id ${id}:`, error.data?.detail || error.message);
    throw error;
  }
};

export const searchRoutes = async (origin, destination) => {
  try {
    return await apiFetch(`${resourceUrl}/search`, { 
      params: { origin, destination }
    });
  } catch (error) {
    console.error('Error in routeService.searchRoutes:', error.data?.detail || error.message);
    throw error;
  }
}; 