import { useMemo } from 'react'

interface DeckSelectorProps {
    busType?: string | null
    floors?: number | null
    selectedDeck: string
    seats?: any[]
    occupiedSeatsCount?: number
    reservedSeatsCount?: number
    availableSeatsCount?: number
    totalFilteredSeatsCount?: number
    onDeckChanged: (deck: string) => void
}

export default function DeckSelector({
    busType = null,
    floors = null,
    selectedDeck,
    seats = [],
    occupiedSeatsCount = 0,
    reservedSeatsCount = 0,
    availableSeatsCount = 0,
    totalFilteredSeatsCount = 0,
    onDeckChanged
}: DeckSelectorProps) {

    const isDoubleDeck = useMemo(() => {
        if (floors !== null) return floors >= 2
        if (busType) return busType === 'double-deck' || busType === 'double_deck'
        return false
    }, [floors, busType])

    const usesFirstSecond = useMemo(() => {
        return selectedDeck === 'FIRST' || selectedDeck === 'SECOND'
    }, [selectedDeck])

    const firstDeckValue = usesFirstSecond ? 'FIRST' : 'lower'
    const secondDeckValue = usesFirstSecond ? 'SECOND' : 'upper'

    const isFirstDeckSelected = selectedDeck === 'FIRST' || selectedDeck === 'lower'
    const isSecondDeckSelected = selectedDeck === 'SECOND' || selectedDeck === 'upper'

    const firstDeckSeatsCount = useMemo(() => {
        if (!isDoubleDeck) return null
        return seats.filter(seat => seat.deck === 'FIRST' || seat.deck === 'lower').length
    }, [isDoubleDeck, seats])

    const secondDeckSeatsCount = useMemo(() => {
        if (!isDoubleDeck) return null
        return seats.filter(seat => seat.deck === 'SECOND' || seat.deck === 'upper').length
    }, [isDoubleDeck, seats])

    const getDeckDisplayName = () => {
        if (isFirstDeckSelected) return 'Planta Baja'
        if (isSecondDeckSelected) return 'Planta Alta'
        return 'Planta Única'
    }

    if (!isDoubleDeck) return null

    return (
        <div className="bg-white border border-gray-200 rounded-2xl p-4 mb-6 shadow-sm transition-all duration-300">
            <div className="flex bg-gray-100 rounded-xl p-1">
                <button
                    onClick={() => onDeckChanged(firstDeckValue)}
                    className={`flex-1 flex items-center justify-center px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg text-sm font-medium transition-all duration-200 hover:-translate-y-px active:translate-y-0 ${isFirstDeckSelected ? 'bg-blue-600 text-white shadow-md' : 'text-gray-600 hover:text-gray-800 hover:bg-gray-200'}`}
                >
                    <span className="mr-1.5">🔽</span>
                    <span className="hidden sm:inline">Planta</span>
                    <span className="sm:hidden">P.</span>
                    <span className="ml-1">Baja</span>
                    {firstDeckSeatsCount !== null && (
                        <span className="ml-1.5 text-xs opacity-75">({firstDeckSeatsCount})</span>
                    )}
                </button>

                <button
                    onClick={() => onDeckChanged(secondDeckValue)}
                    className={`flex-1 flex items-center justify-center px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg text-sm font-medium transition-all duration-200 hover:-translate-y-px active:translate-y-0 ${isSecondDeckSelected ? 'bg-blue-600 text-white shadow-md' : 'text-gray-600 hover:text-gray-800 hover:bg-gray-200'}`}
                >
                    <span className="mr-1.5">🔼</span>
                    <span className="hidden sm:inline">Planta</span>
                    <span className="sm:hidden">P.</span>
                    <span className="ml-1">Alta</span>
                    {secondDeckSeatsCount !== null && (
                        <span className="ml-1.5 text-xs opacity-75">({secondDeckSeatsCount})</span>
                    )}
                </button>
            </div>

            <div className="mt-3 flex items-center justify-between bg-gray-50 rounded-xl p-3 border border-gray-100">
                <div className="flex items-center space-x-2 min-w-0">
                    <div className="w-2.5 h-2.5 bg-blue-600 rounded-full animate-pulse flex-shrink-0" />
                    <span className="text-xs sm:text-sm font-semibold text-gray-700 truncate">
                        {getDeckDisplayName()}
                    </span>
                </div>

                <div className="flex items-center space-x-2 sm:space-x-4 flex-shrink-0">
                    <div className="text-center">
                        <span className="text-base sm:text-lg font-black text-indigo-600">{totalFilteredSeatsCount}</span>
                        <p className="text-[10px] sm:text-xs text-gray-500">Total</p>
                    </div>
                    <div className="w-px h-6 sm:h-8 bg-gray-200" />
                    <div className="text-center">
                        <span className="text-base sm:text-lg font-black text-red-600">{occupiedSeatsCount}</span>
                        <p className="text-[10px] sm:text-xs text-gray-500">Ocupados</p>
                    </div>
                    <div className="w-px h-6 sm:h-8 bg-gray-200" />
                    <div className="text-center">
                        <span className="text-base sm:text-lg font-black text-amber-600">{reservedSeatsCount}</span>
                        <p className="text-[10px] sm:text-xs text-gray-500">Reservados</p>
                    </div>
                    <div className="w-px h-6 sm:h-8 bg-gray-200" />
                    <div className="text-center">
                        <span className="text-base sm:text-lg font-black text-emerald-600">{availableSeatsCount}</span>
                        <p className="text-[10px] sm:text-xs text-gray-500">Disponibles</p>
                    </div>
                </div>
            </div>
        </div>
    )
}
