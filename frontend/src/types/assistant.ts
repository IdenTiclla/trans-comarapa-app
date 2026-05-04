export interface Assistant {
  id: number
  firstname: string
  lastname: string
  phone?: string | null
  email?: string | null
  user_id?: number | null
  [key: string]: unknown
}
