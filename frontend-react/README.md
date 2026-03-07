# Trans Comarapa - React Frontend

Active frontend for the Trans Comarapa transportation management system.

## Stack

- React 19 + TypeScript
- Vite (build tool)
- Redux Toolkit (state management)
- React Router v6 (routing with lazy-loaded pages)
- Tailwind CSS + shadcn/ui (styling)
- sonner (toast notifications)

## Setup

```bash
npm install
npm run dev     # http://localhost:3001
npm run build   # production build
npm run preview # preview production build
npm run lint    # ESLint check
```

## Architecture

```
src/
├── pages/           # Route pages, lazy-loaded in router/index.tsx
│   ├── dashboards/  # Admin, Secretary, Driver, Assistant, Client
│   ├── trips/       # Index, Detail, New, Edit, Sheet
│   ├── packages/    # Index, Detail, New, Edit
│   ├── admin/       # Users, Buses, Routes management
│   ├── clients/     # Client listing
│   ├── tickets/     # Ticket confirmation
│   ├── ProfilePage.tsx
│   └── BookingsPage.tsx
├── components/      # Reusable UI components
│   ├── ui/          # shadcn/ui primitives (Button, Card, Dialog, etc.)
│   ├── forms/       # Form components
│   ├── seats/       # Seat selection components
│   ├── tickets/     # Ticket display components
│   ├── trips/       # Trip-related components
│   ├── packages/    # Package components
│   ├── clients/     # Client search/display
│   ├── admin/       # Admin panel components
│   ├── dashboard/   # Dashboard widgets
│   ├── common/      # Shared components (Pagination, etc.)
│   └── layout/      # Navbar, Sidebar, Footer
├── services/        # API service modules (stateless HTTP wrappers)
│   └── [entity].service.ts  # 18 services using apiFetch
├── store/           # Redux Toolkit slices
│   └── [entity].slice.ts    # 13 slices with createAsyncThunk
├── hooks/           # Custom React hooks
│   ├── use-auth.ts
│   ├── use-trip-details.ts
│   ├── use-client-search.ts
│   ├── use-destination-search.ts
│   ├── use-package-status.ts
│   └── use-toast.ts
├── layouts/         # Page layout wrappers
│   ├── DefaultLayout.tsx   # Main app layout (navbar + sidebar)
│   ├── LoginLayout.tsx     # Auth pages layout
│   ├── PrintLayout.tsx     # Print-friendly layout
│   └── AuthLayout.tsx      # Auth wrapper
├── router/
│   ├── index.tsx    # Route definitions with lazy imports
│   └── guards.tsx   # ProtectedRoute, RoleGuard, RedirectIfAuthenticated
├── lib/
│   ├── api.ts       # apiFetch — centralized HTTP client with auth + 401 refresh
│   ├── utils.ts     # Utility functions
│   └── constants.ts # App-wide constants
└── types/           # TypeScript interfaces for API responses
```

## Key Patterns

- **API calls:** Always through `services/` using `apiFetch` from `lib/api.ts` — never direct fetch in components
- **State:** Redux for global state (auth, entities), `useState` for local UI state
- **Routing:** All pages lazy-loaded, protected by `ProtectedRoute` and `RoleGuard`
- **Notifications:** `sonner` toasts — UI text always in Spanish
- **Code in English, UI in Spanish**

## Services Inventory

auth, profile, location, bus, route, driver, assistant, trip, seat, client, person, ticket, sales, package, user-management, activity, stats, secretary

## Store Slices Inventory

auth, app, bus, route, location, driver, assistant, ticket, package, stats, secretary, trip, client
