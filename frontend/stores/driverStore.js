import { defineStore } from 'pinia';
import * as driverService from '~/services/driverService';

export const useDriverStore = defineStore('drivers', {
  state: () => ({
    drivers: [],
    currentDriver: null,
    isLoading: false,
    error: null,
  }),
  actions: {
    async fetchDrivers(params = {}) {
      this.isLoading = true;
      this.error = null;
      try {
        this.drivers = await driverService.getAllDrivers(params);
      } catch (err) {
        this.error = err.data?.detail || err.message || 'Failed to fetch drivers';
        this.drivers = [];
      } finally {
        this.isLoading = false;
      }
    },

    async fetchDriverById(id) {
      this.isLoading = true;
      this.error = null;
      try {
        this.currentDriver = await driverService.getDriverById(id);
      } catch (err) {
        this.error = err.data?.detail || err.message || 'Failed to fetch driver';
        this.currentDriver = null;
      } finally {
        this.isLoading = false;
      }
    },

    async createNewDriver(driverData) {
      this.isLoading = true;
      this.error = null;
      try {
        const newDriver = await driverService.createDriver(driverData);
        await this.fetchDrivers(); // Refresh list
        return newDriver;
      } catch (err) {
        this.error = err.data?.detail || err.message || 'Failed to create driver';
        throw err;
      } finally {
        this.isLoading = false;
      }
    },

    async updateExistingDriver(id, driverData) {
      this.isLoading = true;
      this.error = null;
      try {
        const updatedDriver = await driverService.updateDriver(id, driverData);
        await this.fetchDrivers(); // Refresh list
        if (this.currentDriver && this.currentDriver.id === id) {
          this.currentDriver = updatedDriver;
        }
        return updatedDriver;
      } catch (err) {
        this.error = err.data?.detail || err.message || 'Failed to update driver';
        throw err;
      } finally {
        this.isLoading = false;
      }
    },

    async deleteExistingDriver(id) {
      this.isLoading = true;
      this.error = null;
      try {
        await driverService.deleteDriver(id);
        await this.fetchDrivers(); // Refresh list
        if (this.currentDriver && this.currentDriver.id === id) {
          this.currentDriver = null;
        }
      } catch (err) {
        this.error = err.data?.detail || err.message || 'Failed to delete driver';
        throw err;
      } finally {
        this.isLoading = false;
      }
    },

    clearCurrentDriver() {
      this.currentDriver = null;
    }
  },
  getters: {
    // driverCount: (state) => state.drivers.length,
  }
}); 