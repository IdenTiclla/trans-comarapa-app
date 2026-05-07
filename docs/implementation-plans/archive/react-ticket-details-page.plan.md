# Ticket Details Page (React)

## Context

Currently, the React application has the listing (`/tickets`) and post-sale confirmation (`/tickets/confirmation`), but there is no dedicated page to inspect an individual ticket. Secretaries, administrators, and clients need to see all information for a ticket (passenger, trip, seat, payment, status) in one place and be able to perform common actions: print, cancel, edit.

This plan implements **only the MVP** with the data already exposed by the backend. Elements from the visual mockup that are not supported by the current model (QR code, timeline/audit history, tax breakdown, digital email copy, "Validated" status) are out of scope and can be added in later iterations when backend support exists.

## Scope

### Included
- New route `/tickets/:id` in `frontend/src/router/index.tsx`.
- `TicketDetailPage.tsx` page with an asymmetric layout (8/4 columns) inspired by the mockup.
- Sections: Passenger Info, Trip Logistics, Seat Card, Financial Summary (only `price` and `payment_method`), Assigned Vehicle, Quick Actions.
- Actions: Print (reuse existing print route or `window.print()`), Cancel ticket (`PUT /tickets/:id/cancel` with confirmation), Edit (navigate to future edit page or open a basic modal — see "Edit" below).
- States: loading, error, not-found.
- Navigation: Add "View details" link in `TicketsIndexPage` rows.

### Excluded (gaps vs mockup)
- **QR code**: Omitted (backend does not generate a validation token; mockup shows it as "Validation Token").
- **Timeline/History**: No audit log endpoint exists for tickets.
- **Taxes/Insurance breakdown**: The schema has a single `price` field. Show only the total.
- **Email Digital Copy**: No email sending endpoint exists.
- **Boarding Status "Ready to Board" / "Validated" status**: The `TicketState` enum only has `pending | confirmed | cancelled`. Map visually to existing badges.
- **Upper Deck / Window metadata**: Check `SeatSchema` — if it doesn't have deck/window, show only the number.

## Critical Files

### New
- `frontend/src/pages/tickets/TicketDetailPage.tsx` — main page.
- `frontend/src/hooks/use-ticket-detail.ts` — hook that orchestrates calls (ticket + trip + bus/route if extra info is needed).

### Modified
- `frontend/src/router/index.tsx:91` — add route `{ path: '/tickets/:id', lazy: () => import('@/pages/tickets/TicketDetailPage') }` right after `/tickets/confirmation`.
- `frontend/src/pages/tickets/TicketsIndexPage.tsx` — in table rows, add action/link to `/tickets/${ticket.id}`.

### Reused (do not modify)
- `frontend/src/services/ticket.service.ts:10` — `getById(id)` already exists.
- `frontend/src/services/ticket.service.ts` — add `cancel(id)` method calling `PUT /tickets/{id}/cancel` (currently `TicketsIndexPage` uses `update({state:'cancelled'})`, but the dedicated endpoint is better: `backend/routes/ticket.py:103`).
- `frontend/src/services/trip.service.ts` — to get trip data (origin/destination route, date, time, bus).
- `frontend/src/lib/api.ts` — `apiFetch`.
- `frontend/src/pages/trips/TripDetailPage.tsx` — reference pattern (hook + sections + loading/error states).
- `sonner` toast for cancellation feedback.
- Confirmation: Reuse existing confirmation dialog (see `TicketsIndexPage.tsx:402` for current pattern).

## Data Flow

```
/tickets/:id
   ↓ useParams → ticketId
   ↓ useTicketDetail(ticketId)
      ├── ticketService.getById(id)           → ticket (includes client, seat, secretary)
      └── tripService.getById(ticket.trip_id) → trip (includes route, bus, date, time)
   ↓
TicketDetailPage render
```

The ticket schema does not include an embedded `trip`, so a second call is made. Both in parallel with `Promise.all` within the hook.

## Layout Structure (adapted from mockup)

```
Header: Breadcrumb · Ticket ID · State badge · Issued date · Actions (Edit, Print)
Grid 12 col:
  Col 8 (main):
    - Card: Passenger Info | Seat Card (inner 2 col)
    - Section: Trip Logistics (origin → bus → destination, date/time/type)
    - Card: Financial Summary (total, payment method)
  Col 4 (aside):
    - Card: Ticket State / Metadata (created_at, issuing secretary)
    - Card: Quick Actions (Cancel Ticket)
    - Card: Assigned Vehicle (bus plate, model, capacity)
```

## Detailed Actions

- **Print Ticket**: Redirect to print route if it exists, or `window.print()` with print-friendly CSS. Check if there is a reusable `PrintLayout` in `router/index.tsx:106`.
- **Edit Information**: In MVP, navigate to a placeholder or disable if no edit page exists yet. Confirm with user whether to implement now or leave as a stub.
- **Cancel Ticket**: Confirmation dialog → `ticketService.cancel(id)` → refresh ticket → success/error toast. Only show if `state !== 'cancelled'`.

## State Mapping (visual)

- `pending` → yellow "Pending" badge.
- `confirmed` → green "Confirmed" badge.
- `cancelled` → red "Cancelled" badge.

(Follow conventions already used in `TicketsIndexPage`.)

## Verification

1. `docker compose up` and seed: `make seed`.
2. Login as `secretary1@transcomarapa.com` / `123456`.
3. Navigate to `/tickets`, click a ticket → should go to `/tickets/:id` and show all data.
4. Verify statuses:
   - `pending` ticket → shows yellow badge, Cancel button visible.
   - `confirmed` ticket → green badge.
   - `cancelled` ticket → red badge, Cancel button hidden.
5. Test cancellation: click → confirm → verify toast and status change without reload.
6. Test print: click Print → clean preview/printout.
7. Error states:
   - `/tickets/99999` (non-existent) → shows "Ticket not found" message.
   - Simulate API down → shows error with retry button.
8. Responsive: verify grid collapses to 1 column on mobile.
9. Role-based: verify access with admin, secretary, client roles (client should only see their own tickets — check if `getById` endpoint restricts this).

## Out of Scope (future iterations)

- Backend audit log endpoint + History/Timeline section.
- Backend-signed QR token generation + render with `qrcode.react`.
- Price breakdown (requires adding `tax`, `insurance_surcharge` fields to schema).
- `POST /tickets/:id/send-email` endpoint + Digital Email Copy action.
- `validated` state in `TicketState` enum (for boarding registration).
