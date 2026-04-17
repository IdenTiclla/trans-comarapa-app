import { useMemo } from 'react'
import { useLocation } from 'react-router'

interface BreadcrumbItem {
  label: string
  path: string
}

const ROUTE_LABELS: Record<string, string> = {
  dashboards: 'Dashboards',
  'dashboard-admin': 'Admin',
  'dashboard-secretary': 'Secretaria',
  'dashboard-driver': 'Chofer',
  'dashboard-assistant': 'Asistente',
  'dashboard-client': 'Cliente',
  admin: 'Administración',
  users: 'Usuarios',
  buses: 'Buses',
  routes: 'Rutas',
  offices: 'Oficinas',
  secretaries: 'Secretarias',
  drivers: 'Choferes',
  owners: 'Socios',
  assistants: 'Asistentes',
  financial: 'Finanzas',
  withdrawals: 'Retiros',
  'cash-register': 'Caja',
  'owner-settlements': 'Liquidaciones',
  trips: 'Viajes',
  packages: 'Encomiendas',
  'pending-collections': 'Pendientes',
  tickets: 'Boletos',
  clients: 'Clientes',
  bookings: 'Boletos',
  reports: 'Reportes',
  profile: 'Perfil',
  confirmation: 'Confirmación',
  new: 'Nuevo',
  edit: 'Editar',
}

export function useBreadcrumb() {
  const location = useLocation()

  return useMemo(() => {
    const segments = location.pathname.split('/').filter(Boolean)
    const items: BreadcrumbItem[] = []
    let currentPath = ''

    for (const segment of segments) {
      currentPath += `/${segment}`
      const label = ROUTE_LABELS[segment]
      if (label) {
        items.push({ label, path: currentPath })
      }
    }

    return items
  }, [location.pathname])
}
