import apiFetch from '~/utils/api';

const resourceUrl = '/tickets';

export const getAllTickets = async (params = {}) => {
  // params could include trip_id, client_id, seat_id, or pagination
  try {
    return await apiFetch(resourceUrl, { params });
  } catch (error) {
    console.error('Error in ticketService.getAllTickets:', error.data?.detail || error.message);
    throw error;
  }
};

export const getTicketById = async (id) => {
  try {
    return await apiFetch(`${resourceUrl}/${id}`);
  } catch (error) {
    console.error(`Error in ticketService.getTicketById for id ${id}:`, error.data?.detail || error.message);
    throw error;
  }
};

export const createTicket = async (ticketData) => {
  try {
    return await apiFetch(resourceUrl, {
      method: 'POST',
      body: ticketData,
    });
  } catch (error) {
    console.error('Error in ticketService.createTicket:', error.data?.detail || error.message);
    throw error;
  }
};

export const updateTicket = async (id, ticketData) => {
  try {
    return await apiFetch(`${resourceUrl}/${id}`, {
      method: 'PUT',
      body: ticketData,
    });
  } catch (error) {
    console.error(`Error in ticketService.updateTicket for id ${id}:`, error.data?.detail || error.message);
    throw error;
  }
};

export const deleteTicket = async (id) => {
  try {
    return await apiFetch(`${resourceUrl}/${id}`, {
      method: 'DELETE',
    });
  } catch (error) {
    console.error(`Error in ticketService.deleteTicket for id ${id}:`, error.data?.detail || error.message);
    throw error;
  }
};

// Specific fetchers based on backend README
export const getTicketsByTripId = async (tripId) => {
  try {
    return await apiFetch(`${resourceUrl}/trip/${tripId}`);
  } catch (error) {
    console.error(`Error in ticketService.getTicketsByTripId for trip ${tripId}:`, error.data?.detail || error.message);
    throw error;
  }
};

export const getTicketsByClientId = async (clientId) => {
  try {
    return await apiFetch(`${resourceUrl}/client/${clientId}`);
  } catch (error) {
    console.error(`Error in ticketService.getTicketsByClientId for client ${clientId}:`, error.data?.detail || error.message);
    throw error;
  }
};

export const getTicketsBySeatId = async (seatId) => {
  try {
    return await apiFetch(`${resourceUrl}/seat/${seatId}`);
  } catch (error) {
    console.error(`Error in ticketService.getTicketsBySeatId for seat ${seatId}:`, error.data?.detail || error.message);
    throw error;
  }
};

// Change seat assignment for a ticket
export const changeSeat = async (ticketId, newSeatId) => {
  try {
    return await apiFetch(`${resourceUrl}/${ticketId}/change-seat/${newSeatId}`, {
      method: 'PUT',
    });
  } catch (error) {
    console.error(`Error in ticketService.changeSeat for ticket ${ticketId} to seat ${newSeatId}:`, error.data?.detail || error.message);
    throw error;
  }
};

// Confirm sale of a reserved ticket (change state from 'pending' to 'confirmed')
export const confirmSale = async (ticketId) => {
  try {
    return await apiFetch(`${resourceUrl}/${ticketId}`, {
      method: 'PUT',
      body: {
        state: 'confirmed'
      }
    });
  } catch (error) {
    console.error(`Error in ticketService.confirmSale for ticket ${ticketId}:`, error.data?.detail || error.message);
    throw error;
  }
};
