export interface User {
  id: number
  email: string
  role: string
  first_name: string
  last_name: string
  ci: string
  phone?: string
  is_active: boolean
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  size: number
  pages: number
}

export interface ApiError {
  detail: string
  status: number
}
