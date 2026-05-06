import type { AuthUser } from '@/types/auth'

export function getEffectiveName(user: AuthUser | null): string {
  if (!user) return 'Usuario Anónimo'
  const firstName = user.person?.firstname || user.firstname || ''
  const lastName = user.person?.lastname || user.lastname || ''
  const fullName = `${firstName} ${lastName}`.trim()
  return fullName || user.username || 'Usuario Anónimo'
}
