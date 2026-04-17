import { apiFetch, setLoggingOut } from '@/lib/api'
import type { LoginResponse, RefreshResponse } from '@/types/auth'

let isLoggingOutLocal = false

function getUserData() {
  const userData = localStorage.getItem('user_data')
  if (userData && userData !== 'undefined') {
    try {
      return JSON.parse(userData)
    } catch {
      localStorage.removeItem('user_data')
    }
  }
  return null
}

export const authService = {
  async login(email: string, password: string): Promise<LoginResponse> {
    const formData = new URLSearchParams()
    formData.append('username', email)
    formData.append('password', password)

    const data = await apiFetch<LoginResponse>('/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: formData as unknown,
    })

    if (data?.access_token) {
      const userInfo = {
        id: data.user_id,
        role: data.role,
        firstname: data.firstname || '',
        lastname: data.lastname || '',
        email,
        person: data.person || null,
        office_id: data.office_id ?? null,
      }
      localStorage.setItem('user_data', JSON.stringify(userInfo))
      localStorage.setItem('user_email', email)
    }

    return data
  },

  async logout(skipServerLogout = false): Promise<void> {
    if (isLoggingOutLocal) return

    isLoggingOutLocal = true
    setLoggingOut(true)

    try {
      if (!skipServerLogout && getUserData()) {
        try {
          await apiFetch('/auth/logout', { method: 'POST' })
        } catch {
          // Silently handle logout errors
        }
      }
    } finally {
      isLoggingOutLocal = false
      setLoggingOut(false)
    }

    localStorage.removeItem('user_data')
    localStorage.removeItem('user_email')
    localStorage.removeItem('auth_token')
    localStorage.removeItem('refresh_token')
  },

  async refreshToken(): Promise<RefreshResponse> {
    const data = await apiFetch<RefreshResponse>('/auth/refresh', {
      method: 'POST',
    })

    if (data?.user_id) {
      const currentUserData = getUserData()
      if (currentUserData) {
        const updated = {
          ...currentUserData,
          firstname: data.firstname || currentUserData.firstname,
          lastname: data.lastname || currentUserData.lastname,
          person: data.person || currentUserData.person,
          // Preserve office_id — it doesn't change during a token refresh
          office_id: currentUserData.office_id ?? null,
        }
        localStorage.setItem('user_data', JSON.stringify(updated))
      }
    }

    return data
  },

  getUserData,

  isAuthenticated(): boolean {
    const userData = localStorage.getItem('user_data')
    return !!userData && userData !== 'undefined'
  },
}
