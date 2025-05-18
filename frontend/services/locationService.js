import apiFetch from '~/utils/api';

const resourceUrl = '/locations';

export const getAllLocations = async (params = {}) => {
  try {
    return await apiFetch(resourceUrl, { params });
  } catch (error) {
    console.error('Error in locationService.getAllLocations:', error.data?.detail || error.message);
    throw error;
  }
};

export const getLocationById = async (id) => {
  try {
    return await apiFetch(`${resourceUrl}/${id}`);
  } catch (error) {
    console.error(`Error in locationService.getLocationById for id ${id}:`, error.data?.detail || error.message);
    throw error;
  }
};

export const createLocation = async (locationData) => {
  try {
    return await apiFetch(resourceUrl, {
      method: 'POST',
      body: locationData,
    });
  } catch (error) {
    console.error('Error in locationService.createLocation:', error.data?.detail || error.message);
    throw error;
  }
};

export const updateLocation = async (id, locationData) => {
  try {
    return await apiFetch(`${resourceUrl}/${id}`, {
      method: 'PUT',
      body: locationData,
    });
  } catch (error) {
    console.error(`Error in locationService.updateLocation for id ${id}:`, error.data?.detail || error.message);
    throw error;
  }
};

export const deleteLocation = async (id) => {
  try {
    return await apiFetch(`${resourceUrl}/${id}`, {
      method: 'DELETE',
    });
  } catch (error) {
    console.error(`Error in locationService.deleteLocation for id ${id}:`, error.data?.detail || error.message);
    throw error;
  }
}; 