# Plan: Automatic Cash Register Opening

## Objective

Automate the cash register opening so the system opens it automatically when a secretary performs the first operation of the day that requires a register (ticket sale, paid package registration, etc.), eliminating the manual "Open Register" step every morning.

## Philosophy

- **Opening:** Automatic with `initial_balance = 0` (or the configurable balance per office).
- **Closing:** Remains manual with mandatory reconciliation (counting physical cash).
- **Fallback:** The secretary can still open the register manually from the Cash Register page if desired.

---

## Phase 1: Backend — Auto-Opening Logic

### 1.1 Add `auto_opened` field to the model

**File:** `backend/app/models/cash_register.py`

- Add `auto_opened` column (Boolean, default `False`) to distinguish automatic from manual openings.
- Update `CashRegisterResponse` schema to include the field.

### 1.2 Modify schemas

**File:** `backend/app/schemas/cash_register.py`

- Add `auto_opened: bool = False` to `CashRegisterBase` and `CashRegisterResponse`.
- Do not add to `CashRegisterCreate` (the backend determines it).

### 1.3 Create `ensure_open_register()` helper in CashRegisterService

**File:** `backend/app/services/cash_register_service.py`

New method:

```python
def ensure_open_register(self, office_id: int, opened_by_id: int) -> CashRegister:
    """
    Returns the open register for the office.
    If it doesn't exist, opens it automatically with initial_balance=0.
    """
    current = self.get_current_register(office_id)
    if current:
        return current
    
    return self.open_register(
        office_id=office_id,
        opened_by_id=opened_by_id,
        initial_balance=0.0,
        auto_opened=True
    )
```

### 1.4 Modify `open_register()` to accept `auto_opened`

- Add `auto_opened: bool = False` parameter.
- Pass the flag when creating the `CashRegister`.

### 1.5 Add auto-opening endpoint (or reuse existing)

**Option A (recommended):** Do not add a new endpoint. The auto-open happens inside the same service when another endpoint (ticket sale, package create, etc.) invokes it. The frontend does not call an auto-open endpoint explicitly.

### 1.6 Update services that validate open register

Replace the current pattern:

```python
# BEFORE (hard block)
current_register = cash_service.get_current_register(office_id)
if not current_register:
    raise ValidationException("No open register...")
```

With:

```python
# AFTER (auto-open)
current_register = cash_service.ensure_open_register(
    office_id=office_id,
    opened_by_id=user_id
)
```

**Files to modify:**

| File | Method | Change |
|---------|--------|--------|
| `backend/app/services/ticket_service.py` | `create_ticket()` | Replace `get_current_register` + validation with `ensure_open_register()` |
| `backend/app/services/package_service.py` | `create_package()` | Replace register validation with `ensure_open_register()` when `payment_status == "paid_on_send"` |
| `backend/app/services/package_service.py` | `deliver_package()` | Replace register validation with `ensure_open_register()` when `payment_status == "collect_on_delivery"` |
| `backend/app/services/owner_financial_service.py` | `record_withdrawal()` | Replace validation with `ensure_open_register()` |

### 1.7 Add initial balance configuration per office

**File:** `backend/app/models/office.py`

- Add `default_cash_balance` field (Float, default `0.0`) to `Office`.
- Use this value in `ensure_open_register()` as `initial_balance` instead of hardcoding `0.0`.

**File:** `backend/app/schemas/office.py`

- Add `default_cash_balance: float = 0.0` to corresponding schemas.

---

## Phase 2: Backend — Nightly Auto-Close (optional)

### 2.1 Auto-close endpoint

**File:** `backend/app/routes/cash_register.py`

Add `POST /cash-registers/auto-close-stale` endpoint (protected by admin role):

```python
@router.post("/auto-close-stale")
async def auto_close_stale_registers(db: Session = Depends(get_db)):
    """
    Closes all open registers from previous days.
    Executed manually or via cron job.
    """
    # Search for open registers where date < today
    # Close with final_balance = expected_balance (auto-calculated)
    # Mark auto_closed = True
```

### 2.2 `auto_closed` field in model (optional)

- Add `auto_closed: bool = False` to the model if distinction is desired.

### 2.3 Cron script (recommended)

Create `backend/scripts/auto_close_registers.py` to run at midnight:

```bash
# crontab: 0 0 * * * cd /app && python scripts/auto_close_registers.py
```

---

## Phase 3: Frontend — Auto-Opening Notification

### 3.1 Notification Toast

When the backend opens the register automatically, the frontend should notify the user via toast:

```
ℹ️ Cash register automatically opened for today (Initial balance: Bs. 0.00)
```

### 3.2 Detect auto-opening in the response

Frontend services (ticket, package) already receive the backend response. Add logic:

**Pattern:** When a ticket/package is created and the response includes `cash_register` with `auto_opened=True`, show a notification toast.

### 3.3 Visual Indicator on the Cash Register Page

In `CashRegisterPage.tsx`, if the current register has `auto_opened = True`:

- Show "Automatic Opening" badge next to the register status.
- Add tooltip: "This register was opened automatically when performing the first operation of the day".

### 3.4 Update Types

**File:** `frontend-react/src/types/cash-register.ts`

- Add `auto_opened?: boolean` to the `CashRegister` type.

---

## Phase 4: Frontend — Cash Register UX Improvements

### 4.1 "Open Register" button remains available

The manual button in `CashRegisterPage.tsx` is kept as a fallback. Add explanatory text:

```
The register opens automatically when performing the first sale of the day.
You can also open it manually here if you need to set an initial balance.
```

### 4.2 Initial balance editable only on manual opening

- If the secretary opens manually: show `initial_balance` input.
- If opened automatically: use the office's `default_cash_balance` (default `0.0`).

### 4.3 Cash Register Status Banner in Top Bar (optional)

Add a small indicator in `AppHeader` showing if the register is open/closed:

```
🟢 Register Open | 🔴 Register Closed
```

---

## Phase 5: Tests

### 5.1 Backend tests

**File:** `backend/tests/services/test_cash_register_service.py`

- Test: `ensure_open_register` returns existing register if already open.
- Test: `ensure_open_register` creates new register if it doesn't exist.
- Test: `ensure_open_register` sets `auto_opened=True` in new register.
- Test: `ensure_open_register` uses office `default_cash_balance`.
- Test: Ticket sale without open register → auto-opening + transaction recorded.
- Test: Paid package registration without register → auto-opening.
- Test: Collect-on-delivery package delivery without register → auto-opening.
- Test: Auto-closing of registers from previous days.

### 5.2 Frontend tests

- Test: Toast appears when register opens automatically.
- Test: "Automatic Opening" badge visible when `auto_opened=True`.
- Test: Manual button still works.

---

## Files to Modify (Summary)

### Backend
| File | Change |
|---------|--------|
| `models/cash_register.py` | Add `auto_opened`, `auto_closed` |
| `models/office.py` | Add `default_cash_balance` |
| `schemas/cash_register.py` | Add new fields to schemas |
| `schemas/office.py` | Add `default_cash_balance` |
| `services/cash_register_service.py` | Add `ensure_open_register()`, update `open_register()` |
| `services/ticket_service.py` | Use `ensure_open_register()` |
| `services/package_service.py` | Use `ensure_open_register()` |
| `services/owner_financial_service.py` | Use `ensure_open_register()` |
| `routes/cash_register.py` | Add auto-close endpoint (optional) |

### Frontend
| File | Change |
|---------|--------|
| `types/cash-register.ts` | Add `auto_opened` |
| `pages/admin/CashRegisterPage.tsx` | Auto-open badge, explanatory text |
| `components/cash-register/OpenRegisterModal.tsx` | Note about auto-opening |
| `components/layout/AppHeader.tsx` | Cash register status indicator (optional) |

### Migration
| File | Change |
|---------|--------|
| `migrations/versions/xxx_add_auto_opened_cash_register.py` | Alembic migration for `auto_opened`, `auto_closed`, `default_cash_balance` |

---

## Execution Order

1. **Phase 1.1-1.4:** Model + schemas + `ensure_open_register()` (base).
2. **Phase 1.6:** Update consumer services (ticket, package, owner).
3. **Phase 1.7:** Configurable initial balance per office.
4. **Phase 5.1:** Backend tests.
5. **Phase 3:** Frontend notification + types.
6. **Phase 4:** UX improvements.
7. **Phase 2:** Nightly auto-close (optional, at the end).
8. **Phase 5.2:** Frontend tests.

---

## Verification

1. `pytest -v` — all tests pass.
2. Without open register, create a ticket → register opens automatically, transaction is recorded.
3. Create second ticket → uses the same register (no duplication).
4. Open manually with initial balance → works as before.
5. Close register manually → reconciliation works the same.
6. `npm run lint && npx tsc --noEmit` — no errors.
