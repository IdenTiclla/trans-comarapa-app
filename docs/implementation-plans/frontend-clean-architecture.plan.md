# Plan: Frontend Clean Architecture Compliance

## Contexto

El frontend tiene una arquitectura bien definida (`Page -> Component -> Hook -> Store -> Service -> apiFetch`) pero la adherencia es inconsistente. El analisis revela:

| Categoria | Cantidad | Severidad |
|-----------|----------|-----------|
| Hooks que llaman `apiFetch` directo (bypasseando services) | 6 hooks, 9 llamadas | CRITICA |
| Store slices con `unknown[]` | 8 slices | ALTA |
| Tipos duplicados/esparcidos en archivos inline | 12+ interfaces | ALTA |
| Paginas que importan services/apiFetch directo | 17 paginas, 4 con `apiFetch` | ALTA |
| Componentes que importan services directo | 7 componentes | MEDIA |
| Archivos con `any` / `eslint-disable` | 28 archivos, ~80 usos | MEDIA |
| Service con concerns mezclados (`package.service.ts`) | ~100 lineas | BAJA |

> **Regla de Oro:** Despues de este plan, NINGUN archivo fuera de `services/` deberia importar `apiFetch`. NINGUN page deberia importar un service directamente.

---

## Phase 1: Centralizar Tipos de Dominio

**Prerequisito para todas las demas fases.** Los tipos centralizados son necesarios antes de tipar los slices y eliminar `any`.

### 1A. Crear `types/trip.ts`

**Crear:** `frontend/src/types/trip.ts`

```typescript
export interface Trip {
  id: number
  departure_date: string
  departure_time?: string
  arrival_time?: string
  status?: string
  price?: number
  route?: { id: number; origin: Location; destination: Location }
  bus?: { id: number; license_plate: string; model?: string }
  driver?: Person | null
  assistant?: Person | null
  available_seats?: number
  total_seats?: number
  [key: string]: unknown
}

export interface TripQueryParams {
  origin_id?: number
  destination_id?: number
  date?: string
  status?: string
  page?: number
  per_page?: number
  [key: string]: unknown
}
```

Fuentes: `pages/TripsPage.tsx:11-23`, `hooks/use-trip-detail-page.ts:15-38`, `store/trip.slice.ts`

### 1B. Crear `types/ticket.ts`

**Crear:** `frontend/src/types/ticket.ts`

```typescript
export interface Ticket {
  id: number
  state: string
  price: number
  payment_method: string
  seat?: { id: number; seat_number: number; deck: string; row: number; column: number }
  client?: Client
  trip?: Trip
  secretary?: Person
  created_at?: string
  [key: string]: unknown
}

export interface SoldTicket {
  id: number
  seat_number: number
  client_name: string
  state: string
  price: number
  deck?: string
}

export interface TicketDetail {
  id: number
  state: string
  price: number
  payment_method: string
  created_at?: string
  client: TicketDetailClient
  seat: TicketDetailSeat
  trip: Trip
  secretary?: TicketDetailSecretary
}

export interface TicketDetailClient {
  id: number
  firstname: string
  lastname: string
  document_id?: string
  phone?: string
}

export interface TicketDetailSeat {
  id: number
  seat_number: number
  deck: string
  row: number
  column: number
  type: string
}

export interface TicketDetailSecretary {
  id: number
  firstname: string
  lastname: string
  office?: { id: number; name: string }
}
```

Fuentes: `hooks/use-ticket-detail.ts:5-71`, `hooks/use-trip-details.ts:4-12`, `hooks/use-trip-detail-page.ts:15-38`

### 1C. Crear `types/client.ts`

**Crear:** `frontend/src/types/client.ts`

```typescript
export interface Client {
  id: number
  firstname: string
  lastname: string
  document_id?: string
  phone?: string
  email?: string
  status?: string
  created_at?: string
  [key: string]: unknown
}

export interface ClientRecord {
  id: number
  name: string
  document_id?: string
  phone?: string
}
```

Fuentes: `hooks/use-client-search.ts:4-11`, `pages/clients/ClientsIndexPage.tsx:23-32`

### 1D. Crear `types/bus.ts`

**Crear:** `frontend/src/types/bus.ts`

```typescript
export interface Bus {
  id: number
  plate_number?: string
  license_plate?: string
  model?: string
  brand?: string
  capacity?: number
  floors?: number
  color?: string
  is_active?: boolean
  owner_id?: number | null
  [key: string]: unknown
}

export interface Seat {
  id: number
  seat_number: number
  deck: string
  row: number
  column: number
  type: string
  status?: string
  bus_id?: number
}
```

Fuentes: `pages/admin/BusesPage.tsx:13-24`

### 1E. Crear `types/package.ts`

**Crear:** `frontend/src/types/package.ts`

```typescript
export interface Package {
  id: number
  tracking_code?: string
  description?: string
  status: string
  sender_name?: string
  sender_phone?: string
  recipient_name?: string
  recipient_phone?: string
  origin_office_id?: number
  destination_office_id?: number
  items?: PackageItem[]
  total_price?: number
  payment_method?: string
  payment_status?: string
  trip_id?: number | null
  created_at?: string
  [key: string]: unknown
}

export interface PackageItem {
  description: string
  quantity: number
  unit_price: number
}
```

Fuentes: `services/package.service.ts:56-60`, `lib/package-utils.ts:7-11`, `store/package.slice.ts:12-16`, `pages/PackagesPage.tsx:11-22`

### 1F. Crear `types/driver.ts`

**Crear:** `frontend/src/types/driver.ts`

```typescript
export interface Driver {
  id: number
  firstname: string
  lastname: string
  phone?: string
  email?: string
  user_id?: number
  license_number?: string
  license_type?: string
  license_expiry?: string
  status?: string
  is_active?: boolean
  [key: string]: unknown
}
```

Fuente: `pages/admin/DriversPage.tsx:9-21`

### 1G. Crear `types/assistant.ts`

**Crear:** `frontend/src/types/assistant.ts`

```typescript
export interface Assistant {
  id: number
  firstname: string
  lastname: string
  phone?: string
  email?: string
  user_id?: number
  [key: string]: unknown
}
```

Fuente: `pages/admin/AssistantsPage.tsx:5-12`

### 1H. Crear `types/secretary.ts`

**Crear:** `frontend/src/types/secretary.ts`

```typescript
export interface Secretary {
  id: number
  firstname: string
  lastname: string
  phone?: string
  document_id?: string
  email?: string
  user_id?: number
  office_id?: number
  is_active?: boolean
  [key: string]: unknown
}
```

Fuentes: `services/secretary.service.ts:3-11`, `pages/admin/UsersPage.tsx:21-27`, `pages/admin/SecretariesPage.tsx:9-16`

### 1I. Crear `types/owner.ts`

**Crear:** `frontend/src/types/owner.ts`

```typescript
export interface Owner {
  id: number
  firstname: string
  lastname: string
  ci?: string
  phone?: string
  email?: string
  user_id?: number
  is_active?: boolean
  [key: string]: unknown
}
```

Fuentes: `pages/admin/OwnersPage.tsx:10-19`, `pages/admin/BusesPage.tsx:26-30`

### 1J. Crear `types/location.ts`

**Crear:** `frontend/src/types/location.ts`

```typescript
export interface Location {
  id: number
  name: string
  [key: string]: unknown
}
```

Fuentes: `pages/admin/RoutesPage.tsx:12`, `pages/admin/OfficesPage.tsx:11`

### 1K. Crear `types/route.ts`

**Crear:** `frontend/src/types/route.ts`

```typescript
import type { Location } from './location'

export interface Route {
  id: number
  origin_id: number
  destination_id: number
  base_price: number
  estimated_duration?: number
  is_active?: boolean
  origin?: Location
  destination?: Location
  schedules?: RouteSchedule[]
  [key: string]: unknown
}

export interface RouteSchedule {
  id: number
  route_id: number
  departure_time: string
  arrival_time?: string
  days_of_week?: string[]
  is_active?: boolean
  [key: string]: unknown
}

export interface RouteWithSchedules extends Route {
  schedules: RouteSchedule[]
}
```

Fuente: `pages/admin/RoutesPage.tsx`, `store/route.slice.ts`

### 1L. Actualizar `types/index.ts`

**Modificar:** `frontend/src/types/index.ts`

Agregar re-exports:

```typescript
export * from './trip'
export * from './ticket'
export * from './client'
export * from './bus'
export * from './package'
export * from './driver'
export * from './assistant'
export * from './secretary'
export * from './owner'
export * from './location'
export * from './route'
```

Mantener `User`, `PaginatedResponse<T>`, `ApiError` existentes.

### Phase 1 Verification

```bash
cd frontend && npx tsc --noEmit  # 0 errores
```

---

## Phase 2: Limpiar `package.service.ts` (Mixed Concerns)

**Dependencia:** Phase 1 completa.

### 2A. Mover constantes a `lib/package-constants.ts`

**Crear:** `frontend/src/lib/package-constants.ts`

Mover desde `services/package.service.ts`:
- Lineas 7-13: `PACKAGE_STATUSES`
- Lineas 15-21: `PACKAGE_STATUS_LABELS`
- Lineas 23-32: `PACKAGE_STATUS_COLORS`
- Lineas 34-37: `PACKAGE_PAYMENT_STATUSES`
- Lineas 39-42: `PAYMENT_METHODS`
- Lineas 44-47: `PACKAGE_PAYMENT_STATUS_LABELS`
- Lineas 49-52: `PAYMENT_METHOD_LABELS`

### 2B. Eliminar duplicados de `package.service.ts`

Remover de `services/package.service.ts`:
- Lineas 7-52: Constantes (movidas a `lib/package-constants.ts`)
- Lineas 56-60: `PackageItem` interface (usar `types/package.ts`)
- Lineas 62-68: `calculatePackageTotal()` y `calculateItemsCount()` (ya existen en `lib/package-utils.ts:13-18`)
- Lineas 70-99: `validatePackageData()` (ya existe en `lib/package-utils.ts:21-50`)

El service queda solo con el objeto `packageService` (lineas 103-198).

### 2C. Actualizar consumidores

Buscar todos los imports de las constantes movidas:
- `import { PACKAGE_STATUS_COLORS } from '@/services/package.service'` -> cambiar a `@/lib/package-constants`
- `import { calculatePackageTotal } from '@/services/package.service'` -> cambiar a `@/lib/package-utils`

**Archivos:**
- Crear: `frontend/src/lib/package-constants.ts`
- Modificar: `frontend/src/services/package.service.ts` (~100 lineas -> ~95 lineas puras API)
- Modificar: Consumidores de constantes/functions movidas

### Phase 2 Verification

```bash
cd frontend && npx tsc --noEmit
# Verificar manualmente: pagina de paquetes, estados, colores
```

---

## Phase 3: Tipar Store Slices

**Dependencia:** Phase 1 completa.

Reemplazar `unknown[]` por tipos de dominio en cada slice. Patron consistente:

```typescript
// ANTES
trips: unknown[]

// DESPUES
import type { Trip } from '@/types'
trips: Trip[]
```

### 3A. Tipar `store/trip.slice.ts`

- `trips: unknown[]` (linea 5) -> `trips: Trip[]`
- `currentTrip: unknown | null` (linea 6) -> `currentTrip: Trip | null`
- Selectores: usar `RootState` en vez de tipo inline
- Actualizar `extraReducers`: cast `a.payload` a tipos correctos

### 3B. Tipar `store/ticket.slice.ts`

- `tickets: unknown[]` (linea 4) -> `tickets: Ticket[]`

### 3C. Tipar `store/client.slice.ts`

- `clients: unknown[]` (linea 4) -> `clients: Client[]`

### 3D. Tipar `store/bus.slice.ts`

- `buses: unknown[]` (linea 5) -> `buses: Bus[]`
- `currentBus: unknown | null` (linea 6) -> `currentBus: Bus | null`

### 3E. Tipar `store/route.slice.ts`

- `routes: unknown[]` (linea 5) -> `routes: Route[]`
- `routesWithSchedules: unknown[]` (linea 6) -> `routesWithSchedules: RouteWithSchedules[]`
- `currentRoute: unknown | null` (linea 7) -> `currentRoute: Route | null`

### 3F. Tipar `store/location.slice.ts`

- `locations: unknown[]` (linea 5) -> `locations: Location[]`

### 3G. Tipar `store/driver.slice.ts`

- `drivers: unknown[]` (linea 4) -> `drivers: Driver[]`

### 3H. Tipar `store/assistant.slice.ts`

- Tipar `unknown[]` a `Assistant[]`
- Tipar parámetros de `fetchAssistants`.

### 3I. Tipar `store/package.slice.ts`

- Tipar `unknown[]` a `Package[]` en parámetros, return types y payload.

### 3J. Unificar selectores a `RootState`

Cambiar TODOS los selectores que usan tipo inline `{ domain: DomainState }` a `RootState`:

| Slice | Linea actual | Cambiar a |
|-------|-------------|-----------|
| `trip.slice.ts` | `(state: { trip: TripState })` | `(state: RootState)` |
| `auth.slice.ts` | `(state: { auth: AuthState })` | `(state: RootState)` |
| `stats.slice.ts` | `(state: { stats: StatsState })` | `(state: RootState)` |
| `client.slice.ts` | `(state: { client: ClientState })` | `(state: RootState)` |
| `driver.slice.ts` | `(state: { driver: DriverState })` | `(state: RootState)` |
| `assistant.slice.ts` | `(state: { assistant: AssistantState })` | `(state: RootState)` |
| `route.slice.ts` | `(state: { route: RouteState })` | `(state: RootState)` |
| `location.slice.ts` | `(state: { location: LocationState })` | `(state: RootState)` |

**Archivos:**
- Modificar: 8 slices en `frontend/src/store/`

### Phase 3 Verification

```bash
cd frontend && npx tsc --noEmit
# Verificar: cada pagina que usa store debe compilar sin casts manuales
```

---

## Phase 4: Eliminar `apiFetch` de Hooks

**Dependencia:** Phase 1 (tipos). Cambio mecanico de bajo riesgo.

### 4A. `hooks/use-client-search.ts`
Reemplazar `apiFetch` por `clientService.search` y `clientService.create`.

### 4B. `hooks/use-trip-staff-editor.ts`
Reemplazar `apiFetch` por `tripService.update`.

### 4C. `hooks/use-trip-detail-page.ts`
Reemplazar `apiFetch` por `ticketService.changeSeat`, `ticketService.confirmSale`, `ticketService.cancel`.

### 4D. `hooks/use-trip-details.ts`
Reemplazar `apiFetch` por `ticketService.getByTripId`.

### 4E. `hooks/use-trip-packages-panel.ts`
Reemplazar `apiFetch` por `packageService.getByTrip` y `packageService.updateStatus`.

### 4F. `components/packages/registration/use-package-registration.ts`
Reemplazar `apiFetch` por `officeService.getAll()` y `secretaryService.getByUserId()`.

### 4G. `components/tickets/ticket-sale/use-ticket-sale.ts`

**Problema:** Llama a `apiFetch` (ej. `/clients`, `/tickets`).
**Solucion:** Reemplazar por `clientService.create(...)`, `ticketService.create(...)`.

### 4H. `components/trips/manifest/use-trip-manifest.ts`

**Problema:** Llama a `apiFetch('/packages/by-trip/...')`.
**Solucion:** Usar `packageService.getPackagesByTrip(...)`.

### 4I. `components/trips/sheet/use-trip-sheet.ts`

**Problema:** Llama a `apiFetch('/tickets/trip/...')`.
**Solucion:** Usar `ticketService.getTicketsByTrip(...)`.

**Archivos:**
- Modificar: Hooks/component-hooks
- Modificar: `frontend/src/services/secretary.service.ts` (agregar `getByUserId` y `update`)
- Modificar: `frontend/src/services/package.service.ts` (agregar `unassign`)

### Phase 4 Verification

```bash
cd frontend && npx tsc --noEmit
# Verificar 0 llamadas apiFetch en hooks
```

---

## Phase 5: Extraer Hooks de Paginas (Paginas Fat)

### 5A. Crear `hooks/use-tickets-index.ts`
Extraer lógica de estado y `apiFetch` de `TicketsIndexPage.tsx`.

### 5B. Crear `hooks/use-users-page.ts`
**Nuevos metodos en services:**
```typescript
// secretary.service.ts
async update(id: number, data: Partial<Secretary>): Promise<Secretary> {
  return apiFetch<Secretary>(`/secretaries/${id}`, { method: 'PATCH', body: JSON.stringify(data) })
}
```

### 5C-5Q. Patron general para las demas paginas

Para cada pagina restante:

1. Crear hook en `hooks/` (o `components/[feature]/` si es scoped)
2. Mover todo `useState`, `useEffect`, handlers al hook
3. El hook retorna estado + acciones como objeto tipado
4. La pagina importa solo el hook + componentes UI
5. Remover imports de services de la pagina

**Estructura del hook:**
```typescript
export function useXxxPage() {
  // state
  // effects
  // handlers

  return {
    // data
    // ui state
    // actions
  }
}
```

**Estructura de la pagina resultante:**
```typescript
import { useXxxPage } from '@/hooks/use-xxx-page'

export function Component() {
  const { data, loading, actions } = useXxxPage()
  return (
    // JSX puro, sin logica
  )
}
```

### Phase 5 Verification

Despues de CADA pagina refactorizada:

```bash
cd frontend && npx tsc --noEmit
# Verificar que la pagina funciona en browser
```

Al final:
```bash
# Verificar que 0 paginas importan services o apiFetch:
rg "from '@/services/|from '@/lib/api'" frontend/src/pages/ --type ts
# Solo debe retornar imports de types (si los hay)
```

---

## Phase 6: Eliminar `any` y Estandarizar Imports

**Dependencia:** Phase 1, 3 completas.

### 6A. Reemplazar `useDispatch<any>` por `useAppDispatch`

Archivos afectados:
- `components/packages/registration/use-package-registration.ts:29`
- `pages/packages/PackagesIndexPage.tsx:25`
- `pages/packages/PackageDetailPage.tsx` (si aplica)

Cambiar:
```typescript
// ANTES
import { useDispatch } from 'react-redux'
const dispatch = useDispatch<any>()

// DESPUES
import { useAppDispatch } from '@/store'
const dispatch = useAppDispatch()
```

### 6B. Remover `eslint-disable @typescript-eslint/no-explicit-any` y tipar correctamente

Con los tipos centralizados de Phase 1, reemplazar `any` por tipos concretos en los ~28 archivos.

**Mayor concentracion:** `components/packages/` (18 archivos). Reemplazar `any` por `Package`, `PackageItem`, `Client`, etc.

### 6C. Reemplazar `useSelector` raw por `useAppSelector`

| Archivo | Linea |
|---------|-------|
| `pages/packages/PackagesIndexPage.tsx` | 4 |
| `components/tickets/ticket-sale/TicketSaleModal.tsx` | 2 |

### 6D. Eliminar hook falso `hooks/use-package-status.ts`

Ya existe `lib/package-status.ts` como reemplazo. Remover el hook y actualizar cualquier consumidor restante.

### Phase 6 Verification

```bash
cd frontend && npm run lint
# 0 warnings de @typescript-eslint/no-explicit-any
# 0 imports de react-redux directos (solo @/store)
```

---

## Phase 7: Limpiar Hooks en Componentes

**Dependencia:** Phase 1, 4.

Los siguientes componentes importan services directamente. Mover la logica a hooks:

| Componente | Service importado | Solucion |
|------------|------------------|----------|
| `components/layout/AppSidebar.tsx` | `officeService` | Extraer `useSidebarOffice()` hook |
| `components/packages/PackageAssignModal.tsx` | `packageService` | Extraer logica a hook |
| `components/packages/PendingCollections.tsx` | `packageService` | Extraer logica a hook |
| `components/packages/PackageDeliveryModal.tsx` | `packageService`, `cashRegisterService` | Extraer logica a hook |
| `components/dashboard/RecentSales.tsx` | `salesService` | Extraer `useRecentSales()` hook |
| `components/dashboard/UpcomingTrips.tsx` | `tripService` | Extraer `useUpcomingTrips()` hook |
| `components/cash-register/RegisterHistoryTable.tsx` | `cashRegisterService` | Recibir data via props |

Para componentes de dashboard (`RecentSales`, `UpcomingTrips`), considerar si es mas limpio recibir data via props desde la page que ya la tiene.

### Phase 7 Verification

```bash
# Verificar 0 componentes importan services:
rg "from '@/services/" frontend/src/components/ --type ts
# Solo debe retornar imports de types
```

---

## Phase 8: DRY de Utilidades

**Dependencia:** Phase 1, 4.

### 8A. Crear `lib/error-utils.ts`

Extraer el patron duplicado de extraccion de errores:

```typescript
export function errMsg(err: unknown, fallback = 'Error desconocido'): string {
  if (err instanceof Error) return err.message
  if (typeof err === 'string') return err
  return fallback
}
```

Usado en: `hooks/use-trip-detail-page.ts:40-45`, `hooks/use-trip-packages-panel.ts:10-15`, y otros.

### 8B. Limpiar `console.error` de produccion

Remover o reemplazar con un logger configurable los ~10 `console.error` en hooks y pages.

### Phase 8 Verification

```bash
cd frontend && npx tsc --noEmit
```

---

## Phase 9: Estandarización de Interceptors y Fetch Wrapper

**Dependencia:** Phase 4.

### 9A. Mejorar `lib/api.ts` (`apiFetch`)

Agregar manejo robusto y centralizado de la API:
- Redirección a login si el backend responde `401 Unauthorized`.
- Transformación automática de errores del backend a un formato estándar.
- Inyección unificada del token (si actualmente se hace de forma esparcida).

### Phase 9 Verification
Validar forzando un error 401 y comprobando que el redireccionamiento y la limpieza del estado funcionen correctamente.

---

## Phase 10: Configuraciones Estrictas (ESLint) para prevenir regresiones

**Dependencia:** TODAS LAS FASES COMPLETADAS.

### 10A. Añadir regla `no-restricted-imports`

Modificar `.eslintrc.js` (o `.eslintrc.json`) para bloquear importaciones que violen la arquitectura limpia:
```json
"rules": {
  "no-restricted-imports": ["error", {
    "patterns": [{
      "group": ["@/lib/api", "@/lib/api/*"],
      "message": "NO uses apiFetch directamente. Debes usar un Service de @/services/."
    }, {
      "group": ["@/services", "@/services/*"],
      "message": "NO importes Services directamente en Pages o Components. Extrae la lógica a un Hook."
    }]
  }]
}
```
*Nota:* Puede ser necesario agregar excepciones para los Hooks en `.eslintrc` (usando `overrides` para `hooks/**/*.ts` o `use-*.ts`), ya que los Hooks SÍ pueden importar `services`.

### Phase 10 Verification
```bash
cd frontend && npm run lint
```
Debe arrojar cero errores con las reglas estrictas habilitadas.

---

## Resumen

| Phase | Descripcion | Archivos nuevos | Archivos modificados | Riesgo |
|-------|-------------|----------------|---------------------|--------|
| 1 | Centralizar tipos | 11 | 1 (`types/index.ts`) | Bajo |
| 2 | Limpiar package.service | 1 | ~3 | Bajo |
| 3 | Tipar slices + selectores | 0 | 9 | Bajo |
| 4 | Eliminar apiFetch de hooks | 0 | 10 | Bajo |
| 5 | Extraer hooks de paginas | ~20 | ~20 | Medio |
| 6 | Eliminar `any` | 0 | ~28 | Bajo |
| 7 | Limpiar componentes | ~4 | ~7 | Bajo |
| 8 | DRY utilidades | 1 | ~10 | Bajo |
| 9 | Mejorar Interceptors API | 0 | 1 (`lib/api.ts`) | Medio |
| 10 | Reglas estrictas Linter | 0 | 1 (`.eslintrc`) | Bajo |

## Orden de Implementacion

Las fases deben ejecutarse en orden (1 -> 10) ya que cada una depende de la anterior.

**Excepcion:** Phase 5 (paginas) se puede hacer incrementalmente -- cada pagina es independiente. Sugerido sub-orden:
1. `5Q` (TicketDetailPage - 1 linea)
2. `5P` (ProfilePage - trivial)
3. `5O` (AssistantsPage - simple)
4. `5L` (ReportsPage - simple)
5. `5N` (BusesPage - parcial store)
6. `5I` (AdminDashboard - parcial store)
7. `5J` (AssistantDashboard)
8. `5M` (WithdrawalHistoryPage)
9. `5K` (FinancialDashboardPage)
10. `5G` (TicketConfirmationPage)
11. `5E` (OwnersPage)
12. `5F` (DriversPage)
13. `5H` (CashRegisterPage)
14. `5C` (SecretariesPage)
15. `5D` (DriverDashboard - compleja por componentes inline)
16. `5B` (UsersPage - con apiFetch)
17. `5A` (TicketsIndexPage - la mas compleja)

## Verificacion Final

```bash
# TypeScript compila
cd frontend && npx tsc --noEmit

# ESLint pasa
cd frontend && npm run lint

# No hay apiFetch fuera de services/
rg "apiFetch" frontend/src/ --type ts | grep -v "services/" | grep -v "lib/api.ts"
# Resultado esperado: 0 lineas

# No hay imports de services en pages/
rg "from '@/services/" frontend/src/pages/ --type ts
# Resultado esperado: 0 lineas

# No hay any
rg "@typescript-eslint/no-explicit-any" frontend/src/ --type ts
# Resultado esperado: 0 lineas

# No hay unknown[] en slices
rg "unknown\[\]" frontend/src/store/ --type ts
# Resultado esperado: 0 lineas
```
