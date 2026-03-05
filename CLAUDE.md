# CLAUDE.md

> Guidance for Claude Code when working with this repository

## Project Overview

**Trans Comarapa** - Transportation management system with layered architecture and RBAC

**Stack:**
- Backend: FastAPI + MySQL 8.0 + Redis 7 + JWT Auth
- Frontend (legacy): Nuxt 3 + Vue 3 + Tailwind + Pinia (port `:3000`)
- Frontend (active): React 19 + TypeScript + Redux Toolkit + Tailwind + shadcn/ui (port `:3001`)
- Roles: Admin, Secretary, Driver, Assistant, Client

**Services (Docker Compose):**
- `db` (MySQL) -> `:3308`
- `redis` -> `:6379`
- `backend` (FastAPI) -> `:8000`
- `frontend` (Nuxt) -> `:3000`
- `frontend-react` -> `:3001`

---

## Quick Start

```bash
make setup          # Complete setup + seed DB
```

**Test Users:** `[role]1@transcomarapa.com` / `123456` (admin, secretary, client)

---

## Essential Commands

```bash
# Docker
make up/down/restart/status
make logs-f                    # All services
make logs-backend/frontend/db  # Specific service
make shell-backend/frontend/db

# Database
make seed           # Development data
make seed-minimal   # Fast minimal seed
make clear-db       # Delete all data

# Backend local
cd backend && uv sync && source .venv/bin/activate
python run.py       # localhost:8000
pytest -v --cov=.

# Frontend React local
cd frontend-react && npm install
npm run dev         # localhost:3001

# Frontend Nuxt local (legacy)
cd frontend && npm install
npm run dev         # localhost:3000
```

---

## Architecture

### Data Model
```
Users -> [Admin, Secretary, Driver, Assistant, Client]
Buses -> Seats (1:N)
Routes <-> Locations (N:M)
Trips -> Bus + Route + Driver + Assistant
Tickets -> Trip + Client + Seat + Secretary
Packages -> Trip + Sender + Recipient + Secretary
```

### Backend Request Flow
```
Route (API) -> Service (business logic) -> Repository (data access) -> Model (DB)
```

### Backend Structure
```
backend/
├── models/          # SQLAlchemy entities
├── schemas/         # Pydantic validation
├── routes/          # API endpoints (/api/v1/*)
├── services/        # Business logic layer
├── repositories/    # Data access layer
├── core/
│   ├── enums.py         # TicketState, PackageStatus, TripStatus
│   └── state_machines.py # State transition rules
└── tests/
```

### Frontend React Structure (active development)
```
frontend-react/src/
├── pages/           # Route pages (lazy-loaded)
│   ├── dashboards/  # 5 role-based dashboards
│   ├── trips/       # Index, Detail, New, Edit, Sheet
│   ├── packages/    # Index, Detail, New, Edit
│   ├── admin/       # Users, Buses, Routes
│   ├── clients/     # ClientsIndex
│   └── tickets/     # Confirmation
├── components/
│   ├── ui/          # shadcn/ui base components
│   ├── seats/       # BusSeatGrid, BusSeatMapPrint, SeatContextMenu, SelectedSeatsPanel
│   ├── tickets/     # TicketSaleModal, TicketModal, TicketDisplay
│   ├── trips/       # TripCountdown, TripPackagesSection, TripCardList
│   ├── clients/     # ClientCard, ClientModal, ClientSelector
│   ├── forms/       # FormInput, FormSelect, FormSearchSelect, FormDatePicker
│   └── common/      # ConfirmDialog, EmptyState, SkeletonLoader, NotificationModal
├── services/        # API modules ([entity].service.ts)
├── store/           # Redux slices ([entity].slice.ts)
├── hooks/           # use-auth, use-trip-details, use-client-search, use-toast
├── layouts/         # Default, Login, Print, Auth
├── router/          # Routes + guards (ProtectedRoute, RoleGuard)
├── lib/             # api.ts (apiFetch), utils, constants
└── types/           # TypeScript interfaces
```

### Frontend Nuxt Structure (legacy, reference only)
```
frontend/
├── pages/           # Role-based dashboards
├── components/      # Vue components
├── stores/          # Pinia stores
├── services/        # API modules
└── composables/     # useClientSearch, useTripDetails, useFormValidation
```

---

## Development Patterns

### Authentication
- Login: `POST /api/v1/auth/login` -> JWT tokens
- React: `store/auth.slice.ts` + `hooks/use-auth.ts`
- Nuxt: `stores/auth.js`
- Auto token refresh on 401

### Naming Conventions

**Backend:**
| Type | Pattern | Example |
|------|---------|---------|
| Model | `class [Entity](Base)` | `class Ticket(Base)` |
| Schema | `[Entity]Create/Update` | `TicketCreate` |
| Route | `routes/[entity].py` | `routes/ticket.py` |
| Service | `services/[entity]_service.py` | `services/ticket_service.py` |

**Frontend React:**
| Type | Pattern | Example |
|------|---------|---------|
| Service | `[entity].service.ts` | `ticket.service.ts` |
| Store | `[entity].slice.ts` | `ticket.slice.ts` |
| Page | `[Entity]Page.tsx` | `TripDetailPage.tsx` |
| Hook | `use-[name].ts` | `use-trip-details.ts` |

**Frontend Nuxt (legacy):**
| Type | Pattern | Example |
|------|---------|---------|
| Service | `[entity]Service.js` | `ticketService.js` |
| Store | `[entity]Store.js` | `ticketStore.js` |

### Code Standards
- **Backend:** SQLAlchemy 2.0+, all models inherit `Base`, layered architecture (routes -> services -> repositories)
- **React:** TypeScript, functional components, Redux Toolkit, Tailwind + shadcn/ui, sonner for toasts
- **Nuxt:** Vue 3 Composition API, Tailwind CSS, Pinia
- **API:** REST conventions, all endpoints `/api/v1/` prefix
- **API utility:** React uses `apiFetch` from `lib/api.ts`, Nuxt uses `$fetch` with `useRuntimeConfig`

---

## Adding New Features

### Backend
1. Model: `backend/models/[entity].py` (inherit `Base`)
2. Schema: `backend/schemas/[entity].py` (Pydantic: `EntityCreate`, `EntityUpdate`, `Entity`)
3. Repository: `backend/repositories/[entity]_repository.py`
4. Service: `backend/services/[entity]_service.py`
5. Route: `backend/routes/[entity].py` (APIRouter)
6. Migration: `cd backend && alembic revision --autogenerate -m "Add [entity]" && alembic upgrade head`

### Frontend React
1. Service: `frontend-react/src/services/[entity].service.ts`
2. Store: `frontend-react/src/store/[entity].slice.ts` (createSlice + createAsyncThunk)
3. Page: `frontend-react/src/pages/[section]/[Entity]Page.tsx`
4. Route: Add to `frontend-react/src/router/index.tsx`

---

## Environment

### Docker (Auto-configured)
`make setup` creates all configs.

### Local Development

**Backend `.env`:**
```env
DATABASE_URL=mysql+pymysql://root:password@localhost:3308/trans_comarapa
SECRET_KEY=your-secret-key
REDIS_URL=redis://localhost:6379
DEBUG=True
```

**Frontend Nuxt `.env`:**
```env
NUXT_PUBLIC_API_BASE_URL=http://localhost:8000/api/v1
```

**Frontend React:** uses `VITE_API_BASE_URL` (defaults to `http://localhost:8000/api/v1`)

---

## Troubleshooting

```bash
make status && make logs-f     # Services won't start
docker-compose ps              # DB connection (wait for health check)
lsof -i :3000                  # Port conflicts
make clean && make setup       # Fresh restart
```

---

## Key Resources

- **API Docs:** http://localhost:8000/docs (Swagger UI)
- **React App:** http://localhost:3001
- **Nuxt App:** http://localhost:3000 (legacy)
- **Database:** MySQL at `:3308` (root/Passw0rd!)
- **Implementation Plans:** `docs/implementation-plans/`
