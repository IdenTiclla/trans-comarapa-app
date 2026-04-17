# Ticket Details Page (React)

## Context

Actualmente la aplicación React tiene el listado (`/tickets`) y la confirmación post-venta (`/tickets/confirmation`), pero no hay una página dedicada para inspeccionar un boleto individual. Secretarías, administradores y clientes necesitan ver toda la información de un boleto (pasajero, viaje, asiento, pago, estado) en un solo lugar y poder ejecutar acciones comunes: imprimir, cancelar, editar.

Este plan implementa **solo el MVP** con los datos que ya expone el backend. Elementos del mock visual que no tienen respaldo en el modelo actual (QR code, timeline/historial de auditoría, desglose de impuestos, email digital copy, estado "Validated") quedan fuera de alcance y se pueden agregar en iteraciones posteriores cuando exista soporte en backend.

## Scope

### Incluido
- Ruta nueva `/tickets/:id` en `frontend/src/router/index.tsx`.
- Página `TicketDetailPage.tsx` con layout asimétrico (8/4 columnas) inspirado en el mock.
- Secciones: Passenger Info, Trip Logistics, Seat Card, Financial Summary (solo `price` y `payment_method`), Assigned Vehicle, Quick Actions.
- Acciones: Imprimir (reutilizar ruta de impresión existente o `window.print()`), Cancelar ticket (`PUT /tickets/:id/cancel` con confirmación), Editar (navegar a edición futura o abrir modal básico — ver "Edit" abajo).
- Estados: loading, error, not-found.
- Navegación: agregar link "Ver detalles" en `TicketsIndexPage` filas.

### Excluido (gaps vs mock)
- **QR code**: omitido (el backend no genera token de validación; el mock lo muestra como "Validation Token").
- **Timeline/History**: no existe endpoint de audit log para tickets.
- **Taxes/Insurance breakdown**: el schema tiene un único campo `price`. Mostrar solo total.
- **Email Digital Copy**: no existe endpoint de envío de email.
- **Boarding Status "Ready to Board" / estado "Validated"**: el enum `TicketState` solo tiene `pending | confirmed | cancelled`. Mapear visualmente a badges existentes.
- **Upper Deck / Window metadata**: verificar `SeatSchema` — si no tiene deck/window, mostrar solo el número.

## Critical Files

### Nuevos
- `frontend/src/pages/tickets/TicketDetailPage.tsx` — página principal.
- `frontend/src/hooks/use-ticket-detail.ts` — hook que orquesta las llamadas (ticket + trip + bus/route si hacen falta extras).

### Modificados
- `frontend/src/router/index.tsx:91` — agregar ruta `{ path: '/tickets/:id', lazy: () => import('@/pages/tickets/TicketDetailPage') }` justo después de `/tickets/confirmation`.
- `frontend/src/pages/tickets/TicketsIndexPage.tsx` — en las filas de la tabla, agregar acción/link a `/tickets/${ticket.id}`.

### Reutilizados (no modificar)
- `frontend/src/services/ticket.service.ts:10` — `getById(id)` ya existe.
- `frontend/src/services/ticket.service.ts` — agregar método `cancel(id)` que llame `PUT /tickets/{id}/cancel` (actualmente `TicketsIndexPage` usa `update({state:'cancelled'})`, pero el endpoint dedicado es mejor: `backend/routes/ticket.py:103`).
- `frontend/src/services/trip.service.ts` — para obtener datos del viaje (ruta origen/destino, fecha, hora, bus).
- `frontend/src/lib/api.ts` — `apiFetch`.
- `frontend/src/pages/trips/TripDetailPage.tsx` — patrón de referencia (hook + secciones + estados loading/error).
- `sonner` toast para feedback de cancelación.
- Confirmación: reutilizar diálogo de confirmación existente (revisar `TicketsIndexPage.tsx:402` para patrón actual).

## Data Flow

```
/tickets/:id
   ↓ useParams → ticketId
   ↓ useTicketDetail(ticketId)
      ├── ticketService.getById(id)           → ticket (incluye client, seat, secretary)
      └── tripService.getById(ticket.trip_id) → trip (incluye route, bus, date, time)
   ↓
TicketDetailPage render
```

El ticket schema no incluye `trip` anidado, por eso se hace una segunda llamada. Ambas en paralelo con `Promise.all` dentro del hook.

## Layout Structure (adaptado del mock)

```
Header: Breadcrumb · Ticket ID · State badge · Issued date · Actions (Edit, Print)
Grid 12 col:
  Col 8 (main):
    - Card: Passenger Info | Seat Card (2 col interior)
    - Section: Trip Logistics (origen → bus → destino, fecha/hora/tipo)
    - Card: Financial Summary (total, método de pago)
  Col 4 (aside):
    - Card: Ticket State / Metadata (created_at, secretary que emitió)
    - Card: Quick Actions (Cancel Ticket)
    - Card: Assigned Vehicle (bus placa, modelo, capacidad)
```

## Acciones detalladas

- **Print Ticket**: redirigir a ruta de impresión si existe, o `window.print()` con CSS print-friendly. Investigar si hay `PrintLayout` reutilizable en `router/index.tsx:106`.
- **Edit Information**: en MVP, navegar a un placeholder o deshabilitar si no hay página de edición aún. Confirmar con usuario si se implementa ahora o se deja como stub.
- **Cancel Ticket**: diálogo de confirmación → `ticketService.cancel(id)` → refrescar ticket → toast éxito/error. Solo mostrar si `state !== 'cancelled'`.

## State Mapping (visual)

- `pending` → badge amarillo "Pendiente"
- `confirmed` → badge verde "Confirmado"
- `cancelled` → badge rojo "Cancelado"

(Seguir convenciones ya usadas en `TicketsIndexPage`.)

## Verification

1. `docker compose up` y seed: `make seed`.
2. Login como `secretary1@transcomarapa.com` / `123456`.
3. Navegar a `/tickets`, click en un boleto → debe ir a `/tickets/:id` y mostrar todos los datos.
4. Verificar estados:
   - Ticket `pending` → muestra badge amarillo, botón Cancelar visible.
   - Ticket `confirmed` → badge verde.
   - Ticket `cancelled` → badge rojo, botón Cancelar oculto.
5. Probar cancelación: click → confirmar → verificar toast y cambio de estado sin recargar.
6. Probar print: click Print → preview/impresión limpia.
7. Estados de error:
   - `/tickets/99999` (inexistente) → muestra mensaje "Boleto no encontrado".
   - Simular API down → muestra error con botón de reintento.
8. Responsive: verificar grid colapsa a 1 columna en móvil.
9. Role-based: verificar acceso con roles admin, secretary, client (cliente solo puede ver sus propios tickets — revisar si el endpoint `getById` lo restringe).

## Out of Scope (futuras iteraciones)

- Endpoint backend de audit log + sección History/Timeline.
- Generación de token QR firmado en backend + render con `qrcode.react`.
- Breakdown de precio (requiere agregar campos `tax`, `insurance_surcharge` al schema).
- Endpoint `POST /tickets/:id/send-email` + acción Email Digital Copy.
- Estado `validated` en el enum `TicketState` (para registro de abordaje).
