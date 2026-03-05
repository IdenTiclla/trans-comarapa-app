# Plan: Flujo completo de venta y reserva de asientos en React

## Estado actual

La app React (`frontend-react/`) ya tiene **todos los componentes base** implementados para el flujo de venta/reserva. Sin embargo, hay **gaps funcionales** entre la implementacion Nuxt (funcionando al 100%) y React que deben cerrarse para que el flujo sea identico.

### Componentes existentes en React
| Componente | Path | Estado |
|---|---|---|
| `TripDetailPage` | `src/pages/trips/TripDetailPage.tsx` | Implementado, necesita ajustes |
| `TicketSaleModal` | `src/components/tickets/TicketSaleModal.tsx` | Implementado, necesita ajustes |
| `TicketModal` | `src/components/tickets/TicketModal.tsx` | Implementado |
| `TicketDisplay` | `src/components/tickets/TicketDisplay.tsx` | Implementado |
| `BusSeatMapPrint` | `src/components/seats/BusSeatMapPrint.tsx` | Implementado |
| `BusSeatGrid` | `src/components/seats/BusSeatGrid.tsx` | Implementado |
| `SelectedSeatsPanel` | `src/components/seats/SelectedSeatsPanel.tsx` | Implementado |
| `SeatContextMenu` | `src/components/seats/SeatContextMenu.tsx` | Implementado |
| `useClientSearch` | `src/hooks/use-client-search.ts` | Implementado, necesita fix |
| `useTripDetails` | `src/hooks/use-trip-details.ts` | Implementado |

### Servicios existentes
| Servicio | Path | Estado |
|---|---|---|
| `ticket.service.ts` | `src/services/ticket.service.ts` | Completo |
| `client.service.ts` | `src/services/client.service.ts` | Completo |
| `trip.service.ts` | `src/services/trip.service.ts` | Completo |
| `seat.service.ts` | `src/services/seat.service.ts` | Completo |

### Ruta configurada
- `/trips/:id` -> `TripDetailPage.tsx` (ya en `src/router/index.tsx` linea 49)

---

## Gaps identificados (Nuxt vs React)

### GAP 1: useClientSearch - endpoint de busqueda incorrecto
**Archivo:** `src/hooks/use-client-search.ts` (linea 36)

**Problema:** Usa `/clients?search=...` pero el backend expone `/clients/search?q=...`

**Nuxt (correcto):**
```js
const apiUrl = `${config.public.apiBaseUrl}/clients/search?q=${encodeURIComponent(searchTerm)}`
```

**React (incorrecto):**
```ts
const resp = await apiFetch(`/clients?search=${encodeURIComponent(query)}&limit=10`)
```

**Fix:**
```ts
const resp = await apiFetch(`/clients/search?q=${encodeURIComponent(query)}`)
```

Y ajustar el parseo de respuesta: `setFoundClients(Array.isArray(resp) ? resp : [])` en vez de `resp?.items || resp || []`.

---

### GAP 2: TicketSaleModal - body de request como string vs objeto
**Archivo:** `src/components/tickets/TicketSaleModal.tsx` (lineas 148-183)

**Problema:** Usa `JSON.stringify(body)` al crear cliente y tickets, pero `apiFetch` probablemente ya serializa el body.

**Fix:** Verificar como funciona `apiFetch` en `src/lib/api.ts`. Si usa `fetch` con headers `Content-Type: application/json`, el body ya debe ser un objeto, no un string. Cambiar:
```ts
// Crear cliente (linea 148-152)
body: newClientForm     // en vez de JSON.stringify(newClientForm)

// Crear ticket (linea 179-182)
body: ticketData        // en vez de JSON.stringify(ticketData)
```

---

### GAP 3: Falta cancelacion de ticket con PUT en vez de DELETE
**Archivo:** `src/pages/trips/TripDetailPage.tsx` (lineas 205-217)

**Problema:** `handleCancelReservation` usa `DELETE /tickets/:id` pero Nuxt usa `PUT /tickets/:id/cancel`.

**Nuxt (correcto):**
```js
await $fetch(`${config.public.apiBaseUrl}/tickets/${selectedTicket.value.id}/cancel`, { method: 'PUT' })
```

**React (incorrecto):**
```ts
await apiFetch(`/tickets/${ticket.id}`, { method: 'DELETE' })
```

**Fix:**
```ts
await apiFetch(`/tickets/${ticket.id}/cancel`, { method: 'PUT' })
```

---

### GAP 4: Estado de ticket reservado - 'pending' vs 'reserved'
**Archivo:** `src/hooks/use-trip-details.ts` (linea 26) y `TripDetailPage.tsx` (lineas 206, 220)

**Problema:** React filtra por `t.state === 'reserved'` pero Nuxt usa `t.state === 'pending'` para reservas.

**Nuxt:**
```js
soldTickets.value.filter(ticket => ticket.state === 'pending' && ticket.seat)
```

**React:**
```ts
tickets.filter((t) => t.state === 'reserved')
```

**Fix:** Verificar en backend cual es el estado correcto. En `TicketSaleModal.vue` (Nuxt, linea 466):
```js
ticketForm.value.state = newActionType === 'sell' ? 'confirmed' : 'pending'
```

El estado para reservas es `'pending'`. Actualizar React para usar `'pending'` en:
- `use-trip-details.ts` linea 26: `t.state === 'pending'`
- `TripDetailPage.tsx` linea 206: `t.state === 'pending'`
- `TripDetailPage.tsx` linea 220: `t.state === 'pending'`

---

### GAP 5: Falta modo de cambio de asiento
**Archivo:** `src/pages/trips/TripDetailPage.tsx`

**Problema:** Nuxt tiene un flujo completo de "cambio de asiento" (seat change mode) que no existe en React:
1. Click derecho en asiento ocupado -> "Cambiar asiento"
2. Se activa `seatChangeMode` - el mapa visual cambia
3. Usuario selecciona un asiento disponible
4. Modal de confirmacion de cambio
5. Llamada a `PUT /tickets/:id/change-seat/:newSeatId`

**Componentes Nuxt involucrados:**
- Estado: `seatChangeMode`, `seatChangeTicket`, `newSelectedSeat`, `showSeatChangeConfirmModal`
- Handler: `handleChangeSeat()`, `confirmSeatChange()`, `cancelSeatChange()`
- Visual: CSS con animacion de rayas naranjas, pulse verde en disponibles
- Teclado: `Escape` cancela el modo

**Archivos a modificar:**
- `TripDetailPage.tsx` - agregar estado y handlers de seat change
- `BusSeatMapPrint.tsx` - propagar prop `seatChangeMode` y evento `onChangeSeat`
- `BusSeatGrid.tsx` - visual diferente cuando `seatChangeMode=true`

---

### GAP 6: Falta confirmacion de venta desde reserva
**Archivo:** `src/pages/trips/TripDetailPage.tsx` (lineas 219-231)

**Problema:** `handleConfirmSale` hace un `PUT` directo sin modal de confirmacion. Nuxt tiene un modal dedicado (`showConfirmSaleModal`).

**Fix:** Agregar estado `showConfirmSaleModal` y `ticketToConfirm`, con un modal simple de confirmacion antes de ejecutar el `PUT`.

---

### GAP 7: Falta TicketSaleModal - ticket.service ya tiene confirmSale
**Archivo:** `src/services/ticket.service.ts` (lineas 42-47)

**Nota:** El metodo `confirmSale` en el service hace `PUT /tickets/:id` con `{ state: 'confirmed' }`, lo cual es correcto segun el backend. Solo necesita wiring al UI.

---

## Plan de implementacion por fases

### Fase 1: Fixes criticos para que funcione el flujo basico
**Prioridad: ALTA** | **Archivos: 3** | **Estimado: Cambios menores**

#### 1.1 Fix useClientSearch endpoint
```
Archivo: src/hooks/use-client-search.ts
Linea 36: Cambiar URL de busqueda
Linea 37: Cambiar parseo de respuesta
```

#### 1.2 Fix TicketSaleModal body serialization
```
Archivo: src/components/tickets/TicketSaleModal.tsx
Lineas 148-152: Verificar y ajustar body de createClient
Lineas 179-182: Verificar y ajustar body de createTicket
```
**Prerequisito:** Leer `src/lib/api.ts` para confirmar como maneja el body.

#### 1.3 Fix estado de reserva 'pending' vs 'reserved'
```
Archivo: src/hooks/use-trip-details.ts
Linea 26: Cambiar 'reserved' a 'pending'

Archivo: src/pages/trips/TripDetailPage.tsx
Lineas 206, 220: Cambiar 'reserved' a 'pending'
```

#### 1.4 Fix cancelacion de reserva (DELETE -> PUT cancel)
```
Archivo: src/pages/trips/TripDetailPage.tsx
Lineas 208-209: Cambiar a PUT /tickets/:id/cancel
```

### Fase 2: Confirmacion de venta con modal
**Prioridad: MEDIA** | **Archivos: 1**

#### 2.1 Agregar modal de confirmacion de venta
```
Archivo: src/pages/trips/TripDetailPage.tsx

Nuevos estados:
- showConfirmSaleModal: boolean
- ticketToConfirm: any
- confirmingSale: boolean

Nuevo handler:
- handleConfirmSale: muestra modal en vez de ejecutar directo
- executeConfirmSale: hace el PUT y refresca

Nuevo JSX:
- Modal simple con info del ticket y botones Cancelar/Confirmar
```

### Fase 3: Modo cambio de asiento
**Prioridad: MEDIA** | **Archivos: 3-4**

#### 3.1 Estado y logica en TripDetailPage
```
Archivo: src/pages/trips/TripDetailPage.tsx

Nuevos estados:
- seatChangeMode: boolean
- seatChangeTicket: any (ticket que se esta cambiando)
- newSelectedSeat: any
- showSeatChangeConfirmModal: boolean
- seatChangeLoading: boolean

Nuevos handlers:
- handleChangeSeat(seat): activa modo cambio
- handleSelectionInChangeMode(seats): valida y muestra confirmacion
- confirmSeatChange(): PUT /tickets/:id/change-seat/:newSeatId
- cancelSeatChange(): limpia estado

Keyboard shortcut:
- Escape: cancela modo cambio
```

#### 3.2 Propagar modo cambio al mapa de asientos
```
Archivo: src/components/seats/BusSeatMapPrint.tsx

Nueva prop: seatChangeMode: boolean
Comportamiento: cuando seatChangeMode=true, el onSelectionChange
solo acepta 1 asiento disponible y lo propaga como newSelectedSeat
```

#### 3.3 Visual del modo cambio en BusSeatGrid
```
Archivo: src/components/seats/BusSeatGrid.tsx

Nueva prop: seatChangeMode: boolean
Cuando activo:
- Asientos disponibles: animacion pulse verde
- Fondo: overlay con rayas naranjas
- Asientos ocupados: cursor no permitido
```

#### 3.4 Modal de confirmacion de cambio
```
Archivo: src/pages/trips/TripDetailPage.tsx (inline)

Contenido:
- "Cambiar de asiento X a asiento Y?"
- Info del pasajero
- Botones: Cancelar / Confirmar cambio
```

### Fase 4: Pulido y paridad completa
**Prioridad: BAJA** | **Archivos: varios**

#### 4.1 Notificaciones mejoradas
- Usar `sonner` (ya integrado en main.tsx con `<Toaster />`) en vez del div notification manual
- Reemplazar `showNotification()` por `toast.success()`, `toast.error()`

#### 4.2 Keyboard shortcuts completos
```
Archivo: src/pages/trips/TripDetailPage.tsx

Shortcuts existentes en Nuxt:
- V: vender (ya implementado en React)
- R: reservar (ya implementado en React)
- C: limpiar seleccion (FALTA)
- Escape: cerrar modales / cancelar cambio (parcial)
- Enter: confirmar cambio de asiento (FALTA)
```

#### 4.3 Banner visual de modo cambio de asiento
- Banner sticky amarillo/naranja cuando seatChangeMode esta activo
- Info del ticket actual y instrucciones
- Boton de cancelar

---

## Referencia: Endpoints de backend utilizados

| Endpoint | Metodo | Uso |
|---|---|---|
| `GET /trips/:id` | GET | Cargar datos del viaje |
| `GET /tickets/trip/:tripId` | GET | Listar boletos del viaje |
| `POST /tickets` | POST | Crear boleto (venta o reserva) |
| `PUT /tickets/:id/cancel` | PUT | Cancelar reserva |
| `PUT /tickets/:id` | PUT | Actualizar ticket (confirmar venta) |
| `PUT /tickets/:id/change-seat/:newSeatId` | PUT | Cambiar asiento |
| `GET /clients/search?q=term` | GET | Buscar clientes |
| `POST /clients` | POST | Crear cliente nuevo |
| `GET /packages/trip/:tripId` | GET | Listar encomiendas del viaje |

## Referencia: Esquema de datos del ticket

```python
# backend/schemas/ticket.py
TicketCreate:
  trip_id: int
  client_id: int
  seat_id: int
  destination: str
  price: float
  payment_method: str  # 'cash', 'card', 'transfer', 'qr'
  state: str           # 'pending' (reserva), 'confirmed' (venta)
  operator_user_id: int (opcional)
```

## Orden de ejecucion recomendado

1. **Fase 1** (critica) - Hacer que el flujo basico funcione: buscar cliente, crear ticket, ver en mapa
2. **Fase 2** (media) - Agregar confirmacion de venta desde reserva
3. **Fase 3** (media) - Implementar cambio de asiento
4. **Fase 4** (baja) - Pulido, sonner, shortcuts completos
