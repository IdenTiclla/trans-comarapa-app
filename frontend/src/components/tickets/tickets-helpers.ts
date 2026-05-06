import { LOCALE, CURRENCY } from '@/lib/locale-config'

export interface Ticket {
  id: number
  client_id: number
  trip_id: number
  seat_id: number
  state: string
  price: number
  payment_method: string
  created_at: string
  [key: string]: unknown
}

export interface Client {
  id: number
  firstname: string
  lastname: string
}

export interface Trip {
  id: number
  route?: {
    origin: string
    destination: string
    price?: number
  }
  trip_datetime?: string
  bus_id?: number
}

export interface Seat {
  id: number
  seat_number: number
  deck: string
}

export const formatCurrency = (amount: number) =>
  new Intl.NumberFormat(LOCALE, { style: 'currency', currency: CURRENCY }).format(amount || 0)

export const formatDate = (dateString: string) =>
  new Date(dateString).toLocaleString(LOCALE, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

export const getStatusText = (status: string) => {
  const map: Record<string, string> = {
    pending: 'Pendiente',
    confirmed: 'Confirmado',
    cancelled: 'Cancelado',
    completed: 'Completado',
  }
  return map[status] || status
}

export const getStatusBadgeClass = (status: string) => {
  const map: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    confirmed: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
    completed: 'bg-blue-100 text-blue-800',
  }
  return map[status] || 'bg-gray-100 text-gray-800'
}
