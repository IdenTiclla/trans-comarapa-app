import { describe, it, expect, vi } from 'vitest'
import { renderWithProviders, screen, fireEvent } from '@/test/test-utils'
import RouteTable from '@/components/admin/RouteTable'

const mockRoutes = [
    {
        id: 1,
        origin_location: { name: 'Santa Cruz' },
        destination_location: { name: 'Cochabamba' },
        distance: 300,
        duration: 4.5,
        price: 80,
        schedules: [{ id: 1 }, { id: 2 }],
    },
    {
        id: 2,
        origin_location: { name: 'La Paz' },
        destination_location: { name: 'Oruro' },
        distance: 230,
        duration: 3,
        price: 50,
        schedules: [],
    },
]

function renderTable(overrides: Partial<Parameters<typeof RouteTable>[0]> = {}) {
    const props = {
        routes: mockRoutes,
        loading: false,
        error: null,
        onRefresh: vi.fn(),
        onCreate: vi.fn(),
        onEdit: vi.fn(),
        onDelete: vi.fn(),
        onManageSchedules: vi.fn(),
        ...overrides,
    }
    const result = renderWithProviders(<RouteTable {...props} />)
    return { ...result, props }
}

describe('RouteTable', () => {
    it('renders route data in table rows', () => {
        renderTable()

        expect(screen.getByText('Santa Cruz')).toBeInTheDocument()
        expect(screen.getByText('Cochabamba')).toBeInTheDocument()
        expect(screen.getByText('La Paz')).toBeInTheDocument()
        expect(screen.getByText('Oruro')).toBeInTheDocument()
        expect(screen.getByText('300 km')).toBeInTheDocument()
        expect(screen.getByText('4.5 hrs')).toBeInTheDocument()
        expect(screen.getByText('2 rutas registradas')).toBeInTheDocument()
    })

    it('shows loading state', () => {
        renderTable({ loading: true, routes: [] })

        expect(screen.getByText('Cargando rutas...')).toBeInTheDocument()
    })

    it('shows error state', () => {
        renderTable({ error: 'Error de conexion', routes: [] })

        expect(screen.getByText('Error de conexion')).toBeInTheDocument()
    })

    it('shows empty state when no routes', () => {
        renderTable({ routes: [] })

        expect(screen.getByText('No hay rutas')).toBeInTheDocument()
        expect(screen.getByText('Nueva Ruta')).toBeInTheDocument()
    })

    it('calls onRefresh when Actualizar is clicked', () => {
        const { props } = renderTable()

        fireEvent.click(screen.getByLabelText('Actualizar lista de rutas'))
        expect(props.onRefresh).toHaveBeenCalledTimes(1)
    })

    it('calls onCreate when Nueva Ruta is clicked', () => {
        const { props } = renderTable()

        const buttons = screen.getAllByText('Nueva Ruta')
        fireEvent.click(buttons[0])
        expect(props.onCreate).toHaveBeenCalledTimes(1)
    })

    it('calls onEdit when edit button is clicked', () => {
        const { props } = renderTable()

        const editButtons = screen.getAllByLabelText('Editar ruta')
        fireEvent.click(editButtons[0])
        expect(props.onEdit).toHaveBeenCalledWith(mockRoutes[0])
    })

    it('calls onDelete when delete button is clicked', () => {
        const { props } = renderTable()

        const deleteButtons = screen.getAllByLabelText('Eliminar ruta')
        fireEvent.click(deleteButtons[0])
        expect(props.onDelete).toHaveBeenCalledWith(mockRoutes[0])
    })

    it('calls onManageSchedules when schedule badge is clicked', () => {
        const { props } = renderTable()

        const scheduleButtons = screen.getAllByLabelText('Gestionar horarios')
        fireEvent.click(scheduleButtons[0])
        expect(props.onManageSchedules).toHaveBeenCalledWith(mockRoutes[0])
    })

    it('shows schedule count per route', () => {
        renderTable()

        expect(screen.getByText('2 horarios')).toBeInTheDocument()
        expect(screen.getByText('0 horarios')).toBeInTheDocument()
    })

    it('shows price with Bs prefix', () => {
        renderTable()

        expect(screen.getByText('Bs. 80')).toBeInTheDocument()
        expect(screen.getByText('Bs. 50')).toBeInTheDocument()
    })
})
