export interface PackageItem {
  quantity: number
  description: string
}

export interface TripPackage {
  id: number
  tracking_number?: string
  sender_name?: string
  recipient_name?: string
  destination_office_name?: string
  description?: string
  items?: PackageItem[]
  payment_status?: string
  total_amount?: string | number
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

export function getDescription(pkg: TripPackage): string {
  if (pkg.items && pkg.items.length > 0) {
    return pkg.items.map((i) => `${i.quantity}x ${i.description}`).join(', ')
  }
  return pkg.description || '—'
}

export function isPaid(status?: string): boolean {
  if (!status) return false
  const s = status.toLowerCase()
  return s === 'paid_on_send' || s === 'paid' || s === 'pagado'
}
