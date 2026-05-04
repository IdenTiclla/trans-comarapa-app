export interface Driver {
  id: number
  firstname: string
  lastname: string
  phone?: string | null
  email?: string | null
  user_id?: number | null
  license_number?: string | null
  license_type?: string | null
  license_expiry?: string | null
  status?: string | null
  is_active?: boolean
  [key: string]: unknown
}
