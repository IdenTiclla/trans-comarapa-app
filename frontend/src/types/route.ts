import type { Location } from './location'

export interface Route {
  id: number
  origin_id?: number
  destination_id?: number
  origin_location_id?: number
  destination_location_id?: number
  base_price?: number
  price?: number
  estimated_duration?: number
  distance?: number
  duration?: number
  is_active?: boolean
  origin?: Location
  destination?: Location
  origin_location?: Location
  destination_location?: Location
  schedules?: RouteSchedule[]
  [key: string]: unknown
}

export interface RouteSchedule {
  id: number
  route_id: number
  departure_time: string
  arrival_time?: string
  days_of_week?: string[]
  is_active?: boolean
  [key: string]: unknown
}

export interface RouteWithSchedules extends Route {
  schedules: RouteSchedule[]
}
