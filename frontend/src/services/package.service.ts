import { apiFetch } from '@/lib/api'

const BASE_PATH = '/packages'

// --- Constants ---

export const PACKAGE_STATUSES = {
    REGISTERED_AT_OFFICE: 'registered_at_office',
    ASSIGNED_TO_TRIP: 'assigned_to_trip',
    IN_TRANSIT: 'in_transit',
    ARRIVED_AT_DESTINATION: 'arrived_at_destination',
    DELIVERED: 'delivered',
} as const

export const PACKAGE_STATUS_LABELS: Record<string, string> = {
    registered_at_office: 'En oficina',
    assigned_to_trip: 'Asignada a viaje',
    in_transit: 'En tránsito',
    arrived_at_destination: 'En destino',
    delivered: 'Entregada',
}

export const PACKAGE_STATUS_COLORS: Record<
    string,
    { bg: string; text: string; border: string; dot: string }
> = {
    registered_at_office: { bg: 'bg-yellow-100', text: 'text-yellow-800', border: 'border-yellow-300', dot: 'bg-yellow-500' },
    assigned_to_trip: { bg: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-300', dot: 'bg-blue-500' },
    in_transit: { bg: 'bg-orange-100', text: 'text-orange-800', border: 'border-orange-300', dot: 'bg-orange-500' },
    arrived_at_destination: { bg: 'bg-emerald-100', text: 'text-emerald-800', border: 'border-emerald-300', dot: 'bg-emerald-500' },
    delivered: { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-300', dot: 'bg-green-500' },
}

export const PACKAGE_PAYMENT_STATUSES = {
    PAID_ON_SEND: 'paid_on_send',
    COLLECT_ON_DELIVERY: 'collect_on_delivery',
} as const

export const PAYMENT_METHODS = {
    CASH: 'cash',
    QR: 'qr',
} as const

export const PACKAGE_PAYMENT_STATUS_LABELS: Record<string, string> = {
    paid_on_send: 'Pagado al enviar',
    collect_on_delivery: 'Por cobrar',
}

export const PAYMENT_METHOD_LABELS: Record<string, string> = {
    cash: 'Efectivo',
    qr: 'QR',
}

// --- Utility functions ---

export interface PackageItem {
    description: string
    quantity: number
    unit_price: number
}

export function calculatePackageTotal(items: PackageItem[]): number {
    return items.reduce((total, item) => total + item.quantity * item.unit_price, 0)
}

export function calculateItemsCount(items: PackageItem[]): number {
    return items.reduce((total, item) => total + item.quantity, 0)
}

export function validatePackageData(packageData: {
    items?: PackageItem[]
    sender_id?: number
    recipient_id?: number
}): { isValid: boolean; errors: string[] } {
    const errors: string[] = []

    if (!packageData.items || packageData.items.length === 0) {
        errors.push('El paquete debe tener al menos un item')
    }

    if (packageData.items) {
        packageData.items.forEach((item, index) => {
            if (!item.description || item.description.trim() === '') {
                errors.push(`Item ${index + 1}: La descripción es requerida`)
            }
            if (!item.quantity || item.quantity <= 0) {
                errors.push(`Item ${index + 1}: La cantidad debe ser mayor a 0`)
            }
            if (!item.unit_price || item.unit_price <= 0) {
                errors.push(`Item ${index + 1}: El precio unitario debe ser mayor a 0`)
            }
        })
    }

    if (!packageData.sender_id) errors.push('El remitente es requerido')
    if (!packageData.recipient_id) errors.push('El destinatario es requerido')

    return { isValid: errors.length === 0, errors }
}

// --- Service ---

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
