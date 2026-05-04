export interface Bus {
  id: number
  plate_number?: string
  license_plate?: string
  model?: string
  brand?: string
  capacity?: number
  floors?: number
  color?: string
  is_active?: boolean
  owner_id?: number | null
  [key: string]: unknown
}

export interface Seat {
  id: number
  seat_number?: number | string
  deck?: string | number
  row?: number
  column?: number
  type?: string
  status?: string
  bus_id?: number
  [key: string]: unknown
}
