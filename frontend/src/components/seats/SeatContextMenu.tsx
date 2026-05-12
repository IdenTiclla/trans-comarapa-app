import { useEffect, useRef, useCallback } from 'react'
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
    const menuRef = useRef<HTMLDivElement>(null)

    const getFocusableItems = useCallback(() => {
        if (!menuRef.current) return []
        return Array.from(menuRef.current.querySelectorAll<HTMLElement>('[role="menuitem"]'))
    }, [])

    useEffect(() => {
        if (visible && enableContextMenu) {
            requestAnimationFrame(() => {
                const items = getFocusableItems()
                if (items.length > 0) items[0].focus()
            })
        }
    }, [visible, enableContextMenu, getFocusableItems])

    const handleMenuKeyDown = (e: React.KeyboardEvent) => {
        const items = getFocusableItems()
        const currentIndex = items.indexOf(document.activeElement as HTMLElement)

        if (e.key === 'ArrowDown') {
            e.preventDefault()
            const next = currentIndex < items.length - 1 ? currentIndex + 1 : 0
            items[next]?.focus()
        } else if (e.key === 'ArrowUp') {
            e.preventDefault()
            const prev = currentIndex > 0 ? currentIndex - 1 : items.length - 1
            items[prev]?.focus()
        } else if (e.key === 'Escape') {
            e.stopPropagation()
        } else if (e.key === 'Tab') {
            e.preventDefault()
        }
    }

    if (!visible || !enableContextMenu) return null

    const itemCls = 'w-full justify-start h-8 rounded-none px-3 py-0 text-xs font-medium hover:bg-muted transition-colors gap-2'

    return (
        <div
            ref={menuRef}
            className="absolute bg-popover/95 backdrop-blur-sm shadow-xl rounded-lg border border-border py-1.5 z-50 w-48 animate-in fade-in zoom-in-95 duration-100"
            role="menu"
            aria-label={`Menú de opciones para asiento ${selectedSeat?.number || ''}`}
            style={{
                top: `${position.y}px`,
                left: `${position.x + 8}px`,
                transform: 'translateY(-50%)'
            }}
            onClick={(e) => e.stopPropagation()}
            onKeyDown={handleMenuKeyDown}
            tabIndex={-1}
        >
            <div className="absolute top-1/2 -left-[6px] -translate-y-1/2 w-3 h-3 bg-popover border-l border-b border-border rotate-45 z-[-1]" aria-hidden="true" />

            <div className="px-3 py-1 mb-1 text-[10px] uppercase tracking-wider text-muted-foreground border-b border-border/60 font-bold bg-muted/30" aria-hidden="true">
                Asiento {selectedSeat?.number || ''}
            </div>

            {(selectedSeat?.status === 'reserved' || selectedSeat?.occupied || selectedSeat?.status === 'occupied') && (
                <>
                    {onPreviewTicket && (
                        <Button variant="ghost" role="menuitem" onClick={onPreviewTicket} className={`${itemCls} text-foreground`}>
                            <Eye className="h-3.5 w-3.5 text-muted-foreground" aria-hidden="true" />
                            Previsualizar boleto
                        </Button>
                    )}
                    {onGoToTicketPage && (
                        <Button variant="ghost" role="menuitem" onClick={onGoToTicketPage} className={`${itemCls} text-foreground`}>
                            <FileText className="h-3.5 w-3.5 text-muted-foreground" aria-hidden="true" />
                            Ir al boleto
                        </Button>
                    )}
                </>
            )}

            {selectedSeat?.status === 'reserved' && (
                <>
                    <Button variant="ghost" role="menuitem" onClick={onConfirmSale} className={`${itemCls} text-status-available hover:text-status-available/80 hover:bg-status-available/10`}>
                        <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
                        Confirmar venta
                    </Button>
                    <Button variant="ghost" role="menuitem" onClick={onChangeSeat} className={`${itemCls} text-primary hover:bg-primary/10`}>
                        <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
                        Cambiar asiento
                    </Button>
                    <Button variant="ghost" role="menuitem" onClick={onCancelReservation} className={`${itemCls} text-destructive hover:bg-destructive/10`}>
                        <XCircle className="h-3.5 w-3.5" aria-hidden="true" />
                        Cancelar reserva
                    </Button>
                </>
            )}

            {(selectedSeat?.occupied || selectedSeat?.status === 'occupied') && (
                <>
                    <Button variant="ghost" role="menuitem" onClick={onChangeSeat} className={`${itemCls} text-primary hover:bg-primary/10`}>
                        <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
                        Cambiar asiento
                    </Button>
                    <Button variant="ghost" role="menuitem" onClick={onRescheduleTrip} className={`${itemCls} text-status-available hover:bg-status-available/10`}>
                        <Calendar className="h-3.5 w-3.5" aria-hidden="true" />
                        Reprogramar viaje
                    </Button>
                </>
            )}
        </div>
    )
}
