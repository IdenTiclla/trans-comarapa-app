import { defineStore } from 'pinia';
import packageService from '~/services/packageService';

export const usePackageStore = defineStore('packages', {
  state: () => ({
    packages: [],
    unassignedPackages: [],
    currentPackage: null,
    searchResults: [],
    isLoading: false,
    error: null,
    pagination: {
      totalItems: 0,
      totalPages: 1,
      currentPage: 1,
      itemsPerPage: 10
    }
  }),

  getters: {
    getPackageCount: (state) => state.packages.length,
    getAllPackages: (state) => state.packages,
    getUnassignedPackages: (state) => state.unassignedPackages,
    getSearchedPackages: (state) => state.searchResults,
    getCurrentPackageItems: (state) => state.currentPackage?.items || [],
    getCurrentPackageTotal: (state) => {
      if (!state.currentPackage?.items) return 0;
      return state.currentPackage.items.reduce((total, item) => {
        return total + (item.quantity * item.unit_price);
      }, 0);
    },
    getCurrentPackageItemsCount: (state) => {
      if (!state.currentPackage?.items) return 0;
      return state.currentPackage.items.reduce((total, item) => total + item.quantity, 0);
    },
  },

  actions: {
    _handleApiResponse(response) {
      if (!response) {
        throw new Error('Empty response from API');
      }

      if (response.error) {
        throw new Error(response.error);
      }

      // Handle paginated response
      if (response.packages && response.pagination) {
        return {
          data: response.packages,
          pagination: response.pagination
        };
      }

      // Handle array response
      if (Array.isArray(response)) {
        return {
          data: response,
          pagination: {
            totalItems: response.length,
            totalPages: 1,
            currentPage: 1,
            itemsPerPage: response.length
          }
        };
      }

      // Handle single object
      return { data: response };
    },

    async fetchPackages(params = {}) {
      this.isLoading = true;
      this.error = null;

      try {
        const queryParams = {};
        if (params.limit) queryParams.limit = params.limit;
        if (params.skip) queryParams.skip = params.skip;
        if (params.status && params.status !== 'all') queryParams.status = params.status;

        const response = await packageService.getAllPackages(queryParams);
        const processed = this._handleApiResponse(response);

        this.packages = processed.data || [];
        if (processed.pagination) {
          this.pagination = { ...this.pagination, ...processed.pagination };
        }

        return this.packages;
      } catch (error) {
        this.error = error.message || 'Error al cargar encomiendas';
        console.error('Error fetching packages:', error);
        return [];
      } finally {
        this.isLoading = false;
      }
    },

    async fetchUnassignedPackages(params = {}) {
      this.isLoading = true;
      this.error = null;

      try {
        const response = await packageService.getUnassignedPackages(params);
        const processed = this._handleApiResponse(response);
        this.unassignedPackages = processed.data || [];
        return this.unassignedPackages;
      } catch (error) {
        this.error = error.message || 'Error al cargar encomiendas sin asignar';
        console.error('Error fetching unassigned packages:', error);
        return [];
      } finally {
        this.isLoading = false;
      }
    },

    async fetchPackageById(id) {
      this.isLoading = true;
      this.error = null;

      try {
        const response = await packageService.getPackageById(id);
        this.currentPackage = response;
        return response;
      } catch (error) {
        this.error = error.message || 'Error al obtener la encomienda';
        console.error('Error fetching package:', error);
        return null;
      } finally {
        this.isLoading = false;
      }
    },

    async fetchPackageByTrackingNumber(trackingNumber) {
      this.isLoading = true;
      this.error = null;

      try {
        const response = await packageService.getPackageByTrackingNumber(trackingNumber);
        this.currentPackage = response;
        return response;
      } catch (error) {
        this.error = error.message || 'Error al buscar por número de tracking';
        console.error('Error fetching package by tracking:', error);
        return null;
      } finally {
        this.isLoading = false;
      }
    },

    async createNewPackage(packageData) {
      this.isLoading = true;
      this.error = null;

      try {
        const response = await packageService.createPackage(packageData);
        // Add to local list
        if (response && response.id) {
          this.packages.unshift(response);
        }
        return response;
      } catch (error) {
        this.error = error.message || 'Error al crear la encomienda';
        console.error('Error creating package:', error);
        throw error;
      } finally {
        this.isLoading = false;
      }
    },

    async updateExistingPackage(id, packageData) {
      this.isLoading = true;
      this.error = null;

      try {
        const response = await packageService.updatePackage(id, packageData);
        // Update in local list
        const index = this.packages.findIndex(p => p.id === id);
        if (index !== -1) {
          this.packages[index] = { ...this.packages[index], ...response };
        }
        return response;
      } catch (error) {
        this.error = error.message || 'Error al actualizar la encomienda';
        console.error('Error updating package:', error);
        return null;
      } finally {
        this.isLoading = false;
      }
    },

    async deleteExistingPackage(id) {
      this.isLoading = true;
      this.error = null;

      try {
        await packageService.deletePackage(id);
        this.packages = this.packages.filter(p => p.id !== id);
        return true;
      } catch (error) {
        this.error = error.message || 'Error al eliminar la encomienda';
        console.error('Error deleting package:', error);
        return false;
      } finally {
        this.isLoading = false;
      }
    },

    // === TRIP ASSIGNMENT ===

    async assignToTrip(packageId, tripId) {
      this.error = null;

      try {
        const response = await packageService.assignPackageToTrip(packageId, tripId);

        // Update in local lists
        const index = this.packages.findIndex(p => p.id === packageId);
        if (index !== -1) {
          this.packages[index] = { ...this.packages[index], status: 'assigned_to_trip', trip_id: tripId };
        }

        // Remove from unassigned list
        this.unassignedPackages = this.unassignedPackages.filter(p => p.id !== packageId);

        return response;
      } catch (error) {
        this.error = error.message || 'Error al asignar encomienda al viaje';
        console.error('Error assigning package to trip:', error);
        throw error;
      }
    },

    async unassignFromTrip(packageId) {
      this.error = null;

      try {
        const response = await packageService.unassignPackageFromTrip(packageId);

        // Update in local lists
        const index = this.packages.findIndex(p => p.id === packageId);
        if (index !== -1) {
          this.packages[index] = { ...this.packages[index], status: 'registered_at_office', trip_id: null };
        }

        return response;
      } catch (error) {
        this.error = error.message || 'Error al desasignar encomienda del viaje';
        console.error('Error unassigning package from trip:', error);
        throw error;
      }
    },

    async updateStatus(packageId, newStatus, changedByUserId = null) {
      this.error = null;

      try {
        const response = await packageService.updatePackageStatus(packageId, newStatus, changedByUserId);

        // Update in local list
        const index = this.packages.findIndex(p => p.id === packageId);
        if (index !== -1) {
          this.packages[index] = { ...this.packages[index], status: newStatus };
        }

        return response;
      } catch (error) {
        this.error = error.message || 'Error al actualizar estado de la encomienda';
        console.error('Error updating package status:', error);
        throw error;
      }
    },

    // === PACKAGE ITEMS MANAGEMENT ===

    async fetchPackageItems(packageId) {
      try {
        const items = await packageService.getPackageItems(packageId);
        if (this.currentPackage && this.currentPackage.id === packageId) {
          this.currentPackage.items = items;
        }
        return items;
      } catch (error) {
        console.error('Error fetching package items:', error);
        return [];
      }
    },

    async addPackageItem(packageId, itemData) {
      try {
        const newItem = await packageService.addPackageItem(packageId, itemData);
        if (this.currentPackage && this.currentPackage.id === packageId) {
          if (!this.currentPackage.items) this.currentPackage.items = [];
          this.currentPackage.items.push(newItem);
        }
        return newItem;
      } catch (error) {
        console.error('Error adding package item:', error);
        throw error;
      }
    },

    async updatePackageItem(itemId, itemData) {
      try {
        const updatedItem = await packageService.updatePackageItem(itemId, itemData);
        if (this.currentPackage && this.currentPackage.items) {
          const index = this.currentPackage.items.findIndex(i => i.id === itemId);
          if (index !== -1) {
            this.currentPackage.items[index] = updatedItem;
          }
        }
        return updatedItem;
      } catch (error) {
        console.error('Error updating package item:', error);
        throw error;
      }
    },

    async deletePackageItem(itemId) {
      try {
        await packageService.deletePackageItem(itemId);
        if (this.currentPackage && this.currentPackage.items) {
          this.currentPackage.items = this.currentPackage.items.filter(i => i.id !== itemId);
        }
        return true;
      } catch (error) {
        console.error('Error deleting package item:', error);
        throw error;
      }
    },

    // === FILTERING AND SEARCH ===

    async fetchPackagesByTrip(tripId) {
      try {
        const response = await packageService.getPackagesByTrip(tripId);
        return Array.isArray(response) ? response : [];
      } catch (error) {
        console.error('Error fetching packages by trip:', error);
        return [];
      }
    },

    async fetchPackagesByClient(clientId, type = 'sender') {
      try {
        const response = type === 'sender'
          ? await packageService.getPackagesBySender(clientId)
          : await packageService.getPackagesByRecipient(clientId);
        return Array.isArray(response) ? response : [];
      } catch (error) {
        console.error('Error fetching packages by client:', error);
        return [];
      }
    },

    async searchPackagesByTerm(term) {
      this.isLoading = true;
      this.error = null;
      try {
        const results = await packageService.searchPackages(term);
        this.searchResults = results;
        return results;
      } catch (error) {
        this.error = error.message || 'Error en la búsqueda';
        return [];
      } finally {
        this.isLoading = false;
      }
    },
    // === ASSIGNMENT & STATUS ACTIONS ===

    async fetchUnassignedPackages() {
      this.isLoading = true;
      this.error = null;
      try {
        const packages = await packageService.getUnassignedPackages();
        this.unassignedPackages = Array.isArray(packages) ? packages : [];
        return this.unassignedPackages;
      } catch (err) {
        this.error = err.data?.detail || err.message || 'Failed to fetch unassigned packages';
        this.unassignedPackages = [];
      } finally {
        this.isLoading = false;
      }
    },

    async assignToTrip(packageId, tripId) {
      this.error = null;
      try {
        const result = await packageService.assignPackageToTrip(packageId, tripId);
        // Remove from unassigned list
        this.unassignedPackages = this.unassignedPackages.filter(p => p.id !== packageId);
        return result;
      } catch (err) {
        this.error = err.data?.detail || err.message || 'Failed to assign package to trip';
        throw err;
      }
    },

    async unassignFromTrip(packageId) {
      this.error = null;
      try {
        const result = await packageService.unassignPackageFromTrip(packageId);
        return result;
      } catch (err) {
        this.error = err.data?.detail || err.message || 'Failed to unassign package from trip';
        throw err;
      }
    },

    async updateStatus(packageId, newStatus, changedByUserId = null) {
      this.error = null;
      try {
        const result = await packageService.updatePackageStatus(packageId, newStatus, changedByUserId);
        // Update in local list if present
        const index = this.packages.findIndex(p => p.id === packageId);
        if (index !== -1) {
          this.packages[index] = { ...this.packages[index], status: newStatus };
        }
        if (this.currentPackage && this.currentPackage.id === packageId) {
          this.currentPackage.status = newStatus;
        }
        return result;
      } catch (err) {
        this.error = err.data?.detail || err.message || 'Failed to update package status';
        throw err;
      }
    },

    // === UTILITY ACTIONS ===

    calculateItemTotal(item) {
      return (item.quantity || 0) * (item.unit_price || 0);
    },

    generateTrackingNumber() {
      const timestamp = Date.now().toString().slice(-6);
      const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
      return `${timestamp}${random}`;
    },

    createEmptyItem() {
      return {
        quantity: 1,
        description: '',
        unit_price: 0,
        total_price: 0
      };
    },

    clearCurrentPackage() {
      this.currentPackage = null;
    },

    clearSearchResults() {
      this.searchResults = [];
    },

    clearError() {
      this.error = null;
    },

    // Reset store state
    $reset() {
      this.packages = [];
      this.unassignedPackages = [];
      this.currentPackage = null;
      this.searchResults = [];
      this.isLoading = false;
      this.error = null;
      this.pagination = {
        totalItems: 0,
        totalPages: 1,
        currentPage: 1,
        itemsPerPage: 10
      };
    }
  },
}); 