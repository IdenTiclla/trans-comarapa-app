import type { AuthUser } from '@/types/auth'

export function getEffectiveName(user: AuthUser | null): string {
  if (!user) return 'Usuario Anónimo'
  const firstName = user.person?.firstname || user.firstname || ''
  const lastName = user.person?.lastname || user.lastname || ''
  const fullName = `${firstName} ${lastName}`.trim()
  return fullName || user.username || 'Usuario Anónimo'
}

export function getEffectiveFirstName(user: AuthUser | null): string {
  if (!user) return ''
  return user.person?.firstname || user.firstname || ''
}

export function getEffectiveLastName(user: AuthUser | null): string {
  if (!user) return ''
  return user.person?.lastname || user.lastname || ''
}

export function getInitials(user: AuthUser | null): string {
  const firstName = getEffectiveFirstName(user)
  const lastName = getEffectiveLastName(user)
  const first = firstName ? firstName.charAt(0).toUpperCase() : ''
  const last = lastName ? lastName.charAt(0).toUpperCase() : ''
  return `${first}${last}` || user?.username?.charAt(0).toUpperCase() || 'U'
}
