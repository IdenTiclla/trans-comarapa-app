import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Plus, Minus, RotateCcw, Grid3X3, Info, ChevronUp, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface SeatPos {
    seat_number: number
    deck: 'FIRST' | 'SECOND'
    row: number
    column: number
}

interface SeatLayoutEditorProps {
    value: SeatPos[]
    onChange: (seats: SeatPos[]) => void
    floors?: number
    deck?: 'FIRST' | 'SECOND'
    initialRows?: number
    onRowsChange?: (rows: number) => void
}

export default function SeatLayoutEditor({
    value = [],
    onChange,
    deck = 'FIRST',
    initialRows = 10,
    onRowsChange
}: SeatLayoutEditorProps) {
    const [rows, setRows] = useState(initialRows)

    useEffect(() => {
        setRows(initialRows)
    }, [initialRows])

    const currentDeckSeats = useMemo(() => {
        return value.filter(seat => seat.deck === deck)
    }, [value, deck])

    useEffect(() => {
        const deckSeats = value.filter(s => s.deck === deck)
        if (deckSeats.length > 0) {
            const maxRow = Math.max(...deckSeats.map(s => s.row))
            if (maxRow > rows) {
                setRows(maxRow)
                onRowsChange?.(maxRow)
            }
        }
    }, [value, deck, rows, onRowsChange])

    const seatCount = currentDeckSeats.length

    const getSeatAt = useCallback((row: number, col: number) => {
        return currentDeckSeats.find(seat => seat.row === row && seat.column === col)
    }, [currentDeckSeats])

    const incrementRows = () => {
        if (rows < 20) {
            const newRows = rows + 1
            setRows(newRows)
            onRowsChange?.(newRows)
        }
    }

    const renumberSeats = (seats: SeatPos[]) => {
        const firstDeckSeats = seats.filter(s => s.deck === 'FIRST')
        const secondDeckSeats = seats.filter(s => s.deck === 'SECOND')

        const sortSeats = (deckSeats: SeatPos[]) => {
            deckSeats.sort((a, b) => {
                if (a.row !== b.row) return a.row - b.row
                return a.column - b.column
            })
        }

        sortSeats(firstDeckSeats)
        sortSeats(secondDeckSeats)

        let seatNumber = 1
        firstDeckSeats.forEach(seat => {
            seat.seat_number = seatNumber++
        })
        secondDeckSeats.forEach(seat => {
            seat.seat_number = seatNumber++
        })
    }

    const decrementRows = () => {
        if (rows <= 1) return

        const seatsInLastRow = currentDeckSeats.filter(s => s.row === rows)
        if (seatsInLastRow.length > 0) {
            const newSeats = value.filter(
                seat => !(seat.deck === deck && seat.row === rows)
            )
            renumberSeats(newSeats)
            onChange(newSeats)
        }

        const newRows = rows - 1
        setRows(newRows)
        onRowsChange?.(newRows)
    }

    const removeSeat = (row: number, col: number) => {
        const newSeats = value.filter(
            seat => !(seat.deck === deck && seat.row === row && seat.column === col)
        )
        renumberSeats(newSeats)
        onChange(newSeats)
    }

    const addSeat = (row: number, col: number) => {
        const newSeats = [...value]
        newSeats.push({
            seat_number: 0,
            deck: deck,
            row: row,
            column: col
        })
        renumberSeats(newSeats)
        onChange(newSeats)
    }

    const toggleSeat = (row: number, col: number) => {
        if (getSeatAt(row, col)) {
            removeSeat(row, col)
        } else {
            addSeat(row, col)
        }
    }

    const fillAll = () => {
        const otherDeckSeats = value.filter(seat => seat.deck !== deck)
        const newSeats = [...otherDeckSeats]

        for (let r = 1; r <= rows; r++) {
            for (let c = 1; c <= 4; c++) {
                newSeats.push({
                    seat_number: 0,
                    deck: deck,
                    row: r,
                    column: c
                })
            }
        }
        renumberSeats(newSeats)
        onChange(newSeats)
    }

    const clearAll = () => {
        const otherDeckSeats = value.filter(seat => seat.deck !== deck)
        onChange(otherDeckSeats)
    }


    return (
        <div className="seat-layout-editor select-none flex flex-col h-full bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="flex flex-wrap items-center justify-between gap-6 p-6 bg-gray-50/50 border-b border-gray-100">
                <div className="flex items-center gap-6">
                    <div className="flex flex-col gap-1">
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Dimensiones</span>
                        <div className="flex items-center gap-2">
                            <div className="flex items-center bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden p-1">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={decrementRows}
                                    disabled={rows <= 1}
                                    className="h-8 w-8 rounded-lg hover:bg-red-50 hover:text-red-500 transition-colors"
                                >
                                    <Minus className="w-4 h-4" />
                                </Button>
                                <div className="w-12 text-center font-bold text-gray-900 border-x border-gray-100">
                                    {rows}
                                </div>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={incrementRows}
                                    disabled={rows >= 20}
                                    className="h-8 w-8 rounded-lg hover:bg-emerald-50 hover:text-emerald-500 transition-colors"
                                >
                                    <Plus className="w-4 h-4" />
                                </Button>
                            </div>
                            <span className="text-xs font-bold text-gray-500 uppercase tracking-tighter">Filas</span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={fillAll}
                        className="rounded-xl border-emerald-200 text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700 font-bold"
                    >
                        <Grid3X3 className="w-4 h-4 mr-2" />
                        Llenar Planilla
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={clearAll}
                        className="rounded-xl border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 font-bold"
                    >
                        <RotateCcw className="w-4 h-4 mr-2" />
                        Vaciar Todo
                    </Button>

                    <div className="h-10 w-px bg-gray-100 mx-1"></div>

                    <div className="flex flex-col items-end gap-1">
                        <span className="text-[10px] font-black text-primary uppercase tracking-widest">Capacidad Total</span>
                        <div className="flex items-center gap-2 px-4 py-1.5 bg-primary/5 border border-primary/10 rounded-xl">
                            <span className="text-xl font-black text-primary tracking-tight">{seatCount}</span>
                            <span className="text-[10px] font-bold text-primary/60 uppercase">Asientos</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="p-6">
                <div className="mb-6 p-4 bg-blue-50/50 border border-blue-100 rounded-2xl flex items-start gap-4">
                    <div className="p-2 bg-blue-100 rounded-xl">
                        <Info className="w-4 h-4 text-blue-600" />
                    </div>
                    <p className="text-sm text-blue-700 leading-relaxed">
                        <span className="font-bold underline decoration-blue-200 decoration-2 underline-offset-4">Edición de Mapa:</span> Haz click en una celda vacía para agregar un asiento, o sobre un asiento existente para eliminarlo. Los números se ajustarán automáticamente.
                    </p>
                </div>

                <div className="flex flex-col items-center">
                    <div className="bg-white border text-center rounded-3xl p-8 shadow-inner bg-gray-50/30">
                        <div className="mb-10 flex flex-col items-center justify-center gap-2">
                             <div className="px-6 py-2 bg-gray-900 text-white rounded-2xl text-[10px] font-black tracking-[0.2em] uppercase shadow-xl flex items-center gap-3">
                                <ChevronUp className="w-4 h-4 text-primary" />
                                FRENTE DEL BUS
                             </div>
                             <div className="w-48 h-2 bg-gray-200 rounded-full mt-4"></div>
                        </div>

                        <div className="flex flex-col items-center gap-4">
                            {Array.from({ length: rows }, (_, i) => i + 1).map(row => (
                                <div key={row} className="flex items-center gap-3">
                                    <div className="w-6 text-[10px] font-black text-gray-300 text-right uppercase tracking-tighter">{row}</div>

                                    <div className="flex gap-2">
                                        {[1, 2].map(col => {
                                            const seat = getSeatAt(row, col)
                                            return (
                                                // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions
                                                <div
                                                    key={`${row}-${col}`}
                                                    onClick={() => toggleSeat(row, col)}
                                                    className={cn(
                                                        "w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 cursor-pointer select-none",
                                                        seat 
                                                            ? "bg-primary text-white shadow-lg shadow-primary/30 border-b-4 border-primary-dark active:border-b-0 active:translate-y-1" 
                                                            : "bg-white border-2 border-dashed border-gray-200 hover:border-primary/40 hover:bg-primary/5 text-gray-200 hover:text-primary transition-all active:scale-95"
                                                    )}
                                                >
                                                    {seat ? (
                                                        <span className="font-black text-sm">{seat.seat_number}</span>
                                                    ) : (
                                                        <Plus className="w-5 h-5 opacity-20" />
                                                    )}
                                                </div>
                                            )
                                        })}
                                    </div>

                                    <div className="w-10 h-12 flex items-center justify-center mx-2">
                                        <div className="w-1.5 h-full bg-gray-100 rounded-full border border-gray-50"></div>
                                    </div>

                                    <div className="flex gap-2">
                                        {[3, 4].map(col => {
                                            const seat = getSeatAt(row, col)
                                            return (
                                                // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions
                                                <div
                                                    key={`${row}-${col}`}
                                                    onClick={() => toggleSeat(row, col)}
                                                    className={cn(
                                                        "w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 cursor-pointer select-none",
                                                        seat 
                                                            ? "bg-primary text-white shadow-lg shadow-primary/30 border-b-4 border-primary-dark active:border-b-0 active:translate-y-1" 
                                                            : "bg-white border-2 border-dashed border-gray-200 hover:border-primary/40 hover:bg-primary/5 text-gray-200 hover:text-primary transition-all active:scale-95"
                                                    )}
                                                >
                                                    {seat ? (
                                                        <span className="font-black text-sm">{seat.seat_number}</span>
                                                    ) : (
                                                        <Plus className="w-5 h-5 opacity-20" />
                                                    )}
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="mt-12 flex flex-col items-center justify-center gap-2">
                             <div className="w-48 h-2 bg-gray-200 rounded-full mb-4"></div>
                             <div className="px-6 py-2 bg-gray-200 text-gray-500 rounded-2xl text-[10px] font-black tracking-[0.2em] uppercase flex items-center gap-3">
                                <ChevronDown className="w-4 h-4 text-gray-400" />
                                PARTE TRASERA
                             </div>
                        </div>
                    </div>
                </div>

                <div className="mt-8 flex flex-wrap justify-center gap-8 text-[10px] font-black uppercase tracking-widest text-gray-400 pb-6">
                    <div className="flex items-center gap-3">
                        <div className="w-5 h-5 bg-primary rounded-lg shadow-lg shadow-primary/20 border-b-2 border-primary-dark"></div>
                        <span>Ocupado / Seleccionado</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="w-5 h-5 bg-white border-2 border-dashed border-gray-200 rounded-lg"></div>
                        <span>Pasillo / Disponible</span>
                    </div>
                </div>
            </div>
        </div>
    )
}
