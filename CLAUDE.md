# CLAUDE.md

> Guidance for Claude Code when working with this repository

## Project Overview

**Trans Comarapa** - Transportation management system with layered architecture and RBAC

**Stack:**
- Backend: FastAPI + MySQL 8.0 + Redis 7 + JWT Auth
- Frontend (active): React 19 + TypeScript + Redux Toolkit + Tailwind + shadcn/ui (port `:3001`)
- Frontend (legacy): Nuxt 3 + Vue 3 (port `:3000`) - reference only, no active development
- Roles: Admin, Secretary, Driver, Assistant, Client

**Docker Services:** `db` (:3308), `redis` (:6379), `backend` (:8000), `frontend` (:3000), `frontend-react` (:3001)

## Quick Start

```bash
make setup          # Complete setup + seed DB
```

**Test Users:** `[role]1@transcomarapa.com` / `123456` (admin, secretary, client)

## Essential Commands

```bash
# Docker
make up/down/restart/status
make logs-f / logs-backend / logs-frontend / logs-db
make shell-backend / shell-frontend / shell-db

# Database
make seed / seed-minimal / clear-db

# Backend local
cd backend && uv sync && source .venv/bin/activate
python run.py       # localhost:8000
pytest -v --cov=.

# Frontend React local
cd frontend-react && npm install && npm run dev  # localhost:3001
```

## Architecture

### Data Model
```
Person (base for all user roles)
Users -> [Administrator, Secretary, Driver, Assistant, Client]
Office -> Secretary (1:N)
Buses -> Seats (1:N, with deck/row/column layout)
Routes <-> Locations (N:M via route_locations)
RouteSchedule -> Route (scheduled departures)
Trips -> Bus + Route + Driver + Assistant
Tickets -> Trip + Client + Seat + Secretary (with TicketStateHistory)
Packages -> Trip + Sender + Recipient + Secretary (with PackageStateHistory)
PackageItem -> Package (1:N, individual items in a package)
Activity -> User (audit log)
```

### Backend Request Flow
```
Route (API) -> Service (business logic) -> Repository (data access) -> Model (DB)
```
- **Routes:** Thin adapters, no business logic.
- **Services:** All business validation, orchestration, and transaction management (`db.commit()`).
- **Repositories:** Only data access/CRUD operations (`db.flush()`).
- **Models:** Only data structure, no logic/hash functions (use `core/security.py`).

### Backend Structure
```
backend/
├── models/          # SQLAlchemy entities (22 models)
├── schemas/         # Pydantic validation
├── routes/          # API endpoints (/api/v1/*)
├── services/        # Business logic (auth, trip, ticket, package, user_management)
├── repositories/    # Data access (base generic + trip, ticket, package, user, seat)
├── core/
│   ├── enums.py         # TicketState, PackageStatus, TripStatus
│   └── state_machines.py # State transition rules
└── tests/
```

### Frontend React Structure
```
frontend-react/src/
├── pages/           # Route pages (lazy-loaded)
│   ├── dashboards/  # Admin, Secretary, Driver, Assistant, Client
│   ├── trips/       # Index, Detail, New, Edit, Sheet
│   ├── packages/    # Index, Detail, New, Edit
│   ├── admin/       # Users, Buses, Routes
│   ├── clients/     # Index
│   ├── tickets/     # Confirmation
│   ├── ProfilePage.tsx
│   └── BookingsPage.tsx
├── components/      # ui/, forms/, seats/, tickets/, trips/, clients/,
│                    # packages/, admin/, dashboard/, common/, layout/
├── services/        # API modules ([entity].service.ts) - 18 services
├── store/           # Redux slices ([entity].slice.ts) - 13 slices
├── hooks/           # Stateful logic ONLY (use-auth, use-trip-detail-page, use-keyboard-shortcuts, use-toast)
├── layouts/         # Default, Login, Print, Auth
├── router/          # Routes + guards (ProtectedRoute, RoleGuard, RedirectIfAuthenticated)
├── lib/             # Stateless utils (apiFetch, formatters, package-status, package-utils)
└── types/           # TypeScript interfaces
```

## Development Patterns

### Authentication
- Login: `POST /api/v1/auth/login` -> JWT tokens
- React: `store/auth.slice.ts` + `hooks/use-auth.ts`
- Auto token refresh on 401

### Naming Conventions

**Backend:**
| Type | Pattern | Example |
|------|---------|---------|
| Model | `class [Entity](Base)` | `class Ticket(Base)` |
| Schema | `[Entity]Create/Update` | `TicketCreate` |
| Route | `routes/[entity].py` | `routes/ticket.py` |
| Service | `services/[entity]_service.py` | `services/ticket_service.py` |
| Repository | `repositories/[entity]_repository.py` | `repositories/ticket_repository.py` |

**Frontend React:**
| Type | Pattern | Example |
|------|---------|---------|
| Service | `[entity].service.ts` | `ticket.service.ts` |
| Store | `[entity].slice.ts` | `ticket.slice.ts` |
| Page | `[Entity]Page.tsx` | `TripDetailPage.tsx` |
| Hook | `use-[name].ts` | `use-trip-details.ts` |
| Component | `[PascalCase].tsx` | `BusSeatGrid.tsx` |

### Code Standards
- **File size limits** per file type are defined in each skill (`backend-dev/SKILL.md`, `frontend-dev/SKILL.md`). Split files that exceed their limit.
- **Backend:** SQLAlchemy 2.0+, all models inherit `Base`, layered architecture
- **React:** TypeScript, functional components, Redux Toolkit, Tailwind + shadcn/ui, sonner for toasts
- **API:** REST conventions, all endpoints `/api/v1/` prefix
- **API utility:** React uses `apiFetch` from `lib/api.ts`

## Adding New Features

### Backend
1. Model: `backend/models/[entity].py` (inherit `Base`)
2. Schema: `backend/schemas/[entity].py` (`EntityCreate`, `EntityUpdate`, `Entity`)
3. Repository: `backend/repositories/[entity]_repository.py`
4. Service: `backend/services/[entity]_service.py`
5. Route: `backend/routes/[entity].py` (APIRouter)
6. Migration: `cd backend && alembic revision --autogenerate -m "Add [entity]" && alembic upgrade head`

### Frontend React
1. Service: `frontend-react/src/services/[entity].service.ts`
2. Store: `frontend-react/src/store/[entity].slice.ts` (createSlice + createAsyncThunk)
3. Page: `frontend-react/src/pages/[section]/[Entity]Page.tsx`
4. Route: Add to `frontend-react/src/router/index.tsx`

## Key Resources

- **API Docs:** http://localhost:8000/docs (Swagger UI)
- **React App:** http://localhost:3001
- **Database:** MySQL at `:3308` (root/Passw0rd!)
- **Implementation Plans:** `docs/implementation-plans/`
