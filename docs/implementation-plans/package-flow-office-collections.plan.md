# Plan: Improvement of Package Flow and Office Collections

## Context

The current package system has critical limitations:
1. **Origin/destination not saved in DB** — only free text in frontend, never sent to backend.
2. **`/deliver` endpoint does not exist** — frontend calls `PUT /packages/{id}/deliver` but the route is not defined.
3. **No link to offices** — impossible to know which office should collect for "collect on delivery" packages.
4. **Settlements only visible to admin** — destination offices do not see pending collections.
5. **No traceability of who delivered** — no record of which secretary processed the delivery.

**Objective**: Full package flow with origin/destination offices, pending collections visible by office, and full custody of money.

---

## Phase 1: Data Model — Linking Packages to Offices

### 1.1 Alembic Migration
Create a migration to add to the `packages` table:
- `origin_office_id` (FK → offices.id, nullable) — nullable for existing data.
- `destination_office_id` (FK → offices.id, nullable).
- `delivered_by_secretary_id` (FK → secretaries.id, nullable) — who delivered at destination.

### 1.2 Update Package Model
**File**: `backend/models/package.py`
- Add 3 columns + relationships with explicit `foreign_keys=[]` (multiple FKs to the same table).

### 1.3 Update Package Schemas
**File**: `backend/schemas/package.py`
- `PackageCreate`: Add `origin_office_id` (required) and `destination_office_id` (required).
- `PackageResponse`: Add office fields + office names.

---

## Phase 2: Backend — Endpoints and Business Logic

### 2.1 Create `PUT /packages/{id}/deliver` Endpoint (BUG FIX)
**File**: `backend/routes/package.py`
- The frontend already calls this endpoint (`package.service.ts` line ~155) but it doesn't exist.
- Connect with `PackageService.deliver_package()` which already exists in the service.

### 2.2 Create `GET /packages/pending-collections` Endpoint
**File**: `backend/routes/package.py`
- Query params: `office_id` (required).
- Returns packages where:
  - `destination_office_id == office_id`.
  - `payment_status == 'collect_on_delivery'`.
  - `status IN ('arrived_at_destination')` — arrived but not delivered.

### 2.3 Update `PackageService.create_package()`
**File**: `backend/services/package_service.py`
- Persist `origin_office_id` and `destination_office_id` from payload.
- Auto-set `origin_office_id` from `secretary.office_id` if not explicit.

### 2.4 Update `PackageService.deliver_package()`
**File**: `backend/services/package_service.py`
- Save `delivered_by_secretary_id`.
- The `POR_COBRAR_COLLECTION` collection is already recorded in the register of the secretary who delivers (correct: it is the destination office).

### 2.5 Add Method in Repository
**File**: `backend/repositories/package_repository.py`
- `get_pending_collections(office_id)` with eager loading of sender, recipient, items, and origin_office.

---

## Phase 3: Frontend — Package Registration Redesign

### 3.1 Replace Free Text with Office Selection
**File**: `frontend-react/src/components/packages/PackageRegistrationModal.tsx`

Changes in form state (lines 41-52):
- `origin: 'Comarapa'` → `origin_office_id: number | null` (auto-set from user office).
- `destination: ''` → `destination_office_id: number | null` (office dropdown).

Changes in payload (lines 256-273):
- Include `origin_office_id` and `destination_office_id`.

UI:
- Fetch office list on mount (`apiFetch('/offices')`).
- Origin: Pre-selected dropdown with the logged-in user's office (readonly or editable).
- Destination: Dropdown of available offices (excluding origin).
- Show city name for each office for clarity.

### 3.2 Update `package.service.ts`
**File**: `frontend-react/src/services/package.service.ts`
- Add `getPendingCollections(officeId: number)`.
- Verify `deliver()` sends correct params to the new endpoint.

### 3.3 Update `PackageDeliveryModal`
**File**: `frontend-react/src/components/packages/PackageDeliveryModal.tsx`
- Show origin and destination office in delivery confirmation.
- Pass `changed_by_user_id` correctly.

### 3.4 Update List and Detail Views
**Files**: `PackagesIndexPage.tsx`, `PackageDetailPage.tsx`
- Show origin/destination as office names instead of empty text.

---

## Phase 4: Frontend — Pending Collections View by Office

### 4.1 Create `PendingCollections` Component
**New File**: `frontend-react/src/components/packages/PendingCollections.tsx`

Table/cards showing:
- Tracking No.
- Sender → Recipient.
- Origin Office.
- Total amount to collect.
- "Deliver and Collect" button → opens `PackageDeliveryModal`.

### 4.2 Integrate into Secretary Dashboard
**File**: `frontend-react/src/pages/dashboards/SecretaryDashboard.tsx`

Add "Pending Collections" section with:
- Badge with pending count.
- `PendingCollections` list filtered by `user.office_id`.
- "View all" link to full page.

### 4.3 Dedicated Page (optional)
**New File**: `frontend-react/src/pages/packages/PendingCollectionsPage.tsx`
- Route: `/packages/pending-collections`.
- Full view with filters and search.
- Add to router and secretary navigation.

---

## Phase 5: Financial Integrity and Admin Visibility

### 5.1 Delivery Validation
**File**: `backend/services/package_service.py`
- If `destination_office_id` is set, validate that the delivering secretary belongs to that office.
- Log warning if mismatch (do not block for edge cases).

### 5.2 Update Admin Financial Summary
**File**: `frontend-react/src/pages/admin/FinancialDashboardPage.tsx`
- Add "Collections by Office" section: Breakdown of `POR_COBRAR_COLLECTION` by office.

### 5.3 Update Partner Settlements
**File**: `frontend-react/src/pages/admin/OwnerSettlements.tsx`
- "Collect on delivery" packages already collected at destination should be reflected as income.
- Show at which office each amount was collected.

---

## Execution Order

```
Phase 1 (DB/Model) → Phase 2 (Backend) → Phase 3 (Frontend Registration) → Phase 4 (Pending Collections) → Phase 5 (Financial)
```

Phases 3 and 4 can be done in parallel once Phase 2 is completed.

---

## Critical Files

| File | Change |
|---------|--------|
| `backend/models/package.py` | +3 columns, +3 relationships |
| `backend/schemas/package.py` | +office fields in Create/Response |
| `backend/routes/package.py` | +2 endpoints (deliver, pending-collections) |
| `backend/services/package_service.py` | Update create, deliver, +pending_collections |
| `backend/repositories/package_repository.py` | +get_pending_collections, eager loading |
| `frontend-react/src/components/packages/PackageRegistrationModal.tsx` | Office dropdowns replace free text |
| `frontend-react/src/components/packages/PackageDeliveryModal.tsx` | Show offices, correct params |
| `frontend-react/src/services/package.service.ts` | +getPendingCollections |
| `frontend-react/src/components/packages/PendingCollections.tsx` | **NEW** — pending collections table |
| `frontend-react/src/pages/dashboards/SecretaryDashboard.tsx` | +pending collections section |

---

## Verification

1. **Registration**: Create package with origin/destination office → verify in DB that `origin_office_id` and `destination_office_id` are saved.
2. **Paid at origin collection**: Create `paid_on_send` package → verify `CashTransaction` type `PACKAGE_PAYMENT` in origin office register.
3. **Collect on delivery collection**: Create `collect_on_delivery` package → assign to trip → arrives at destination → verify it appears in "Pending Collections" for the destination secretary.
4. **Delivery and collection**: Deliver "collect on delivery" package → verify `CashTransaction` type `POR_COBRAR_COLLECTION` in destination office register.
5. **Partner settlement**: Verify amount collected at destination is reflected in bus owner's settlements.
6. **Integrity**: Verify `origin_office_income + destination_office_income == total_trip_packages`.
