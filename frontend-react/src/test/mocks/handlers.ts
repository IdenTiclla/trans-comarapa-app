import { http, HttpResponse } from 'msw'

const API = 'http://localhost:8000/api/v1'

export const clientHandlers = [
  http.get(`${API}/clients/search`, ({ request }) => {
    const url = new URL(request.url)
    const term = url.searchParams.get('q') || url.searchParams.get('term')
    return HttpResponse.json({
      clients: term
        ? [
            {
              id: 1,
              firstname: 'Juan',
              lastname: 'Perez',
              document_id: '123',
              phone: '7123',
            },
          ]
        : [],
    })
  }),

  http.get(`${API}/clients`, () => {
    return HttpResponse.json({
      clients: [
        {
          id: 1,
          firstname: 'Test',
          lastname: 'Client',
          document_id: '12345678',
          phone: '70012345',
        },
      ],
    })
  }),

  http.get(`${API}/clients/:id`, ({ params }) => {
    return HttpResponse.json({
      id: Number(params.id),
      firstname: 'Test',
      lastname: 'Client',
      document_id: '12345678',
      phone: '70012345',
    })
  }),
]

export const ticketHandlers = [
  http.get(`${API}/tickets`, () => {
    return HttpResponse.json({ tickets: [] })
  }),

  http.get(`${API}/tickets/:id`, ({ params }) => {
    return HttpResponse.json({
      id: Number(params.id),
      state: 'pending',
      seat_id: 1,
      client_id: 1,
      trip_id: 1,
      price: 50.0,
      payment_method: 'cash',
    })
  }),
]

export const tripHandlers = [
  http.get(`${API}/trips`, () => {
    return HttpResponse.json({
      trips: [],
      pagination: { total: 0, skip: 0, limit: 10, pages: 0 },
    })
  }),

  http.get(`${API}/trips/:id`, ({ params }) => {
    return HttpResponse.json({
      id: Number(params.id),
      trip_datetime: new Date().toISOString(),
      status: 'scheduled',
      driver_id: 1,
      assistant_id: 1,
      bus_id: 1,
      route_id: 1,
      route: { origin: 'Origin', destination: 'Destination', price: 50 },
      total_seats: 40,
      available_seats: 40,
    })
  }),
]

export const packageHandlers = [
  http.get(`${API}/packages/search`, () => {
    return HttpResponse.json({ packages: [] })
  }),

  http.get(`${API}/packages`, () => {
    return HttpResponse.json({ packages: [] })
  }),

  http.get(`${API}/packages/pending-collections`, ({ request }) => {
    const url = new URL(request.url)
    const officeId = url.searchParams.get('office_id')
    if (officeId === '1') {
      return HttpResponse.json([
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
            { id: 1, description: 'Caja de libros', quantity: 1, unit_price: 100, total_price: 100 },
            { id: 2, description: 'Sobre documentos', quantity: 1, unit_price: 50, total_price: 50 },
          ],
        },
      ])
    }
    return HttpResponse.json([])
  }),
]

export const authHandlers = [
  http.post(`${API}/auth/login`, () => {
    return HttpResponse.json({
      access_token: 'test-token',
      token_type: 'bearer',
      expires_in: 3600,
      refresh_token: 'test-refresh-token',
      role: 'secretary',
      user_id: 1,
      firstname: 'Test',
      lastname: 'User',
    })
  }),

  http.get(`${API}/auth/me`, () => {
    return HttpResponse.json({
      email: 'test@example.com',
      role: 'secretary',
      is_admin: false,
      firstname: 'Test',
      lastname: 'User',
    })
  }),
]

export const handlers = [
  ...clientHandlers,
  ...ticketHandlers,
  ...tripHandlers,
  ...packageHandlers,
  ...authHandlers,
]
