export const formatCurrency = (amount: number | undefined | null) =>
  new Intl.NumberFormat('es-BO', { style: 'currency', currency: 'BOB' }).format(amount ?? 0)

export const formatDateTime = (value: string | undefined | null) => {
  if (!value) return '—'
  try {
    return new Date(value).toLocaleString('es-BO', {
      year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
    })
  } catch {
    return value
  }
}

export const formatDate = (value: string | undefined | null) => {
  if (!value) return '—'
  try {
    return new Date(value).toLocaleDateString('es-BO', { year: 'numeric', month: 'short', day: 'numeric' })
  } catch {
    return value
  }
}

export const formatTime = (value: string | undefined | null) => {
  if (!value) return '—'
  try {
    return new Date(value).toLocaleTimeString('es-BO', { hour: '2-digit', minute: '2-digit' })
  } catch {
    return value
  }
}

export const STATE_BADGE: Record<string, { label: string; className: string }> = {
  pending: { label: 'Pendiente', className: 'bg-amber-100 text-amber-800 ring-amber-200' },
  confirmed: { label: 'Confirmado', className: 'bg-emerald-100 text-emerald-800 ring-emerald-200' },
  cancelled: { label: 'Cancelado', className: 'bg-rose-100 text-rose-800 ring-rose-200' },
  completed: { label: 'Completado', className: 'bg-sky-100 text-sky-800 ring-sky-200' },
}

export const PAYMENT_METHOD: Record<string, string> = {
  cash: 'Efectivo',
  card: 'Tarjeta',
  qr: 'QR',
  transfer: 'Transferencia',
}

export const getStateInfo = (state: string | undefined) => {
  const key = state?.toLowerCase() ?? ''
  return STATE_BADGE[key] ?? { label: key || '—', className: 'bg-gray-100 text-gray-800 ring-gray-200' }
}
