import { defineStore } from 'pinia';
import * as locationService from '~/services/locationService';

export const useLocationStore = defineStore('locations', {
  state: () => ({
    locations: [],
    currentLocation: null,
    isLoading: false,
    error: null,
  }),
  actions: {
    async fetchLocations(params = {}) {
      this.isLoading = true;
      this.error = null;
      try {
        this.locations = await locationService.getAllLocations(params);
      } catch (err) {
        this.error = err.data?.detail || err.message || 'Failed to fetch locations';
        this.locations = [];
      } finally {
        this.isLoading = false;
      }
    },

    async fetchLocationById(id) {
      this.isLoading = true;
      this.error = null;
      try {
        this.currentLocation = await locationService.getLocationById(id);
      } catch (err) {
        this.error = err.data?.detail || err.message || 'Failed to fetch location';
        this.currentLocation = null;
      } finally {
        this.isLoading = false;
      }
    },

    async createNewLocation(locationData) {
      this.isLoading = true;
      this.error = null;
      try {
        const newLocation = await locationService.createLocation(locationData);
        await this.fetchLocations(); // Refresh list
        return newLocation;
      } catch (err) {
        this.error = err.data?.detail || err.message || 'Failed to create location';
        throw err;
      } finally {
        this.isLoading = false;
      }
    },

    async updateExistingLocation(id, locationData) {
      this.isLoading = true;
      this.error = null;
      try {
        const updatedLocation = await locationService.updateLocation(id, locationData);
        await this.fetchLocations(); // Refresh list
        if (this.currentLocation && this.currentLocation.id === id) {
          this.currentLocation = updatedLocation;
        }
        return updatedLocation;
      } catch (err) {
        this.error = err.data?.detail || err.message || 'Failed to update location';
        throw err;
      } finally {
        this.isLoading = false;
      }
    },

    async deleteExistingLocation(id) {
      this.isLoading = true;
      this.error = null;
      try {
        await locationService.deleteLocation(id);
        await this.fetchLocations(); // Refresh list
        if (this.currentLocation && this.currentLocation.id === id) {
          this.currentLocation = null;
        }
      } catch (err) {
        this.error = err.data?.detail || err.message || 'Failed to delete location';
        throw err;
      } finally {
        this.isLoading = false;
      }
    },

    clearCurrentLocation() {
      this.currentLocation = null;
    }
  },
  getters: {
    // locationNames: (state) => state.locations.map(loc => loc.name) // Example
  }
}); 