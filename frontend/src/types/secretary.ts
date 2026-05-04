export interface Secretary {
  id: number
  firstname: string
  lastname: string
  phone?: string
  document_id?: string
  email?: string
  user_id?: number | null
  office_id?: number | null
  is_active?: boolean
  [key: string]: unknown
}
