# Contributing - Backend

## Setup

```bash
cd backend
uv sync                        # install dependencies
source .venv/bin/activate      # activate venv
cp .env.example .env           # configure DB credentials
alembic upgrade head           # run migrations
python db/seed.py              # seed test data
python run.py                  # start server at http://localhost:8000
```

## Architecture

The backend follows a **Service-Repository** layered architecture:

```
Route (thin adapter) → Service (business logic) → Repository (data access) → Model (ORM)
```

### Directory Structure

```
backend/
├── core/               # Config, enums, exceptions, state machines, Redis, logging
├── models/             # SQLAlchemy ORM models (22 entities, all inherit Base)
├── schemas/            # Pydantic v2 request/response schemas
├── repositories/       # Data access (BaseRepository + specific repos)
├── services/           # Business logic (auth, trip, ticket, package, user_mgmt, stats)
├── routes/             # FastAPI routers (18 modules, /api/v1/* prefix)
├── db/                 # Database session config, seed scripts
├── alembic/            # Migration versions
└── tests/              # Pytest tests
```

### Key Rules

1. **Routes are thin** — receive request, call service, return response. No business logic.
2. **Services own business logic** — validation, state transitions, orchestration. Services call `db.commit()`.
3. **Repositories own data access** — CRUD, queries, joins. Repositories only `db.flush()`.
4. **Use domain exceptions** — `NotFoundException`, `ValidationException`, `ConflictException`, `InvalidStateTransitionException` from `core/exceptions.py`. Never raise `HTTPException` in services.
5. **Use enums** — `TicketState`, `PackageStatus`, `TripStatus`, `PaymentMethod` from `core/enums.py`. No magic strings.
6. **State transitions** — Always use `validate_transition()` from `core/state_machines.py`.
7. **Type hints mandatory** — Every function parameter and return value.
8. **Logging** — Use `logging.getLogger(__name__)`, never `print()`.

## Adding a New Feature

1. **Model:** `models/[entity].py` (inherit `Base`)
2. **Schema:** `schemas/[entity].py` (`EntityCreate`, `EntityUpdate`, `EntityResponse`)
3. **Repository:** `repositories/[entity]_repository.py` (inherit `BaseRepository`)
4. **Service:** `services/[entity]_service.py`
5. **Route:** `routes/[entity].py` (APIRouter with `Depends` for service injection)
6. **Migration:**
   ```bash
   alembic revision --autogenerate -m "Add [entity]"
   alembic upgrade head
   ```

## Testing

```bash
pytest -v --cov=.          # all tests with coverage
pytest tests/unit/         # unit tests only
pytest tests/integration/  # integration tests only
```

## Code Standards

- PEP 8 + Ruff linter
- Descriptive naming: `get_active_tickets_by_trip_id`, not `get_tickets`
- Early returns to flatten nested conditions
- Dependency injection via FastAPI `Depends()`
