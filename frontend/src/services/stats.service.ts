import { apiFetch } from '@/lib/api'

async function fetchPeriodStats(endpoint: string, period: string, extraParams: Record<string, unknown> = {}) {
    return apiFetch(endpoint, { params: { period, ...extraParams } })
}

export const statsService = {
    getTicketStats(period = 'today') {
        return fetchPeriodStats('/stats/tickets/stats', period)
    },

    getPackageStats(period = 'today') {
        return fetchPeriodStats('/stats/packages/stats', period)
    },

    getTripStats(period = 'today') {
        return fetchPeriodStats('/stats/trips/stats', period)
    },

    getTicketsSummaryStats(period = 'today') {
        return fetchPeriodStats('/stats/tickets/summary-stats', period)
    },

    async getDashboardStats(period = 'today') {
        try {
            return await fetchPeriodStats('/stats/dashboard', period)
        } catch {
            const [tickets, packages, trips] = await Promise.all([
                statsService.getTicketStats(period),
                statsService.getPackageStats(period),
                statsService.getTripStats(period),
            ])
            return { tickets, packages, trips }
        }
    },

    async getTicketsStatsComparison() {
        const [today, yesterday] = await Promise.all([
            statsService.getTicketsSummaryStats('today'),
            statsService.getTicketsSummaryStats('yesterday'),
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
}
