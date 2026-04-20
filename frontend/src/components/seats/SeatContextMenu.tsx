/* eslint-disable @typescript-eslint/no-explicit-any */
import { Button } from '@/components/ui/button'

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

    const itemCls = 'w-full justify-start h-auto rounded-none px-4 py-1.5 text-sm font-normal hover:bg-gray-100'

    return (
        // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions
        <div
            className="fixed bg-white shadow-lg rounded-md border border-gray-200 py-1 z-50 min-w-[140px]"
            style={{ top: `${position.y}px`, left: `${position.x}px` }}
            onClick={(e) => e.stopPropagation()}
        >
            <div className="px-3 py-1.5 text-xs text-gray-500 border-b border-gray-100 font-medium bg-gray-50">
                Asiento {selectedSeat?.number || ''}
            </div>

            {(selectedSeat?.status === 'reserved' || selectedSeat?.occupied || selectedSeat?.status === 'occupied') && (
                <>
                    {onPreviewTicket && (
                        <Button variant="ghost" onClick={onPreviewTicket} className={`${itemCls} text-gray-700`}>
                            Previsualizar boleto
                        </Button>
                    )}
                    {onGoToTicketPage && (
                        <Button variant="ghost" onClick={onGoToTicketPage} className={`${itemCls} text-gray-700`}>
                            Ir al boleto
                        </Button>
                    )}
                </>
            )}

            {selectedSeat?.status === 'reserved' && (
                <>
                    <Button variant="ghost" onClick={onConfirmSale} className={`${itemCls} text-green-600`}>
                        Confirmar venta
                    </Button>
                    <Button variant="ghost" onClick={onCancelReservation} className={`${itemCls} text-red-600`}>
                        Cancelar reserva
                    </Button>
                </>
            )}

            {(selectedSeat?.occupied || selectedSeat?.status === 'occupied') && (
                <>
                    <Button variant="ghost" onClick={onChangeSeat} className={`${itemCls} text-blue-600`}>
                        Cambiar asiento
                    </Button>
                    <Button variant="ghost" onClick={onRescheduleTrip} className={`${itemCls} text-green-600`}>
                        Reprogramar viaje
                    </Button>
                </>
            )}
        </div>
    )
}
