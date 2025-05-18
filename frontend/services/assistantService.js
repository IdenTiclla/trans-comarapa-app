import apiFetch from '~/utils/api';

const resourceUrl = '/assistants';

export const getAllAssistants = async (params = {}) => {
  try {
    return await apiFetch(resourceUrl, { params });
  } catch (error) {
    console.error('Error in assistantService.getAllAssistants:', error.data?.detail || error.message);
    throw error;
  }
};

export const getAssistantById = async (id) => {
  try {
    return await apiFetch(`${resourceUrl}/${id}`);
  } catch (error) {
    console.error(`Error in assistantService.getAssistantById for id ${id}:`, error.data?.detail || error.message);
    throw error;
  }
};

export const createAssistant = async (assistantData) => {
  try {
    return await apiFetch(resourceUrl, {
      method: 'POST',
      body: assistantData,
    });
  } catch (error) {
    console.error('Error in assistantService.createAssistant:', error.data?.detail || error.message);
    throw error;
  }
};

export const updateAssistant = async (id, assistantData) => {
  try {
    return await apiFetch(`${resourceUrl}/${id}`, {
      method: 'PUT',
      body: assistantData,
    });
  } catch (error) {
    console.error(`Error in assistantService.updateAssistant for id ${id}:`, error.data?.detail || error.message);
    throw error;
  }
};

export const deleteAssistant = async (id) => {
  try {
    return await apiFetch(`${resourceUrl}/${id}`, {
      method: 'DELETE',
    });
  } catch (error) {
    console.error(`Error in assistantService.deleteAssistant for id ${id}:`, error.data?.detail || error.message);
    throw error;
  }
}; 