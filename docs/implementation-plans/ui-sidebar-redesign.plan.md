# Plan: Migración de UI a diseño con Sidebar

## Contexto

La app actualmente usa navegación horizontal (top header). Se quiere migrar a un diseño con **sidebar lateral oscuro (navy)**, header superior limpio con breadcrumbs, y estilo visual con botones CTA marrones, cards limpias y tipografía profesional — similar al mockup "Kinetic Fleet" proporcionado.

## Resumen de Fases

| Fase | Descripción | Archivos principales |
|------|-------------|---------------------|
| 1 | Design tokens (colores, tipografía) | `globals.css` |
| 2 | Sidebar + Layout shell | Instalar shadcn sidebar, crear `AppSidebar`, `navigation.ts`, modificar `DefaultLayout` |
| 3 | Header superior | Crear `AppHeader` con breadcrumbs y controles |
| 4A | Dashboards | 4 páginas de dashboard |
| 4B | Viajes | 3 páginas + componentes de trips |
| 4C | Encomiendas | 4 páginas + componentes de packages |
| 4D | Admin | ~10 páginas admin |
| 4E | Otros | Clientes, boletos, perfil, bookings |
| 5 | Cleanup | Eliminar código obsoleto, auditoría |

---

## Fase 1: Design Tokens

**Objetivo:** Actualizar paleta de colores sin cambiar layout.

**Modificar:** `frontend-react/src/styles/globals.css`

Cambios:
- Actualizar variables CSS del sidebar a navy oscuro:
  ```
  --sidebar: dark navy (#1B2A4A)
  --sidebar-foreground: white
  --sidebar-primary: blue accent (#3B82F6)
  --sidebar-accent: navy más claro (#243656)
  --sidebar-border: (#2D3F5E)
  ```
- Agregar colores custom en `@theme`:
  ```
  --color-navy-900: #1B2A4A
  --color-navy-800: #243656
  --color-navy-700: #2D3F5E
  --color-cta-brown: #6B3A2A
  --color-cta-brown-hover: #7D4A38
  --color-status-available: #22C55E
  --color-status-medium: #F59E0B
  --color-status-full: #EF4444
  ```
- Actualizar `--primary` a navy oscuro
- Actualizar `--background` a gris claro (#F8F9FA)

**Verificación:** `npm run dev` → colores actualizados, sin errores.

---

## Fase 2: Sidebar + Layout Shell

**Objetivo:** Reemplazar navegación horizontal con sidebar lateral.

### Paso 2.1: Instalar shadcn Sidebar
```bash
cd frontend-react && npx shadcn@latest add sidebar
```

### Paso 2.2: Crear config de navegación
**Nuevo:** `frontend-react/src/lib/navigation.ts`
- Extraer `NAV_LINKS` de `AdminHeader.tsx` (líneas 6-37) a config standalone
- Agregar iconos Lucide por cada item
- Agrupar items por categoría (Principal, Operaciones, Gestión, Finanzas)
- Mantener mismo mapeo por rol (admin, secretary, driver, assistant)
- Agregar `ROLE_LABELS` para subtítulos del sidebar

### Paso 2.3: Crear componente AppSidebar
**Nuevo:** `frontend-react/src/components/layout/AppSidebar.tsx`
- Usar primitivos de shadcn: `Sidebar`, `SidebarHeader`, `SidebarContent`, `SidebarGroup`, `SidebarMenu`, `SidebarMenuItem`, `SidebarMenuButton`, `SidebarFooter`
- Header: Logo "Trans Comarapa" + rol del usuario
- Content: Grupos de nav items con iconos, active state via `NavLink`
- Footer: Botón CTA primario (ej: "+ Nuevo Despacho" para secretary), Settings, Logout
- Colapsable en mobile (sheet overlay automático de shadcn)

### Paso 2.4: Actualizar DefaultLayout
**Modificar:** `frontend-react/src/layouts/DefaultLayout.tsx`
```tsx
<SidebarProvider>
  <AppSidebar />
  <SidebarInset>
    <header>  {/* temporal, se completa en Fase 3 */}
      <SidebarTrigger />
    </header>
    <main className="flex-1 p-4 lg:p-6">
      <Outlet />
    </main>
  </SidebarInset>
</SidebarProvider>
```
- Eliminar footer (se mueve al sidebar footer)
- No eliminar `AdminHeader.tsx` aún (referencia)

**Verificación:**
- Todas las páginas renderizan dentro del sidebar layout
- Nav por rol funciona (login como admin, secretary, driver)
- Mobile: sidebar se colapsa a overlay/sheet
- Item activo resaltado
- Login y Print layouts no afectados

---

## Fase 3: Header Superior

**Objetivo:** Header limpio con breadcrumbs, notificaciones y avatar.

### Paso 3.1: Instalar shadcn Breadcrumb
```bash
npx shadcn@latest add breadcrumb
```

### Paso 3.2: Crear hook de breadcrumb
**Nuevo:** `frontend-react/src/hooks/use-breadcrumb.ts`
- Deriva segmentos del breadcrumb desde `useLocation()`
- Mapa estático de rutas a labels en español

### Paso 3.3: Crear AppHeader
**Nuevo:** `frontend-react/src/components/layout/AppHeader.tsx`
- Izquierda: `SidebarTrigger` + separador + Breadcrumb
- Derecha: Botón notificaciones (bell), botón ayuda, acción rápida (navy), DropdownMenu con avatar + perfil/logout
- Usar `useAuth()` para datos del usuario

### Paso 3.4: Integrar en DefaultLayout
**Modificar:** `frontend-react/src/layouts/DefaultLayout.tsx`
- Reemplazar header temporal con `<AppHeader />`

**Verificación:**
- Breadcrumb se actualiza al navegar
- Menú de usuario funciona (perfil, logout)
- SidebarTrigger abre/cierra sidebar
- Responsive en mobile

---

## Fase 4A: Dashboards

**Modificar:**
- `frontend-react/src/pages/dashboards/AdminDashboard.tsx`
- `frontend-react/src/pages/dashboards/SecretaryDashboard.tsx`
- `frontend-react/src/pages/dashboards/DriverDashboard.tsx`
- `frontend-react/src/pages/dashboards/AssistantDashboard.tsx`
- `frontend-react/src/components/dashboard/UpcomingTrips.tsx`

**Cambios:**
- Eliminar headers de página duplicados (ya hay breadcrumb)
- Stat cards: números bold grandes, labels uppercase pequeños
- Cards con shadcn Card, bordes limpios
- Status con colores semánticos (available/medium/full)
- Quitar gradientes indigo, usar navy

---

## Fase 4B: Viajes

**Modificar:**
- `frontend-react/src/pages/trips/TripsIndexPage.tsx`
- `frontend-react/src/pages/trips/TripDetailPage.tsx`
- `frontend-react/src/components/trips/TripInfoCard.tsx`
- `frontend-react/src/components/trips/CreateTripModal.tsx`
- `frontend-react/src/components/trips/TripStaffEditor.tsx`

**Cambios:**
- Trip cards con bordes dashed azules (como mockup)
- Badges pill para estado (MAÑANA/TARDE, RETORNO)
- Indicadores de ocupación con colores (verde/amarillo/rojo)
- Botones CTA marrones para "Vender Boleto"
- Layout dos columnas por ruta (ida/vuelta)

---

## Fase 4C: Encomiendas

**Modificar:**
- `frontend-react/src/pages/packages/PackagesIndexPage.tsx`
- `frontend-react/src/pages/packages/PackageNewPage.tsx`
- `frontend-react/src/pages/packages/PendingCollectionsPage.tsx`
- `frontend-react/src/components/packages/PackageCard.tsx`
- `frontend-react/src/components/packages/PackageCardList.tsx`
- `frontend-react/src/components/packages/PackageRegistrationModal.tsx`
- `frontend-react/src/components/packages/PackageDeliveryModal.tsx`

---

## Fase 4D: Admin

**Modificar:**
- `frontend-react/src/pages/admin/BusesPage.tsx`
- `frontend-react/src/pages/admin/RoutesPage.tsx`
- `frontend-react/src/pages/admin/CashRegisterPage.tsx`
- `frontend-react/src/pages/admin/FinancialDashboardPage.tsx`
- `frontend-react/src/pages/admin/OwnersPage.tsx`
- `frontend-react/src/pages/admin/OwnerSettlements.tsx`
- `frontend-react/src/pages/admin/WithdrawalHistoryPage.tsx`
- `frontend-react/src/components/admin/BusForm.tsx`
- `frontend-react/src/components/admin/RouteForm.tsx`

**Cambios:**
- Tablas con estilo actualizado
- Forms envueltos en Cards
- Botones de acción consistentes

---

## Fase 4E: Otros

**Modificar:**
- `frontend-react/src/pages/clients/ClientsIndexPage.tsx`
- `frontend-react/src/components/clients/ClientCardList.tsx`
- `frontend-react/src/pages/ProfilePage.tsx`
- `frontend-react/src/pages/TripsPage.tsx` (cliente)
- `frontend-react/src/pages/PackagesPage.tsx` (cliente)

---

## Fase 5: Cleanup

1. **Eliminar** `frontend-react/src/components/layout/AdminHeader.tsx`
2. **Eliminar** dependencia `@heroicons/react` del `package.json` (reemplazada por lucide-react)
3. **Limpiar** clases CSS obsoletas de `globals.css` (gradientes comarapa si ya no se usan)
4. **Actualizar** tests que referencien AdminHeader o layout viejo
5. **Auditar** responsive en todos los breakpoints
6. **Verificar** PrintLayout no afectado

---

## Dependencias entre Fases

```
Fase 1 → Fase 2 → Fase 3 → Fase 4A-4E (independientes entre sí) → Fase 5
```

Cada fase deja la app funcional y revisable.
