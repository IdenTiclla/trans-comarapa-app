import { defineStore } from 'pinia';
import statsService from '~/services/statsService';
import salesService from '~/services/salesService';

export const useStatsStore = defineStore('stats', {
  state: () => ({
    dashboardStats: {
      tickets: null,
      packages: null,
      trips: null,
    },
    salesSummary: null,
    isLoading: false,
    error: null,
  }),

  getters: {
    getTicketStatsData: (state) => state.dashboardStats?.tickets || { count: 0, amount: 0, trend: 0 },
    getPackageStatsData: (state) => state.dashboardStats?.packages || { count: 0, trend: 0 },
    getTripStatsData: (state) => state.dashboardStats?.trips || { count: 0, trend: 0 },
    getSalesSummaryData: (state) => state.salesSummary || { totalAmount: 0, ticketCount: 0, packageCount: 0, trend: 0 },
  },

  actions: {
    async fetchDashboardStats(period = 'today') {
      this.isLoading = true;
      this.error = null;
      try {
        // Obtener estadísticas del dashboard y resumen de ventas en paralelo
        const [dashboardData, salesSummaryData] = await Promise.all([
          statsService.getDashboardStats(period),
          salesService.getSalesSummary(period)
        ]);

        this.dashboardStats = {
          tickets: dashboardData.tickets || null,
          packages: dashboardData.packages || null,
          trips: dashboardData.trips || null,
        };

        this.salesSummary = salesSummaryData;
      } catch (err) {
        console.error('Error in statsStore fetching dashboard stats:', err);
        this.error = err.data?.detail || err.message || 'Failed to fetch dashboard statistics';
        // Ensure dashboardStats is reset or has a default structure on error
        this.dashboardStats = {
          tickets: { count: 0, amount: 0, trend: 0 },
          packages: { count: 0, trend: 0 },
          trips: { count: 0, trend: 0 },
        };
        this.salesSummary = { totalAmount: 0, ticketCount: 0, packageCount: 0, trend: 0 };
      } finally {
        this.isLoading = false;
      }
    },

    async refreshStats(period = 'today') {
      // Método para refrescar las estadísticas sin mostrar loading
      try {
        const [dashboardData, salesSummaryData] = await Promise.all([
          statsService.getDashboardStats(period),
          salesService.getSalesSummary(period)
        ]);

        this.dashboardStats = {
          tickets: dashboardData.tickets || null,
          packages: dashboardData.packages || null,
          trips: dashboardData.trips || null,
        };

        this.salesSummary = salesSummaryData;
      } catch (err) {
        console.error('Error refreshing stats:', err);
        // No actualizar el error en refresh silencioso
      }
    },

    clearError() {
      this.error = null;
    }
  },
}); 