import { useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface SeatItem {
    id: number
    number: number
    column: string
    position: string
    occupied: boolean
    locked: boolean
    deck: string
    status: string
    passenger: { name: string; phone: string } | null
    [key: string]: unknown
}

interface SeatTicket {
    seat?: { seat_number?: number | string }
    price?: number | string
    destination?: string
    destination_location?: { name?: string }
    [key: string]: unknown
}

interface BusSeatGridProps {
    seats: SeatItem[]
    selectedSeatIds: number[]
    disabled?: boolean
    maxSelections?: number
    tickets?: SeatTicket[]

    onSeatSelected?: (seat: SeatItem, newSelectedIds: number[]) => void
    onSeatDeselected?: (seat: SeatItem, newSelectedIds: number[]) => void
    onContextMenu?: (event: React.MouseEvent<HTMLButtonElement>, seat: SeatItem) => void
    seatChangeMode?: boolean
}

export default function BusSeatGrid({
    seats,
    selectedSeatIds,
    disabled = false,
    maxSelections = 0,
    tickets = [],
    onSeatSelected,
    onSeatDeselected,
    onContextMenu,
    seatChangeMode = false
}: BusSeatGridProps) {
    const leftColumnSeats = useMemo(() => seats.filter(seat => seat.column === 'left'), [seats])
    const rightColumnSeats = useMemo(() => seats.filter(seat => seat.column === 'right'), [seats])

    const getSeatClass = (seat: SeatItem) => {
        if (seat.occupied) {
            return 'border-status-full/50 bg-status-full/10 text-foreground cursor-not-allowed'
        } else if (seat.status === 'reserved') {
            return 'border-status-medium/60 bg-status-medium/10 text-foreground cursor-not-allowed'
        } else if (seat.status === 'locked') {
            return 'border-border bg-muted text-muted-foreground cursor-not-allowed opacity-80'
        } else if (selectedSeatIds.includes(seat.id)) {
            return 'border-primary bg-primary/10 text-foreground shadow-md ring-2 ring-primary/20'
        } else if (seatChangeMode) {
            return 'border-status-available/70 bg-status-available/10 text-foreground shadow-sm'
        } else {
            return 'border-status-available/50 bg-status-available/10 text-foreground hover:border-status-available hover:bg-status-available/15 hover:shadow-md'
        }
    }
    const getStatusClass = (seat: SeatItem) => {
        if (seat.occupied) {
            return 'bg-status-full text-primary-foreground'
        } else if (seat.status === 'reserved') {
            return 'bg-status-medium text-primary-foreground'
        } else if (seat.status === 'locked') {
            return 'border border-border bg-muted text-muted-foreground'
        } else if (selectedSeatIds.includes(seat.id)) {
            return 'bg-primary text-primary-foreground'
        } else {
            return 'bg-status-available text-primary-foreground'
        }
    }

    const getSeatStatusText = (seat: SeatItem) => {
        if (seat.occupied) return 'OCUPADO'
        if (seat.status === 'reserved') return 'RESERVADO'
        if (seat.status === 'locked') return 'BLOQUEADO'
        if (selectedSeatIds.includes(seat.id)) return 'SELECCIONADO'
        return 'DISPONIBLE'
    }

    const getSeatStatusShortText = (seat: SeatItem) => {
        if (seat.occupied) return 'Ocupado'
        if (seat.status === 'reserved') return 'Reserv.'
        if (seat.status === 'locked') return 'Bloq.'
        if (selectedSeatIds.includes(seat.id)) return 'Selec.'
        return 'Libre'
    }

    const toggleSeatSelection = (seat: SeatItem) => {
        if (seat.occupied || seat.status === 'reserved' || seat.status === 'locked' || disabled) return

        const index = selectedSeatIds.indexOf(seat.id)
        let newSelectedIds: number[]

        if (index === -1) {
            if (seatChangeMode) {
                newSelectedIds = [seat.id]
            } else {
                if (maxSelections > 0 && selectedSeatIds.length >= maxSelections) return
                newSelectedIds = [...selectedSeatIds, seat.id]
            }
            if (onSeatSelected) onSeatSelected(seat, newSelectedIds)
        } else {
            newSelectedIds = selectedSeatIds.filter(id => id !== seat.id)
            if (onSeatDeselected) onSeatDeselected(seat, newSelectedIds)
        }
    }

    const handleContextMenu = (event: React.MouseEvent<HTMLButtonElement>, seat: SeatItem) => {
        event.preventDefault()
        if (onContextMenu) onContextMenu(event, seat)
    }

    const getSeatPrice = (seat: SeatItem) => {
        if (!seat.occupied && seat.status !== 'reserved') return null
        const ticket = tickets.find(t => t.seat && t.seat.seat_number === seat.number)
        return ticket?.price || null
    }

    const formatPrice = (price: number | string | null | undefined) => {
        if (price === null || price === undefined) return '0.00'
        return parseFloat(String(price)).toFixed(2)
    }

    const getSeatDestination = (seat: SeatItem) => {
        if (!seat.occupied && seat.status !== 'reserved') return null
        const ticket = tickets.find(t => t.seat && t.seat.seat_number === seat.number)
        if (!ticket) return null

        if (ticket.destination && ticket.destination.trim()) return ticket.destination
        if (ticket.destination_location?.name) return ticket.destination_location.name

        return null
    }

    const renderSeat = (seat: SeatItem) => {
        const isOccupiedOrReserved = seat.occupied || seat.status === 'reserved'
        const isUnavailable = isOccupiedOrReserved || seat.status === 'locked' || disabled
        const passengerName = isOccupiedOrReserved ? (seat.passenger?.name || '') : ''
        const passengerPhone = isOccupiedOrReserved ? (seat.passenger?.phone || '') : ''
        const dest = getSeatDestination(seat)
        const positionLabel = seat.position === 'window' ? 'Ventana' : 'Pasillo'
        const isSelected = selectedSeatIds.includes(seat.id)

        return (
            <div key={seat.id} className="seat-container break-inside-avoid">
                <div className="mb-2 flex items-center justify-center">
                    <div className="inline-flex items-center gap-1 rounded-full border border-border bg-card px-2.5 py-1 text-xs font-bold text-foreground shadow-sm">
                        <span>{seat.number}</span>
                        <span className="text-[10px] font-semibold text-muted-foreground">{positionLabel}</span>
                    </div>
                </div>
                <Button
                    type="button"
                    variant="ghost"
                    className={cn(
                        'seat-box relative flex h-auto min-h-28 w-full flex-col justify-between overflow-hidden rounded-lg border-2 p-2 text-center whitespace-normal transition-all sm:min-h-32 sm:p-3',
                        !isUnavailable && 'cursor-pointer',
                        getSeatClass(seat),
                    )}
                    onClick={() => toggleSeatSelection(seat)}
                    aria-pressed={isSelected}
                    aria-disabled={isUnavailable}
                    aria-label={`Asiento ${seat.number} - ${getSeatStatusText(seat)}${passengerName ? ` - ${passengerName}` : ''}`}
                    onContextMenu={(e) => handleContextMenu(e, seat)}
                >
                    {getSeatPrice(seat) && (
                        <div className="absolute top-2 right-2">
                            <div className="rounded-full bg-primary px-1.5 py-0.5 text-[10px] font-bold text-primary-foreground sm:text-xs">
                                Bs. {formatPrice(getSeatPrice(seat))}
                            </div>
                        </div>
                    )}

                    <div className="flex min-h-16 flex-grow flex-col items-center justify-center px-1 pt-5 pb-2 text-center sm:px-2">
                        <div className={`h-4 w-full truncate text-[10px] font-bold leading-tight text-foreground sm:text-sm ${!isOccupiedOrReserved ? 'opacity-0' : ''}`} title={passengerName}>
                            {passengerName}
                        </div>
                        <div className={`mt-1 h-4 text-[10px] font-medium text-muted-foreground sm:text-xs ${!isOccupiedOrReserved ? 'opacity-0' : ''}`}>
                            {passengerPhone}
                        </div>
                        <div className={`mt-1 h-4 w-full truncate text-[10px] font-semibold text-primary sm:text-xs ${!dest ? 'opacity-0' : ''}`} title={dest || ''}>
                            {dest ? `→ ${dest}` : ''}
                        </div>
                    </div>

                    <div className="flex-shrink-0 w-full">
                        <span className={`block truncate rounded-full px-1 py-0.5 text-center text-[10px] font-bold sm:px-2 sm:py-1 sm:text-xs ${getStatusClass(seat)}`}>
                            {getSeatStatusShortText(seat)}
                        </span>
                    </div>
                </Button>
            </div>
        )
    }

    return (
        <div className="seat-map-container px-4 pb-5 sm:px-6 sm:pb-6 md:px-8">
            <div className="md:hidden flex justify-center mb-4 print:hidden">
                <div className="rounded-lg border border-border bg-muted px-4 py-2 text-sm font-bold text-foreground">
                    Pasillo central
                </div>
            </div>

            <div className={`relative grid grid-cols-1 rounded-xl border bg-muted/30 p-3 sm:p-5 md:grid-cols-[minmax(0,1fr)_4rem_minmax(0,1fr)] md:gap-5 lg:gap-6 ${seatChangeMode ? 'border-status-medium/60 ring-2 ring-status-medium/20' : 'border-border'}`}>
                <div className="left-column md:pr-4">
                    <div className="md:hidden mb-4 flex items-center justify-center space-x-2 print:hidden">
                        <div className="w-3 h-3 bg-primary rounded-sm"></div>
                        <h3 className="text-sm font-bold text-foreground">Lado Izquierdo</h3>
                        <div className="w-3 h-3 bg-primary rounded-sm"></div>
                    </div>
                    <div className="grid grid-cols-2 gap-3 sm:gap-4">
                        {leftColumnSeats.map(renderSeat)}
                    </div>
                </div>

                <div className="center-aisle hidden md:flex flex-col justify-center items-center px-4 print:!hidden">
                    <div className="flex h-full min-h-80 w-10 items-center justify-center rounded-full border border-border bg-card shadow-sm">
                        <div className="rotate-90 whitespace-nowrap text-xs font-black uppercase tracking-widest text-muted-foreground">
                            Pasillo
                        </div>
                    </div>
                </div>

                <div className="right-column mt-6 sm:mt-8 md:mt-0 md:pl-4">
                    <div className="md:hidden mb-4 flex items-center justify-center space-x-2 print:hidden">
                        <div className="w-3 h-3 bg-status-available rounded-sm"></div>
                        <h3 className="text-sm font-bold text-foreground">Lado Derecho</h3>
                        <div className="w-3 h-3 bg-status-available rounded-sm"></div>
                    </div>
                    <div className="grid grid-cols-2 gap-3 sm:gap-4">
                        {rightColumnSeats.map(renderSeat)}
                    </div>
                </div>
            </div>
        </div>
    )
}
