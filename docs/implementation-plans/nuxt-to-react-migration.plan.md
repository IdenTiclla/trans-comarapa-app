# Plan: Migración completa de Nuxt 3 a React

## Contexto

El frontend actual está construido con Nuxt 3 + Vue 3 + Pinia (143 archivos: 26 páginas, 67 componentes, 13 stores, 17 servicios, 7 composables, 5 layouts, 3 middleware, 4 plugins). Se migrará a una SPA con React para simplificar la arquitectura (no se necesita SSR ya que la app es principalmente para usuarios autenticados).

**Stack destino:** Vite + React 19 + React Router v7 + Redux Toolkit + Tailwind CSS + shadcn/ui + TypeScript

El nuevo proyecto vivirá en `frontend-react/` junto al `frontend/` existente hasta completar la migración.

---

## Fase 0: Scaffolding del proyecto ✅ COMPLETADA

Crear `frontend-react/` con Vite + React + TypeScript.

**Archivos de configuración:**
- `vite.config.ts` — Plugin React, alias `@` → `src/`, proxy `/api/v1` → `http://localhost:8000`
- `tailwind.config.ts` — Portar colores de marca (comarapa-dark: #0D47A1, comarapa-medium: #2196F3, comarapa-light: #64B5F6, comarapa-gray: #E3F2FD), screens customizados, font Inter, spacing y utilidades custom desde `frontend/tailwind.config.js`
- `tsconfig.json` — Strict mode, path aliases
- `components.json` — shadcn/ui estilo "new-york"
- `postcss.config.js`, `.env`, `.env.example`
- `src/styles/globals.css` — Portar desde `frontend/assets/css/main.css` (Google Fonts, variables CSS, transiciones, utilidades responsive)

**Dependencias principales:**
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

**Estructura base:**
```
frontend-react/src/
├── main.tsx                    # Entry point con Provider + RouterProvider
├── App.tsx                     # Root component
├── lib/                        # Utilidades core
│   ├── api.ts                  # Cliente API (reemplaza utils/api.js)
│   ├── utils.ts                # cn() de shadcn/ui
│   └── constants.ts            # Rutas públicas, mapeo de roles
├── types/                      # Interfaces TypeScript
├── hooks/                      # Custom hooks (reemplazan composables)
├── services/                   # Llamadas API (17 servicios)
├── store/                      # Redux slices (13 slices)
├── router/                     # Configuración de rutas y guards
├── layouts/                    # Layout wrappers
├── components/                 # Componentes UI
│   ├── ui/                     # shadcn/ui (auto-generados)
│   ├── common/                 # Wrappers custom
│   ├── forms/                  # Form wrappers sobre shadcn
│   ├── layout/                 # AdminHeader
│   ├── dashboard/              # Stat cards, charts
│   ├── admin/                  # Forms y tables admin
│   ├── trips/                  # Cards y listas de viajes
│   ├── packages/               # Cards y modales de encomiendas
│   ├── tickets/                # Venta y display de boletos
│   ├── seats/                  # Grilla de asientos
│   └── clients/                # Cards y modales de clientes
├── pages/                      # Componentes de página
└── styles/globals.css          # Tailwind + estilos custom
```

---

## Fase 1: Infraestructura core ✅ COMPLETADA

### 1.1 Cliente API (`src/lib/api.ts`)
Portar desde `frontend/utils/api.js`. Replicar exactamente:
- `apiFetch` con `credentials: 'include'`, timeout 15s
- Refresh de token en 401 con mutex (`isRefreshing` + `refreshPromise`)
- Skip refresh para `/auth/login`, `/auth/logout`, `/auth/refresh`
- `SessionExpiredError`, flag `setLoggingOut`
- Usar `fetch` nativo en vez de `ofetch`
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
Portar desde `frontend/stores/auth.js`:
- State: `user`, `loading`, `error`
- AsyncThunks: `login`, `logout`, `refreshToken`, `loadProfile`, `updateProfile`, `initAuth`
- Selectors: `selectIsAuthenticated`, `selectUserRole`, `selectUserFullName`, `selectUserInitials`

### 1.4 Router (`src/router/index.tsx`)
React Router v7 con `createBrowserRouter`:

```
LoginLayout      → /login
ProtectedRoute + DefaultLayout → todas las rutas autenticadas
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
Portar desde `frontend/middleware/auth.global.ts` y `role.js`:
- `ProtectedRoute` — redirige a `/login` si no autenticado
- `RoleGuard` — redirige al dashboard correspondiente si el rol no coincide

---

## Fase 2: Componentes compartidos ✅ COMPLETADA

### 2.1 shadcn/ui — Instalar estos componentes:
`button, input, label, select, checkbox, radio-group, textarea, dialog, alert-dialog, card, badge, table, dropdown-menu, command, popover, sheet, tabs, separator, skeleton, tooltip, sonner`

### 2.2 Form wrappers (`src/components/forms/`)
Thin wrappers sobre shadcn/ui que replican la API de los Vue forms:

| Nuevo | Reemplaza | Base shadcn |
|-------|-----------|-------------|
| `FormInput.tsx` | `forms/FormInput.vue` | Input + Label |
| `FormSelect.tsx` | `forms/FormSelect.vue` | Select |
| `FormCheckbox.tsx` | `forms/FormCheckbox.vue` | Checkbox |
| `FormRadio.tsx` | `forms/FormRadio.vue` | RadioGroup |
| `FormTextarea.tsx` | `forms/FormTextarea.vue` | Textarea |
| `FormSearchSelect.tsx` | `forms/FormSearchSelect.vue` | Command + Popover |
| `FormDatePicker.tsx` | `forms/FormDatePicker.vue` | Input type date |
| `FormFileUpload.tsx` | `forms/FormFileUpload.vue` | Custom |

### 2.3 Componentes common
| Nuevo | Reemplaza | Notas |
|-------|-----------|-------|
| `ConfirmDialog.tsx` | `ui/ConfirmDialog.vue` | Usa AlertDialog de shadcn |
| `EmptyState.tsx` | `common/EmptyState.vue` | Componente simple |
| `ErrorBoundary.tsx` | `common/ErrorBoundary.vue` | Class component React |
| `NotificationModal.tsx` | `common/NotificationModal.vue` | Usa Dialog de shadcn |
| `ProfileSkeleton.tsx` | `common/ProfileSkeleton.vue` | Usa Skeleton de shadcn |
| `SkeletonLoader.tsx` | `common/SkeletonLoader.vue` | Usa Skeleton de shadcn |

### 2.4 Toast
Usar `sonner` (integrado con shadcn/ui). Hook `use-toast.ts` con `success/error/info/warning`.

---

## Fase 3: Servicios (migración mecánica) ✅ COMPLETADA

Portar los 17 servicios de `frontend/services/` a `src/services/`. Cambio principal: `apiFetch` de ofetch → fetch custom. Mismos endpoints, mismas interfaces.

**Orden (por dependencias):**
1. `auth.service.ts`, `profile.service.ts`
2. `location.service.ts`, `bus.service.ts`, `route.service.ts`, `driver.service.ts`, `assistant.service.ts`
3. `trip.service.ts`, `seat.service.ts`
4. `client.service.ts`, `person.service.ts`
5. `ticket.service.ts`, `sales.service.ts`
6. `package.service.ts`
7. `user-management.service.ts`, `stats.service.ts`, `activity.service.ts`

---

## Fase 4: Módulos por feature ✅ COMPLETADA

### 4.1 Auth + Login + Layouts
- **Páginas:** `LoginPage.tsx`
- **Layouts:** `DefaultLayout.tsx`, `LoginLayout.tsx`, `AuthLayout.tsx`, `PrintLayout.tsx`
- **Componentes:** `AdminHeader.tsx`
- **Slices:** `auth.slice.ts`, `app.slice.ts`
- **Hooks:** `use-auth.ts`

### 4.2 Dashboards
- **Páginas:** 5 dashboards (Admin, Secretary, Driver, Assistant, Client)
- **Componentes:** `DashboardStatCard.tsx`, `MonthlyMetricsChart.tsx` (react-chartjs-2), `QuickSearch.tsx`, `RecentSales.tsx`, `UpcomingTrips.tsx`
- **Slices:** `stats.slice.ts`
- **Servicios:** `stats.service.ts`, `activity.service.ts`

### 4.3 Admin — Buses, Rutas, Usuarios
- **Páginas:** `BusesPage.tsx`, `RoutesPage.tsx`, `UsersPage.tsx`
- **Componentes:** `BusForm.tsx`, `BusTable.tsx`, `RouteForm.tsx`, `RouteTable.tsx`, `RouteScheduleManager.tsx`, `SeatLayoutEditor.tsx`, `UserForm.tsx`, `UserTable.tsx`, `UserDetail.tsx`
- **Slices:** `bus.slice.ts`, `route.slice.ts`, `location.slice.ts`, `driver.slice.ts`, `assistant.slice.ts`, `secretary.slice.ts`
- **Hooks:** `use-destination-search.ts`

### 4.4 Viajes (feature core)
- **Páginas:** `TripsIndexPage.tsx`, `TripNewPage.tsx`, `TripDetailPage.tsx`, `TripEditPage.tsx`, `TripSheetPage.tsx`
- **Componentes:** `TripCard.tsx`, `TripCardList.tsx`, `TripCountdown.tsx`, `TripPackagesSection.tsx`
- **Slices:** `trip.slice.ts`
- **Hooks:** `use-trip-details.ts`

### 4.5 Clientes
- **Páginas:** `ClientsPage.tsx`
- **Componentes:** `ClientCard.tsx`, `ClientCardList.tsx`, `ClientFilters.tsx`, `ClientModal.tsx`, `ClientSelector.tsx`, `ClientViewModal.tsx`
- **Slices:** `client.slice.ts`
- **Hooks:** `use-client-search.ts`

### 4.6 Asientos + Boletos
- **Páginas:** `TicketConfirmationPage.tsx`, `BookingsPage.tsx`
- **Componentes:** `BusSeatGrid.tsx`, `BusSeatLegend.tsx`, `BusSeatMapPrint.tsx`, `BusTripHeader.tsx`, `DeckSelector.tsx`, `SeatContextMenu.tsx`, `SelectedSeatsPanel.tsx`, `TicketDisplay.tsx`, `TicketModal.tsx`, `TicketSaleModal.tsx`
- **Slices:** `ticket.slice.ts`
- **Nota:** BusSeatGrid es el componente más complejo visualmente — requiere atención especial

### 4.7 Encomiendas
- **Páginas:** `PackagesIndexPage.tsx`, `PackageNewPage.tsx`, `PackageDetailPage.tsx`, `PackageEditPage.tsx`
- **Componentes:** `PackageCard.tsx`, `PackageCardList.tsx`, `PackageAssignModal.tsx`, `PackageDeliveryModal.tsx`, `PackageReceiptModal.tsx`, `PackageReceptionModal.tsx`, `PackageRegistrationModal.tsx`
- **Slices:** `package.slice.ts`
- **Hooks:** `use-package-status.ts`

### 4.8 Perfil + Error page
- **Páginas:** `ProfilePage.tsx`, `NotFoundPage.tsx`
- Reutiliza slices y servicios existentes

---

## Fase 5: Traducciones clave Vue → React ✅ COMPLETADA (referencia aplicada)

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
| `<slot name="x" />` | Prop `renderX` o prop `x={<Node/>}` |
| `@heroicons/vue` | `@heroicons/react` (mismos nombres) |
| `vue-chartjs` | `react-chartjs-2` (misma config chart.js) |
| Pinia `store.action()` | `dispatch(asyncThunk())` |
| Pinia `store.getter` | `useAppSelector(selector)` |
| Nuxt `navigateTo()` | `useNavigate()` de React Router |
| Nuxt `useRoute().params` | `useParams()` de React Router |
| Nuxt `useRoute().query` | `useSearchParams()` de React Router |

---

## Fase 6: Docker y despliegue ✅ COMPLETADA

### 6.1 `frontend-react/Dockerfile`
- Dev: Node 20 alpine, `npm run dev`
- Prod: Build estático + nginx (no necesita Node runtime)

### 6.2 `frontend-react/nginx.conf`
- `try_files $uri $uri/ /index.html` para SPA routing
- Cache de assets estáticos

### 6.3 Actualizar `docker-compose.yml`
- Cambiar `context: ./frontend` → `./frontend-react`
- Cambiar `NUXT_PUBLIC_API_BASE_URL` → `VITE_API_BASE_URL`
- Volúmenes: `./frontend-react:/app`

---

## Fase 7: Testing

- **Framework:** Vitest + @testing-library/react + jsdom
- **Store slices:** Tests unitarios de reducers y thunks
- **Services:** Mock de `apiFetch`, verificar URLs y métodos
- **Components:** Render con store provider wrapper
- **Pages:** Tests de integración con servicios mockeados

---

## Áreas de riesgo alto

1. **Auth token refresh** (`lib/api.ts`) — Lógica mutex compleja, probar con tokens expirados
2. **BusSeatGrid** — Componente visual más complejo, CSS grid + event handling
3. **Print layout** — Verificar `@media print` después de migración

---

## Verificación

1. `npm run dev` levanta sin errores en `localhost:3000`
2. Login funciona con `admin1@transcomarapa.com / 123456`
3. Navegación entre dashboards por rol
4. CRUD completo de viajes (crear, editar, despachar, finalizar)
5. Venta de boletos con selección de asientos
6. Registro y flujo de encomiendas
7. Print de hoja de viaje funciona
8. `npm run build` genera bundle de producción sin errores
9. Docker: `make up` levanta el frontend React correctamente
