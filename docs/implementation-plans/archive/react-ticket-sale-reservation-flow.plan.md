# Plan: Complete Seat Sale and Reservation Flow in React

## Current Status

The React app (`frontend-react/`) already has **all the base components** implemented for the sale/reservation flow. However, there are **functional gaps** between the Nuxt implementation (working 100%) and React that need to be closed so the flow is identical.

### Existing Components in React
| Component | Path | Status |
|---|---|---|
| `TripDetailPage` | `src/pages/trips/TripDetailPage.tsx` | Implemented, needs adjustments |
| `TicketSaleModal` | `src/components/tickets/TicketSaleModal.tsx` | Implemented, needs adjustments |
| `TicketModal` | `src/components/tickets/TicketModal.tsx` | Implemented |
| `TicketDisplay` | `src/components/tickets/TicketDisplay.tsx` | Implemented |
| `BusSeatMapPrint` | `src/components/seats/BusSeatMapPrint.tsx` | Implemented |
| `BusSeatGrid` | `src/components/seats/BusSeatGrid.tsx` | Implemented |
| `SelectedSeatsPanel` | `src/components/seats/SelectedSeatsPanel.tsx` | Implemented |
| `SeatContextMenu` | `src/components/seats/SeatContextMenu.tsx` | Implemented |
| `useClientSearch` | `src/hooks/use-client-search.ts` | Implemented, needs fix |
| `useTripDetails` | `src/hooks/use-trip-details.ts` | Implemented |

### Existing Services
| Service | Path | Status |
|---|---|---|
| `ticket.service.ts` | `src/services/ticket.service.ts` | Complete |
| `client.service.ts` | `src/services/client.service.ts` | Complete |
| `trip.service.ts` | `src/services/trip.service.ts` | Complete |
| `seat.service.ts` | `src/services/seat.service.ts` | Complete |

### Configured Route
- `/trips/:id` -> `TripDetailPage.tsx` (already in `src/router/index.tsx` line 49)

---

## Identified Gaps (Nuxt vs React)

### GAP 1: useClientSearch - incorrect search endpoint
**File:** `src/hooks/use-client-search.ts` (line 36)

**Problem:** Uses `/clients?search=...` but the backend exposes `/clients/search?q=...`

**Nuxt (correct):**
```js
const apiUrl = `${config.public.apiBaseUrl}/clients/search?q=${encodeURIComponent(searchTerm)}`
```

**React (incorrect):**
```ts
const resp = await apiFetch(`/clients?search=${encodeURIComponent(query)}&limit=10`)
```

**Fix:**
```ts
const resp = await apiFetch(`/clients/search?q=${encodeURIComponent(query)}`)
```

And adjust the response parsing: `setFoundClients(Array.isArray(resp) ? resp : [])` instead of `resp?.items || resp || []`.

---

### GAP 2: TicketSaleModal - request body as string vs object
**File:** `src/components/tickets/TicketSaleModal.tsx` (lines 148-183)

**Problem:** Uses `JSON.stringify(body)` when creating a client and tickets, but `apiFetch` probably already serializes the body.

**Fix:** Check how `apiFetch` works in `src/lib/api.ts`. If it uses `fetch` with `Content-Type: application/json` headers, the body should already be an object, not a string. Change:
```ts
// Create client (line 148-152)
body: newClientForm     // instead of JSON.stringify(newClientForm)

// Create ticket (line 179-182)
body: ticketData        // instead of JSON.stringify(ticketData)
```

---

### GAP 3: Missing ticket cancellation with PUT instead of DELETE
**File:** `src/pages/trips/TripDetailPage.tsx` (lines 205-217)

**Problem:** `handleCancelReservation` uses `DELETE /tickets/:id` but Nuxt uses `PUT /tickets/:id/cancel`.

**Nuxt (correct):**
```js
await $fetch(`${config.public.apiBaseUrl}/tickets/${selectedTicket.value.id}/cancel`, { method: 'PUT' })
```

**React (incorrect):**
```ts
await apiFetch(`/tickets/${ticket.id}`, { method: 'DELETE' })
```

**Fix:**
```ts
await apiFetch(`/tickets/${ticket.id}/cancel`, { method: 'PUT' })
```

---

### GAP 4: Reserved ticket state - 'pending' vs 'reserved'
**File:** `src/hooks/use-trip-details.ts` (line 26) and `TripDetailPage.tsx` (lines 206, 220)

**Problem:** React filters by `t.state === 'reserved'` but Nuxt uses `t.state === 'pending'` for reservations.

**Nuxt:**
```js
soldTickets.value.filter(ticket => ticket.state === 'pending' && ticket.seat)
```

**React:**
```ts
tickets.filter((t) => t.state === 'reserved')
```

**Fix:** Check the backend for the correct state. In `TicketSaleModal.vue` (Nuxt, line 466):
```js
ticketForm.value.state = newActionType === 'sell' ? 'confirmed' : 'pending'
```

The state for reservations is `'pending'`. Update React to use `'pending'` in:
- `use-trip-details.ts` line 26: `t.state === 'pending'`
- `TripDetailPage.tsx` line 206: `t.state === 'pending'`
- `TripDetailPage.tsx` line 220: `t.state === 'pending'`

---

### GAP 5: Missing seat change mode
**File:** `src/pages/trips/TripDetailPage.tsx`

**Problem:** Nuxt has a complete "seat change" flow that doesn't exist in React:
1. Right click on occupied seat -> "Change seat"
2. `seatChangeMode` is activated - the visual map changes
3. User selects an available seat
4. Change confirmation modal
5. Call to `PUT /tickets/:id/change-seat/:newSeatId`

**Nuxt components involved:**
- State: `seatChangeMode`, `seatChangeTicket`, `newSelectedSeat`, `showSeatChangeConfirmModal`
- Handler: `handleChangeSeat()`, `confirmSeatChange()`, `cancelSeatChange()`
- Visual: CSS with orange striped animation, green pulse on available
- Keyboard: `Escape` cancels the mode

**Files to modify:**
- `TripDetailPage.tsx` - add state and seat change handlers
- `BusSeatMapPrint.tsx` - propagate `seatChangeMode` prop and `onChangeSeat` event
- `BusSeatGrid.tsx` - different visual when `seatChangeMode=true`

---

### GAP 6: Missing sale confirmation from reservation
**File:** `src/pages/trips/TripDetailPage.tsx` (lines 219-231)

**Problem:** `handleConfirmSale` does a direct `PUT` without a confirmation modal. Nuxt has a dedicated modal (`showConfirmSaleModal`).

**Fix:** Add `showConfirmSaleModal` and `ticketToConfirm` state, with a simple confirmation modal before executing the `PUT`.

---

### GAP 7: Missing TicketSaleModal - ticket.service already has confirmSale
**File:** `src/services/ticket.service.ts` (lines 42-47)

**Note:** The `confirmSale` method in the service does `PUT /tickets/:id` with `{ state: 'confirmed' }`, which is correct according to the backend. It just needs UI wiring.

---

## Phased Implementation Plan

### Phase 1: Critical fixes to make the basic flow work
**Priority: HIGH** | **Files: 3** | **Estimate: Minor changes**

#### 1.1 Fix useClientSearch endpoint
```
File: src/hooks/use-client-search.ts
Line 36: Change search URL
Line 37: Change response parsing
```

#### 1.2 Fix TicketSaleModal body serialization
```
File: src/components/tickets/TicketSaleModal.tsx
Lines 148-152: Verify and adjust createClient body
Lines 179-182: Verify and adjust createTicket body
```
**Prerequisite:** Read `src/lib/api.ts` to confirm how it handles the body.

#### 1.3 Fix reservation state 'pending' vs 'reserved'
```
File: src/hooks/use-trip-details.ts
Line 26: Change 'reserved' to 'pending'

File: src/pages/trips/TripDetailPage.tsx
Lines 206, 220: Change 'reserved' to 'pending'
```

#### 1.4 Fix reservation cancellation (DELETE -> PUT cancel)
```
File: src/pages/trips/TripDetailPage.tsx
Lines 208-209: Change to PUT /tickets/:id/cancel
```

### Phase 2: Sale confirmation with modal
**Priority: MEDIUM** | **Files: 1**

#### 2.1 Add sale confirmation modal
```
File: src/pages/trips/TripDetailPage.tsx

New states:
- showConfirmSaleModal: boolean
- ticketToConfirm: any
- confirmingSale: boolean

New handler:
- handleConfirmSale: shows modal instead of executing directly
- executeConfirmSale: performs the PUT and refreshes

New JSX:
- Simple modal with ticket info and Cancel/Confirm buttons
```

### Phase 3: Seat change mode
**Priority: MEDIUM** | **Files: 3-4**

#### 3.1 State and logic in TripDetailPage
```
File: src/pages/trips/TripDetailPage.tsx

New states:
- seatChangeMode: boolean
- seatChangeTicket: any (ticket being changed)
- newSelectedSeat: any
- showSeatChangeConfirmModal: boolean
- seatChangeLoading: boolean

New handlers:
- handleChangeSeat(seat): activates change mode
- handleSelectionInChangeMode(seats): validates and shows confirmation
- confirmSeatChange(): PUT /tickets/:id/change-seat/:newSeatId
- cancelSeatChange(): clears state

Keyboard shortcut:
- Escape: cancels change mode
```

#### 3.2 Propagate change mode to the seat map
```
File: src/components/seats/BusSeatMapPrint.tsx

New prop: seatChangeMode: boolean
Behavior: when seatChangeMode=true, onSelectionChange
only accepts 1 available seat and propagates it as newSelectedSeat
```

#### 3.3 Change mode visual in BusSeatGrid
```
File: src/components/seats/BusSeatGrid.tsx

New prop: seatChangeMode: boolean
When active:
- Available seats: green pulse animation
- Background: overlay with orange stripes
- Occupied seats: not-allowed cursor
```

#### 3.4 Change confirmation modal
```
File: src/pages/trips/TripDetailPage.tsx (inline)

Content:
- "Change from seat X to seat Y?"
- Passenger info
- Buttons: Cancel / Confirm change
```

### Phase 4: Polish and complete parity
**Priority: LOW** | **Files: multiple**

#### 4.1 Improved notifications
- Use `sonner` (already integrated in main.tsx with `<Toaster />`) instead of the manual notification div
- Replace `showNotification()` with `toast.success()`, `toast.error()`

#### 4.2 Complete keyboard shortcuts
```
File: src/pages/trips/TripDetailPage.tsx

Existing shortcuts in Nuxt:
- V: sell (already implemented in React)
- R: reserve (already implemented in React)
- C: clear selection (MISSING)
- Escape: close modals / cancel change (partial)
- Enter: confirm seat change (MISSING)
```

#### 4.3 Seat change mode visual banner
- Sticky yellow/orange banner when seatChangeMode is active
- Current ticket info and instructions
- Cancel button

---

## Reference: Used backend endpoints

| Endpoint | Method | Use |
|---|---|---|
| `GET /trips/:id` | GET | Load trip data |
| `GET /tickets/trip/:tripId` | GET | List trip tickets |
| `POST /tickets` | POST | Create ticket (sale or reservation) |
| `PUT /tickets/:id/cancel` | PUT | Cancel reservation |
| `PUT /tickets/:id` | PUT | Update ticket (confirm sale) |
| `PUT /tickets/:id/change-seat/:newSeatId` | PUT | Change seat |
| `GET /clients/search?q=term` | GET | Search clients |
| `POST /clients` | POST | Create new client |
| `GET /packages/trip/:tripId` | GET | List trip packages |

## Reference: Ticket data schema

```python
# backend/schemas/ticket.py
TicketCreate:
  trip_id: int
  client_id: int
  seat_id: int
  destination: str
  price: float
  payment_method: str  # 'cash', 'card', 'transfer', 'qr'
  state: str           # 'pending' (reservation), 'confirmed' (sale)
  operator_user_id: int (optional)
```

## Recommended Execution Order

1. **Phase 1** (critical) - Make the basic flow work: search client, create ticket, see on map
2. **Phase 2** (medium) - Add sale confirmation from reservation
3. **Phase 3** (medium) - Implement seat change
4. **Phase 4** (low) - Polish, sonner, complete shortcuts
