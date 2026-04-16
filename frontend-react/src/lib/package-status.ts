/**
 * Pure functions for package status labeling and coloring.
 * Replaces the hook `use-package-status.ts` (which had no state, so it was not a real hook).
 * Also centralizes constants that were duplicated in package.service.ts.
 */

// ── Status labels ─────────────────────────────────────────────────────────────

export function getPackageStatusLabel(status: string): string {
    const labels: Record<string, string> = {
        registered_at_office: 'En oficina',
        assigned_to_trip: 'Asignada a viaje',
        in_transit: 'En tránsito',
        arrived_at_destination: 'En destino',
        delivered: 'Entregada',
    }
    return labels[status] || status
}

export function getPackageStatusBg(status: string): string {
    const colors: Record<string, string> = {
        registered_at_office: 'bg-yellow-100',
        assigned_to_trip: 'bg-blue-100',
        in_transit: 'bg-orange-100',
        arrived_at_destination: 'bg-emerald-100',
        delivered: 'bg-green-100',
    }
    return colors[status] || 'bg-gray-100'
}

export function getPackageStatusText(status: string): string {
    const colors: Record<string, string> = {
        registered_at_office: 'text-yellow-800',
        assigned_to_trip: 'text-blue-800',
        in_transit: 'text-orange-800',
        arrived_at_destination: 'text-emerald-800',
        delivered: 'text-green-800',
    }
    return colors[status] || 'text-gray-800'
}

/** Alias — used for timeline icons */
export const getTimelineIconBg = getPackageStatusBg

// ── Payment status labels ─────────────────────────────────────────────────────

export function getPaymentStatusLabel(status: string): string {
    if (status === 'paid_on_send') return 'Pagado'
    if (status === 'collect_on_delivery') return 'Por Cobrar'
    return status || 'N/A'
}

export function getPaymentStatusBg(status: string): string {
    if (status === 'paid_on_send') return 'bg-green-100 border-green-200'
    if (status === 'collect_on_delivery') return 'bg-orange-100 border-orange-200'
    return 'bg-gray-100 border-gray-200'
}

export function getPaymentStatusTextClass(status: string): string {
    if (status === 'paid_on_send') return 'text-green-800'
    if (status === 'collect_on_delivery') return 'text-orange-800'
    return 'text-gray-800'
}

// ── Status constants (centralizing what was duplicated between service and hook) ─

export const PACKAGE_STATUS_VALUES = {
    REGISTERED_AT_OFFICE: 'registered_at_office',
    ASSIGNED_TO_TRIP: 'assigned_to_trip',
    IN_TRANSIT: 'in_transit',
    ARRIVED_AT_DESTINATION: 'arrived_at_destination',
    DELIVERED: 'delivered',
} as const

export const PACKAGE_PAYMENT_STATUS_VALUES = {
    PAID_ON_SEND: 'paid_on_send',
    COLLECT_ON_DELIVERY: 'collect_on_delivery',
} as const

// ── Origin & Destination resolution ───────────────────────────────────────────

export function getPackageDestination(pkg: any, trip?: any): string {
    if (!pkg) return 'Destino'
    return pkg.destination_office?.name ||
        pkg.destination_office_name ||
        pkg.destination ||
        pkg.recipient?.branch?.name ||
        pkg.recipient?.office?.name ||
        pkg.trip?.route?.destination_location?.name ||
        pkg.trip?.route?.destination ||
        trip?.route?.destination?.name ||
        trip?.route?.destination ||
        'Destino'
}

export function getPackageOrigin(pkg: any, trip?: any): string {
    if (!pkg) return 'Origen'
    return pkg.origin_office?.name ||
        pkg.origin_office_name ||
        pkg.origin ||
        pkg.sender?.branch?.name ||
        pkg.sender?.office?.name ||
        pkg.trip?.route?.origin_location?.name ||
        pkg.trip?.route?.origin ||
        trip?.route?.origin?.name ||
        trip?.route?.origin ||
        'Origen'
}
