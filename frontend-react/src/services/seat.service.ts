import { apiFetch } from '@/lib/api'

export const seatService = {
    getByBus(busId: number) {
        return apiFetch(`/seats/bus/${busId}`)
    },

    getByTrip(tripId: number) {
        return apiFetch(`/seats/trip/${tripId}`)
    },

    create(data: Record<string, unknown>) {
        return apiFetch('/seats', { method: 'POST', body: data })
    },

    update(seatId: number, data: Record<string, unknown>) {
        return apiFetch(`/seats/${seatId}`, { method: 'PUT', body: data })
    },

    delete(seatId: number) {
        return apiFetch(`/seats/${seatId}`, { method: 'DELETE' })
    },
}
