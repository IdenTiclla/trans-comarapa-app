# Plan: BookingsPage - Redesign and Full Functionality

## Context

The `/bookings` page is the reservation management interface for Admin and Secretary. It currently exists (`BookingsPage.tsx`, 807 lines) with basic functionality but has UX issues, incomplete states, and fragmented logic. The goal is to deliver a fully functional page with an excellent user experience.

**Audience:** Admin and Secretary
**Main File:** `frontend-react/src/pages/BookingsPage.tsx`

---

## Current Issues

1. **Stats section**: Uses direct `apiFetch` without consistent error handling; fragile comparison with previous day.
2. **Filters**: The advanced filters panel is hidden by default and the UX is confusing.
3. **Table view**: No sortable columns, no clear row actions.
4. **Cards view**: Basic design without clear visual hierarchy.
5. **Empty / Error states**: No dedicated components.
6. **Loading**: No skeleton loaders in stats or the list.
7. **Edit modal**: Shares state with creation, causing potential bugs.
8. **Pagination**: Redundant manual implementation.
9. **Ticket cancellation**: Not correctly integrated (should use `PUT /tickets/:id/cancel`).

---

## Implementation Approach

Rewrite `BookingsPage.tsx` maintaining the same route and existing services/components, but with a clear architecture by sections.

---

## Page Sections

### 1. Header
- Title "Reservation Management" + description.
- "New Reservation" button (opens existing `TicketSaleModal`).
- "Export CSV" button with loading state.

### 2. Stats Row (4 cards with DashboardStatCard)
- **Confirmed today** (green, CheckCircle icon).
- **Pending** (yellow, Clock icon).
- **Cancelled today** (red, XCircle icon).
- **Revenue today** (blue, DollarSign icon).
- Skeleton loader while loading.
- Error handling with fallback to `--`.

### 3. Search Bar and Filters
- Search input (customer name, ID, seat) with 300ms debounce.
- Always visible filters in row: `Select` for status + `DatePicker` from/to + `Select` for payment method.
- "Clear filters" button only visible when there are active filters.
- View toggle: table / cards (shadcn/ui icons).

### 4. Ticket List

#### Table View (default desktop)
Columns: `#ID` | `Customer` | `Route` | `Trip` | `Seat` | `Status` | `Price` | `Payment` | `Actions`
- Status badge with colors: confirmed=green, pending=yellow, cancelled=red.
- Row actions: View, Edit, Cancel (icons + tooltips).
- Clickable rows to see details.
- Sortable columns: date, price, status.

#### Cards View (mobile-friendly)
- Cards with: route (origin→destination), date/time, customer, seat, status badge, price.
- Actions in dropdown menu (shadcn DropdownMenu).

### 5. Pagination
- Controls: previous / current page / next.
- Items per page selector: 10 / 25 / 50.
- Text: "Showing X-Y of Z results".

### 6. Empty State
- When no tickets: illustration + message + "Create first reservation" button.
- When no results for filters: message + "Clear filters" button.

### 7. Error State
- Error banner with "Retry" button.

---

## Modal Flows

### View ticket (details)
- Use existing `TicketModal` in `'details'` mode.
- Shows `TicketDisplay` with print option.

### Cancel ticket
- Use existing `TicketModal` in `'cancel'` mode.
- Calls `ticketService.update(id, { state: 'cancelled' })` or the `PUT /tickets/:id/cancel` endpoint.
- Updates list locally without a full re-fetch.

### Create ticket (new reservation)
- Open existing `TicketSaleModal`.
- Support URL params: `?trip_id=X&action=sell|reserve&seat_number=Y`.

### Edit ticket
- Inline modal with fields: status, payment method, price.
- Calls `ticketService.update(id, data)`.

---

## Services and Hooks to Use

| Usage | Function | File |
|-----|---------|---------|
| Load tickets | `ticketService.getAll(params)` | `services/ticket.service.ts` |
| Update ticket | `ticketService.update(id, data)` | `services/ticket.service.ts` |
| Cancel ticket | `ticketService.update(id, {state:'cancelled'})` | `services/ticket.service.ts` |
| Stats | `statsService.getBookingsStatsComparison()` | `services/stats.service.ts` |
| Export CSV | local generation from filtered data | — |
| Customers | `clientService.getAll()` | `services/client.service.ts` |
| Trips | `tripService.getAll()` | `services/trip.service.ts` |

**Existing components to reuse:**
- `TicketDisplay.tsx` — printable visualization.
- `TicketModal.tsx` — details/cancellation modal.
- `TicketSaleModal.tsx` — creation modal.
- `DashboardStatCard.tsx` — stats cards.

---

## Files to Modify

| File | Action |
|---------|--------|
| `frontend-react/src/pages/BookingsPage.tsx` | Complete rewrite |
| `frontend-react/src/components/tickets/TicketModal.tsx` | Verify and adjust cancel action |

---

## New Component Structure

```
BookingsPage
├── useEffect: load stats + tickets on mount and when filters change
├── State:
│   ├── tickets[], total, page, pageSize
│   ├── stats { confirmed, pending, cancelled, revenue }
│   ├── filters { search, status, dateFrom, dateTo, paymentMethod }
│   ├── viewMode: 'table' | 'cards'
│   ├── loading: { stats, list }
│   ├── error: string | null
│   └── modals: { create, view, edit, cancel } + selectedTicket
├── Header (title + actions)
├── StatsRow (4x DashboardStatCard)
├── FilterBar (search + filters + view toggle)
├── TicketTable | TicketCards (conditional)
├── Pagination
└── Modals (TicketSaleModal, TicketModal, EditModal)
```

---

## Technical Details

- **Debounce** on search: `useCallback` + `setTimeout` 300ms with cleanup.
- **Filters in URL params**: synchronize with `useSearchParams` so filters are copyable/bookmarkable.
- **Optimistic updates**: when cancelling, mark ticket as cancelled locally before server confirmation.
- **Toast notifications**: `sonner` for success/error on each action.
- **Accessibility**: aria-labels on action buttons, focus managed in modals.

---

## Verification

1. Open `http://localhost:3001/bookings` as admin or secretary.
2. Verify that the 4 stats load with skeleton and then real data.
3. Search by customer name → list is filtered.
4. Filter by "Pending" status → only shows pending tickets.
5. Click "View" → opens TicketModal with printable ticket design.
6. Click "Cancel" → confirmation modal → ticket turns red.
7. Click "New Reservation" → TicketSaleModal works with trip and customer selection.
8. Navigate to `/bookings?trip_id=X&action=sell` from TripDetailPage → modal opens automatically.
9. Export CSV → downloads file with current filtered tickets.
10. Change to cards view → correct responsive layout on mobile.
