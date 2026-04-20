import { describe, it, expect } from 'vitest'
import { renderWithProviders, screen, waitFor } from '@/test/test-utils'
import { server } from '@/test/mocks/server'
import { http, HttpResponse } from 'msw'
import { Component as TripPackagesManifestPage } from './TripPackagesManifestPage'

describe('TripPackagesManifestPage', () => {
    it('renders loading state initially', () => {
        renderWithProviders(<TripPackagesManifestPage />, {
            route: '/trips/1/packages-manifest',
            path: '/trips/:id/packages-manifest'
        })
        expect(screen.getByText(/cargando manifiesto de encomiendas/i)).toBeInTheDocument()
    })

    it('renders the manifest with package data', async () => {
        // Mock the trip response
        server.use(
            http.get('http://localhost:8000/api/v1/trips/:id', () => {
                return HttpResponse.json({
                    id: 1,
                    route: { origin: { name: 'Comarapa' }, destination: { name: 'Santa Cruz' } },
                    trip_datetime: '2025-12-01T00:00:00Z',
                    departure_time: '08:00',
                    bus: { license_plate: '1234-XYZ' },
                    driver: { firstname: 'Juan', lastname: 'Perez' },
                    status: 'scheduled'
                })
            }),
            http.get('http://localhost:8000/api/v1/packages/by-trip/:id', () => {
                return HttpResponse.json([
                    {
                        id: 1,
                        sender_name: 'Maria Clara',
                        recipient_name: 'Jose Garcia',
                        description: 'Caja con herramientas',
                        payment_status: 'paid_on_send',
                        total_amount: '50.00'
                    },
                    {
                        id: 2,
                        sender_name: 'Ana Lopez',
                        recipient_name: 'Luis Ruiz',
                        description: 'Sobre documento',
                        payment_status: 'collect_on_delivery',
                        total_amount: '20.00'
                    }
                ])
            })
        )

        renderWithProviders(<TripPackagesManifestPage />, {
            route: '/trips/1/packages-manifest',
            path: '/trips/:id/packages-manifest',
            preloadedState: {
                trip: {
                    currentTrip: null,
                    loading: false,
                    error: null,
                    filters: { route_id: null, origin_id: null, destination_id: null, state: 'active', start_date: null, end_date: null },
                    trips: [],
                    pagination: { page: 1, limit: 10, total: 0, total_pages: 0 }
                }
            }
        })

        // Wait for the data to load
        await waitFor(() => {
            expect(screen.getByText('Manifiesto de Encomiendas')).toBeInTheDocument()
        })

        // Verify the rendered data
        expect(screen.getByText('Maria Clara')).toBeInTheDocument()
        expect(screen.getByText('Jose Garcia')).toBeInTheDocument()
        expect(screen.getByText('Caja con herramientas')).toBeInTheDocument()
        
        expect(screen.getByText('Ana Lopez')).toBeInTheDocument()
        expect(screen.getByText('Sobre documento')).toBeInTheDocument()

        // Verify badges
        expect(screen.getByText('Pagado')).toBeInTheDocument()
        expect(screen.getByText('Por Cobrar')).toBeInTheDocument()
    })
})
