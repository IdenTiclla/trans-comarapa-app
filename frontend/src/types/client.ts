export interface Client {
  id: number
  firstname: string
  lastname: string
  document_id?: string
  phone?: string | null
  email?: string
  status?: string
  created_at?: string
  [key: string]: unknown
}

export interface ClientRecord {
  id?: number
  firstname?: string
  lastname?: string
  document_id?: string
  phone?: string | null
  [key: string]: unknown
}
