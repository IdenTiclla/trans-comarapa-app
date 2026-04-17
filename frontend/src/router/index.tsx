import { createBrowserRouter, Navigate } from 'react-router'
import { ProtectedRoute, RedirectIfAuthenticated, RoleGuardOutlet } from './guards'
import LoginLayout from '@/layouts/LoginLayout'
import DefaultLayout from '@/layouts/DefaultLayout'
import PrintLayout from '@/layouts/PrintLayout'

export const router = createBrowserRouter([
  // Login - redirect to dashboard if already authenticated
  {
    element: <RedirectIfAuthenticated />,
    children: [
      {
        element: <LoginLayout />,
        children: [
          {
            path: '/login',
            lazy: () => import('@/pages/LoginPage'),
          },
        ],
      },
    ],
  },

  // Protected routes
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <DefaultLayout />,
        children: [
          // Dashboards
          { path: '/dashboards/dashboard-admin', lazy: () => import('@/pages/dashboards/AdminDashboard') },
          { path: '/dashboards/dashboard-secretary', lazy: () => import('@/pages/dashboards/SecretaryDashboard') },
          {
            element: <RoleGuardOutlet roles={['driver']} />,
            children: [
              { path: '/dashboards/dashboard-driver', lazy: () => import('@/pages/dashboards/DriverDashboard') },
            ],
          },
          {
            element: <RoleGuardOutlet roles={['assistant']} />,
            children: [
              { path: '/dashboards/dashboard-assistant', lazy: () => import('@/pages/dashboards/AssistantDashboard') },
            ],
          },
          { path: '/dashboards/dashboard-client', lazy: () => import('@/pages/dashboards/ClientDashboard') },

          // Profile
          { path: '/profile', lazy: () => import('@/pages/ProfilePage') },

          // Admin - solo admin
          {
            element: <RoleGuardOutlet roles={['admin']} />,
            children: [
              { path: '/admin/users', lazy: () => import('@/pages/admin/UsersPage') },
              { path: '/admin/buses', lazy: () => import('@/pages/admin/BusesPage') },
              { path: '/admin/routes', lazy: () => import('@/pages/admin/RoutesPage') },
              { path: '/admin/offices', lazy: () => import('@/pages/admin/OfficesPage') },
              { path: '/admin/secretaries', lazy: () => import('@/pages/admin/SecretariesPage') },
              { path: '/admin/drivers', lazy: () => import('@/pages/admin/DriversPage') },
              { path: '/admin/owners', lazy: () => import('@/pages/admin/OwnersPage') },
              { path: '/admin/assistants', lazy: () => import('@/pages/admin/AssistantsPage') },
              { path: '/admin/financial', lazy: () => import('@/pages/admin/FinancialDashboardPage') },
              { path: '/admin/withdrawals', lazy: () => import('@/pages/admin/WithdrawalHistoryPage') },
            ],
          },

          // Admin - admin y secretary
          {
            element: <RoleGuardOutlet roles={['admin', 'secretary']} />,
            children: [
              { path: '/admin/cash-register', lazy: () => import('@/pages/admin/CashRegisterPage') },
              { path: '/admin/owner-settlements', lazy: () => import('@/pages/admin/OwnerSettlements') },
              { path: '/reports', lazy: () => import('@/pages/admin/ReportsPage') },
            ],
          },

          // Trips
          { path: '/trips', lazy: () => import('@/pages/trips/TripsIndexPage') },
{ path: '/trips/:id', lazy: () => import('@/pages/trips/TripDetailPage') },
          { path: '/trips/:id/edit', lazy: () => import('@/pages/trips/TripEditPage') },

          // Packages
          { path: '/packages', lazy: () => import('@/pages/packages/PackagesIndexPage') },
          { path: '/packages/pending-collections', lazy: () => import('@/pages/packages/PendingCollectionsPage') },
          { path: '/packages/new', lazy: () => import('@/pages/packages/PackageNewPage') },
          { path: '/packages/:id', lazy: () => import('@/pages/packages/PackageDetailPage') },
          { path: '/packages/:id/edit', lazy: () => import('@/pages/packages/PackageEditPage') },

          // Tickets
          { path: '/tickets/confirmation', lazy: () => import('@/pages/tickets/TicketConfirmationPage') },

          // Clients & Bookings
          { path: '/clients', lazy: () => import('@/pages/clients/ClientsIndexPage') },
          { path: '/tickets', lazy: () => import('@/pages/tickets/TicketsIndexPage') },
        ],
      },
    ],
  },

  // Print layout (protected but separate layout)
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <PrintLayout />,
        children: [
          { path: '/trips/:id/passengers-manifest', lazy: () => import('@/pages/trips/TripSheetPage') },
          { path: '/trips/:id/packages-manifest', lazy: () => import('@/pages/trips/TripPackagesManifestPage') },
        ],
      },
    ],
  },

  // Root redirect
  { path: '/', element: <Navigate to="/login" replace /> },

  // 404
  { path: '*', lazy: () => import('@/pages/NotFoundPage') },
])
