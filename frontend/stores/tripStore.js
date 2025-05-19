import { defineStore } from 'pinia';
import * as tripService from '~/services/tripService';

export const useTripStore = defineStore('trips', {
  state: () => ({
    trips: [],
    currentTrip: null,
    isLoading: false,
    error: null,
    pagination: {
      totalItems: 0,
      totalPages: 1,
      currentPage: 1,
      itemsPerPage: 10, // Default, can be updated from params or response
    },
  }),
  actions: {
    async fetchTrips(params = { page: 1, itemsPerPage: 10, sortBy: 'trip_datetime', sortDirection: 'desc' }) {
      this.isLoading = true;
      this.error = null;
      try {
        const apiParams = {
          ...params.filters, // Assuming filters are passed in params.filters
          skip: ((params.page - 1) * params.itemsPerPage),
          limit: params.itemsPerPage,
          sort_by: params.sortBy,
          sort_direction: params.sortDirection,
        };
        const response = await tripService.getTrips(apiParams);
        
        if (response && response.pagination &&
            typeof response.pagination.total === 'number' &&
            typeof response.pagination.limit === 'number' &&
            typeof response.pagination.skip === 'number' &&
            typeof response.pagination.pages === 'number' &&
            Array.isArray(response.trips)) {
          
          this.trips = response.trips;
          this.pagination.totalItems = response.pagination.total;
          this.pagination.itemsPerPage = response.pagination.limit;
          
          if (response.pagination.limit > 0) {
            this.pagination.currentPage = Math.floor(response.pagination.skip / response.pagination.limit) + 1;
          } else {
            // Fallback if limit is 0 or undefined, though API sends it.
            this.pagination.currentPage = params.page || 1; 
          }
          this.pagination.totalPages = response.pagination.pages;
          this.error = null; // Explicitly clear any previous error

        } else if (Array.isArray(response)) {
          // Fallback if the API returns just an array (no pagination info from backend)
          this.trips = response;
          this.pagination.totalItems = response.length;
          this.pagination.itemsPerPage = response.length > 0 ? response.length : params.itemsPerPage;
          this.pagination.currentPage = 1;
          this.pagination.totalPages = 1;
          this.error = null; // Explicitly clear any previous error
        } else {
          // Handle unexpected response structure
          console.warn('Unexpected response structure from getTrips. Expected format like {trips: [...], pagination: {total: N, limit: N, skip: N, pages: N}} or an array of trips.', response);
          this.trips = [];
          // Reset pagination if response is not as expected
          this.pagination = { 
            totalItems: 0, 
            totalPages: 1, 
            currentPage: 1, 
            itemsPerPage: params.itemsPerPage 
          };
          // Only set error if we actually got a response but it's malformed
          if (response !== null && response !== undefined) {
            this.error = 'Formato de respuesta inesperado del servidor';
          }
        }
      } catch (err) {
        console.error('Error fetching trips:', err);
        this.error = err.data?.detail || err.message || 'Error al cargar los viajes';
        this.trips = [];
        this.pagination = { 
          totalItems: 0, 
          totalPages: 1, 
          currentPage: 1, 
          itemsPerPage: params.itemsPerPage 
        };
      } finally {
        this.isLoading = false;
      }
    },

    async fetchTripById(id) {
      this.isLoading = true;
      this.error = null;
      try {
        this.currentTrip = await tripService.getTripById(id);
        // If data transformation was removed from service and is needed,
        // it could be done here or in a getter.
      } catch (err) {
        this.error = err.data?.detail || err.message || 'Failed to fetch trip';
        this.currentTrip = null;
      } finally {
        this.isLoading = false;
      }
    },

    async createNewTrip(tripData) {
      this.isLoading = true;
      this.error = null;
      try {
        const newTrip = await tripService.createTrip(tripData);
        await this.fetchTrips({ // Fetch with current pagination/sort settings
          page: this.pagination.currentPage,
          itemsPerPage: this.pagination.itemsPerPage,
          sortBy: this.pagination.sortBy, // Assuming you add sortBy/sortDirection to pagination state
          sortDirection: this.pagination.sortDirection
        });
        return newTrip;
      } catch (err) {
        this.error = err.data?.detail || err.message || 'Failed to create trip';
        throw err;
      } finally {
        this.isLoading = false;
      }
    },

    async updateExistingTrip(id, tripData) {
      this.isLoading = true;
      this.error = null;
      try {
        const updatedTrip = await tripService.updateTrip(id, tripData);
        await this.fetchTrips({ // Fetch with current pagination/sort settings
          page: this.pagination.currentPage,
          itemsPerPage: this.pagination.itemsPerPage,
          sortBy: this.pagination.sortBy,
          sortDirection: this.pagination.sortDirection
        }); 
        if (this.currentTrip && this.currentTrip.id === id) {
          // Refetch currentTrip to get the most up-to-date version if viewing detail page
          await this.fetchTripById(id); 
        }
        return updatedTrip;
      } catch (err) {
        this.error = err.data?.detail || err.message || 'Failed to update trip';
        throw err;
      } finally {
        this.isLoading = false;
      }
    },

    async deleteExistingTrip(id) {
      this.isLoading = true;
      this.error = null;
      try {
        await tripService.deleteTrip(id);
        await this.fetchTrips({ // Fetch with current pagination/sort settings
          page: this.pagination.currentPage,
          itemsPerPage: this.pagination.itemsPerPage,
          sortBy: this.pagination.sortBy,
          sortDirection: this.pagination.sortDirection
        });
        if (this.currentTrip && this.currentTrip.id === id) {
          this.currentTrip = null;
        }
      } catch (err) {
        this.error = err.data?.detail || err.message || 'Failed to delete trip';
        throw err;
      } finally {
        this.isLoading = false;
      }
    },

    clearCurrentTrip() {
      this.currentTrip = null;
    }
  },
  getters: {
    // Example: transformedCurrentTrip if complex transformations are needed
    // transformedCurrentTrip: (state) => {
    //   if (!state.currentTrip) return null;
    //   // Apply transformations here (e.g., extracting origin/destination, formatting dates)
    //   return { ...state.currentTrip, formattedDate: ... };
    // }
  }
}); 