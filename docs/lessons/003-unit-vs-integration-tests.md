# 003: Unit Tests vs Integration Tests - Proper Classification

**Date:** 2026-03-13  
**Severity:** Medium  
**Category:** Testing Architecture

## Problem

Tests in `backend/tests/unit/` were incorrectly marked as `@pytest.mark.unit` despite requiring a MySQL database connection. This caused:

1. **False confidence:** "Unit tests" were actually slow integration tests
2. **CI/CD confusion:** Can't run fast unit tests without database setup
3. **Poor isolation:** Changes to DB schema broke "unit" tests that shouldn't care about DB
4. **No true unit testing:** Services couldn't be tested in isolation because they hardcoded repository instantiation

### Example of the Problem

```python
# backend/tests/unit/test_ticket.py
@pytest.mark.unit  # WRONG - uses db_session, TestClient, real DB
def test_create_ticket(db_session, setup_ticket_data, admin_token, client):
    # This test needs MySQL running!
    response = client.post("/api/v1/tickets/", ...)
```

## Root Cause

1. No pytest markers were configured with `--strict-markers`
2. Services hardcoded dependencies: `self.repo = TicketRepository(db)` in `__init__`
3. No test data factories - fixtures manually created 200+ lines of DB setup
4. Frontend used `vi.mock` for services, not testing actual API integration

## Solution

### 1. Configure pytest markers

```toml
# backend/pyproject.toml
[tool.pytest.ini_options]
markers = [
    "unit: Pure unit tests (no DB, no Redis, no HTTP)",
    "integration: Tests that need a running database",
    "regression: Tests for previously fixed bugs",
    "slow: Tests that take more than 5 seconds",
]
addopts = "-v --strict-markers"
```

### 2. Add Dependency Injection to Services

```python
# BEFORE
class TicketService:
    def __init__(self, db: Session):
        self.db = db
        self.repo = TicketRepository(db)  # Can't mock this!

# AFTER
class TicketService:
    def __init__(
        self,
        db: Session,
        repo: TicketRepository | None = None,
        lock_service: SeatLockService | None = None,
    ):
        self.db = db
        self.repo = repo or TicketRepository(db)  # Injectable!
        self.lock_service = lock_service or SeatLockService()
```

### 3. Create Unit Test conftest.py

```python
# backend/tests/unit/conftest.py
@pytest.fixture
def mock_db():
    """A MagicMock Session for unit tests."""
    return create_autospec(Session, instance=True)
```

### 4. Write True Unit Tests

```python
@pytest.mark.unit
def test_cancel_ticket_succeeds(mock_db):
    mock_repo = create_autospec(TicketRepository, instance=True)
    ticket = TicketFactory(state="pending")
    mock_repo.get_by_id_or_raise.return_value = ticket
    service = TicketService(mock_db, repo=mock_repo)

    result = service.cancel_ticket(ticket.id)

    assert result.state == "cancelled"
    # No DB needed!
```

### 5. Re-classify Existing Tests

| File | Old Marker | New Marker | Reason |
|------|-----------|------------|--------|
| `test_auth.py` | `@pytest.mark.unit` | `@pytest.mark.integration` | Uses TestClient + DB |
| `test_ticket.py` | `@pytest.mark.unit` | `@pytest.mark.integration` | Uses TestClient + DB |
| `test_trip.py` | `@pytest.mark.unit` | `@pytest.mark.integration` | Uses TestClient + DB |
| `test_state_machines.py` | (none) | `@pytest.mark.unit` | Pure logic, no DB |

## Verification Commands

```bash
# Unit tests run fast, no DB needed
cd backend && uv run pytest -m unit -v

# Integration tests need MySQL
cd backend && uv run pytest -m integration -v

# Strict markers catch typos
cd backend && uv run pytest --strict-markers
```

## Impact

- **Speed:** Unit tests now run 10-50x faster (no DB I/O)
- **Isolation:** DB schema changes don't break unit tests
- **CI/CD:** Can run unit tests in CI without MySQL container
- **Confidence:** Test categories accurately reflect what they test

## Prevention

1. Always use `--strict-markers` in pytest config
2. Services MUST accept optional dependencies for testability
3. Unit tests should NEVER import `db_session`, `client`, or `TestClient`
4. When in doubt, ask: "Does this test need a database to pass?"
