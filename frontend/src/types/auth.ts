export interface Person {
  id: number
  firstname: string
  lastname: string
  phone?: string
  birth_date?: string
  bio?: string
  avatar_url?: string
  type?: string
}

export interface AuthUser {
  id: number
  email: string
  username: string
  role: string
  firstname: string
  lastname: string
  phone?: string
  birth_date?: string
  is_active?: boolean
  is_admin?: boolean
  created_at?: string
  updated_at?: string
  person: Person | null
  profile?: unknown
  office_id?: number
}

export interface LoginResponse {
  access_token: string
  token_type: string
  user_id: number
  role: string
  username?: string
  firstname?: string
  lastname?: string
  person?: Person | null
  profile?: unknown
  office_id?: number
}

export interface RefreshResponse {
  access_token: string
  user_id?: number
  firstname?: string
  lastname?: string
  person?: Person | null
}

export interface ProfileData {
  id: number
  username: string
  email: string
  role: string
  is_active: boolean
  is_admin: boolean
  created_at: string
  updated_at: string
  firstname: string
  lastname: string
  phone?: string
  birth_date?: string
  person: Person | null
}

export interface ProfileUpdateData {
  email?: string
  firstname?: string
  lastname?: string
  phone?: string
  birth_date?: string
}
