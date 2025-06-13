import { defineStore } from 'pinia';
import clientService from '~/services/clientService';

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
        const response = await clientService.getClients(); 
        // Map API response to frontend expected format
        this.clients = response.map(client => this._mapClientData(client));
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
        const client = await clientService.getClientById(id);
        this.currentClient = this._mapClientData(client);
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
        const mappedClient = this._mapClientData(newClient);
        // await this.fetchClients(); // Optionally refetch, or add to list locally if preferred
        this.clients.push(mappedClient); // Add to local list for immediate reactivity if useful
        return mappedClient; 
      } catch (err) {
        this.error = err.data?.detail || err.response?.data?.detail || err.message || 'Failed to create client';
        throw err; 
      } finally {
        this.isLoading = false;
      }
    },

    async updateClient(id, clientData) {
      this.isLoading = true;
      this.error = null;
      try {
        const updatedClient = await clientService.updateClient(id, clientData);
        const mappedClient = this._mapClientData(updatedClient);
        const index = this.clients.findIndex(c => c.id === id);
        if (index !== -1) {
          this.clients[index] = mappedClient;
        }
        if (this.currentClient && this.currentClient.id === id) {
          this.currentClient = mappedClient;
        }
        // Also update in searchResults if present
        const searchIndex = this.searchResults.findIndex(c => c.id === id);
        if (searchIndex !== -1) {
            this.searchResults[searchIndex] = mappedClient;
        }
        return mappedClient;
      } catch (err) {
        this.error = err.data?.detail || err.response?.data?.detail || err.message || 'Failed to update client';
        throw err;
      } finally {
        this.isLoading = false;
      }
    },

    // Alias for backward compatibility
    async updateExistingClient(id, clientData) {
      return await this.updateClient(id, clientData);
    },

    async deleteClient(id) {
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

    // Alias for backward compatibility
    async deleteExistingClient(id) {
      return await this.deleteClient(id);
    },

    // Helper to map client data for consistent structure in search results
    _mapClientData(client) {
        return {
            id: client.id,
            // Construct name from firstname and lastname
            name: client.name || (`${client.firstname || ''} ${client.lastname || ''}`).trim() || 'Sin nombre',
            ci: client.ci || client.document_id || 'Sin CI',
            phone: client.phone || 'Sin teléfono',
            email: client.email || '',
            // Include original API fields for compatibility
            firstname: client.firstname,
            lastname: client.lastname,
            document_id: client.document_id,
            birth_date: client.birth_date,
            is_minor: client.is_minor,
            address: client.address,
            city: client.city,
            state: client.state,
            created_at: client.created_at,
            updated_at: client.updated_at,
            // Additional computed fields
            age: client.birth_date ? new Date().getFullYear() - new Date(client.birth_date).getFullYear() : null,
            location: client.city && client.state ? `${client.city}, ${client.state}` : (client.city || client.state || 'Sin ubicación'),
            status: 'active' // Default status since API doesn't provide it
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
    clientCount: (state) => state.clients.length,
    activeClients: (state) => state.clients.filter(c => c.status === 'active'),
    newClientsToday: (state) => {
      const today = new Date().toDateString();
      return state.clients.filter(c => {
        if (!c.created_at) return false;
        const clientDate = new Date(c.created_at).toDateString();
        return clientDate === today;
      });
    },
    clientsByCity: (state) => {
      const cities = {};
      state.clients.forEach(client => {
        const city = client.city || 'Sin ciudad';
        cities[city] = (cities[city] || 0) + 1;
      });
      return cities;
    }
  }
}); 