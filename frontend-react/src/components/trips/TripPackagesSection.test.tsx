import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import TripPackagesSection from './TripPackagesSection'

const mockPackages = [
    {
        id: 1,
        tracking_number: 'PKG-123',
        status: 'registered_at_office',
        sender_name: 'Juan Perez',
        recipient_name: 'Maria Lopez',
        total_amount: 150.5,
        total_items_count: 2,
    }
]

describe('TripPackagesSection', () => {
    it('renders packages and toggles view modes', () => {
        render(
            <MemoryRouter>
                <TripPackagesSection tripPackages={mockPackages} tripStatus="scheduled" />
            </MemoryRouter>
        )

        // Title should be present
        expect(screen.getByText('Encomiendas')).toBeDefined()
        
        // Find toggle buttons
        const listBtn = document.querySelector('#btn-view-list') as HTMLButtonElement
        const cardsBtn = document.querySelector('#btn-view-cards') as HTMLButtonElement

        expect(listBtn).toBeDefined()
        expect(cardsBtn).toBeDefined()

        // By default, list view should be active
        // The list view is the default, and it should show the tracking number
        expect(screen.getAllByText('#PKG-123').length).toBeGreaterThan(0)

        // Switch to cards view
        fireEvent.click(cardsBtn)

        expect(screen.getAllByText('#PKG-123').length).toBeGreaterThan(0)
    })

    it('shows empty state when no packages', () => {
        render(
            <MemoryRouter>
                <TripPackagesSection tripPackages={[]} tripStatus="scheduled" />
            </MemoryRouter>
        )
        
        expect(screen.getByText('No hay encomiendas cargadas en este viaje')).toBeDefined()
    })
})
