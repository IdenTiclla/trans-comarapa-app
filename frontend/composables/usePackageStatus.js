export const usePackageStatus = () => {
    const getStatusLabel = (status) => {
        const labels = {
            registered_at_office: 'En oficina',
            assigned_to_trip: 'Asignada a viaje',
            in_transit: 'En tránsito',
            arrived_at_destination: 'En destino',
            delivered: 'Entregada'
        }
        return labels[status] || status
    }

    const getStatusBg = (status) => {
        const colors = {
            registered_at_office: 'bg-yellow-100',
            assigned_to_trip: 'bg-blue-100',
            in_transit: 'bg-orange-100',
            arrived_at_destination: 'bg-emerald-100',
            delivered: 'bg-green-100'
        }
        return colors[status] || 'bg-gray-100'
    }

    const getTimelineIconBg = (status) => {
        return getStatusBg(status)
    }

    const getStatusText = (status) => {
        const colors = {
            registered_at_office: 'text-yellow-800',
            assigned_to_trip: 'text-blue-800',
            in_transit: 'text-orange-800',
            arrived_at_destination: 'text-emerald-800',
            delivered: 'text-green-800'
        }
        return colors[status] || 'text-gray-800'
    }

    const getPaymentStatusLabel = (status) => {
        if (status === 'paid_on_send') return 'Pagado'
        if (status === 'collect_on_delivery') return 'Por Cobrar'
        return status || 'N/A'
    }

    const getPaymentStatusBg = (status) => {
        if (status === 'paid_on_send') return 'bg-green-100 border-green-200'
        if (status === 'collect_on_delivery') return 'bg-orange-100 border-orange-200'
        return 'bg-gray-100 border-gray-200'
    }

    const getPaymentStatusTextClass = (status) => {
        if (status === 'paid_on_send') return 'text-green-800'
        if (status === 'collect_on_delivery') return 'text-orange-800'
        return 'text-gray-800'
    }

    return {
        getStatusLabel,
        getStatusBg,
        getTimelineIconBg,
        getStatusText,
        getPaymentStatusLabel,
        getPaymentStatusBg,
        getPaymentStatusTextClass
    }
}
