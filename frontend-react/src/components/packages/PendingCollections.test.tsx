import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders } from '@/test/test-utils'
import PendingCollections from '@/components/packages/PendingCollections'

import '@testing-library/jest-dom/vitest'

vi.mock('@/components/packages/PackageDeliveryModal', () => ({
    default: ({ show, onClose, onConfirm }: { show: boolean; onClose: () => void; onConfirm: () => void }) => (
        show ? (
            <div data-testid="delivery-modal">
                <span>Delivery Modal</span>
                <button onClick={onClose}>Close</button>
                <button onClick={onConfirm}>Confirm</button>
            </div>
        ) : null
    ),
}))

const mockGetPendingCollections = vi.fn()
vi.mock('@/services/package.service', () => ({
    packageService: {
        getPendingCollections: (...args: unknown[]) => mockGetPendingCollections(...args),
    },
}))

describe('PendingCollections', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    describe('when no office is assigned', () => {
        it('shows warning message when officeId is not provided', () => {
            renderWithProviders(<PendingCollections officeId={0} />)

            expect(screen.getByText(/no se ha asignado una oficina/i)).toBeInTheDocument()
        })
    })

    describe('when loading', () => {
        it('shows loading spinner while fetching data', () => {
            mockGetPendingCollections.mockImplementation(() => new Promise(() => {}))

            renderWithProviders(<PendingCollections officeId={1} />)

            expect(document.querySelector('.animate-spin')).toBeInTheDocument()
        })
    })

    describe('when error occurs', () => {
        it('shows error message and retry button', async () => {
            mockGetPendingCollections.mockRejectedValueOnce({
                data: { detail: 'Error del servidor' },
            })

            renderWithProviders(<PendingCollections officeId={1} />)

            await waitFor(() => {
                expect(screen.getByText(/error del servidor/i)).toBeInTheDocument()
            })

            expect(screen.getByText('Intentar nuevamente')).toBeInTheDocument()
        })

        it('retries fetch when retry button is clicked', async () => {
            const user = userEvent.setup()
            mockGetPendingCollections.mockRejectedValueOnce({
                data: { detail: 'Error del servidor' },
            })
            mockGetPendingCollections.mockResolvedValueOnce([])

            renderWithProviders(<PendingCollections officeId={1} />)

            await waitFor(() => {
                expect(screen.getByText(/error del servidor/i)).toBeInTheDocument()
            })

            await user.click(screen.getByText('Intentar nuevamente'))

            expect(mockGetPendingCollections).toHaveBeenCalledTimes(2)
        })
    })

    describe('when no pending collections', () => {
        it('shows empty state message', async () => {
            mockGetPendingCollections.mockResolvedValueOnce([])

            renderWithProviders(<PendingCollections officeId={1} />)

            await waitFor(() => {
                expect(screen.getByText(/no hay cobros pendientes/i)).toBeInTheDocument()
            })
            expect(screen.getByText(/todas las encomiendas por cobrar han sido entregadas/i)).toBeInTheDocument()
        })
    })

    describe('with pending collections', () => {
        const mockPackages = [
            {
                id: 1,
                tracking_number: 'ENC-001',
                status: 'arrived_at_destination',
                total_amount: 150.0,
                total_items_count: 2,
                sender_name: 'Juan Perez',
                recipient_name: 'Maria Lopez',
                origin_office_name: 'Comarapa',
                destination_office_name: 'Santa Cruz',
                payment_status: 'collect_on_delivery',
                created_at: '2024-01-15T10:00:00Z',
                items: [
                    { id: 1, description: 'Caja', quantity: 1, unit_price: 100, total_price: 100 },
                ],
            },
            {
                id: 2,
                tracking_number: 'ENC-002',
                status: 'arrived_at_destination',
                total_amount: 200.0,
                total_items_count: 1,
                sender_name: 'Ana Garcia',
                recipient_name: 'Pedro Ruiz',
                origin_office_name: 'Cochabamba',
                destination_office_name: 'Santa Cruz',
                payment_status: 'collect_on_delivery',
                created_at: '2024-01-15T11:00:00Z',
                items: [
                    { id: 2, description: 'Paquete', quantity: 1, unit_price: 200, total_price: 200 },
                ],
            },
        ]

        beforeEach(() => {
            mockGetPendingCollections.mockResolvedValue(mockPackages)
        })

        it('shows total pending amount and count', async () => {
            renderWithProviders(<PendingCollections officeId={1} />)

            await waitFor(() => {
                expect(screen.getByText('Bs. 350.00')).toBeInTheDocument()
            })
            expect(screen.getAllByText('2').length).toBeGreaterThan(0)
        })

        it('shows package tracking numbers in table', async () => {
            renderWithProviders(<PendingCollections officeId={1} />)

            await waitFor(() => {
                expect(screen.getByText('ENC-001')).toBeInTheDocument()
            })
            expect(screen.getByText('ENC-002')).toBeInTheDocument()
        })

        it('shows sender and recipient names', async () => {
            renderWithProviders(<PendingCollections officeId={1} />)

            await waitFor(() => {
                expect(screen.getByText('Juan Perez')).toBeInTheDocument()
            })
            expect(screen.getByText('Maria Lopez')).toBeInTheDocument()
            expect(screen.getByText('Ana Garcia')).toBeInTheDocument()
            expect(screen.getByText('Pedro Ruiz')).toBeInTheDocument()
        })

        it('shows individual package amounts', async () => {
            renderWithProviders(<PendingCollections officeId={1} />)

            await waitFor(() => {
                expect(screen.getAllByText(/150.00/).length).toBeGreaterThan(0)
            })
        })

        it('opens delivery modal when deliver button is clicked', async () => {
            const user = userEvent.setup()

            renderWithProviders(<PendingCollections officeId={1} />)

            await waitFor(() => {
                expect(screen.getByText('ENC-001')).toBeInTheDocument()
            })

            const deliverButtons = screen.getAllByText('Entregar y Cobrar')
            await user.click(deliverButtons[0])

            expect(screen.getByTestId('delivery-modal')).toBeInTheDocument()
        })

        it('refreshes list after successful delivery', async () => {
            const user = userEvent.setup()

            renderWithProviders(<PendingCollections officeId={1} />)

            await waitFor(() => {
                expect(screen.getByText('ENC-001')).toBeInTheDocument()
            })

            const deliverButtons = screen.getAllByText('Entregar y Cobrar')
            await user.click(deliverButtons[0])

            await user.click(screen.getByText('Confirm'))

            await waitFor(() => {
                expect(mockGetPendingCollections).toHaveBeenCalledTimes(2)
            })
        })
    })

    describe('in compact mode', () => {
        const mockPackages = [
            {
                id: 1,
                tracking_number: 'ENC-001',
                status: 'arrived_at_destination',
                total_amount: 100.0,
                total_items_count: 1,
                sender_name: 'Juan Perez',
                recipient_name: 'Maria Lopez',
                origin_office_name: 'Comarapa',
                destination_office_name: 'Santa Cruz',
                payment_status: 'collect_on_delivery',
                created_at: '2024-01-15T10:00:00Z',
                items: [],
            },
        ]

        beforeEach(() => {
            mockGetPendingCollections.mockResolvedValue(mockPackages)
        })

        it('shows compact card view', async () => {
            renderWithProviders(<PendingCollections officeId={1} compact={true} />)

            await waitFor(() => {
                expect(screen.getByText(/ENC-001/)).toBeInTheDocument()
            })

            expect(screen.getByText('Entregar')).toBeInTheDocument()
        })

        it('shows onViewAll button when provided', async () => {
            const onViewAll = vi.fn()

            renderWithProviders(<PendingCollections officeId={1} compact={true} onViewAll={onViewAll} />)

            await waitFor(() => {
                expect(screen.getByText(/ver todos los cobros pendientes/i)).toBeInTheDocument()
            })
        })
    })

    describe('with limit prop', () => {
        it('passes limit to API call', async () => {
            mockGetPendingCollections.mockResolvedValueOnce([])

            renderWithProviders(<PendingCollections officeId={1} limit={5} />)

            await waitFor(() => {
                expect(mockGetPendingCollections).toHaveBeenCalledWith(1, { limit: 5 })
            })
        })
    })
})
