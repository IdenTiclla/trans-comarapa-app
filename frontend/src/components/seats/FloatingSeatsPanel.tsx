/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useMemo, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { X } from 'lucide-react'

interface FloatingSeatsPanelProps {
    selectedSeats: any[]
    selectionEnabled?: boolean
    seatChangeMode?: boolean
    isDoubleDeck?: boolean
    onSellTicket: () => void
    onReserveSeat: () => void
    onClearSelection: () => void
    onRemoveSeat: (seat: any) => void
}

export default function FloatingSeatsPanel({
    selectedSeats,
    selectionEnabled = true,
    seatChangeMode = false,
    isDoubleDeck = false,
    onSellTicket,
    onReserveSeat,
    onClearSelection,
    onRemoveSeat
}: FloatingSeatsPanelProps) {
    const [isExpanded, setIsExpanded] = useState(false)

    // Si no hay asientos, o esta en modo cambio, o no esta habilitada la seleccion, ocultar panel.
    useEffect(() => {
        if (!selectionEnabled || selectedSeats.length === 0 || seatChangeMode) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setIsExpanded(false)
        }
    }, [selectionEnabled, selectedSeats.length, seatChangeMode])

    const windowSeatsCount = useMemo(() => selectedSeats.filter(seat => seat.position === 'window').length, [selectedSeats])
    const aisleSeatsCount = useMemo(() => selectedSeats.filter(seat => seat.position === 'aisle').length, [selectedSeats])

    if (!selectionEnabled || selectedSeats.length === 0 || seatChangeMode) return null

    return (
        <div className="fixed bottom-6 right-6 z-40 font-sans print:hidden animate-[slideUp_0.3s_ease-out]">
            <div className={`bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-indigo-100 overflow-hidden transition-all duration-300 ease-in-out w-[340px] sm:w-[420px]`}>

                {/* Header / Collapsed State */}
                {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */}
                <div
                    className={`flex items-center justify-between p-4 cursor-pointer hover:bg-slate-50 transition-colors ${isExpanded ? 'border-b border-indigo-100 bg-slate-50/80 rounded-t-2xl' : 'rounded-2xl'}`}
                    onClick={() => setIsExpanded(!isExpanded)}
                    title={isExpanded ? "Haz clic para colapsar" : "Haz clic para expandir"}
                >
                    <div className="flex items-center space-x-3 pointer-events-none">
                        <div className="bg-primary text-primary-foreground w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg shadow-md transition-transform">
                            {selectedSeats.length}
                        </div>
                        <div className="flex flex-col min-w-0">
                            <span className="font-bold text-slate-800 text-sm sm:text-base whitespace-nowrap">
                                Asientos Seleccionados
                            </span>
                            {!isExpanded && (
                                <span className="text-xs text-slate-500 font-medium truncate w-[100px] sm:w-[150px] inline-block">
                                    {selectedSeats.map(s => s.number).join(', ')}
                                </span>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center space-x-2 ml-4">
                        {!isExpanded && (
                            <div className="hidden sm:flex items-center space-x-2 mr-2">
                                <Button
                                    onClick={(e) => { e.stopPropagation(); onSellTicket(); }}
                                    className="h-auto bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-2 px-3 shadow-sm"
                                >
                                    Vender
                                </Button>
                                <Button
                                    onClick={(e) => { e.stopPropagation(); onReserveSeat(); }}
                                    className="h-auto bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold py-2 px-3 shadow-sm"
                                >
                                    Reservar
                                </Button>
                            </div>
                        )}
                        <div className={`transform transition-transform duration-300 text-slate-400 ${isExpanded ? 'rotate-180' : ''}`}>
                            <svg className="w-5 h-5 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                            </svg>
                        </div>
                    </div>
                </div>

                {/* Expanded State Content */}
                <div className={`transition-all duration-300 ease-in-out ${isExpanded ? 'max-h-[60vh] opacity-100 visible overflow-y-auto' : 'max-h-0 opacity-0 invisible overflow-hidden'}`}>

                    {/* Seat Grid Details */}
                    <div className="p-4 bg-slate-50/50">
                        <div className="flex justify-between items-center mb-3">
                            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Detalles de Asientos</span>
                            <div className="flex space-x-3 text-xs text-slate-500 font-medium">
                                <span title="Asientos en Ventana">🪟 {windowSeatsCount}</span>
                                <span title="Asientos en Pasillo">🚶 {aisleSeatsCount}</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 mb-2 max-h-48 overflow-y-auto pr-1 custom-scrollbar">
                            {selectedSeats.map(seat => (
                                <div key={seat.id} className="relative group bg-white border border-slate-200 shadow-sm rounded-lg p-2 text-center hover:border-indigo-400 hover:shadow-md transition-all cursor-default flex flex-col items-center justify-center min-h-[64px]">
                                    <div className="text-sm font-bold text-indigo-700">{seat.number}</div>
                                    <div className="text-[9px] uppercase font-semibold text-slate-400 mt-0.5 tracking-wider">
                                        {isDoubleDeck && seat.deck && <span className="block text-[8px] text-indigo-400/80 mb-0.5">{seat.deck === 'FIRST' ? '1º Piso' : '2º Piso'}</span>}
                                        {seat.position === 'window' ? 'Ventana' : 'Pasillo'}
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={(e) => { e.stopPropagation(); onRemoveSeat(seat); }}
                                        aria-label="Quitar asiento"
                                        className="absolute -top-2 -right-2 h-6 w-6 bg-white text-slate-400 border border-slate-200 hover:bg-red-50 hover:text-red-600 hover:border-red-200 rounded-full shadow-sm opacity-0 group-hover:opacity-100 z-10"
                                    >
                                        <X className="w-3.5 h-3.5" />
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="p-4 bg-white border-t border-slate-100 grid grid-cols-2 gap-3 sm:gap-4 rounded-b-2xl">
                        <Button
                            onClick={onSellTicket}
                            className="col-span-2 h-auto bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2.5 px-4 rounded-xl shadow-sm"
                        >
                            <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                            </svg>
                            <span>Vender Tickets <kbd className="hidden sm:inline-block ml-1.5 px-1.5 py-0.5 text-[10px] uppercase bg-white/20 rounded shadow-sm border border-emerald-500/30">V</kbd></span>
                        </Button>

                        <Button
                            onClick={onReserveSeat}
                            className="h-auto bg-amber-500 hover:bg-amber-600 text-white font-semibold py-2.5 px-4 rounded-xl shadow-sm text-sm"
                        >
                            <svg className="w-4 h-4 hidden sm:block mr-1 sm:mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <span>Reservar <kbd className="hidden sm:inline-block px-1 ml-1 text-[10px] uppercase bg-white/20 rounded shadow-sm border border-amber-400/30">R</kbd></span>
                        </Button>

                        <Button
                            variant="ghost"
                            onClick={onClearSelection}
                            className="h-auto bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-2.5 px-4 rounded-xl text-sm"
                        >
                            <svg className="w-4 h-4 hidden sm:block mr-1 sm:mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            <span>Limpiar <kbd className="hidden sm:inline-block px-1 ml-1 text-[10px] uppercase bg-slate-300 rounded text-slate-600 shadow-sm border border-slate-200">C</kbd></span>
                        </Button>
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
