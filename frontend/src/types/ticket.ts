import type { Client } from './client'
import type { Trip } from './trip'
import type { Person } from './trip'

export type TicketState = 'pending' | 'confirmed' | 'cancelled' | 'sold' | 'paid' | 'expired'

export interface Ticket {
  id: number
  state: TicketState
  price?: number
  payment_method?: string
  seat?: {
    id?: number
    seat_number?: number | string
    deck?: string | number
    [key: string]: unknown
  }
  client?: Client
  trip?: Trip
  trip_id?: number
  destination?: string
  secretary?: Person
  created_at?: string
  [key: string]: unknown
}

export interface SoldTicket {
  id: number
  state: TicketState
  seat?: {
    seat_number: number
    deck?: number
  }
  client?: {
    firstname: string
    lastname: string
    document_id?: string
  }
  destination?: string
  price?: number
  [key: string]: unknown
}

export interface TicketDetail {
  id: number
  state: TicketState
  price?: number
  payment_method?: string
  seat_id?: number
  client_id?: number
  trip_id?: number
  destination?: string
  secretary_id?: number
  created_at?: string
  updated_at?: string
  client?: TicketDetailClient
  seat?: TicketDetailSeat
  secretary?: TicketDetailSecretary
  [key: string]: unknown
}

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
