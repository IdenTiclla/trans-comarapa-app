# Plan: BookingsPage - Rediseño y Funcionalidad Completa

## Contexto

La página `/bookings` es la interfaz de gestión de reservas para Admin y Secretaria. Actualmente existe (`BookingsPage.tsx`, 807 líneas) con funcionalidad básica pero con problemas de UX, estados incompletos y lógica fragmentada. El objetivo es entregar una página completamente funcional con excelente experiencia de usuario.

**Audiencia:** Admin y Secretaria
**Archivo principal:** `frontend-react/src/pages/BookingsPage.tsx`

---

## Problemas Actuales

1. **Stats section**: usa `apiFetch` directo sin manejo de error consistente; comparación con día anterior frágil
2. **Filtros**: el panel de filtros avanzados está oculto por defecto y el UX es confuso
3. **Vista tabla**: sin columnas ordenables, sin acciones claras por fila
4. **Vista cards**: diseño básico sin jerarquía visual clara
5. **Estados vacíos / error**: sin componentes dedicados
6. **Loading**: sin skeleton loaders en stats ni en la lista
7. **Modal de edición**: comparte estado con creación causando bugs potenciales
8. **Paginación**: implementación manual redundante
9. **Cancelación de ticket**: no integrada correctamente (debe usar `PUT /tickets/:id/cancel`)

---

## Enfoque de Implementación

Reescribir `BookingsPage.tsx` manteniendo la misma ruta y los mismos servicios/componentes existentes, pero con arquitectura clara por secciones.

---

## Secciones de la Página

### 1. Header
- Título "Gestión de Reservas" + descripción
- Botón "Nueva Reserva" (abre TicketSaleModal existente)
- Botón "Exportar CSV" con estado de loading

### 2. Stats Row (4 tarjetas con DashboardStatCard)
- **Confirmadas hoy** (verde, icono CheckCircle)
- **Pendientes** (amarillo, icono Clock)
- **Canceladas hoy** (rojo, icono XCircle)
- **Ingresos hoy** (azul, icono DollarSign)
- Skeleton loader mientras carga
- Manejo de error con fallback a `--`

### 3. Barra de Búsqueda y Filtros
- Input de búsqueda (nombre cliente, ID, asiento) con debounce 300ms
- Filtros siempre visibles en fila: `Select` de estado + `DatePicker` desde/hasta + `Select` método pago
- Botón "Limpiar filtros" solo visible cuando hay filtros activos
- Toggle vista: tabla / cards (iconos shadcn/ui)

### 4. Lista de Tickets

#### Vista Tabla (default desktop)
Columnas: `#ID` | `Cliente` | `Ruta` | `Viaje` | `Asiento` | `Estado` | `Precio` | `Pago` | `Acciones`
- Badge de estado con colores: confirmed=verde, pending=amarillo, cancelled=rojo
- Acciones por fila: Ver, Editar, Cancelar (iconos + tooltips)
- Filas clickeables para ver detalle
- Columnas ordenables: fecha, precio, estado

#### Vista Cards (mobile-friendly)
- Cards con: ruta (origen→destino), fecha/hora, cliente, asiento, badge estado, precio
- Acciones en menú dropdown (DropdownMenu de shadcn)

### 5. Paginación
- Controles: anterior / página actual / siguiente
- Selector de items por página: 10 / 25 / 50
- Texto: "Mostrando X-Y de Z resultados"

### 6. Empty State
- Cuando no hay tickets: ilustración + mensaje + botón "Crear primera reserva"
- Cuando no hay resultados para filtros: mensaje + botón "Limpiar filtros"

### 7. Error State
- Banner de error con botón "Reintentar"

---

## Flujos Modales

### Ver ticket (detalles)
- Usar `TicketModal` existente en modo `'details'`
- Muestra `TicketDisplay` con opción de imprimir

### Cancelar ticket
- Usar `TicketModal` existente en modo `'cancel'`
- Llama a `ticketService.update(id, { state: 'cancelled' })` o el endpoint `PUT /tickets/:id/cancel`
- Actualiza lista localmente sin re-fetch completo

### Crear ticket (nueva reserva)
- Abrir `TicketSaleModal` existente
- Soportar URL params: `?trip_id=X&action=sell|reserve&seat_number=Y`

### Editar ticket
- Modal inline con campos: estado, método de pago, precio
- Llama a `ticketService.update(id, data)`

---

## Servicios y Hooks a Usar

| Uso | Función | Archivo |
|-----|---------|---------|
| Cargar tickets | `ticketService.getAll(params)` | `services/ticket.service.ts` |
| Actualizar ticket | `ticketService.update(id, data)` | `services/ticket.service.ts` |
| Cancelar ticket | `ticketService.update(id, {state:'cancelled'})` | `services/ticket.service.ts` |
| Stats | `statsService.getBookingsStatsComparison()` | `services/stats.service.ts` |
| Exportar CSV | generación local desde datos filtrados | — |
| Clientes | `clientService.getAll()` | `services/client.service.ts` |
| Viajes | `tripService.getAll()` | `services/trip.service.ts` |

**Componentes existentes a reutilizar:**
- `TicketDisplay.tsx` — visualización imprimible
- `TicketModal.tsx` — modal detalles/cancelación
- `TicketSaleModal.tsx` — modal creación
- `DashboardStatCard.tsx` — tarjetas de stats

---

## Archivos a Modificar

| Archivo | Acción |
|---------|--------|
| `frontend-react/src/pages/BookingsPage.tsx` | Reescritura completa |
| `frontend-react/src/components/tickets/TicketModal.tsx` | Verificar y ajustar la acción de cancelar |

---

## Estructura del Nuevo Componente

```
BookingsPage
├── useEffect: cargar stats + tickets al montar y al cambiar filtros
├── Estado:
│   ├── tickets[], total, page, pageSize
│   ├── stats { confirmed, pending, cancelled, revenue }
│   ├── filters { search, status, dateFrom, dateTo, paymentMethod }
│   ├── viewMode: 'table' | 'cards'
│   ├── loading: { stats, list }
│   ├── error: string | null
│   └── modals: { create, view, edit, cancel } + selectedTicket
├── Header (título + acciones)
├── StatsRow (4x DashboardStatCard)
├── FilterBar (búsqueda + filtros + toggle vista)
├── TicketTable | TicketCards (condicional)
├── Pagination
└── Modales (TicketSaleModal, TicketModal, EditModal)
```

---

## Detalles Técnicos

- **Debounce** en búsqueda: `useCallback` + `setTimeout` 300ms con cleanup
- **Filtros en URL params**: sincronizar con `useSearchParams` para que los filtros sean copiables/bookmarkables
- **Optimistic updates**: al cancelar, marcar ticket como cancelado localmente antes de confirmación del servidor
- **Toast notifications**: `sonner` para éxito/error en cada acción
- **Accesibilidad**: aria-labels en botones de acción, foco manejado en modales

---

## Verificación

1. Abrir `http://localhost:3001/bookings` como admin o secretaria
2. Verificar que las 4 stats cargan con skeleton y luego datos reales
3. Buscar por nombre de cliente → lista se filtra
4. Filtrar por estado "Pendiente" → solo muestra tickets pendientes
5. Click en "Ver" → abre TicketModal con diseño de ticket imprimible
6. Click en "Cancelar" → modal de confirmación → ticket cambia a rojo
7. Click en "Nueva Reserva" → TicketSaleModal funciona con selección de viaje y cliente
8. Navegar a `/bookings?trip_id=X&action=sell` desde TripDetailPage → modal se abre automáticamente
9. Exportar CSV → descarga archivo con tickets filtrados actuales
10. Cambiar a vista cards → layout responsive correcto en mobile
