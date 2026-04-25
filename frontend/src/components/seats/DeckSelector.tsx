import { useMemo } from 'react'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'

interface SeatLike {
    deck: string
    [k: string]: unknown
}

interface DeckSelectorProps {
    busType?: string | null
    floors?: number | null
    selectedDeck: string
    seats?: SeatLike[]
    onDeckChanged: (deck: string) => void
}

export default function DeckSelector({
    busType = null,
    floors = null,
    selectedDeck,
    seats = [],
    onDeckChanged,
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

    const firstDeckSeatsCount = useMemo(() => {
        if (!isDoubleDeck) return 0
        return seats.filter(seat => seat.deck === 'FIRST' || seat.deck === 'lower').length
    }, [isDoubleDeck, seats])

    const secondDeckSeatsCount = useMemo(() => {
        if (!isDoubleDeck) return 0
        return seats.filter(seat => seat.deck === 'SECOND' || seat.deck === 'upper').length
    }, [isDoubleDeck, seats])

    const currentValue = selectedDeck === 'FIRST' || selectedDeck === 'lower'
        ? firstDeckValue
        : secondDeckValue

    if (!isDoubleDeck) return null

    return (
        <div className="flex justify-center pt-1 pb-3">
            <Tabs
                value={currentValue}
                onValueChange={onDeckChanged}
            >
                <TabsList>
                    <TabsTrigger value={firstDeckValue}>
                        Planta Baja
                        <span className="ml-1.5 text-xs text-muted-foreground">
                            ({firstDeckSeatsCount})
                        </span>
                    </TabsTrigger>
                    <TabsTrigger value={secondDeckValue}>
                        Planta Alta
                        <span className="ml-1.5 text-xs text-muted-foreground">
                            ({secondDeckSeatsCount})
                        </span>
                    </TabsTrigger>
                </TabsList>
            </Tabs>
        </div>
    )
}
