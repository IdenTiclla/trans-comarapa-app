export interface Passenger {
  ticket_id: number
  seat_number: number | string
  client_name: string
  state: string
}

export interface TripPackage {
  id: number
  tracking_number: string
  sender_name: string
  recipient_name: string
  destination: string
  status: string
  payment_status: string
  item_count: number
}

export interface MyTrip {
  id: number
  trip_datetime: string
  status: string
  route: { origin: string; destination: string }
  bus: { license_plate: string; model: string; brand: string } | null
  total_seats: number
  occupied_seats: number
  available_seats: number
  package_count: number
  passengers: Passenger[]
  packages?: TripPackage[]
}

export type TripTab = 'passengers' | 'packages' | 'checklist'
