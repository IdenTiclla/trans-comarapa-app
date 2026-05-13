# Manual Test Plan — Accesibilidad WCAG 2.2 AA

> Verificación manual de todos los cambios derivados de `../implementation-plans/archive/accessibility-wcag-2.2-aa.plan.md`.
> Cada sección corresponde a un grupo de hallazgos (B = bloqueante, I = importante, M = menor) e indica criterios de aceptación.

## Preparación

1. `make restart` (Tailwind v4 regenera los tokens del `@theme` al reiniciar).
2. `make seed` si la BD está vacía.
3. Abrir http://localhost:3000.
4. Usuarios: `{role}@transcomarapa.com` / `123456` — admin1, secretary1.santacruz, driver1, assistant1, client1.
5. Herramientas recomendadas (instalar antes):
   - **axe DevTools** (extensión Chrome) — escaneo automático
   - **WAVE** (https://wave.webaim.org/extension/)
   - **NVDA** (Windows) + Firefox / **VoiceOver** (macOS) + Safari / **TalkBack** (Android) + Chrome
   - **Lighthouse** (DevTools nativo)
   - DevTools → Rendering → "Emulate CSS media feature `prefers-reduced-motion`"

---

## 1. Landmarks, navegación SPA y skip link (B-04, B-05, B-06, B-07, M-04, M-05)

| # | Acción | Resultado esperado |
|---|---|---|
| 1.1 | Cargar cualquier página interna y pulsar **Tab** una vez | Aparece arriba-izquierda un enlace **"Saltar al contenido principal"** con borde primario |
| 1.2 | Pulsar **Enter** sobre el skip link | El foco salta al área `<main id="main-content">` |
| 1.3 | DevTools → Accessibility Tree | Existe exactamente **un** `<main>`, un `<nav aria-label="Navegación principal">`, un `<header>`, y un `<aside>` opcional con `aria-label` |
| 1.4 | Navegar a otra ruta con SR activo | El SR anuncia el nuevo título de la página (route announcer) |
| 1.5 | LoginLayout y PrintLayout | Ambos tienen `<main>` (no `<div>`); el panel decorativo del login tiene `aria-hidden="true"` |

---

## 2. Idioma, título de página y atributos `lang` (B-01, B-02, M-06)

| # | Acción | Resultado esperado |
|---|---|---|
| 2.1 | View source de `index.html` | `<html lang="es">` y `<title>Trans Comarapa - Sistema de Gestión de Transporte</title>` |
| 2.2 | Navegar entre páginas | `document.title` cambia siguiendo el patrón `"{Título de página} · Trans Comarapa"` (~34 páginas) |
| 2.3 | Imprimir un boleto desde `/tickets/:id` | La ventana de impresión tiene `<html lang="es">` (`lib/print.ts`) |

---

## 3. Foco visible y navegación por teclado (B-09, B-11, B-12, B-19, B-22, B-23, I-15, I-44, I-45)

### 3.1 General
- Desconectar el ratón. Recorrer la app sólo con **Tab/Shift+Tab/Enter/Space/Esc/Flechas**.
- Cada control con foco debe mostrar un anillo azul visible (token `--ring`).

### 3.2 Casos críticos

| # | Acción | Resultado esperado |
|---|---|---|
| 3.1 | Tab desde el inicio del header hasta el último botón del footer | No hay "saltos al vacío"; el foco permanece visible |
| 3.2 | `FormDatePicker` | Anillo de foco visible al tabularlo; el calendario abre con `role="dialog"` y permite navegar con flechas |
| 3.3 | `calendar-view` (planificación) | Botones prev/next con `aria-label`; flechas mueven el día seleccionado |
| 3.4 | `SeatLayoutEditor` (Bus → Paso 2) | Cada celda es focusable y operable con **Enter/Space** — ya no es mouse-only |
| 3.5 | `ClientTypePicker` (Vender Boleto) | Flechas **← →** alternan la selección entre "Cliente Existente" y "Nuevo" sin tabular |
| 3.6 | Modales custom (`AppModal`, `TicketSaleModal`) | El body **bloquea scroll** al abrir; Esc cierra; el foco vuelve al disparador al cerrar |
| 3.7 | Imprimir desde `TripSheetPage` | Tras `printWindow.close()` el foco regresa a la ventana principal (`window.focus()`) |
| 3.8 | `LoginPage` y `SearchResultsView` | No tienen `autoFocus`; el foco no se mueve automáticamente al cargar |

---

## 4. ARIA de diálogos y migración a Radix (B-08, B-17)

Probar cada modal **sólo con teclado** + Inspector → debe tener `role="dialog"` y `aria-modal="true"`:

| Modal | Ruta para abrirlo |
|---|---|
| `ClientModal` (crear/editar) | `/clients` → Nuevo Cliente |
| `ClientViewModal` | `/clients` → ver un cliente |
| `TicketFormModal` | `/tickets` → Crear Nuevo Boleto |
| `TicketSaleModal` | Detalle de viaje → seleccionar asiento → Vender |
| `TicketReceiptModal` | Tras vender un boleto |
| Modales de páginas admin (`/admin/users`, `/admin/buses`, etc.) | Crear/Editar en cada sección |

Para cada uno verificar:
- [x] Esc cierra el modal
- [x] Tab queda atrapado dentro
- [x] El foco regresa al botón que abrió el modal
- [x] El botón "X" tiene label accesible **"Cerrar"** (no "Close")
- [x] Inspector NO muestra `<div className="fixed inset-0…">` propio sin `role="dialog"`

---

## 5. Formularios — labels, errores y autocompletado (B-10, I-04, I-05, I-07, I-17, I-18, I-20, I-47, M-03, M-17, M-20)

| # | Acción | Resultado esperado |
|---|---|---|
| 5.1 | Login → enviar vacío | Bajo cada input aparece error rojo; el SR lo anuncia (`role="alert"` + `aria-describedby` + `aria-invalid`) |
| 5.2 | Asterisco rojo de campos requeridos | NO se lee por el SR (tiene `aria-hidden="true"`); el SR sólo anuncia "requerido" |
| 5.3 | `Login` y `Perfil` → campos email/password | Chrome ofrece autocompletar (atributos `autocomplete="email"`, `autocomplete="current-password"` correctos) |
| 5.4 | `UserForm` (admin) | Inputs tienen `autocomplete="given-name"`, `family-name`, `username`, `email`, `new-password`/`current-password` |
| 5.5 | Botones solo-icono (campana, avatar, lápiz editar, papelera eliminar) | Cada uno tiene `aria-label` descriptivo, incluyendo el nombre de la entidad ("Editar Juan Pérez") |
| 5.6 | `ClientSelector` (combobox) | Input con `role="combobox"`, `aria-expanded`, `aria-controls`; lista con `role="listbox"`; navegación con flechas y Enter |
| 5.7 | Errores rojos (`bg-red-50`) en páginas admin/dashboards | Cada contenedor tiene `role="alert"` y se anuncia automáticamente |

---

## 6. Tablas semánticas (B-13, B-20, I-02, I-46)

Verificar en cada tabla:
1. Cada `<th>` de columna tiene `scope="col"`.
2. Cada `<table>` tiene `<caption className="sr-only">` con descripción.
3. La tabla está envuelta en `<div className="overflow-x-auto">` (scroll horizontal en móvil).

Tablas a revisar:
- `/admin/{users,buses,routes,drivers,assistants,secretaries,owners,offices}` → tablas principales
- `/admin/financial-dashboard`, `/admin/withdrawals`, `/admin/reports`
- `/clients` (vista tabla — usar el toggle de vista si está disponible)
- `/packages` → **Cobros Pendientes** (`PendingCollections`)
- Pestaña Pasajeros y Encomiendas en `TripCard` (asistente)
- `ManifestTable`, `PassengerTable` en reportes de viaje

Móvil (DevTools 375px):
- [x] La tabla de usuarios muestra Email, Rol y Creado **inline** (no oculto).
- [x] El header muestra el nombre de la página actual (breadcrumb desktop oculto).

---

## 7. Estados de carga y mensajes en vivo (B-14, I-12, I-13, I-23, I-24, I-27, I-41, M-12, M-14, M-15)

| # | Acción | Resultado esperado |
|---|---|---|
| 7.1 | Recargar `/admin/buses`, `/admin/routes`, `/admin/users`, dashboards | El SR anuncia "Cargando buses..." / "Cargando rutas..." (spinners tienen `role="status"` + `aria-live="polite"` + texto `sr-only`) |
| 7.2 | Skeletons (Card lists, OwnerSettlements) | Tienen `role="status"`, `aria-busy="true"` y `aria-hidden="true"` en los bloques internos |
| 7.3 | Paginación | El cambio de página se anuncia ("Mostrando 1 a 10 de 50 — página 1 de 5") |
| 7.4 | Buscar clientes / paquetes | El conteo de resultados se anuncia ("3 clientes encontrados") |
| 7.5 | Seleccionar 2 asientos | El SR anuncia "Asientos seleccionados: 1A, 3B" |
| 7.6 | Otro usuario bloquea un asiento (abrir 2 sesiones) | El SR anuncia el bloqueo en la pestaña secundaria |
| 7.7 | Dashboard polling | Stats en `DashboardStatCard` tienen `aria-live="polite"` |
| 7.8 | Descargar CSV de reportes / boletos | Toast confirma la descarga |

---

## 8. Tabs y wizards (I-26, I-28, I-29, I-40)

| # | Acción | Resultado esperado |
|---|---|---|
| 8.1 | Asistente → expandir un viaje → tabs (Pasajeros/Encomiendas/Verificación) | Cada tab tiene `role="tab"`, el panel `role="tabpanel"` con `aria-labelledby`. Flechas mueven entre tabs (roving tabindex) |
| 8.2 | `/admin/reports` → `ReportTabs` | Igual estructura ARIA; navegable con flechas |
| 8.3 | Crear Bus → wizard Paso 1 / Paso 2 (`BusFormHeader`) | El botón del paso activo tiene `aria-current="step"`; al cambiar, la región `aria-live` anuncia "Paso 2 de 2: Planilla de Asientos" |
| 8.4 | `BusFormStep2` con tabs de pisos (`DeckTab`) | Cada panel es `role="tabpanel"` con `aria-labelledby`; flechas funcionan |

---

## 9. Botones disabled informativos (I-43)

| # | Acción | Resultado esperado |
|---|---|---|
| 9.1 | Login con campos vacíos | El botón "Iniciar Sesión" disabled tiene `aria-describedby="login-submit-help"` apuntando al texto "Complete todos los campos…" — el SR lo lee al enfocarlo |
| 9.2 | "Cargar al Viaje" sin selección | `aria-describedby="package-assign-help"` con el texto "Seleccione al menos una encomienda…" |
| 9.3 | "Confirmar Encomienda" con formulario incompleto | `aria-describedby="package-form-help"` con "Complete los campos obligatorios…" |
| 9.4 | "Despachar Viaje" deshabilitado | Tiene `aria-describedby` apuntando a la razón del bloqueo |

---

## 10. Sidebar móvil y tooltips (I-30, I-33, I-34)

| # | Acción | Resultado esperado |
|---|---|---|
| 10.1 | DevTools 375px → abrir sidebar (hamburguesa) | Aparece un botón **X (Cerrar)** arriba-derecha del Sheet, visible y operable |
| 10.2 | Desktop colapsado → hover sobre cada ítem | Tooltip muestra el label |
| 10.3 | Desktop colapsado + SR | El SR lee cada ítem por el `aria-label` derivado del tooltip (no sólo "botón") |
| 10.4 | Header móvil 375px | Muestra el **nombre de la página actual** en lugar del breadcrumb (`<nav aria-label="Ubicación">`) |

---

## 11. Sesión, toasts y notificaciones (I-16, I-21, lección 011, M-23)

| # | Acción | Resultado esperado |
|---|---|---|
| 11.1 | DevTools → Application → borrar `refresh_token` → ejecutar acción que llame API | Aparece toast accesible "Su sesión ha expirado. Redirigiendo…" ANTES de redirigir a /login |
| 11.2 | Provocar varios errores y éxitos | Toasts tienen iconos (no sólo color); errores son `aria-live="assertive"`, info "polite" |
| 11.3 | Botón de cerrar de cada toast | Tiene `aria-label="Cerrar notificación"` (Sonner) |

---

## 12. Atajos de teclado y SR (M-08)

| # | Acción | Resultado esperado |
|---|---|---|
| 12.1 | Foco en `<input>`/`<textarea>`/elemento con `contenteditable` | Los atajos globales (`?`, `b`, etc.) **NO** se disparan mientras se escribe |
| 12.2 | Foco en un `role="combobox"` o `role="searchbox"` | Igual: los atajos no interceptan teclas |

---

## 13. Reducir movimiento (I-14)

| # | Acción | Resultado esperado |
|---|---|---|
| 13.1 | Activar `prefers-reduced-motion: reduce` (Sistema o DevTools) | Spinners, transiciones de diálogo, skeletons reducen su animación a ~0ms |
| 13.2 | Carousel del login | Se pausa con hover/foco |

---

## 14. Contraste y colores (B-03, I-08, I-09, I-10, I-11, I-42, I-48, M-24, M-27)

| # | Acción | Resultado esperado |
|---|---|---|
| 14.1 | Texto `text-muted-foreground` sobre `bg-card` | axe/WAVE no marca contraste insuficiente (≥5.5:1) |
| 14.2 | Anillo de foco `--ring` | Visible sobre fondos claros (~3.5:1) |
| 14.3 | Badges de estado (`bg-{green,red,yellow}-100 text-{...}-800`) | Pasan ≥4.5:1 (verificar con axe) |
| 14.4 | Indicadores animados (CashRegisterWidget "Caja Abierta", OwnerSettlements "Tiempo Real") | Tienen `role="status"` + `aria-label` que explica el estado, no sólo el ping animado |
| 14.5 | Color de bus en `BusTable` | Es un swatch decorativo con `aria-hidden`; el nombre del color va en texto |
| 14.6 | Breadcrumb página actual | Es `<span aria-current="page">`, no `role="link"` con `aria-disabled` |

### 14.7 — Colores de asientos (cambios pedidos por el usuario)

Abrir un viaje con tickets vendidos (`/trips/:id`) y verificar visualmente:

| Estado | Color esperado | Token | Notas |
|---|---|---|---|
| Disponible | Verde profundo (`#15803D`) | `--color-status-available` | Borde `/80`, fondo `/20` |
| Seleccionado | Azul primario | `--primary` | |
| **Reservado** | **Amarillo vibrante (`#EAB308`)** con borde amarillo lleno | `--color-status-medium` | Tinte `/25`. Badge "Reserv." sólido usa **texto oscuro** (`text-gray-900`) sobre amarillo |
| **Ocupado** | **Rojo oscuro (`#B91C1C`)** | `--color-status-full` | Borde `/80`, fondo `/20`. Badge "Ocupado" usa texto blanco |
| Bloqueado | Gris (`muted`) | | |

Adicional:
- En el `TripInfoCard` panel lateral, el contador "Reservados" se muestra en **amarillo oscuro/mostaza** (`text-yellow-700` = `#A16207`), no amarillo brillante (que sería ilegible sobre blanco).
- Verificar con axe que `text-yellow-700` sobre `bg-card` ≥ 4.5:1.
- La leyenda debajo del autobús muestra los 5 cuadros claramente diferenciados.

---

## 15. Iconos decorativos y emojis (B-16, I-19, M-01)

| # | Acción | Resultado esperado |
|---|---|---|
| 15.1 | Inspector → buscar `<svg` sin `aria-hidden="true"` | Solo SVGs con significado deben tener `role="img"` + `aria-label`; el resto debe estar oculto |
| 15.2 | Emojis (`💵💳📍👶👤🚌📦🕐` etc.) | Cada uno está envuelto en `<span aria-hidden="true">` |
| 15.3 | Icono de `EmptyState` | Tiene `aria-hidden="true"` |

---

## 16. Confirmaciones destructivas (I-06)

| # | Acción | Resultado esperado |
|---|---|---|
| 16.1 | Eliminar un boleto, bus, usuario, secretaría, conductor, asistente, oficina, ruta, paquete, cliente | Aparece un `AlertDialog` (Radix) — NO un `window.confirm()` nativo |
| 16.2 | El `AlertDialog` | Es navegable con teclado, tiene título y descripción, botón "Cancelar" recibe el foco inicial |

---

## 17. Headings y estructura (I-03, I-38, I-39, M-19)

| # | Acción | Resultado esperado |
|---|---|---|
| 17.1 | axe DevTools en cada página | No marca "headings not in order" ni "page does not have h1" |
| 17.2 | `PackageHeader` | El "Resumen de Encomienda" es `<p>`, NO `<h4>` antes del `<h1>` |
| 17.3 | `TicketDetailPage` | Cards subordinadas usan `<h2>`, no `<h3>`; sólo hay un `<h1>` |
| 17.4 | `TicketReceiptModal` + `TicketDisplay` | El nombre de empresa es `<p>`, no `<h1>` (evita duplicado) |

---

## 18. Z-index de modales (M-25)

- Abrir `TicketReceiptModal` después de un `TicketSaleModal`. El recibo aparece encima, pero usando `z-50` (consistente). No hay `z-[70]` residual.

---

## 19. Pruebas con lectores de pantalla — flujos end-to-end

Cada flujo se prueba con SR activado de inicio a fin **sin mirar la pantalla** (cubrirla con la mano):

### 19.1 NVDA + Firefox (Windows) o VoiceOver + Safari (macOS)
- [ ] Login → dashboard → ver mis viajes
- [ ] Vender un boleto a un cliente nuevo (2 asientos)
- [ ] Cancelar un boleto vendido
- [ ] Registrar una encomienda con 2 items
- [ ] Buscar y abrir el detalle de un cliente
- [ ] Cerrar sesión

### 19.2 TalkBack + Chrome (Android)
- [ ] Login en pantalla pequeña
- [ ] Abrir sidebar, navegar a `/packages`, registrar una entrega
- [ ] Cerrar sesión

---

## 20. Validaciones automáticas (gate antes de cerrar el plan)

| Herramienta | Comando / Cómo | Esperado |
|---|---|---|
| **TypeScript** | `cd frontend && npx tsc --noEmit` | 0 errores |
| **ESLint** | `cd frontend && npm run lint` | Solo el warning pre-existente de `use-trip-seat-locks.ts`; sin errores `jsx-a11y` |
| **Vite build** | `cd frontend && npm run build` | Build OK |
| **axe DevTools** | "Scan all of page" en: login, admin dashboard, secretary dashboard, `/admin/users`, `/admin/buses`, `/clients`, `/packages`, `/trips/:id`, `/tickets/:id` | 0 violations críticas / serias |
| **Lighthouse** | DevTools → Lighthouse → Accessibility | ≥ 95 en cada ruta principal |
| **WAVE** | Extensión navegador | 0 Errors, 0 Contrast Errors |

---

## Convención para reportar hallazgos

Si una prueba falla, anotarlo en el plan de implementación (`accessibility-wcag-2.2-aa.plan.md`) bajo una nueva sección **"Hallazgos de QA — {fecha}"** con:

```markdown
### [QA-NNN] Título corto
- **Criterio:** SC X.Y.Z (nivel)
- **Archivo:** `ruta/al/archivo.tsx:linea`
- **Pasos para reproducir:** …
- **Resultado obtenido vs esperado:** …
- **Severidad:** Bloqueante / Importante / Menor
```

Luego crear una lección en `docs/lessons/NNN-short-description.md` si la regresión tiene una causa-raíz reusable.

---

## Cobertura

Este plan cubre los 75+ hallazgos del WCAG audit:
- **23 Bloqueantes** (B-01 a B-23) — secciones 1, 2, 3, 4, 5, 6, 7, 8, 14, 15
- **44 Importantes** (I-01 a I-48) — secciones 3, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 16, 17
- **24 Menores** (M-01 a M-27) — secciones 1, 2, 11, 12, 13, 14, 15, 18

Más los cambios visuales de colores de asientos (sección 14.7) y la migración completa de 5 modales custom a Radix Dialog (sección 4).
