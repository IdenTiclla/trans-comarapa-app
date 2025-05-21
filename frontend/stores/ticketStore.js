import { defineStore } from 'pinia';
import * as ticketService from '~/services/ticketService';

export const useTicketStore = defineStore('tickets', {
  state: () => ({
    tickets: [],
    currentTicket: null,
    isLoading: false,
    error: null,
    // Add pagination state if you re-implement pagination in fetchTickets
    // pagination: {
    //   totalItems: 0,
    //   totalPages: 1,
    //   currentPage: 1,
    //   itemsPerPage: 10,
    // },
  }),
  actions: {
    async fetchTickets(params = {}) { // Pass params for filtering/pagination
      this.isLoading = true;
      this.error = null;
      try {
        // Assuming ticketService.getAllTickets now returns the list directly
        // If it returns an object like { items: [], total: 0 }, adjust accordingly
        const response = await ticketService.getAllTickets(params);
        this.tickets = response; // Adjust if response is { items: [], ... }
        // if (response.items) { 
        //   this.tickets = response.items;
        //   this.pagination.totalItems = response.total;
        //   this.pagination.totalPages = Math.ceil(response.total / params.limit || this.pagination.itemsPerPage);
        //   this.pagination.currentPage = (params.skip / params.limit || 0) + 1;
        // } else {
        //   this.tickets = response; // Fallback if structure is just an array
        // }
      } catch (err) {
        this.error = err.data?.detail || err.message || 'Failed to fetch tickets';
        this.tickets = [];
      } finally {
        this.isLoading = false;
      }
    },

    async fetchTicketById(id) {
      this.isLoading = true;
      this.error = null;
      try {
        this.currentTicket = await ticketService.getTicketById(id);
      } catch (err) {
        this.error = err.data?.detail || err.message || 'Failed to fetch ticket';
        this.currentTicket = null;
      } finally {
        this.isLoading = false;
      }
    },

    async createNewTicket(ticketData) {
      this.isLoading = true;
      this.error = null;
      try {
        const newTicket = await ticketService.createTicket(ticketData);
        await this.fetchTickets(); // Refresh list
        return newTicket;
      } catch (err) {
        this.error = err.data?.detail || err.message || 'Failed to create ticket';
        throw err;
      } finally {
        this.isLoading = false;
      }
    },

    async updateExistingTicket(id, ticketData) {
      this.isLoading = true;
      this.error = null;
      try {
        const updatedTicket = await ticketService.updateTicket(id, ticketData);
        await this.fetchTickets(); // Refresh list
        if (this.currentTicket && this.currentTicket.id === id) {
          this.currentTicket = updatedTicket;
        }
        return updatedTicket;
      } catch (err) {
        this.error = err.data?.detail || err.message || 'Failed to update ticket';
        throw err;
      } finally {
        this.isLoading = false;
      }
    },

    async deleteExistingTicket(id) {
      this.isLoading = true;
      this.error = null;
      try {
        await ticketService.deleteTicket(id);
        await this.fetchTickets(); // Refresh list
        if (this.currentTicket && this.currentTicket.id === id) {
          this.currentTicket = null;
        }
      } catch (err) {
        this.error = err.data?.detail || err.message || 'Failed to delete ticket';
        throw err;
      } finally {
        this.isLoading = false;
      }
    },
    
    async fetchTicketsByTrip(tripId) {
      this.isLoading = true;
      this.error = null;
      try {
        this.tickets = await ticketService.getTicketsByTripId(tripId);
      } catch (err) {
        this.error = err.data?.detail || err.message || 'Failed to fetch tickets for trip';
        this.tickets = [];
      } finally {
        this.isLoading = false;
      }
    },

    // Similar actions for fetchTicketsByClient and fetchTicketsBySeat if needed

    clearCurrentTicket() {
      this.currentTicket = null;
    },

    // Acción para limpiar el error
    clearError() {
      this.error = null;
    }
  },
  getters: {
    // ticketCount: (state) => state.tickets.length,
  }
}); 