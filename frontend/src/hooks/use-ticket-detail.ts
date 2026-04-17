import { useCallback, useEffect, useState } from 'react'
import { ticketService } from '@/services/ticket.service'
import { tripService } from '@/services/trip.service'

export interface TicketDetailClient {
  id: number
  firstname?: string
  lastname?: string
  document_id?: string
  phone?: string
  email?: string
  [key: string]: unknown
}

export interface TicketDetailSeat {
  id: number
  seat_number?: number
  deck?: number | string
  [key: string]: unknown
}

export interface TicketDetailSecretary {
  id: number
  firstname?: string
  lastname?: string
  [key: string]: unknown
}

export interface TicketDetail {
  id: number
  state: string
  seat_id?: number
  client_id?: number
  trip_id?: number
  destination?: string
  price?: number
  payment_method?: string
  secretary_id?: number
  created_at?: string
  updated_at?: string
  client?: TicketDetailClient
  seat?: TicketDetailSeat
  secretary?: TicketDetailSecretary
  [key: string]: unknown
}

export interface TripDetail {
  id: number
  trip_datetime?: string
  status?: string
  bus?: {
    id?: number
    license_plate?: string
    model?: string
    capacity?: number
    floors?: number
    [key: string]: unknown
  }
  route?: {
    id?: number
    origin?: string
    destination?: string
    price?: number
    origin_location?: { name?: string; [key: string]: unknown }
    destination_location?: { name?: string; [key: string]: unknown }
    [key: string]: unknown
  }
  driver?: { firstname?: string; lastname?: string; [key: string]: unknown }
  assistant?: { firstname?: string; lastname?: string; [key: string]: unknown }
  [key: string]: unknown
}

export function useTicketDetail(ticketId: number | null) {
  const [ticket, setTicket] = useState<TicketDetail | null>(null)
  const [trip, setTrip] = useState<TripDetail | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    if (!ticketId || Number.isNaN(ticketId)) return
    setLoading(true)
    setError(null)
    try {
      const ticketData = (await ticketService.getById(ticketId)) as TicketDetail
      setTicket(ticketData)

      if (ticketData?.trip_id) {
        try {
          const tripData = (await tripService.getById(ticketData.trip_id)) as TripDetail
          setTrip(tripData)
        } catch {
          setTrip(null)
        }
      } else {
        setTrip(null)
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al cargar el boleto'
      setError(message)
      setTicket(null)
      setTrip(null)
    } finally {
      setLoading(false)
    }
  }, [ticketId])

  useEffect(() => {
    load()
  }, [load])

  return { ticket, trip, loading, error, reload: load }
}
