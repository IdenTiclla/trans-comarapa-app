import { apiFetch } from '@/lib/api'

const RESOURCE_URL = '/buses'

export const busService = {
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

    getSeats(busId: number) {
        return apiFetch(`${RESOURCE_URL}/${busId}/seats`)
    },

    createWithSeats(data: Record<string, unknown>) {
        return apiFetch(`${RESOURCE_URL}/with-seats`, { method: 'POST', body: data })
    },

    updateSeats(busId: number, seats: unknown[]) {
        return apiFetch(`${RESOURCE_URL}/${busId}/seats`, { method: 'PUT', body: seats })
    },
}
