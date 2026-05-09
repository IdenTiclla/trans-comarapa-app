import { useState, useEffect, useMemo } from 'react'
import { useAppSelector } from '@/store'
import { selectUser } from '@/store/auth.slice'
import { statsService } from '@/services/stats.service'
import { ticketService } from '@/services/ticket.service'
import { tripService } from '@/services/trip.service'
import { toast } from 'sonner'
import { usePaginatedList } from '@/hooks/use-paginated-list'
import { useTicketForm } from '@/hooks/use-ticket-form'
import {
    type Ticket,
    type Client,
    type Trip,
    formatDate,
    getStatusText,
} from '@/components/tickets/tickets-helpers'

interface StatsBucket {
    confirmed?: number
    pending?: number
    cancelled?: number
    totalRevenue?: number
}

const EMPTY_STATS: StatsBucket = { confirmed: 0, pending: 0, cancelled: 0, totalRevenue: 0 }
const PAGE_SIZE = 10

export function useTicketsIndexPage() {
    const user = useAppSelector(selectUser)

    const [tickets, setTickets] = useState<Ticket[]>([])
    const [derivedClients, setDerivedClients] = useState<Client[]>([])
    const [availableTrips, setAvailableTrips] = useState<Trip[]>([])

    const [searchQuery, setSearchQuery] = useState('')
    const [statusFilter, setStatusFilter] = useState('')
    const [dateFromFilter, setDateFromFilter] = useState('')
    const [dateToFilter, setDateToFilter] = useState('')
    const [paymentMethodFilter, setPaymentMethodFilter] = useState('')

    const [isLoading, setIsLoading] = useState(false)
    const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards')
    const [showAdvancedFilters, setShowAdvancedFilters] = useState(false)

    const [stats, setStats] = useState<StatsBucket>(EMPTY_STATS)
    const [comparison, setComparison] = useState<StatsBucket>(EMPTY_STATS)

    const fetchData = async () => {
        setIsLoading(true)
        try {
            // Tickets, trips y stats en paralelo. Los clientes se derivan de la
            // data embebida en los tickets — el form modal carga la lista
            // completa por separado (ver useTicketForm).
            const [ticketsRes, tripsRes, statsRes] = await Promise.all([
                ticketService.getAll({ skip: 0, limit: 10000 }),
                tripService.getAll({ upcoming: true }),
                statsService.getTicketsStatsComparison().catch(() => null) as Promise<unknown>,
            ])

            const ticketsList = (ticketsRes as Ticket[]) || []
            setTickets(ticketsList)

            const clientMap = new Map<number, Client>()
            for (const t of ticketsList) {
                const c = (t as unknown as { client?: Client }).client
                if (c && !clientMap.has(c.id)) clientMap.set(c.id, c)
            }
            setDerivedClients(Array.from(clientMap.values()))

            setAvailableTrips((tripsRes as { trips?: Trip[] }).trips || [])

            if (statsRes) {
                const d = statsRes as { today: StatsBucket; comparison: StatsBucket }
                setStats({ ...EMPTY_STATS, ...d.today })
                setComparison({ ...EMPTY_STATS, ...d.comparison })
            }
        } catch {
            toast.error('Error al cargar datos')
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchData()
    }, [])

    const form = useTicketForm({
        userId: user?.id,
        availableTrips,
        onSaved: fetchData,
    })

    const clientLookup = form.clients.length > 0 ? form.clients : derivedClients

    function getClientName(clientId: number) {
        const client = clientLookup.find((c) => c.id === clientId)
        return client ? `${client.firstname} ${client.lastname}` : `Cliente #${clientId}`
    }

    function getTripInfo(tripId: number) {
        const trip = availableTrips.find((t) => t.id === tripId)
        if (trip?.route) return `${trip.route.origin} → ${trip.route.destination}`
        return `Viaje #${tripId}`
    }

    const filteredTickets = useMemo(() => {
        let filtered = tickets
        if (searchQuery) {
            const query = searchQuery.toLowerCase()
            filtered = filtered.filter(
                (t) =>
                    t.id.toString().includes(query) ||
                    getClientName(t.client_id).toLowerCase().includes(query) ||
                    getTripInfo(t.trip_id).toLowerCase().includes(query) ||
                    t.seat_id.toString().includes(query),
            )
        }
        if (statusFilter) filtered = filtered.filter((t) => t.state === statusFilter)
        if (dateFromFilter) filtered = filtered.filter((t) => t.created_at.split('T')[0] >= dateFromFilter)
        if (dateToFilter) filtered = filtered.filter((t) => t.created_at.split('T')[0] <= dateToFilter)
        if (paymentMethodFilter) filtered = filtered.filter((t) => t.payment_method === paymentMethodFilter)
        return filtered.sort(
            (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
        )
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [tickets, searchQuery, statusFilter, dateFromFilter, dateToFilter, paymentMethodFilter])

    const {
        paginatedItems: paginatedTickets,
        currentPage,
        setCurrentPage,
        totalPages,
    } = usePaginatedList(filteredTickets, PAGE_SIZE)

    const activeFiltersCount =
        (statusFilter ? 1 : 0) +
        (dateFromFilter ? 1 : 0) +
        (dateToFilter ? 1 : 0) +
        (paymentMethodFilter ? 1 : 0)

    const exportData = () => {
        const dataToExport = filteredTickets.map((t) => ({
            ID: t.id,
            Cliente: getClientName(t.client_id),
            Viaje: getTripInfo(t.trip_id),
            Asiento: t.seat_id,
            Estado: getStatusText(t.state),
            Precio: t.price,
            'Método de Pago': t.payment_method || 'N/A',
            'Fecha de Creación': formatDate(t.created_at),
        }))
        if (dataToExport.length === 0) return
        const headers = Object.keys(dataToExport[0]).join(',')
        const rows = dataToExport.map((row) => Object.values(row).join(','))
        const csv = [headers, ...rows].join('\n')
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
        const link = document.createElement('a')
        link.href = URL.createObjectURL(blob)
        link.download = `boletos_${new Date().toISOString().split('T')[0]}.csv`
        link.click()
    }

    const clearAllFilters = () => {
        setStatusFilter('')
        setDateFromFilter('')
        setDateToFilter('')
        setPaymentMethodFilter('')
        setSearchQuery('')
        setCurrentPage(1)
    }

    const handleCancelTicket = async (id: number) => {
        if (!window.confirm('¿Estás seguro de que quieres cancelar este boleto?')) return
        try {
            await ticketService.update(id, { state: 'cancelled' })
            toast.success('Boleto cancelado')
            fetchData()
        } catch {
            toast.error('Error al cancelar boleto')
        }
    }

    return {
        user,
        tickets: paginatedTickets,
        clients: clientLookup,
        availableTrips,
        availableSeats: form.availableSeats,
        searchQuery,
        setSearchQuery,
        statusFilter,
        setStatusFilter,
        dateFromFilter,
        setDateFromFilter,
        dateToFilter,
        setDateToFilter,
        paymentMethodFilter,
        setPaymentMethodFilter,
        currentPage,
        setCurrentPage,
        totalPages,
        isLoading,
        isSubmitting: form.isSubmitting,
        viewMode,
        setViewMode,
        showAdvancedFilters,
        setShowAdvancedFilters,
        showCreateModal: form.showCreateModal,
        showEditModal: form.showEditModal,
        editingTicket: form.editingTicket,
        ticketForm: form.ticketForm,
        setTicketForm: form.setTicketForm,
        stats,
        comparison,
        activeFiltersCount,
        filteredTickets,
        getClientName,
        getTripInfo,
        exportData,
        clearAllFilters,
        handleCloseModal: form.handleCloseModal,
        submitTicketForm: form.submitTicketForm,
        handleEditTicket: form.handleEditTicket,
        handleCancelTicket,
        refetchTickets: fetchData,
    }
}
