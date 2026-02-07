import apiFetch from '~/utils/api';

const resourceUrl = '/buses';

export const getAllBuses = async (params = {}) => {
  try {
    return await apiFetch(resourceUrl, { params });
  } catch (error) {
    console.error('Error in busService.getAllBuses:', error.data?.detail || error.message);
    throw error;
  }
};

export const getBusById = async (id) => {
  try {
    return await apiFetch(`${resourceUrl}/${id}`);
  } catch (error) {
    console.error(`Error in busService.getBusById for id ${id}:`, error.data?.detail || error.message);
    throw error;
  }
};

export const createBus = async (busData) => {
  try {
    return await apiFetch(resourceUrl, {
      method: 'POST',
      body: busData,
    });
  } catch (error) {
    console.error('Error in busService.createBus:', error.data?.detail || error.message);
    throw error;
  }
};

export const updateBus = async (id, busData) => {
  try {
    return await apiFetch(`${resourceUrl}/${id}`, {
      method: 'PUT',
      body: busData,
    });
  } catch (error) {
    console.error(`Error in busService.updateBus for id ${id}:`, error.data?.detail || error.message);
    throw error;
  }
};

export const deleteBus = async (id) => {
  try {
    return await apiFetch(`${resourceUrl}/${id}`, {
      method: 'DELETE',
    });
  } catch (error) {
    console.error(`Error in busService.deleteBus for id ${id}:`, error.data?.detail || error.message);
    throw error;
  }
};

export const getBusSeats = async (busId) => {
  try {
    return await apiFetch(`${resourceUrl}/${busId}/seats`);
  } catch (error) {
    console.error(`Error in busService.getBusSeats for busId ${busId}:`, error.data?.detail || error.message);
    throw error;
  }
};

export const createBusWithSeats = async (busData) => {
  try {
    return await apiFetch(`${resourceUrl}/with-seats`, {
      method: 'POST',
      body: busData,
    });
  } catch (error) {
    console.error('Error in busService.createBusWithSeats:', error.data?.detail || error.message);
    throw error;
  }
};

export const updateBusSeats = async (busId, seats) => {
  try {
    return await apiFetch(`${resourceUrl}/${busId}/seats`, {
      method: 'PUT',
      body: seats,
    });
  } catch (error) {
    console.error(`Error in busService.updateBusSeats for busId ${busId}:`, error.data?.detail || error.message);
    throw error;
  }
}; 