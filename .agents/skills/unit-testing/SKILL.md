---
name: Unit Testing Enforcement
description: >
  MANDATORY skill for ALL code changes. Automatically trigger this skill AFTER implementing 
  any new feature, modifying existing code, refactoring, or fixing bugs - even if the user 
  doesn't explicitly ask for tests. This skill MUST be used proactively whenever you write, 
  modify, or refactor ANY code in backend/ or frontend-react/ directories. Do NOT skip this 
  skill. It runs automatically after code changes to ensure test coverage. Keywords that 
  MUST trigger this skill: implement, create, add, modify, update, refactor, fix, bug, 
  feature, component, service, function, logic.
---

# Unit Testing & Coverage Conventions

**CRITICAL: This skill is MANDATORY and must be triggered AUTOMATICALLY after any code implementation.**

You are NOT done with a task until you have written and verified unit tests. This is non-negotiable.

## 1. AUTOMATIC Trigger Conditions (NO EXCEPTIONS)

**This skill MUST activate automatically when:**
- You just implemented a new feature, component, or function
- You modified existing code logic
- You refactored code
- You fixed a bug
- You created a new file with logic (not just config/static files)
- The user asked you to implement, add, create, modify, update, refactor, or fix something

**DO NOT wait for the user to ask for tests. Generate them proactively.**

## 2. Core Principles
- **Test-First or Test-Immediately:** Write tests alongside or immediately after implementing the logic.
- **Fail-Fast:** A test for a bug MUST fail before the fix is applied, and MUST pass after.
- **Independence:** Unit tests must be completely isolated. Mock external dependencies (DB, Redis, external APIs).
- **Maintenance:** Refactor tests alongside the code. A broken test due to a signature change must be updated.

## 3. Test Categories

### Backend Test Markers
Use pytest markers to categorize tests:

| Marker | Description | Runs DB? | Command |
|--------|-------------|----------|---------|
| `@pytest.mark.unit` | Pure unit tests (no DB, no Redis, no HTTP) | No | `pytest -m unit` |
| `@pytest.mark.integration` | Tests that need a running database | Yes | `pytest -m integration` |
| `@pytest.mark.regression` | Tests for previously fixed bugs | Varies | `pytest -m regression` |
| `@pytest.mark.slow` | Tests that take more than 5 seconds | Varies | `pytest -m slow` |

**IMPORTANT:** Tests in `tests/unit/` that use `db_session`, `client`, or `TestClient` are NOT unit tests - they should be marked as `@pytest.mark.integration`.

## 4. Backend Testing (FastAPI & Python)

### 4.1 Directory Structure
- `backend/tests/unit/` - Pure unit tests (no database)
- `backend/tests/unit/conftest.py` - Mock fixtures (`mock_db`, `mock_query`)
- `backend/tests/unit/services/` - Service unit tests
- `backend/tests/integration/` - Integration tests (require database)
- `backend/tests/factories.py` - Test data factories using factory-boy
- `backend/tests/conftest.py` - Integration test fixtures (database, client)

### 4.2 Dependency Injection for Testability
Services MUST accept optional repository parameters for mocking:

```python
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

### 4.3 Writing Pure Unit Tests
Use `create_autospec` for repository mocks and factories for test data:

```python
import pytest
from unittest.mock import create_autospec
from services.ticket_service import TicketService
from repositories.ticket_repository import TicketRepository
from tests.factories import TicketFactory

@pytest.mark.unit
class TestTicketServiceCancel:
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
```

### 4.4 Test Data Factories
Use factory-boy for consistent test data creation:

```python
from tests.factories import TicketFactory, UserFactory, ClientFactory

# Create a ticket with defaults
ticket = TicketFactory(state="pending", price=100.0)

# Create a user with custom role
user = UserFactory(role=UserRole.ADMIN)
```

### 4.5 Naming Convention
Use `test_[method]_[scenario]_[expected]` or group by class `TestXServiceMethod`:

```python
# Option 1: Descriptive function names
def test_cancel_ticket_pending_succeeds():
    ...

def test_cancel_ticket_already_cancelled_noop():
    ...

# Option 2: Class-based grouping
class TestTicketServiceCancel:
    def test_pending_succeeds(self):
        ...
    def test_already_cancelled_noop(self):
        ...
```

## 5. Frontend Testing (React & TypeScript)

### 5.1 MSW (Mock Service Worker)
Use MSW to mock API calls at the network level. This tests the full service→API integration:

```typescript
// src/test/mocks/handlers.ts
import { http, HttpResponse } from 'msw'

export const clientHandlers = [
  http.get('http://localhost:8000/api/v1/clients/search', ({ request }) => {
    const url = new URL(request.url)
    const term = url.searchParams.get('q')
    return HttpResponse.json({
      clients: term ? [{ id: 1, firstname: 'Juan', lastname: 'Perez' }] : []
    })
  }),
]
```

### 5.2 Per-test Handler Overrides
Use `server.use()` to override handlers for specific tests:

```typescript
import { server } from '@/test/mocks/server'
import { http, HttpResponse } from 'msw'

it('handles empty results', async () => {
  server.use(
    http.get('http://localhost:8000/api/v1/clients/search', () => {
      return HttpResponse.json({ clients: [] })
    })
  )
  // ... test code
})
```

### 5.3 renderWithProviders Utility
Use `renderWithProviders` from `@/test/test-utils` to wrap components with Redux and Router:

```tsx
import { renderWithProviders, screen, userEvent } from '@/test/test-utils'

it('renders and interacts', async () => {
  const user = userEvent.setup()
  const { store } = renderWithProviders(<MyComponent />, {
    preloadedState: { auth: { user: { id: 1 } } },
    route: '/some-path',
  })
  
  await user.click(screen.getByText('Submit'))
  expect(store.getState().auth.user).toBeDefined()
})
```

### 5.4 Testing Hooks
Use `renderHook` from `@testing-library/react` with the provider wrapper:

```tsx
import { renderHook, waitFor } from '@testing-library/react'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import { MemoryRouter } from 'react-router'

const wrapper = ({ children }) => (
  <Provider store={configureStore({ reducer: { auth: authReducer } })}>
    <MemoryRouter>{children}</MemoryRouter>
  </Provider>
)

it('fetches data on mount', async () => {
  const { result } = renderHook(() => useTripDetailPage('1'), { wrapper })
  await waitFor(() => expect(result.current.trip).toBeDefined())
})
```

## 6. Workflow when implementing changes
1. **Analyze:** Identify the logical components that will be added/changed.
2. **Implement:** Write the code.
3. **Test:** Write the unit tests covering positive cases, negative cases, and edge/error cases.
4. **Verify:** Run the test runner (`pytest` or `vitest`) and ensure there are no failures. Ensure you haven't broken existing tests.
5. **Document:** If fixing a bug, don't forget the `document-fix` skill.

## 7. MANDATORY Checklist (Execute After ANY Code Change)

After implementing or modifying code, you MUST complete this checklist before considering the task done:

- [ ] **Identify testable units:** Functions, components, hooks, services modified/created
- [ ] **Write unit tests:** At minimum, test the happy path + one edge case
- [ ] **Run tests:** Execute `pytest` (backend) or `vitest` (frontend)
- [ ] **Verify all pass:** Fix any failing tests before marking task complete
- [ ] **Report results:** Tell the user which tests were added and their status

**EXEMPTIONS (no tests needed):**
- Pure configuration files (`.json`, `.yaml`, `.env.example`)
- Static assets (images, fonts)
- Type definition files (`.d.ts`) with no logic
- Simple CSS/Tailwind class changes with no logic

## 8. Quick Reference Commands

```bash
# Backend: Run only unit tests (fast, no DB)
cd backend && uv run pytest -m unit -v

# Backend: Run only integration tests (needs MySQL)
cd backend && uv run pytest -m integration -v

# Backend: All tests with strict markers
cd backend && uv run pytest --strict-markers

# Backend: With coverage
cd backend && uv run pytest -v --cov=.

# Frontend: All tests
cd frontend-react && npm run test:run

# Frontend: With coverage
cd frontend-react && npm run test:coverage

# Frontend: Specific test file
cd frontend-react && npm run test -- QuickSearch.test.tsx
```
