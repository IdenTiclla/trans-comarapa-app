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
