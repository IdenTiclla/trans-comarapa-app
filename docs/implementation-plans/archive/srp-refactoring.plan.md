# Plan: Implement Single Responsibility Principle (SRP)

## Context

The codebase has SRP violations on both sides (backend and frontend). Backend routes contain business logic that should be in services. The frontend has a "god component" (`TripDetailPage.tsx`, 676 lines, 22+ `useState`, 8+ responsibilities) and hooks that mix unrelated concerns. This plan applies SRP incrementally, leaving the app functional after each phase.

---

## Phase 1: Backend — Extract Business Logic from Routes to Services

### 1A. Create `backend/services/bus_service.py`

Extract from `backend/routes/bus.py` (335 lines):

- `_validate_seat_layout(seats, floors)` — Validation of: unique seat numbers, unique positions per deck, floor consistency. Currently duplicated in `create_bus_with_seats` (lines 91-125) and `update_bus_seats` (lines 247-281).
- `create_bus(data)` — License plate verification + creation.
- `create_bus_with_seats(data)` — Validation + atomic creation of bus + seats.
- `update_bus_seats(bus_id, seats)` — Verify existing tickets + replace seats.
- `delete_bus(bus_id)` — Verify dependencies (trips, tickets) + delete.

**Pattern to follow:** `backend/services/package_service.py` — Constructor with `db: Session`, uses domain exceptions from `core/exceptions.py`, the route becomes a thin delegator.

**Files:**
- Create: `backend/services/bus_service.py`
- Modify: `backend/routes/bus.py` — Reduce to ~50 lines of delegation.

### 1B. Create `backend/services/route_service.py`

Extract from `backend/routes/route.py` (352 lines):

- `_validate_locations(origin_id, destination_id)` — Location existence verification (duplicated in create lines 24-36 and update lines 137-151).
- `create_route(data)` — Uniqueness validation + creation.
- `update_route(route_id, data)` — Validation + update.
- `create_schedule(route_id, data)` — Verify duplicates + create.
- `delete_route(route_id)` / `delete_schedule(schedule_id)` — Verify dependencies.

**Files:**
- Create: `backend/services/route_service.py`
- Modify: `backend/routes/route.py`

### 1C. Create `backend/services/person_service.py`

Extract the duplicated user+person creation pattern from:
- `backend/routes/secretary.py` (lines 25-118)
- `backend/routes/administrator.py` (lines 17-108)

Both do exactly the same thing: verify unique email/username, hash password, create User, create role entity, commit transaction.

- `create_person_with_user(person_data, user_data, role, PersonModel)` — Generic method that unifies the logic.

**Files:**
- Create: `backend/services/person_service.py`
- Modify: `backend/routes/secretary.py` — `create_secretary_with_user` becomes ~5 lines.
- Modify: `backend/routes/administrator.py` — `create_administrator_with_user` becomes ~5 lines.

### Phase 1 Verification
```bash
cd backend && pytest -v --cov=.
# Manually test in Swagger:
# POST /api/v1/buses/with-seats
# POST /api/v1/secretaries
# POST /api/v1/routes
# PUT /api/v1/buses/{id}/seats
```

---

## Phase 2: Frontend — Decompose TripDetailPage (676 lines → ~200)

### 2A. Create `hooks/use-trip-detail-page.ts`

Extract ALL stateful logic from `pages/trips/TripDetailPage.tsx`:

- All 22+ `useState` (lines 48-91).
- All async functions: `executeDispatch`, `executeFinish`, `saveDriver`, `saveAssistant`, `handleUnassignPackage`, `handleCancelReservation`, `executeConfirmSale`, `confirmSeatChange`.
- `useEffect` for data fetching (lines 109-122).
- `useMemo` for `ticketStats` (lines 349-354).
- Seat map handlers: `handleSellTicket`, `handleReserveSeat`, `handleClearSelection`, etc.

Returns a structured object grouping related state:
```typescript
return {
  trip, loading, error, ticketStats,
  dispatch: { show, executing, execute, canDispatch, setShow },
  finish: { show, executing, execute, setShow },
  staff: { editing, selected, saving, save, setEditing, setSelected },
  seatChange: { mode, ticket, newSeat, showConfirm, loading, confirm, cancel },
  ticketSale: { show, actionType, seats, open, close, onCreated },
  ticketView: { show, ticket, open, close },
  seatMap: { key, selectedSeats, controlledIds, onSelectionChange },
  packages: { items, loading, unassign },
  refreshTrip,
}
```

### 2B. Create `hooks/use-keyboard-shortcuts.ts`

Extract lines 318-346. Reusable generic hook:
```typescript
function useKeyboardShortcuts(
  shortcuts: Record<string, () => void>,
  enabled: boolean
): void
```

`TripDetailPage` uses it with keys V, R, C, Escape, Enter.

### 2C. Create `components/trips/TripStaffEditor.tsx`

Extract lines 468-509 — inline editing UI for driver/assistant with select dropdowns.

Props: `drivers`, `assistants`, `staff` state from the hook.

### 2D. Create `components/trips/TripInfoCard.tsx`

Extract lines 452-525 — Trip info card with status badge, date/time/bus/price grid, and occupancy widget.

Props: `trip`, `ticketStats`, `formatTimeAmPm`, `staffEditor` component.

### 2E. Create `components/trips/TripConfirmationModals.tsx`

Extract the 4 inline modals (lines 569-672): Dispatch, Finish, Confirm Sale, Seat Change. They share the same confirmation modal pattern.

Props: `dispatch`, `finish`, `seatChange`, `ticketSale` objects from the hook.

**Files:**
- Create: `frontend-react/src/hooks/use-trip-detail-page.ts`
- Create: `frontend-react/src/hooks/use-keyboard-shortcuts.ts`
- Create: `frontend-react/src/components/trips/TripStaffEditor.tsx`
- Create: `frontend-react/src/components/trips/TripInfoCard.tsx`
- Create: `frontend-react/src/components/trips/TripConfirmationModals.tsx`
- Modify: `frontend-react/src/pages/trips/TripDetailPage.tsx` — Remains ~150-200 lines of JSX composition.

### Phase 2 Verification
```bash
cd frontend-react && npm run build  # 0 TypeScript errors
```
Manually test in browser:
- Navigate to trip detail.
- Sell ticket, reserve, confirm sale, cancel reservation.
- Change seat.
- Dispatch/finish trip.
- Edit driver/assistant.
- Keyboard shortcuts: V (sell), R (reserve), C (clear), Escape.

---

## Phase 3: Frontend — Clean Hooks and Extract Presentation

### 3A. Convert `use-package-status.ts` → `lib/package-status.ts`

The current hook (66 lines) is NOT a real hook — it has 0 `useState`/`useEffect`. They are pure mapping functions. Also `package.service.ts` (lines 7-52) duplicates the same constants.

- Create `lib/package-status.ts` with exports: `getPackageStatusLabel`, `getPackageStatusColor`, `getPaymentStatusLabel`, `getPaymentStatusVariant`.
- Update all consumers (Grep for `usePackageStatus`).
- Delete `hooks/use-package-status.ts`.
- Remove duplicated constants from `services/package.service.ts`.

### 3B. Create `lib/trip-formatters.ts`

Extract from `hooks/use-trip-details.ts` (lines 44-85): `formatDate`, `formatTime`, `getStatusClass`, `getStatusText`.

Also consolidate with duplicates in `TripDetailPage.tsx` (lines 18-32): `STATUS_MAP`, `STATUS_BADGE`, `formatTimeAmPm`.

- Create `lib/trip-formatters.ts` with all formatting and trip status mapping functions.
- Modify `hooks/use-trip-details.ts` — Remains only: `soldTickets`, `reservedSeatNumbers`, `fetchSoldTickets`.
- Modify `pages/trips/TripDetailPage.tsx` — Import from `lib/trip-formatters.ts`.

### 3C. Move Stats from `sales.service.ts` to `stats.service.ts`

`sales.service.ts` mixes `/sales` endpoints with `/stats/sales/` endpoints. The `getRecentSales` and `getSalesSummary` functions belong to `stats.service.ts`.

- Modify `services/sales.service.ts` — Remove stats functions.
- Modify `services/stats.service.ts` — Add `getRecentSales`, `getSalesSummary`.
- Update consumers.

### 3D. Extract Constants from `package.service.ts`

Move `PACKAGE_STATUSES`, `PAYMENT_METHODS`, `calculatePackageTotal`, `calculateItemsCount`, `validatePackageData` (lines 1-99) out of the service.

- Constants go to `lib/package-status.ts` (created in 3A).
- Calculation/validation functions go to `lib/package-utils.ts`.
- `services/package.service.ts` remains only with API calls.

**Files:**
- Create: `frontend-react/src/lib/package-status.ts`
- Create: `frontend-react/src/lib/trip-formatters.ts`
- Create: `frontend-react/src/lib/package-utils.ts`
- Delete: `frontend-react/src/hooks/use-package-status.ts`
- Modify: `frontend-react/src/hooks/use-trip-details.ts`
- Modify: `frontend-react/src/services/package.service.ts`
- Modify: `frontend-react/src/services/sales.service.ts`
- Modify: `frontend-react/src/services/stats.service.ts`
- Modify: Consumers of `usePackageStatus` (Grep to find).

### Phase 3 Verification
```bash
cd frontend-react && npm run build  # 0 errors
```
- Test package detail page (status badges).
- Test dashboard (recent sales stats).
- Test ticket sale flow.

---

## Phase 4: Backend — Medium/Low Priority Cleanup

### 4A. Consolidate Role-based Profile Endpoints in `auth.py`

`backend/routes/auth.py` lines 200-302 has 5 almost identical endpoints (`/me/secretary`, `/me/driver`, etc.) that repeat the same pattern.

- Create `AuthService.get_role_profile(user, expected_role)` in `services/auth_service.py`.
- Each endpoint in `auth.py` is reduced to 3 lines delegating to the service.

### 4B. Extract Password Hashing from `models/user.py`

`User` model (lines 48-77) contains `verify_password`, `get_password_hash`, and `passlib` configuration. An ORM model should not possess hashing infrastructure.

- Create `backend/core/security.py` with `verify_password(plain, hashed)` and `hash_password(plain)`.
- `User.get_password_hash` and `User.verify_password` delegate to the new module (keep as wrappers for compatibility).

**Files:**
- Create: `backend/core/security.py`
- Modify: `backend/models/user.py`
- Modify: `backend/services/auth_service.py`
- Modify: `backend/routes/auth.py`

### Phase 4 Verification
```bash
cd backend && pytest -v --cov=.
```
- Test login/logout.
- Test `GET /api/v1/auth/me/secretary`, `/me/driver`, etc.

---

## Phase 5: Update Project Documentation

After implementing phases 1-4, update the documentation so future AI agents and developers follow SRP for clean code.

### 5A. Update `CLAUDE.md`

Add **SRP Rules** section within "Development Patterns" with explicit rules:

**Backend:**
- Routes are thin delegators: receive request → call service → return response. MAX ~10 lines per endpoint.
- Services contain ALL business logic, validation, and orchestration. One service per domain.
- Repositories only data access. No business logic.
- Models only ORM definition. No infrastructure logic (hashing, etc.).
- Complex validations go into private service methods (`_validate_*`).

**Frontend:**
- Pages are component compositions. MAX ~200 lines. No business logic.
- Hooks encapsulate stateful logic (`useState`, `useEffect`). One hook per feature/concern.
- Pure formatting/mapping functions go to `lib/` (NOT in hooks).
- Services only API calls with `apiFetch`. No constants, no validation, no calculations.
- Constants and status mappings go into `lib/constants.ts` or `lib/[entity]-status.ts`.

### 5B. Update `.agents/rules/best-practices.md`

Add "Single Responsibility Checklist" that agents must verify before writing code:

- [ ] Does the route/page do more than delegate?
- [ ] Does the service/hook mix unrelated concerns?
- [ ] Is there presentation logic in hooks or services?
- [ ] Are there constants/mappings inside services or hooks?
- [ ] Does the component/file exceed ~250 lines?

### 5C. Update `.agents/skills/backend-dev/SKILL.md`

Add concrete examples of the correct pattern post-refactoring:
- Example of a thin route delegating to a service (use refactored `bus.py` as reference).
- Example of a service with private validation (`_validate_seat_layout`).
- Example of `person_service.py` as a generic reusable pattern.

### 5D. Update `.agents/skills/frontend-dev/SKILL.md`

Add post-refactoring rules:
- Example of a page as composition (use refactored `TripDetailPage.tsx`).
- Rule: Hooks are for stateful logic, `lib/` for pure functions.
- Rule: Services only for API calls, constants in `lib/`.
- List new `lib/` files as reference: `trip-formatters.ts`, `package-status.ts`, `package-utils.ts`.

### 5E. Update `docs/architecture.md`

Add SRP constraints in each layer of the diagram:
- Routes: "Thin adapters only. No validation, no business logic, no response formatting."
- Services: "Single domain per service. Owns validation via private methods."
- Lib (frontend): "Pure functions only. Formatters, constants, utility calculations."

### 5F. Update `frontend-react/README.md`

Reflect the new `lib/` and `hooks/` files created during the refactoring. Update the hooks inventory and the architecture section.

**Files to modify:**
- `CLAUDE.md`
- `.agents/rules/best-practices.md`
- `.agents/skills/backend-dev/SKILL.md`
- `.agents/skills/frontend-dev/SKILL.md`
- `docs/architecture.md`
- `frontend-react/README.md`

### Phase 5 Verification
- Review that each documentation file reflects the new structure.
- Verify no contradictions between `CLAUDE.md`, `best-practices.md`, and the SKILLs.
- Confirm that file inventories (hooks, lib, services) are up to date.

---

## Summary

| Phase | Severity | New Files | Modified Files | Risk |
|------|-----------|-----------|----------------|------|
| 1: Backend routes→services | HIGH | 3 | 4 | Low (existing pattern) |
| 2: TripDetailPage decomposition | CRITICAL | 5 | 1 | Medium (complex UI) |
| 3: Frontend hooks/presentation | HIGH+MEDIUM | 3 | ~7 | Low |
| 4: Backend cleanup | MEDIUM+LOW | 1 | 3 | Very low |
| 5: Update documentation | — | 0 | 6 | None |
