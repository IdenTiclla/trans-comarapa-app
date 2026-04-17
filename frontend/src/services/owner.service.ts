import { apiFetch } from '@/lib/api'

const RESOURCE_URL = '/owners'

export const ownerService = {
    getAll(params: Record<string, unknown> = {}) {
        return apiFetch(RESOURCE_URL, { params })
    },

    getById(id: number) {
        return apiFetch(`${RESOURCE_URL}/${id}`)
    },

    create(data: Record<string, unknown>) {
        return apiFetch(RESOURCE_URL, { method: 'POST', body: data })
    },

    update(id: number, data: Record<string, unknown>) {
        return apiFetch(`${RESOURCE_URL}/${id}`, { method: 'PUT', body: data })
    },

    delete(id: number) {
        return apiFetch(`${RESOURCE_URL}/${id}`, { method: 'DELETE' })
    },

    getFinancials(id: number, busId?: number) {
        const params: Record<string, unknown> = {}
        if (busId !== undefined) params.bus_id = busId
        return apiFetch(`${RESOURCE_URL}/${id}/financials`, { params })
    },

    getBuses(id: number) {
        return apiFetch(`${RESOURCE_URL}/${id}/buses`)
    },

    getWithdrawals(id: number, busId?: number) {
        const params: Record<string, unknown> = {}
        if (busId !== undefined) params.bus_id = busId
        return apiFetch(`${RESOURCE_URL}/${id}/withdrawals`, { params })
    },

    withdraw(id: number, data: { trip_id: number; amount: number; office_id: number }) {
        return apiFetch(`${RESOURCE_URL}/${id}/withdraw`, { method: 'POST', body: data })
    }
}
