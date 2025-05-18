import { defineStore } from 'pinia';
import * as busService from '~/services/busService';

export const useBusStore = defineStore('buses', {
  state: () => ({
    buses: [],
    currentBus: null,
    currentBusSeats: [],
    isLoading: false,
    error: null,
  }),
  actions: {
    async fetchBuses(params = {}) {
      this.isLoading = true;
      this.error = null;
      try {
        this.buses = await busService.getAllBuses(params);
      } catch (err) {
        this.error = err.data?.detail || err.message || 'Failed to fetch buses';
        this.buses = [];
      } finally {
        this.isLoading = false;
      }
    },

    async fetchBusById(id) {
      this.isLoading = true;
      this.error = null;
      try {
        this.currentBus = await busService.getBusById(id);
      } catch (err) {
        this.error = err.data?.detail || err.message || 'Failed to fetch bus';
        this.currentBus = null;
      } finally {
        this.isLoading = false;
      }
    },

    async createNewBus(busData) {
      this.isLoading = true;
      this.error = null;
      try {
        const newBus = await busService.createBus(busData);
        await this.fetchBuses(); // Refresh list
        return newBus;
      } catch (err) {
        this.error = err.data?.detail || err.message || 'Failed to create bus';
        throw err;
      } finally {
        this.isLoading = false;
      }
    },

    async updateExistingBus(id, busData) {
      this.isLoading = true;
      this.error = null;
      try {
        const updatedBus = await busService.updateBus(id, busData);
        await this.fetchBuses(); // Refresh list
        if (this.currentBus && this.currentBus.id === id) {
          this.currentBus = updatedBus;
        }
        return updatedBus;
      } catch (err) {
        this.error = err.data?.detail || err.message || 'Failed to update bus';
        throw err;
      } finally {
        this.isLoading = false;
      }
    },

    async deleteExistingBus(id) {
      this.isLoading = true;
      this.error = null;
      try {
        await busService.deleteBus(id);
        await this.fetchBuses(); // Refresh list
        if (this.currentBus && this.currentBus.id === id) {
          this.currentBus = null;
        }
      } catch (err) {
        this.error = err.data?.detail || err.message || 'Failed to delete bus';
        throw err;
      } finally {
        this.isLoading = false;
      }
    },

    async fetchBusSeats(busId) {
      this.isLoading = true;
      this.error = null;
      try {
        this.currentBusSeats = await busService.getBusSeats(busId);
      } catch (err) {
        this.error = err.data?.detail || err.message || 'Failed to fetch bus seats';
        this.currentBusSeats = [];
      } finally {
        this.isLoading = false;
      }
    },

    clearCurrentBus() {
      this.currentBus = null;
      this.currentBusSeats = [];
    }
  },
  getters: {
    // busCount: (state) => state.buses.length,
  }
}); 