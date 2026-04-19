/* eslint-disable @typescript-eslint/no-explicit-any */
export const STATUS_OPTIONS = [
  { value: 'all', label: 'Todos' },
  { value: 'registered_at_office', label: 'En oficina' },
  { value: 'assigned_to_trip', label: 'Asignada a viaje' },
  { value: 'in_transit', label: 'En tránsito' },
  { value: 'arrived_at_destination', label: 'En destino' },
  { value: 'delivered', label: 'Entregada' },
]

export interface PackageFilters {
  searchTerm: string
  statusFilter: string
  dateFrom: string
  dateTo: string
}

export function filterPackages(packages: any[], f: PackageFilters): any[] {
  let filtered = [...packages]

  if (f.searchTerm) {
    const term = f.searchTerm.toLowerCase()
    filtered = filtered.filter((pkg) =>
      (pkg.sender?.firstname && pkg.sender.firstname.toLowerCase().includes(term)) ||
      (pkg.sender?.lastname && pkg.sender.lastname.toLowerCase().includes(term)) ||
      (pkg.recipient?.firstname && pkg.recipient.firstname.toLowerCase().includes(term)) ||
      (pkg.recipient?.lastname && pkg.recipient.lastname.toLowerCase().includes(term)) ||
      (pkg.tracking_number && pkg.tracking_number.toLowerCase().includes(term)) ||
      (pkg.tracking_code && pkg.tracking_code.toLowerCase().includes(term)) ||
      (pkg.items && pkg.items.some((i: any) => i.description.toLowerCase().includes(term))),
    )
  }

  if (f.statusFilter && f.statusFilter !== 'all') {
    filtered = filtered.filter((pkg) => pkg.status === f.statusFilter)
  }

  if (f.dateFrom) {
    const fromDate = new Date(f.dateFrom)
    filtered = filtered.filter((pkg) => new Date(pkg.created_at) >= fromDate)
  }

  if (f.dateTo) {
    const toDate = new Date(f.dateTo)
    toDate.setHours(23, 59, 59, 999)
    filtered = filtered.filter((pkg) => new Date(pkg.created_at) <= toDate)
  }

  filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
  return filtered
}

export function computeStats(packages: any[]) {
  const today = new Date().toDateString()
  return {
    total: packages.length,
    pending: packages.filter((p) => p.status === 'registered_at_office').length,
    inTransit: packages.filter((p) => p.status === 'in_transit').length,
    deliveredToday: packages.filter(
      (p) => p.status === 'delivered' && new Date(p.updated_at || p.created_at).toDateString() === today,
    ).length,
  }
}
