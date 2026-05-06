export const ROLES = {
  ADMIN: 'admin',
  SECRETARY: 'secretary',
  DRIVER: 'driver',
  ASSISTANT: 'assistant',
  CLIENT: 'client',
} as const

export type Role = (typeof ROLES)[keyof typeof ROLES]

import { ROUTES } from '@/lib/routes'

export const DASHBOARD_PATHS: Record<Role, string> = {
  [ROLES.ADMIN]: ROUTES.DASHBOARDS.ADMIN,
  [ROLES.SECRETARY]: ROUTES.DASHBOARDS.SECRETARY,
  [ROLES.DRIVER]: ROUTES.DASHBOARDS.DRIVER,
  [ROLES.ASSISTANT]: ROUTES.DASHBOARDS.ASSISTANT,
  [ROLES.CLIENT]: ROUTES.DASHBOARDS.CLIENT,
}

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api/v1'
