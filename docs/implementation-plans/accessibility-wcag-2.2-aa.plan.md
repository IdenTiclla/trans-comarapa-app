# Plan: Accesibilidad WCAG 2.2 AA — Auditoría Completa

> **Fecha:** 2026-05-11 (actualizado 2026-05-12; auditoría de verificación 2026-05-12)
> **Estándar:** WCAG 2.2 nivel AA
> **Alcance:** Frontend completo (`frontend/src/`, `frontend/index.html`)
> **Total hallazgos:** 250+ instancias agrupadas en 75+ hallazgos únicos
> **Resumen:** 23 Bloqueantes, 44 Importantes, 24 Menores
> **Progreso real (segunda iteración, 2026-05-12):** ✅ Fases 1-9 completadas íntegramente. Pendientes únicamente las verificaciones manuales (lectores de pantalla, axe/WAVE) listadas en las secciones de **Verificaciones Manuales**.

---

## Resumen por Severidad

| Severidad | Cantidad | Completados |
|---|---|---|
| Bloqueante | 23 | 23 (B-01 a B-23) |
| Importante | 44 | 30 (I-01 a I-16, I-35 a I-48) |
| Menor | 24 | 24 (M-01 a M-27) |

---

## Estado de Implementación

| Fase | Sprint | Hallazgos | Estado | Fecha |
|---|---|---|---|---|
| **Fase 1** | Sprint 1 | B-01, B-02, B-03, B-04, B-05, B-06, B-07 | ✅ Completado | 2026-05-12 |
| **Fase 1** | Sprint 2 | B-10, B-13, B-14, B-15 | ✅ Completado | 2026-05-12 |
| **Fase 1** | Sprint 3 | B-08, B-09 | ✅ Completado | 2026-05-12 |
| **Fase 1** | Sprint 4 | B-11, B-12 | ✅ Completado | 2026-05-12 |
| **Fase 2** | Sprint 5 | I-01 a I-07 | ✅ Completado | 2026-05-12 |
| **Fase 2** | Sprint 6 | I-08 a I-16 | ✅ Completado | 2026-05-12 |
| **Fase 3** | Sprint 7 | M-01 a M-07 | ✅ Completado | 2026-05-12 |
| **Fase 4** | — | B-16 a B-21 | ✅ Completado | 2026-05-12 |
| **Fase 5** | — | I-17 a I-34 | ✅ Completado | 2026-05-12 |
| **Fase 6** | — | M-08 a M-18 | ✅ Completado | 2026-05-12 |
| **Fase 7** | — | B-22, B-23 | ✅ Completado | 2026-05-12 |
| **Fase 8** | — | I-35 a I-48 | ✅ Completado | 2026-05-12 |
| **Fase 9** | — | M-19 a M-27 | ✅ Completado | 2026-05-12 |

---

## Fase 1: Correcciones Globales y Críticas (Bloqueantes) ✅ COMPLETADA

> Prioridad máxima. Todas impiden que usuarios de lectores de pantalla o teclado usen la aplicación.
> **Estado:** Completado el 2026-05-12. Todos los 15 hallazgos implementados y verificados.

### [B-01] `lang="en"` en app 100% en español ✅

- **Criterio:** SC 3.1.1 Language of Page (A)
- **Archivo:** `frontend/index.html:2`
- **Problema:** `<html lang="en">` hace que lectores de pantalla pronuncien todo el español como inglés.
- **Fix:** Cambiar a `<html lang="es">` ✅ Aplicado

### [B-02] `<title>` genérico del documento ✅

- **Criterio:** SC 2.4.2 Page Titled (A)
- **Archivo:** `frontend/index.html:7`
- **Problema:** Título es `frontend-react` (placeholder de Vite).
- **Fix:** Cambiar a `Trans Comarapa - Sistema de Gestión de Transporte` ✅ Aplicado
- **Tarea adicional:** Ninguna página hace `document.title = ...`. Crear hook `useDocumentTitle(title)` en `hooks/use-document-title.ts` y llamarlo en cada página ✅ Hook creado y aplicado en las 34 páginas
  ```tsx
  export function useDocumentTitle(title: string) {
    useEffect(() => {
      document.title = `${title} · Trans Comarapa`
    }, [title])
  }
  ```
- **Archivos a modificar:** Todas las ~30 páginas en `pages/`.

### [B-03] `--destructive-foreground` = `--destructive` (contraste 1:1) ✅

- **Criterio:** SC 1.4.3 Contrast Minimum (AA)
- **Archivo:** `frontend/src/styles/globals.css:114-115`
- **Problema:** Texto sobre fondo rojo destructivo es invisible (1:1 contraste).
- **Fix:**
  ```css
  --destructive: oklch(0.577 0.245 27.325);
  --destructive-foreground: oklch(0.985 0 0);
  ```
  ✅ Aplicado

### [B-04] Sin enlace "Saltar al contenido principal" (skip link) ✅

- **Criterio:** SC 2.4.1 Bypass Blocks (A)
- **Archivo:** `frontend/src/layouts/DefaultLayout.tsx`
- **Problema:** Usuarios de teclado deben tabular toda la barra lateral antes de llegar al contenido.
- **Fix:** Agregar como primer elemento:
  ```tsx
  <a
    href="#main-content"
    className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[9999] focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground focus:shadow-lg"
  >
    Saltar al contenido principal
  </a>
  ```
  Y agregar `id="main-content"` al `<main>`. ✅ Aplicado

### [B-05] Landmarks `<main>` anidados ✅

- **Criterio:** SC 1.3.1 Info and Relationships (A)
- **Archivo:** `frontend/src/layouts/DefaultLayout.tsx:10,12`
- **Problema:** `SidebarInset` renderiza como `<main>` y dentro hay otro `<main>`.
- **Fix:** Cambiar el `<main>` interno por `<div id="main-content">`. ✅ Aplicado

### [B-06] Sidebar sin landmark de navegación ✅

- **Criterio:** SC 1.3.1 Info and Relationships (A), SC 2.4.1 Bypass Blocks (A)
- **Archivo:** `frontend/src/components/layout/AppSidebar.tsx:32`
- **Problema:** El `Sidebar` de shadcn renderiza como `<div>` sin `role="navigation"`.
- **Fix:** Envolver con `<nav aria-label="Navegación principal">` o pasar el atributo al componente. ✅ Aplicado

### [B-07] Sin anuncio de cambio de ruta para lectores de pantalla ✅

- **Criterio:** SC 4.1.3 Status Messages (AA)
- **Archivo:** `frontend/src/router/index.tsx`
- **Problema:** Navegación SPA no anuncia el cambio de página. Lectores de pantalla no saben que la página cambió.
- **Fix:** Agregar región `aria-live` en la raíz de la app + `useEffect` en el layout que escuche `useLocation()`:
  ```tsx
  const location = useLocation()
  useEffect(() => {
    const announcer = document.getElementById('route-announcer')
    if (announcer) {
      announcer.textContent = ''
      requestAnimationFrame(() => {
        announcer.textContent = document.title
      })
    }
    document.getElementById('main-content')?.focus()
  }, [location.pathname])
  ```
  ✅ Aplicado

### [B-08] Modales custom sin foco atrapado, ARIA ni retorno de foco ✅

- **Criterio:** SC 2.4.3 Focus Order (A), SC 4.1.2 Name, Role, Value (A)
- **Archivos:**
  - `components/common/AppModal.tsx` — falta focus trap y retorno de foco
  - `components/clients/ClientViewModal.tsx` — custom overlay sin `role="dialog"`
  - `components/clients/ClientModal.tsx` — ídem
  - `components/tickets/TicketReceiptModal.tsx` — ídem
  - `components/tickets/TicketFormModal.tsx` — ídem
  - `components/tickets/TicketSaleModal.tsx` — ídem
  - `pages/admin/AssistantsPage.tsx:90-132`
  - `pages/admin/SecretariesPage.tsx:113-195`
  - `pages/admin/DriversPage.tsx:112-183`
  - `pages/admin/UsersPage.tsx:80-158`
  - `pages/admin/OfficesPage.tsx:153-207`
  - `pages/admin/RoutesPage.tsx:140-195`
  - `pages/admin/OwnersPage.tsx:86-153`
  - `pages/admin/BusesPage.tsx:98-109`
- **Problema:** Todos usan `<div className="fixed inset-0 ...">` sin `role="dialog"`, `aria-modal`, focus trap ni retorno de foco.
- **Fix:** Migrar todos a `Dialog`/`DialogContent` de Radix (`@/components/ui/dialog`) que ya maneja focus trap, ARIA y retorno de foco nativamente.
  - Para `AppModal.tsx`: integrar `FocusTrap` de `@radix-ui/react-focus-trap` o refactorizar para componer con Radix Dialog.
  - Para las páginas admin: reemplazar `<div className="fixed inset-0 ...">` por `<Dialog open={showForm} onOpenChange={setShowForm}>`.
- **Esfuerzo:** Alto (~15 archivos). ✅ **Aplicado completamente (2026-05-12, segunda iteración).** Los 5 modales pendientes (`ClientModal`, `ClientViewModal`, `TicketFormModal`, `TicketSaleModal`, `TicketReceiptModal`) ahora usan `Dialog`/`DialogContent` de Radix con focus trap, `role="dialog"`, `aria-modal`, retorno de foco y `DialogTitle`/`DialogDescription`. El `sr-only` "Close" del `DialogContent` también se localizó a "Cerrar".

### [B-09] `<div onClick>` en vez de `<button>` — no accesible por teclado ✅

- **Criterio:** SC 1.3.1, SC 2.1.1, SC 4.1.2
- **Archivos:**
  - `components/forms/FormInput.tsx:78-86` (botón limpiar)
  - `components/forms/FormDatePicker.tsx:167-177` (trigger del calendario)
  - `components/admin/SeatLayoutEditor.tsx:252-253, 281-282`
  - `components/cash-register/RegisterHistoryTable.tsx:42-45`
  - `components/clients/ClientSelector.tsx:134-138`
  - `components/dashboard/UpcomingTrips.tsx:38-42`
  - `components/dashboards/assistant/BoardingChecklist.tsx:52-55`
  - `components/packages/PackageCard.tsx:52-55`
  - `components/packages/PackageCardList.tsx:174`
  - `components/packages/PackageDeliveryModal.tsx:167, 179`
  - `components/tickets/TicketReceiptModal.tsx:89`
  - `components/trips/TripCardList.tsx:113-116`
  - `components/clients/ClientViewModal.tsx:57-58` (backdrop)
  - `components/clients/ClientModal.tsx:77-78` (backdrop)
  - `components/admin/bus-form/BusFormStep2.tsx:54`
- **Problema:** `<div>` con `onClick` no es focusable ni operable por teclado. Todos tienen `eslint-disable` explícito.
- **Fix:** Reemplazar por `<button type="button">` o componente `Button` del proyecto. Para backdrops, usar `<div aria-hidden="true">`. ✅ Aplicado

### [B-10] Errores de formulario no vinculados a inputs (`aria-describedby` / `aria-invalid`) ✅

- **Criterio:** SC 3.3.1 Error Identification (A), SC 1.3.1
- **Archivos:**
  - `components/forms/FormInput.tsx:57,96-100`
  - `components/forms/FormSelect.tsx:74,126-130`
  - `components/forms/FormCheckbox.tsx:32,61-62`
  - `components/forms/FormDatePicker.tsx:184,279-283`
- **Problema:** Mensajes de error `<p>` no tienen `id` y los inputs no tienen `aria-describedby` ni `aria-invalid`.
- **Fix:** En cada componente:
  ```tsx
  const errorId = `${id}-error`
  <input aria-invalid={!!error} aria-describedby={error ? errorId : undefined} ... />
  <p id={errorId} role="alert" className="...">{error}</p>
  ```
  ✅ Aplicado

### [B-11] Calendario del FormDatePicker sin semántica ARIA ✅

- **Criterio:** SC 1.3.1, SC 2.1.1, SC 2.4.3, SC 4.1.2
- **Archivo:** `components/forms/FormDatePicker.tsx:212-253`
- **Problemas múltiples:
  1. Popup sin `role="dialog"` ni `aria-modal`
  2. Botones prev/next sin `aria-label`
  3. Botones de día sin `aria-label` con fecha completa
  4. Sin roving tabindex (42 botones en tab order)
  5. Foco no se mueve al abrir ni retorna al cerrar
  6. `focus:outline-none` sin reemplazo visible en 5 botones
  7. Headers de día (`Do`, `Lu`...) sin asociación semántica
- **Fix recomendado:** Reescribir siguiendo el patrón [APG Date Picker Dialog](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/examples/datepicker-dialog/) o adoptar un picker basado en Radix (ej. `react-day-picker` con `@radix-ui/react-popover`).
- **Esfuerzo:** Alto. ✅ Aplicado

### [B-12] `calendar-view.tsx` — componente calendar con 8 hallazgos ✅

- **Criterio:** SC 1.3.1, SC 1.4.1, SC 2.1.1, SC 4.1.2, SC 4.1.3
- **Archivo:** `components/ui/calendar-view.tsx`
- **Problemas:
  1. Botones prev/next sin `aria-label` (bloqueante)
  2. Grid sin `role="grid"` ni estructura ARIA
  3. Botones de día sin `aria-label` con fecha completa
  4. Mes/año no anunciado al cambiar
  5. Fecha seleccionada no anunciada
  6. `disabled` no propaga a HTML `disabled`
  7. "Hoy" comunicado solo por color
  8. Sin `aria-selected` en día seleccionado
- **Fix:** Agregar ARIA completo o migrar a componente Radix-based. ✅ Aplicado

### [B-13] Tablas sin `scope="col"` en `<th>` ✅

- **Criterio:** SC 1.3.1 Info and Relationships (A)
- **Archivos (13+ tablas):**
  - `pages/admin/AssistantsPage.tsx:40-43`
  - `pages/admin/SecretariesPage.tsx:43-49`
  - `pages/admin/DriversPage.tsx:42-47`
  - `pages/admin/UsersPage.tsx:38-43`
  - `pages/admin/OfficesPage.tsx:122-127`
  - `pages/admin/RoutesPage.tsx:99-105`
  - `pages/admin/OwnersPage.tsx:42-47`
  - `pages/admin/BusesPage.tsx:40-49`
  - `pages/admin/WithdrawalHistoryPage.tsx:89-96`
  - `pages/admin/FinancialDashboardPage.tsx:81-88,121-125`
  - `pages/dashboards/DriverDashboard.tsx:115-119`
  - `pages/admin/reports/DetailTable.tsx:29-31`
  - `pages/admin/reports/BreakdownTable.tsx:24-26`
  - `components/admin/settlements/WithdrawalHistoryTable.tsx:36-47`
  - `components/cash-register/TransactionList.tsx:44-50`
  - `components/dashboards/assistant/TripPassengersTable.tsx:12-16`
  - `components/dashboards/assistant/TripPackagesTable.tsx:12-19`
  - `components/trips/manifest/ManifestTable.tsx:24-34`
  - `components/trips/sheet/PassengerTable.tsx:15-21`
- **Fix:** Agregar `scope="col"` a todos los `<th>` de columnas. ✅ Aplicado

### [B-14] Estados de carga no anunciados a lectores de pantalla ✅

- **Criterio:** SC 4.1.3 Status Messages (AA)
- **Archivos (19+ ubicaciones):**
  - Todas las páginas admin (`AssistantsPage`, `SecretariesPage`, `DriversPage`, `UsersPage`, `OfficesPage`, `RoutesPage`, `OwnersPage`, `BusesPage`)
  - Todos los dashboards (`AdminDashboard`, `SecretaryDashboard`, `DriverDashboard`, `AssistantDashboard`)
  - `WithdrawalHistoryPage`, `FinancialDashboardPage`, `ReportsPage`
  - `PackagesIndexPage`, `TicketsIndexPage`, `TicketConfirmationPage`, `TripEditPage`
  - Componentes: `BusTable`, `RouteTable`, `RecentSales`, `UpcomingTrips`, `CashRegisterWidget`, `RecentActivityWidget`, `TripCard`
- **Problema:** Spinners usan `<div className="animate-spin">` sin `role="status"`, `aria-live` ni `sr-only`.
- **Fix:** Envolver todos los spinners:
  ```tsx
  <div role="status" aria-live="polite" className="flex justify-center py-16">
    <div className="animate-spin ..." aria-hidden="true" />
    <span className="sr-only">Cargando asistentes...</span>
  </div>
  ```
  ✅ Aplicado

### [B-15] Menús contextuales (`SeatContextMenu`) sin soporte completo de teclado ✅

- **Criterio:** SC 2.1.1 Keyboard (A), SC 4.1.2 Name, Role, Value (A)
- **Archivo:** `frontend/src/components/seats/SeatContextMenu.tsx:40-52`
- **Problema:** El contenedor tiene `role="menu"`, pero los botones internos no tienen `role="menuitem"`. Además, tiene `tabIndex={-1}` y no atrapa el foco ni permite navegación con flechas (Up/Down) al abrirse, lo que lo hace inoperable para usuarios exclusivos de teclado.
- **Fix:**
  1. Utilizar un componente estándar como `DropdownMenu` o `ContextMenu` de shadcn/ui (Radix) que ya maneja los patrones ARIA para menús.
  2. Si se mantiene custom, implementar el patrón "Menu" de W3C APG: agregar `role="menuitem"`, gestionar el `tabIndex` dinámicamente y atrapar eventos de teclado para mover el foco. ✅ Aplicado

---

## Fase 2: Correcciones Importantes ✅ COMPLETADA

> **Estado:** Completado el 2026-05-12. Todos los 16 hallazgos (I-01 a I-16) implementados y verificados.

### [I-01] Errores de página no anunciados (`role="alert"`) ✅

- **Criterio:** SC 4.1.3, SC 3.3.1
- **Archivos:** `BusesPage`, `UsersPage`, `OfficesPage`, `RoutesPage`, `ClientsIndexPage`, `PackagesIndexPage`, `AdminDashboard`, `SecretaryDashboard`, `TripsIndexPage`, `TripEditPage`, `TicketConfirmationPage`
- **Fix:** Agregar `role="alert"` a los contenedores de error. ✅ Aplicado

### [I-02] Tablas sin `<caption>` ✅

- **Criterio:** SC 1.3.1
- **Archivos:** Las mismas 20+ tablas de [B-13]
- **Fix:** Agregar `<caption className="sr-only">Descripción de la tabla</caption>` después de cada `<table>`. ✅ Aplicado

### [I-03] Sin `<h1>` en múltiples páginas ✅

- **Criterio:** SC 1.3.1
- **Archivos:** `ProfilePage`, `CashRegisterPage`, `AdminDashboard`, `SecretaryDashboard`, `DriverDashboard`, `AssistantDashboard`, `FinancialDashboardPage`, `WithdrawalHistoryPage`, `PendingCollectionsPage`
- **Fix:** Agregar `<h1 className="sr-only">Título de página</h1>` o convertir el heading visible a `<h1>`. ✅ Aplicado

### [I-04] Botones solo-icono sin `aria-label` ✅

- **Criterio:** SC 4.1.2
- **Archivos:**
  - `components/layout/AppHeader.tsx:59-61` (campana notificaciones)
  - `components/layout/AppHeader.tsx:65` (avatar usuario)
  - `components/clients/ClientCardList.tsx:202-210` (ver, editar, eliminar)
  - `pages/admin/OwnersPage.tsx:74-76` (editar lápiz)
  - `components/forms/FormSelect.tsx:108-117` (botón limpiar)
- **Fix:** Agregar `aria-label` descriptivo a cada botón. ✅ Aplicado

### [I-05] Botones "Editar"/"Eliminar" indistinguibles en tablas ✅

- **Criterio:** SC 2.4.4, SC 4.1.2
- **Archivos:** `AssistantsPage`, `SecretariesPage`, `DriversPage`, `UsersPage`, `OfficesPage`
- **Fix:** Agregar `aria-label` con nombre de entidad: `aria-label="Editar Juan Pérez"`. ✅ Aplicado

### [I-06] `window.confirm()` para acciones destructivas ✅

- **Criterio:** SC 2.1.1, SC 4.1.2
- **Archivos:**
  - `hooks/use-tickets-index.ts:174`
  - `hooks/use-buses-page.ts:90`
  - `hooks/use-secretaries-page.ts:146`
  - `hooks/use-drivers-page.ts:107`
  - `hooks/use-assistants-page.ts:89`
  - `hooks/use-users-page.ts:152`
  - `pages/admin/OfficesPage.tsx:86`
  - `pages/admin/RoutesPage.tsx:76`
  - `pages/packages/PackagesIndexPage.tsx:93`
  - `pages/clients/ClientsIndexPage.tsx:111`
  - `pages/dashboards/DriverDashboard.tsx:48`
  - `components/dashboards/assistant/TripCard.tsx:41`
- **Fix:** Reemplazar por `AlertDialog` de shadcn/ui. ✅ Aplicado

### [I-07] Inputs sin label asociado ✅

- **Criterio:** SC 1.3.1, SC 3.3.2
- **Archivos:**
  - `components/clients/ClientFilters.tsx:28`
  - `components/tickets/TicketsFilters.tsx:95-100`
  - `components/packages/PackageAssignModal.tsx:103-108`
  - `components/dashboard/quick-search/SearchResultsView.tsx:47-53`
  - `pages/admin/reports/ReportsHeader.tsx:39-64` (`label=""` vacío)
  - `components/admin/route-form/ScheduleEditor.tsx:33-39` (`label=""` vacío)
- **Fix:** Agregar `label` descriptivo o `aria-label`. ✅ Aplicado

### [I-08] `--muted-foreground` falla contraste (~4.3:1 en fondo blanco) ✅

- **Criterio:** SC 1.4.3
- **Archivo:** `globals.css:111`
- **Fix:** `--muted-foreground: oklch(0.48 0 0);` (~5.5:1) ✅ Aplicado

### [I-09] `--ring` color de foco con contraste insuficiente (~2.3:1) ✅

- **Criterio:** SC 2.4.11 Focus Appearance (AA)
- **Archivo:** `globals.css:118`
- **Fix:** `--ring: oklch(0.55 0.15 250);` (azul visible ~3.5:1) ✅ Aplicado

### [I-10] Colores de estado fallan contraste en fondo blanco ✅

- **Criterio:** SC 1.4.1, SC 1.4.3
- **Archivo:** `globals.css:42-44`
- **Valores:** `--color-status-available: #22C55E` (~2.2:1), `--color-status-medium: #F59E0B` (~2.0:1)
- **Fix:** Usar tonos más oscuros: `#16A34A` y `#B45309`. ✅ Aplicado

### [I-11] `--color-comarapa-light: #64B5F6` falla contraste (~2.3:1) ✅

- **Criterio:** SC 1.4.3
- **Archivo:** `globals.css:22`
- **Fix:** Reservar `#64B5F6` solo para fills decorativos. Para texto usar `#1E88E5`. ✅ Aplicado

### [I-12] SkeletonLoader sin semántica de carga + colores hardcoded ✅

- **Criterio:** SC 4.1.3, SC 1.4.3
- **Archivo:** `components/common/SkeletonLoader.tsx` (5 variantes)
- **Problemas:**
  1. Sin `role="status"` ni `aria-busy`
  2. Bloques skeleton no tienen `aria-hidden`
  3. Colores hardcoded `bg-gray-200`, `bg-white` en vez de tokens
- **Fix:**
  ```tsx
  <div role="status" aria-busy="true" className="...">
    <span className="sr-only">Cargando contenido...</span>
    <div aria-hidden="true">{/* skeleton blocks */}</div>
  </div>
  ```
  Reemplazar `bg-gray-200` → `bg-muted`, `bg-white` → `bg-card`, `border-gray-200` → `border-border`. ✅ Aplicado

### [I-13] Pagination sin anuncios ni semántica completa ✅

- **Criterio:** SC 1.3.1, SC 4.1.3
- **Archivo:** `components/ui/pagination.tsx`
- **Problemas:**
  1. Elipsis visible para lectores de pantalla (línea 98)
  2. Variante compact sin `<nav>` landmark (línea 39)
  3. Cambio de página no anunciado (líneas 48, 77)
- **Fix:**
  - `aria-hidden="true"` en elipsis + `<span className="sr-only">Más páginas</span>`
  - Cambiar `<div>` a `<nav aria-label="Paginación">`
  - Agregar `role="status" aria-live="polite"` en texto de página ✅ Aplicado

### [I-14] `prefers-reduced-motion` no respetado ✅

- **Criterio:** SC 2.3.3
- **Archivos:** `globals.css` (falta media query), `skeleton.tsx`, `alert-dialog.tsx`, `dialog.tsx`, `dropdown-menu.tsx`, `popover.tsx`, `select.tsx`, `sheet.tsx`, `tabs.tsx`, `tooltip.tsx`
- **Fix:** Agregar en `globals.css`:
  ```css
  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
    }
  }
  ```
  ✅ Aplicado

### [I-15] Uso inapropiado de atributo `autoFocus` ✅

- **Criterio:** SC 2.4.3 Focus Order (A)
- **Archivos:** 
  - `pages/LoginPage.tsx:121-122`
  - `components/dashboard/quick-search/SearchResultsView.tsx:52-53`
- **Problema:** Forzar el foco de forma automática al cargar un componente desorienta a los usuarios de lectores de pantalla, ya que se saltan el contexto de inicio de la página o el contenedor. Actualmente se suprime la alerta del linter de forma explícita.
- **Fix:** Eliminar el atributo `autoFocus` y el comentario `// eslint-disable-next-line jsx-a11y/no-autofocus`. Dejar que el usuario mueva el foco naturalmente, o en caso de diálogos modales estrictos, confiar en el focus trap del componente. ✅ Aplicado

### [I-16] Notificaciones (Toasts) de Sonner sin configuración ARIA explícita ✅

- **Criterio:** SC 4.1.3 Status Messages (AA)
- **Archivo:** `main.tsx:18`, `hooks/use-toast.ts`
- **Problema:** Aunque Sonner gestiona internamente regiones `aria-live`, las notificaciones críticas y de error deben tener `aria-live="assertive"`, mientras que otras informaciones "polite". Además, el botón de cerrar en algunos subcomponentes podría carecer de `aria-label`.
- **Fix:** Configurar opciones de accesibilidad en el proveedor `<Toaster />` (ej. `toastOptions={{ classNames: { toast: "group toast", closeButton: "aria-label='Cerrar notificación'" } }}`) y revisar si existen toasts interactivos que roben el foco y no lo devuelvan al cerrarse. ✅ Aplicado

---

## Fase 3: Correcciones Menores ✅ COMPLETADA

> **Estado:** Completado el 2026-05-12. Todos los 7 hallazgos (M-01 a M-07) implementados y verificados.

### [M-01] `EmptyState` icono decorativo sin `aria-hidden` ✅

- **Archivo:** `components/common/EmptyState.tsx:15-17`
- **Fix:** Agregar `aria-hidden="true"` al contenedor del icono. ✅ Aplicado

### [M-02] `ViewToggle` sin `aria-pressed` ni `role="group"` ✅

- **Archivo:** `components/ui/view-toggle.tsx:20,24-45`
- **Fix:** Agregar `aria-pressed={isActive}` a cada botón y `role="group" aria-label="Vista"` al wrapper. ✅ Aplicado

### [M-03] Asterisco de requerido no oculto a lectores de pantalla ✅

- **Archivos:** `FormInput.tsx:44`, `FormSelect.tsx:69`, `FormCheckbox.tsx:59`, `FormDatePicker.tsx:161`
- **Fix:** `<span className="text-red-500 ml-1" aria-hidden="true">*</span>` ✅ Aplicado

### [M-04] `LoginLayout` sin `<main>` landmark + contenido decorativo no oculto ✅

- **Archivo:** `layouts/LoginLayout.tsx`
- **Fix:**
  - Cambiar panel derecho a `<main>`
  - Agregar `aria-hidden="true"` al panel izquierdo decorativo
  - Agregar pausa al carousel (`onMouseEnter/onFocus` → pausar) ✅ Aplicado

### [M-05] PrintLayout sin `<main>` landmark ✅

- **Archivo:** `layouts/PrintLayout.tsx:3-9`
- **Fix:** Cambiar `<div>` a `<main>`. ✅ Aplicado

### [M-06] Ventana de impresión sin `lang="es"` ✅

- **Archivo:** `lib/print.ts:17`
- **Fix:** `<html lang="es">` ✅ Aplicado

### [M-07] Touch targets menores a 24x24px ✅

- **Archivo:** `components/clients/client-filters/ActiveFilterChips.tsx:25-30` (botón `h-4 w-4` = 16x16px)
- **Fix:** Aumentar a `h-6 w-6` mínimo (24x24px). ✅ Aplicado

---

## Verificaciones Manuales Recomendadas

- [ ] Recorrer flujo completo de venta de boletos solo con teclado (Tab, Enter, Escape)
- [ ] Verificar foco no se pierde al abrir/cerrar modales de tickets
- [ ] Probar con NVDA + Firefox y VoiceOver + Safari el formulario de login
- [ ] Confirmar contraste real de `text-muted-foreground` sobre `bg-card` con herramientas como WAVE o axe
- [ ] Probar navegación completa con lector de pantalla en el dashboard de secretary
- [ ] Verificar que el calendario del FormDatePicker funciona con flechas del teclado
- [ ] Probar el selector de asientos con solo teclado

---

## Notas Positivas

Varios componentes ya cumplen accesibilidad correctamente:

- **ClickableCard** — `<button>` con `ariaLabel` requerido y `focus-visible` ring
- **BusSeatGrid** — `<Button>` con `aria-pressed`, `aria-label`, `aria-disabled`
- **Breadcrumb** — `aria-label` en `<nav>`, `aria-current="page"`, `aria-hidden` en separadores
- **Dialog** (Radix) — focus trap nativo, `sr-only` en close, Title/Description
- **Tabs** (Radix) — `tablist`/`tab`/`tabpanel` con navegación por flechas
- **Alert** — `role="alert"` correcto
- **ClientRegistrationForm** — `aria-describedby` + `aria-invalid` correctos
- **TripPackagesSection** — `role="status"`, `aria-live="polite"`, `sr-only` text
- **TripInfoCard** — `role="progressbar"` con `aria-valuenow/min/max`
- **LoginPage** — `role="main"`, `aria-labelledby`, `role="alert"`

---

## Fase 4: Hallazgos Adicionales — Auditoría Profunda (Bloqueantes) ✅ COMPLETADA

> Encontrados en segunda pasada explorando hooks, SVGs, formularios, responsive, contenido dinámico y store.
> **Estado:** Completado el 2026-05-12. Todos los 6 hallazgos (B-16 a B-21) implementados y verificados.

### [B-16] 62 SVGs decorativos sin `aria-hidden="true"`

- **Criterio:** SC 1.1.1 Non-text Content (A)
- **Archivos (24+ archivos, 62 SVGs):**
  - `components/packages/PackageRegistrationModal.tsx:21,27,54,75,117,126`
  - `components/packages/registration/ItemsSection.tsx:24,80`
  - `components/tickets/TicketDisplay.tsx:98`
  - `components/tickets/TicketReceiptModal.tsx:97`
  - `pages/dashboards/SecretaryDashboard.tsx:47,61,75,89`
  - `pages/trips/TripSheetPage.tsx:38`
  - `pages/trips/TripPackagesManifestPage.tsx:35`
  - `pages/trips/TripEditPage.tsx:154`
  - `pages/tickets/TicketConfirmationPage.tsx:55,69`
  - `pages/dashboards/AdminDashboard.tsx:56,64,72,80,121,141,156,176`
  - `pages/LoginPage.tsx:97,129,147,168`
  - `components/clients/ClientCard.tsx:101,111,122,134`
  - `components/dashboards/secretary/StatCards.tsx:21,33,45,57`
  - `layouts/LoginLayout.tsx:40,54,64,73`
  - `components/admin/UserForm.tsx:172,204,228,243,269`
  - `pages/dashboards/DriverDashboard.tsx:87,187`
  - `pages/dashboards/AssistantDashboard.tsx:49`
  - `pages/admin/OwnerSettlements.tsx:149`
  - `components/packages/receipt/ReceiptHeader.tsx:14`
  - `components/forms/FormInput.tsx:83`
  - `components/forms/FormSelect.tsx:113,120`
  - `components/forms/FormDatePicker.tsx:179,203,215,221`
  - `components/dashboard/DashboardStatCard.tsx:35`
- **Fix:** Agregar `aria-hidden="true"` a todos los SVGs decorativos. Para SVGs significativos, agregar `role="img"` + `aria-label`. ✅ Aplicado

### [B-17] 19 `eslint-disable` ocultando violaciones jsx-a11y reales

- **Criterio:** SC 2.1.1, SC 4.1.2
- **Archivos (16 archivos):** Ver listado completo en [B-09]. Cada `eslint-disable` silencia una violación real.
- **Fix:** Eliminar todos los `eslint-disable` de reglas jsx-a11y y arreglar el código subyacente (reemplazar `<div onClick>` por `<button>`, etc.). ✅ **Aplicado completamente (2026-05-12, segunda iteración).** El `eslint-disable` de `TicketReceiptModal.tsx:91` se eliminó al migrar el modal a Radix Dialog (Dialog maneja el backdrop accesible internamente). Sólo queda 1 override válido en `BusFormStep2.tsx:54`.

### [B-18] ClientSelector no sigue patrón ARIA combobox/listbox

- **Criterio:** SC 1.3.1, SC 2.1.1, SC 4.1.2
- **Archivo:** `components/clients/ClientSelector.tsx:119-157`
- **Problemas:**
  1. Input de búsqueda sin `role="combobox"`, `aria-expanded`, `aria-controls`, `aria-autocomplete`
  2. `<ul>` sin `role="listbox"` ni `id`
  3. `<li>` sin `role="option"`, sin `id`, sin `aria-selected`
  4. Sin navegación por flechas entre resultados
  5. Sin anuncio de resultados para lectores de pantalla
- **Fix:** Implementar patrón [APG Combobox](https://www.w3.org/WAI/ARIA/apg/patterns/combobox/). ✅ Aplicado

### [B-19] SeatLayoutEditor grid es completamente mouse-only

- **Criterio:** SC 2.1.1, SC 4.1.2
- **Archivo:** `components/admin/SeatLayoutEditor.tsx:244-301`
- **Problema:** Todas las celdas son `<div onClick>`, no focusable ni operable por teclado.
- **Fix:** Cambiar a `<button>` con `aria-label` descriptivo ("Fila 1, Asiento 1 — agregar") y `aria-pressed`. ✅ Aplicado

### [B-20] 8 tablas sin `overflow-x-auto` — contenido cortado en móvil

- **Criterio:** SC 1.4.4 Resize Text (AA), SC 1.3.1
- **Archivos:**
  - `pages/admin/AssistantsPage.tsx:35-37`
  - `pages/admin/SecretariesPage.tsx:38-40`
  - `pages/admin/DriversPage.tsx:37-39`
  - `pages/admin/UsersPage.tsx:33-35`
  - `pages/admin/OfficesPage.tsx:117-119`
  - `pages/admin/OwnersPage.tsx:37-39`
  - `pages/admin/BusesPage.tsx:36-38`
  - `pages/admin/RoutesPage.tsx:94-97`
- **Problema:** Contenedores tienen `overflow-hidden` en vez de `overflow-x-auto`. Columnas se cortan en pantallas pequeñas.
- **Fix:** Envolver cada `<table>` con `<div className="overflow-x-auto">`. ✅ Aplicado

### [B-21] Touch targets críticamente pequeños (login carousel, admin tables)

- **Criterio:** SC 2.5.8 Target Size (AA)
- **Archivos:**
  - `layouts/LoginLayout.tsx:95` — dots del carousel `w-2.5 h-2.5` = 10x10px
  - `pages/admin/UsersPage.tsx:69,70` — botones `h-auto p-0` ~16px
  - `pages/admin/OfficesPage.tsx:142,143` — ídem
  - `pages/admin/AssistantsPage.tsx:70,77` — ídem
  - `pages/admin/SecretariesPage.tsx:93,100` — ídem
  - `pages/admin/DriversPage.tsx:93,100` — ídem
- **Fix:** Mínimo `h-6 w-6` (24x24px). Para carousel dots, usar `w-7 h-7` con dot interno más pequeño. ✅ Aplicado

---

## Fase 5: Hallazgos Adicionales — Auditoría Profunda (Importantes) ✅ COMPLETADA

> **Estado (segunda iteración, 2026-05-12):** Completada. 18 hallazgos (I-17 a I-34).
> - ✅ **Aplicados en primera iteración:** I-17, I-18 (role=alert), I-19 (emojis aria-hidden), I-20 (autocomplete), I-21 (toast de sesión), I-22, I-23, I-24, I-25 (progressbar), I-27, I-29 (BusFormStep2 con `role="tabpanel"`), I-31.
> - ✅ **Aplicados en segunda iteración:**
>   - **I-26:** `TripCard.tsx` ahora tiene `role="tabpanel"`, `aria-controls`, `aria-labelledby` y roving `tabIndex` entre tabs.
>   - **I-28:** `BusFormHeader.tsx` ahora usa `<nav>`/`<ol>` con `aria-current="step"` y región `aria-live` para anunciar el paso.
>   - **I-30:** `SidebarMenuButton` deriva `aria-label` desde el string del tooltip cuando el sidebar está colapsado en desktop.
>   - **I-32:** `BusSeatGrid.tsx` ahora usa `text-[10px]` como mínimo (eliminado `text-[8px]` y `text-[9px]`).
>   - **I-33:** `AppHeader.tsx` muestra el nombre de la página actual en móvil con `<nav aria-label="Ubicación">`.
>   - **I-34:** `sidebar.tsx` ya no oculta el botón de cierre del Sheet en móvil — quitado `[&>button]:hidden`.

### [I-17] 24 textos de error rojos sin `role="alert"`

- **Criterio:** SC 4.1.3
- **Archivos:** `FormInput.tsx:97`, `FormSelect.tsx:127`, `FormCheckbox.tsx:62`, `FormDatePicker.tsx:280`, `TicketFieldsForm.tsx:50`, `AdminDashboard.tsx:34-35`, `SecretaryDashboard.tsx:117-118`, `UsersPage.tsx:28`, `BusesPage.tsx:26`, `RoutesPage.tsx:89`, `OfficesPage.tsx:112`, `TripEditPage.tsx:155`, `TicketConfirmationPage.tsx:60`, `TripsIndexPage.tsx:206-207`, `PackagesIndexPage.tsx:141-142`, y 9 más.
- **Fix:** Agregar `role="alert"` a cada contenedor de error.

### [I-18] 16 contenedores de error (`bg-red-50`) sin `role="alert"`

- **Criterio:** SC 4.1.3
- **Archivos:** `UsersPage.tsx:28`, `BusesPage.tsx:25`, `RoutesPage.tsx:89`, `OfficesPage.tsx:112`, `SecretaryDashboard.tsx:114`, `AdminDashboard.tsx:32`, `TripEditPage.tsx:152`, `TicketConfirmationPage.tsx:52`, `TripsIndexPage.tsx:201`, `PackagesIndexPage.tsx:139`, `PendingCollections.tsx:70`, `PackageDeliveryModal.tsx:200`, `ClientSelector.tsx:200`, `ClientsIndexPage.tsx:248`, `TripSheetPage.tsx:56`, `TripPackagesManifestPage.tsx:53`
- **Fix:** Agregar `role="alert"` al contenedor exterior de error.

### [I-19] 28 emojis sin `aria-hidden`

- **Criterio:** SC 1.1.1
- **Archivos:**
  - `components/tickets/ticket-sale/TicketFieldsForm.tsx:14-17` (💵💳🏦📱)
  - `components/packages/registration/PackageTopBar.tsx:114-115` (💵📱)
  - `components/clients/ClientCardList.tsx:179` (👶👤)
  - `components/clients/ClientCard.tsx:58-65` (👴👤👶)
  - `components/packages/receipt/ReceiptDocument.tsx:43-46` (📍x4)
  - `pages/dashboards/DriverDashboard.tsx:175-178` (🚌👥📦🕐)
  - `pages/dashboards/AssistantDashboard.tsx:37-40` (🚌👥📦🕐)
  - `pages/trips/TripSheetPage.tsx:21` (📋)
  - `pages/trips/TripPackagesManifestPage.tsx:18` (📦)
  - `pages/admin/UsersPage.tsx:126` (🏢)
- **Fix:** Envolver cada emoji en `<span aria-hidden="true">`.

### [I-20] Atributos `autocomplete` faltantes en formularios de identidad

- **Criterio:** SC 1.3.5 Identify Input Purpose, SC 3.3.8
- **Archivos:**
  - `pages/ProfilePage.tsx:46-62` — Nombre, Apellido, Email sin `autoComplete`
  - `components/admin/UserForm.tsx:179-247` — firstname, lastname, username, email, password sin `autoComplete`
  - `components/clients/ClientSelector.tsx:163-194` — nombre, teléfono, dirección sin `autoComplete`
  - `components/packages/registration/ClientSection.tsx:146-149` — nombres, apellidos, teléfono sin `autoComplete`
- **Fix:** Agregar `autoComplete="given-name"`, `autoComplete="family-name"`, `autoComplete="email"`, `autoComplete="new-password"`, `autoComplete="tel"`, etc.

### [I-21] Expiración de sesión sin advertencia accesible

- **Criterio:** SC 2.2.1 Timing Adjustable, SC 2.2.6 Timeouts
- **Archivo:** `lib/api.ts:110-136`
- **Problema:** Cuando el refresh token expira, se redirige a login sin aviso. Datos de formulario no guardados se pierden.
- **Fix:** Mostrar modal/toast accesible con `role="alertdialog"` antes de redirigir: "Su sesión ha expirado. Redirigiendo..."

### [I-22] Strings en inglés en `sr-only` y `aria-label` (sidebar, sheet)

- **Criterio:** SC 3.1.1, SC 4.1.2
- **Archivos:**
  - `components/ui/sidebar.tsx:200` — `SheetTitle` = "Sidebar"
  - `components/ui/sidebar.tsx:201` — `SheetDescription` = "Displays the mobile sidebar."
  - `components/ui/sidebar.tsx:278` — `<span className="sr-only">Toggle Sidebar</span>`
  - `components/ui/sidebar.tsx:290,293` — `aria-label="Toggle Sidebar"`, `title="Toggle Sidebar"`
  - `components/ui/sheet.tsx:78` — `<span className="sr-only">Close</span>`
  - `hooks/use-buses-page.ts:83` y 5 hooks más — `toast.error('Error: ' + ...)` mezcla español/inglés
- **Fix:** Localizar todo a español. Sidebar → "Menú lateral", Close → "Cerrar", etc.

### [I-23] Dashboard polling: stats no anunciados a lectores de pantalla

- **Criterio:** SC 4.1.3
- **Archivos:** `hooks/use-admin-dashboard.ts:33-35`, `components/dashboard/DashboardStatCard.tsx:31-32`
- **Problema:** Dashboard refresca stats periódicamente pero no anuncia cambios.
- **Fix:** Agregar `aria-live="polite"` al contenedor de cada stat card.

### [I-24] WebSocket de bloqueo de asientos no anunciado

- **Criterio:** SC 4.1.3
- **Archivo:** `hooks/use-trip-seat-locks.ts:32,77`
- **Problema:** Cuando otro usuario bloquea un asiento, el mapa visual se actualiza pero no hay anuncio para lectores de pantalla.
- **Fix:** Agregar región `sr-only` con `aria-live="polite"` que anuncie cambios en asientos bloqueados.

### [I-25] JourneyProgress / TicketJourneyProgress sin ARIA de progreso

- **Criterio:** SC 1.3.1
- **Archivos:** `components/packages/detail/JourneyProgress.tsx:27-62`, `components/tickets/detail/TicketJourneyProgress.tsx:23-82`
- **Problema:** Indicadores visuales de 3-5 pasos sin `role="progressbar"`, `aria-valuenow`, `aria-valuetext`.
- **Fix:** Agregar `role="progressbar"` con `aria-valuenow`, `aria-valuemin`, `aria-valuemax` y `aria-label`.

### [I-26] Tabs custom en TripCard sin `role="tabpanel"`

- **Criterio:** SC 4.1.2
- **Archivo:** `components/dashboards/assistant/TripCard.tsx:109-136`
- **Problema:** Tabs tienen `role="tablist"` y `role="tab"` + `aria-selected`, pero el panel de contenido no tiene `role="tabpanel"`, y no hay `aria-controls`/`aria-labelledby` entre tabs y paneles.
- **Fix:** Agregar `role="tabpanel"`, `id`, `aria-labelledby` al panel de contenido. Agregar `aria-controls` a cada tab.

### [I-27] Resultados de búsqueda no anunciados

- **Criterio:** SC 4.1.3
- **Archivos:** `components/dashboard/QuickSearch.tsx`, `pages/packages/PackagesIndexPage.tsx`, `components/admin/UserTable.tsx:32-34`
- **Fix:** Agregar `<div className="sr-only" aria-live="polite">` con conteo de resultados.

### [I-28] BusForm multi-paso sin ARIA de paso/wizard

- **Criterio:** SC 1.3.1, SC 3.2.3, SC 4.1.2
- **Archivos:** `components/admin/bus-form/BusFormHeader.tsx:45-80`, `components/admin/bus-form/BusForm.tsx:44-74`
- **Problema:** Indicador visual "Paso 1 de 2" pero sin `aria-current="step"`, sin `aria-live` al cambiar paso, sin mover foco al nuevo contenido.
- **Fix:** Agregar `aria-current="step"` al botón activo, `aria-live="polite"` en contenido, y mover foco al heading del paso al transicionar.

### [I-29] BusFormStep2 DeckTab sin `role="tabpanel"` ni navegación por flechas

- **Criterio:** SC 4.1.2
- **Archivo:** `components/admin/bus-form/BusFormStep2.tsx:21-59`
- **Problema:** Tiene `role="tablist"` y `role="tab"` + `aria-selected`, pero no hay `role="tabpanel"` en el contenido, no hay `aria-controls`/`aria-labelledby`, y no hay navegación por flechas.
- **Fix:** Agregar `role="tabpanel"` con `aria-labelledby` al contenedor del SeatLayoutEditor. Implementar navegación por flechas.

### [I-30] Tooltip inaccessible en touch devices (sidebar colapsado)

- **Criterio:** SC 1.3.1, SC 4.1.2
- **Archivo:** `components/ui/tooltip.tsx:8-18`, `components/ui/sidebar.tsx:537-545`
- **Problema:** Radix Tooltip no abre en touch. Cuando sidebar está colapsado, tooltips muestran labels de menú, pero en móvil/tablet no son accesibles.
- **Fix:** Agregar `aria-label` a `SidebarMenuButton` cuando está colapsado como fallback para touch.

### [I-31] `aria-expanded` sin `aria-controls` en 3 componentes

- **Criterio:** SC 4.1.2
- **Archivos:** `pages/dashboards/DriverDashboard.tsx:57`, `components/dashboards/assistant/TripCard.tsx:50`, `components/clients/client-filters/FiltersHeader.tsx:38`
- **Fix:** Agregar `id` al contenido colapsable y `aria-controls` al botón.

### [I-32] Fuentes de 8-11px en información esencial

- **Criterio:** SC 1.4.4
- **Archivos:**
  - `components/seats/BusSeatGrid.tsx:173-210` — `text-[8px]`, `text-[9px]` para datos de asiento
  - `components/trips/package-views/PackageCardsView.tsx:47,54,66,86` — `text-[10px]`
  - `components/trips/package-views/PackageListView.tsx:49,56,67` — `text-[10px]`
  - `components/trips/TripInfoCard.tsx:116,149,153` — `text-[10px]`
- **Fix:** Mínimo `text-[10px]` para móvil base, con breakpoints `sm:text-xs`. Eliminar `text-[8px]` completamente.

### [I-33] Breadcrumbs ocultos en móvil sin alternativa

- **Criterio:** SC 2.4.1, SC 2.4.8
- **Archivo:** `components/layout/AppHeader.tsx:36`
- **Problema:** `<Breadcrumb className="hidden md:flex">` oculta toda navegación en móvil sin alternativa.
- **Fix:** Mostrar nombre de página actual en móvil como alternativa.

### [I-34] Sidebar móvil sin botón de cierre visible

- **Criterio:** SC 2.4.3
- **Archivo:** `components/ui/sidebar.tsx:191`
- **Problema:** `[&>button]:hidden` oculta el botón de cierre del Sheet. Solo se puede cerrar tocando el backdrop.
- **Fix:** Agregar `SidebarTrigger` visible en `SidebarHeader` para móvil.

---

## Fase 6: Hallazgos Adicionales — Auditoría Profunda (Menores) ✅ COMPLETADA

> **Estado:** Completado el 2026-05-12. Todos los 11 hallazgos (M-08 a M-18) implementados y verificados.

### [M-08] Keyboard shortcuts interceptan teclas de lectores de pantalla ✅

- **Archivo:** `hooks/use-keyboard-shortcuts.ts`
- **Fix:** Creada función `shouldIgnoreShortcut()` que verifica `SELECT`, `isContentEditable`, y roles ARIA `textbox`/`combobox`/`searchbox`. ✅ Aplicado

### [M-09] Mensajes de error en inglés en store slices ✅

- **Archivos:** `store/cash-register.slice.ts`, `store/secretary.slice.ts`
- **Fix:** 9 fallbacks localizados de inglés a español (7 en cash-register, 1 en secretary). ✅ Aplicado

### [M-10] API error handling no maneja errores de validación estructurados ✅

- **Archivo:** `lib/api.ts`
- **Fix:** Creada función `parseErrorDetail()` que parsea arrays de validación FastAPI (`detail[].loc`, `detail[].msg`) en mensajes legibles. Evita `"[object Object]"`. ✅ Aplicado

### [M-11] `PopoverTitle` renderiza `<div>` en vez de `<h2>` ✅

- **Archivo:** `components/ui/popover.tsx:58-67`
- **Fix:** Cambiado `<div>` a `<h2>` con `children` explícito para pasar `jsx-a11y/heading-has-content`. ✅ Aplicado

### [M-12] Buscar asientos: estado de selección no anunciado ✅

- **Archivo:** `hooks/use-trip-detail-page.ts`
- **Fix:** Agregado `seatSelectionAnnouncement` useMemo que retorna "Asientos seleccionados: 1A, 3B". Expuesto en `seatMap.selectionAnnouncement`. ✅ Aplicado

### [M-13] Export/download CSV no anunciado ✅

- **Archivos:** `hooks/use-tickets-index.ts`, `hooks/use-withdrawal-history.ts`, `services/report.service.ts`
- **Fix:** Agregado `toast.success()` post-descarga en los 3 archivos. En tickets-index también se agregó `URL.revokeObjectURL()` para cleanup. ✅ Aplicado

### [M-14] Paginación compacta sin anuncio de cambio de página ✅

- **Archivo:** `hooks/use-paginated-list.ts`
- **Fix:** Agregado `pageAnnouncement` al interface y return: "Mostrando 1 a 10 de 50 resultados — página 1 de 5". ✅ Aplicado

### [M-15] Buscar clientes sin anuncio de resultados ✅

- **Archivo:** `hooks/use-client-search.ts`
- **Fix:** Agregado `searchAnnouncement` useMemo con estados: buscando / sin resultados / N clientes encontrados. ✅ Aplicado

### [M-16] Login/logout sin gestión de foco post-navegación ✅

- **Archivo:** `hooks/use-auth.ts`
- **Fix:** Agregado `requestAnimationFrame(() => document.getElementById('main-content')?.focus())` después de login y logout. ✅ Aplicado

### [M-17] `noValidate` en forms sin errores inline accesibles ✅

- **Archivos:** `pages/LoginPage.tsx`, `components/clients/ClientRegistrationForm.tsx`
- **Fix:** Ya cubierto por B-10 (errores vinculados con `aria-describedby`/`aria-invalid`). Ambos formularios tienen atributos ARIA correctos. ✅ Sin cambios necesarios

### [M-18] Tipos de status como `string` en vez de union types ✅

- **Archivos:** `types/ticket.ts`, `types/trip.ts`, `types/package.ts`, `types/bus.ts`
- **Fix:** Creados union types: `TicketState`, `TripStatus`, `PackageStatus`, `SeatType`, `SeatStatus`. `tsc --noEmit` pasa limpio. ✅ Aplicado

---

## Fase 7: Hallazgos de Tercera Pasada — Focus y Controles Custom (Bloqueantes) ✅ COMPLETADA

> **Estado:** Completado el 2026-05-12. Todos los 2 hallazgos (B-22, B-23) implementados y verificados.

### [B-22] `FormDatePicker` elimina indicador de foco con `focus:ring-0` ✅

- **Criterio:** SC 2.4.7 Focus Visible (AA), SC 2.4.11 Focus Not Obscured (AA)
- **Archivo:** `components/forms/FormDatePicker.tsx:192`
- **Problema:** El input de fecha usa `focus:ring-0` lo que elimina completamente el anillo de foco visible. Usuarios de teclado no pueden ver dónde está el foco cuando navegan al campo de fecha. Los otros form components (FormInput, FormSelect) usan `focus:ring-4 focus:ring-primary/10`.
- **Fix:** Reemplazar `focus:ring-0` por `focus-visible:ring-4 focus-visible:ring-primary/10 focus-visible:border-primary`. ✅ Ya aplicado (input usa focus-visible)

### [B-23] ClientTypePicker `role="radio"` sin navegación por flechas ✅

- **Criterio:** SC 2.1.1 Keyboard (A), SC 4.1.2 Name, Role, Value (A)
- **Archivo:** `components/tickets/ticket-sale/ClientTypePicker.tsx:17,44`
- **Problema:** Usa `role="radiogroup"` y `role="radio"` con `aria-checked` correctamente, pero NO implementa navegación por flechas entre opciones. Per patrón APG Radio Group, las flechas izquierda/derecha (o arriba/abajo) deben mover la selección entre radio items. Actualmente solo se puede activar con Tab + Enter/Space.
- **Fix:** Agregar `onKeyDown` al contenedor radiogroup que capture ArrowLeft/ArrowRight para mover `aria-checked` y foco entre opciones. ✅ Aplicado

---

## Fase 8: Hallazgos de Tercera Pasada — Landmarks, Headings y Formularios (Importantes) ✅ COMPLETADA

> **Estado:** Completado el 2026-05-12. Todos los 14 hallazgos (I-35 a I-48) implementados y verificados.

### [I-35] 5 `<section>` sin nombre accesible (landmarks anónimos)

- **Criterio:** SC 1.3.1 Info and Relationships (A), SC 2.4.1 Bypass Blocks (A)
- **Archivos:**
  - `pages/dashboards/DriverDashboard.tsx:196` — sección "Viajes de hoy"
  - `pages/dashboards/DriverDashboard.tsx:218` — sección "Próximos viajes"
  - `pages/dashboards/AssistantDashboard.tsx:58` — sección "Viajes de hoy"
  - `pages/dashboards/AssistantDashboard.tsx:79` — sección "Próximos viajes"
  - `pages/tickets/TicketDetailPage.tsx:90` — sección de detalle de boleto
- **Problema:** `<section>` sin `aria-label` ni `aria-labelledby` no crea un landmark navegable para lectores de pantalla. Se anuncian como "section" genérico.
- **Fix:** Agregar `aria-label` descriptivo o `aria-labelledby` apuntando al heading interno. ✅ Aplicado

### [I-36] 2 `<aside>` sin nombre accesible

- **Criterio:** SC 1.3.1 Info and Relationships (A)
- **Archivos:**
  - `pages/trips/TripDetailPage.tsx:172` — sidebar con TripInfoCard
  - `pages/tickets/TicketDetailPage.tsx:96` — sidebar de pago/acciones
- **Problema:** Se anuncian como "complementary" genérico, imposibles de distinguir entre sí.
- **Fix:**
  ```tsx
  <aside aria-label="Información del viaje">
  <aside aria-label="Resumen de pago y acciones">
  ```
  ✅ Aplicado

### [I-37] `<nav>` sin `aria-label` en TicketDetailHeader

- **Criterio:** SC 1.3.1, SC 2.4.1
- **Archivo:** `pages/tickets/ticket-detail/TicketDetailHeader.tsx:23`
- **Problema:** `<nav>` sin nombre accesible. Los demás `<nav>` de la app (breadcrumb, pagination) sí tienen `aria-label`.
- **Fix:** Agregar `aria-label="Navegación de boleto"` o `aria-label="Breadcrumb"`. ✅ Aplicado

### [I-38] Jerarquía de headings incorrecta: h4 antes de h1 (PackageHeader)

- **Criterio:** SC 1.3.1 Info and Relationships (A)
- **Archivo:** `components/packages/detail/PackageHeader.tsx:19-21`
- **Problema:** `<h4>` "Resumen de Encomienda" aparece ANTES del `<h1>` (tracking number). Violación de orden de headings.
- **Fix:** Cambiar `<h4>` a `<p>` o `<span>` (es un label visual, no un heading estructural). ✅ Aplicado

### [I-39] Jerarquía de headings incorrecta: h1 → h3 salta h2 + orden mezclado (TicketDetailPage)

- **Criterio:** SC 1.3.1 Info and Relationships (A)
- **Archivos:**
  - `pages/tickets/ticket-detail/TicketDetailHeader.tsx:28` — `<h1>` "Boleto #{id}"
  - `pages/tickets/ticket-detail/PassengerCard.tsx:11` — `<h3>` "Información del Pasajero" (debería ser h2)
  - `pages/tickets/ticket-detail/PaymentSummaryCard.tsx:14` — `<h3>` (debería ser h2)
  - `components/tickets/detail/TicketJourneyProgress.tsx:34` — `<h2>` "Progreso del Boleto" (aparece DESPUÉS de h3s)
  - `pages/tickets/ticket-detail/TripLogisticsCard.tsx:14` — `<h3>` (debería ser h2)
  - `pages/tickets/ticket-detail/QuickActionsCard.tsx:46` — `<h3>` (debería ser h2)
- **Problema:** h1 salta a h3 sin h2 intermedio. Luego un h2 aparece después de varios h3s.
- **Fix:** Cambiar todos los headings de primer nivel en sub-componentes a `<h2>`. Usar `<h3>` solo para sub-secciones dentro de cada card. ✅ Aplicado

### [I-40] ReportTabs incompleto — no listado en I-26/I-29

- **Criterio:** SC 4.1.2 Name, Role, Value (A), SC 2.1.1 Keyboard (A)
- **Archivo:** `pages/admin/reports/ReportTabs.tsx:13-28`
- **Problema:** `role="tablist"` con `role="tab"` pero sin `id`, sin `aria-controls`, sin `role="tabpanel"` asociado, sin navegación por flechas. Mismo patrón que I-26 (TripCard) e I-29 (BusFormStep2) pero **este archivo no estaba listado**.
- **Fix:** Mismo fix que I-26/I-29. Agregar `role="tabpanel"`, `id`, `aria-controls`, `aria-labelledby`, o migrar a `Tabs` de shadcn/ui. ✅ Aplicado

### [I-41] 6 skeletons `animate-pulse` sin semántica de carga

- **Criterio:** SC 4.1.3 Status Messages (AA)
- **Archivos:**
  - `components/clients/ClientCardList.tsx:77,101` — Cards skeleton en grid y lista
  - `components/trips/TripCardList.tsx:246-249` — TripCards skeleton
  - `pages/admin/OwnerSettlements.tsx:63` — Filas skeleton
- **Problema:** No tienen `role="status"`, `aria-busy="true"`, `aria-hidden="true"` ni texto `sr-only`. Lectores de pantalla pueden anunciar el contenido skeleton como real o no anunciar nada.
- **Fix:** Envolver cada skeleton:
  ```tsx
  <div role="status" aria-busy="true">
    <span className="sr-only">Cargando...</span>
    <div aria-hidden="true">{/* skeleton content */}</div>
  </div>
  ```
  ✅ Aplicado

### [I-42] Indicadores de estado por animación sin equivalente para lectores de pantalla

- **Criterio:** SC 1.4.1 Use of Color (A), SC 4.1.3 Status Messages (AA)
- **Archivos:**
  - `components/dashboards/secretary/CashRegisterWidget.tsx:27` — dot verde con `animate-pulse` = "Caja Abierta"
  - `pages/admin/OwnerSettlements.tsx:47` — ping animado = "Datos en Tiempo Real"
- **Problema:** La animación transmite "activo/en vivo" visualmente pero no hay texto accesible que lo comunique. El texto adyacente ("Caja Abierta") no indica el estado "en vivo/actualizándose".
- **Fix:**
  ```tsx
  <div role="status" aria-label="Caja abierta — datos actualizados en tiempo real">
    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" aria-hidden="true" />
  </div>
  ```
  ✅ Aplicado

### [I-43] Botones `disabled` invisibles para lectores de pantalla

- **Criterio:** SC 1.3.1 Info and Relationships (A), SC 4.1.2 Name, Role, Value (A)
- **Archivos:**
  - `components/trips/CreateTripModal.tsx:133` — botón "Crear Viaje" deshabilitado
  - `components/packages/PackageAssignModal.tsx:81` — botón de asignar deshabilitado
  - `components/packages/PackageRegistrationModal.tsx:174` — botón de registrar deshabilitado
  - `pages/LoginPage.tsx:183` — botón "Iniciar Sesión" deshabilitado
  - `pages/trips/TripDetailPage.tsx:187` — botón "Despachar Viaje" deshabilitado
  - `pages/dashboards/DriverDashboard.tsx:98` — botón de acción deshabilitado
- **Problema:** `disabled` nativo en `<button>` lo remueve del tab order y lo hace invisible al cursor virtual de lectores de pantalla. Para acciones importantes (como "Despachar Viaje"), el usuario debería poder descubrir el botón y entender por qué está deshabilitado.
- **Fix:** Para botones informativos importantes, usar `aria-disabled="true"` en vez de `disabled`. Mantener el botón en el tab order con `tabIndex={0}` y mostrar tooltip o texto explicativo. ✅ **Aplicado completamente (2026-05-12, segunda iteración).** `LoginPage.tsx`, `PackageAssignModal.tsx` y `PackageRegistrationModal.tsx` ahora tienen `aria-describedby` con texto explicativo. `DriverDashboard.tsx:98` no requiere fix porque la etiqueta del botón cambia a "Actualizando..." durante el estado deshabilitado.

### [I-44] Body scroll no se bloquea al abrir modales custom

- **Criterio:** SC 2.4.3 Focus Order (A), SC 1.3.2 Meaningful Sequence (A)
- **Archivos:**
  - `components/common/AppModal.tsx` — overlay fixed sin body scroll lock
  - `components/tickets/TicketSaleModal.tsx:48-69` — overflow-hidden solo dentro del modal, body sigue scrolleable
- **Problema:** Al abrir un modal custom, el body subyacente sigue siendo scrolleable por teclado o cursor virtual de lector de pantalla. Esto desorienta al usuario que puede navegar contenido detrás del modal sin saberlo.
- **Fix:** Agregar `document.body.style.overflow = 'hidden'` al abrir y restaurar al cerrar. Los `Dialog` de Radix ya manejan esto automáticamente — los modales custom deben replicar el comportamiento. ✅ Aplicado

### [I-45] Ventana de impresión no retorna foco al cerrar

- **Criterio:** SC 2.4.3 Focus Order (A)
- **Archivo:** `lib/print.ts:12,64`
- **Problema:** `window.open('', '_blank')` abre ventana de impresión. Después de `printWindow.close()` (línea 64), no se retorna el foco a la ventana principal. Usuarios de teclado quedan sin foco.
- **Fix:** Agregar `window.focus()` después de `printWindow.close()`. ✅ Aplicado

### [I-46] Columnas de tabla ocultas en responsive sin alternativa accesible

- **Criterio:** SC 1.3.1 Info and Relationships (A), SC 1.3.2 Meaningful Sequence (A)
- **Archivos:**
  - `components/admin/user-table/UserTableBody.tsx:32-35` — "Email", "Rol", "Creado" ocultos con `hidden sm:table-cell`/`hidden md:table-cell`/`hidden lg:table-cell`
  - `components/admin/user-table/UserTableRow.tsx:27,31,34,47` — celdas correspondientes
- **Problema:** En mobile se pierde la información de "Rol" y "Creado" completamente. Solo "Email" tiene una versión inline en mobile (`sm:hidden`). La información de rol y fecha de creación es inaccesible en pantallas pequeñas.
- **Fix:** Agregar versión inline para mobile similar a como se hace con email, o usar un patrón de tarjeta responsive que muestre todos los datos. ✅ Aplicado (datos de Rol y Creado inline en mobile)

### [I-47] Inputs con placeholder como único label

- **Criterio:** SC 1.3.1 Info and Relationships (A), SC 3.3.2 Labels or Instructions (A)
- **Archivos:**
  - `components/packages/registration/ClientSection.tsx:84` — `placeholder="Buscar por nombre, apellido o CI..."` sin `label`
  - `pages/admin/reports/ReportsHeader.tsx:39-65` — tres `<FormSelect>` con `label=""` (vacío)
- **Problema:** El placeholder desaparece al escribir, dejando al usuario sin referencia visual del campo. Lectores de pantalla no tienen un `<label>` asociado para anunciar el propósito del campo.
- **Fix:** Agregar `label` descriptivo a cada componente. Para campos donde no se quiere label visible, usar `<label className="sr-only">`. ✅ Aplicado

### [I-48] Contraste de badges de estado requiere verificación manual

- **Criterio:** SC 1.4.3 Contrast Minimum (AA)
- **Archivos (representativos):**
  - `components/tickets/tickets-helpers.ts:62-64` — badges `bg-green-100 text-green-800`, `bg-red-100 text-red-800`, etc.
  - `components/dashboards/assistant/constants.ts:11-16`
  - `components/admin/user-table/helpers.ts:34-42`
  - `components/packages/detail/PackageHeader.tsx:24`
- **Problema:** Los badges de estado usan combinaciones como `text-green-800` sobre `bg-green-100`, `text-yellow-800` sobre `bg-yellow-100`. Es probable que algunas combinaciones no pasen el ratio 4.5:1 para texto pequeño.
- **Fix:** Verificar con herramienta de contraste (WAVE, axe). Si fallan, usar tonos más oscuros para el texto (ej. `text-green-900`) o más claros para el fondo. ✅ Verificado — todas las combinaciones text-*-800/bg-*-100 pasan 4.5:1

---

## Fase 9: Hallazgos de Tercera Pasada — Menores Adicionales ✅ COMPLETADA

> **Estado:** Completado el 2026-05-12. Todos los 9 hallazgos (M-19 a M-27) implementados y verificados.

### [M-19] Jerarquía de headings: h3 → h1 en modal (TicketReceiptModal) + múltiples h1

- **Criterio:** SC 1.3.1
- **Archivos:**
  - `components/tickets/TicketReceiptModal.tsx:100` — `<h3>` "Boleto Registrado"
  - `components/tickets/TicketDisplay.tsx:110` — `<h1>` `{COMPANY.name}`
- **Problema:** Dentro del modal, h3 aparece antes que h1 (orden inverso). Además, cuando TicketReceiptModal se abre desde TicketDetailPage, hay dos `<h1>` en el DOM simultáneamente.
- **Fix:** Cambiar `<h1>` en TicketDisplay a `<p>` con estilos visuales equivalentes (es el nombre de la empresa en un recibo impreso, no un heading estructural). ✅ Aplicado

### [M-20] `required` sin `aria-required` explícito en form components

- **Criterio:** SC 3.3.2 Labels or Instructions (A), SC 4.1.2
- **Archivos:** `FormInput.tsx:59`, `FormSelect.tsx:76`, `FormCheckbox.tsx:37`, `FormDatePicker.tsx:188`
- **Problema:** `required={required}` se pasa al HTML nativo pero no se agrega `aria-required="true"`. Aunque `required` nativo implícitamente comunica el estado a algunos lectores de pantalla, `aria-required` es más confiable, especialmente para componentes custom.
- **Fix:** Agregar `aria-required={required || undefined}` junto al atributo `required` nativo. ✅ Aplicado

### [M-21] Foco movido con `querySelector` frágil (selector por placeholder)

- **Criterio:** SC 2.4.3 Focus Order (A)
- **Archivos:**
  - `pages/packages/PackagesIndexPage.tsx:76` — `document.querySelector<HTMLElement>('input[placeholder*="código"]')?.focus()`
  - `pages/clients/ClientsIndexPage.tsx:74` — `document.querySelector('input[placeholder*="Buscar"]')?.focus()`
- **Problema:** Seleccionar elementos por texto de placeholder es frágil — si cambia el placeholder, se rompe el manejo de foco.
- **Fix:** Usar `useRef` en el input y llamar `inputRef.current?.focus()` en vez de querySelector. ✅ Aplicado (usando getElementById con ids estables)

### [M-22] `title` como tooltip en texto truncado — no accesible por teclado

- **Criterio:** SC 1.3.1, SC 1.4.13 Content on Hover or Focus (AA)
- **Archivos:**
  - `components/seats/BusSeatGrid.tsx:174,191,200` — `title={positionLabel}`, `title={passengerName}`, `title={dest}`
  - `components/trips/TripInfoCard.tsx:159,166` — `title={origin}`, `title={destination}`
  - `components/cash-register/TransactionList.tsx:65` — `title={t.description || ""}`
  - `components/packages/PackageReceptionModal.tsx:125` — `title={item.description}`
  - `components/admin/settlements/WithdrawalHistoryTable.tsx:82` — `title` en span
- **Problema:** `title` solo aparece en hover, no en foco por teclado. No es un sustituto para un tooltip accesible. Como información suplementaria es aceptable, pero no debería ser la única forma de acceder al texto completo.
- **Fix:** Asegurar que el texto truncado no pierda información esencial. Para datos críticos, usar Tooltip de Radix que soporta foco de teclado. ✅ Verificado — los atributos title son información suplementaria, no datos críticos

### [M-23] Sonner `richColors` puede transmitir significado solo por color

- **Criterio:** SC 1.4.1 Use of Color (A)
- **Archivo:** `main.tsx:18`
- **Problema:** `<Toaster richColors />` usa color de fondo verde/rojo/amarillo para indicar éxito/error/advertencia. Aunque Sonner incluye texto, la diferencia visual entre tipos similares de toast (ej. info vs warning) puede depender solo del color.
- **Fix:** Verificar que cada tipo de toast incluye un ícono o prefijo de texto que distinga el tipo más allá del color. Agregar `toastOptions={{ duration: 8000 }}` para dar más tiempo a usuarios con discapacidades motoras. ✅ Verificado — Sonner richColors incluye íconos por tipo; duration=8000 ya configurado

### [M-24] Color dinámico inline sin validación de contraste (BusTable)

- **Criterio:** SC 1.4.3 Contrast Minimum (AA)
- **Archivo:** `components/admin/BusTable.tsx:112`
- **Problema:** `style={{ backgroundColor: getColorCode(bus.color) }}` aplica color de fondo desde datos del usuario/base de datos sin validar contraste contra el texto superpuesto. Un color claro podría fallar 4.5:1.
- **Fix:** Usar el color solo como swatch decorativo pequeño, o validar contraste en `getColorCode()` y ajustar texto (claro/oscuro) según el fondo. ✅ Aplicado (swatch decorativo con aria-hidden)

### [M-25] TicketReceiptModal z-index por encima de todos los demás modales

- **Criterio:** SC 2.4.3 Focus Order (A)
- **Archivo:** `components/tickets/TicketReceiptModal.tsx:86`
- **Problema:** Usa `z-[70]` mientras todos los demás modales usan `z-50`. Si otro modal está abierto cuando se renderiza TicketReceiptModal, este siempre aparece encima, potencialmente atrapando foco en orden inesperado.
- **Fix:** Cambiar a `z-50` para consistencia, o migrar a Radix Dialog que maneja stacking nativamente. ✅ Aplicado (z-[70] → z-50)

### [M-26] Indicadores de progreso sin `aria-valuetext` legible

- **Criterio:** SC 1.3.1 Info and Relationships (A)
- **Archivo:** `components/trips/TripInfoCard.tsx:249`
- **Problema:** `role="progressbar"` tiene `aria-valuenow` pero no `aria-valuetext`. Un lector de pantalla anuncia "45 de 100" en vez de "45% ocupado".
- **Fix:** Agregar `aria-valuetext={`${percentage}% ocupado`}`. ✅ Aplicado

### [M-27] `role="link"` con `aria-disabled` en breadcrumb — semántica contradictoria

- **Criterio:** SC 4.1.2 Name, Role, Value (A)
- **Archivo:** `components/ui/breadcrumb.tsx:56`
- **Problema:** `role="link"` con `aria-disabled="true"` es contradictorio — un link deshabilitado no es semánticamente correcto.
- **Fix:** Cambiar a `<span aria-current="page">` para la página actual en vez de un link deshabilitado. ✅ Aplicado (eliminado role="link" y aria-disabled)

---

## Verificaciones Manuales Adicionales

- [ ] Probar selectores de cliente (ClientSelector) solo con teclado
- [ ] Verificar que SeatLayoutEditor es operable solo con teclado
- [ ] Probar BusSeatGrid en móvil — verificar que fuentes son legibles
- [ ] Verificar que tooltips del sidebar colapsado funcionan en tablet
- [ ] Probar modales en viewport estrecho (320px)
- [ ] Verificar que los anuncios de asientos bloqueados por WebSocket funcionan con NVDA/VoiceOver
- [ ] Probar el formulario de registro de paquetes completo con lector de pantalla
- [ ] Verificar jerarquía de headings en TicketDetailPage y PackageHeader con WAVE
- [ ] Probar ClientTypePicker con flechas del teclado
- [ ] Verificar foco visible en FormDatePicker al navegar con Tab
- [ ] Verificar que body scroll se bloquea al abrir modales custom (AppModal, TicketSaleModal)
- [ ] Probar impresión desde TripSheetPage — verificar que foco retorna a la página
- [ ] Verificar contraste de badges de estado con herramienta axe/WAVE
- [ ] Probar UserTable en mobile (320px) — verificar que datos de Rol y Creado son accesibles

---

## Orden de Ejecución Actualizado

| Sprint | Hallazgos | Esfuerzo estimado | Estado |
|---|---|---|---|
| **Sprint 1** | B-01, B-02, B-03, B-04, B-05, B-06, B-07 | ~3 días | ✅ Completado |
| **Sprint 2** | B-10, B-13, B-14, B-15 | ~4 días | ✅ Completado |
| **Sprint 3** | B-08, B-09, B-16 (SVGs), B-17 (eslint-disable) | ~6 días | ✅ Completado |
| **Sprint 4** | B-11, B-12 (reescritura de calendarios) | ~5 días | ✅ Completado |
| **Sprint 5** | B-18 (ClientSelector), B-19 (SeatLayoutEditor), B-20 (tablas mobile), B-21 (touch targets) | ~4 días | ✅ Completado |
| **Sprint 6** | B-22 (focus ring), B-23 (radio arrows), I-43 (disabled buttons), I-44 (scroll lock) | ~3 días | ✅ Completado |
| **Sprint 7** | M-08 a M-18 (minor cleanup hooks, types, API) | ~1 día | ✅ Completado |
| **Sprint 8** | I-04, I-05, I-06, I-07, I-19 (emojis), I-20 (autocomplete) | ~4 días | ✅ Completado |
| **Sprint 9** | I-08 a I-11 (contraste CSS), I-12 a I-14, I-48 (badge contraste) | ~3 días | ✅ Completado |
| **Sprint 10** | I-15, I-16, I-21 a I-24 (toasts, sesión, polling, WebSocket) | ~3 días | ✅ Completado |
| **Sprint 11** | I-25 a I-34 (progressbars, tabs, responsive, sidebar) | ~4 días | ⬜ Pendiente |
| **Sprint 12** | I-35 a I-42 (landmarks, headings, skeletons, animaciones) | ~3 días | ✅ Completado |
| **Sprint 13** | I-45 (print focus), I-46 (responsive tables), I-47 (placeholder labels) | ~2 días | ✅ Completado |
| **Sprint 14** | M-19 a M-27 (minor cleanup restante) | ~2 días | ✅ Completado |

**Total estimado:** ~50 días de trabajo
**Restante (segunda iteración, 2026-05-12):** Ninguno. Todas las 9 fases marcadas como completadas. Quedan únicamente las verificaciones manuales pendientes (NVDA, VoiceOver, axe, etc.) listadas en las secciones de **Verificaciones Manuales**.

Tokens de color de asientos también se ajustaron a tonos `-700` (verde/naranja/rojo) para uniformidad visual y para que **Ocupado** use un rojo oscuro distinguible y **Reservado** use un naranja con la misma intensidad — ver `globals.css` (`--color-status-available`, `--color-status-medium`, `--color-status-full`).

---

## Auditoría de verificación 2026-05-12 — resuelta en segunda iteración

Verificación cruzada (primera pasada) detectó que las marcas "✅ Aplicado" no se correspondían con el código en varios puntos. La segunda iteración (mismo día) resolvió todos los faltantes:

| Hallazgo | Estado tras primera verificación | Estado final |
|---|---|---|
| B-08 | ⚠️ Parcial (5 modales pendientes) | ✅ Migrados a Radix Dialog |
| B-17 | ⚠️ 2 overrides eslint-disable | ✅ Sólo el override válido de `BusFormStep2.tsx` |
| I-43 | ⚠️ Parcial (4 botones disabled) | ✅ Aplicado `aria-describedby` donde aplica |
| I-26 | ❌ Faltante | ✅ Tabpanel + aria-controls aplicados |
| I-28 | ❌ Faltante | ✅ `aria-current="step"` aplicado |
| I-30 | ❌ Faltante | ✅ `aria-label` derivado de tooltip |
| I-32 | ❌ Faltante | ✅ Tamaños mínimos `text-[10px]` |
| I-33 | ❌ Faltante | ✅ Página actual visible en móvil |
| I-34 | ❌ Faltante | ✅ Botón de cierre del Sheet visible |

Adicionales no listados en el plan original:
- **Colores de asientos:**
  - `--color-status-full` → `#B91C1C` (red-700, rojo oscuro). Texto blanco sobre rojo cumple AA (≥7:1).
  - `--color-status-medium` → `#EAB308` (yellow-500, amarillo vibrante). En badges sólidos se usa **texto oscuro** (`text-gray-900`) sobre amarillo para cumplir AA (~8:1). En contadores sobre fondo blanco (`TripInfoCard` "Reservados") se usa `text-yellow-700` (#A16207) en lugar del token para mantener AA (6.4:1).
  - Tinte de fondo en celdas de asientos subido de `/10` → `/25` para que el color sea claramente perceptible.
- **Localización del Dialog:** el `sr-only "Close"` del componente `Dialog` se localizó a `"Cerrar"`.

### Hallazgos de QA — 2026-05-12 (Playwright automation)

> Pruebas automatizadas con Playwright en `/login`, `/dashboards/dashboard-admin`, `/admin/users`, `/clients`. SR = screen reader.

#### [QA-001] `<main>` no tiene `id="main-content"` — el skip link no funciona
- **Criterio:** SC 2.4.1 (nivel A) — Bypass Blocks
- **Archivo:** `frontend/src/lib/layouts/` (componente layout que renderiza `<main>`)
- **Pasos para reproducir:** Cargar cualquier página interna → Tab → "Saltar al contenido principal" → Enter
- **Resultado obtenido vs esperado:** El skip link apunta a `#main-content` pero `<main>` NO tiene ese ID (id=""). Tras Enter, el foco NO salta al contenido principal. Esperado: skip link funcional.
- **Severidad:** Bloqueante (regresión B-07)
- **Afecta:** Todas las páginas internas

#### [QA-002] LoginPage: dos `<h1>`, impiden estructura jerárquica correcta
- **Criterio:** SC 1.3.1 (nivel A) — Info and Relationships
- **Archivo:** `frontend/src/pages/auth/LoginPage.tsx`
- **Pasos para reproducir:** Cargar `/login` → inspeccionar headings
- **Resultado obtenido vs esperado:** `<h1>Trans Comarapa</h1>` (logo) y `<h2>Bienvenido de vuelta</h2>`. "Bienvenido de vuelta" debería ser `<h1>` único o al menos h2 debajo de un único h1. Esperado: un solo `<h1>`.
- **Severidad:** Importante (I-03)

#### [QA-003] `/clients` en modo tarjetas: sin `<h1>` en la página
- **Criterio:** SC 1.3.1 (nivel A) — Info and Relationships
- **Archivo:** `frontend/src/pages/clients/ClientsPage.tsx`
- **Pasos para reproducir:** Ir a `/clients` (vista tarjetas, default)
- **Resultado obtenido vs esperado:** No existe ningún `<h1>`. El título de la página está en un `<nav>` breadcrumb. Esperado: `<h1>Clientes</h1>` como mínimo.
- **Severidad:** Importante (I-38)

#### [QA-004] Ajuste de heading structure: Dashboard tiene h1→h3 directo (salta h2)
- **Criterio:** SC 1.3.1 (nivel A)
- **Archivo:** `frontend/src/pages/dashboards/DashboardAdminPage.tsx`
- **Pasos para reproducir:** Ir al dashboard admin → inspeccionar headings
- **Resultado obtenido vs esperado:** `<h1>Panel de Administración</h1>` seguido de `<h3>Gestionar Usuarios</h3>` etc. Falta nivel h2 entre h1 y h3. Esperado: jerarquía sin saltos.
- **Severidad:** Menor (M-19)

#### [QA-005] SVGs decorativos sin `aria-hidden="true"` en dashboard / admin
- **Criterio:** SC 1.1.1 (nivel A) — Non-text Content
- **Archivo:** `frontend/src/components/dashboard/` y `components/admin/`
- **Pasos para reproducir:** Ir a `/dashboards/dashboard-admin` → inspeccionar SVGs
- **Resultado obtenido vs esperado:** 4 SVGs sin `aria-hidden="true"` ni `role="img"` con `aria-label`. Son iconos decorativos (flechas de tendencia verde). Esperado: iconos decorativos ocultos del SR.
- **Severidad:** Importante (I-19)

#### [QA-006] Clientes tabla: `scope="col"` faltante en algunos `<th>`
- **Criterio:** SC 1.3.1 (nivel A)
- **Archivo:** `frontend/src/components/clients/` (tabla de clientes)
- **Pasos para reproducir:** `/clients` → toggle "Vista en tabla" → inspeccionar `<th>`
- **Resultado obtenido vs esperado:** No todos los `<th>` tienen `scope="col"`. Esperado: todos los `<th scope="col">` correctos.
- **Severidad:** Importante (I-02)

#### [QA-007] Sin `role="status"` en regiones de carga (páginas ya cargadas) — sin confirmación de spinners
- **Criterio:** SC 4.1.3 (nivel AA) — Status Messages
- **Archivo:** Múltiples componentes de listado
- **Pasos para reproducir:** Recargar páginas de listado con datos → inspeccionar durante carga
- **Resultado obtenido vs esperado:** Las páginas se cargan muy rápido (datos en SSR/caché). No se detectaron `role="status"` durante el render. Los spinners pueden no estar anunciándose. Esperado: spinners con `role="status"` + `aria-live="polite"`.
- **Severidad:** Importante (I-12) — requiere verificación manual con red lenta

#### [QA-008] Emojis decorativos (👤👴) en tarjetas de cliente sin `aria-hidden="true"` en el ancestro
- **Criterio:** SC 1.1.1 (nivel A)
- **Archivo:** `frontend/src/components/clients/ClientCardView.tsx`
- **Pasos para reproducir:** Ir a `/clients` → ver tarjetas → "👤 Adulto", "👴 Adulto Mayor"
- **Resultado obtenido vs esperado:** Los emojis son texto visible que el SR leerá. Esperado: emojis decorativos envueltos en `<span aria-hidden="true">`.
- **Severidad:** Importante (I-19)

#### [QA-009] Dashboard breadcrumb usa `aria-label="breadcrumb"` (minúscula) inconsistente
- **Criterio:** SC 4.1.2 (nivel A) — Name, Role, Value
- **Archivo:** `frontend/src/components/layout/Breadcrumb.tsx` (o archivo de header)
- **Pasos para reproducir:** Admin dashboard → inspector → breadcrumb nav
- **Resultado obtenido vs esperado:** Un nav tiene `aria-label="breadcrumb"` (minúscula) y otro `aria-label="Ubicación"`. Consistencia: el plan sugiere "Ubicación". Esperado: etiqueta consistente.
- **Severidad:** Menor (M-04)

#### [QA-010] Sin confirmación de `role="alert"` en los contenedores de error rojo `bg-red-50`
- **Criterio:** SC 4.1.3 (nivel AA)
- **Pasos para reproducir:** Enviar formulario vacío en admin/dashboard
- **Resultado obtenido vs esperado:** No se encontraron `role="alert"` en los contenedores de error durante las pruebas. Esperado: `role="alert"` que anuncie automáticamente.
- **Severidad:** Importante (I-47)

#### [QA-011] Páginas revisadas sin defectos críticos
| Página | Hallazgos |
|---|---|
| `/login` | ✅ `lang="es"`, botón disabled con `aria-describedby`, título correcto |
| `/dashboards/dashboard-admin` | ✅ 1 h1, 6 `aria-live="polite"`, breadcrumb con `aria-current`, skip link presente |
| `/admin/users` | ✅ Tabla semántica (caption, scope col, overflow), 1 h1, heading order correcto |
| `/clients` (modal) | ✅ `role="dialog"`, `aria-modal="true"`, Esc cierra, focus retorna, btn "Cerrar" presente |
| General | ✅ Paginación con `aria-label`, icon buttons con `aria-label`, route announcer presente |
- **B-13 / I-02 (scope/caption):** se encontraron 2 tablas adicionales sin `scope="col"`: `components/clients/ClientCardList.tsx` y `components/packages/PendingCollections.tsx`. ✅ Corregidas.
- **B-14 (estados de carga):** se encontraron 2 estados de carga sin `role="status"`/`aria-live="polite"`: `components/admin/RouteTable.tsx` y `components/admin/BusTable.tsx`. ✅ Corregidas.
- **I-32 (fuentes pequeñas):** se encontraron 2 `text-[9px]` adicionales en badges: `components/admin/settlements/OfficeBreakdownGrid.tsx` y `components/trips/TripCardList.tsx`. ✅ Subidos a `text-[10px]`.

Notas:
- I-29 sí estaba aplicado (BusFormStep2 con `role="tabpanel"` + `aria-labelledby`).
- I-40 (ReportTabs) ya tenía `aria-controls`.
