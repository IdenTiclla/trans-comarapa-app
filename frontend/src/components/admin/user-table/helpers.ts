import type { UserRecord } from './types'

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
  return new Intl.DateTimeFormat('es-ES', { year: 'numeric', month: 'short', day: 'numeric' }).format(date)
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

export const computeDisplayedPages = (totalPages: number, currentPage: number): (number | string)[] => {
  const pages: (number | string)[] = []
  const maxPagesToShow = 5

  if (totalPages <= maxPagesToShow) {
    for (let i = 1; i <= totalPages; i++) pages.push(i)
    return pages
  }

  pages.push(1)
  let startPage = Math.max(2, currentPage - 1)
  let endPage = Math.min(totalPages - 1, currentPage + 1)

  if (currentPage <= 2) endPage = 4
  else if (currentPage >= totalPages - 1) startPage = totalPages - 3

  if (startPage > 2) pages.push('...')
  for (let i = startPage; i <= endPage; i++) pages.push(i)
  if (endPage < totalPages - 1) pages.push('...')
  pages.push(totalPages)
  return pages
}
