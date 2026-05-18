export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',

  DASHBOARDS: {
    ADMIN: '/dashboards/dashboard-admin',
    SECRETARY: '/dashboards/dashboard-secretary',
    DRIVER: '/dashboards/dashboard-driver',
    ASSISTANT: '/dashboards/dashboard-assistant',
    CLIENT: '/dashboards/dashboard-client',
  },

  PROFILE: '/profile',

  ADMIN: {
    USERS: '/admin/users',
    SECRETARIES: '/admin/secretaries',
    DRIVERS: '/admin/drivers',
    ASSISTANTS: '/admin/assistants',
    OWNERS: '/admin/owners',
    BUSES: '/admin/buses',
    ROUTES: '/admin/routes',
    OFFICES: '/admin/offices',
    FINANCIAL: '/admin/financial',
    WITHDRAWALS: '/admin/withdrawals',
    CASH_REGISTER: '/admin/cash-register',
    OWNER_SETTLEMENTS: '/admin/owner-settlements',
  },

  TRIPS: '/trips',
  tripDetail: (id: number | string) => `/trips/${id}`,
  tripEdit: (id: number | string) => `/trips/${id}/edit`,
  tripPassengersManifest: (id: number | string) => `/trips/${id}/passengers-manifest`,
  tripPackagesManifest: (id: number | string) => `/trips/${id}/packages-manifest`,

  TICKETS: '/tickets',
  ticketDetail: (id: number | string) => `/tickets/${id}`,

  PACKAGES: '/packages',
  packageNew: '/packages/new',
  packageDetail: (id: number | string) => `/packages/${id}`,
  packagePendingCollections: '/packages/pending-collections',

  CLIENTS: '/clients',
  clientEdit: (id: number | string) => `/clients/${id}/edit`,

  MY_TICKETS: '/my-tickets',
  MY_PACKAGES: '/my-packages',

  REPORTS: '/reports',
  REPORT_PACKAGES: '/reports/packages',
  SALES: '/sales',
} as const
