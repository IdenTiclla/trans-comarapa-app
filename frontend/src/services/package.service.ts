import { apiFetch } from '@/lib/api'

const BASE_PATH = '/packages'

export const packageService = {
    // Core CRUD
    getAll(params: Record<string, unknown> = {}) {
        return apiFetch(BASE_PATH, { params })
    },

    getUnassigned(params: Record<string, unknown> = {}) {
        return apiFetch(`${BASE_PATH}/unassigned`, { params })
    },

    getById(id: number) {
        return apiFetch(`${BASE_PATH}/${id}`)
    },

    getByTrackingNumber(trackingNumber: string) {
        return apiFetch(`${BASE_PATH}/tracking/${trackingNumber}`)
    },

    create(data: Record<string, unknown>) {
        return apiFetch(BASE_PATH, { method: 'POST', body: data })
    },

    update(id: number, data: Record<string, unknown>) {
        return apiFetch(`${BASE_PATH}/${id}`, { method: 'PUT', body: data })
    },

    delete(id: number) {
        return apiFetch(`${BASE_PATH}/${id}`, { method: 'DELETE' })
    },

    // Trip assignment
    assignToTrip(packageId: number, tripId: number) {
        return apiFetch(`${BASE_PATH}/${packageId}/assign-trip`, {
            method: 'PUT',
            body: { trip_id: tripId },
        })
    },

    unassignFromTrip(packageId: number) {
        return apiFetch(`${BASE_PATH}/${packageId}/unassign-trip`, { method: 'PUT' })
    },

    unassign(packageId: number) {
        return apiFetch(`${BASE_PATH}/${packageId}/unassign`, { method: 'POST' })
    },

    updateStatus(packageId: number, newStatus: string, changedByUserId: number | null = null) {
        return apiFetch(`${BASE_PATH}/${packageId}/update-status`, {
            method: 'PUT',
            body: { new_status: newStatus, changed_by_user_id: changedByUserId },
        })
    },

    deliver(packageId: number, paymentMethod: string, changedByUserId: number | null = null) {
        return apiFetch(`${BASE_PATH}/${packageId}/deliver`, {
            method: 'PUT',
            body: { payment_method: paymentMethod, changed_by_user_id: changedByUserId },
        })
    },

    getPendingCollections(officeId: number, params: Record<string, unknown> = {}) {
        return apiFetch(`${BASE_PATH}/pending-collections`, {
            params: { office_id: officeId, ...params },
        })
    },

    // Items management
    getItems(packageId: number) {
        return apiFetch(`${BASE_PATH}/${packageId}/items`)
    },

    addItem(packageId: number, data: Record<string, unknown>) {
        return apiFetch(`${BASE_PATH}/${packageId}/items`, { method: 'POST', body: data })
    },

    updateItem(itemId: number, data: Record<string, unknown>) {
        return apiFetch(`${BASE_PATH}/items/${itemId}`, { method: 'PUT', body: data })
    },

    deleteItem(itemId: number) {
        return apiFetch(`${BASE_PATH}/items/${itemId}`, { method: 'DELETE' })
    },

    // Filtering
    getBySender(clientId: number) {
        return apiFetch(`${BASE_PATH}/by-sender/${clientId}`)
    },

    getByRecipient(clientId: number) {
        return apiFetch(`${BASE_PATH}/by-recipient/${clientId}`)
    },

    getByTrip(tripId: number) {
        return apiFetch(`${BASE_PATH}/by-trip/${tripId}`)
    },

    search(term: string) {
        return apiFetch(`${BASE_PATH}/search`, { params: { q: term } })
    },
}
