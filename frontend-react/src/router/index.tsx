import { createBrowserRouter, Navigate } from 'react-router'
import { ProtectedRoute, RedirectIfAuthenticated } from './guards'
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
          { path: '/dashboards/dashboard-driver', lazy: () => import('@/pages/dashboards/DriverDashboard') },
          { path: '/dashboards/dashboard-assistant', lazy: () => import('@/pages/dashboards/AssistantDashboard') },
          { path: '/dashboards/dashboard-client', lazy: () => import('@/pages/dashboards/ClientDashboard') },

          // Profile
          { path: '/profile', lazy: () => import('@/pages/ProfilePage') },

          // Admin
          { path: '/admin/users', lazy: () => import('@/pages/admin/UsersPage') },
          { path: '/admin/buses', lazy: () => import('@/pages/admin/BusesPage') },
          { path: '/admin/routes', lazy: () => import('@/pages/admin/RoutesPage') },
          { path: '/admin/offices', lazy: () => import('@/pages/admin/OfficesPage') },
          { path: '/admin/secretaries', lazy: () => import('@/pages/admin/SecretariesPage') },
          { path: '/admin/drivers', lazy: () => import('@/pages/admin/DriversPage') },
          { path: '/admin/assistants', lazy: () => import('@/pages/admin/AssistantsPage') },
          { path: '/admin/cash-register', lazy: () => import('@/pages/admin/CashRegisterPage') },
          { path: '/reports', lazy: () => import('@/pages/admin/ReportsPage') },

          // Trips
          { path: '/trips', lazy: () => import('@/pages/trips/TripsIndexPage') },
          { path: '/trips/new', lazy: () => import('@/pages/trips/TripNewPage') },
          { path: '/trips/:id', lazy: () => import('@/pages/trips/TripDetailPage') },
          { path: '/trips/:id/edit', lazy: () => import('@/pages/trips/TripEditPage') },

          // Packages
          { path: '/packages', lazy: () => import('@/pages/packages/PackagesIndexPage') },
          { path: '/packages/new', lazy: () => import('@/pages/packages/PackageNewPage') },
          { path: '/packages/:id', lazy: () => import('@/pages/packages/PackageDetailPage') },
          { path: '/packages/:id/edit', lazy: () => import('@/pages/packages/PackageEditPage') },

          // Tickets
          { path: '/tickets/confirmation', lazy: () => import('@/pages/tickets/TicketConfirmationPage') },

          // Clients & Bookings
          { path: '/clients', lazy: () => import('@/pages/clients/ClientsIndexPage') },
          { path: '/bookings', lazy: () => import('@/pages/BookingsPage') },
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
          { path: '/trips/:id/sheet', lazy: () => import('@/pages/trips/TripSheetPage') },
          { path: '/trips/:id-sheet', lazy: () => import('@/pages/trips/TripSheetPage') },
        ],
      },
    ],
  },

  // Root redirect
  { path: '/', element: <Navigate to="/login" replace /> },

  // 404
  { path: '*', lazy: () => import('@/pages/NotFoundPage') },
])
