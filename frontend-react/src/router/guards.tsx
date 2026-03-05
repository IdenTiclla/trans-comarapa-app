import { Navigate, Outlet, useLocation } from 'react-router'
import { useAppSelector } from '@/store'
import { selectIsAuthenticated, selectUser } from '@/store/auth.slice'
import { DASHBOARD_PATHS, type Role } from '@/lib/constants'

export function ProtectedRoute() {
  const isAuthenticated = useAppSelector(selectIsAuthenticated)
  const location = useLocation()

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return <Outlet />
}

export function RoleGuard({ roles, children }: { roles: string[]; children: React.ReactNode }) {
  const user = useAppSelector(selectUser)

  if (!user || !roles.includes(user.role)) {
    const dashboardPath = DASHBOARD_PATHS[(user?.role as Role) ?? ''] ?? '/dashboards/dashboard-secretary'
    return <Navigate to={dashboardPath} replace />
  }

  return <>{children}</>
}

export function RedirectIfAuthenticated() {
  const isAuthenticated = useAppSelector(selectIsAuthenticated)
  const user = useAppSelector(selectUser)

  if (isAuthenticated && user) {
    const dashboardPath = DASHBOARD_PATHS[(user.role as Role)] ?? '/dashboards/dashboard-secretary'
    return <Navigate to={dashboardPath} replace />
  }

  return <Outlet />
}
