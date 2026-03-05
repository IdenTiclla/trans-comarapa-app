import React, { useState, useEffect, useMemo, useCallback } from 'react'

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

    const getCellClass = (row: number, col: number) => {
        const hasSeat = getSeatAt(row, col)
        if (hasSeat) {
            return 'border-transparent'
        }
        return 'border-dashed border-gray-300 hover:border-indigo-400 hover:bg-indigo-50'
    }

    return (
        <div className="seat-layout-editor select-none">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-4 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <label htmlFor="rows" className="text-sm font-medium text-gray-700">Filas:</label>
                        <div className="flex items-center gap-1">
                            <button
                                type="button"
                                onClick={decrementRows}
                                disabled={rows <= 1}
                                className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded-l-md bg-gray-50 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                                </svg>
                            </button>
                            <input
                                id="rows"
                                value={rows}
                                onChange={(e) => {
                                    const val = parseInt(e.target.value) || 1
                                    if (val >= 1 && val <= 20) {
                                        setRows(val)
                                        onRowsChange?.(val)
                                    }
                                }}
                                type="number"
                                min="1"
                                max="20"
                                className="w-12 h-8 px-2 py-1 border-t border-b border-gray-300 text-sm text-center focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                            <button
                                type="button"
                                onClick={incrementRows}
                                disabled={rows >= 20}
                                className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded-r-md bg-gray-50 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={fillAll}
                        className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                    >
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
                        </svg>
                        Llenar Todo
                    </button>
                    <button
                        type="button"
                        onClick={clearAll}
                        className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        Limpiar Todo
                    </button>
                </div>

                <div className="flex items-center gap-2 px-3 py-1.5 bg-indigo-100 rounded-md">
                    <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <span className="text-sm font-medium text-indigo-700">Asientos: {seatCount}</span>
                </div>
            </div>

            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-700">
                    <span className="font-medium">Instrucciones:</span> Haz click en una celda vacia para agregar un asiento, o click en un asiento existente para eliminarlo.
                </p>
            </div>

            <div className="flex flex-col lg:flex-row gap-6">
                <div className="flex-1">
                    <div className="bg-white border-2 border-gray-200 rounded-lg p-4 overflow-x-auto">
                        <div className="text-center mb-4">
                            <div className="inline-flex items-center px-4 py-1 bg-gray-100 rounded-full text-sm text-gray-600">
                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                                </svg>
                                FRENTE DEL BUS
                            </div>
                        </div>

                        <div className="flex flex-col items-center gap-2">
                            {Array.from({ length: rows }, (_, i) => i + 1).map(row => (
                                <div key={row} className="flex items-center gap-1">
                                    <span className="w-6 text-xs text-gray-400 text-right mr-2">{row}</span>

                                    {[1, 2].map(col => {
                                        const seat = getSeatAt(row, col)
                                        return (
                                            <div
                                                key={`${row}-${col}`}
                                                onClick={() => toggleSeat(row, col)}
                                                className={`w-12 h-12 border-2 rounded-lg flex items-center justify-center transition-all cursor-pointer select-none ${getCellClass(row, col)}`}
                                            >
                                                {seat ? (
                                                    <div className="w-full h-full bg-indigo-600 rounded-lg flex items-center justify-center text-white font-medium text-sm hover:bg-indigo-700 transition-colors">
                                                        {seat.seat_number}
                                                    </div>
                                                ) : (
                                                    <svg className="w-5 h-5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                                    </svg>
                                                )}
                                            </div>
                                        )
                                    })}

                                    <div className="w-8 h-12 flex items-center justify-center">
                                        <div className="w-1 h-full bg-gray-200 rounded-full"></div>
                                    </div>

                                    {[3, 4].map(col => {
                                        const seat = getSeatAt(row, col)
                                        return (
                                            <div
                                                key={`${row}-${col}`}
                                                onClick={() => toggleSeat(row, col)}
                                                className={`w-12 h-12 border-2 rounded-lg flex items-center justify-center transition-all cursor-pointer select-none ${getCellClass(row, col)}`}
                                            >
                                                {seat ? (
                                                    <div className="w-full h-full bg-indigo-600 rounded-lg flex items-center justify-center text-white font-medium text-sm hover:bg-indigo-700 transition-colors">
                                                        {seat.seat_number}
                                                    </div>
                                                ) : (
                                                    <svg className="w-5 h-5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                                    </svg>
                                                )}
                                            </div>
                                        )
                                    })}
                                </div>
                            ))}
                        </div>

                        <div className="text-center mt-4">
                            <div className="inline-flex items-center px-4 py-1 bg-gray-100 rounded-full text-sm text-gray-600">
                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                                </svg>
                                PARTE TRASERA
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-indigo-600 rounded"></div>
                    <span>Asiento (click para quitar)</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-6 h-6 border-2 border-dashed border-gray-300 rounded flex items-center justify-center">
                        <svg className="w-3 h-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                    </div>
                    <span>Vacio (click para agregar)</span>
                </div>
            </div>
        </div>
    )
}
