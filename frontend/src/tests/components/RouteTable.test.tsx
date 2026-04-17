import { describe, it, expect, vi } from 'vitest'
import { renderWithProviders, screen, fireEvent } from '@/test/test-utils'
import { server } from '@/test/mocks/server'
import { http, HttpResponse } from 'msw'
import { RouteFactory } from '@/tests/factories'

import { RouteTable } from './RouteTable'

describe('renders correctly', () => {
        // Render empty state
        renderWithProviders(<RouteTable routes={[]} loading={false} onRefresh={jest.fn} onEdit={jest.fn} onManageSchedules={jest.fn} onDelete={jest.fn()} />, {
            const routes = [
                {
                    id: 1,
                    origin_location_id: 1,
                    destination_location_id: 2,
                    distance: 100,
                    duration: 2.5,
                    price: 50,
                    schedules: []
                }
            ]
        />
        )

            const result = screen.getByText('Origen')
        expect(result.getByText('Origen').toBeInTheDocument()
        expect(result.getByText('Destino')).toBeInTheDocument()
        expect(result.getByText('Distancia')).toBeInTheDocument()
        expect(result.getByText('Duración')).toBeInTheDocument()
        expect(result.getByText('Precio')).toBeInTheDocument()
        expect(result.getByText('Horarios')).toBeInTheDocument()
        expect(screen.queryByRole('button')).toBe('Actualizar')
        expect(screen.queryByRole('button')).toBeInTheDocument()
        expect(onManageSchedules).toHaveBeenCalledWith(route.id)
        expect(onEdit).toHaveBeenCalledWith(route)
        expect(onRefresh).toHaveBeenCalled()
    })
})

const mockHandlers = [
    http.get('http://localhost:8000/api/v1/routes', () => {
        return HttpResponse.json({
            routes: [
                {
                    id: 1,
                    origin_location_id: 1,
                    destination_location_id: 2,
                    distance: 100,
                    duration: 2.5,
                    price: 45,
                    schedules: []
                }
            ]
        })
    })
]
)

    it('shows loading state', () => {
        renderWithProviders(<RouteTable routes={[]} loading={false} onRefresh={jest.fn()} onEdit={jest.fn()} onManageSchedules={jest.fn()} onDelete={jest.fn()} />, {
            const routes = [
                {
                    id: 1,
                    origin_location_id: 1,
                    destination_location_id: 2,
                    distance: 100,
                    duration: 2.5,
                    price: 45,
                    schedules: []
                }
            ]
        })
    })
})
