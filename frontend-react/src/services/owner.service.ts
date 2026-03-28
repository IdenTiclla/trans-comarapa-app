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

    getFinancials(id: number) {
        return apiFetch(`${RESOURCE_URL}/${id}/financials`)
    },

    withdraw(id: number, data: { trip_id: number; amount: number; office_id: number }) {
        return apiFetch(`${RESOURCE_URL}/${id}/withdraw`, { method: 'POST', body: data })
    }
}
