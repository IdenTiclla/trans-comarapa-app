import type { Location } from './location'

export type TripStatus = 'scheduled' | 'dispatched' | 'in_transit' | 'finished' | 'cancelled'

export interface Person {
  id: number
  firstname?: string
  lastname?: string
  phone?: string
  email?: string
  [key: string]: unknown
}

export interface Trip {
  id: number
  departure_date: string
  departure_time?: string
  arrival_time?: string
  trip_datetime?: string
  status?: TripStatus
  price?: number
  route?: {
    id?: number
    origin?: Location
    destination?: Location
    origin_location?: Location
    destination_location?: Location
    price?: number
    [key: string]: unknown
  }
  bus?: {
    id?: number
    license_plate?: string
    plate_number?: string
    model?: string
    capacity?: number
    floors?: number
    [key: string]: unknown
  }
  driver?: Person | null
  assistant?: Person | null
  available_seats?: number
  total_seats?: number
  origin_name?: string
  destination_name?: string
  [key: string]: unknown
}
