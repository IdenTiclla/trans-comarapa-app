import { apiFetch } from '@/lib/api'

export interface SeatLockResult {
    locked: boolean
    ttl?: number
    extended?: boolean
    fallback?: boolean
    message?: string
}

export interface LockedSeatInfo {
    seat_id: number
    user_id: number | null
    ttl: number
}

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

    lockSeat(tripId: number, seatId: number): Promise<SeatLockResult> {
        return apiFetch('/seats/lock', {
            method: 'POST',
            body: { trip_id: tripId, seat_id: seatId },
        })
    },

    unlockSeats(tripId: number, seatIds: number[]): Promise<{ unlocked: number }> {
        return apiFetch('/seats/unlock', {
            method: 'POST',
            body: { trip_id: tripId, seat_ids: seatIds },
        })
    },

    getLockedSeats(tripId: number): Promise<LockedSeatInfo[]> {
        return apiFetch(`/seats/locks/${tripId}`)
    },
}
