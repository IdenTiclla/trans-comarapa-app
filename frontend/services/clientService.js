import apiFetch from '~/utils/api';

const resourceUrl = '/clients';

// Obtener todos los clientes
const getClients = async (filters = {}, pagination = { page: 1, itemsPerPage: 10 }) => {
  try {
    return await apiFetch(resourceUrl, {
      params: {
        ...filters,
        skip: ((pagination.page - 1) * pagination.itemsPerPage).toString(),
        limit: pagination.itemsPerPage.toString()
      }
    });
  } catch (error) {
    console.error('Error in clientService.getClients:', error.data?.detail || error.message);
    throw error;
  }
};

// Buscar clientes por término de búsqueda
const searchClients = async (searchTerm) => {
  try {
    return await apiFetch(`${resourceUrl}/search`, {
      params: {
        q: searchTerm
      }
    });
  } catch (error) {
    console.error('Error in clientService.searchClients:', error.data?.detail || error.message);
    throw error;
  }
};

// Obtener un cliente por ID
const getClientById = async (id) => {
  try {
    return await apiFetch(`${resourceUrl}/${id}`);
  } catch (error) {
    console.error(`Error in clientService.getClientById for id ${id}:`, error.data?.detail || error.message);
    throw error;
  }
};

// Crear un nuevo cliente
const createClient = async (clientData) => {
  try {
    return await apiFetch(resourceUrl, {
      method: 'POST',
      body: clientData,
    });
  } catch (error) {
    console.error('Error in clientService.createClient:', error.data?.detail || error.message);
    throw error;
  }
};

// Actualizar un cliente existente
const updateClient = async (id, clientData) => {
  try {
    return await apiFetch(`${resourceUrl}/${id}`, {
      method: 'PUT',
      body: clientData,
    });
  } catch (error) {
    console.error(`Error in clientService.updateClient for id ${id}:`, error.data?.detail || error.message);
    throw error;
  }
};

const deleteClient = async (id) => {
  try {
    return await apiFetch(`${resourceUrl}/${id}`, {
      method: 'DELETE',
    });
  } catch (error) {
    console.error(`Error in clientService.deleteClient for id ${id}:`, error.data?.detail || error.message);
    throw error;
  }
};

export default {
  getClients,
  searchClients,
  getClientById,
  createClient,
  updateClient,
  deleteClient
}
