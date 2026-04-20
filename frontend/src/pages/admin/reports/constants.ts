export type Tab = 'tickets' | 'packages' | 'cash'

export interface Office {
  id: number
  name: string
}

export const MONTH_NAMES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
]

export const PAYMENT_LABELS: Record<string, string> = {
  cash: 'Efectivo',
  transfer: 'Transferencia',
  qr: 'QR',
  unknown: 'Desconocido',
}

export const PACKAGE_STATUS_LABELS: Record<string, string> = {
  registered_at_office: 'En oficina',
  assigned_to_trip: 'Asignado',
  in_transit: 'En tránsito',
  arrived_at_destination: 'Llegó',
  delivered: 'Entregado',
}

export const TX_TYPE_LABELS: Record<string, string> = {
  ticket_sale: 'Venta boleto',
  package_payment: 'Pago encomienda',
  por_cobrar_collection: 'Cobro por cobrar',
  withdrawal: 'Retiro',
  adjustment: 'Ajuste',
}

export function fmt(value: number | undefined | null, decimals = 2): string {
  return (value ?? 0).toFixed(decimals)
}
