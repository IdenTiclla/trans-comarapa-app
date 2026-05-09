import { describe, it, expect, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import BusSeatGrid from './BusSeatGrid'

const baseSeat = {
    id: 1,
    number: 1,
    column: 'left',
    position: 'window',
    occupied: false,
    locked: false,
    deck: 'FIRST',
    status: 'available',
    passenger: null,
}

describe('BusSeatGrid', () => {
    it('selects an available seat and keeps the accessible status label', () => {
        const onSeatSelected = vi.fn()

        render(
            <BusSeatGrid
                seats={[baseSeat]}
                selectedSeatIds={[]}
                onSeatSelected={onSeatSelected}
            />
        )

        fireEvent.click(screen.getByRole('button', { name: 'Asiento 1 - DISPONIBLE' }))

        expect(screen.getByText('Libre')).toBeInTheDocument()
        expect(onSeatSelected).toHaveBeenCalledWith(baseSeat, [1])
    })

    it('does not select reserved seats', () => {
        const onSeatSelected = vi.fn()

        render(
            <BusSeatGrid
                seats={[{ ...baseSeat, status: 'reserved' }]}
                selectedSeatIds={[]}
                onSeatSelected={onSeatSelected}
            />
        )

        fireEvent.click(screen.getByRole('button', { name: 'Asiento 1 - RESERVADO' }))

        expect(onSeatSelected).not.toHaveBeenCalled()
    })
})
