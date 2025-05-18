import { defineStore } from 'pinia';
import * as routeService from '~/services/routeService';

export const useRouteStore = defineStore('routes', {
  state: () => ({
    routes: [],
    currentRoute: null,
    searchedRoutes: [],
    isLoading: false,
    error: null,
  }),
  actions: {
    async fetchRoutes(params = {}) {
      this.isLoading = true;
      this.error = null;
      try {
        this.routes = await routeService.getAllRoutes(params);
      } catch (err) {
        this.error = err.data?.detail || err.message || 'Failed to fetch routes';
        this.routes = [];
      } finally {
        this.isLoading = false;
      }
    },

    async fetchRouteById(id) {
      this.isLoading = true;
      this.error = null;
      try {
        this.currentRoute = await routeService.getRouteById(id);
      } catch (err) {
        this.error = err.data?.detail || err.message || 'Failed to fetch route';
        this.currentRoute = null;
      } finally {
        this.isLoading = false;
      }
    },

    async createNewRoute(routeData) {
      this.isLoading = true;
      this.error = null;
      try {
        const newRoute = await routeService.createRoute(routeData);
        await this.fetchRoutes(); // Refresh list
        return newRoute;
      } catch (err) {
        this.error = err.data?.detail || err.message || 'Failed to create route';
        throw err;
      } finally {
        this.isLoading = false;
      }
    },

    async updateExistingRoute(id, routeData) {
      this.isLoading = true;
      this.error = null;
      try {
        const updatedRoute = await routeService.updateRoute(id, routeData);
        await this.fetchRoutes(); // Refresh list
        if (this.currentRoute && this.currentRoute.id === id) {
          this.currentRoute = updatedRoute;
        }
        return updatedRoute;
      } catch (err) {
        this.error = err.data?.detail || err.message || 'Failed to update route';
        throw err;
      } finally {
        this.isLoading = false;
      }
    },

    async deleteExistingRoute(id) {
      this.isLoading = true;
      this.error = null;
      try {
        await routeService.deleteRoute(id);
        await this.fetchRoutes(); // Refresh list
        if (this.currentRoute && this.currentRoute.id === id) {
          this.currentRoute = null;
        }
      } catch (err) {
        this.error = err.data?.detail || err.message || 'Failed to delete route';
        throw err;
      } finally {
        this.isLoading = false;
      }
    },

    async searchAvailableRoutes(origin, destination) {
      this.isLoading = true;
      this.error = null;
      this.searchedRoutes = [];
      try {
        this.searchedRoutes = await routeService.searchRoutes(origin, destination);
      } catch (err) {
        this.error = err.data?.detail || err.message || 'Failed to search routes';
      } finally {
        this.isLoading = false;
      }
    },

    clearCurrentRoute() {
      this.currentRoute = null;
    },

    clearSearchedRoutes() {
      this.searchedRoutes = [];
    }
  },
  getters: {
    // routeCount: (state) => state.routes.length,
  }
}); 