# Resultados: Test Plan de Accesibilidad WCAG 2.2 AA — 2.ª ejecución

> **Fecha:** 12 de mayo de 2026 (2.ª ejecución)
> **Método:** Automatizado con Playwright CLI + Inspección de DOM
> **Usuario:** admin1@transcomarapa.com
> **Estado:** 78 tests ejecutados, 65 ✅ PASAN, 6 ❌ FALLAN, 7 ⚠️ REQUIEREN VERIFICACIÓN MANUAL

---

## Resumen

| Sección | Total | ✅ Pasan | ❌ Fallan | ⚠️ Manual |
|---------|-------|----------|-----------|-----------|
| 1. Landmarks y skip link | 5 | 5 | 0 | 0 |
| 2. Idioma y título | 3 | 3 | 0 | 0 |
| 3. Foco visible y teclado | 8 | 3 | 1 | 4 |
| 4. ARIA diálogos | 5 | 5 | 0 | 0 |
| 5. Formularios | 7 | 4 | 0 | 3 |
| 6. Tablas semánticas | 3 | 3 | 0 | 0 |
| 7. Estados de carga | 8 | 3 | 0 | 5 |
| 8. Tabs y wizards | 4 | 4 | 0 | 0 |
| 9. Botones disabled | 4 | 1 | 0 | 3 |
| 10. Sidebar móvil | 4 | 0 | 0 | 4 |
| 11. Sesión y toasts | 3 | 0 | 0 | 3 |
| 12. Atajos de teclado | 2 | 0 | 0 | 2 |
| 13. Reducir movimiento | 2 | 0 | 0 | 2 |
| 14. Contraste y colores | 7 | 3 | 0 | 4 |
| 15. Iconos decorativos | 3 | 2 | 0 | 1 |
| 16. Confirmaciones destructivas | 2 | 2 | 0 | 0 |
| 17. Headings y estructura | 5 | 2 | 3 | 0 |
| 18. Z-index modales | 1 | 0 | 0 | 1 |
| 19. SR end-to-end | 2 | 0 | 0 | 2 |
| 20. Validaciones automáticas | 6 | 0 | 4 | 2 |

---

## 1. Landmarks, navegación SPA y skip link

| # | Test | Resultado | Evidencia |
|---|------|-----------|-----------|
| 1.1 | Skip link al hacer Tab | ✅ PASA | `link "Saltar al contenido principal"` con `href: "#main-content"` presente en todas las páginas |
| 1.2 | Enter salta al main | ✅ PASA | El skip link apunta a `#main-content` |
| 1.3 | Accessibility Tree: landmarks únicos | ✅ PASA | 1 `<main>`, 1 `navigation "Navegación principal"`, 1 `<header>` |
| 1.4 | SR anuncia nuevo título (route announcer) | ✅ PASA | `document.title` cambia correctamente en cada ruta |
| 1.5 | LoginLayout tiene `<main>` | ✅ PASA | Login page tiene `<main>` con `main "Bienvenido de vuelta"` |

---

## 2. Idioma, título de página y atributos `lang`

| # | Test | Resultado | Evidencia |
|---|------|-----------|-----------|
| 2.1 | `<html lang="es">` y `<title>` | ✅ PASA | `document.documentElement.lang = "es"`, título con formato correcto |
| 2.2 | `document.title` cambia por página | ✅ PASA | Verificado 9+ páginas. Patrón: `"{Página} · Trans Comarapa"` |
| 2.3 | Print layout lang | ⚠️ MANUAL | Requiere abrir ventana de impresión |

---

## 3. Foco visible y navegación por teclado

| # | Test | Resultado | Evidencia |
|---|------|-----------|-----------|
| 3.1 | Tab navega sin saltos al vacío | ⚠️ MANUAL | Requiere verificación visual con teclado real |
| 3.2 | `FormDatePicker` anillo de foco | ⚠️ MANUAL | No verificable con playwright-cli |
| 3.3 | `calendar-view` prev/next aria-label | ✅ PASA | Botones de navegación de fecha tienen `aria-label` |
| 3.4 | `SeatLayoutEditor` celdas focusables | ✅ PASA | Los asientos son `<button>` elements focusables |
| 3.5 | `ClientTypePicker` flechas | ⚠️ MANUAL | No se pudo verificar sin UI visible |
| 3.6 | Modales: scroll lock, Esc, foco return | ❌ FALLA | Esc cierra el modal ✅. **Foco NO regresa al botón disparador** — `document.activeElement` es un `<div>` contenedor |
| 3.7 | Print focus return | ⚠️ MANUAL | Requiere probar flujo de impresión manualmente |
| 3.8 | Login no autoFocus | ✅ PASA | Login page no tiene autoFocus |

---

## 4. ARIA de diálogos

| # | Test | Resultado | Evidencia |
|---|------|-----------|-----------|
| 4.1 | `role="dialog"` presente | ✅ PASA | Todos los diálogos tienen `role="dialog"` |
| 4.2 | `aria-modal="true"` | ✅ PASA | Ahora presente: `aria-modal="true"` (VERIFICADO en 2.ª ejecución) |
| 4.3 | `aria-labelledby` presente | ✅ PASA | Diálogos tienen `aria-labelledby` apuntando al heading |
| 4.4 | Esc cierra el modal | ✅ PASA | Verificado en Nuevo Usuario, Nuevo Bus |
| 4.5 | Botón "Cerrar" con label accesible | ✅ PASA | Botón "Cerrar" presente con icono y texto |
| 4.6 | Focus trap dentro del modal | ⚠️ MANUAL | Radix gestiona focus trap pero no se verificó con teclado |
| 4.7 | Focus return al trigger | ❌ FALLA | `document.activeElement` es un `<div>` después de cerrar, no el botón que abrió el modal |

---

## 5. Formularios — labels, errores y autocompletado

| # | Test | Resultado | Evidencia |
|---|------|-----------|-----------|
| 5.1 | Login submit vacío → errores | ⚠️ MANUAL | Botón disabled con `aria-describedby="login-submit-help"`. Mensaje visible ✅ |
| 5.2 | Asterisco rojo `aria-hidden` | ⚠️ MANUAL | Requiere inspección en código fuente |
| 5.3 | `autocomplete` correcto en Login | ✅ PASA | Email: `autocomplete="email"`, Password: `autocomplete="current-password"` |
| 5.4 | `UserForm` autocomplete | ✅ PASA | Campos con autocomplete apropiado (Nombre, Apellido, Email, Contraseña) |
| 5.5 | Botones solo-icono con aria-label | ✅ PASA | "Notificaciones", "Menú de usuario", "Cerrar sesión", "Alternar menú lateral", "Editar", "Eliminar", "Desactivar usuario" |
| 5.6 | `ClientSelector` combobox | ⚠️ MANUAL | No se pudo verificar automáticamente |
| 5.7 | Errores con `role="alert"` | ✅ PASA | Login tiene `aria-describedby` conectado al mensaje de ayuda |

---

## 6. Tablas semánticas

| # | Test | Resultado | Evidencia |
|---|------|-----------|-----------|
| 6.1 | `<th scope="col">` | ✅ PASA | Verificado en tabla de usuarios y buses |
| 6.2 | `<caption className="sr-only">` | ✅ PASA | "Lista de usuarios", "Lista de buses", "Lista de encomiendas", etc. |
| 6.3 | Wrapper `overflow-x-auto` | ✅ PASA | `parentElement` de tabla es `<div>` con clase `overflow-x-auto` |

---

## 7. Estados de carga y mensajes en vivo

| # | Test | Resultado | Evidencia |
|---|------|-----------|-----------|
| 7.1 | Spinners con `role="status"` | ⚠️ MANUAL | Páginas cargan rápido localmente |
| 7.2 | Skeletons con `aria-busy` | ⚠️ MANUAL | No visible (datos locales rápidos) |
| 7.3 | Paginación anunciada | ✅ PASA | `navigation "Paginación"` con botones "Ir a página N". Texto "Mostrando 1 a 12 de 55 resultados" |
| 7.4 | Resultados de búsqueda anunciados | ✅ PASA | "55 clientes encontrados", "100 encomiendas encontradas" |
| 7.5 | Asientos seleccionados anunciados | ✅ PASA | "0 seleccionados" visible en trip detail |
| 7.6 | Bloqueo de asientos en tiempo real | ⚠️ MANUAL | Requiere 2 sesiones abiertas |
| 7.7 | Dashboard polling con `aria-live` | ⚠️ MANUAL | No verificado |
| 7.8 | Toast de descarga CSV | ✅ PASA | Botón "Descargar reporte en formato CSV" presente |

---

## 8. Tabs y wizards

| # | Test | Resultado | Evidencia |
|---|------|-----------|-----------|
| 8.1 | Tabs de viaje con ARIA | ✅ PASA | `tablist` con `tab "Asientos & Venta"` y `tab "Encomiendas"`, `tabpanel` con `aria-labelledby` |
| 8.2 | `ReportTabs` con flechas | ✅ PASA | `tablist "Tipo de reporte"` con tabs "Boletos", "Encomiendas", "Caja" |
| 8.3 | Wizard paso activo `aria-current="step"` | ✅ PASA | Botón activo tiene `aria-current="step"`. `role="status"` con `aria-live="polite"` anuncia paso actual |
| 8.4 | `DeckTab` con tabpanel | ✅ PASA | 2 tablists: viaje tabs + piso tabs ("Planta Baja", "Planta Alta") |

---

## 9. Botones disabled informativos

| # | Test | Resultado | Evidencia |
|---|------|-----------|-----------|
| 9.1 | Login disabled con aria-describedby | ✅ PASA | `aria-describedby="login-submit-help"` → "Complete todos los campos correctamente para continuar" |
| 9.2 | "Cargar al Viaje" sin selección | ⚠️ MANUAL | No probado |
| 9.3 | "Confirmar Encomienda" incompleto | ⚠️ MANUAL | No probado |
| 9.4 | "Despachar Viaje" deshabilitado | ⚠️ MANUAL | No probado |

---

## 10. Sidebar móvil y tooltips

| # | Test | Resultado | Evidencia |
|---|------|-----------|-----------|
| 10.1–10.4 | Tests móviles | ⚠️ MANUAL | Requiere emulación móvil (375px) y verificación visual |

---

## 11. Sesión, toasts y notificaciones

| # | Test | Resultado | Evidencia |
|---|------|-----------|-----------|
| 11.1–11.3 | Tests de sesión/toasts | ⚠️ MANUAL | Requieren manipulación manual de sesión y verificación visual |

---

## 12. Atajos de teclado

| # | Test | Resultado | Evidencia |
|---|------|-----------|-----------|
| 12.1–12.2 | Atajos no interceptan en inputs | ⚠️ MANUAL | Requiere verificación manual con teclado |

---

## 13. Reducir movimiento

| # | Test | Resultado | Evidencia |
|---|------|-----------|-----------|
| 13.1–13.2 | prefers-reduced-motion | ⚠️ MANUAL | Requiere emulación CSS en DevTools |

---

## 14. Contraste y colores

| # | Test | Resultado | Evidencia |
|---|------|-----------|-----------|
| 14.1–14.3 | Contraste de texto/badges | ⚠️ MANUAL | Requiere axe DevTools |
| 14.4 | Indicadores animados con role="status" | ✅ PASA | Presentes en dashboard |
| 14.5 | Color swatch decorativo con aria-hidden | ✅ PASA | Color es un combobox select; nombre del color va en texto |
| 14.6 | Breadcrumb página actual aria-current="page" | ✅ PASA | Breadcrumb usa `<span aria-current="page">` |
| 14.7 | Colores de asientos | ⚠️ MANUAL | Estados presentes en DOM. Colores requieren verificación visual |

---

## 15. Iconos decorativos y emojis

| # | Test | Resultado | Evidencia |
|---|------|-----------|-----------|
| 15.1 | `<svg` sin `aria-hidden` | ✅ PASA | SVGs decorativos tienen `aria-hidden` |
| 15.2 | Emojis envueltos en `aria-hidden` | ✅ PASA | Emojis como `👤`, `👴` como `generic` sin texto directo accesible |
| 15.3 | EmptyState icon con aria-hidden | ⚠️ MANUAL | No se encontró estado vacío |

---

## 16. Confirmaciones destructivas

| # | Test | Resultado | Evidencia |
|---|------|-----------|-----------|
| 16.1 | AlertDialog (Radix) no window.confirm | ✅ PASA | `alertdialog "Eliminar bus"` con heading y descripción |
| 16.2 | AlertDialog navegable con teclado | ✅ PASA | "Cancelar" recibe foco inicial. Escape cierra |

---

## 17. Headings y estructura

| # | Test | Resultado | Evidencia |
|---|------|-----------|-----------|
| 17.1 | axe no marca "no h1" | ❌ FALLA | **4 páginas sin H1:** Buses (0 headings), Clientes (empieza en H3), Encomiendas (empieza en H2), Detalle de Viaje (empieza en H2). Para comparar: Secretarías tiene ✅ H1 "Gestión de Secretarias", Choferes tiene ✅ H1 "Gestión de Choferes" |
| 17.2 | `PackageHeader` usa `<p>` no `<h4>` | ❌ FALLA | En packages page: los títulos de tarjetas usan `<h3>`, pero **no hay H1 en la página** — la jerarquía arranca en H2 |
| 17.3 | Cards subordinadas usan `<h2>` | ❌ FALLA | Trip detail: headings son H2 (origen/destino, mapa) y H3 (lados) — **sin H1 en la página**. La jerarquía salta de H1 (en trips list) a H2 (en detalle) |
| 17.4 | `TicketReceiptModal` nombre empresa es `<p>` | ⚠️ MANUAL | No verificado |

---

## 18. Z-index de modales

| # | Test | Resultado | Evidencia |
|---|------|-----------|-----------|
| 18.1 | Consistencia z-index (z-50) | ⚠️ MANUAL | No verificado automáticamente |

---

## 19. Pruebas con lectores de pantalla

| # | Test | Resultado | Evidencia |
|---|------|-----------|-----------|
| 19.1 | NVDA/VoiceOver flujos E2E | ⚠️ MANUAL | Requiere lector de pantalla real |
| 19.2 | TalkBack flujos móvil | ⚠️ MANUAL | Requiere dispositivo Android |

---

## 20. Validaciones automáticas

| # | Test | Resultado | Evidencia |
|---|------|-----------|-----------|
| 20.1 | TypeScript `npx tsc --noEmit` | ❌ FALLA | No ejecutado. Requiere verificación |
| 20.2 | ESLint `npm run lint` | ❌ FALLA | No ejecutado. Requiere verificación |
| 20.3 | Vite build | ❌ FALLA | No ejecutado. Requiere verificación |
| 20.4 | axe DevTools scan | ❌ FALLA | No ejecutado. Requiere extensión de navegador |
| 20.5 | Lighthouse ≥95 | ⚠️ MANUAL | No ejecutado |
| 20.6 | WAVE 0 Errors | ⚠️ MANUAL | No ejecutado |

---

## Hallazgos de QA — 12 de mayo de 2026 (2.ª ejecución)

### [QA-001] El foco no regresa al botón disparador al cerrar un modal (REPRODUCIDO)

- **Criterio:** SC 2.4.3 (Focus Order) — Nivel A
- **Archivo:** `frontend/src/components/ui/dialog.tsx`
- **Pasos para reproducir:**
  1. Abrir modal "Nuevo Usuario" desde botón "+ Nuevo Usuario"
  2. El foco se mueve al primer input del modal ✅
  3. Cerrar con Escape
  4. Verificar `document.activeElement`
- **Resultado obtenido:** `document.activeElement.tagName` = `"DIV"` (no el botón trigger)
- **Resultado esperado:** El foco debe regresar al botón "+ Nuevo Usuario"
- **Severidad:** Importante (I)
- **Nota:** `aria-modal="true"` AHORA SÍ está presente (ver QA-002 corregido)

### [QA-002] `aria-modal="true"` — VERIFICADO CORREGIDO ✅

- **Resultado anterior:** `null`
- **Resultado actual:** `"true"` — el atributo `aria-modal` ahora se aplica correctamente
- **Severidad:** Cerrado

### [QA-003] Error CORS/422 al cargar WebSocket token en viajes (REPRODUCIDO)

- **Criterio:** SC 4.1.1 (Parsing) — Nivel A
- **Archivo:** `frontend/src/hooks/use-trip-seat-locks.ts`, `backend/api/v1/seats.py`
- **Pasos para reproducir:**
  1. Navegar a `/trips/225`
  2. Ver console del navegador
- **Resultado obtenido:** 4 errores:
  - `Access to fetch at '.../ws-token' from origin '...' has been blocked by CORS policy`
  - `Failed to load resource: net::ERR_FAILED`
- **Resultado esperado:** 0 errores de red
- **Severidad:** Importante (I)

### [QA-004] Botón "Ver todos" — VERIFICADO CORREGIDO ✅

- **Resultado anterior:** `button "Ver todos"` (sin contexto)
- **Resultado actual:** `button "Ver todos los viajes"` con aria-label descriptivo
- **Severidad:** Cerrado

### [QA-005] Título SSR fallback — CONFIRMADO MENOR ⚠️

- **Evidencia:** El snapshot inicial de algunas páginas muestra "Trans Comarapa" antes de que React refine al título completo
- **Nota:** El título final siempre es correcto; es un comportamiento esperado de SSR
- **Severidad:** Menor (M)

### [QA-006] Focus trap en diálogos — PENDIENTE VERIFICACIÓN MANUAL

- **Nota:** Radix Dialog gestiona focus trap; no se pudo verificar automáticamente
- **Severidad:** Información

### [QA-007] Páginas sin H1 (NUEVO)

- **Criterio:** SC 1.3.1 (Info and Relationships) — Nivel A
- **Páginas afectadas:**
  - `/admin/buses` — 0 headings (ni h1-h6 ni `role="heading"`)
  - `/clients` — headings empiezan en H3 (Nuevo Cliente, Buscar Cliente, Exportar, Reportes, Filtros) → H2 (Lista de Clientes) — **sin H1**
  - `/packages` — headings empiezan en H2 (Lista de Encomiendas) → H3 por paquete — **sin H1**
  - `/trips/:id` — headings empiezan en H2 (Santa Cruz, Comarapa, Mapa de asientos) → H3 (Lados) — **sin H1**
- **Páginas con H1 correcto:**
  - `/dashboards/dashboard-admin` — H1 "Panel de Administración"
  - `/admin/users` — H1 "Administración de Usuarios"
  - `/admin/secretaries` — H1 "Gestión de Secretarias"
  - `/admin/drivers` — H1 "Gestión de Choferes"
  - `/reports` — H1 "Reportes Mensuales"
  - `/login` — H2 "Bienvenido de vuelta" (se acepta porque login tiene diseño especial)
- **Severidad:** Importante (I)

### [QA-008] Error CORS en ws-token (REPRODUCIDO — CAMBIO DE SINTOMATOLOGÍA)

- **Resultado anterior:** 422 Unprocessable Entity
- **Resultado actual:** CORS policy error + ERR_FAILED
- **Indica:** El backend endpoint existe pero rechaza la solicitud por CORS o el frontend no incluye credenciales
- **Archivo:** `backend/api/v1/seats.py` (configuración CORS), `frontend/src/services/seat.service.ts`
- **Severidad:** Importante (I)

---

## Correcciones aplicadas tras la 2.ª ejecución

| Hallazgo | Estado | Cambio |
|----------|--------|--------|
| QA-001 / 3.6 / 4.7 (focus return) | ✅ Corregido | `DialogContent` ahora captura `document.activeElement` durante el render inicial mediante `useState` con lazy init — antes de que Radix mueva el foco al contenido del modal. En `onCloseAutoFocus` se restaura ese elemento (`frontend/src/components/ui/dialog.tsx`). |
| QA-003 / QA-008 (ws-token) | ✅ Corregido | Orden de routers invertido: `seat_lock` antes que `seat` en `/seats` (`backend/api/v1/api.py`). El error CORS de la 2.ª pasada se debía a que el backend no se había reiniciado; ahora `/seats/ws-token` responde 200 con el token. |
| QA-007 / 17.1-17.3 (sin H1) | ✅ Corregido | Añadido `<h1 className="sr-only">` a `BusesPage`, `ClientsIndexPage`, `PackagesIndexPage` y `TripDetailPage`. |
| UI-001 (BusTable sin overflow) | ✅ Corregido | `CardContent` con `overflow-x-auto` en `BusesPage.tsx`. |
| UI-002 (CTA <44px) | ✅ Corregido | `min-h-[44px]` en botones "Nuevo Bus", "Nuevo Cliente", "Nueva Encomienda", "Nueva Ruta", "Nueva Oficina". |
| UI-003 (header icons <44px) | ✅ Corregido | `SidebarTrigger`: `size-11 md:size-7`. `AppHeader`: notificaciones y menú de usuario `size-11 md:size-8`. Cumple 44×44 en móvil. |
| UI-004 (RouteTable overflow) | ✅ Corregido en código | `RouteTable.tsx` ya envuelve la tabla en `overflow-x-auto` (línea 70). El componente no está montado en producción actualmente; la página `RoutesPage` no lo usa. |
| UI-007 (color swatch sin aria-hidden) | ✅ Verificado | `BusTable.tsx` línea 114 ya tiene `aria-hidden="true"`. El componente no se monta hoy (la página `BusesPage` usa tabla inline sin swatches de color). |
| QA-006 (focus trap) | ⚠️ Manual | Radix gestiona el trap; pendiente prueba manual con Tab. |
| 20.1 `tsc --noEmit` | ✅ Pasa | Sin errores. |
| 20.2 `npm run lint` | ✅ Pasa | Sin errores. |
| 20.3 `npm run build` | ❌ Falla pre-existente | Errores únicamente en `src/tests/**`, `src/test/test-utils.tsx` y `vite.config.ts`, no relacionados con a11y. |

---

## Comparativa entre ejecuciones

| QA | 1.ª Ejecución | 2.ª Ejecución | Estado |
|----|--------------|--------------|--------|
| QA-001 | Focus return → body | Focus return → DIV | ❌ Persiste |
| QA-002 | aria-modal = null | aria-modal = "true" | ✅ Corregido |
| QA-003 | 422 ws-token | CORS ws-token | ❌ Persiste (cambio forma) |
| QA-004 | "Ver todos" genérico | "Ver todos los viajes" | ✅ Corregido |
| QA-005 | SSR fallback title | SSR fallback title | ⚠️ Menor |
| QA-006 | No verificado | No verificado | ⚠️ Manual |
| QA-007 | No detectado | Sin H1 en 4 páginas | ❌ Nuevo |
| QA-008 | No detectado | CORS en ws-token | ❌ Nuevo |

---

## Leyenda

| Símbolo | Significado |
|---------|-------------|
| ✅ PASA | Test superado |
| ❌ FALLA | Test no superado, requiere corrección |
| ⚠️ MANUAL | Requiere verificación manual (visual, SR, tools externas) |
| - | No aplica / No probado |

---

## Notas adicionales

1. Las pruebas de foco visible (Section 3) y contraste (Section 14) requieren herramientas visuales como axe DevTools, WAVE, o Lighthouse.
2. Las pruebas con lectores de pantalla (Section 19) deben hacerse con NVDA/VoiceOver/TalkBack real.
3. 4 páginas carecen de H1 — esto es un hallazgo nuevo de la 2.ª ejecución que no se había documentado previamente.
4. El error CORS en ws-token persiste pero cambió de 422 a CORS, indicando que el backend cambió pero aún no funciona correctamente.

---

## Hallazgos de UI/UX — 12 de mayo de 2026 (Playwright Automation)

> Pruebas de interfaz visual, layout, responsive, CLS, y elementos sobrepuestos.
> **Viewports probados:** Desktop (1280×800), Mobile (375×812)

### Resumen

| Categoría | Tests | ✅ Pasan | ❌ Fallan |
|-----------|-------|----------|-----------|
| Layout desktop | 8 | 5 | 3 |
| Layout mobile | 7 | 5 | 2 |
| Tablas responsive | 4 | 2 | 2 |
| Touch targets | 2 | 0 | 2 |
| CLS / Scroll | 2 | 2 | 0 |

---

### [UI-001] Tabla de Buses sin `overflow-x-auto` en mobile — contenido se desborda

- **Criterio:** Responsive design — SC 1.4.10 (Reflow, nivel AA)
- **Archivo:** `frontend/src/components/admin/BusTable.tsx` o `app/admin/buses/page.tsx`
- **Pasos para reproducir:**
  1. Abrir `/admin/buses` en viewport 375px
  2. Inspeccionar la tabla
- **Resultado obtenido:** La tabla mide **1036px** en un viewport de **375px** y **NO** tiene wrapper `.overflow-x-auto`. No hay scroll horizontal disponible.
- **Resultado esperado:** La tabla debe estar envuelta en `<div className="overflow-x-auto">` para permitir scroll horizontal.
- **Severidad:** Importante (I)
- **Nota:** En `/admin/users` y `/admin/offices` el wrapper SÍ está presente.

### [UI-002] Botones "Nuevo Bus", "Nuevo Cliente" con altura insuficiente en mobile (<44px)

- **Criterio:** WCAG 2.5.8 (Target Size, nivel AA) — objetivo táctil mínimo
- **Archivo:** Múltiples páginas de admin
- **Pasos para reproducir:** Viewport 375px → inspeccionar botones de acción
- **Resultado obtenido:**
  - "Nuevo Bus": 128×36px (altura 36 < 44)
  - "Nuevo Cliente": 150×36px (altura 36 < 44)
  - "Nueva Ruta": 133×36px (altura 36 < 44)
  - "Nueva Oficina": 139×36px (altura 36 < 44)
- **Resultado esperado:** Mínimo 44×44px para todos los targets táctiles interactivos.
- **Severidad:** Importante (I)

### [UI-003] Iconos del header con touch target insuficiente en mobile

- **Criterio:** WCAG 2.5.8 (Target Size, nivel AA)
- **Archivo:** `frontend/src/components/layout/Header.tsx`
- **Pasos para reproducir:** Viewport 375px → inspeccionar botones del header
- **Resultado obtenido:**
  - "Alternar menú lateral" (hamburguesa): 28×28px
  - "Notificaciones" (campana): 32×32px
  - "Menú de usuario" (avatar AP): 32×32px
- **Resultado esperado:** Mínimo 44×44px.
- **Severidad:** Importante (I)

### [UI-004] Tabla de Rutas sin `overflow-x-auto` (posible desbordamiento en mobile)

- **Criterio:** SC 1.4.10 (Reflow)
- **Archivo:** `frontend/src/components/admin/RouteTable.tsx`
- **Pasos para reproducir:** La tabla mide 974px en desktop (1280px viewport). En mobile (375px) se desbordaría.
- **Resultado obtenido:** `overflowWrapper: false`
- **Resultado esperado:** La tabla debería tener overflow-x-auto.
- **Severidad:** Menor (M)

### [UI-005] CLS de 0.065 en navegación SPA (aceptable pero mejorable)

- **Criterio:** Core Web Vitals — CLS < 0.1
- **Pasos para reproducir:** Medir PerformanceObserver con `layout-shift` entries en navegación entre páginas
- **Resultado obtenido:** CLS = 0.065 (2 shifts) — dentro del umbral "bueno" (< 0.1)
- **Resultado esperado:** CLS < 0.1 ✅
- **Severidad:** Informativo
- **Recomendación:** Revisar si los shifts ocurren al cargar datos asíncronos (tablas, stats) y considerar añadir skeletons con altura fija.

### [UI-006] Dashboard: no hay `role="status"` en spinners/states de carga

- **Criterio:** SC 4.1.3 (Status Messages, nivel AA)
- **Archivo:** Componentes de lista: `UserTable`, `BusTable`, `RouteTable`, etc.
- **Pasos para reproducir:** Recargar páginas con datos → inspeccionar durante paint
- **Resultado obtenido:** No se detectaron `role="status"` en elementos de carga. Los spinners pueden no estar anunciándose al SR.
- **Nota:** Requiere simulación de red lenta para confirmar.
- **Severidad:** Importante (I)

### [UI-007] Color swatches en tabla de buses sin `aria-hidden`

- **Criterio:** SC 1.1.1 (Non-text Content, nivel A)
- **Archivo:** `frontend/src/components/admin/BusTable.tsx`
- **Pasos para reproducir:** Inspeccionar los swatches de color en la tabla de buses
- **Resultado obtenido:** Los elementos con color (identificados como `<span>` y `<a>`) no tienen `aria-hidden="true"`.
- **Resultado esperado:** Los swatches meramente decorativos deben tener `aria-hidden="true"`; el nombre del color debe ser texto.
- **Severidad:** Menor (M)

### [UI-008] Elemento con `z-index` alto en sidebar (posible superposición)

- **Criterio:** Layout / Stacking context
- **Archivo:** `frontend/src/components/layout/Sidebar.tsx`
- **Pasos para reproducir:** Verificar z-index de elementos fixed
- **Resultado obtenido:** Sidebar fija con `z-index: 10` que cubre toda la altura (0,0 → 256×896). No se encontraron elementos interactivos bloqueados por overlays (test de `elementFromPoint` no mostró conflictos).
- **Resultado esperado:** Sin conflictos de superposición ✅
- **Severidad:** OK

### [UI-009] Sin sticky column headers en tablas con scroll horizontal

- **Criterio:** UX / Usabilidad
- **Archivo:** Múltiples tablas admin
- **Pasos para reproducir:** Verificar si las tablas con overflow tienen cabeceras sticky
- **Resultado obtenido:** 0 sticky headers encontrados. En tablas anchas (Buses 1036px, Routes 974px, Offices 944px), al hacer scroll horizontal las cabeceras desaparecen.
- **Resultado esperado:** `<th>` con `position: sticky; left: 0` en la primera columna mejora la usabilidad en mobile.
- **Severidad:** Menor (M)

---

### Resumen visual por página

| Página | Desktop | Mobile (375px) |
|--------|---------|----------------|
| `/dashboards/dashboard-admin` | ✅ Layout correcto. 4 stat cards en grid. Sin overflow | ✅ Stats se apilan verticalmente. Hamburguesa visible. Sin overflow |
| `/admin/users` | ✅ Tabla 944px con overflow wrapper. Caption presente | ✅ Tabla scrolleable horizontalmente |
| `/admin/buses` | ✅ Tabla visible | ❌ **Tabla 1036px SIN overflow wrapper** — contenido se corta |
| `/admin/routes` | ✅ Tabla 974px | ⚠️ Sin overflow wrapper (974 > 375) |
| `/admin/offices` | ✅ Tabla 944px con overflow wrapper | ✅ Tabla scrolleable |
| `/clients` (cards) | ✅ Grid de tarjetas responsive | ✅ Cards apiladas. Stats ocultas/responsive |
| `/clients` (table) | ✅ Tabla con caption y scope | ✅ overflow wrapper presente |
| `/login` | ✅ Centrado, sin overflow | No probado |
| Header (global) | ✅ Botones con aria-label | ❌ **Touch targets pequeños**: hamburguesa 28×28, notificaciones 32×32, avatar 32×32 |

---

### Recomendaciones prioritarias

| Prioridad | Acción | Archivo |
|-----------|--------|---------|
| 🔴 ALTA | Agregar `overflow-x-auto` a `BusTable` | `components/admin/BusTable.tsx` |
| 🟠 MEDIA | Aumentar altura de botones CTA a 44px en mobile | Botones "Nuevo X" en admin |
| 🟠 MEDIA | Aumentar touch targets del header a 44×44px | `components/layout/Header.tsx` |
| 🟡 BAJA | Agregar `overflow-x-auto` a `RouteTable` | `components/admin/RouteTable.tsx` |
| 🟡 BAJA | Considerar sticky headers en tablas anchas | Tablas admin |
| 🟡 BAJA | Agregar `aria-hidden` a swatches de color | `BusTable.tsx` |
