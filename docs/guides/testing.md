# Testing Guide

This guide documents the testing conventions and patterns for the Trans Comarapa project.

## Philosophy

We follow the **Testing Pyramid**:
1. **Unit Tests** (fast, isolated, no DB) - The majority of tests
2. **Integration Tests** (slower, real DB) - For testing DB interactions and API endpoints
3. **E2E Tests** (slowest, full system) - Future consideration

## Backend Testing (Python/FastAPI)

### Test Categories

| Marker | Description | DB Required | Command |
|--------|-------------|-------------|---------|
| `@pytest.mark.unit` | Pure unit tests | No | `pytest -m unit` |
| `@pytest.mark.integration` | Integration tests | Yes | `pytest -m integration` |
| `@pytest.mark.regression` | Bug regression tests | Varies | `pytest -m regression` |
| `@pytest.mark.slow` | Slow tests (>5s) | Varies | `pytest -m slow` |

### Directory Structure

```
backend/tests/
├── conftest.py              # Integration fixtures (db_session, client, tokens)
├── factories.py             # factory-boy test data factories
├── unit/
│   ├── conftest.py          # Unit fixtures (mock_db, mock_query)
│   ├── services/            # Service unit tests
│   │   └── test_ticket_service.py
│   └── test_state_machines.py
├── integration/
│   └── test_person_model.py
└── regression/
    └── test_auth_regression.py
```

### Dependency Injection for Testability

Services accept optional repository parameters:

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

### Writing Unit Tests

Use `create_autospec` for mocks and factories for test data:

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
```

### Test Data Factories

Use factory-boy for consistent test data:

```python
from tests.factories import TicketFactory, UserFactory, ClientFactory

# Create with defaults
ticket = TicketFactory(state="pending")

# Override specific fields
user = UserFactory(role=UserRole.ADMIN, email="admin@test.com")

# Create multiple
tickets = TicketFactory.build_batch(5, state="confirmed")
```

### Commands

```bash
# Run only unit tests (fast, no DB needed)
cd backend && uv run pytest -m unit -v

# Run only integration tests (needs MySQL)
cd backend && uv run pytest -m integration -v

# Run all tests with strict markers
cd backend && uv run pytest --strict-markers

# Run with coverage
cd backend && uv run pytest -v --cov=. --cov-report=html

# Run specific test file
cd backend && uv run pytest tests/unit/services/test_ticket_service.py -v
```

## Frontend Testing (React/TypeScript)

### MSW Setup

MSW mocks API calls at the network level:

```typescript
// src/test/mocks/handlers.ts
import { http, HttpResponse } from 'msw'

const API = 'http://localhost:8000/api/v1'

export const clientHandlers = [
  http.get(`${API}/clients/search`, ({ request }) => {
    const url = new URL(request.url)
    const term = url.searchParams.get('q')
    return HttpResponse.json({
      clients: term ? [{ id: 1, firstname: 'Juan' }] : []
    })
  }),
]
```

### Per-test Handler Overrides

```typescript
import { server } from '@/test/mocks/server'
import { http, HttpResponse } from 'msw'

it('handles error', async () => {
  server.use(
    http.get('http://localhost:8000/api/v1/clients/search', () => {
      return new HttpResponse(null, { status: 500 })
    })
  )
  // ... test code
})
```

### renderWithProviders Utility

Wrap components with Redux + Router:

```tsx
import { renderWithProviders, screen, userEvent } from '@/test/test-utils'

it('renders and interacts', async () => {
  const user = userEvent.setup()
  const { store } = renderWithProviders(<MyComponent />, {
    preloadedState: { auth: { user: { id: 1 } } },
    route: '/trips/1',
  })

  await user.click(screen.getByText('Submit'))
})
```

### Testing Hooks

```tsx
import { renderHook, waitFor } from '@testing-library/react'
import { wrapper } from '@/test/test-utils'

it('fetches data on mount', async () => {
  const { result } = renderHook(() => useTripDetailPage('1'), { wrapper })
  await waitFor(() => expect(result.current.trip).toBeDefined())
})
```

### Commands

```bash
# Run all tests
cd frontend-react && npm run test:run

# Run with coverage
cd frontend-react && npm run test:coverage

# Run specific test
cd frontend-react && npm run test -- QuickSearch.test.tsx

# Watch mode
cd frontend-react && npm run test
```

## Naming Conventions

### Test Files
- `test_[module].py` or `[Component].test.tsx`
- Group related tests in classes: `TestTicketServiceCancel`

### Test Functions
- Pattern: `test_[method]_[scenario]_[expected]`
- Examples:
  - `test_cancel_pending_ticket_succeeds`
  - `test_cancel_already_cancelled_noop`
  - `test_create_ticket_without_cash_register_fails`

## Coverage Thresholds

Current minimum thresholds:
- Lines: 20%
- Branches: 20%
- Functions: 20%
- Statements: 20%

These are baseline thresholds. Increase them as test coverage improves.

## Best Practices

1. **AAA Pattern**: Arrange, Act, Assert
2. **One assertion per test** (or logically related assertions)
3. **Test edge cases**: empty inputs, null values, boundary conditions
4. **Don't test implementation details**: test behavior, not internals
5. **Keep tests independent**: no shared mutable state between tests
6. **Use descriptive test names**: they should read like documentation
