# Plan: Trans Comarapa - MVP Phase 1 (First Functional Version)

## Context

Trans Comarapa operates manually with paper and notebooks. The system already has ~85% of transactional flows built (ticket sales with seat map, package registration, trip management). What is missing for a **usable production version** are: office management, daily cash register, seat locking with Redis, driver/assistant dashboards, and basic reports.

## Current State

### Already Built (Backend + Frontend):
- Auth + RBAC (JWT, 5 roles) ✅
- Route management (CRUD + schedules) ✅
- Bus and seat management (CRUD + layout editor) ✅
- Trip scheduling (CRUD + statuses) ✅
- Ticket sales (seat map, statuses, receipts) ✅
- Packages (registration, items, delivery, "collect on delivery") ✅
- User and client management ✅
- Admin and secretary dashboards (statistics, upcoming trips) ✅
- Activity/audit log ✅

### Missing for MVP:
1. ❌ Office CRUD (model exists, no routes/service)
2. ❌ Cash register system (no models, nothing)
3. ❌ Seat locking with Redis (client exists, no logic)
4. ❌ Driver/Assistant dashboards (skeletons only)
5. ❌ Monthly reports with export

---

## Implementation Plan (5 Milestones)

### Milestone 1: Office Management
**Complexity:** Small | **Dependencies:** None

**Backend (4 new, 2 modify):**
- Create `backend/schemas/office.py` — `OfficeCreate`, `OfficeUpdate`, `OfficeResponse`
- Create `backend/repositories/office_repository.py` — extends `BaseRepository[Office]`
- Create `backend/services/office_service.py` — CRUD with `location_id` validation
- Create `backend/routes/office.py` — `GET/POST/PUT/DELETE /api/v1/offices`
- Modify `backend/api/v1/api.py` — register router
- Modify `backend/db/seed.py` — create default offices (Santa Cruz, Los Negros, San Isidro, Comarapa)

**Frontend (4 new, 2 modify):**
- Create `frontend-react/src/services/office.service.ts`
- Create `frontend-react/src/store/office.slice.ts`
- Create `frontend-react/src/pages/admin/OfficesPage.tsx` — follow `RoutesPage.tsx` pattern
- Modify `frontend-react/src/router/index.tsx` — add `/admin/offices` route
- Modify `frontend-react/src/components/layout/AdminHeader.tsx` — add "Offices" link

---

### Milestone 2: Cash Register System
**Complexity:** Large | **Depends on:** M1 (office_id)

**Backend (7 new, 3 modify):**
- Create `backend/models/cash_register.py` — `CashRegister` (office_id, date, opened_by, initial_balance, closed_by, final_balance, status)
- Create `backend/models/cash_transaction.py` — `CashTransaction` (cash_register_id, type, amount, payment_method, reference_id, reference_type)
- Add enums in `backend/core/enums.py` — `CashRegisterStatus` (OPEN/CLOSED), `CashTransactionType` (TICKET_SALE, PACKAGE_PAYMENT, POR_COBRAR_COLLECTION, WITHDRAWAL, ADJUSTMENT)
- Create `backend/schemas/cash_register.py`
- Create `backend/repositories/cash_register_repository.py` — queries: open register by office, transactions by register, daily summary
- Create `backend/services/cash_register_service.py`:
  - `open_register()` — validate no open register exists
  - `close_register()` — calculate expected vs real
  - `record_transaction()` — called automatically when selling tickets/packages
  - `get_current_register()` / `get_daily_summary()`
- Create `backend/routes/cash_register.py` — `POST /open`, `POST /{id}/close`, `GET /current/{office_id}`, `GET /{id}`, `GET /history`
- Modify `backend/services/ticket_service.py` — **block sale if no open register** + auto-create CashTransaction on sale
- Modify `backend/services/package_service.py` — **block registration if no open register** + auto-create CashTransaction on payment registration
- Alembic migration for `cash_registers` and `cash_transactions` tables

**Frontend (5 new, 2 modify):**
- Create `frontend-react/src/services/cash-register.service.ts`
- Create `frontend-react/src/store/cash-register.slice.ts`
- Create `frontend-react/src/pages/CashRegisterPage.tsx`:
  - Open/close register with balance
  - Status banner (open/closed)
  - Transaction list with filters
  - Totals by payment method
  - Daily summary
- Create components in `frontend-react/src/components/cash-register/`:
  - `OpenRegisterModal.tsx`, `CloseRegisterModal.tsx`, `TransactionList.tsx`
- Modify router and navigation — `/cash-register` route, "Cash Register" link in secretary nav

---

### Milestone 3: Seat Locking with Redis
**Complexity:** Medium | **Dependencies:** None (parallel to M2)

**Backend (2 new, 2 modify):**
- Create `backend/services/seat_lock_service.py`:
  - `lock_seat(trip_id, seat_id, user_id, ttl=300)` — Redis SET NX EX
  - `unlock_seat()` — only if it's the current holder
  - `is_locked()` / `get_locked_seats()` / `get_lock_holder()`
  - Graceful fallback if Redis is unavailable
- Create `backend/routes/seat_lock.py` — `POST /seats/lock`, `DELETE /seats/lock`, `GET /seats/locks/{trip_id}`
- Modify `backend/services/ticket_service.py` — verify lock before creating ticket, release lock after
- Modify available seats response to include lock status

**Frontend (0 new, 2 modify):**
- Modify seat map component — call lock API on select, show seats locked by others (distinct visual state)
- Add lock/unlock methods to `frontend-react/src/services/seat.service.ts`

---

### Milestone 4: Driver and Assistant Dashboards
**Complexity:** Small | **Dependencies:** None (parallel to M2/M3)

**Backend (0 new, 1 modify):**
- Add `GET /api/v1/trips/my-trips` in `backend/routes/trip.py` — trips assigned to the current user (by driver_id or assistant_id)

**Frontend (0 new, 3 modify):**
- Replace skeleton in `DriverDashboard.tsx`:
  - Trips assigned today (cards with route, time, bus, status)
  - Passenger manifest (table: name, seat, destination)
  - Trip package list
- Replace skeleton in `AssistantDashboard.tsx`:
  - Same trip view as driver
  - Focus on package management
  - Boarding checklist
- Add navigation links for driver/assistant in `AdminHeader.tsx`

---

### Milestone 5: Basic Reports
**Complexity:** Medium | **Depends on:** M2 (cash register data)

**Backend (2 new, 1 modify):**
- Create `backend/services/report_service.py`:
  - `monthly_ticket_report(year, month, office_id)` — total tickets, revenue by payment method, by route
  - `monthly_package_report(year, month, office_id)` — total packages, revenue, by status
  - `monthly_cash_report(year, month, office_id)` — cash summary
- Create `backend/routes/report.py`:
  - `GET /reports/monthly/tickets`, `/packages`, `/cash` (with year, month, office_id filters)
  - `GET /reports/monthly/*/csv` — CSV export (StreamingResponse)
  - Admin sees all offices; secretary only their own
- Register in `backend/api/v1/api.py`

**Frontend (3 new, 2 modify):**
- Create `frontend-react/src/services/report.service.ts`
- Create `frontend-react/src/pages/ReportsPage.tsx`:
  - Month/Year selector
  - Office filter (admin only)
  - Tabs: Tickets, Packages, Cash
  - Summary cards + data tables
  - "Download CSV" button
- Modify router and navigation — `/reports` route, "Reports" link in admin and secretary nav

---

## Deferred (Post-MVP)

| Feature | Reason |
|---------|-------|
| Withdrawal Management / FleetOwner | Can be tracked manually initially |
| PDF Export | CSV covers immediate needs |
| Segment-based occupancy (TIX-04/05) | Most travel the full route; requires significant model changes |
| Client Portal | Out of scope for Phase 1 |
| SMS/WhatsApp Notifications | Phase 2 |

---

## Business Decisions

- **Sale without open register: BLOCKED.** If the secretary does not have an open register, they cannot sell tickets or register packages. They must open the register before operating.

## Execution Order

```
M1 (Offices) → M2 (Cash Register) → M3 (Redis Locks) → M4 (Dashboards) → M5 (Reports)
```

Linear order, one milestone at a time.

---

## Verification

- **M1:** Create/edit/delete offices from admin UI. Verify secretaries can be assigned to offices.
- **M2:** Open register → sell ticket → verify transaction recorded → close register with balance. Test "collect on delivery" with packages.
- **M3:** Open 2 secretary sessions → select same seat → verify only one can lock. Verify automatic expiration (5 min).
- **M4:** Login as driver → see assigned trips → see passenger manifest. Same for assistant.
- **M5:** Generate monthly report → verify totals → download CSV → open in Excel.

---

## Critical Files (Reference)

- `backend/api/v1/api.py` — central router registration
- `backend/repositories/base.py` — base repository pattern
- `backend/services/ticket_service.py` — modify for M2 and M3
- `backend/services/package_service.py` — modify for M2
- `backend/core/enums.py` — add cash register enums
- `backend/core/redis.py` — existing Redis client for M3
- `frontend-react/src/components/layout/AdminHeader.tsx` — navigation
- `frontend-react/src/router/index.tsx` — route registration
- `frontend-react/src/pages/admin/RoutesPage.tsx` — reference pattern for CRUD pages
