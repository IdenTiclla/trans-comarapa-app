import { apiFetch } from '@/lib/api'
import type { ProfileData, ProfileUpdateData } from '@/types/auth'

export const profileService = {
  getProfile(): Promise<ProfileData> {
    return apiFetch<ProfileData>('/users/me/profile')
  },

  updateProfile(data: ProfileUpdateData): Promise<ProfileData> {
    return apiFetch<ProfileData>('/users/me/profile', {
      method: 'PUT',
      body: data,
    })
  },

  changePassword(data: { current_password: string; new_password: string }): Promise<unknown> {
    return apiFetch('/users/me/change-password', {
      method: 'POST',
      body: data,
    })
  },

  uploadAvatar(formData: FormData): Promise<unknown> {
    return apiFetch('/users/me/avatar', {
      method: 'POST',
      body: formData,
      headers: {},
    })
  },

  deleteAvatar(): Promise<unknown> {
    return apiFetch('/users/me/avatar', { method: 'DELETE' })
  },
}
