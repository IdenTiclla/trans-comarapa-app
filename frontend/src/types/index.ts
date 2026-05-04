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

export type { ApiError as ApiErrorClass } from '@/lib/api'

export * from './trip'
export * from './ticket'
export * from './client'
export * from './bus'
export * from './package'
export * from './driver'
export * from './assistant'
export * from './secretary'
export * from './owner'
export * from './location'
export * from './route'
