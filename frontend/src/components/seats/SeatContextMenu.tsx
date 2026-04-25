import { Button } from '@/components/ui/button'
import { Eye, FileText, CheckCircle2, XCircle, RefreshCw, Calendar } from 'lucide-react'

interface SeatContextMenuProps {
    visible: boolean
    position: { x: number, y: number }
    selectedSeat: any
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
        // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions
        <div
            className="absolute bg-white/95 backdrop-blur-sm shadow-xl rounded-lg border border-gray-200 py-1.5 z-50 w-48 animate-in fade-in zoom-in-95 duration-100"
            style={{ 
                top: `${position.y}px`, 
                left: `${position.x + 8}px`,
                transform: 'translateY(-50%)' 
            }}
            onClick={(e) => e.stopPropagation()}
        >
            {/* Arrow (Muesquita) */}
            <div className="absolute top-1/2 -left-[6px] -translate-y-1/2 w-3 h-3 bg-white border-l border-b border-gray-200 rotate-45 z-[-1]" />

            <div className="px-3 py-1 mb-1 text-[10px] uppercase tracking-wider text-gray-400 border-b border-gray-100 font-bold bg-gray-50/50">
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
                    <Button variant="ghost" onClick={onConfirmSale} className={`${itemCls} text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50`}>
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        Confirmar venta
                    </Button>
                    <Button variant="ghost" onClick={onCancelReservation} className={`${itemCls} text-destructive hover:bg-destructive/10`}>
                        <XCircle className="h-3.5 w-3.5" />
                        Cancelar reserva
                    </Button>
                </>
            )}

            {(selectedSeat?.occupied || selectedSeat?.status === 'occupied') && (
                <>
                    <Button variant="ghost" onClick={onChangeSeat} className={`${itemCls} text-blue-600 hover:bg-blue-50`}>
                        <RefreshCw className="h-3.5 w-3.5" />
                        Cambiar asiento
                    </Button>
                    <Button variant="ghost" onClick={onRescheduleTrip} className={`${itemCls} text-emerald-600 hover:bg-emerald-50`}>
                        <Calendar className="h-3.5 w-3.5" />
                        Reprogramar viaje
                    </Button>
                </>
            )}
        </div>
    )
}
