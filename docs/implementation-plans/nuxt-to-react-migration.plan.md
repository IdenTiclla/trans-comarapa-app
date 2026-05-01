# Plan: Complete Migration from Nuxt 3 to React

## Context

The current frontend is built with Nuxt 3 + Vue 3 + Pinia (143 files: 26 pages, 67 components, 13 stores, 17 services, 7 composables, 5 layouts, 3 middleware, 4 plugins). It will be migrated to a React SPA to simplify the architecture (SSR is not needed as the app is primarily for authenticated users).

**Target Stack:** Vite + React 19 + React Router v7 + Redux Toolkit + Tailwind CSS + shadcn/ui + TypeScript

The new project will live in `frontend-react/` alongside the existing `frontend/` until the migration is complete.

---

## Phase 0: Project Scaffolding ✅ COMPLETED

Create `frontend-react/` with Vite + React + TypeScript.

**Configuration Files:**
- `vite.config.ts` — React plugin, alias `@` → `src/`, proxy `/api/v1` → `http://localhost:8000`
- `tailwind.config.ts` — Port brand colors (comarapa-dark: #0D47A1, comarapa-medium: #2196F3, comarapa-light: #64B5F6, comarapa-gray: #E3F2FD), custom screens, Inter font, custom spacing and utilities from `frontend/tailwind.config.js`
- `tsconfig.json` — Strict mode, path aliases
- `components.json` — shadcn/ui "new-york" style
- `postcss.config.js`, `.env`, `.env.example`
- `src/styles/globals.css` — Port from `frontend/assets/css/main.css` (Google Fonts, CSS variables, transitions, responsive utilities)

**Main Dependencies:**
```
react, react-dom, react-router, @reduxjs/toolkit, react-redux,
@heroicons/react, react-chartjs-2, chart.js, clsx, tailwind-merge,
class-variance-authority, lodash-es, sonner
```

**DevDependencies:**
```
@vitejs/plugin-react, typescript, vite, tailwindcss, postcss, autoprefixer,
vitest, @testing-library/react, @testing-library/jest-dom, jsdom
```

**Base Structure:**
```
frontend-react/src/
├── main.tsx                    # Entry point with Provider + RouterProvider
├── App.tsx                     # Root component
├── lib/                        # Core utilities
│   ├── api.ts                  # API client (replaces utils/api.js)
│   ├── utils.ts                # shadcn/ui cn()
│   └── constants.ts            # Public routes, role mapping
├── types/                      # TypeScript interfaces
├── hooks/                      # Custom hooks (replace composables)
├── services/                   # API calls (17 services)
├── store/                      # Redux slices (13 slices)
├── router/                     # Route and guard configuration
├── layouts/                    # Layout wrappers
├── components/                 # UI components
│   ├── ui/                     # shadcn/ui (auto-generated)
│   ├── common/                 # Custom wrappers
│   ├── forms/                  # Form wrappers over shadcn
│   ├── layout/                 # AdminHeader
│   ├── dashboard/              # Stat cards, charts
│   ├── admin/                  # Admin forms and tables
│   ├── trips/                  # Trip cards and lists
│   ├── packages/               # Package cards and modals
│   ├── tickets/                # Ticket sales and display
│   ├── seats/                  # Seat grid
│   └── clients/                # Client cards and modals
├── pages/                      # Page components
└── styles/globals.css          # Tailwind + custom styles
```

---

## Phase 1: Core Infrastructure ✅ COMPLETED

### 1.1 API Client (`src/lib/api.ts`)
Port from `frontend/utils/api.js`. Replicate exactly:
- `apiFetch` with `credentials: 'include'`, 15s timeout
- Token refresh on 401 with mutex (`isRefreshing` + `refreshPromise`)
- Skip refresh for `/auth/login`, `/auth/logout`, `/auth/refresh`
- `SessionExpiredError`, `setLoggingOut` flag
- Use native `fetch` instead of `ofetch`
- Env var: `import.meta.env.VITE_API_BASE_URL`

### 1.2 Redux Store (`src/store/index.ts`)
```typescript
configureStore({
  reducer: {
    auth, app, trip, package, ticket, bus, route,
    location, driver, assistant, client, secretary, stats
  }
})
// + typed hooks: useAppDispatch, useAppSelector
```

### 1.3 Auth Slice (`src/store/auth.slice.ts`)
Port from `frontend/stores/auth.js`:
- State: `user`, `loading`, `error`
- AsyncThunks: `login`, `logout`, `refreshToken`, `loadProfile`, `updateProfile`, `initAuth`
- Selectors: `selectIsAuthenticated`, `selectUserRole`, `selectUserFullName`, `selectUserInitials`

### 1.4 Router (`src/router/index.tsx`)
React Router v7 with `createBrowserRouter`:

```
LoginLayout      → /login
ProtectedRoute + DefaultLayout → all authenticated routes
  RoleGuard(admin)     → /admin/users, /admin/buses, /admin/routes, /dashboards/dashboard-admin
  RoleGuard(secretary) → /dashboards/dashboard-secretary
  RoleGuard(driver)    → /dashboards/dashboard-driver
  RoleGuard(assistant) → /dashboards/dashboard-assistant
  RoleGuard(client)    → /dashboards/dashboard-client
  (any auth)           → /profile, /clients, /bookings, /trips/*, /packages/*, /tickets/*
PrintLayout      → /trips/:id/sheet
*                → NotFoundPage
```

### 1.5 Route Guards (`src/router/guards.tsx`)
Port from `frontend/middleware/auth.global.ts` and `role.js`:
- `ProtectedRoute` — redirects to `/login` if not authenticated
- `RoleGuard` — redirects to the corresponding dashboard if the role does not match

---

## Phase 2: Shared Components ✅ COMPLETED

### 2.1 shadcn/ui — Install these components:
`button, input, label, select, checkbox, radio-group, textarea, dialog, alert-dialog, card, badge, table, dropdown-menu, command, popover, sheet, tabs, separator, skeleton, tooltip, sonner`

### 2.2 Form wrappers (`src/components/forms/`)
Thin wrappers over shadcn/ui that replicate the Vue forms API:

| New | Replaces | Base shadcn |
|-------|-----------|-------------|
| `FormInput.tsx` | `forms/FormInput.vue` | Input + Label |
| `FormSelect.tsx` | `forms/FormSelect.vue` | Select |
| `FormCheckbox.tsx` | `forms/FormCheckbox.vue` | Checkbox |
| `FormRadio.tsx` | `forms/FormRadio.vue` | RadioGroup |
| `FormTextarea.tsx` | `forms/FormTextarea.vue` | Textarea |
| `FormSearchSelect.tsx` | `forms/FormSearchSelect.vue` | Command + Popover |
| `FormDatePicker.tsx` | `forms/FormDatePicker.vue` | Input type date |
| `FormFileUpload.tsx` | `forms/FormFileUpload.vue` | Custom |

### 2.3 Common Components
| New | Replaces | Notes |
|-------|-----------|-------|
| `ConfirmDialog.tsx` | `ui/ConfirmDialog.vue` | Uses shadcn AlertDialog |
| `EmptyState.tsx` | `common/EmptyState.vue` | Simple component |
| `ErrorBoundary.tsx` | `common/ErrorBoundary.vue` | React class component |
| `NotificationModal.tsx` | `common/NotificationModal.vue` | Uses shadcn Dialog |
| `ProfileSkeleton.tsx` | `common/ProfileSkeleton.vue` | Uses shadcn Skeleton |
| `SkeletonLoader.tsx` | `common/SkeletonLoader.vue` | Uses shadcn Skeleton |

### 2.4 Toast
Use `sonner` (integrated with shadcn/ui). `use-toast.ts` hook with `success/error/info/warning`.

---

## Phase 3: Services (Mechanical Migration) ✅ COMPLETED

Port the 17 services from `frontend/services/` to `src/services/`. Main change: `apiFetch` from ofetch → custom fetch. Same endpoints, same interfaces.

**Order (by dependencies):**
1. `auth.service.ts`, `profile.service.ts`
2. `location.service.ts`, `bus.service.ts`, `route.service.ts`, `driver.service.ts`, `assistant.service.ts`
3. `trip.service.ts`, `seat.service.ts`
4. `client.service.ts`, `person.service.ts`
5. `ticket.service.ts`, `sales.service.ts`
6. `package.service.ts`
7. `user-management.service.ts`, `stats.service.ts`, `activity.service.ts`

---

## Phase 4: Modules by Feature ✅ COMPLETED

### 4.1 Auth + Login + Layouts
- **Pages:** `LoginPage.tsx`
- **Layouts:** `DefaultLayout.tsx`, `LoginLayout.tsx`, `AuthLayout.tsx`, `PrintLayout.tsx`
- **Components:** `AdminHeader.tsx`
- **Slices:** `auth.slice.ts`, `app.slice.ts`
- **Hooks:** `use-auth.ts`

### 4.2 Dashboards
- **Pages:** 5 dashboards (Admin, Secretary, Driver, Assistant, Client)
- **Components:** `DashboardStatCard.tsx`, `MonthlyMetricsChart.tsx` (react-chartjs-2), `QuickSearch.tsx`, `RecentSales.tsx`, `UpcomingTrips.tsx`
- **Slices:** `stats.slice.ts`
- **Services:** `stats.service.ts`, `activity.service.ts`

### 4.3 Admin — Buses, Routes, Users
- **Pages:** `BusesPage.tsx`, `RoutesPage.tsx`, `UsersPage.tsx`
- **Components:** `BusForm.tsx`, `BusTable.tsx`, `RouteForm.tsx`, `RouteTable.tsx`, `RouteScheduleManager.tsx`, `SeatLayoutEditor.tsx`, `UserForm.tsx`, `UserTable.tsx`, `UserDetail.tsx`
- **Slices:** `bus.slice.ts`, `route.slice.ts`, `location.slice.ts`, `driver.slice.ts`, `assistant.slice.ts`, `secretary.slice.ts`
- **Hooks:** `use-destination-search.ts`

### 4.4 Trips (Core Feature)
- **Pages:** `TripsIndexPage.tsx`, `TripNewPage.tsx`, `TripDetailPage.tsx`, `TripEditPage.tsx`, `TripSheetPage.tsx`
- **Components:** `TripCard.tsx`, `TripCardList.tsx`, `TripCountdown.tsx`, `TripPackagesSection.tsx`
- **Slices:** `trip.slice.ts`
- **Hooks:** `use-trip-details.ts`

### 4.5 Clients
- **Pages:** `ClientsPage.tsx`
- **Components:** `ClientCard.tsx`, `ClientCardList.tsx`, `ClientFilters.tsx`, `ClientModal.tsx`, `ClientSelector.tsx`, `ClientViewModal.tsx`
- **Slices:** `client.slice.ts`
- **Hooks:** `use-client-search.ts`

### 4.6 Seats + Tickets
- **Pages:** `TicketConfirmationPage.tsx`, `BookingsPage.tsx`
- **Components:** `BusSeatGrid.tsx`, `BusSeatLegend.tsx`, `BusSeatMapPrint.tsx`, `BusTripHeader.tsx`, `DeckSelector.tsx`, `SeatContextMenu.tsx`, `SelectedSeatsPanel.tsx`, `TicketDisplay.tsx`, `TicketModal.tsx`, `TicketSaleModal.tsx`
- **Slices:** `ticket.slice.ts`
- **Note:** `BusSeatGrid` is the most visually complex component — requires special attention.

### 4.7 Packages
- **Pages:** `PackagesIndexPage.tsx`, `PackageNewPage.tsx`, `PackageDetailPage.tsx`, `PackageEditPage.tsx`
- **Components:** `PackageCard.tsx`, `PackageCardList.tsx`, `PackageAssignModal.tsx`, `PackageDeliveryModal.tsx`, `PackageReceiptModal.tsx`, `PackageReceptionModal.tsx`, `PackageRegistrationModal.tsx`
- **Slices:** `package.slice.ts`
- **Hooks:** `use-package-status.ts`

### 4.8 Profile + Error Page
- **Pages:** `ProfilePage.tsx`, `NotFoundPage.tsx`
- Reuses existing slices and services.

---

## Phase 5: Key Translations Vue → React ✅ COMPLETED (applied reference)

| Vue | React |
|-----|-------|
| `ref(val)` | `useState(val)` |
| `computed(() => x)` | `useMemo(() => x, [deps])` |
| `watch(src, cb)` | `useEffect(() => cb(), [src])` |
| `onMounted(() => ...)` | `useEffect(() => { ... }, [])` |
| `v-model` | `value={state} onChange={setState}` |
| `v-if / v-else` | `{cond ? <A/> : <B/>}` |
| `v-for` | `{items.map(i => <C key={i.id}/>)}` |
| `defineEmits / $emit` | Callback props (`onSubmit`, `onChange`) |
| `<slot />` | `{children}` |
| `<slot name="x" />` | Prop `renderX` or `x={<Node/>}` |
| `@heroicons/vue` | `@heroicons/react` (same names) |
| `vue-chartjs` | `react-chartjs-2` (same chart.js config) |
| Pinia `store.action()` | `dispatch(asyncThunk())` |
| Pinia `store.getter` | `useAppSelector(selector)` |
| Nuxt `navigateTo()` | `useNavigate()` from React Router |
| Nuxt `useRoute().params` | `useParams()` from React Router |
| Nuxt `useRoute().query` | `useSearchParams()` from React Router |

---

## Phase 6: Docker and Deployment ✅ COMPLETED

### 6.1 `frontend-react/Dockerfile`
- Dev: Node 20 alpine, `npm run dev`
- Prod: Static build + nginx (does not need Node runtime)

### 6.2 `frontend-react/nginx.conf`
- `try_files $uri $uri/ /index.html` for SPA routing
- Static asset caching

### 6.3 Update `docker-compose.yml`
- Change `context: ./frontend` → `./frontend-react`
- Change `NUXT_PUBLIC_API_BASE_URL` → `VITE_API_BASE_URL`
- Volumes: `./frontend-react:/app`

---

## Phase 7: Testing

- **Framework:** Vitest + @testing-library/react + jsdom
- **Store Slices:** Unit tests for reducers and thunks
- **Services:** Mock `apiFetch`, verify URLs and methods
- **Components:** Render with store provider wrapper
- **Pages:** Integration tests with mocked services

---

## High-Risk Areas

1. **Auth Token Refresh** (`lib/api.ts`) — Complex mutex logic, test with expired tokens.
2. **BusSeatGrid** — Most complex visual component, CSS grid + event handling.
3. **Print Layout** — Verify `@media print` after migration.

---

## Verification

1. `npm run dev` starts without errors at `localhost:3000`
2. Login works with `admin1@transcomarapa.com / 123456`
3. Navigation between dashboards by role
4. Full trip CRUD (create, edit, dispatch, finish)
5. Ticket sales with seat selection
6. Package registration and flow
7. Trip sheet printing works
8. `npm run build` generates production bundle without errors
9. Docker: `make up` starts frontend React correctly
