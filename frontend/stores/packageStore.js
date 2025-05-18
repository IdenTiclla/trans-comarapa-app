import { defineStore } from 'pinia';
import packageService from '~/services/packageService';

export const usePackageStore = defineStore('packages', {
  state: () => ({
    packages: [],
    currentPackage: null,
    isLoading: false,
    error: null,
    pagination: {
      totalItems: 0,
      totalPages: 1,
      currentPage: 1,
      itemsPerPage: 10, // Default, can be adjusted
    },
    searchTerm: '',
    searchResults: [],
  }),

  getters: {
    getPackageCount: (state) => state.pagination.totalItems,
    getAllPackages: (state) => state.packages,
    getSearchedPackages: (state) => state.searchResults,
  },

  actions: {
    _handleApiResponse(response) {
      // Assuming response is { items: [], total: number, page: number, pages: number, size: number }
      // Or a simple array for non-paginated results
      if (Array.isArray(response)) {
        this.packages = response;
        // Reset pagination for simple array responses or handle as non-paginated
        this.pagination = {
            totalItems: response.length,
            totalPages: 1,
            currentPage: 1,
            itemsPerPage: response.length > 0 ? response.length : 10,
        };
      } else if (response && typeof response === 'object' && response.items) {
        this.packages = response.items;
        this.pagination = {
          totalItems: response.total || 0,
          totalPages: response.pages || 1,
          currentPage: response.page || 1,
          itemsPerPage: response.size || this.pagination.itemsPerPage,
        };
      } else {
        // Handle unexpected response structure
        this.packages = [];
        console.warn('Unexpected API response structure for packages:', response);
      }
    },

    async fetchPackages(params = {}) {
      this.isLoading = true;
      this.error = null;
      try {
        const queryParams = { 
          page: params.page || this.pagination.currentPage,
          limit: params.limit || this.pagination.itemsPerPage,
          ...params.filters, // Allow additional filters like status, sender_id etc.
          sortBy: params.sortBy, // e.g., 'createdAt:desc'
        };
        const response = await packageService.getAllPackages(queryParams);
        this._handleApiResponse(response);
      } catch (err) {
        this.error = err.data?.detail || err.message || 'Failed to fetch packages';
        this.packages = [];
      } finally {
        this.isLoading = false;
      }
    },

    async fetchPackageById(id) {
      this.isLoading = true;
      this.error = null;
      this.currentPackage = null;
      try {
        const data = await packageService.getPackageById(id);
        this.currentPackage = data;
      } catch (err) {
        this.error = err.data?.detail || err.message || 'Failed to fetch package details';
      } finally {
        this.isLoading = false;
      }
    },

    async createNewPackage(packageData) {
      this.isLoading = true;
      this.error = null;
      try {
        const newPackage = await packageService.createPackage(packageData);
        // Optionally, add to state or refetch list
        // this.packages.unshift(newPackage); // Add to beginning
        await this.fetchPackages(); // Refetch to get the latest list with new package
        return newPackage; // Return the created package for immediate use
      } catch (err) {
        this.error = err.data?.detail || err.message || 'Failed to create package';
        throw err; // Re-throw for component to handle
      } finally {
        this.isLoading = false;
      }
    },

    async updateExistingPackage(id, packageData) {
      this.isLoading = true;
      this.error = null;
      try {
        const updatedPackage = await packageService.updatePackage(id, packageData);
        // Update in local list if present
        const index = this.packages.findIndex(p => p.id === id);
        if (index !== -1) {
          this.packages[index] = updatedPackage;
        }
        if (this.currentPackage && this.currentPackage.id === id) {
          this.currentPackage = updatedPackage;
        }
        return updatedPackage;
      } catch (err) {
        this.error = err.data?.detail || err.message || 'Failed to update package';
        throw err; // Re-throw for component to handle
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
        if (this.currentPackage && this.currentPackage.id === id) {
          this.currentPackage = null;
        }
        // Adjust pagination if needed, or simply refetch
        await this.fetchPackages({ page: this.pagination.currentPage });
      } catch (err) {
        this.error = err.data?.detail || err.message || 'Failed to delete package';
        throw err; // Re-throw for component to handle
      } finally {
        this.isLoading = false;
      }
    },

    async searchPackagesByTerm(term) {
      this.isLoading = true;
      this.error = null;
      this.searchTerm = term;
      try {
        if (!term || term.length < 2) { // Basic validation for search term
            this.searchResults = [];
            return;
        }
        const response = await packageService.searchPackages(term);
        // Assuming searchPackages might return a simple array or a paginated structure
        if (Array.isArray(response)) {
            this.searchResults = response;
        } else if (response && response.items) {
            this.searchResults = response.items;
            // Optionally handle pagination for search results too
        } else {
            this.searchResults = [];
        }
      } catch (err) {
        this.error = err.data?.detail || err.message || 'Failed to search packages';
        this.searchResults = [];
      } finally {
        this.isLoading = false;
      }
    },

    clearCurrentPackage() {
      this.currentPackage = null;
    },

    clearError() {
      this.error = null;
    }
  },
}); 