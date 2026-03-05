import { apiFetch } from '@/lib/api'

export interface SalesFilters {
    client_id?: number
    trip_id?: number
    type?: 'ticket' | 'package'
    status?: string
    date_from?: string
    date_to?: string
}

export interface SalesPagination {
    page: number
    itemsPerPage: number
}

export const salesService = {
    async getSales(
        filters: SalesFilters = {},
        pagination: SalesPagination = { page: 1, itemsPerPage: 10 }
    ) {
        const params: Record<string, unknown> = { ...filters }
        params.skip = ((pagination.page - 1) * pagination.itemsPerPage).toString()
        params.limit = pagination.itemsPerPage.toString()

        const data = await apiFetch<{ items?: unknown[]; total?: number } | unknown[]>('/sales', { params })

        const sales = Array.isArray(data) ? data : (data as { items?: unknown[] }).items || []
        const totalItems = Array.isArray(data) ? sales.length : (data as { total?: number }).total || sales.length

        return {
            sales,
            pagination: {
                totalItems,
                totalPages: Math.ceil(totalItems / pagination.itemsPerPage) || 1,
                currentPage: pagination.page,
                itemsPerPage: pagination.itemsPerPage,
            },
        }
    },

    async getRecentSales(limit = 5) {
        const data = await apiFetch<{ items?: unknown[] } | unknown[]>(
            '/stats/sales/recent',
            { params: { limit } }
        )
        return Array.isArray(data) ? data : (data as { items?: unknown[] }).items || []
    },

    async getSalesSummary(period = 'today') {
        return apiFetch('/stats/sales/summary', { params: { period } })
    },
}
