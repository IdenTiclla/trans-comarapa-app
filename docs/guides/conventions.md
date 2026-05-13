# Conventions — Naming & Adding Features

> Single source of truth for file layout, naming, and the steps to add a new entity.

## Backend

### Naming

| Type | Pattern | Example |
|------|---------|---------|
| Model | `class [Entity](Base)` in `models/[entity].py` | `class Ticket(Base)` |
| Schema | `[Entity]Create` / `[Entity]Update` / `[Entity]` in `schemas/[entity].py` | `TicketCreate` |
| Repository | `repositories/[entity]_repository.py` | `ticket_repository.py` |
| Service | `services/[entity]_service.py` | `ticket_service.py` |
| Route | `routes/[entity].py` (APIRouter) | `routes/ticket.py` |

### HTTP methods

- **PATCH** — partial updates (status change, single-field updates).
- **PUT** — full resource replacement.
- **POST** — creation and action endpoints (`/dispatch`, `/cancel`).

> Some legacy endpoints use PUT for partial updates. New endpoints must follow PATCH.

### Steps to add a new entity

1. **Model** — `models/[entity].py`, inherit `Base`.
2. **Schema** — `schemas/[entity].py` (`Create`, `Update`, response).
3. **Repository** — `repositories/[entity]_repository.py` (data access only, `db.flush()`).
4. **Service** — `services/[entity]_service.py` (validation, orchestration, `db.commit()`).
5. **Route** — `routes/[entity].py` (thin adapter, no business logic).
6. **Migration** — `cd backend && alembic revision --autogenerate -m "Add [entity]" && alembic upgrade head`.

See [architecture/overview.md](../architecture/overview.md) for layer boundaries.

## Frontend (React)

### Naming

| Type | Pattern | Example |
|------|---------|---------|
| Service | `services/[entity].service.ts` | `ticket.service.ts` |
| Store | `store/[entity].slice.ts` (createSlice + createAsyncThunk) | `ticket.slice.ts` |
| Page | `pages/[section]/[Entity]Page.tsx` | `TripDetailPage.tsx` |
| Hook | `hooks/use-[name].ts` | `use-trip-details.ts` |
| Component | `components/.../[PascalCase].tsx` | `BusSeatGrid.tsx` |

### Steps to add a new entity

1. **Service** — `services/[entity].service.ts` (uses `apiFetch` from `lib/api.ts`).
2. **Store** — `store/[entity].slice.ts`.
3. **Page** — `pages/[section]/[Entity]Page.tsx`.
4. **Route** — register in `router/index.tsx`.

UI rules (file size, a11y, typing) are enforced by ESLint — see [ui-conventions.md](ui-conventions.md).
