interface SeatContextMenuProps {
    visible: boolean
    position: { x: number, y: number }
    selectedSeat: any
    enableContextMenu?: boolean
    onViewDetails: () => void
    onCancelReservation: () => void
    onConfirmSale: () => void
    onChangeSeat: () => void
    onRescheduleTrip: () => void
}

export default function SeatContextMenu({
    visible,
    position,
    selectedSeat,
    enableContextMenu = false,
    onViewDetails,
    onCancelReservation,
    onConfirmSale,
    onChangeSeat,
    onRescheduleTrip
}: SeatContextMenuProps) {
    if (!visible || !enableContextMenu) return null

    return (
        <div
            className="fixed bg-white shadow-lg rounded-md border border-gray-200 py-1 z-50 min-w-[140px]"
            style={{ top: `${position.y}px`, left: `${position.x}px` }}
            onClick={(e) => e.stopPropagation()}
        >
            <div className="px-3 py-1.5 text-xs text-gray-500 border-b border-gray-100 font-medium bg-gray-50">
                Asiento {selectedSeat?.number || ''}
            </div>

            {(selectedSeat?.status === 'reserved' || selectedSeat?.occupied || selectedSeat?.status === 'occupied') && (
                <button
                    onClick={onViewDetails}
                    className="w-full text-left block px-4 py-1.5 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                >
                    Ver detalles
                </button>
            )}

            {selectedSeat?.status === 'reserved' && (
                <>
                    <button
                        onClick={onConfirmSale}
                        className="w-full text-left block px-4 py-1.5 text-sm text-green-600 hover:bg-gray-100 transition-colors"
                    >
                        Confirmar venta
                    </button>
                    <button
                        onClick={onCancelReservation}
                        className="w-full text-left block px-4 py-1.5 text-sm text-red-600 hover:bg-gray-100 transition-colors"
                    >
                        Cancelar reserva
                    </button>
                </>
            )}

            {(selectedSeat?.occupied || selectedSeat?.status === 'occupied') && (
                <>
                    <button
                        onClick={onChangeSeat}
                        className="w-full text-left block px-4 py-1.5 text-sm text-blue-600 hover:bg-gray-100 transition-colors"
                    >
                        Cambiar asiento
                    </button>
                    <button
                        onClick={onRescheduleTrip}
                        className="w-full text-left block px-4 py-1.5 text-sm text-green-600 hover:bg-gray-100 transition-colors"
                    >
                        Reprogramar viaje
                    </button>
                </>
            )}
        </div>
    )
}
