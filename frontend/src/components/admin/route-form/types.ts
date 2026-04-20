export interface Location {
  id: number | string
  name: string
}

export interface Schedule {
  id?: number
  route_id?: number
  departure_time: string
  is_active: boolean
  _isNew?: boolean
  _localId?: number
}

export interface RouteFormState {
  origin_location_id: string
  destination_location_id: string
  distance: string
  duration: string
  price: string
}

export interface RouteFormSubmit {
  origin_location_id: string
  destination_location_id: string
  distance: string
  duration: string
  price: string
  schedules: Array<{
    id: number | null
    departure_time: string
    is_active: boolean
    _isNew: boolean
  }>
}

export interface RouteFormProps {
  route?: {
    origin_location_id?: string | number
    destination_location_id?: string | number
    distance?: string | number
    duration?: string | number
    price?: string | number
    schedules?: Schedule[]
  }
  loading?: boolean
  isEditing?: boolean
  onSubmit: (data: RouteFormSubmit) => void
  onCancel: () => void
}
