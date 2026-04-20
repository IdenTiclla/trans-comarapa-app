import { useState, useEffect, useMemo } from 'react'
import { useNavigate, useSearchParams, Navigate } from 'react-router'
import { useSelector } from 'react-redux'
import type { RootState } from '@/store'
import { apiFetch } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Printer } from 'lucide-react'

export function Component() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { user } = useSelector((state: RootState) => state.auth)
  const isAuthenticated = !!user

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [confirmedTrip, setConfirmedTrip] = useState<any>(null)
  const [fetchedTickets, setFetchedTickets] = useState<any[]>([])
  const [confirmedClient, setConfirmedClient] = useState<any>(null)

  useEffect(() => {
    async function loadConfirmation() {
      if (!isAuthenticated) return

      try {
        setLoading(true)
        setError(null)

        const tripId = searchParams.get('tripId')
        const ticketIdsParam = searchParams.get('ids')

        if (!tripId || !ticketIdsParam) {
          throw new Error('Información de viaje o boletos no encontrada en la URL.')
        }

        // Fetch trip details
        const tripRes = await apiFetch(`/trips/${tripId}`)
        if (!tripRes) {
          throw new Error('No se pudo cargar la información del viaje.')
        }
        setConfirmedTrip(tripRes)

        // Fetch ticket details
        const ticketIdArray = ticketIdsParam.split(',')
        const tickets = []
        let firstClientId = null

        if (ticketIdArray.length > 0) {
          for (const ticketId of ticketIdArray) {
            try {
              const ticketRes = await apiFetch(`/tickets/${ticketId}`) as any
              if (ticketRes) {
                tickets.push(ticketRes)
                if (!firstClientId && ticketRes.client_id) {
                  firstClientId = ticketRes.client_id
                }
              }
            } catch (err) {
              console.warn(`No se pudo cargar el boleto ID: ${ticketId}`, err)
            }
          }
        }

        if (tickets.length === 0) {
          throw new Error('No se pudieron cargar los detalles de los boletos.')
        }
        setFetchedTickets(tickets)

        // Fetch client details if possible
        if (firstClientId) {
          try {
            const clientRes = await apiFetch(`/clients/${firstClientId}`)
            if (clientRes) {
              setConfirmedClient(clientRes)
            }
          } catch (err) {
            console.warn(`No se pudo cargar el cliente ID: ${firstClientId}`, err)
          }
        }
      } catch (err: any) {
        console.error("Error en TicketConfirmationPage:", err)
        setError(err.message || 'Ocurrió un error al cargar los detalles de la confirmación.')
      } finally {
        setLoading(false)
      }
    }

    loadConfirmation()
  }, [searchParams, isAuthenticated])

  const primaryTicket = useMemo(() => {
    return fetchedTickets.length > 0 ? fetchedTickets[0] : null
  }, [fetchedTickets])

  const seatNumbersDisplay = useMemo(() => {
    if (fetchedTickets.length > 0) {
      return fetchedTickets.map(t => t.seat?.seat_number || t.seat_id).join(', ')
    }
    return searchParams.get('ids')
  }, [fetchedTickets, searchParams])

  const totalAmountDisplay = useMemo(() => {
    return fetchedTickets.reduce((sum, ticket) => sum + (parseFloat(ticket.price) || 0), 0).toFixed(2)
  }, [fetchedTickets])

  const formatDate = (dateStringOrDate?: string | Date) => {
    if (!dateStringOrDate) return 'Fecha no disponible'
    const date = new Date(dateStringOrDate)
    if (isNaN(date.getTime())) return 'Fecha inválida'
    return new Intl.DateTimeFormat('es-ES', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: 'numeric',
      minute: 'numeric'
    }).format(date)
  }

  const printTicket = () => {
    window.print()
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return (
    <div>
      <div className="py-6">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="flex justify-center py-12">
              <p className="text-gray-500">Cargando confirmación...</p>
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">{error}</h3>
                </div>
              </div>
            </div>
          ) : confirmedTrip && primaryTicket ? (
            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
              <div className="px-4 py-5 sm:px-6 border-b border-gray-200 bg-green-50">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-green-100 rounded-full p-2">
                    <svg className="h-8 w-8 text-green-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">¡Venta completada con éxito!</h3>
                    <p className="text-sm text-gray-500">Los boletos han sido emitidos correctamente.</p>
                  </div>
                </div>
              </div>

              <div className="px-4 py-5 sm:p-6">
                <h4 className="text-base font-medium text-gray-900 mb-4">Detalles de la venta</h4>

                <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Número de referencia</dt>
                    <dd className="mt-1 text-sm text-gray-900">T-{primaryTicket.id || 'N/A'}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Fecha de emisión</dt>
                    <dd className="mt-1 text-sm text-gray-900">{formatDate(primaryTicket.created_at || new Date())}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Cliente</dt>
                    <dd className="mt-1 text-sm text-gray-900">{confirmedClient ? `${confirmedClient.firstname || ''} ${confirmedClient.lastname || ''}`.trim() : 'N/A'}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Método de pago</dt>
                    <dd className="mt-1 text-sm text-gray-900">{primaryTicket.payment_method || 'N/A'}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Viaje</dt>
                    <dd className="mt-1 text-sm text-gray-900">{confirmedTrip.route?.origin} → {confirmedTrip.route?.destination}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Fecha y hora</dt>
                    <dd className="mt-1 text-sm text-gray-900">{formatDate(confirmedTrip.trip_datetime || confirmedTrip.departure_date)}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Asientos</dt>
                    <dd className="mt-1 text-sm text-gray-900">{seatNumbersDisplay || 'N/A'}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Total</dt>
                    <dd className="mt-1 text-sm font-semibold text-gray-900">Bs. {totalAmountDisplay || '0.00'}</dd>
                  </div>
                </dl>

                <div className="mt-8 border-t border-gray-200 pt-6">
                  <div className="flex justify-between">
                    <Button variant="outline" onClick={printTicket}>
                      <Printer className="h-5 w-5 mr-2 text-gray-500" />
                      Imprimir boleto
                    </Button>
                    <Button onClick={() => navigate('/dashboard')} className="bg-blue-600 hover:bg-blue-700">
                      Volver al dashboard
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  )
}
