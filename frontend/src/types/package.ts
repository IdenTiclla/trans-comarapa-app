export type PackageStatus = 'registered' | 'in_transit' | 'at_destination' | 'delivered' | 'returned'

export interface PackageItem {
  description: string
  quantity: number
  unit_price: number
}

export interface Package {
  id: number
  tracking_code?: string
  description?: string
  status: PackageStatus
  sender_name?: string
  sender_phone?: string
  recipient_name?: string
  recipient_phone?: string
  receiver_name?: string
  origin_office_id?: number
  destination_office_id?: number
  origin_name?: string
  destination_name?: string
  items?: PackageItem[]
  total_price?: number
  price?: number
  payment_method?: string
  payment_status?: string
  trip_id?: number | null
  weight_kg?: number
  created_at?: string
  [key: string]: unknown
}
