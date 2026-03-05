import { useState, useMemo, useEffect } from 'react'

interface FloatingSeatsPanelProps {
    selectedSeats: any[]
    selectionEnabled?: boolean
    seatChangeMode?: boolean
    onSellTicket: () => void
    onReserveSeat: () => void
    onClearSelection: () => void
    onRemoveSeat: (seat: any) => void
}

export default function FloatingSeatsPanel({
    selectedSeats,
    selectionEnabled = true,
    seatChangeMode = false,
    onSellTicket,
    onReserveSeat,
    onClearSelection,
    onRemoveSeat
}: FloatingSeatsPanelProps) {
    const [isExpanded, setIsExpanded] = useState(false)

    // Si no hay asientos, o esta en modo cambio, o no esta habilitada la seleccion, ocultar panel.
    useEffect(() => {
        if (!selectionEnabled || selectedSeats.length === 0 || seatChangeMode) {
            setIsExpanded(false)
        }
    }, [selectionEnabled, selectedSeats.length, seatChangeMode])

    const windowSeatsCount = useMemo(() => selectedSeats.filter(seat => seat.position === 'window').length, [selectedSeats])
    const aisleSeatsCount = useMemo(() => selectedSeats.filter(seat => seat.position === 'aisle').length, [selectedSeats])

    if (!selectionEnabled || selectedSeats.length === 0 || seatChangeMode) return null

    return (
        <div className="fixed bottom-6 right-6 z-40 font-sans print:hidden animate-[slideUp_0.3s_ease-out]">
            <div className={`bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-indigo-100 overflow-hidden transition-all duration-300 ease-in-out ${isExpanded ? 'w-[320px] sm:w-[400px]' : 'w-auto'}`}>

                {/* Header / Collapsed State */}
                <div
                    className={`flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 transition-colors ${isExpanded ? 'border-b border-gray-100 bg-gray-50' : ''}`}
                    onClick={() => setIsExpanded(!isExpanded)}
                >
                    <div className="flex items-center space-x-3">
                        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg shadow-md transition-transform hover:scale-105">
                            {selectedSeats.length}
                        </div>
                        <div className="flex flex-col">
                            <span className="font-bold text-gray-800 text-sm sm:text-base">
                                Asientos Seleccionados
                            </span>
                            {!isExpanded && (
                                <span className="text-xs text-gray-500 font-medium">
                                    {selectedSeats.map(s => s.number).join(', ')}
                                </span>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center space-x-2 ml-4">
                        {!isExpanded && (
                            <div className="hidden sm:flex items-center space-x-2 mr-2" onClick={(e) => e.stopPropagation()}>
                                <button
                                    onClick={(e) => { e.stopPropagation(); onSellTicket(); }}
                                    className="bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold py-2 px-3 rounded-lg shadow-sm transition-colors"
                                >
                                    Vender
                                </button>
                                <button
                                    onClick={(e) => { e.stopPropagation(); onReserveSeat(); }}
                                    className="bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold py-2 px-3 rounded-lg shadow-sm transition-colors"
                                >
                                    Reservar
                                </button>
                            </div>
                        )}
                        <div className={`transform transition-transform duration-300 text-gray-400 ${isExpanded ? 'rotate-180' : ''}`}>
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                            </svg>
                        </div>
                    </div>
                </div>

                {/* Expanded State Content */}
                <div className={`transition-all duration-300 ease-in-out ${isExpanded ? 'max-h-[60vh] opacity-100 visible overflow-y-auto' : 'max-h-0 opacity-0 invisible overflow-hidden'}`}>

                    {/* Seat Grid Details */}
                    <div className="p-4 bg-gray-50/50">
                        <div className="flex justify-between items-center mb-3">
                            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Detalle de Asientos</span>
                            <div className="flex space-x-3 text-xs text-gray-500">
                                <span>🪟 {windowSeatsCount}</span>
                                <span>🚶 {aisleSeatsCount}</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 mb-4 max-h-48 overflow-y-auto pr-1 custom-scrollbar">
                            {selectedSeats.map(seat => (
                                <div key={seat.id} className="relative group bg-white border border-gray-200 rounded-lg p-2 text-center hover:border-indigo-300 transition-colors">
                                    <div className="text-sm font-bold text-indigo-600">{seat.number}</div>
                                    <div className="text-[10px] text-gray-500">{seat.position === 'window' ? 'Ventana' : 'Pasillo'}</div>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); onRemoveSeat(seat); }}
                                        className="absolute -top-1.5 -right-1.5 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                                        title="Quitar asiento"
                                    >
                                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="p-4 bg-white border-t border-gray-100 grid grid-cols-2 gap-2 sm:gap-3">
                        <button
                            onClick={onSellTicket}
                            className="col-span-2 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white font-semibold py-2.5 px-4 rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center space-x-2"
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                            </svg>
                            <span>Vender Tickets <kbd className="hidden sm:inline-block ml-1 px-1.5 py-0.5 text-[10px] uppercase bg-white/20 rounded">V</kbd></span>
                        </button>

                        <button
                            onClick={onReserveSeat}
                            className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold py-2 px-4 rounded-xl shadow-sm transition-all flex items-center justify-center space-x-1 sm:space-x-2 text-sm"
                        >
                            <svg className="w-4 h-4 hidden sm:block" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <span>Reservar <kbd className="hidden sm:inline-block px-1 ml-0.5 text-[10px] uppercase bg-white/20 rounded">R</kbd></span>
                        </button>

                        <button
                            onClick={onClearSelection}
                            className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-2 px-4 rounded-xl transition-colors flex items-center justify-center space-x-1 sm:space-x-2 text-sm"
                        >
                            <svg className="w-4 h-4 hidden sm:block" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            <span>Limpiar <kbd className="hidden sm:inline-block px-1 ml-0.5 text-[10px] uppercase bg-gray-300 rounded text-gray-600">C</kbd></span>
                        </button>
                    </div>
                </div>
            </div>

            <style>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background-color: #cbd5e1;
                    border-radius: 20px;
                }
            `}</style>
        </div>
    )
}
