export const STATUS_LABELS: Record<string, string> = {
  scheduled: 'Programado',
  boarding: 'Abordando',
  departed: 'En camino',
  arrived: 'Llegó',
  cancelled: 'Cancelado',
}

export const STATUS_COLORS: Record<string, string> = {
  scheduled: 'bg-blue-100 text-blue-800',
  boarding: 'bg-yellow-100 text-yellow-800',
  departed: 'bg-amber-100 text-amber-800',
  arrived: 'bg-gray-100 text-gray-800',
  cancelled: 'bg-red-100 text-red-800',
}

export const TRANSITION_CONFIG: Record<string, { action: string; label: string; color: string; confirm?: boolean }> = {
  scheduled: { action: 'start_boarding', label: 'Iniciar Abordaje', color: 'bg-blue-600 hover:bg-blue-700 text-white' },
  boarding: { action: 'depart', label: 'Partir', color: 'bg-amber-600 hover:bg-amber-700 text-white', confirm: true },
  departed: { action: 'arrive', label: 'Llegamos', color: 'bg-gray-700 hover:bg-gray-800 text-white', confirm: true },
}

export const PKG_STATUS_LABELS: Record<string, string> = {
  registered: 'Registrado',
  assigned_to_trip: 'Asignado',
  in_transit: 'En tránsito',
  arrived_at_destination: 'Llegó',
  delivered: 'Entregado',
}

export function formatTime(datetime: string) {
  return new Date(datetime).toLocaleTimeString('es-BO', { hour: '2-digit', minute: '2-digit' })
}

export function formatDate(datetime: string) {
  return new Date(datetime).toLocaleDateString('es-BO', { weekday: 'short', day: 'numeric', month: 'short' })
}
