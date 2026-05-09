import { useState, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { X, ChevronUp, Ticket, CalendarCheck, Trash2 } from 'lucide-react'

interface PanelSeat {
    id: number
    number: number | string
    position?: 'window' | 'aisle' | string
    deck?: string
    [key: string]: unknown
}

interface FloatingSeatsPanelProps {
    selectedSeats: PanelSeat[]
    selectionEnabled?: boolean
    seatChangeMode?: boolean
    isDoubleDeck?: boolean
    expanded?: boolean
    onExpandedChange?: (v: boolean) => void
    onSellTicket: () => void
    onReserveSeat: () => void
    onClearSelection: () => void
    onRemoveSeat: (seat: PanelSeat) => void
}

export default function FloatingSeatsPanel({
    selectedSeats,
    selectionEnabled = true,
    seatChangeMode = false,
    isDoubleDeck = false,
    expanded,
    onExpandedChange,
    onSellTicket,
    onReserveSeat,
    onClearSelection,
    onRemoveSeat,
}: FloatingSeatsPanelProps) {
    const [internalExpanded, setInternalExpanded] = useState(false)
    const isControlled = expanded !== undefined
    const userExpanded = isControlled ? expanded : internalExpanded
    const setUserExpanded = (next: boolean | ((prev: boolean) => boolean)) => {
        const value = typeof next === 'function' ? (next as (p: boolean) => boolean)(userExpanded) : next
        if (isControlled) onExpandedChange?.(value)
        else setInternalExpanded(value)
    }

    const isVisible = selectionEnabled && selectedSeats.length > 0 && !seatChangeMode
    const isExpanded = userExpanded && isVisible
    const toggle = () => setUserExpanded((v) => !v)

    const windowSeatsCount = useMemo(
        () => selectedSeats.filter((seat) => seat.position === 'window').length,
        [selectedSeats]
    )
    const aisleSeatsCount = useMemo(
        () => selectedSeats.filter((seat) => seat.position === 'aisle').length,
        [selectedSeats]
    )

    if (!isVisible) return null

    return (
        <aside
            aria-label="Asientos seleccionados"
            className="fixed inset-x-3 bottom-3 z-40 font-sans print:hidden sm:inset-x-auto sm:right-6 sm:bottom-6"
        >
            <div className="w-full max-w-[calc(100vw-1.5rem)] rounded-xl border border-border bg-card/95 shadow-lg backdrop-blur-md transition-all duration-300 ease-in-out sm:w-[480px]">

                {/* Header / collapsed state */}
                <div
                    className={`flex items-stretch w-full overflow-hidden ${isExpanded ? 'border-b border-border bg-muted/40 rounded-t-xl' : 'rounded-xl'}`}
                >
                    {/* Primary toggle (counter + label) */}
                    <Button
                        type="button"
                        variant="ghost"
                        onClick={toggle}
                        aria-expanded={isExpanded}
                        aria-controls="floating-seats-panel-content"
                        aria-label={isExpanded ? 'Colapsar panel de asientos seleccionados' : 'Expandir panel de asientos seleccionados'}
                        className="flex flex-1 min-w-0 items-center justify-start gap-3 h-auto p-4 rounded-none hover:bg-muted/50 text-left"
                    >
                        <span className="bg-primary text-primary-foreground w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg shadow-md flex-shrink-0" aria-hidden="true">
                            {selectedSeats.length}
                        </span>
                        <span className="flex flex-col min-w-0 flex-1">
                            <span className="font-bold text-foreground text-sm sm:text-base truncate">
                                {selectedSeats.length} seleccionado{selectedSeats.length !== 1 ? 's' : ''}
                            </span>
                            {!isExpanded && (
                                <span className="text-xs text-muted-foreground font-medium truncate">
                                    {selectedSeats.map((s) => s.number).join(', ')}
                                </span>
                            )}
                        </span>
                    </Button>

                    {/* Quick actions (collapsed only, sm+) */}
                    {!isExpanded && (
                        <div className="hidden sm:flex items-center gap-2 px-2 flex-shrink-0">
                            <Button
                                size="sm"
                                onClick={onSellTicket}
                                className="h-8 text-xs font-semibold"
                            >
                                Vender
                            </Button>
                            <Button
                                size="sm"
                                variant="secondary"
                                onClick={onReserveSeat}
                                className="h-8 text-xs font-semibold"
                            >
                                Reservar
                            </Button>
                        </div>
                    )}

                    {/* Corner chevron toggle */}
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={toggle}
                        aria-expanded={isExpanded}
                        aria-controls="floating-seats-panel-content"
                        aria-label={isExpanded ? 'Colapsar panel de asientos seleccionados' : 'Expandir panel de asientos seleccionados'}
                        className="self-center mr-2 h-8 w-8 flex-shrink-0"
                    >
                        <ChevronUp
                            className={`h-5 w-5 text-muted-foreground transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}
                            aria-hidden="true"
                        />
                    </Button>
                </div>

                {/* Expanded content */}
                <div
                    id="floating-seats-panel-content"
                    className={`transition-all duration-300 ease-in-out ${isExpanded ? 'max-h-[60vh] opacity-100 visible overflow-y-auto' : 'max-h-0 opacity-0 invisible overflow-hidden'}`}
                >
                    <div className="p-4 bg-muted/30">
                        <div className="flex justify-between items-center mb-3">
                            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                Detalles de Asientos
                            </span>
                            <div className="flex gap-3 text-xs text-muted-foreground font-medium">
                                <span title="Asientos en ventana" aria-label={`${windowSeatsCount} en ventana`}>
                                    Ventana {windowSeatsCount}
                                </span>
                                <span title="Asientos en pasillo" aria-label={`${aisleSeatsCount} en pasillo`}>
                                    Pasillo {aisleSeatsCount}
                                </span>
                            </div>
                        </div>

                        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 mb-2 max-h-52 overflow-y-auto p-2">
                            {selectedSeats.map((seat) => (
                                <div
                                    key={seat.id}
                                    className="relative group bg-card border border-border shadow-sm rounded-lg p-2.5 text-center hover:border-primary/60 hover:shadow-md transition-all flex flex-col items-center justify-center min-h-[72px]"
                                >
                                    <div className="text-base font-bold text-primary leading-none mb-1">{seat.number}</div>
                                    <div className="text-[10px] uppercase font-bold text-muted-foreground tracking-tight">
                                        {isDoubleDeck && seat.deck && (
                                            <span className="block text-primary/70 mb-0.5">
                                                {seat.deck === 'FIRST' ? '1º Piso' : '2º Piso'}
                                            </span>
                                        )}
                                        {seat.position === 'window' ? 'Ventana' : 'Pasillo'}
                                    </div>
                                    <Button
                                        variant="destructive"
                                        size="icon"
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            onRemoveSeat(seat)
                                        }}
                                        aria-label={`Quitar asiento ${seat.number}`}
                                        className="absolute -top-2 -right-2 h-6 w-6 rounded-full shadow-md border-2 border-card z-10"
                                    >
                                        <X className="h-4 w-4" />
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Action buttons */}
                    <div className="p-4 bg-card border-t border-border grid grid-cols-2 gap-3 rounded-b-xl overflow-hidden">
                        <Button
                            onClick={onSellTicket}
                            className="col-span-2 h-auto font-semibold py-2.5 rounded-lg gap-2"
                        >
                            <Ticket className="h-4 w-4" aria-hidden="true" />
                            <span className="flex items-center gap-1.5">
                                Vender Tickets
                                <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] uppercase bg-primary-foreground/15 rounded border border-primary-foreground/20">
                                    V
                                </kbd>
                            </span>
                        </Button>

                        <Button
                            variant="secondary"
                            onClick={onReserveSeat}
                            className="h-auto font-semibold py-2.5 rounded-lg gap-2"
                        >
                            <CalendarCheck className="h-4 w-4" aria-hidden="true" />
                            <span className="flex items-center gap-1.5">
                                Reservar
                                <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] uppercase bg-foreground/10 rounded border border-foreground/20">
                                    R
                                </kbd>
                            </span>
                        </Button>

                        <Button
                            variant="outline"
                            onClick={onClearSelection}
                            className="h-auto font-semibold py-2.5 rounded-lg gap-2"
                        >
                            <Trash2 className="h-4 w-4" aria-hidden="true" />
                            <span className="flex items-center gap-1.5">
                                Limpiar
                                <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] uppercase bg-foreground/10 rounded border border-foreground/20">
                                    C
                                </kbd>
                            </span>
                        </Button>
                    </div>
                </div>
            </div>
        </aside>
    )
}
