import {
  LayoutDashboard,
  Users,
  UserCog,
  Truck,
  Bus,
  Route,
  Building2,
  DollarSign,
  FileText,
  MapPin,
  Package,
  Ticket,
  Calculator,
  ClipboardList,
  type LucideIcon,
} from 'lucide-react'
import type { Role } from '@/lib/constants'

export interface NavItem {
  to: string
  label: string
  icon: LucideIcon
}

export interface NavGroup {
  title: string
  items: NavItem[]
}

type RoleNavGroups = Record<Role, NavGroup[]>

const ADMIN_NAV: NavGroup[] = [
  {
    title: 'Principal',
    items: [
      { to: '/dashboards/dashboard-admin', label: 'Dashboard', icon: LayoutDashboard },
    ],
  },
  {
    title: 'Gestión',
    items: [
      { to: '/admin/users', label: 'Usuarios', icon: Users },
      { to: '/admin/secretaries', label: 'Secretarias', icon: UserCog },
      { to: '/admin/drivers', label: 'Choferes', icon: Truck },
      { to: '/admin/assistants', label: 'Asistentes', icon: Users },
      { to: '/admin/owners', label: 'Socios', icon: Users },
      { to: '/admin/buses', label: 'Buses', icon: Bus },
      { to: '/admin/routes', label: 'Rutas', icon: Route },
      { to: '/admin/offices', label: 'Oficinas', icon: Building2 },
    ],
  },
  {
    title: 'Finanzas',
    items: [
      { to: '/admin/financial', label: 'Finanzas', icon: DollarSign },
      { to: '/admin/owner-settlements', label: 'Liq. Socios', icon: Calculator },
    ],
  },
  {
    title: 'Reportes',
    items: [
      { to: '/reports', label: 'Reportes', icon: FileText },
    ],
  },
]

const SECRETARY_NAV: NavGroup[] = [
  {
    title: 'Principal',
    items: [
      { to: '/dashboards/dashboard-secretary', label: 'Dashboard', icon: LayoutDashboard },
    ],
  },
  {
    title: 'Operaciones',
    items: [
      { to: '/trips', label: 'Viajes', icon: MapPin },
      { to: '/bookings', label: 'Boletos', icon: Ticket },
      { to: '/packages', label: 'Encomiendas', icon: Package },
    ],
  },
  {
    title: 'Gestión',
    items: [
      { to: '/admin/cash-register', label: 'Caja', icon: DollarSign },
      { to: '/admin/owner-settlements', label: 'Liq. Socios', icon: Calculator },
      { to: '/clients', label: 'Clientes', icon: Users },
    ],
  },
  {
    title: 'Reportes',
    items: [
      { to: '/reports', label: 'Reportes', icon: FileText },
    ],
  },
]

const DRIVER_NAV: NavGroup[] = [
  {
    title: 'Principal',
    items: [
      { to: '/dashboards/dashboard-driver', label: 'Dashboard', icon: LayoutDashboard },
    ],
  },
]

const ASSISTANT_NAV: NavGroup[] = [
  {
    title: 'Principal',
    items: [
      { to: '/dashboards/dashboard-assistant', label: 'Dashboard', icon: LayoutDashboard },
    ],
  },
]

const CLIENT_NAV: NavGroup[] = [
  {
    title: 'Principal',
    items: [
      { to: '/dashboards/dashboard-client', label: 'Dashboard', icon: LayoutDashboard },
    ],
  },
  {
    title: 'Mis Viajes',
    items: [
      { to: '/trips', label: 'Viajes', icon: MapPin },
      { to: '/packages', label: 'Encomiendas', icon: Package },
    ],
  },
]

export const NAV_GROUPS: RoleNavGroups = {
  admin: ADMIN_NAV,
  secretary: SECRETARY_NAV,
  driver: DRIVER_NAV,
  assistant: ASSISTANT_NAV,
  client: CLIENT_NAV,
}

export const ROLE_LABELS: Record<Role, string> = {
  admin: 'Administrador',
  secretary: 'Secretaria',
  driver: 'Chofer',
  assistant: 'Asistente',
  client: 'Cliente',
}
