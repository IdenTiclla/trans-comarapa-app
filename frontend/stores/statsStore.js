import { defineStore } from 'pinia';
import statsService from '~/services/statsService';

export const useStatsStore = defineStore('stats', {
  state: () => ({
    dashboardStats: {
      tickets: null,
      packages: null,
      trips: null,
    },
    isLoading: false,
    error: null,
  }),

  getters: {
    getTicketStatsData: (state) => state.dashboardStats?.tickets || { count: 0, amount: 0, trend: 0 },
    getPackageStatsData: (state) => state.dashboardStats?.packages || { count: 0, trend: 0 },
    getTripStatsData: (state) => state.dashboardStats?.trips || { count: 0, trend: 0 },
  },

  actions: {
    async fetchDashboardStats(period = 'today') {
      this.isLoading = true;
      this.error = null;
      try {
        const data = await statsService.getDashboardStats(period);
        // The service already has a fallback to individual stats if /stats/dashboard fails,
        // and then mock data if those fail.
        // So, 'data' should always be populated or an error thrown by the service.
        this.dashboardStats = {
          tickets: data.tickets || null,
          packages: data.packages || null,
          trips: data.trips || null,
        };
      } catch (err) {
        console.error('Error in statsStore fetching dashboard stats:', err);
        this.error = err.data?.detail || err.message || 'Failed to fetch dashboard statistics';
        // Ensure dashboardStats is reset or has a default structure on error
        this.dashboardStats = {
          tickets: { count: 0, amount: 0, trend: 0 },
          packages: { count: 0, trend: 0 },
          trips: { count: 0, trend: 0 },
        };
      } finally {
        this.isLoading = false;
      }
    },

    clearError() {
      this.error = null;
    }
  },
}); 