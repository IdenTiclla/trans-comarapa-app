import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import QuickSearch from '@/components/dashboard/QuickSearch'

import '@testing-library/jest-dom/vitest'

vi.mock('@/components/tickets/TicketModal', () => ({
  default: ({ show }: { show: boolean }) => (show ? <div>Ticket Modal</div> : null),
}))

vi.mock('@/components/packages/PackageReceiptModal', () => ({
  default: ({ show }: { show: boolean }) => (show ? <div>Package Modal</div> : null),
}))

vi.mock('@/services/client.service', () => ({
  clientService: {
    search: vi.fn().mockResolvedValue({ clients: [] }),
  },
}))

vi.mock('@/services/ticket.service', () => ({
  ticketService: {
    search: vi.fn().mockResolvedValue({ tickets: [] }),
  },
}))

vi.mock('@/services/trip.service', () => ({
  tripService: {
    getAll: vi.fn().mockResolvedValue({ trips: [] }),
    getById: vi.fn().mockResolvedValue({}),
  },
}))

vi.mock('@/services/package.service', () => ({
  packageService: {
    search: vi.fn().mockResolvedValue({ packages: [] }),
    getById: vi.fn().mockResolvedValue({}),
  },
  PACKAGE_STATUS_LABELS: {},
}))

describe('QuickSearch', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders the search button', () => {
    render(<QuickSearch />)
    expect(screen.getByText('Busqueda Rapida')).toBeInTheDocument()
  })

  it('opens modal showing category selection when button is clicked', async () => {
    const user = userEvent.setup()
    render(<QuickSearch />)

    await user.click(screen.getByText('Busqueda Rapida'))

    expect(screen.getByText('Que deseas buscar?')).toBeInTheDocument()
    expect(screen.getByText('Cliente')).toBeInTheDocument()
    expect(screen.getByText('Boleto')).toBeInTheDocument()
    expect(screen.getByText('Viaje')).toBeInTheDocument()
    expect(screen.getByText('Paquete')).toBeInTheDocument()
  })

  it('shows search input after selecting a category', async () => {
    const user = userEvent.setup()
    render(<QuickSearch />)

    await user.click(screen.getByText('Busqueda Rapida'))
    await user.click(screen.getByText('Cliente'))

    expect(screen.getByPlaceholderText('Nombre o CI...')).toBeInTheDocument()
    expect(screen.getByText('Buscando en Clientes')).toBeInTheDocument()
  })

  it('shows placeholder text in search view before typing', async () => {
    const user = userEvent.setup()
    render(<QuickSearch />)

    await user.click(screen.getByText('Busqueda Rapida'))
    await user.click(screen.getByText('Cliente'))
    expect(screen.getByText(/escribe para buscar en/i)).toBeInTheDocument()
  })

  it('goes back to category selection when clicking back button', async () => {
    const user = userEvent.setup()
    render(<QuickSearch />)
    await user.click(screen.getByText('Busqueda Rapida'))
    await user.click(screen.getByText('Cliente'))
    const backButton = document.querySelector('button:has(.lucide-arrow-left)') as HTMLButtonElement
    await user.click(backButton)
    expect(screen.getByText('Que deseas buscar?')).toBeInTheDocument()
  })

  it('closes modal with ESC key', async () => {
    const user = userEvent.setup()
    render(<QuickSearch />)
    await user.click(screen.getByText('Busqueda Rapida'))
    expect(screen.getByText('Que deseas buscar?')).toBeInTheDocument()
    await user.keyboard('{Escape}')
    await waitFor(() => {
      expect(screen.queryByText('Que deseas buscar?')).not.toBeInTheDocument()
    })
  })

  it('selects different categories and shows correct placeholders', async () => {
    const user = userEvent.setup()
    render(<QuickSearch />)
    await user.click(screen.getByText('Busqueda Rapida'))
    await user.click(screen.getByText('Boleto'))
    expect(screen.getByPlaceholderText(/boleto/i)).toBeInTheDocument()
    const backButton = document.querySelector('button:has(.lucide-arrow-left)') as HTMLButtonElement
    await user.click(backButton)
    await waitFor(() => {
      expect(screen.getByText('Que deseas buscar?')).toBeInTheDocument()
    })
    await user.click(screen.getByText('Viaje'))
    expect(screen.getByPlaceholderText(/origen/i)).toBeInTheDocument()
  })
})
