import { useState, useCallback } from 'react'
import { apiFetch } from '@/lib/api'

interface SoldTicket {
    id: number
    state: string
    seat?: { seat_number: number; deck?: number }
    client?: { firstname: string; lastname: string; document_id?: string }
    destination?: string
    price?: number
    [key: string]: unknown
}

export function useTripDetails() {
    const [soldTickets, setSoldTickets] = useState<SoldTicket[]>([])
    const [reservedSeatNumbers, setReservedSeatNumbers] = useState<number[]>([])
    const [loadingTickets, setLoadingTickets] = useState(false)

    const fetchSoldTickets = useCallback(async (tripId: number) => {
        setLoadingTickets(true)
        try {
            const data = await apiFetch(`/tickets/trip/${tripId}`)
            const tickets = Array.isArray(data) ? data : []
            setSoldTickets(tickets)
            const reserved = tickets
                .filter((t: SoldTicket) => t.state === 'pending')
                .map((t: SoldTicket) => t.seat?.seat_number)
                .filter(Boolean) as number[]

            setReservedSeatNumbers(prev => {
                if (prev.length === reserved.length && prev.every((v, i) => v === reserved[i])) return prev;
                return reserved;
            })
        } finally {
            setLoadingTickets(false)
        }
    }, [])

    const clearState = useCallback(() => {
        setSoldTickets([])
        setReservedSeatNumbers([])
    }, [])

    const formatDate = (dateString: string) => {
        if (!dateString) return 'N/A'
        try {
            return new Intl.DateTimeFormat('es-ES', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(dateString))
        } catch { return dateString }
    }

    const formatTime = (timeString: string) => {
        if (!timeString) return 'N/A'
        try {
            const parts = timeString.split(':')
            const date = new Date()
            date.setHours(parseInt(parts[0], 10), parseInt(parts[1], 10), 0, 0)
            return date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', hour12: true })
        } catch { return timeString }
    }

    const getStatusClass = (status: string) => {
        const map: Record<string, string> = {
            scheduled: 'bg-blue-100 text-blue-800',
            boarding: 'bg-purple-100 text-purple-800',
            departed: 'bg-orange-100 text-orange-800',
            in_progress: 'bg-orange-100 text-orange-800',
            arrived: 'bg-green-100 text-green-800',
            completed: 'bg-green-100 text-green-800',
            cancelled: 'bg-red-100 text-red-800',
        }
        return map[status] || 'bg-gray-100 text-gray-800'
    }

    const getStatusText = (status: string) => {
        const map: Record<string, string> = {
            scheduled: 'Programado',
            boarding: 'Abordando',
            departed: 'Despachado',
            in_progress: 'En Progreso',
            arrived: 'Llegó',
            completed: 'Completado',
            cancelled: 'Cancelado',
        }
        return map[status] || status
    }

    return {
        soldTickets,
        reservedSeatNumbers,
        loadingTickets,
        fetchSoldTickets,
        clearState,
        formatDate,
        formatTime,
        getStatusClass,
        getStatusText,
    }
}
