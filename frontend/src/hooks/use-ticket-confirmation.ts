import { useState, useEffect, useMemo } from 'react'
import { tripService } from '@/services/trip.service'
import { ticketService } from '@/services/ticket.service'
import { clientService } from '@/services/client.service'

type TripLike = Record<string, unknown>
type TicketLike = {
  id: number
  client_id?: number
  seat_id?: number
  seat?: { seat_number?: number | string }
  price?: unknown
  payment_method?: string
  created_at?: string
  [k: string]: unknown
}
type ClientLike = Record<string, unknown>

export function useTicketConfirmation(
  searchParams: URLSearchParams,
  isAuthenticated: boolean,
) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [confirmedTrip, setConfirmedTrip] = useState<TripLike | null>(null)
  const [fetchedTickets, setFetchedTickets] = useState<TicketLike[]>([])
  const [confirmedClient, setConfirmedClient] = useState<ClientLike | null>(
    null,
  )

  useEffect(() => {
    async function loadConfirmation() {
      if (!isAuthenticated) return

      try {
        setLoading(true)
        setError(null)

        const tripId = searchParams.get('tripId')
        const ticketIdsParam = searchParams.get('ids')

        if (!tripId || !ticketIdsParam) {
          throw new Error(
            'Información de viaje o boletos no encontrada en la URL.',
          )
        }

        const tripRes = await tripService.getById(Number(tripId))
        if (!tripRes) {
          throw new Error('No se pudo cargar la información del viaje.')
        }
        setConfirmedTrip(tripRes as TripLike)

        const ticketIdArray = ticketIdsParam.split(',')
        const tickets: TicketLike[] = []
        let firstClientId: number | null = null

        for (const ticketId of ticketIdArray) {
          try {
            const ticketRes = (await ticketService.getById(
              Number(ticketId),
            )) as TicketLike
            if (ticketRes) {
              tickets.push(ticketRes)
              if (!firstClientId && ticketRes.client_id) {
                firstClientId = ticketRes.client_id
              }
            }
          } catch {
            // skip failed ticket
          }
        }

        if (tickets.length === 0) {
          throw new Error(
            'No se pudieron cargar los detalles de los boletos.',
          )
        }
        setFetchedTickets(tickets)

        if (firstClientId) {
          try {
            const clientRes = await clientService.getById(firstClientId)
            if (clientRes) setConfirmedClient(clientRes as ClientLike)
          } catch {
            // skip failed client
          }
        }
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : 'Ocurrió un error al cargar los detalles de la confirmación.',
        )
      } finally {
        setLoading(false)
      }
    }

    loadConfirmation()
  }, [searchParams, isAuthenticated])

  const primaryTicket = useMemo(
    () => (fetchedTickets.length > 0 ? fetchedTickets[0] : null),
    [fetchedTickets],
  )

  const seatNumbersDisplay = useMemo(() => {
    if (fetchedTickets.length > 0) {
      return fetchedTickets
        .map((t) => t.seat?.seat_number || t.seat_id)
        .join(', ')
    }
    return searchParams.get('ids')
  }, [fetchedTickets, searchParams])

  const totalAmountDisplay = useMemo(() => {
    return fetchedTickets
      .reduce((sum, ticket) => sum + (parseFloat(String(ticket.price)) || 0), 0)
      .toFixed(2)
  }, [fetchedTickets])

  return {
    loading,
    error,
    confirmedTrip,
    primaryTicket,
    confirmedClient,
    seatNumbersDisplay,
    totalAmountDisplay,
  }
}
