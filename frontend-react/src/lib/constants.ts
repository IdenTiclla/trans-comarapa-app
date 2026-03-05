export const ROLES = {
  ADMIN: 'admin',
  SECRETARY: 'secretary',
  DRIVER: 'driver',
  ASSISTANT: 'assistant',
  CLIENT: 'client',
} as const

export type Role = (typeof ROLES)[keyof typeof ROLES]

export const DASHBOARD_PATHS: Record<Role, string> = {
  [ROLES.ADMIN]: '/dashboards/dashboard-admin',
  [ROLES.SECRETARY]: '/dashboards/dashboard-secretary',
  [ROLES.DRIVER]: '/dashboards/dashboard-driver',
  [ROLES.ASSISTANT]: '/dashboards/dashboard-assistant',
  [ROLES.CLIENT]: '/dashboards/dashboard-client',
}

export const PUBLIC_ROUTES = ['/login']

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api/v1'
