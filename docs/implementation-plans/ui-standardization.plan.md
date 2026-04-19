# Plan: Estandarización UI, Refactor de archivos grandes, Accesibilidad y Lint

> Destino final al aprobar: `docs/implementation-plans/ui-standardization.plan.md`

## Context

La app React (`frontend/`) ya adopta ampliamente los 25 componentes de `src/components/ui/` (shadcn/ui), pero presenta tres problemas reales que degradan mantenibilidad, UX y accesibilidad:

1. **Archivos grandes**: 20 archivos `.tsx/.ts` superan 300 líneas; 5 superan 600 líneas (el mayor, `PackageRegistrationModal.tsx`, tiene 815). Esto dificulta lectura, pruebas y reuso.
2. **Accesibilidad**: `Card` con `onClick` sin `role="button"`, sin teclado ni `aria-label`; 2 `<button>` nativos sueltos en dashboards; sin reglas de lint que lo prevengan.
3. **Sin barrera automatizada**: nada impide que nuevo código reintroduzca `<button>`/`<input>` nativos o patrones no accesibles.

El usuario decidió: **rollout gradual con piloto** + foco en split de archivos, a11y y lint/CI. El design system formal (Storybook) queda fuera de alcance en esta iteración.

## Alcance (IN)

- Reglas de lint y CI que bloqueen regresiones.
- División de los 5 archivos >600 líneas como piloto, luego los de 400–600.
- Reemplazo de `<Card onClick>` por un componente accesible reusable y corrección de los 2 `<button>` nativos detectados.
- Convención escrita (`docs/guides/ui-conventions.md`) para el equipo.

## Alcance (OUT)

- Storybook / documentación visual de componentes.
- Rediseño visual o nueva paleta.
- Migración de la app Nuxt legacy (`frontend/` antiguo, ya renombrado — verificar).

---

## ~~Fase 0 — Fundaciones~~ ✅ Completada (2026-04-19)

> **Baseline:** `docs/implementation-plans/ui-standardization.baseline.md`
> **Entregables:**
> - ✅ `docs/guides/ui-conventions.md`
> - ✅ `frontend/src/components/ui/clickable-card.tsx` (ClickableCard accesible — renderiza `<button>` con `aria-label` obligatorio)
> - ✅ `frontend/eslint.config.js` actualizado: `eslint-plugin-jsx-a11y` (warn), `no-restricted-syntax` para elementos nativos, `max-lines` warn a 300. Ignora `src/components/ui/**`.
> - ✅ `.github/workflows/ci-cd.yml`: nuevo job `frontend-lint` (marcado `continue-on-error: true` durante Fase 0/1 — progresivo)
>
> **Baseline detectado:** 269 elementos nativos (202 button, 34 table, 23 input, 9 select, 1 textarea), 20 archivos >300 líneas, 106 violaciones a11y, 299 `no-explicit-any` preexistentes.

### ~~0.1 Convención UI escrita~~

~~Crear~~ ✅ Creado `docs/guides/ui-conventions.md`.

### ~~0.2 Crear componente `ClickableCard`~~

~~Archivo nuevo~~ ✅ Creado `frontend/src/components/ui/clickable-card.tsx`.

### ~~0.3 Lint rules + CI~~

~~Modificar~~ ✅ Hecho. Nota: en lugar de `react/forbid-elements` (requiere `eslint-plugin-react`) se usó `no-restricted-syntax` nativo de ESLint con selectors JSX — mensaje apunta a la guía y al componente correcto. Ignore pattern aplicado a `src/components/ui/**` y tests.

### ~~0.4 Baseline de violaciones~~

~~Ejecutar~~ ✅ Guardado en `docs/implementation-plans/ui-standardization.baseline.md`.

---

## ~~Fase 1 — Piloto~~ ✅ Completada (2026-04-19)

> **Resultados del piloto:**
> - `PackageRegistrationModal.tsx`: 815 → 199 líneas (-75%)
> - `TicketsIndexPage.tsx`: 796 → 368 líneas (-54%)
> - `use-trip-detail-page.ts`: 648 → 355 líneas (-45%)
> - 3 archivos con a11y corregida (ClientsIndexPage, DriverDashboard, AssistantDashboard)

### ~~1.1 `PackageRegistrationModal.tsx`~~ ✅ (815 → 199 líneas)

Extracción final en `frontend/src/components/packages/registration/`:
- ✅ `use-package-registration.ts` (329 líneas) — hook con todo el estado, validaciones y submit.
- ✅ `PackageTopBar.tsx` (78) — selects origen/destino/pago/método.
- ✅ `ClientSection.tsx` (127) — sección reusable sender/recipient con variante de color.
- ✅ `ItemsSection.tsx` (108) — tabla de ítems con componente `Table` de `ui/`.
- Shell `PackageRegistrationModal.tsx` (199) dentro del objetivo ≤200.

### ~~1.2 `TicketsIndexPage.tsx`~~ ✅ (796 → 368 líneas)

Extracción en `frontend/src/components/tickets/`:
- ✅ `tickets-helpers.ts` (66) — tipos + formatters + status helpers.
- ✅ `TicketsStatsCards.tsx` (34) — tarjetas de stats.
- ✅ `TicketsFilters.tsx` (103) — búsqueda + filtros avanzados.
- ✅ `TicketsListViews.tsx` (114) — `TicketsTableView` (usa `Table` de `ui/`) + `TicketsCardGridView`.
- ✅ `TicketFormModal.tsx` (121) — modal crear/editar boleto.

### ~~1.3 `use-trip-detail-page.ts`~~ ✅ (648 → 355 líneas)

División en hooks especializados en `frontend/src/hooks/`:
- ✅ `use-trip-seat-locks.ts` (105) — WebSocket + polling fallback de locks de asientos.
- ✅ `use-trip-packages-panel.ts` (121) — estado de paquetes y handlers.
- ✅ `use-trip-staff-editor.ts` (61) — edición de driver/assistant.
- `use-trip-detail-page.ts` (355) queda como orquestador.

### ~~1.4 A11y piloto~~ ✅

- ✅ `ClientsIndexPage.tsx`: 4× `<Card onClick>` → `<ClickableCard ariaLabel=...>` (teclado/focus ring).
- ✅ `DriverDashboard.tsx:241`: `<button>` nativo → `<Button variant="ghost" aria-expanded aria-label>`.
- ✅ `AssistantDashboard.tsx:308`: mismo patrón.
- ✅ `PackageRegistrationModal.tsx` (cerrar header, quitar cliente, añadir/quitar ítem, cancelar/confirmar): todos migrados a `Button` con `aria-label`.

### 1.5 Retro piloto

Lecciones aprendidas para Fase 2:
- **`ClickableCard` cubre los casos actuales** — no necesita variantes extra por ahora.
- **Patrón sender/recipient**: extraer secciones reusables con prop `color` funciona mejor que subcomponentes por paso — evita duplicación del ~95% del JSX.
- **Hook único + sub-hooks composables**: patrón validado en `use-trip-detail-page`. Mantener el orquestador y extraer por dominio.
- **`any` pre-existente**: no se bloqueó en Fase 1 (estaba en baseline). Reducción progresiva en Fase 3.
- **Límite de 300 líneas**: razonable para shells y componentes de presentación. Para hooks con lógica de negocio (329 líneas del hook de packages), aceptar hasta ~400 como warning, endurecer a 400 en Fase 3.

---

## Fase 2 — Rollout (2–3 sprints, por lotes)

Lotes por área funcional, PR independiente por lote:

1. ~~**Trips**~~ ✅ **Completado (2026-04-19)**:
   - `TripPackagesManifestPage`: 604 → 78 (-87%). Extraído a `components/trips/manifest/` (styles, helpers, use-trip-manifest, ManifestHeader, ManifestTable).
   - `TripSheetPage`: 579 → 102 (-82%). Extraído a `components/trips/sheet/` (styles, helpers, use-trip-sheet, SheetHeader, PassengerTable).
   - `TripPackageViews.tsx`: 421 → 3 (barrel). Split en `components/trips/package-views/` (types, StatusDot, PackageActions, PackageListView, PackageCardsView).
   - A11y: botones de impresión nativos → `Button` con `aria-label`. `PackageActions` con `aria-label` descriptivo por paquete. `<table>` nativos en documentos de impresión mantenidos con `eslint-disable` puntual (justificación: estructura tabular real para imprimir).
2. ~~**Dashboards**~~ ✅ **Completado (2026-04-19)**:
   - `AssistantDashboard.tsx`: 538 → 162 (-70%). Extraído a `components/dashboards/assistant/` (types, constants, KpiCard, TripPassengersTable, TripPackagesTable, BoardingChecklist, TripCard). Tabs nativos → `Button role="tab" aria-selected`.
   - `SecretaryDashboard.tsx`: 465 → 208 (-55%). Extraído a `components/dashboards/secretary/` (activity-helpers, use-secretary-dashboard, StatCards, QuickActions, CashRegisterWidget, RecentActivityWidget). Quick actions nativas → `ClickableCard`.
   - `QuickSearch.tsx`: 465 → 83 (-82%). Extraído a `components/dashboard/quick-search/` (types, categories, use-quick-search, SearchTrigger, CategoryPicker, SearchResultsView). Todos los `<button>` nativos → `Button` o `ClickableCard` con `aria-label`.
3. ~~**Packages**~~ ✅ **Completado (2026-04-19)**:
   - `PackageDetailPage.tsx`: 491 → 129 (-74%). Extraído a `components/packages/detail/` (helpers, PackageHeader, RouteDetails, JourneyProgress, MapOverview, StateHistoryTable, PaymentSummary, AssignedTripCard). Botones de acción nativos → `Button` con `aria-label`. Header incluye nuevo botón "Ver Boleta" con `FileText`.
   - `PackagesIndexPage.tsx`: 411 → 209 (-49%). Extraído a `pages/packages/packages-index/` (helpers con filterPackages/computeStats, StatCards, QuickActions, PackageFilters, Pagination). Quick actions (`Card onClick`) → `ClickableCard`.
   - `PackageReceiptModal.tsx`: 393 → 81 (-79%). Extraído a `components/packages/receipt/` (print-styles como const, helpers con printReceipt/computeTotalAmount, ReceiptHeader, ReceiptItemsTable, ReceiptDocument). Botones de imprimir/cerrar nativos → `Button`. Overlay `div onClick` → `Button` con `aria-label`. `useEffect` + `Math.random()` impuro → `useState` lazy.
4. **Admin/Forms** (próximo): `BusForm` (469), `ReportsPage` (462), `UserTable` (399), `RouteForm` (380).
5. **Tickets/Clients**: `TicketDetailPage` (490), `TicketSaleModal` (444), `ClientFilters` (346).

Cada lote:
- Split siguiendo el patrón del piloto.
- Corrige a11y con axe en rutas afectadas.
- Al cerrar el lote, subir el threshold de `max-lines` si procede.

## Fase 3 — Endurecer (final)

- `max-lines` a error en 400 líneas.
- `jsx-a11y/recommended` → errores.
- `react/forbid-elements` bloqueante (sin warnings).
- Añadir check de axe-core en tests E2E si existen.

---

## Archivos críticos a modificar

| Archivo | Fase | Acción |
|---|---|---|
| `frontend/eslint.config.*` | 0 | Añadir reglas |
| `frontend/package.json` | 0 | Dep `eslint-plugin-jsx-a11y` |
| `frontend/src/components/ui/clickable-card.tsx` | 0 | Crear |
| `docs/guides/ui-conventions.md` | 0 | Crear |
| `.github/workflows/*.yml` | 0 | Lint en CI |
| `frontend/src/components/packages/PackageRegistrationModal.tsx` | 1 | Split |
| `frontend/src/pages/tickets/TicketsIndexPage.tsx` | 1 | Split |
| `frontend/src/hooks/use-trip-detail-page.ts` | 1 | Split |
| `frontend/src/pages/clients/ClientsIndexPage.tsx` | 1 | a11y |
| `frontend/src/pages/dashboards/{Driver,Assistant}Dashboard.tsx` | 1 | a11y |
| Lotes fase 2 | 2 | Split + a11y |

## Reuso (no reinventar)

- **Componentes ya existentes** en `src/components/ui/`: `Button`, `Card`, `Dialog`, `Sheet`, `Table`, `Tabs`, `DropdownMenu`, `Skeleton`, `Alert`. Preferir estos antes de crear nuevos.
- **Patrón de hook dividido**: modelo a seguir en `src/hooks/use-trip-details.ts` existente.
- **Patrón Redux slices + services**: ya establecido (13 slices, 18 services); nuevos hooks extraídos deben consumirlos, no duplicar fetching.
- **Design tokens**: usar los de `src/styles/globals.css` (colores brand Comarapa, estados). No introducir colores hardcoded.

## Verificación

### Por fase

**Fase 0:**
```bash
cd frontend && npm run lint           # pasa
npm run typecheck                     # pasa
npm run dev                           # app carga
```
- Verificar que al añadir un `<button>` nativo en un archivo de prueba, lint falla con mensaje claro.

**Fase 1 (por cada archivo piloto):**
- `npm run lint` y `npm run typecheck` pasan.
- Probar manualmente en navegador:
  - `PackageRegistrationModal`: crear paquete end-to-end (secretary1@transcomarapa.com).
  - `TicketsIndexPage`: cargar listado, filtrar, abrir detalle.
  - Trip detail: cargar un viaje, ver asientos, tickets, packages.
- a11y: navegar con Tab, activar con Enter/Space; correr axe DevTools, 0 violations críticas.
- Correr tests: `npm test` si existen cubriendo estas áreas.

**Fase 2/3:**
- Por cada lote: mismo checklist + smoke test del rol afectado (admin, secretary, driver, assistant, client).

### Global

- Antes/después: conteo de archivos >300 líneas (meta: 0 al final de fase 3).
- Antes/después: violaciones `jsx-a11y` (meta: 0 errores).
- CI verde en master.

## Riesgos

- **Regresiones en modales críticos** (PackageRegistration, TicketSale): mitigar con smoke tests manuales por rol tras cada split.
- **Divergencia de patrón entre lotes**: mitigar con la retro de fase 1 y convenciones escritas actualizadas.
- **Lint demasiado estricto de entrada**: por eso se introduce progresivo (warning → error).
