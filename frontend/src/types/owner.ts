export interface Owner {
  id: number
  firstname: string
  lastname: string
  ci: string
  phone?: string | null
  email?: string | null
  user_id?: number | null
  is_active?: boolean
  [key: string]: unknown
}
