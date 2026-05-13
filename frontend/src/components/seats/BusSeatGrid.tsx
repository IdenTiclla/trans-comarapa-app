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
            return 'border-status-full/80 bg-status-full/20 text-foreground cursor-not-allowed'
        } else if (seat.status === 'reserved') {
            return 'border-status-medium bg-status-medium/25 text-foreground cursor-not-allowed'
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
            // Yellow with dark text for WCAG AA (~8:1) — yellow + white would fail at 2.5:1
            return 'bg-status-medium text-gray-900'
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
        if (price === null || price === undefined) return '0'
        const n = parseFloat(String(price))
        if (!Number.isFinite(n)) return '0'
        return Number.isInteger(n) ? String(n) : n.toFixed(2)
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
            <div key={seat.id} className="seat-container break-inside-avoid min-w-0 flex h-full">
                <Button
                    type="button"
                    variant="ghost"
                    className={cn(
                        'seat-box relative flex h-full w-full min-w-0 flex-1 flex-col items-stretch justify-between gap-1 overflow-hidden rounded-lg border-2 p-1.5 text-center whitespace-normal transition-all min-h-36 sm:min-h-40 sm:gap-1.5 sm:p-2 lg:min-h-44 lg:p-2.5',
                        !isUnavailable && 'cursor-pointer',
                        getSeatClass(seat),
                    )}
                    onClick={() => toggleSeatSelection(seat)}
                    aria-pressed={isSelected}
                    aria-disabled={isUnavailable}
                    aria-label={`Asiento ${seat.number} - ${getSeatStatusText(seat)}${passengerName ? ` - ${passengerName}` : ''}${getSeatPrice(seat) ? ` - Bs. ${formatPrice(getSeatPrice(seat))}` : ''}`}
                    onContextMenu={(e) => handleContextMenu(e, seat)}
                >
                    {/* Top row: seat number + position (left) and price (right) — always on the same line */}
                    <div className="flex w-full min-w-0 flex-nowrap items-center justify-between gap-1">
                        <div className="inline-flex min-w-0 shrink items-baseline gap-1 rounded-md border border-border bg-card px-1.5 py-0.5 text-foreground shadow-sm">
                            <span className="text-[11px] font-extrabold leading-none sm:text-xs lg:text-sm">{seat.number}</span>
                            <span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground sm:text-[11px]" title={positionLabel}>
                                {positionLabel.charAt(0)}
                            </span>
                        </div>
                        {getSeatPrice(seat) ? (
                            <div
                                className="inline-flex shrink-0 items-center whitespace-nowrap rounded-full bg-primary px-1.5 py-0.5 text-[10px] font-bold text-primary-foreground sm:text-[11px]"
                                title={`Bs. ${formatPrice(getSeatPrice(seat))}`}
                            >
                                Bs. {formatPrice(getSeatPrice(seat))}
                            </div>
                        ) : null}
                    </div>

                    {/* Center: passenger info (centered) */}
                    <div className="flex w-full min-w-0 flex-1 flex-col items-center justify-center gap-0.5 text-center">
                        {isOccupiedOrReserved && (
                            <>
                                <div className="line-clamp-2 w-full break-words text-[10px] font-bold leading-tight text-foreground sm:text-xs lg:text-sm" title={passengerName}>
                                    {passengerName}
                                </div>
                                {passengerPhone && (
                                    <div className="w-full truncate text-[10px] font-medium leading-tight text-muted-foreground sm:text-[11px] lg:text-xs" title={passengerPhone}>
                                        {passengerPhone}
                                    </div>
                                )}
                                {dest && (
                                    <div className="w-full truncate text-[10px] font-semibold leading-tight text-primary sm:text-[11px] lg:text-xs" title={dest}>
                                        {dest}
                                    </div>
                                )}
                            </>
                        )}
                    </div>

                    {/* Bottom: status badge (centered, full width) */}
                    <div className="w-full min-w-0">
                        <span className={`block truncate rounded-full px-1.5 py-0.5 text-center text-[10px] font-bold leading-tight sm:px-2 sm:py-1 sm:text-[11px] lg:text-xs ${getStatusClass(seat)}`}>
                            {getSeatStatusShortText(seat)}
                        </span>
                    </div>
                </Button>
            </div>
        )
    }

    return (
        <div className="seat-map-container px-3 pb-5 sm:px-6 sm:pb-6 xl:px-8">
            <div className="lg:hidden flex justify-center mb-4 print:hidden">
                <div className="rounded-lg border border-border bg-muted px-4 py-2 text-sm font-bold text-foreground">
                    Pasillo central
                </div>
            </div>

            <div className={`relative grid grid-cols-1 rounded-xl border bg-muted/30 p-3 sm:p-5 lg:grid-cols-[minmax(0,1fr)_3rem_minmax(0,1fr)] lg:gap-4 xl:gap-5 2xl:gap-6 ${seatChangeMode ? 'border-status-medium/60 ring-2 ring-status-medium/20' : 'border-border'}`}>
                <div className="left-column min-w-0 lg:pr-2 xl:pr-4">
                    <div className="lg:hidden mb-4 flex items-center justify-center space-x-2 print:hidden">
                        <div className="w-3 h-3 bg-primary rounded-sm"></div>
                        <h3 className="text-sm font-bold text-foreground">Lado Izquierdo</h3>
                        <div className="w-3 h-3 bg-primary rounded-sm"></div>
                    </div>
                    <div className="grid auto-rows-fr grid-cols-2 gap-2 sm:gap-3 items-stretch">
                        {leftColumnSeats.map(renderSeat)}
                    </div>
                </div>

                <div className="center-aisle hidden lg:flex flex-col justify-center items-center px-2 print:!hidden">
                    <div className="flex h-full min-h-80 w-8 lg:w-10 items-center justify-center rounded-full border border-border bg-card shadow-sm">
                        <div className="rotate-90 whitespace-nowrap text-[11px] lg:text-xs font-black uppercase tracking-widest text-muted-foreground">
                            Pasillo
                        </div>
                    </div>
                </div>

                <div className="right-column mt-6 sm:mt-8 lg:mt-0 min-w-0 lg:pl-2 xl:pl-4">
                    <div className="lg:hidden mb-4 flex items-center justify-center space-x-2 print:hidden">
                        <div className="w-3 h-3 bg-status-available rounded-sm"></div>
                        <h3 className="text-sm font-bold text-foreground">Lado Derecho</h3>
                        <div className="w-3 h-3 bg-status-available rounded-sm"></div>
                    </div>
                    <div className="grid auto-rows-fr grid-cols-2 gap-2 sm:gap-3 items-stretch">
                        {rightColumnSeats.map(renderSeat)}
                    </div>
                </div>
            </div>
        </div>
    )
}
