import { useState, useEffect, useMemo } from 'react'
import BusTripHeader from './BusTripHeader'
import DeckSelector from './DeckSelector'
import BusSeatGrid from './BusSeatGrid'
import BusSeatLegend from './BusSeatLegend'
import SeatContextMenu from './SeatContextMenu'
import { getEffectiveName } from '@/lib/person-utils'

interface BusSeatMapPrintProps {
    trip: any
    tickets?: any[]
    occupiedSeats?: any[]
    reserved_seat_numbers?: number[]
    initialSelectedSeats?: any[]
    selectionEnabled?: boolean
    maxSelections?: number
    disabled?: boolean
    enableContextMenu?: boolean
    editable?: boolean
    drivers?: any[]
    assistants?: any[]
    editingDriver?: boolean
    editingAssistant?: boolean
    selectedDriverId?: number | null
    selectedAssistantId?: number | null
    savingDriver?: boolean
    savingAssistant?: boolean

    onSeatSelected?: (seat: any) => void
    onSeatDeselected?: (seat: any) => void
    onSelectionChange?: (seats: any[]) => void
    onCancelReservation?: (seat: any) => void
    onConfirmSale?: (seat: any) => void
    onViewDetails?: (seat: any) => void
    onChangeSeat?: (seat: any) => void
    onRescheduleTrip?: (seat: any) => void
    onStartEditDriver?: () => void
    onSaveDriver?: () => void
    onCancelEditDriver?: () => void
    onStartEditAssistant?: () => void
    onSaveAssistant?: () => void
    onCancelEditAssistant?: () => void
    onUpdateSelectedDriverId?: (id: number | null) => void
    onUpdateSelectedAssistantId?: (id: number | null) => void
    seatChangeMode?: boolean
    controlledSelectedIds?: number[]
}

export default function BusSeatMapPrint({
    trip,
    tickets = [],
    reserved_seat_numbers = [],
    initialSelectedSeats = [],
    maxSelections = 0,
    disabled = false,
    enableContextMenu = false,
    editable = false,
    drivers = [],
    assistants = [],
    editingDriver = false,
    editingAssistant = false,
    selectedDriverId = null,
    selectedAssistantId = null,
    savingDriver = false,
    savingAssistant = false,

    onSeatSelected,
    onSeatDeselected,
    onSelectionChange,
    onCancelReservation,
    onConfirmSale,
    onViewDetails,
    onChangeSeat,
    onRescheduleTrip,
    onStartEditDriver,
    onSaveDriver,
    onCancelEditDriver,
    onStartEditAssistant,
    onSaveAssistant,
    onCancelEditAssistant,
    onUpdateSelectedDriverId,
    onUpdateSelectedAssistantId,
    seatChangeMode = false,
    controlledSelectedIds
}: BusSeatMapPrintProps) {
    const [selectedSeatIds, setSelectedSeatIds] = useState<number[]>([])
    const [selectedDeck, setSelectedDeck] = useState('FIRST')

    useEffect(() => {
        if (controlledSelectedIds !== undefined) {
            setSelectedSeatIds(controlledSelectedIds)
        }
    }, [controlledSelectedIds])

    const [showContextMenu, setShowContextMenu] = useState(false)
    const [contextMenuPosition, setContextMenuPosition] = useState({ x: 0, y: 0 })
    const [selectedSeatForContext, setSelectedSeatForContext] = useState<any>(null)

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

    // Compute seats synchronously — no async, no loading state, no flickering
    const seats = useMemo(() => {
        if (!trip?.seats_layout) return []

        let backendSeats: any[]
        try {
            backendSeats = JSON.parse(seatsLayoutStr)
        } catch {
            return []
        }

        const generatedSeats = []

        for (const backendSeat of backendSeats) {
            const seatNumber = backendSeat.seat_number
            const isReserved = safeReservedSeatNumbers.includes(seatNumber)
            let status = backendSeat.status

            if (status === 'occupied' && isReserved) status = 'reserved'

            const ticket = safeTickets.find((t: any) => t.seat?.id === backendSeat.id)
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
                status: status,
                occupied: status === 'occupied',
                position: position,
                column: column,
                deck: backendSeat.deck || 'FIRST',
                passenger: passenger
            })
        }

        return generatedSeats.sort((a, b) => a.number - b.number)
    }, [seatsLayoutStr, safeReservedSeatNumbers, safeTickets, trip?.seats_layout])

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

    const availableSeatsCount = useMemo(() => {
        if (!filteredSeats) return 0
        return filteredSeats.length - occupiedSeatsCount - reservedSeatsCount
    }, [filteredSeats, occupiedSeatsCount, reservedSeatsCount])

    // Sync initialSelectedSeats
    useEffect(() => {
        if (initialSelectedSeats && initialSelectedSeats.length > 0) {
            const newIds = initialSelectedSeats.map(s => s.id || s.seat_id)
            setSelectedSeatIds(prev => {
                if (prev.length === newIds.length && prev.every((v, i) => v === newIds[i])) return prev
                return newIds
            })
        }
    }, [initialSelectedSeats])

    const handleSeatSelected = (seat: any, newSelectedIds: number[]) => {
        setSelectedSeatIds(newSelectedIds)
        if (onSeatSelected) onSeatSelected(seat)
        if (onSelectionChange) {
            onSelectionChange(seats.filter(s => newSelectedIds.includes(s.id)))
        }
    }

    const handleSeatDeselected = (seat: any, newSelectedIds: number[]) => {
        setSelectedSeatIds(newSelectedIds)
        if (onSeatDeselected) onSeatDeselected(seat)
        if (onSelectionChange) {
            onSelectionChange(seats.filter(s => newSelectedIds.includes(s.id)))
        }
    }

    const handleContextMenu = (event: any, seat: any) => {
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
                <BusTripHeader
                    trip={trip}
                    occupiedSeatsCount={occupiedSeatsCount}
                    reservedSeatsCount={reservedSeatsCount}
                    availableSeatsCount={availableSeatsCount}
                    totalSeatsCount={filteredSeats.length}
                    isDoubleDeck={isDoubleDeck}
                    editable={editable}
                    drivers={drivers}
                    assistants={assistants}
                    editingDriver={editingDriver}
                    editingAssistant={editingAssistant}
                    selectedDriverId={selectedDriverId}
                    selectedAssistantId={selectedAssistantId}
                    savingDriver={savingDriver}
                    savingAssistant={savingAssistant}
                    onStartEditDriver={onStartEditDriver || (() => { })}
                    onSaveDriver={onSaveDriver || (() => { })}
                    onCancelEditDriver={onCancelEditDriver || (() => { })}
                    onStartEditAssistant={onStartEditAssistant || (() => { })}
                    onSaveAssistant={onSaveAssistant || (() => { })}
                    onCancelEditAssistant={onCancelEditAssistant || (() => { })}
                    onUpdateSelectedDriverId={onUpdateSelectedDriverId || (() => { })}
                    onUpdateSelectedAssistantId={onUpdateSelectedAssistantId || (() => { })}
                />

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
                onViewDetails={() => {
                    if (selectedSeatForContext && onViewDetails) onViewDetails(selectedSeatForContext)
                    closeContext()
                }}
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
            />
        </div>
    )
}

