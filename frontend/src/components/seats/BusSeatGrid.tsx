import { useMemo } from 'react'

interface BusSeatGridProps {
    seats: any[]
    selectedSeatIds: number[]
    disabled?: boolean
    maxSelections?: number
    tickets?: any[]

    onSeatSelected?: (seat: any, newSelectedIds: number[]) => void
    onSeatDeselected?: (seat: any, newSelectedIds: number[]) => void
    onContextMenu?: (event: React.MouseEvent, seat: any) => void
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

    const getModernSeatClass = (seat: any) => {
        if (seat.occupied) {
            return 'bg-gradient-to-br from-red-100 to-red-200 border-red-300 cursor-not-allowed hover:scale-100'
        } else if (seat.status === 'reserved') {
            return 'bg-gradient-to-br from-amber-100 to-orange-200 border-orange-300 cursor-not-allowed hover:scale-100'
        } else if (seat.status === 'locked') {
            return 'bg-gradient-to-br from-purple-100 to-violet-200 border-purple-300 cursor-not-allowed hover:scale-100 opacity-75'
        } else if (selectedSeatIds.includes(seat.id)) {
            return 'bg-gradient-to-br from-blue-100 to-indigo-200 border-blue-400 cursor-pointer animate-[modern-seat-pulse_2s_infinite] shadow-[0_0_20px_rgba(59,130,246,0.6)]'
        } else if (seatChangeMode) {
            return 'bg-gradient-to-br from-emerald-50 to-green-100 border-emerald-400 cursor-pointer animate-pulse shadow-[0_0_15px_rgba(16,185,129,0.5)]'
        } else {
            return 'bg-gradient-to-br from-emerald-50 to-green-100 border-emerald-300 hover:from-emerald-100 hover:to-green-200 cursor-pointer hover:shadow-xl'
        }
    }

    const getModernStatusClass = (seat: any) => {
        if (seat.occupied) {
            return 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg'
        } else if (seat.status === 'reserved') {
            return 'bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-lg'
        } else if (seat.status === 'locked') {
            return 'bg-gradient-to-r from-purple-500 to-violet-600 text-white shadow-lg'
        } else if (selectedSeatIds.includes(seat.id)) {
            return 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg'
        } else {
            return 'bg-gradient-to-r from-emerald-500 to-green-600 text-white shadow-lg'
        }
    }

    const getSeatStatusText = (seat: any) => {
        if (seat.occupied) return 'OCUPADO'
        if (seat.status === 'reserved') return 'RESERVADO'
        if (seat.status === 'locked') return 'BLOQUEADO'
        if (selectedSeatIds.includes(seat.id)) return 'SELECCIONADO'
        return 'DISPONIBLE'
    }

    const toggleSeatSelection = (seat: any) => {
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

    const handleContextMenu = (event: React.MouseEvent, seat: any) => {
        event.preventDefault()
        if (onContextMenu) onContextMenu(event, seat)
    }

    const getSeatPrice = (seat: any) => {
        if (!seat.occupied && seat.status !== 'reserved') return null
        const ticket = tickets.find(t => t.seat && t.seat.seat_number === seat.number)
        return ticket?.price || null
    }

    const formatPrice = (price: any) => {
        if (price === null || price === undefined) return '0.00'
        return parseFloat(price).toFixed(2)
    }

    const getSeatDestination = (seat: any) => {
        if (!seat.occupied && seat.status !== 'reserved') return null
        const ticket = tickets.find(t => t.seat && t.seat.seat_number === seat.number)
        if (!ticket) return null

        if (ticket.destination && ticket.destination.trim()) return ticket.destination
        if (ticket.destination_location?.name) return ticket.destination_location.name

        return null
    }

    const renderSeat = (seat: any) => {
        const isOccupiedOrReserved = seat.occupied || seat.status === 'reserved';
        const passengerName = isOccupiedOrReserved ? (seat.passenger?.name || '') : '';
        const passengerPhone = isOccupiedOrReserved ? (seat.passenger?.phone || '') : '';
        const dest = getSeatDestination(seat);

        return (
            <div key={seat.id} className="seat-container group mb-2 break-inside-avoid">
                <div className="seat-number flex items-center justify-center mb-2 transition-all duration-200">
                    <div className={`${seat.column === 'left' ? 'bg-gradient-to-r from-indigo-500 to-blue-600' : 'bg-gradient-to-r from-emerald-500 to-teal-600'} text-white px-3 py-1 rounded-full text-xs font-bold shadow-md`}>
                        {seat.number}<span className="ml-1 opacity-75 sm:text-xs text-[0.6rem]">{seat.position === 'window' ? '🪟' : '🚶'}</span>
                    </div>
                </div>
                {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */}
                <div
                    className={`seat-box relative rounded-2xl p-2 sm:p-4 flex flex-col justify-between text-center min-h-[7rem] sm:h-36 transition-all duration-300 transform group-hover:-translate-y-0.5 group-hover:scale-105 cursor-pointer shadow-sm border-2 overflow-hidden ${getModernSeatClass(seat)}`}
                    onClick={() => toggleSeatSelection(seat)}
                    onContextMenu={(e) => handleContextMenu(e, seat)}
                >
                    {getSeatPrice(seat) && (
                        <div className="absolute top-2 right-2">
                            <div className="bg-black bg-opacity-75 text-white px-1.5 py-0.5 rounded-full text-[10px] sm:text-xs font-bold">
                                Bs. {formatPrice(getSeatPrice(seat))}
                            </div>
                        </div>
                    )}

                    <div className="flex flex-col justify-center items-center text-center px-1 sm:px-2 pt-6 pb-2 flex-grow min-h-[4rem]">
                        <div className={`text-[10px] sm:text-sm leading-tight font-bold text-gray-800 truncate w-full h-4 ${!isOccupiedOrReserved ? 'opacity-0' : ''}`} title={passengerName}>
                            {passengerName}
                        </div>
                        <div className={`text-[10px] sm:text-xs text-gray-600 font-medium mt-1 h-4 ${!isOccupiedOrReserved ? 'opacity-0' : ''}`}>
                            {passengerPhone}
                        </div>
                        <div className={`text-[10px] sm:text-xs text-blue-600 font-semibold mt-1 truncate w-full h-4 ${!dest ? 'opacity-0' : ''}`} title={dest || ''}>
                            {dest ? `→ ${dest}` : ''}
                        </div>
                    </div>

                    <div className="flex-shrink-0 w-full">
                        <span className={`text-[10px] sm:text-xs font-bold px-1 sm:px-2 py-0.5 sm:py-1 rounded-full block truncate text-center ${getModernStatusClass(seat)}`}>
                            {getSeatStatusText(seat)}
                        </span>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="seat-map-container px-4 sm:px-6 md:px-8 pb-6 sm:pb-8">
            <div className="md:hidden flex justify-center mb-4 print:hidden">
                <div className="bg-gradient-to-r from-slate-600 to-gray-700 px-6 py-3 rounded-2xl text-white font-bold text-sm shadow-lg">
                    🚌 PASILLO CENTRAL
                </div>
            </div>

            <div className={`relative grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] md:gap-6 lg:gap-8 bg-gradient-to-b from-slate-50 to-white p-4 sm:p-6 rounded-3xl shadow-inner ${seatChangeMode ? 'bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,rgba(251,146,60,0.1)_10px,rgba(251,146,60,0.1)_20px)] border-2 border-orange-300' : 'border border-gray-100'}`}>
                <div className="left-column md:pr-4">
                    <div className="md:hidden mb-4 flex items-center justify-center space-x-2 print:hidden">
                        <div className="w-3 h-3 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full"></div>
                        <h3 className="text-sm font-bold text-gray-700">Lado Izquierdo</h3>
                        <div className="w-3 h-3 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full"></div>
                    </div>
                    <div className="grid grid-cols-2 gap-3 sm:gap-4">
                        {leftColumnSeats.map(renderSeat)}
                    </div>
                </div>

                <div className="center-aisle hidden md:flex flex-col justify-center items-center px-4 print:!hidden">
                    <div className="relative">
                        <div className="rotate-90 bg-gradient-to-r from-slate-600 to-gray-700 px-6 py-3 rounded-2xl text-white font-black text-sm tracking-[0.3em] shadow-xl whitespace-nowrap">
                            🚌 PASILLO
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 opacity-20 rounded-2xl rotate-90 blur-sm"></div>
                    </div>
                </div>

                <div className="right-column mt-6 sm:mt-8 md:mt-0 md:pl-4">
                    <div className="md:hidden mb-4 flex items-center justify-center space-x-2 print:hidden">
                        <div className="w-3 h-3 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-full"></div>
                        <h3 className="text-sm font-bold text-gray-700">Lado Derecho</h3>
                        <div className="w-3 h-3 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-full"></div>
                    </div>
                    <div className="grid grid-cols-2 gap-3 sm:gap-4">
                        {rightColumnSeats.map(renderSeat)}
                    </div>
                </div>
            </div>

            <style>{`
        @keyframes modern-seat-pulse {
          0%, 100% {
            transform: scale(1);
            box-shadow: 0 0 20px rgba(59, 130, 246, 0.6);
          }
          50% {
            transform: scale(1.05);
            box-shadow: 0 0 30px rgba(59, 130, 246, 0.8);
          }
        }
        @media print {
          .seat-box {
            border: 1px solid #166534 !important;
            page-break-inside: avoid;
            box-shadow: none !important;
            animation: none !important;
            transform: none !important;
          }
          .seat-container {
            page-break-inside: avoid;
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .seat-box {
            transition: none;
          }
        }
      `}</style>
        </div>
    )
}
