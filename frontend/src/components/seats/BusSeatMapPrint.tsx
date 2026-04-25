import { useState, useEffect, useMemo } from 'react'
import DeckSelector from './DeckSelector'
import BusSeatGrid from './BusSeatGrid'
import BusSeatLegend from './BusSeatLegend'
import SeatContextMenu from './SeatContextMenu'
import { getEffectiveName } from '@/lib/person-utils'

interface LockedSeatInfo {
    seat_id: number
    user_id: number | null
    ttl: number
}

interface BackendSeat {
    id: number
    seat_number: number
    status?: string
    column?: number
    deck?: string
    [k: string]: unknown
}

interface SeatItem {
    id: number
    number: number
    status: string
    occupied: boolean
    locked: boolean
    position: string
    column: string
    deck: string
    passenger: { name: string; phone: string } | null
    seat_id?: number
}

interface TripLike {
    bus?: { floors?: number }
    seats_layout?: BackendSeat[]
    [k: string]: unknown
}

interface TicketLike {
    seat?: { id?: number; seat_number?: number | string }
    client?: { phone?: string; [k: string]: unknown }
    [k: string]: unknown
}

interface BusSeatMapPrintProps {
    trip: TripLike | null | undefined
    tickets?: TicketLike[]
    occupiedSeats?: SeatItem[]
    reserved_seat_numbers?: number[]
    lockedSeats?: LockedSeatInfo[]
    currentUserId?: number
    initialSelectedSeats?: Array<{ id?: number; seat_id?: number }>
    selectionEnabled?: boolean
    maxSelections?: number
    disabled?: boolean
    enableContextMenu?: boolean

    onSeatSelected?: (seat: SeatItem) => void
    onSeatDeselected?: (seat: SeatItem) => void
    onSelectionChange?: (seats: SeatItem[]) => void
    onCancelReservation?: (seat: SeatItem) => void
    onConfirmSale?: (seat: SeatItem) => void
    onChangeSeat?: (seat: SeatItem) => void
    onRescheduleTrip?: (seat: SeatItem) => void
    onGoToTicketPage?: (seat: SeatItem) => void
    onPreviewTicket?: (seat: SeatItem) => void
    seatChangeMode?: boolean
    controlledSelectedIds?: number[]
}

export default function BusSeatMapPrint({
    trip,
    tickets = [],
    reserved_seat_numbers = [],
    lockedSeats = [],
    currentUserId = 0,
    initialSelectedSeats = [],
    maxSelections = 0,
    disabled = false,
    enableContextMenu = false,

    onSeatSelected,
    onSeatDeselected,
    onSelectionChange,
    onCancelReservation,
    onConfirmSale,
    onChangeSeat,
    onRescheduleTrip,
    onGoToTicketPage,
    onPreviewTicket,
    seatChangeMode = false,
    controlledSelectedIds
}: BusSeatMapPrintProps) {
    const [selectedSeatIds, setSelectedSeatIds] = useState<number[]>([])
    const [selectedDeck, setSelectedDeck] = useState('FIRST')

    useEffect(() => {
        if (controlledSelectedIds !== undefined) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setSelectedSeatIds(controlledSelectedIds)
        }
    }, [controlledSelectedIds])

    const [showContextMenu, setShowContextMenu] = useState(false)
    const [contextMenuPosition, setContextMenuPosition] = useState({ x: 0, y: 0 })
    const [selectedSeatForContext, setSelectedSeatForContext] = useState<SeatItem | null>(null)

    const busFloors = trip?.bus?.floors || 1
    const isDoubleDeck = busFloors >= 2

    // Memoize input data by content so parent re-renders don't cause recomputation
    const ticketsStr = JSON.stringify(tickets)
    const reservedNumsStr = JSON.stringify(reserved_seat_numbers)
    const seatsLayoutStr = JSON.stringify(trip?.seats_layout)

    const safeTickets = useMemo(() => {
        try { return JSON.parse(ticketsStr) } catch { return [] }
    }, [ticketsStr])

    const safeReservedSeatNumbers = useMemo(() => {
        try { return JSON.parse(reservedNumsStr) } catch { return [] }
    }, [reservedNumsStr])

    // Only seats locked by OTHER users should appear as "locked"
    const lockedByOthersSeatIds = useMemo(() => {
        const set = new Set<number>()
        for (const lock of lockedSeats) {
            if (lock.user_id !== currentUserId) {
                set.add(lock.seat_id)
            }
        }
        return set
    }, [lockedSeats, currentUserId])

    // Compute seats synchronously — no async, no loading state, no flickering
    const seats = useMemo(() => {
        if (!trip?.seats_layout) return []

        let backendSeats: BackendSeat[]
        try {
            backendSeats = JSON.parse(seatsLayoutStr)
        } catch {
            return []
        }

        const generatedSeats: SeatItem[] = []

        for (const backendSeat of backendSeats) {
            const seatNumber = backendSeat.seat_number
            const isReserved = safeReservedSeatNumbers.includes(seatNumber)
            let status = backendSeat.status

            if (status === 'occupied' && isReserved) status = 'reserved'

            // Mark as locked if locked by another user and not already occupied/reserved
            const isLockedByOther = status !== 'occupied' && status !== 'reserved'
                && lockedByOthersSeatIds.has(backendSeat.id)

            if (isLockedByOther) status = 'locked'

            const ticket = (safeTickets as TicketLike[]).find((t) => t.seat?.id === backendSeat.id)
            let passenger = null
            if (ticket && ticket.client) {
                passenger = {
                    name: getEffectiveName(ticket.client),
                    phone: ticket.client?.phone || ''
                }
            }

            let column = 'unknown'
            let position = 'unknown'

            if (backendSeat.column != null) {
                column = backendSeat.column <= 2 ? 'left' : 'right'
                position = (backendSeat.column === 1 || backendSeat.column === 4) ? 'window' : 'aisle'
            } else {
                const typicalSeatsPerRow = 4
                const idxInRowGroup = (seatNumber - 1) % typicalSeatsPerRow
                if (idxInRowGroup < typicalSeatsPerRow / 2) {
                    column = 'left'
                    position = seatNumber % 2 !== 0 ? 'window' : 'aisle'
                } else {
                    column = 'right'
                    position = seatNumber % 2 !== 0 ? 'aisle' : 'window'
                }
            }

            generatedSeats.push({
                id: backendSeat.id,
                number: backendSeat.seat_number,
                status: status ?? 'available',
                occupied: status === 'occupied',
                locked: status === 'locked',
                position: position,
                column: column,
                deck: backendSeat.deck || 'FIRST',
                passenger: passenger
            })
        }

        return generatedSeats.sort((a, b) => a.number - b.number)
    }, [seatsLayoutStr, safeReservedSeatNumbers, safeTickets, trip?.seats_layout, lockedByOthersSeatIds])

    const filteredSeats = useMemo(() => {
        if (!isDoubleDeck) return seats
        return seats.filter(seat => seat.deck === selectedDeck)
    }, [seats, isDoubleDeck, selectedDeck])

    const occupiedSeatsCount = useMemo(() => {
        if (!filteredSeats) return 0
        return filteredSeats.filter(seat => seat.occupied).length
    }, [filteredSeats])

    const reservedSeatsCount = useMemo(() => {
        if (!filteredSeats) return 0
        return filteredSeats.filter(seat => seat.status === 'reserved').length
    }, [filteredSeats])

    const lockedSeatsCount = useMemo(() => {
        if (!filteredSeats) return 0
        return filteredSeats.filter(seat => seat.status === 'locked').length
    }, [filteredSeats])

    const availableSeatsCount = useMemo(() => {
        if (!filteredSeats) return 0
        return filteredSeats.length - occupiedSeatsCount - reservedSeatsCount - lockedSeatsCount
    }, [filteredSeats, occupiedSeatsCount, reservedSeatsCount, lockedSeatsCount])

    // Sync initialSelectedSeats
    useEffect(() => {
        if (initialSelectedSeats && initialSelectedSeats.length > 0) {
            const newIds = initialSelectedSeats.map(s => s.id || s.seat_id)
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setSelectedSeatIds(prev => {
                if (prev.length === newIds.length && prev.every((v, i) => v === newIds[i])) return prev
                return newIds
            })
        }
    }, [initialSelectedSeats])

    const handleSeatSelected = (seat: SeatItem, newSelectedIds: number[]) => {
        setSelectedSeatIds(newSelectedIds)
        if (onSeatSelected) onSeatSelected(seat)
        if (onSelectionChange) {
            onSelectionChange(seats.filter(s => newSelectedIds.includes(s.id)))
        }
    }

    const handleSeatDeselected = (seat: SeatItem, newSelectedIds: number[]) => {
        setSelectedSeatIds(newSelectedIds)
        if (onSeatDeselected) onSeatDeselected(seat)
        if (onSelectionChange) {
            onSelectionChange(seats.filter(s => newSelectedIds.includes(s.id)))
        }
    }

    const handleContextMenu = (event: React.MouseEvent, seat: SeatItem) => {
        if (!enableContextMenu) return
        event.preventDefault()
        setShowContextMenu(true)
        setContextMenuPosition({ x: event.clientX, y: event.clientY })
        setSelectedSeatForContext(seat)
    }

    useEffect(() => {
        const handleClick = () => {
            if (showContextMenu) {
                setShowContextMenu(false)
                setSelectedSeatForContext(null)
            }
        }
        document.addEventListener('click', handleClick)
        return () => document.removeEventListener('click', handleClick)
    }, [showContextMenu])

    const closeContext = () => {
        setShowContextMenu(false)
        setSelectedSeatForContext(null)
    }

    // Show empty state only if trip has no seats_layout at all
    if (!trip?.seats_layout) {
        return <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 sm:p-4 mb-4 shadow-sm"><p className="text-yellow-700 text-sm">No se pudo cargar la información de los asientos desde el viaje.</p></div>
    }

    return (
        <div className="bus-seat-map-print font-sans relative">
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden print:max-w-none print:shadow-none print:p-0">
                {isDoubleDeck && (
                    <div className="px-4 sm:px-6 md:px-8">
                        <DeckSelector
                            floors={busFloors}
                            selectedDeck={selectedDeck}
                            seats={seats}
                            occupiedSeatsCount={occupiedSeatsCount}
                            reservedSeatsCount={reservedSeatsCount}
                            availableSeatsCount={availableSeatsCount}
                            totalFilteredSeatsCount={filteredSeats.length}
                            onDeckChanged={(deck) => setSelectedDeck(deck)}
                        />
                    </div>
                )}

                <BusSeatGrid
                    seats={filteredSeats}
                    selectedSeatIds={selectedSeatIds}
                    disabled={disabled}
                    maxSelections={maxSelections}
                    tickets={tickets}
                    seatChangeMode={seatChangeMode}
                    onSeatSelected={handleSeatSelected}
                    onSeatDeselected={handleSeatDeselected}
                    onContextMenu={handleContextMenu}
                />

                <BusSeatLegend />
            </div>

            <SeatContextMenu
                visible={showContextMenu}
                position={contextMenuPosition}
                selectedSeat={selectedSeatForContext}
                enableContextMenu={enableContextMenu}
                onCancelReservation={() => {
                    if (selectedSeatForContext && onCancelReservation) onCancelReservation(selectedSeatForContext)
                    closeContext()
                }}
                onConfirmSale={() => {
                    if (selectedSeatForContext && onConfirmSale) onConfirmSale(selectedSeatForContext)
                    closeContext()
                }}
                onChangeSeat={() => {
                    if (selectedSeatForContext && onChangeSeat) onChangeSeat(selectedSeatForContext)
                    closeContext()
                }}
                onRescheduleTrip={() => {
                    if (selectedSeatForContext && onRescheduleTrip) onRescheduleTrip(selectedSeatForContext)
                    closeContext()
                }}
                onGoToTicketPage={onGoToTicketPage ? () => {
                    if (selectedSeatForContext) onGoToTicketPage(selectedSeatForContext)
                    closeContext()
                } : undefined}
                onPreviewTicket={onPreviewTicket ? () => {
                    if (selectedSeatForContext) onPreviewTicket(selectedSeatForContext)
                    closeContext()
                } : undefined}
            />
        </div>
    )
}

