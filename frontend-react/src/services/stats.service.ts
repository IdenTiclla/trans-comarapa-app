import { apiFetch } from '@/lib/api'

// --- Helper ---

interface MonthlyStatsResponse {
    data: unknown[]
    trend: number
}

async function fetchMonthlyStats(endpoint: string, months: number): Promise<MonthlyStatsResponse> {
    const data = await apiFetch<{ data: unknown[]; trend?: number }>(endpoint, {
        params: { months },
    })
    if (!data || !Array.isArray(data.data)) {
        throw new Error('La respuesta de la API no tiene la estructura esperada')
    }
    return { data: data.data, trend: data.trend || 0 }
}

async function fetchPeriodStats(endpoint: string, period: string, extraParams: Record<string, unknown> = {}) {
    return apiFetch(endpoint, { params: { period, ...extraParams } })
}

// --- Service ---

export const statsService = {
    // === Period-based stats ===

    getTicketStats(period = 'today') {
        return fetchPeriodStats('/stats/tickets/stats', period)
    },

    getReservedTicketStats(period = 'today') {
        return fetchPeriodStats('/stats/tickets/reserved/stats', period)
    },

    getCancelledTicketsStats(period = 'today') {
        return fetchPeriodStats('/stats/tickets/cancelled/stats', period)
    },

    getPackageStats(period = 'today') {
        return fetchPeriodStats('/stats/packages/stats', period)
    },

    getDeliveredPackagesStats(period = 'today') {
        return fetchPeriodStats('/stats/packages/delivered/stats', period)
    },

    getPendingPackagesStats(period = 'today') {
        return fetchPeriodStats('/stats/packages/pending/stats', period)
    },

    getCancelledPackagesStats(period = 'today') {
        return fetchPeriodStats('/stats/packages/cancelled/stats', period)
    },

    getAverageDeliveryTimeStats(period = 'today') {
        return fetchPeriodStats('/stats/packages/delivery-time', period)
    },

    getTripStats(period = 'today') {
        return fetchPeriodStats('/stats/trips/stats', period)
    },

    getCompletedTripsStats(period = 'today') {
        return fetchPeriodStats('/stats/trips/stats', period, { status: 'completed' })
    },

    getCancelledTripsStats(period = 'today') {
        return fetchPeriodStats('/stats/trips/stats', period, { status: 'cancelled' })
    },

    getInProgressTripsStats(period = 'today') {
        return fetchPeriodStats('/stats/trips/stats', period, { status: 'in_progress' })
    },

    getAverageOccupancyStats(period = 'today') {
        return fetchPeriodStats('/stats/trips/occupancy', period)
    },

    getSalesSummary(period = 'month') {
        return fetchPeriodStats('/stats/sales/summary', period)
    },

    getRegisteredUsersStats(period = 'today') {
        return fetchPeriodStats('/stats/users/registered', period)
    },

    getRegisteredClientsStats(period = 'today') {
        return fetchPeriodStats('/stats/clients/registered', period)
    },

    getClientFeedbackStats(period = 'today') {
        return fetchPeriodStats('/stats/clients/feedback', period)
    },

    getBookingsStats(period = 'today') {
        return fetchPeriodStats('/stats/bookings/stats', period)
    },

    // === Non-period stats ===

    getActiveDriversStats() {
        return apiFetch('/stats/drivers/active')
    },

    getActiveBusesStats() {
        return apiFetch('/stats/buses/active')
    },

    getActiveSecretariesStats() {
        return apiFetch('/stats/secretaries/active')
    },

    getActiveAssistantsStats() {
        return apiFetch('/stats/assistants/active')
    },

    // === Dashboard aggregated ===

    async getDashboardStats(period = 'today') {
        try {
            return await fetchPeriodStats('/stats/dashboard', period)
        } catch {
            // Fallback: fetch individual stats in parallel
            const [tickets, packages, trips] = await Promise.all([
                statsService.getTicketStats(period),
                statsService.getPackageStats(period),
                statsService.getTripStats(period),
            ])
            return { tickets, packages, trips }
        }
    },

    // === Bookings comparison ===

    async getBookingsStatsComparison() {
        const [today, yesterday] = await Promise.all([
            statsService.getBookingsStats('today'),
            statsService.getBookingsStats('yesterday'),
        ])

        const pct = (a: number, b: number) => (b === 0 ? (a > 0 ? 100 : 0) : Math.round(((a - b) / b) * 100))

        const t = today as Record<string, number>
        const y = yesterday as Record<string, number>

        return {
            today,
            yesterday,
            comparison: {
                confirmed: pct(t.confirmed, y.confirmed),
                pending: pct(t.pending, y.pending),
                cancelled: pct(t.cancelled, y.cancelled),
                totalRevenue: pct(t.totalRevenue, y.totalRevenue),
            },
        }
    },

    // === Monthly stats ===

    getMonthlyTicketStats(months = 6) {
        return fetchMonthlyStats('/stats/tickets/monthly', months)
    },

    getMonthlyPackageStats(months = 6) {
        return fetchMonthlyStats('/stats/packages/monthly', months)
    },

    getMonthlyTripStats(months = 6) {
        return fetchMonthlyStats('/stats/trips/monthly', months)
    },

    getMonthlyRevenueStats(months = 6) {
        return fetchMonthlyStats('/stats/revenue/monthly', months)
    },

    getMonthlyReservationStats(months = 6) {
        return fetchMonthlyStats('/stats/reservations/monthly', months)
    },

    getMonthlyTicketRevenueStats(months = 6) {
        return fetchMonthlyStats('/stats/tickets/revenue/monthly', months)
    },

    getMonthlyPackageRevenueStats(months = 6) {
        return fetchMonthlyStats('/stats/packages/revenue/monthly', months)
    },

    getMonthlyCancelledTicketStats(months = 6) {
        return fetchMonthlyStats('/stats/tickets/cancelled/monthly', months)
    },

    getMonthlyCompletedTripStats(months = 6) {
        return fetchMonthlyStats('/stats/trips/completed/monthly', months)
    },

    getMonthlyCancelledTripStats(months = 6) {
        return fetchMonthlyStats('/stats/trips/cancelled/monthly', months)
    },

    getMonthlyClientFeedbackStats(months = 6) {
        return fetchMonthlyStats('/stats/clients/feedback/monthly', months)
    },

    getMonthlyRegisteredClientsStats(months = 6) {
        return fetchMonthlyStats('/stats/clients/registered/monthly', months)
    },

    getMonthlyDeliveredPackagesStats(months = 6) {
        return fetchMonthlyStats('/stats/packages/delivered/monthly', months)
    },

    getMonthlyCancelledReservationStats(months = 6) {
        return fetchMonthlyStats('/stats/reservations/cancelled/monthly', months)
    },
}
