export interface PackageItem {
  id: number
  quantity: number
  description: string
  total_price?: number
}

export interface TripPackage {
  id: number
  tracking_number?: string
  status: string
  payment_status?: string
  sender_name?: string
  recipient_name?: string
  total_amount?: number
  total_items_count?: number
  items?: PackageItem[]
  origin_office_name?: string
  destination_office_name?: string
}

export interface PackageViewProps {
  packages: TripPackage[]
  tripStatus: string
  onUnassignPackage?: (id: number) => void
  onDeliverPackage?: (id: number) => void
  onReceivePackage?: (id: number) => void
  onShowReceipt?: (id: number) => void
}
