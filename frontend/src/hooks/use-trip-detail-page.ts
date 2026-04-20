import { useState, useEffect, useCallback, useMemo } from 'react'
import { useAppDispatch, useAppSelector } from '@/store'
import { fetchTripById, selectCurrentTrip, selectTripLoading, selectTripError } from '@/store/trip.slice'
import { fetchDrivers, selectDrivers } from '@/store/driver.slice'
import { fetchAssistants, selectAssistants } from '@/store/assistant.slice'
import { tripService } from '@/services/trip.service'
import { seatService } from '@/services/seat.service'
import { apiFetch } from '@/lib/api'
import { useTripDetails } from '@/hooks/use-trip-details'
import { useTripSeatLocks } from '@/hooks/use-trip-seat-locks'
import { useTripPackagesPanel } from '@/hooks/use-trip-packages-panel'
import { useTripStaffEditor } from '@/hooks/use-trip-staff-editor'
import { toast } from 'sonner'

interface Seat {
    id: number
    number?: number | string
    [key: string]: unknown
}

interface Ticket {
    id: number
    state: string
    seat?: { seat_number?: number | string; [k: string]: unknown }
    [key: string]: unknown
}

interface Trip {
    id: number
    trip_datetime?: string
    total_seats?: number
    [key: string]: unknown
}

interface Person {
    id: number
    [key: string]: unknown
}

function errMsg(e: unknown, fallback: string): string {
    if (e && typeof e === 'object' && 'message' in e && typeof (e as { message?: unknown }).message === 'string') {
        return (e as { message: string }).message
    }
    return fallback
}

function showNotification(type: 'success' | 'error', title: string, message: string) {
    if (type === 'success') toast.success(title, { description: message })
    else toast.error(title, { description: message })
}

export function useTripDetailPage(tripId: number) {
    const dispatch = useAppDispatch()

    const trip = useAppSelector(selectCurrentTrip) as Trip | null
    const loading = useAppSelector(selectTripLoading)
    const error = useAppSelector(selectTripError)
    const drivers = useAppSelector(selectDrivers) as Person[]
    const assistants = useAppSelector(selectAssistants) as Person[]

    const { soldTickets, reservedSeatNumbers, fetchSoldTickets, formatDate } = useTripDetails()
    const { lockedSeats, fetchLockedSeats } = useTripSeatLocks(tripId)
    const { fetchPackages, panel: packagesPanel } = useTripPackagesPanel(tripId)

    // ── Global refresh ────────────────────────────────────────────────────
    const refreshTrip = useCallback(() => {
        dispatch(fetchTripById(tripId))
        fetchSoldTickets(tripId)
        fetchPackages(tripId)
        fetchLockedSeats(tripId)
    }, [dispatch, tripId, fetchSoldTickets, fetchPackages, fetchLockedSeats])

    const staff = useTripStaffEditor(tripId, trip, refreshTrip)

    // ── Dispatch / Finish modals ──────────────────────────────────────────
    const [showDispatchModal, setShowDispatchModal] = useState(false)
    const [showFinishModal, setShowFinishModal] = useState(false)
    const [dispatching, setDispatching] = useState(false)
    const [finishing, setFinishing] = useState(false)

    const executeDispatch = async () => {
        setDispatching(true)
        try {
            await tripService.dispatch(tripId)
            showNotification('success', 'Viaje despachado', 'El viaje ha sido despachado correctamente.')
            setShowDispatchModal(false)
            refreshTrip()
        } catch (err) {
            showNotification('error', 'Error', errMsg(err, 'No se pudo despachar el viaje.'))
        } finally { setDispatching(false) }
    }

    const executeFinish = async () => {
        setFinishing(true)
        try {
            await tripService.finish(tripId)
            showNotification('success', 'Viaje terminado', 'El viaje ha sido marcado como terminado.')
            setShowFinishModal(false)
            refreshTrip()
        } catch (err) {
            showNotification('error', 'Error', errMsg(err, 'No se pudo terminar el viaje.'))
        } finally { setFinishing(false) }
    }

    // ── Ticket sale/view modals ───────────────────────────────────────────
    const [showTicketSaleModal, setShowTicketSaleModal] = useState(false)
    const [saleActionType, setSaleActionType] = useState<'sell' | 'reserve'>('sell')
    const [selectedSeatsForSale, setSelectedSeatsForSale] = useState<Seat[]>([])
    const [showTicketPreview, setShowTicketPreview] = useState(false)
    const [ticketForPreview, setTicketForPreview] = useState<Ticket | null>(null)

    // ── Confirm sale modal ────────────────────────────────────────────────
    const [showConfirmSaleModal, setShowConfirmSaleModal] = useState(false)
    const [ticketToConfirm, setTicketToConfirm] = useState<Ticket | null>(null)
    const [confirmingSale, setConfirmingSale] = useState(false)

    // ── Seat map / selection ──────────────────────────────────────────────
    const [seatMapKey, setSeatMapKey] = useState(0)
    const [currentSelectedSeats, setCurrentSelectedSeats] = useState<Seat[]>([])
    const [controlledSeatIds, setControlledSeatIds] = useState<number[]>([])

    // ── Seat change ───────────────────────────────────────────────────────
    const [seatChangeMode, setSeatChangeMode] = useState(false)
    const [seatChangeTicket, setSeatChangeTicket] = useState<Ticket | null>(null)
    const [newSelectedSeat, setNewSelectedSeat] = useState<Seat | null>(null)
    const [showSeatChangeConfirmModal, setShowSeatChangeConfirmModal] = useState(false)
    const [seatChangeLoading, setSeatChangeLoading] = useState(false)

    const cancelSeatChange = useCallback(() => {
        setSeatChangeMode(false)
        setSeatChangeTicket(null)
        setNewSelectedSeat(null)
        setShowSeatChangeConfirmModal(false)
        setCurrentSelectedSeats([])
        setControlledSeatIds([])
        setSeatMapKey(prev => prev + 1)
    }, [])

    const confirmSeatChange = useCallback(async () => {
        if (!seatChangeTicket || !newSelectedSeat) return
        setSeatChangeLoading(true)
        try {
            await apiFetch(`/tickets/${seatChangeTicket.id}/change-seat/${newSelectedSeat.id}`, { method: 'PUT' })
            showNotification('success', 'Asiento cambiado', 'El cambio de asiento se realizó con éxito.')
            refreshTrip()
            cancelSeatChange()
        } catch (err) {
            showNotification('error', 'Error', errMsg(err, 'No se pudo cambiar el asiento.'))
        } finally { setSeatChangeLoading(false) }
    }, [seatChangeTicket, newSelectedSeat, refreshTrip, cancelSeatChange])

    const executeConfirmSale = async () => {
        if (!ticketToConfirm) return
        setConfirmingSale(true)
        try {
            await apiFetch(`/tickets/${ticketToConfirm.id}`, { method: 'PUT', body: { state: 'confirmed' } })
            showNotification('success', 'Venta confirmada', 'La reserva ha sido confirmada como venta.')
            refreshTrip()
            setSeatMapKey(prev => prev + 1)
            setShowConfirmSaleModal(false)
            setTicketToConfirm(null)
        } catch (err) {
            showNotification('error', 'Error', errMsg(err, 'No se pudo confirmar la venta.'))
        } finally { setConfirmingSale(false) }
    }

    const handleClearSelection = useCallback(() => {
        if (currentSelectedSeats.length > 0) {
            seatService.unlockSeats(tripId, currentSelectedSeats.map(s => s.id)).catch(() => {})
        }
        setCurrentSelectedSeats([])
        setControlledSeatIds([])
    }, [tripId, currentSelectedSeats])

    const handleRemoveSeat = useCallback((seat: Seat) => {
        seatService.unlockSeats(tripId, [seat.id]).catch(() => {})
        setCurrentSelectedSeats(prev => prev.filter(s => s.id !== seat.id))
        setControlledSeatIds(prev => prev.filter(id => id !== seat.id))
    }, [tripId])

    const handleSellTicket = useCallback((seats: Seat[] | Seat) => {
        const seatsArray = Array.isArray(seats) ? seats : [seats]
        setSelectedSeatsForSale(seatsArray)
        setSaleActionType('sell')
        setShowTicketSaleModal(true)
    }, [])

    const handleReserveSeat = useCallback((seats: Seat[] | Seat) => {
        const seatsArray = Array.isArray(seats) ? seats : [seats]
        setSelectedSeatsForSale(seatsArray)
        setSaleActionType('reserve')
        setShowTicketSaleModal(true)
    }, [])

    const handleTicketCreated = () => {
        setShowTicketSaleModal(false)
        refreshTrip()
        setCurrentSelectedSeats([])
        setControlledSeatIds([])
        setSeatMapKey(prev => prev + 1)
    }

    const findTicketBySeat = (seat: Seat) => soldTickets.find((t: Ticket) => t.seat?.seat_number === seat.number) || null

    const handlePreviewTicket = (seat: Seat) => {
        const ticket = findTicketBySeat(seat)
        if (ticket) {
            setTicketForPreview(ticket)
            setShowTicketPreview(true)
        }
    }

    const handleCancelReservation = async (seat: Seat) => {
        const ticket = soldTickets.find(t => t.seat?.seat_number === seat.number && t.state === 'pending')
        if (ticket) {
            try {
                await apiFetch(`/tickets/${ticket.id}/cancel`, { method: 'PUT' })
                showNotification('success', 'Reserva cancelada', 'La reserva ha sido cancelada exitosamente.')
                refreshTrip()
                setSeatMapKey(prev => prev + 1)
            } catch (err) {
                showNotification('error', 'Error', errMsg(err, 'No se pudo cancelar la reserva.'))
            }
        }
    }

    const handleConfirmSale = (seat: Seat) => {
        const ticket = soldTickets.find(t => t.seat?.seat_number === seat.number && t.state === 'pending')
        if (ticket) {
            setTicketToConfirm(ticket)
            setShowConfirmSaleModal(true)
        }
    }

    const handleChangeSeat = (seat: Seat) => {
        const ticket = soldTickets.find(t => t.seat?.seat_number === seat.number && (t.state === 'confirmed' || t.state === 'paid' || t.state === 'pending'))
        if (ticket) {
            setSeatChangeTicket(ticket)
            setSeatChangeMode(true)
            handleClearSelection()
            setSeatMapKey(prev => prev + 1)
        }
    }

    const handleSelectionChange = async (seats: Seat[]) => {
        const prevIds = new Set(currentSelectedSeats.map(s => s.id))
        const newIds = new Set(seats.map(s => s.id))

        const added = seats.filter(s => !prevIds.has(s.id))
        for (const seat of added) {
            try {
                await seatService.lockSeat(tripId, seat.id)
            } catch {
                toast.error('No se pudo bloquear el asiento', { description: 'Otro usuario ya lo seleccionó.' })
                seats = seats.filter(s => s.id !== seat.id)
            }
        }

        const removed = currentSelectedSeats.filter(s => !newIds.has(s.id))
        if (removed.length > 0) {
            seatService.unlockSeats(tripId, removed.map(s => s.id)).catch(() => {})
        }

        setCurrentSelectedSeats(seats)
        setControlledSeatIds(seats.map(s => s.id))
        fetchLockedSeats(tripId)

        if (seatChangeMode && seats.length === 1) {
            setNewSelectedSeat(seats[0])
            setShowSeatChangeConfirmModal(true)
        }
    }

    // ── Derived state ─────────────────────────────────────────────────────
    const canDispatch = useMemo(() => {
        if (!trip?.trip_datetime) return false
        return new Date() >= new Date(trip.trip_datetime)
    }, [trip])

    const ticketStats = useMemo(() => {
        const total = trip?.total_seats || 0
        const sold = soldTickets.filter(t => ['confirmed', 'sold', 'paid'].includes(t.state)).length
        const reserved = soldTickets.filter(t => t.state === 'pending').length
        return { total, sold, reserved, available: Math.max(0, total - sold - reserved) }
    }, [trip, soldTickets])

    // ── Initial load ──────────────────────────────────────────────────────
    useEffect(() => {
        dispatch(fetchTripById(tripId))
        dispatch(fetchDrivers({}))
        dispatch(fetchAssistants({}))
        fetchSoldTickets(tripId)
        fetchPackages(tripId)
    }, [dispatch, tripId, fetchSoldTickets, fetchPackages])

    return {
        trip,
        loading,
        error,
        ticketStats,
        soldTickets,
        reservedSeatNumbers,
        formatDate,
        refreshTrip,

        drivers,
        assistants,

        dispatch: {
            show: showDispatchModal,
            setShow: setShowDispatchModal,
            executing: dispatching,
            execute: executeDispatch,
            canDispatch,
        },

        finish: {
            show: showFinishModal,
            setShow: setShowFinishModal,
            executing: finishing,
            execute: executeFinish,
        },

        staff,

        seatChange: {
            mode: seatChangeMode,
            ticket: seatChangeTicket,
            newSeat: newSelectedSeat,
            showConfirm: showSeatChangeConfirmModal,
            loading: seatChangeLoading,
            confirm: confirmSeatChange,
            cancel: cancelSeatChange,
        },

        ticketSale: {
            show: showTicketSaleModal,
            actionType: saleActionType,
            seats: selectedSeatsForSale,
            open: handleSellTicket,
            openReserve: handleReserveSeat,
            close: () => setShowTicketSaleModal(false),
            onCreated: handleTicketCreated,
        },

        confirmSale: {
            show: showConfirmSaleModal,
            ticket: ticketToConfirm,
            executing: confirmingSale,
            execute: executeConfirmSale,
            close: () => setShowConfirmSaleModal(false),
        },

        seatMap: {
            key: seatMapKey,
            selectedSeats: currentSelectedSeats,
            controlledIds: controlledSeatIds,
            lockedSeats,
            onSelectionChange: handleSelectionChange,
        },

        seatMapHandlers: {
            onCancelReservation: handleCancelReservation,
            onConfirmSale: handleConfirmSale,
            onChangeSeat: handleChangeSeat,
            onPreviewTicket: handlePreviewTicket,
        },

        ticketPreview: {
            show: showTicketPreview,
            ticket: ticketForPreview,
            open: (ticket: Ticket) => { setTicketForPreview(ticket); setShowTicketPreview(true) },
            close: () => { setShowTicketPreview(false); setTicketForPreview(null) },
        },

        findTicketBySeat,

        packages: packagesPanel,

        floatPanel: {
            onSellTicket: () => handleSellTicket(currentSelectedSeats),
            onReserveSeat: () => handleReserveSeat(currentSelectedSeats),
            onClearSelection: handleClearSelection,
            onRemoveSeat: handleRemoveSeat,
        },
    }
}
