import { defineStore } from 'pinia';
import packageService from '~/services/packageService';

export const usePackageStore = defineStore('packages', {
  state: () => ({
    packages: [],
    currentPackage: null,
    currentPackageItems: [],
    isLoading: false,
    isItemsLoading: false,
    error: null,
    pagination: {
      totalItems: 0,
      totalPages: 1,
      currentPage: 1,
      itemsPerPage: 10,
    },
    searchTerm: '',
    searchResults: [],
  }),

  getters: {
    getPackageCount: (state) => state.pagination.totalItems,
    getAllPackages: (state) => state.packages,
    getSearchedPackages: (state) => state.searchResults,
    getCurrentPackageItems: (state) => state.currentPackageItems,
    getCurrentPackageTotal: (state) => {
      return state.currentPackageItems.reduce((total, item) => {
        return total + (item.quantity * item.unit_price);
      }, 0);
    },
    getCurrentPackageItemsCount: (state) => {
      return state.currentPackageItems.reduce((total, item) => total + item.quantity, 0);
    },
  },

  actions: {
    _handleApiResponse(response) {
      // Handle new PackageSummary array response
      if (Array.isArray(response)) {
        this.packages = response;
        this.pagination = {
          totalItems: response.length,
          totalPages: 1,
          currentPage: 1,
          itemsPerPage: response.length > 0 ? response.length : 10,
        };
      } else if (response && typeof response === 'object' && response.packages) {
        // Handle paginated response with packages property
        this.packages = response.packages;
        this.pagination = {
          totalItems: response.pagination?.totalItems || 0,
          totalPages: response.pagination?.totalPages || 1,
          currentPage: response.pagination?.currentPage || 1,
          itemsPerPage: response.pagination?.itemsPerPage || this.pagination.itemsPerPage,
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
          skip: ((params.page || this.pagination.currentPage) - 1) * (params.limit || this.pagination.itemsPerPage),
          limit: params.limit || this.pagination.itemsPerPage,
          status: params.status,
          ...params.filters,
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
        // Set current package items
        if (data.items) {
          this.currentPackageItems = data.items;
        }
      } catch (err) {
        this.error = err.data?.detail || err.message || 'Failed to fetch package details';
      } finally {
        this.isLoading = false;
      }
    },

    async fetchPackageByTrackingNumber(trackingNumber) {
      this.isLoading = true;
      this.error = null;
      this.currentPackage = null;
      try {
        const data = await packageService.getPackageByTrackingNumber(trackingNumber);
        this.currentPackage = data;
        if (data.items) {
          this.currentPackageItems = data.items;
        }
        return data;
      } catch (err) {
        this.error = err.data?.detail || err.message || 'Package not found';
        throw err;
      } finally {
        this.isLoading = false;
      }
    },

    async createNewPackage(packageData) {
      this.isLoading = true;
      this.error = null;
      try {
        // Validate package data
        const validation = packageService.validatePackageData(packageData);
        if (!validation.isValid) {
          throw new Error(validation.errors.join(', '));
        }

        const newPackage = await packageService.createPackage(packageData);
        await this.fetchPackages(); // Refetch to get the latest list with new package
        return newPackage;
      } catch (err) {
        this.error = err.data?.detail || err.message || 'Failed to create package';
        throw err;
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
          this.packages[index] = { ...this.packages[index], ...updatedPackage };
        }
        if (this.currentPackage && this.currentPackage.id === id) {
          this.currentPackage = { ...this.currentPackage, ...updatedPackage };
        }
        return updatedPackage;
      } catch (err) {
        this.error = err.data?.detail || err.message || 'Failed to update package';
        throw err;
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
          this.currentPackageItems = [];
        }
        await this.fetchPackages({ page: this.pagination.currentPage });
      } catch (err) {
        this.error = err.data?.detail || err.message || 'Failed to delete package';
        throw err;
      } finally {
        this.isLoading = false;
      }
    },

    // === PACKAGE ITEMS MANAGEMENT ===

    async fetchPackageItems(packageId) {
      this.isItemsLoading = true;
      this.error = null;
      try {
        const items = await packageService.getPackageItems(packageId);
        this.currentPackageItems = items;
        return items;
      } catch (err) {
        this.error = err.data?.detail || err.message || 'Failed to fetch package items';
        this.currentPackageItems = [];
      } finally {
        this.isItemsLoading = false;
      }
    },

    async addPackageItem(packageId, itemData) {
      this.isItemsLoading = true;
      this.error = null;
      try {
        const newItem = await packageService.addPackageItem(packageId, itemData);
        this.currentPackageItems.push(newItem);
        
        // Update current package totals if available
        if (this.currentPackage && this.currentPackage.id === packageId) {
          this.currentPackage.total_amount = this.getCurrentPackageTotal;
          this.currentPackage.total_items_count = this.getCurrentPackageItemsCount;
        }
        
        return newItem;
      } catch (err) {
        this.error = err.data?.detail || err.message || 'Failed to add package item';
        throw err;
      } finally {
        this.isItemsLoading = false;
      }
    },

    async updatePackageItem(itemId, itemData) {
      this.isItemsLoading = true;
      this.error = null;
      try {
        const updatedItem = await packageService.updatePackageItem(itemId, itemData);
        
        // Update in current items list
        const index = this.currentPackageItems.findIndex(item => item.id === itemId);
        if (index !== -1) {
          this.currentPackageItems[index] = updatedItem;
        }
        
        // Update current package totals if available
        if (this.currentPackage) {
          this.currentPackage.total_amount = this.getCurrentPackageTotal;
          this.currentPackage.total_items_count = this.getCurrentPackageItemsCount;
        }
        
        return updatedItem;
      } catch (err) {
        this.error = err.data?.detail || err.message || 'Failed to update package item';
        throw err;
      } finally {
        this.isItemsLoading = false;
      }
    },

    async deletePackageItem(itemId) {
      this.isItemsLoading = true;
      this.error = null;
      try {
        await packageService.deletePackageItem(itemId);
        
        // Remove from current items list
        this.currentPackageItems = this.currentPackageItems.filter(item => item.id !== itemId);
        
        // Update current package totals if available
        if (this.currentPackage) {
          this.currentPackage.total_amount = this.getCurrentPackageTotal;
          this.currentPackage.total_items_count = this.getCurrentPackageItemsCount;
        }
      } catch (err) {
        this.error = err.data?.detail || err.message || 'Failed to delete package item';
        throw err;
      } finally {
        this.isItemsLoading = false;
      }
    },

    // === FILTERING AND SEARCH ===

    async fetchPackagesByClient(clientId, type = 'sender') {
      this.isLoading = true;
      this.error = null;
      try {
        let packages;
        if (type === 'sender') {
          packages = await packageService.getPackagesBySender(clientId);
        } else {
          packages = await packageService.getPackagesByRecipient(clientId);
        }
        this.packages = packages;
        return packages;
      } catch (err) {
        this.error = err.data?.detail || err.message || `Failed to fetch packages by ${type}`;
        this.packages = [];
      } finally {
        this.isLoading = false;
      }
    },

    async fetchPackagesByTrip(tripId) {
      this.isLoading = true;
      this.error = null;
      try {
        const packages = await packageService.getPackagesByTrip(tripId);
        this.packages = packages;
        return packages;
      } catch (err) {
        this.error = err.data?.detail || err.message || 'Failed to fetch packages by trip';
        this.packages = [];
      } finally {
        this.isLoading = false;
      }
    },

    async searchPackagesByTerm(term) {
      this.isLoading = true;
      this.error = null;
      this.searchTerm = term;
      try {
        if (!term || term.length < 2) {
          this.searchResults = [];
          return;
        }
        
        // Try to search by tracking number
        try {
          const pkg = await packageService.getPackageByTrackingNumber(term);
          this.searchResults = [pkg];
        } catch {
          // If not found by tracking number, return empty results
          this.searchResults = [];
        }
      } catch (err) {
        this.error = err.data?.detail || err.message || 'Failed to search packages';
        this.searchResults = [];
      } finally {
        this.isLoading = false;
      }
    },

    // === UTILITY ACTIONS ===

    calculateItemTotal(item) {
      return item.quantity * item.unit_price;
    },

    generateTrackingNumber() {
      // Generate a tracking number (this could be improved with server-side generation)
      const timestamp = Date.now().toString().slice(-6);
      const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
      return `PKG${timestamp}${random}`;
    },

    createEmptyItem() {
      return {
        quantity: 1,
        description: '',
        unit_price: 0,
      };
    },

    clearCurrentPackage() {
      this.currentPackage = null;
      this.currentPackageItems = [];
    },

    clearSearchResults() {
      this.searchResults = [];
      this.searchTerm = '';
    },

    clearError() {
      this.error = null;
    },

    // Reset store state
    $reset() {
      this.packages = [];
      this.currentPackage = null;
      this.currentPackageItems = [];
      this.isLoading = false;
      this.isItemsLoading = false;
      this.error = null;
      this.pagination = {
        totalItems: 0,
        totalPages: 1,
        currentPage: 1,
        itemsPerPage: 10,
      };
      this.searchTerm = '';
      this.searchResults = [];
    }
  },
}); 