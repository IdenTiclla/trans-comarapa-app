import { describe, it, expect, vi } from 'vitest'
import { renderWithProviders, screen, fireEvent } from '@/test/test-utils'
import SeatContextMenu from '@/components/seats/SeatContextMenu'

const baseProps = {
    visible: true,
    position: { x: 100, y: 100 },
    selectedSeat: {
        id: 1,
        number: 5,
        status: 'reserved' as const,
        occupied: false,
        locked: false,
        position: 'window',
        column: 'left',
        deck: 'FIRST',
        passenger: { name: 'Juan Perez', phone: '123456' },
    },
    enableContextMenu: true,
    onCancelReservation: vi.fn(),
    onConfirmSale: vi.fn(),
    onChangeSeat: vi.fn(),
    onRescheduleTrip: vi.fn(),
}

function renderMenu(overrides: Partial<typeof baseProps> = {}) {
    const props = { ...baseProps, ...overrides }
    const onChangeSeat = props.onChangeSeat as ReturnType<typeof vi.fn>
    const onConfirmSale = props.onConfirmSale as ReturnType<typeof vi.fn>
    const onCancelReservation = props.onCancelReservation as ReturnType<typeof vi.fn>
    const onRescheduleTrip = props.onRescheduleTrip as ReturnType<typeof vi.fn>

    const result = renderWithProviders(
        <SeatContextMenu
            {...props}
            onChangeSeat={onChangeSeat}
            onConfirmSale={onConfirmSale}
            onCancelReservation={onCancelReservation}
            onRescheduleTrip={onRescheduleTrip}
        />
    )
    return { ...result, onChangeSeat, onConfirmSale, onCancelReservation, onRescheduleTrip }
}

describe('SeatContextMenu', () => {
    it('shows change seat button for reserved seats', () => {
        renderMenu()

        expect(screen.getByText('Cambiar asiento')).toBeInTheDocument()
    })

    it('calls onChangeSeat when clicking change seat on reserved seat', () => {
        const { onChangeSeat } = renderMenu()

        fireEvent.click(screen.getByText('Cambiar asiento'))
        expect(onChangeSeat).toHaveBeenCalledTimes(1)
    })

    it('shows confirm sale and cancel reservation for reserved seats', () => {
        renderMenu()

        expect(screen.getByText('Confirmar venta')).toBeInTheDocument()
        expect(screen.getByText('Cancelar reserva')).toBeInTheDocument()
    })

    it('shows change seat button for occupied seats', () => {
        renderMenu({
            selectedSeat: {
                ...baseProps.selectedSeat!,
                status: 'occupied',
                occupied: true,
            },
        })

        expect(screen.getByText('Cambiar asiento')).toBeInTheDocument()
    })

    it('does not render when not visible', () => {
        renderMenu({ visible: false })

        expect(screen.queryByText('Cambiar asiento')).not.toBeInTheDocument()
    })

    it('does not render when context menu is disabled', () => {
        renderMenu({ enableContextMenu: false })

        expect(screen.queryByText('Cambiar asiento')).not.toBeInTheDocument()
    })

    it('does not show change seat for available seats', () => {
        renderMenu({
            selectedSeat: {
                ...baseProps.selectedSeat!,
                status: 'available',
                occupied: false,
            },
        })

        expect(screen.queryByText('Cambiar asiento')).not.toBeInTheDocument()
    })
})
