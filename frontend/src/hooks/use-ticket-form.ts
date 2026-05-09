import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate, useSearchParams } from 'react-router'
import { ticketService } from '@/services/ticket.service'
import { clientService } from '@/services/client.service'
import { tripService } from '@/services/trip.service'
import { seatService } from '@/services/seat.service'
import { toast } from 'sonner'
import { ApiError } from '@/lib/api'
import { ROUTES } from '@/lib/routes'
import type { Ticket, Client, Trip, Seat } from '@/components/tickets/tickets-helpers'

interface TicketFormState {
    trip_id: string
    client_id: string
    seat_id: string
    state: string
    price: number
    payment_method: string
}

const EMPTY_FORM: TicketFormState = {
    trip_id: '',
    client_id: '',
    seat_id: '',
    state: 'pending',
    price: 0,
    payment_method: '',
}

interface UseTicketFormParams {
    userId?: number
    availableTrips: Trip[]
    onSaved: () => void
}

export function useTicketForm({ userId, availableTrips, onSaved }: UseTicketFormParams) {
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()

    const [showCreateModal, setShowCreateModal] = useState(false)
    const [showEditModal, setShowEditModal] = useState(false)
    const [editingTicket, setEditingTicket] = useState<Ticket | null>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [ticketForm, setTicketForm] = useState<TicketFormState>(EMPTY_FORM)
    const [availableSeats, setAvailableSeats] = useState<Seat[]>([])
    const [clients, setClients] = useState<Client[]>([])

    // Apertura por query params (?trip_id=N&action=sell)
    useEffect(() => {
        const tripId = searchParams.get('trip_id')
        const action = searchParams.get('action')
        if (tripId) {
            setTicketForm((prev) => ({
                ...prev,
                trip_id: tripId,
                state: action === 'sell' ? 'confirmed' : 'pending',
            }))
            setShowCreateModal(true)
        }
    }, [searchParams])

    // Carga lazy de clientes solo cuando el modal está abierto.
    useEffect(() => {
        if (!showCreateModal && !showEditModal) return
        let cancelled = false
        clientService
            .getAll({ skip: 0, limit: 10000 })
            .then((res) => {
                if (!cancelled) setClients((res as Client[]) || [])
            })
            .catch(() => {})
        return () => {
            cancelled = true
        }
    }, [showCreateModal, showEditModal])

    // Asientos disponibles + auto-precio cuando cambia el viaje seleccionado.
    useEffect(() => {
        if (!ticketForm.trip_id) {
            setAvailableSeats([])
            return
        }
        const fetchAvailableSeats = async () => {
            try {
                const tripResponse = (await tripService.getById(Number(ticketForm.trip_id))) as { bus_id?: number }
                if (!tripResponse.bus_id) {
                    setAvailableSeats([])
                    return
                }
                const seatsResponse = (await seatService.getByBus(tripResponse.bus_id)) as Seat[]
                const availableResponse = (await tripService.getById(Number(ticketForm.trip_id))) as {
                    available_seats?: number[]
                    [key: string]: unknown
                }
                const availableSeatNumbers = availableResponse.available_seats ?? []
                setAvailableSeats(
                    seatsResponse.filter((seat) => availableSeatNumbers.includes(seat.seat_number)),
                )
            } catch {
                setAvailableSeats([])
            }
        }
        fetchAvailableSeats()

        const selectedTrip = availableTrips.find((t) => t.id === Number(ticketForm.trip_id))
        if (selectedTrip?.route?.price) {
            setTicketForm((prev) => ({ ...prev, price: selectedTrip.route!.price! }))
        }

        const seatNumStr = searchParams.get('seat_number')
        if (seatNumStr && availableSeats.length > 0) {
            const seat = availableSeats.find((s) => s.seat_number === Number(seatNumStr))
            if (seat) setTicketForm((prev) => ({ ...prev, seat_id: seat.id.toString() }))
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [ticketForm.trip_id])

    const handleCloseModal = () => {
        setShowCreateModal(false)
        setShowEditModal(false)
        setEditingTicket(null)
        setTicketForm(EMPTY_FORM)
        const tripParam = searchParams.get('trip_id')
        if (tripParam) navigate(ROUTES.tripDetail(tripParam))
    }

    const submitTicketForm = async (e: FormEvent) => {
        e.preventDefault()
        setIsSubmitting(true)
        try {
            const payload = {
                ...ticketForm,
                trip_id: Number(ticketForm.trip_id),
                client_id: Number(ticketForm.client_id),
                seat_id: Number(ticketForm.seat_id),
                price: Number(ticketForm.price),
                operator_user_id: userId,
            }
            if (showCreateModal) await ticketService.create(payload)
            else if (showEditModal && editingTicket) await ticketService.update(editingTicket.id, payload)
            toast.success(showCreateModal ? 'Boleto creado' : 'Boleto actualizado')
            handleCloseModal()
            onSaved()
        } catch (error) {
            if (error instanceof ApiError && error.status === 403) {
                toast.error('Permiso denegado. Solo secretarios/administradores pueden crear boletos.')
            } else {
                toast.error('Error al guardar boleto')
            }
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleEditTicket = (t: Ticket) => {
        setEditingTicket(t)
        setTicketForm({
            trip_id: t.trip_id.toString(),
            client_id: t.client_id.toString(),
            seat_id: t.seat_id.toString(),
            state: t.state,
            price: t.price,
            payment_method: t.payment_method || '',
        })
        setShowEditModal(true)
    }

    return {
        showCreateModal,
        showEditModal,
        editingTicket,
        ticketForm,
        setTicketForm,
        isSubmitting,
        availableSeats,
        clients,
        submitTicketForm,
        handleEditTicket,
        handleCloseModal,
    }
}
