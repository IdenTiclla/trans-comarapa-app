import { useState, useEffect, useCallback, useMemo } from 'react'
import { useAppDispatch, useAppSelector } from '@/store'
import { fetchTripById, selectCurrentTrip, selectTripLoading, selectTripError } from '@/store/trip.slice'
import { fetchDrivers, selectDrivers } from '@/store/driver.slice'
import { fetchAssistants, selectAssistants } from '@/store/assistant.slice'
import { tripService } from '@/services/trip.service'
import { apiFetch } from '@/lib/api'
import { useTripDetails } from '@/hooks/use-trip-details'
import { toast } from 'sonner'

function showNotification(type: 'success' | 'error', title: string, message: string) {
    if (type === 'success') {
        toast.success(title, { description: message })
    } else {
        toast.error(title, { description: message })
    }
}

export function useTripDetailPage(tripId: number) {
    const dispatch = useAppDispatch()

    const trip = useAppSelector(selectCurrentTrip) as any
    const loading = useAppSelector(selectTripLoading)
    const error = useAppSelector(selectTripError)
    const drivers = useAppSelector(selectDrivers) as any[]
    const assistants = useAppSelector(selectAssistants) as any[]

    const { soldTickets, reservedSeatNumbers, fetchSoldTickets, formatDate } = useTripDetails()

    // ── Packages ──────────────────────────────────────────────────────────
    const [tripPackages, setTripPackages] = useState<any[]>([])
    const [loadingPackages, setLoadingPackages] = useState(false)

    const fetchPackages = useCallback(async (tId: number) => {
        setLoadingPackages(true)
        try {
            const data = await apiFetch(`/packages/trip/${tId}`)
            setTripPackages(Array.isArray(data) ? data : [])
        } catch { setTripPackages([]) }
        finally { setLoadingPackages(false) }
    }, [])

    // ── Global refresh ────────────────────────────────────────────────────
    const refreshTrip = useCallback(() => {
        dispatch(fetchTripById(tripId))
        fetchSoldTickets(tripId)
        fetchPackages(tripId)
    }, [dispatch, tripId, fetchSoldTickets, fetchPackages])

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
        } catch (err: any) {
            showNotification('error', 'Error', err?.message || 'No se pudo despachar el viaje.')
        } finally { setDispatching(false) }
    }

    const executeFinish = async () => {
        setFinishing(true)
        try {
            await tripService.finish(tripId)
            showNotification('success', 'Viaje terminado', 'El viaje ha sido marcado como terminado.')
            setShowFinishModal(false)
            refreshTrip()
        } catch (err: any) {
            showNotification('error', 'Error', err?.message || 'No se pudo terminar el viaje.')
        } finally { setFinishing(false) }
    }

    // ── Staff editors ─────────────────────────────────────────────────────
    const [editingDriver, setEditingDriver] = useState(false)
    const [editingAssistant, setEditingAssistant] = useState(false)
    const [selectedDriverId, setSelectedDriverId] = useState<string>('')
    const [selectedAssistantId, setSelectedAssistantId] = useState<string>('')
    const [savingDriver, setSavingDriver] = useState(false)
    const [savingAssistant, setSavingAssistant] = useState(false)

    const saveDriver = async () => {
        setSavingDriver(true)
        try {
            await apiFetch(`/trips/${tripId}`, { method: 'PUT', body: { driver_id: selectedDriverId ? Number(selectedDriverId) : null } })
            setEditingDriver(false)
            showNotification('success', 'Conductor actualizado', 'El conductor ha sido actualizado.')
            refreshTrip()
        } catch { showNotification('error', 'Error', 'No se pudo actualizar el conductor.') }
        finally { setSavingDriver(false) }
    }

    const saveAssistant = async () => {
        setSavingAssistant(true)
        try {
            await apiFetch(`/trips/${tripId}`, { method: 'PUT', body: { assistant_id: selectedAssistantId ? Number(selectedAssistantId) : null } })
            setEditingAssistant(false)
            showNotification('success', 'Asistente actualizado', 'El asistente ha sido actualizado.')
            refreshTrip()
        } catch { showNotification('error', 'Error', 'No se pudo actualizar el asistente.') }
        finally { setSavingAssistant(false) }
    }

    // ── Ticket sale/view modals ───────────────────────────────────────────
    const [showTicketSaleModal, setShowTicketSaleModal] = useState(false)
    const [saleActionType, setSaleActionType] = useState<'sell' | 'reserve'>('sell')
    const [selectedSeatsForSale, setSelectedSeatsForSale] = useState<any[]>([])
    const [showTicketModal, setShowTicketModal] = useState(false)
    const [selectedTicketForView, setSelectedTicketForView] = useState<any>(null)

    // ── Confirm sale modal ────────────────────────────────────────────────
    const [showConfirmSaleModal, setShowConfirmSaleModal] = useState(false)
    const [ticketToConfirm, setTicketToConfirm] = useState<any>(null)
    const [confirmingSale, setConfirmingSale] = useState(false)

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
        } catch (err: any) {
            showNotification('error', 'Error', err?.message || 'No se pudo confirmar la venta.')
        } finally { setConfirmingSale(false) }
    }

    // ── Seat change ───────────────────────────────────────────────────────
    const [seatChangeMode, setSeatChangeMode] = useState(false)
    const [seatChangeTicket, setSeatChangeTicket] = useState<any>(null)
    const [newSelectedSeat, setNewSelectedSeat] = useState<any>(null)
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
        } catch (err: any) {
            showNotification('error', 'Error', err?.message || 'No se pudo cambiar el asiento.')
        } finally { setSeatChangeLoading(false) }
    }, [seatChangeTicket, newSelectedSeat, refreshTrip, cancelSeatChange])

    // ── Seat map / selection ──────────────────────────────────────────────
    const [seatMapKey, setSeatMapKey] = useState(0)
    const [currentSelectedSeats, setCurrentSelectedSeats] = useState<any[]>([])
    const [controlledSeatIds, setControlledSeatIds] = useState<number[]>([])

    const handleClearSelection = useCallback(() => {
        setCurrentSelectedSeats([])
        setControlledSeatIds([])
    }, [])

    const handleRemoveSeat = useCallback((seat: any) => {
        setCurrentSelectedSeats(prev => prev.filter(s => s.id !== seat.id))
        setControlledSeatIds(prev => prev.filter(id => id !== seat.id))
    }, [])

    const handleSellTicket = useCallback((seats: any[] | any) => {
        const seatsArray = Array.isArray(seats) ? seats : [seats]
        setSelectedSeatsForSale(seatsArray)
        setSaleActionType('sell')
        setShowTicketSaleModal(true)
    }, [])

    const handleReserveSeat = useCallback((seats: any[] | any) => {
        const seatsArray = Array.isArray(seats) ? seats : [seats]
        setSelectedSeatsForSale(seatsArray)
        setSaleActionType('reserve')
        setShowTicketSaleModal(true)
    }, [])

    const handleTicketCreated = () => {
        setShowTicketSaleModal(false)
        refreshTrip()
        handleClearSelection()
        setSeatMapKey(prev => prev + 1)
    }

    const handleViewDetails = (seat: any) => {
        const ticket = soldTickets.find(t => t.seat?.seat_number === seat.number)
        if (ticket) {
            setSelectedTicketForView(ticket)
            setShowTicketModal(true)
        }
    }

    const handleCancelReservation = async (seat: any) => {
        const ticket = soldTickets.find(t => t.seat?.seat_number === seat.number && t.state === 'pending')
        if (ticket) {
            try {
                await apiFetch(`/tickets/${ticket.id}/cancel`, { method: 'PUT' })
                showNotification('success', 'Reserva cancelada', 'La reserva ha sido cancelada exitosamente.')
                refreshTrip()
                setSeatMapKey(prev => prev + 1)
            } catch (err: any) {
                showNotification('error', 'Error', err?.message || 'No se pudo cancelar la reserva.')
            }
        }
    }

    const handleConfirmSale = (seat: any) => {
        const ticket = soldTickets.find(t => t.seat?.seat_number === seat.number && t.state === 'pending')
        if (ticket) {
            setTicketToConfirm(ticket)
            setShowConfirmSaleModal(true)
        }
    }

    const handleChangeSeat = (seat: any) => {
        const ticket = soldTickets.find(t => t.seat?.seat_number === seat.number && (t.state === 'confirmed' || t.state === 'paid' || t.state === 'pending'))
        if (ticket) {
            setSeatChangeTicket(ticket)
            setSeatChangeMode(true)
            handleClearSelection()
            setSeatMapKey(prev => prev + 1)
        }
    }

    const handleSelectionChange = (seats: any[]) => {
        setCurrentSelectedSeats(seats)
        setControlledSeatIds(seats.map(s => s.id))
        if (seatChangeMode && seats.length === 1) {
            setNewSelectedSeat(seats[0])
            setShowSeatChangeConfirmModal(true)
        }
    }

    // ── Packages ──────────────────────────────────────────────────────────
    const handleUnassignPackage = async (packageId: number) => {
        try {
            await apiFetch(`/packages/${packageId}/unassign`, { method: 'POST' })
            showNotification('success', 'Encomienda removida', 'La encomienda fue removida del viaje.')
            fetchPackages(tripId)
        } catch (err: any) { showNotification('error', 'Error', err?.message || 'No se pudo remover la encomienda.') }
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

    // ── Effects ───────────────────────────────────────────────────────────
    useEffect(() => {
        dispatch(fetchTripById(tripId))
        dispatch(fetchDrivers({}))
        dispatch(fetchAssistants({}))
        fetchSoldTickets(tripId)
        fetchPackages(tripId)
    }, [dispatch, tripId, fetchSoldTickets, fetchPackages])

    useEffect(() => {
        if (trip) {
            setSelectedDriverId(String(trip.driver?.id || ''))
            setSelectedAssistantId(String(trip.assistant?.id || ''))
        }
    }, [trip])

    return {
        // Trip data
        trip,
        loading,
        error,
        ticketStats,
        soldTickets,
        reservedSeatNumbers,
        formatDate,
        refreshTrip,

        // Drivers / assistants data (for staff editor)
        drivers,
        assistants,

        // Dispatch
        dispatch: {
            show: showDispatchModal,
            setShow: setShowDispatchModal,
            executing: dispatching,
            execute: executeDispatch,
            canDispatch,
        },

        // Finish
        finish: {
            show: showFinishModal,
            setShow: setShowFinishModal,
            executing: finishing,
            execute: executeFinish,
        },

        // Staff
        staff: {
            editingDriver,
            setEditingDriver,
            editingAssistant,
            setEditingAssistant,
            selectedDriverId,
            setSelectedDriverId,
            selectedAssistantId,
            setSelectedAssistantId,
            savingDriver,
            savingAssistant,
            saveDriver,
            saveAssistant,
        },

        // Seat change
        seatChange: {
            mode: seatChangeMode,
            ticket: seatChangeTicket,
            newSeat: newSelectedSeat,
            showConfirm: showSeatChangeConfirmModal,
            loading: seatChangeLoading,
            confirm: confirmSeatChange,
            cancel: cancelSeatChange,
        },

        // Ticket sale
        ticketSale: {
            show: showTicketSaleModal,
            actionType: saleActionType,
            seats: selectedSeatsForSale,
            open: handleSellTicket,
            openReserve: handleReserveSeat,
            close: () => setShowTicketSaleModal(false),
            onCreated: handleTicketCreated,
        },

        // Ticket view
        ticketView: {
            show: showTicketModal,
            ticket: selectedTicketForView,
            open: handleViewDetails,
            close: () => { setShowTicketModal(false); setSelectedTicketForView(null) },
        },

        // Confirm sale
        confirmSale: {
            show: showConfirmSaleModal,
            ticket: ticketToConfirm,
            executing: confirmingSale,
            execute: executeConfirmSale,
            close: () => setShowConfirmSaleModal(false),
        },

        // Seat map
        seatMap: {
            key: seatMapKey,
            selectedSeats: currentSelectedSeats,
            controlledIds: controlledSeatIds,
            onSelectionChange: handleSelectionChange,
        },

        // Seat map event handlers
        seatMapHandlers: {
            onViewDetails: handleViewDetails,
            onCancelReservation: handleCancelReservation,
            onConfirmSale: handleConfirmSale,
            onChangeSeat: handleChangeSeat,
        },

        // Packages
        packages: {
            items: tripPackages,
            loading: loadingPackages,
            unassign: handleUnassignPackage,
        },

        // Float panel
        floatPanel: {
            onSellTicket: () => handleSellTicket(currentSelectedSeats),
            onReserveSeat: () => handleReserveSeat(currentSelectedSeats),
            onClearSelection: handleClearSelection,
            onRemoveSeat: handleRemoveSeat,
        },
    }
}
