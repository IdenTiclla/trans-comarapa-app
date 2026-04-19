export interface Activity {
  id: number
  activity_type: string
  details: string | null
  user_id: number | null
  created_at: string
}

export function getRelativeTime(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'Hace un momento'
  if (diffMins < 60) return `Hace ${diffMins} minutos`
  if (diffHours < 24) return `Hace ${diffHours} hora${diffHours > 1 ? 's' : ''}`
  if (diffDays < 7) return `Hace ${diffDays} día${diffDays > 1 ? 's' : ''}`
  return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })
}

export function getActivityColors(type: string): { bg: string; dot: string } {
  switch (type.toLowerCase()) {
    case 'ticket':
    case 'ticket_sold':
      return { bg: 'bg-blue-100', dot: 'bg-blue-600' }
    case 'package':
    case 'package_registered':
      return { bg: 'bg-green-100', dot: 'bg-green-600' }
    case 'trip':
    case 'trip_created':
      return { bg: 'bg-purple-100', dot: 'bg-purple-600' }
    case 'cash':
    case 'cash_register':
      return { bg: 'bg-orange-100', dot: 'bg-orange-600' }
    default:
      return { bg: 'bg-gray-100', dot: 'bg-gray-600' }
  }
}
