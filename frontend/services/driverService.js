import apiFetch from '~/utils/api';

const resourceUrl = '/drivers';

export const getAllDrivers = async (params = {}) => {
  try {
    return await apiFetch(resourceUrl, { params });
  } catch (error) {
    console.error('Error in driverService.getAllDrivers:', error.data?.detail || error.message);
    throw error;
  }
};

export const getDriverById = async (id) => {
  try {
    return await apiFetch(`${resourceUrl}/${id}`);
  } catch (error) {
    console.error(`Error in driverService.getDriverById for id ${id}:`, error.data?.detail || error.message);
    throw error;
  }
};

export const createDriver = async (driverData) => {
  try {
    return await apiFetch(resourceUrl, {
      method: 'POST',
      body: driverData,
    });
  } catch (error) {
    console.error('Error in driverService.createDriver:', error.data?.detail || error.message);
    throw error;
  }
};

export const updateDriver = async (id, driverData) => {
  try {
    return await apiFetch(`${resourceUrl}/${id}`, {
      method: 'PUT',
      body: driverData,
    });
  } catch (error) {
    console.error(`Error in driverService.updateDriver for id ${id}:`, error.data?.detail || error.message);
    throw error;
  }
};

export const deleteDriver = async (id) => {
  try {
    return await apiFetch(`${resourceUrl}/${id}`, {
      method: 'DELETE',
    });
  } catch (error) {
    console.error(`Error in driverService.deleteDriver for id ${id}:`, error.data?.detail || error.message);
    throw error;
  }
}; 