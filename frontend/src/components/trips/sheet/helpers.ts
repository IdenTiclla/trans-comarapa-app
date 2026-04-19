export interface Passenger {
  id: number
  state: string
  seat?: { seat_number: number }
  client?: { firstname: string; lastname: string; document_id?: string }
  destination?: string
  price?: number | string
}

export function formatDate(dateString: string) {
  if (!dateString) return ''
  const date = new Date(dateString)
  const offset = date.getTimezoneOffset()
  const adjusted = new Date(date.getTime() + offset * 60 * 1000)
  return adjusted.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

export function formatTime(timeString: string) {
  if (!timeString) return ''
  const parts = timeString.split(':')
  const date = new Date()
  date.setHours(parseInt(parts[0], 10), parseInt(parts[1], 10), 0, 0)
  return date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', hour12: true })
}
