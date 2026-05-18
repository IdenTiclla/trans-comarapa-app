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
  type LucideIcon,
} from 'lucide-react'
import type { Role } from '@/lib/constants'
import { ROUTES } from '@/lib/routes'

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
      { to: ROUTES.DASHBOARDS.ADMIN, label: 'Dashboard', icon: LayoutDashboard },
    ],
  },
  {
    title: 'Gestión',
    items: [
      { to: ROUTES.ADMIN.USERS, label: 'Usuarios', icon: Users },
      { to: ROUTES.ADMIN.SECRETARIES, label: 'Secretarias', icon: UserCog },
      { to: ROUTES.ADMIN.DRIVERS, label: 'Choferes', icon: Truck },
      { to: ROUTES.ADMIN.ASSISTANTS, label: 'Asistentes', icon: Users },
      { to: ROUTES.ADMIN.OWNERS, label: 'Socios', icon: Users },
      { to: ROUTES.ADMIN.BUSES, label: 'Buses', icon: Bus },
      { to: ROUTES.ADMIN.ROUTES, label: 'Rutas', icon: Route },
      { to: ROUTES.ADMIN.OFFICES, label: 'Oficinas', icon: Building2 },
    ],
  },
  {
    title: 'Finanzas',
    items: [
      { to: ROUTES.ADMIN.FINANCIAL, label: 'Finanzas', icon: DollarSign },
      { to: ROUTES.ADMIN.OWNER_SETTLEMENTS, label: 'Liq. Socios', icon: Calculator },
    ],
  },
  {
    title: 'Reportes',
    items: [
      { to: ROUTES.REPORTS, label: 'Reportes', icon: FileText },
    ],
  },
]

const SECRETARY_NAV: NavGroup[] = [
  {
    title: 'Principal',
    items: [
      { to: ROUTES.DASHBOARDS.SECRETARY, label: 'Dashboard', icon: LayoutDashboard },
    ],
  },
  {
    title: 'Operaciones',
    items: [
      { to: ROUTES.TRIPS, label: 'Viajes', icon: MapPin },
      { to: ROUTES.TICKETS, label: 'Boletos', icon: Ticket },
      { to: ROUTES.PACKAGES, label: 'Encomiendas', icon: Package },
    ],
  },
  {
    title: 'Gestión',
    items: [
      { to: ROUTES.ADMIN.CASH_REGISTER, label: 'Caja', icon: DollarSign },
      { to: ROUTES.ADMIN.OWNER_SETTLEMENTS, label: 'Liq. Socios', icon: Calculator },
      { to: ROUTES.CLIENTS, label: 'Clientes', icon: Users },
    ],
  },
  {
    title: 'Reportes',
    items: [
      { to: ROUTES.REPORTS, label: 'Reportes', icon: FileText },
    ],
  },
]

const DRIVER_NAV: NavGroup[] = [
  {
    title: 'Principal',
    items: [
      { to: ROUTES.DASHBOARDS.DRIVER, label: 'Dashboard', icon: LayoutDashboard },
    ],
  },
]

const ASSISTANT_NAV: NavGroup[] = [
  {
    title: 'Principal',
    items: [
      { to: ROUTES.DASHBOARDS.ASSISTANT, label: 'Dashboard', icon: LayoutDashboard },
    ],
  },
]

const CLIENT_NAV: NavGroup[] = [
  {
    title: 'Principal',
    items: [
      { to: ROUTES.DASHBOARDS.CLIENT, label: 'Dashboard', icon: LayoutDashboard },
    ],
  },
  {
    title: 'Mis Movimientos',
    items: [
      { to: ROUTES.MY_TICKETS, label: 'Mis Boletos', icon: Ticket },
      { to: ROUTES.MY_PACKAGES, label: 'Mis Encomiendas', icon: Package },
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
