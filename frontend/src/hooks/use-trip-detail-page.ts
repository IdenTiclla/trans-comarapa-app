import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { useAppDispatch, useAppSelector } from '@/store'
import { fetchTripById, selectCurrentTrip, selectTripLoading, selectTripError } from '@/store/trip.slice'
import { selectUser } from '@/store/auth.slice'
import { fetchDrivers, selectDrivers } from '@/store/driver.slice'
import { fetchAssistants, selectAssistants } from '@/store/assistant.slice'
import { tripService } from '@/services/trip.service'
import { seatService, type LockedSeatInfo } from '@/services/seat.service'
import { apiFetch } from '@/lib/api'
import { API_BASE_URL } from '@/lib/constants'
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
    const currentUser = useAppSelector(selectUser)

    const { soldTickets, reservedSeatNumbers, fetchSoldTickets, formatDate } = useTripDetails()

    // ── Packages ──────────────────────────────────────────────────────────
    const [tripPackages, setTripPackages] = useState<any[]>([])
    const [loadingPackages, setLoadingPackages] = useState(false)

    const fetchPackages = useCallback(async (tId: number) => {
        setLoadingPackages(true)
        try {
            const data = await apiFetch(`/packages/by-trip/${tId}`)
            setTripPackages(Array.isArray(data) ? data : [])
        } catch { setTripPackages([]) }
        finally { setLoadingPackages(false) }
    }, [])

    // ── Seat locks (real-time via WebSocket) ────────────────────────────
    const [lockedSeats, setLockedSeats] = useState<LockedSeatInfo[]>([])
    const wsRef = useRef<WebSocket | null>(null)
    const wsReconnectRef = useRef<ReturnType<typeof setTimeout> | null>(null)

    const fetchLockedSeats = useCallback(async (tId: number) => {
        try {
            const data = await seatService.getLockedSeats(tId)
            setLockedSeats(Array.isArray(data) ? data : [])
        } catch {
            setLockedSeats([])
        }
    }, [])

    // WebSocket connection for real-time lock updates (with polling fallback)
    const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)

    useEffect(() => {
        if (!tripId || !currentUser?.id) return

        let cancelled = false

        function startPolling() {
            if (pollRef.current || cancelled) return
            pollRef.current = setInterval(() => fetchLockedSeats(tripId), 3000)
        }

        function stopPolling() {
            if (pollRef.current) {
                clearInterval(pollRef.current)
                pollRef.current = null
            }
        }

        function connect() {
            if (cancelled) return

            // Derive WS URL from API_BASE_URL (e.g. http://localhost:8000/api/v1 -> ws://localhost:8000/api/v1)
            const wsBase = API_BASE_URL.replace(/^http/, 'ws')
            const wsUrl = `${wsBase}/seats/ws/${tripId}?user_id=${currentUser!.id}`

            let ws: WebSocket
            try {
                ws = new WebSocket(wsUrl)
            } catch {
                // WebSocket constructor failed — fall back to polling
                startPolling()
                return
            }
            wsRef.current = ws
            let wsConnected = false

            ws.onopen = () => {
                wsConnected = true
                // Stop polling fallback if it was running
                stopPolling()
            }

            ws.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data)
                    if (data.type === 'seat_locks_updated' && data.locks) {
                        setLockedSeats(data.locks)
                    }
                } catch { /* ignore non-JSON messages like "pong" */ }
            }

            ws.onclose = () => {
                wsRef.current = null
                if (!cancelled) {
                    // If WS never connected, fall back to polling
                    if (!wsConnected) {
                        startPolling()
                    } else {
                        // Reconnect after 3 seconds
                        wsReconnectRef.current = setTimeout(connect, 3000)
                    }
                }
            }

            ws.onerror = () => {
                ws.close()
            }

            // Send ping every 30s to keep connection alive
            const pingInterval = setInterval(() => {
                if (ws.readyState === WebSocket.OPEN) {
                    ws.send('ping')
                }
            }, 30000)

            ws.addEventListener('close', () => clearInterval(pingInterval))
        }

        // Initial HTTP fetch for immediate state, then connect WS
        fetchLockedSeats(tripId)
        connect()

        return () => {
            cancelled = true
            stopPolling()
            if (wsReconnectRef.current) clearTimeout(wsReconnectRef.current)
            if (wsRef.current) {
                wsRef.current.close()
                wsRef.current = null
            }
        }
    }, [tripId, currentUser?.id, fetchLockedSeats])

    // ── Global refresh ────────────────────────────────────────────────────
    const refreshTrip = useCallback(() => {
        dispatch(fetchTripById(tripId))
        fetchSoldTickets(tripId)
        fetchPackages(tripId)
        fetchLockedSeats(tripId)
    }, [dispatch, tripId, fetchSoldTickets, fetchPackages, fetchLockedSeats])

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
    const [showTicketPreview, setShowTicketPreview] = useState(false)
    const [ticketForPreview, setTicketForPreview] = useState<any>(null)

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
        // Unlock all currently selected seats
        if (currentSelectedSeats.length > 0) {
            seatService.unlockSeats(tripId, currentSelectedSeats.map(s => s.id)).catch(() => {})
        }
        setCurrentSelectedSeats([])
        setControlledSeatIds([])
    }, [tripId, currentSelectedSeats])

    const handleRemoveSeat = useCallback((seat: any) => {
        seatService.unlockSeats(tripId, [seat.id]).catch(() => {})
        setCurrentSelectedSeats(prev => prev.filter(s => s.id !== seat.id))
        setControlledSeatIds(prev => prev.filter(id => id !== seat.id))
    }, [tripId])

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
        // Locks are released by the backend on ticket creation, just clear local state
        setCurrentSelectedSeats([])
        setControlledSeatIds([])
        setSeatMapKey(prev => prev + 1)
    }

    const findTicketBySeat = (seat: any) => {
        return soldTickets.find(t => t.seat?.seat_number === seat.number) || null
    }

    const handlePreviewTicket = (seat: any) => {
        const ticket = findTicketBySeat(seat)
        if (ticket) {
            setTicketForPreview(ticket)
            setShowTicketPreview(true)
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

    const handleSelectionChange = async (seats: any[]) => {
        const prevIds = new Set(currentSelectedSeats.map(s => s.id))
        const newIds = new Set(seats.map(s => s.id))

        // Lock newly selected seats
        const added = seats.filter(s => !prevIds.has(s.id))
        for (const seat of added) {
            try {
                await seatService.lockSeat(tripId, seat.id)
            } catch {
                toast.error('No se pudo bloquear el asiento', {
                    description: 'Otro usuario ya lo seleccionó.',
                })
                // Remove the seat that couldn't be locked
                seats = seats.filter(s => s.id !== seat.id)
            }
        }

        // Unlock deselected seats
        const removed = currentSelectedSeats.filter(s => !newIds.has(s.id))
        if (removed.length > 0) {
            seatService.unlockSeats(tripId, removed.map(s => s.id)).catch(() => {})
        }

        setCurrentSelectedSeats(seats)
        setControlledSeatIds(seats.map(s => s.id))

        // Refresh lock state
        fetchLockedSeats(tripId)

        if (seatChangeMode && seats.length === 1) {
            setNewSelectedSeat(seats[0])
            setShowSeatChangeConfirmModal(true)
        }
    }

    // ── Packages ──────────────────────────────────────────────────────────
    const [showPackageAssignModal, setShowPackageAssignModal] = useState(false)
    const [showPackageDeliveryModal, setShowPackageDeliveryModal] = useState(false)
    const [showPackageReceptionModal, setShowPackageReceptionModal] = useState(false)
    const [showPackageRegistrationModal, setShowPackageRegistrationModal] = useState(false)
    const [selectedPackageForDelivery, setSelectedPackageForDelivery] = useState<any>(null)
    const [selectedPackageForReception, setSelectedPackageForReception] = useState<any>(null)

    const handleUnassignPackage = async (packageId: number) => {
        try {
            await apiFetch(`/packages/${packageId}/unassign`, { method: 'POST' })
            showNotification('success', 'Encomienda removida', 'La encomienda fue removida del viaje.')
            fetchPackages(tripId)
        } catch (err: any) { showNotification('error', 'Error', err?.message || 'No se pudo remover la encomienda.') }
    }

    const handleDeliverPackage = (packageId: number) => {
        const pkg = tripPackages.find(p => p.id === packageId)
        if (pkg) {
            setSelectedPackageForDelivery(pkg)
            setShowPackageDeliveryModal(true)
        }
    }

    const handleReceivePackage = (packageId: number) => {
        const pkg = tripPackages.find(p => p.id === packageId)
        if (pkg) {
            setSelectedPackageForReception(pkg)
            setShowPackageReceptionModal(true)
        }
    }

    const handlePackagesAssigned = () => {
        fetchPackages(tripId)
        showNotification('success', 'Encomiendas cargadas', 'Las encomiendas fueron asignadas al viaje.')
    }

    const handleDeliveryConfirm = () => {
        setShowPackageDeliveryModal(false)
        setSelectedPackageForDelivery(null)
        fetchPackages(tripId)
        showNotification('success', 'Encomienda entregada', 'La encomienda fue entregada correctamente.')
    }

    const handleReceptionConfirm = async (packageId: number) => {
        try {
            await apiFetch(`/packages/${packageId}/update-status`, {
                method: 'PUT',
                body: { new_status: 'arrived_at_destination' },
            })
            setShowPackageReceptionModal(false)
            setSelectedPackageForReception(null)
            fetchPackages(tripId)
            showNotification('success', 'Encomienda recibida', 'La encomienda fue marcada como recibida en destino.')
        } catch (err: any) {
            showNotification('error', 'Error', err?.message || 'No se pudo actualizar el estado.')
        }
    }

    const handlePackageRegistered = () => {
        // No cerramos el modal aquí para permitir ver el recibo
        // El modal se cerrará cuando el usuario haga clic en "Cerrar" en el recibo
        fetchPackages(tripId)
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
    // Locks are auto-released by the backend when the WebSocket disconnects
    // (on page refresh, navigation, or tab close)

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
            lockedSeats,
            onSelectionChange: handleSelectionChange,
        },

        // Seat map event handlers
        seatMapHandlers: {
            onCancelReservation: handleCancelReservation,
            onConfirmSale: handleConfirmSale,
            onChangeSeat: handleChangeSeat,
            onPreviewTicket: handlePreviewTicket,
        },

        // Ticket preview (printable receipt)
        ticketPreview: {
            show: showTicketPreview,
            ticket: ticketForPreview,
            open: (ticket: any) => { setTicketForPreview(ticket); setShowTicketPreview(true) },
            close: () => { setShowTicketPreview(false); setTicketForPreview(null) },
        },

        findTicketBySeat,

        // Packages
        packages: {
            items: tripPackages,
            loading: loadingPackages,
            unassign: handleUnassignPackage,
            deliver: handleDeliverPackage,
            receive: handleReceivePackage,
            openAssignModal: () => setShowPackageAssignModal(true),
            assignModal: {
                show: showPackageAssignModal,
                close: () => setShowPackageAssignModal(false),
                onAssigned: handlePackagesAssigned,
            },
            deliveryModal: {
                show: showPackageDeliveryModal,
                packageData: selectedPackageForDelivery,
                close: () => { setShowPackageDeliveryModal(false); setSelectedPackageForDelivery(null) },
                onConfirm: handleDeliveryConfirm,
            },
            receptionModal: {
                show: showPackageReceptionModal,
                packageData: selectedPackageForReception,
                close: () => { setShowPackageReceptionModal(false); setSelectedPackageForReception(null) },
                onConfirm: handleReceptionConfirm,
            },
            registrationModal: {
                show: showPackageRegistrationModal,
                open: () => setShowPackageRegistrationModal(true),
                close: () => setShowPackageRegistrationModal(false),
                onRegistered: handlePackageRegistered,
            },
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
