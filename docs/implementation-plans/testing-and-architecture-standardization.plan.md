# Plan: Testing & Architecture Standardization (v2)

## Context

The project has a solid foundation but faces critical quality issues:

1. **Impure "Unit" Tests**: `backend/tests/unit/` depends on a real MySQL database — these are misclassified integration tests.
2. **Untestable Services**: Services hardcode `self.repo = XRepository(db)` in `__init__`, making it impossible to inject mocks.
3. **Fragile Frontend Mocking**: Global `vi.mock` in `setup.ts` + manual mocks per service — does not test the real service→API integration.
4. **No Factories**: Fixtures of 200+ lines manually creating data.
5. **No Coverage Thresholds**: No quality gates.
6. **Outdated Skills**: DI, MSW, factories, and test categories are not documented.

**Objective**: Professionalize the testing stack following industry standards (Testing Pyramid, DI, MSW, AAA, factories).

---

## Identified Gaps (v1 → v2)

| # | Gap | Impact |
|---|-----|---------|
| 1 | DI with `Optional[repo]=None` is acceptable but the plan doesn't explain why Protocol-based DI was discarded | Lacks technical justification |
| 2 | No test data factories (factory-boy) | 200+ line fixtures |
| 3 | No pytest markers configuration (`--strict-markers`) | Misclassified tests without warning |
| 4 | No separate `conftest.py` for unit tests (no DB) | Unit tests still require MySQL |
| 5 | No `renderWithProviders` utility for frontend | Boilerplate in each component test |
| 6 | Incomplete MSW setup (lacks organization of handlers, migration path) | Frontend tests don't cover service→API |
| 7 | No coverage thresholds | No quality gates |
| 8 | No pattern for hook testing (`renderHook`) | Custom hooks untestable |
| 9 | `BusService` doesn't use repository (violates architecture) | Architectural inconsistency |
| 10 | `pytest-mock` not in dependencies | `mocker` fixture cannot be used |
| 11 | Test naming convention not defined | Inconsistent tests |
| 12 | No CI/CD integration plan | Tests don't run in PRs |
| 13 | `setup.ts` global `apiFetch` mock conflicts with MSW | Migration path needed |
| 14 | No documentation or testing guide | Tribal knowledge |
| 15 | Skills don't cover new patterns | AI agent repeats errors |

---

## Phase 1: Backend Infrastructure

### 1A. Add Test Dependencies

**File:** `backend/pyproject.toml`

```toml
[project.optional-dependencies]
test = [
    "pytest>=7.4.0",
    "pytest-asyncio>=0.21.1",
    "httpx>=0.24.1",
    "pytest-cov>=4.1.0",
    "pytest-mock>=3.12.0",     # NEW
    "factory-boy>=3.3.0",      # NEW
]
```

### 1B. Configure Pytest Markers

**File:** `backend/pyproject.toml`

```toml
[tool.pytest.ini_options]
testpaths = ["tests"]
markers = [
    "unit: Pure unit tests (no DB, no Redis, no HTTP)",
    "integration: Tests that need a running database",
    "regression: Tests for previously fixed bugs",
    "slow: Tests that take more than 5 seconds",
]
addopts = "-v --strict-markers"
```

### 1C. Create Conftest for Unit Tests (no DB)

**Create:** `backend/tests/unit/conftest.py`

```python
"""Fixtures for pure unit tests. No database, no external services."""
import pytest
from unittest.mock import MagicMock, create_autospec
from sqlalchemy.orm import Session


@pytest.fixture
def mock_db():
    """A MagicMock Session for unit tests."""
    return create_autospec(Session, instance=True)


@pytest.fixture
def mock_query(mock_db):
    """Pre-configured mock query chain."""
    query = MagicMock()
    mock_db.query.return_value = query
    query.filter.return_value = query
    query.first.return_value = None
    query.all.return_value = []
    return query
```

### 1D. Create Test Data Factories

**Create:** `backend/tests/factories.py`

```python
"""Test data factories using factory_boy for consistent test data creation."""
import factory
from models.user import User, UserRole
from models.bus import Bus
from models.seat import Seat
from models.trip import Trip
from models.ticket import Ticket
from models.client import Client


class UserFactory(factory.Factory):
    class Meta:
        model = User

    id = factory.Sequence(lambda n: n + 1)
    username = factory.LazyAttribute(lambda o: f"user_{o.id}")
    email = factory.LazyAttribute(lambda o: f"user_{o.id}@test.com")
    hashed_password = "hashed_fake"
    role = UserRole.USER
    is_active = True
    is_admin = False
    firstname = factory.Faker("first_name")
    lastname = factory.Faker("last_name")


class BusFactory(factory.Factory):
    class Meta:
        model = Bus

    id = factory.Sequence(lambda n: n + 1)
    license_plate = factory.Sequence(lambda n: f"ABC{n:03d}")
    capacity = 40
    model = "Test Bus"


class SeatFactory(factory.Factory):
    class Meta:
        model = Seat

    id = factory.Sequence(lambda n: n + 1)
    seat_number = factory.Sequence(lambda n: n + 1)
    bus_id = 1
    deck = "FIRST"
    row = 1
    column = 1


class ClientFactory(factory.Factory):
    class Meta:
        model = Client

    id = factory.Sequence(lambda n: n + 1)
    firstname = factory.Faker("first_name")
    lastname = factory.Faker("last_name")
    phone = "70012345"


class TicketFactory(factory.Factory):
    class Meta:
        model = Ticket

    id = factory.Sequence(lambda n: n + 1)
    state = "pending"
    seat_id = 1
    client_id = 1
    trip_id = 1
    secretary_id = 1
    price = 50.0
    payment_method = "cash"
```

### 1E. Reclassify Existing Tests

| Current File | Current Marker | Correct Marker | Reason |
|---|---|---|---|
| `test_state_machines.py` | none | `@pytest.mark.unit` | Pure logic, no DB |
| `test_auth.py` | `@pytest.mark.unit` | `@pytest.mark.integration` | Uses TestClient + DB |
| `test_ticket.py` | `@pytest.mark.unit` | `@pytest.mark.integration` | Uses TestClient + DB |
| `test_user_model.py` | verify | probably `integration` | Likely uses DB |
| `test_person_model.py` | verify | `@pytest.mark.integration` | Already in integration/ |

---

## Phase 2: DI in Backend Services

### 2A. Refactoring Pattern

```python
# BEFORE (Strong Coupling)
class TicketService:
    def __init__(self, db: Session):
        self.db = db
        self.repo = TicketRepository(db)

# AFTER (Dependency Injection)
class TicketService:
    def __init__(
        self,
        db: Session,
        repo: TicketRepository | None = None,
        lock_service: SeatLockService | None = None,
    ):
        self.db = db
        self.repo = repo or TicketRepository(db)
        self.lock_service = lock_service or SeatLockService()
```

**Why `Optional` with `None` default and not Protocol-based DI?**
Routes use `Depends(get_service)` which calls `XService(db)` — the default path works exactly the same. The `None` default is purely for test injection. Protocol-based DI (creating 12+ Protocol classes and modifying each route) is too much ceremony for a ~12 service codebase. It's not worth it at this scale.

### 2B. Priority Order

1. `ticket_service.py` — most complex, most business logic.
2. `trip_service.py` — complex state transitions.
3. `package_service.py` — state transitions.
4. `bus_service.py` — **also needs BusRepository creation** (currently does `self.db.query()` directly).
5. `auth_service.py` — authentication logic.
6. Rest: `route_service.py`, `person_service.py`, `office_service.py`, `cash_register_service.py`, `seat_lock_service.py`, `report_service.py`, `user_management_service.py`.

### 2C. Pure Unit Test Example

```python
"""tests/unit/services/test_ticket_service.py"""
import pytest
from unittest.mock import create_autospec
from sqlalchemy.orm import Session

from services.ticket_service import TicketService
from repositories.ticket_repository import TicketRepository
from core.exceptions import ConflictException
from tests.factories import TicketFactory


class TestTicketServiceCancel:
    """Test TicketService.cancel_ticket in isolation."""

    def test_cancel_pending_ticket_succeeds(self, mock_db):
        # Arrange
        mock_repo = create_autospec(TicketRepository, instance=True)
        ticket = TicketFactory(state="pending")
        mock_repo.get_by_id_or_raise.return_value = ticket
        service = TicketService(mock_db, repo=mock_repo)

        # Act
        result = service.cancel_ticket(ticket.id)

        # Assert
        assert result.state == "cancelled"
        mock_repo.log_state_change.assert_called_once()
        mock_db.commit.assert_called()

    def test_cancel_already_cancelled_skips_transition(self, mock_db):
        # Arrange
        mock_repo = create_autospec(TicketRepository, instance=True)
        ticket = TicketFactory(state="cancelled")
        mock_repo.get_by_id_or_raise.return_value = ticket
        service = TicketService(mock_db, repo=mock_repo)

        # Act
        result = service.cancel_ticket(ticket.id)

        # Assert
        assert result.state == "cancelled"
        mock_repo.log_state_change.assert_not_called()
        mock_db.commit.assert_not_called()
```

**Naming convention:** `test_[method]_[scenario]_[expected]` or group by class `TestXServiceMethod`.

---

## Phase 3: Frontend Infrastructure

### 3A. Install MSW

```bash
cd frontend-react && npm install -D msw@^2.7.0
```

### 3B. Create MSW Handlers

**Create:** `frontend-react/src/test/mocks/handlers.ts`

```typescript
import { http, HttpResponse } from 'msw'

const API = 'http://localhost:8000/api/v1'

export const clientHandlers = [
  http.get(`${API}/clients/search`, ({ request }) => {
    const url = new URL(request.url)
    const term = url.searchParams.get('term')
    return HttpResponse.json({
      clients: term ? [
        { id: 1, firstname: 'Juan', lastname: 'Perez', document_id: '123', phone: '7123' }
      ] : []
    })
  }),
]

export const ticketHandlers = [
  http.get(`${API}/tickets`, () => {
    return HttpResponse.json({ tickets: [] })
  }),
]

export const handlers = [
  ...clientHandlers,
  ...ticketHandlers,
]
```

### 3C. Create MSW Server

**Create:** `frontend-react/src/test/mocks/server.ts`

```typescript
import { setupServer } from 'msw/node'
import { handlers } from './handlers'

export const server = setupServer(...handlers)
```

### 3D. Migrate setup.ts

**Modify:** `frontend-react/src/test/setup.ts`

```typescript
import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterAll, afterEach, beforeAll } from 'vitest'
import { server } from './mocks/server'

// MSW lifecycle
beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }))
afterEach(() => {
  cleanup()
  server.resetHandlers()
})
afterAll(() => server.close())

// REMOVED: vi.mock('@/lib/api') — replaced by MSW
```

**Migration path:** Existing tests with `vi.mock` continue to work during migration. They are gradually migrated to MSW.

### 3E. Create renderWithProviders

**Create:** `frontend-react/src/test/test-utils.tsx`

```tsx
import React, { PropsWithChildren } from 'react'
import { render, RenderOptions } from '@testing-library/react'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import { MemoryRouter } from 'react-router'
// Import reducers
import authReducer from '@/store/auth.slice'
import appReducer from '@/store/app.slice'

interface ExtendedRenderOptions extends Omit<RenderOptions, 'queries'> {
  preloadedState?: Record<string, unknown>
  store?: ReturnType<typeof configureStore>
  route?: string
}

export function renderWithProviders(
  ui: React.ReactElement,
  {
    preloadedState = {},
    store = configureStore({
      reducer: { auth: authReducer, app: appReducer },
      preloadedState,
    }),
    route = '/',
    ...renderOptions
  }: ExtendedRenderOptions = {}
) {
  function Wrapper({ children }: PropsWithChildren) {
    return (
      <Provider store={store}>
        <MemoryRouter initialEntries={[route]}>
          {children}
        </MemoryRouter>
      </Provider>
    )
  }
  return { store, ...render(ui, { wrapper: Wrapper, ...renderOptions }) }
}

export * from '@testing-library/react'
export { default as userEvent } from '@testing-library/user-event'
```

### 3F. Coverage Thresholds

**Modify:** `frontend-react/vitest.config.ts`

```typescript
coverage: {
  reporter: ['text', 'json', 'html'],
  exclude: ['node_modules/', 'src/test/', 'src/components/ui/'],
  thresholds: {
    lines: 20,
    branches: 20,
    functions: 20,
    statements: 20,
  },
},
```

### 3G. Pattern for Hook Testing

```tsx
import { renderHook, waitFor } from '@testing-library/react'
import { useTripDetailPage } from '@/hooks/use-trip-detail-page'

const wrapper = ({ children }) => (
  <Provider store={store}><MemoryRouter>{children}</MemoryRouter></Provider>
)

it('fetches trip data on mount', async () => {
  const { result } = renderHook(() => useTripDetailPage('1'), { wrapper })
  await waitFor(() => {
    expect(result.current.trip).toBeDefined()
  })
})
```

### 3H. Migrate QuickSearch.test.tsx as Example

Replace individual `vi.mock('@/services/...')` with MSW handlers using `server.use()` for per-test overrides.

---

## Phase 4: Institutionalization

### 4A. Update Skills

**`.agents/skills/unit-testing/SKILL.md`:**
- Add "Test Categories" section (unit vs integration vs regression).
- Backend: DI pattern, factories, `create_autospec`, `pytest -m unit`.
- Frontend: MSW, `renderWithProviders`, `renderHook`, `server.use()`.
- Naming convention: `test_[method]_[scenario]_[expected]`.

**`.agents/skills/backend-dev/SKILL.md`:**
- Add section 2.6 "Dependency Injection for Testability".

**`.agents/skills/frontend-dev/SKILL.md`:**
- Add section 7 "Testing Conventions" (MSW, `renderWithProviders`, `userEvent`).

### 4B. Create Documentation

- `docs/guides/testing.md` — Full testing guide (philosophy, backend, frontend, commands).
- `docs/lessons/003-unit-vs-integration-tests.md` — Lesson learned.
- Update `CLAUDE.md` with "Testing Standards" section.
- Update `docs/INDEX.md` with reference to testing guide.

---

## Phase 5: CI/CD (Future)

Documented for future implementation:

- GitHub Actions `.github/workflows/test.yml`:
  - `backend-unit` job: `pytest -m unit` (no services, fast).
  - `backend-integration` job: `pytest -m integration` (with MySQL service container).
  - `frontend-unit` job: `vitest run --coverage`.
- Coverage gates: fail PR if coverage drops below threshold.

---

## Critical Files

```
backend/pyproject.toml                     # Dependencies + pytest config
backend/tests/conftest.py                  # Keep for integration
backend/tests/unit/conftest.py             # NEW: fixtures without DB
backend/tests/factories.py                 # NEW: factory-boy
backend/services/ticket_service.py         # DI Template
frontend-react/package.json               # MSW dependency
frontend-react/src/test/setup.ts           # Migrate to MSW
frontend-react/src/test/mocks/handlers.ts  # NEW
frontend-react/src/test/mocks/server.ts    # NEW
frontend-react/src/test/test-utils.tsx     # NEW: renderWithProviders
frontend-react/vitest.config.ts            # Coverage thresholds
```

## Execution Order

| # | Task | Effort | Dependencies |
|---|-------|----------|-------------|
| 1 | Add pytest-mock, factory-boy to pyproject.toml | Small | None |
| 2 | Configure pytest markers in pyproject.toml | Small | None |
| 3 | Create `tests/unit/conftest.py` with mock fixtures | Small | None |
| 4 | Create `tests/factories.py` | Medium | #1 |
| 5 | Reclassify existing test markers | Small | #2 |
| 6 | Add DI to TicketService + write first pure unit test | Medium | #3, #4 |
| 7 | Add DI to remaining services (incremental) | Medium | #6 |
| 8 | Install MSW in frontend | Small | None |
| 9 | Create handlers + MSW server | Medium | #8 |
| 10 | Create test-utils.tsx with renderWithProviders | Medium | None |
| 11 | Migrate setup.ts to MSW | Small | #9 |
| 12 | Migrate QuickSearch.test.tsx to MSW | Medium | #9, #10, #11 |
| 13 | Add coverage thresholds to vitest.config.ts | Small | None |
| 14 | Update 3 SKILL.md | Medium | #6, #9, #10 |
| 15 | Create docs/guides/testing.md | Medium | #14 |
| 16 | Create lesson 003 | Small | None |

**Suggested PRs:** #1-5 (backend infra), #6-7 (backend DI), #8-13 (frontend infra), #14-16 (docs/skills)

## Verification

```bash
# Backend: Unit tests only (fast, no DB)
cd backend && uv run pytest -m unit -v

# Backend: Integration only (needs MySQL)
cd backend && uv run pytest -m integration -v

# Backend: Strict markers (no warnings)
cd backend && uv run pytest --strict-markers

# Frontend: All tests
cd frontend-react && npm run test:run

# Frontend: With coverage
cd frontend-react && npm run test:coverage
```

## Summary of Benefits

- **Speed:** Unit tests run 10-50x faster (no DB).
- **Isolation:** DB changes don't break business logic tests.
- **Realism:** MSW detects errors in URLs/headers that `vi.mock` ignores.
- **Consistency:** Factories eliminate 200+ line manual fixtures.
- **Quality:** Coverage thresholds prevent regressions.
- **Knowledge:** Skills and docs ensure humans and AI follow patterns.
