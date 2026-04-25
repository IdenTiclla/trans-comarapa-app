import { useState, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { X, ChevronUp, Ticket, CalendarCheck, Trash2 } from 'lucide-react'

interface PanelSeat {
    id: number | string
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
    onSellTicket,
    onReserveSeat,
    onClearSelection,
    onRemoveSeat,
}: FloatingSeatsPanelProps) {
    const [userExpanded, setUserExpanded] = useState(false)

    const isVisible = selectionEnabled && selectedSeats.length > 0 && !seatChangeMode
    const isExpanded = userExpanded && isVisible

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
        <div
            role="dialog"
            aria-label="Asientos seleccionados"
            className="fixed bottom-6 right-6 z-40 font-sans print:hidden animate-[slideUp_0.3s_ease-out]"
        >
            <div className="bg-card/90 backdrop-blur-md rounded-xl shadow-xl border border-border transition-all duration-300 ease-in-out w-[340px] sm:w-[420px]">

                {/* Header / collapsed state */}
                <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setUserExpanded((v) => !v)}
                    aria-expanded={isExpanded}
                    aria-controls="floating-seats-panel-content"
                    title={isExpanded ? 'Colapsar panel' : 'Expandir panel'}
                    className={`flex items-center justify-between w-full h-auto p-4 text-left hover:bg-muted/50 overflow-hidden ${isExpanded ? 'border-b border-border bg-muted/40 rounded-t-xl rounded-b-none' : 'rounded-xl'}`}
                >
                    <div className="flex items-center space-x-3">
                        <div className="bg-primary text-primary-foreground w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg shadow-md">
                            {selectedSeats.length}
                        </div>
                        <div className="flex flex-col min-w-0">
                            <span className="font-bold text-foreground text-sm sm:text-base whitespace-nowrap">
                                Asientos Seleccionados
                            </span>
                            {!isExpanded && (
                                <span className="text-xs text-muted-foreground font-medium truncate w-[100px] sm:w-[150px] inline-block">
                                    {selectedSeats.map((s) => s.number).join(', ')}
                                </span>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center gap-2 ml-4">
                        {!isExpanded && (
                            <div className="hidden sm:flex items-center gap-2 mr-1">
                                <Button
                                    size="sm"
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        onSellTicket()
                                    }}
                                    className="h-8 text-xs font-semibold"
                                >
                                    Vender
                                </Button>
                                <Button
                                    size="sm"
                                    variant="secondary"
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        onReserveSeat()
                                    }}
                                    className="h-8 text-xs font-semibold"
                                >
                                    Reservar
                                </Button>
                            </div>
                        )}
                        <ChevronUp
                            className={`h-5 w-5 text-muted-foreground transition-transform duration-300 ${isExpanded ? '' : 'rotate-180'}`}
                            aria-hidden="true"
                        />
                    </div>
                </Button>

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
                                    🪟 {windowSeatsCount}
                                </span>
                                <span title="Asientos en pasillo" aria-label={`${aisleSeatsCount} en pasillo`}>
                                    🚶 {aisleSeatsCount}
                                </span>
                            </div>
                        </div>

                        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 mb-2 max-h-52 overflow-y-auto p-2 custom-scrollbar">
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
                                        className="absolute -top-2 -right-2 h-6 w-6 rounded-full shadow-md border-2 border-card z-10 hover:scale-110 active:scale-95 transition-transform"
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

            <style>{`
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background-color: hsl(var(--border));
                    border-radius: 20px;
                }
            `}</style>
        </div>
    )
}
