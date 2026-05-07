import { apiFetch, setLoggingOut } from '@/lib/api'
import type { LoginResponse, RefreshResponse } from '@/types/auth'

let isLoggingOutLocal = false

export const authService = {
  async login(email: string, password: string): Promise<LoginResponse> {
    const formData = new URLSearchParams()
    formData.append('username', email)
    formData.append('password', password)

    return apiFetch<LoginResponse>('/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: formData as unknown,
    })
  },

  async logout(skipServerLogout = false): Promise<void> {
    if (isLoggingOutLocal) return

    isLoggingOutLocal = true
    setLoggingOut(true)

    try {
      if (!skipServerLogout) {
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
  },

  refreshToken(): Promise<RefreshResponse> {
    return apiFetch<RefreshResponse>('/auth/refresh', { method: 'POST' })
  },
}
