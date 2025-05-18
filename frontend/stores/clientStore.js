import { defineStore } from 'pinia';
import * as clientService from '~/services/clientService';

export const useClientStore = defineStore('clients', {
  state: () => ({
    clients: [],
    currentClient: null,
    searchResults: [], // Added for client search results
    isLoading: false,
    error: null,
    // pagination: {
    //   totalItems: 0,
    //   totalPages: 1,
    //   currentPage: 1,
    //   itemsPerPage: 10, // Default
    // },
  }),
  actions: {
    async fetchClients() { // Add params for pagination/filters if needed
      this.isLoading = true;
      this.error = null;
      try {
        const response = await clientService.getAllClients(); 
        this.clients = response; 
      } catch (err) {
        this.error = err.data?.detail || err.message || 'Failed to fetch clients';
        this.clients = [];
      } finally {
        this.isLoading = false;
      }
    },

    async fetchClientById(id) {
      this.isLoading = true;
      this.error = null;
      try {
        this.currentClient = await clientService.getClientById(id);
      } catch (err) {
        this.error = err.data?.detail || err.message || 'Failed to fetch client';
        this.currentClient = null;
      } finally {
        this.isLoading = false;
      }
    },

    // Renamed from createNewClient for consistency
    async createClient(clientData) { 
      this.isLoading = true;
      this.error = null;
      try {
        // The component sends: firstname, lastname, document_id, phone, email
        // Ensure clientService.createClient expects these or adapt here.
        const newClient = await clientService.createClient(clientData);
        // await this.fetchClients(); // Optionally refetch, or add to list locally if preferred
        this.clients.push(newClient); // Add to local list for immediate reactivity if useful
        return newClient; 
      } catch (err) {
        this.error = err.data?.detail || err.response?.data?.detail || err.message || 'Failed to create client';
        throw err; 
      } finally {
        this.isLoading = false;
      }
    },

    async updateExistingClient(id, clientData) {
      this.isLoading = true;
      this.error = null;
      try {
        const updatedClient = await clientService.updateClient(id, clientData);
        const index = this.clients.findIndex(c => c.id === id);
        if (index !== -1) {
          this.clients[index] = updatedClient;
        }
        if (this.currentClient && this.currentClient.id === id) {
          this.currentClient = updatedClient;
        }
        // Also update in searchResults if present
        const searchIndex = this.searchResults.findIndex(c => c.id === id);
        if (searchIndex !== -1) {
            this.searchResults[searchIndex] = this._mapClientData(updatedClient); // Use mapper
        }
        return updatedClient;
      } catch (err) {
        this.error = err.data?.detail || err.response?.data?.detail || err.message || 'Failed to update client';
        throw err;
      } finally {
        this.isLoading = false;
      }
    },

    async deleteExistingClient(id) {
      this.isLoading = true;
      this.error = null;
      try {
        await clientService.deleteClient(id);
        this.clients = this.clients.filter(c => c.id !== id);
        if (this.currentClient && this.currentClient.id === id) {
          this.currentClient = null; 
        }
        this.searchResults = this.searchResults.filter(c => c.id !== id);
      } catch (err) {
        this.error = err.data?.detail || err.response?.data?.detail || err.message || 'Failed to delete client';
        throw err;
      } finally {
        this.isLoading = false;
      }
    },

    // Helper to map client data for consistent structure in search results
    _mapClientData(client) {
        return {
            id: client.id,
            // Attempt to construct name, fallback to what's available
            name: client.name || (`${client.firstname || ''} ${client.lastname || ''}`).trim() || 'Sin nombre',
            ci: client.ci || client.document_id || 'Sin CI',
            phone: client.phone || 'Sin teléfono',
            email: client.email || ''
            // include all fields that might be useful for the component displaying search results
        };
    },

    async searchClients(term) {
      this.isLoading = true;
      this.error = null;
      this.searchResults = [];
      if (!term || term.length < 2) { // Basic validation for search term
        this.isLoading = false;
        return;
      }
      try {
        const clients = await clientService.searchClients(term);
        this.searchResults = clients.map(client => this._mapClientData(client));
      } catch (err) {
        this.error = err.data?.detail || err.response?.data?.detail || err.message || 'Failed to search clients';
        this.searchResults = [];
      } finally {
        this.isLoading = false;
      }
    },

    clearSearchResults() {
      this.searchResults = [];
      // this.error = null; // Optionally clear error specific to search
    },

    clearError() {
      this.error = null;
    },

    clearCurrentClient() {
      this.currentClient = null;
    }
  },
  getters: {
    // Example getter
    // clientCount: (state) => state.clients.length,
  }
}); 