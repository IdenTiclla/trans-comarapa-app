import { Button } from '@/components/ui/button'
import { Eye, FileText, CheckCircle2, XCircle, RefreshCw, Calendar } from 'lucide-react'
import type { SelectedSeat } from '@/components/tickets/ticket-sale/types'

interface ContextSeat extends SelectedSeat {
    status?: string
    occupied?: boolean
}

interface SeatContextMenuProps {
    visible: boolean
    position: { x: number, y: number }
    selectedSeat: ContextSeat | null
    enableContextMenu?: boolean
    onCancelReservation: () => void
    onConfirmSale: () => void
    onChangeSeat: () => void
    onRescheduleTrip: () => void
    onGoToTicketPage?: () => void
    onPreviewTicket?: () => void
}

export default function SeatContextMenu({
    visible,
    position,
    selectedSeat,
    enableContextMenu = false,
    onCancelReservation,
    onConfirmSale,
    onChangeSeat,
    onRescheduleTrip,
    onGoToTicketPage,
    onPreviewTicket
}: SeatContextMenuProps) {
    if (!visible || !enableContextMenu) return null

    const itemCls = 'w-full justify-start h-8 rounded-none px-3 py-0 text-xs font-medium hover:bg-muted transition-colors gap-2'

    return (
        <div
            className="absolute bg-popover/95 backdrop-blur-sm shadow-xl rounded-lg border border-border py-1.5 z-50 w-48 animate-in fade-in zoom-in-95 duration-100"
            role="menu"
            aria-label={`Menú de opciones para asiento ${selectedSeat?.number || ''}`}
            style={{
                top: `${position.y}px`,
                left: `${position.x + 8}px`,
                transform: 'translateY(-50%)'
            }}
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => { if (e.key === 'Escape') { e.stopPropagation() } }}
            tabIndex={-1}
        >
            <div className="absolute top-1/2 -left-[6px] -translate-y-1/2 w-3 h-3 bg-popover border-l border-b border-border rotate-45 z-[-1]" />

            <div className="px-3 py-1 mb-1 text-[10px] uppercase tracking-wider text-muted-foreground border-b border-border/60 font-bold bg-muted/30">
                Asiento {selectedSeat?.number || ''}
            </div>

            {(selectedSeat?.status === 'reserved' || selectedSeat?.occupied || selectedSeat?.status === 'occupied') && (
                <>
                    {onPreviewTicket && (
                        <Button variant="ghost" onClick={onPreviewTicket} className={`${itemCls} text-foreground`}>
                            <Eye className="h-3.5 w-3.5 text-muted-foreground" />
                            Previsualizar boleto
                        </Button>
                    )}
                    {onGoToTicketPage && (
                        <Button variant="ghost" onClick={onGoToTicketPage} className={`${itemCls} text-foreground`}>
                            <FileText className="h-3.5 w-3.5 text-muted-foreground" />
                            Ir al boleto
                        </Button>
                    )}
                </>
            )}

            {selectedSeat?.status === 'reserved' && (
                <>
                    <Button variant="ghost" onClick={onConfirmSale} className={`${itemCls} text-status-available hover:text-status-available/80 hover:bg-status-available/10`}>
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        Confirmar venta
                    </Button>
                    <Button variant="ghost" onClick={onChangeSeat} className={`${itemCls} text-primary hover:bg-primary/10`}>
                        <RefreshCw className="h-3.5 w-3.5" />
                        Cambiar asiento
                    </Button>
                    <Button variant="ghost" onClick={onCancelReservation} className={`${itemCls} text-destructive hover:bg-destructive/10`}>
                        <XCircle className="h-3.5 w-3.5" />
                        Cancelar reserva
                    </Button>
                </>
            )}

            {(selectedSeat?.occupied || selectedSeat?.status === 'occupied') && (
                <>
                    <Button variant="ghost" onClick={onChangeSeat} className={`${itemCls} text-primary hover:bg-primary/10`}>
                        <RefreshCw className="h-3.5 w-3.5" />
                        Cambiar asiento
                    </Button>
                    <Button variant="ghost" onClick={onRescheduleTrip} className={`${itemCls} text-status-available hover:bg-status-available/10`}>
                        <Calendar className="h-3.5 w-3.5" />
                        Reprogramar viaje
                    </Button>
                </>
            )}
        </div>
    )
}
