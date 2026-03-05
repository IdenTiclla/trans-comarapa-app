import { apiFetch } from '@/lib/api'

const RESOURCE_URL = '/tickets'

export const ticketService = {
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

    getByTripId(tripId: number) {
        return apiFetch(`${RESOURCE_URL}/trip/${tripId}`)
    },

    getByClientId(clientId: number) {
        return apiFetch(`${RESOURCE_URL}/client/${clientId}`)
    },

    getBySeatId(seatId: number) {
        return apiFetch(`${RESOURCE_URL}/seat/${seatId}`)
    },

    changeSeat(ticketId: number, newSeatId: number) {
        return apiFetch(`${RESOURCE_URL}/${ticketId}/change-seat/${newSeatId}`, { method: 'PUT' })
    },

    confirmSale(ticketId: number) {
        return apiFetch(`${RESOURCE_URL}/${ticketId}`, {
            method: 'PUT',
            body: { state: 'confirmed' },
        })
    },
}
