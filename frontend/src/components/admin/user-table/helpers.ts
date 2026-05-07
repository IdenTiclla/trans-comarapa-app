import type { UserRecord } from './types'
import { LOCALE } from '@/lib/locale-config'

export const getEffectiveName = (user: UserRecord) => {
  if (user.firstname && user.lastname) return `${user.firstname} ${user.lastname}`
  return user.username || 'Usuario Desconocido'
}

export const getInitials = (user: UserRecord) => {
  if (user.firstname && user.lastname) {
    return `${user.firstname.charAt(0)}${user.lastname.charAt(0)}`.toUpperCase()
  }
  if (user.username) return user.username.substring(0, 2).toUpperCase()
  return 'U'
}

export const formatDate = (dateString?: string) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return new Intl.DateTimeFormat(LOCALE, { year: 'numeric', month: 'short', day: 'numeric' }).format(date)
}

export const getRoleLabel = (role?: string) => {
  switch (role) {
    case 'admin': return 'Administrador'
    case 'secretary': return 'Secretaria'
    case 'driver': return 'Conductor'
    case 'assistant': return 'Asistente'
    case 'client': return 'Cliente'
    default: return role || ''
  }
}

export const getRoleBadgeClass = (role?: string) => {
  switch (role) {
    case 'admin': return 'bg-purple-100 text-purple-800'
    case 'secretary': return 'bg-blue-100 text-blue-800'
    case 'driver': return 'bg-green-100 text-green-800'
    case 'assistant': return 'bg-yellow-100 text-yellow-800'
    case 'client': return 'bg-gray-100 text-gray-800'
    default: return 'bg-gray-100 text-gray-800'
  }
}

