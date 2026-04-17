# System Architecture - Trans Comarapa

## Tech Stack

### Backend
- **Runtime:** Python 3.12+
- **Framework:** FastAPI 0.115+
- **ORM:** SQLAlchemy 2.0+ (async-compatible, used synchronously)
- **Validation:** Pydantic v2
- **Auth:** JWT via python-jose, bcrypt password hashing, Redis token blacklist
- **Database:** MySQL 8.0
- **Migrations:** Alembic
- **Cache:** Redis 7 (token blacklist only)
- **Package manager:** uv

### Frontend - React
- **Runtime:** Node.js 18+
- **Framework:** React 19 + TypeScript
- **Build:** Vite
- **State:** Redux Toolkit (createSlice + createAsyncThunk)
- **Routing:** React Router v6 with lazy-loaded pages
- **Styling:** Tailwind CSS + shadcn/ui components
- **Notifications:** sonner (toast)
- **HTTP:** Custom `apiFetch` wrapper (`lib/api.ts`)
- **Port:** 3000

### Infrastructure
- **Containerization:** Docker + Docker Compose
- **Services:** db (:3308), redis (:6379), backend (:8000), frontend (:3000)

## Layered Architecture

### Backend Layers

```
HTTP Request
    |
    v
Routes (backend/routes/)          <- Thin adapters: parse request, call service, return response
    |
    v
Services (backend/services/)      <- ALL business logic: validation, orchestration, state transitions
    |
    v
Repositories (backend/repositories/)  <- Data access: CRUD operations, query building
    |
    v
Models (backend/models/)          <- SQLAlchemy ORM entities (22 models)
    |
    v
MySQL Database
```

**Key rules:**
- Routes NEVER contain business logic
- Services own `db.commit()` — repositories only `db.flush()`
- State transitions go through `core/state_machines.py`
- Domain exceptions from `core/exceptions.py` — never raw HTTPException in services

### Frontend Layers (React)

```
User Interaction
    |
    v
Pages (pages/)                    <- Route-level components, lazy-loaded
    |
    v
Components (components/)          <- Reusable UI blocks
    |
    v
Hooks (hooks/)                    <- Stateful logic extraction (useAuth, useTripDetails, etc.)
    |
    v
Store (store/)                    <- Redux slices with async thunks
    |
    v
Services (services/)              <- Stateless HTTP wrappers using apiFetch
    |
    v
apiFetch (lib/api.ts)             <- Centralized HTTP client with auth headers + 401 refresh
    |
    v
Backend API (/api/v1/*)
```

**Key rules:**
- Components NEVER call `apiFetch` directly — always through services/store
- Services are stateless — no imports from store or hooks
- Global state (auth, entities) in Redux; local UI state in `useState`
- All pages lazy-loaded via React Router

## Authentication Flow

```
1. POST /api/v1/auth/login  →  { access_token, refresh_token }
2. apiFetch attaches Authorization: Bearer <access_token> to all requests
3. On 401 response → apiFetch auto-retries with refresh_token
4. POST /api/v1/auth/logout → blacklists token in Redis
```

- Tokens: JWT (python-jose)
- Password hashing: bcrypt via passlib (isolated in `core/security.py`)
- Token blacklist: Redis SET
- Frontend state: `store/auth.slice.ts` + `hooks/use-auth.ts`

## Role-Based Access Control (RBAC)

5 roles with hierarchical permissions:

| Role | Key Permissions |
|------|----------------|
| **Admin** | Full system access, user management, bus/route CRUD |
| **Secretary** | Ticket sales, package registration, trip management, client CRUD |
| **Driver** | View assigned trips, update trip status |
| **Assistant** | View assigned trips, assist with operations |
| **Client** | View own tickets and packages |

- Backend: Role check via JWT claims in route dependencies
- Frontend: `ProtectedRoute` + `RoleGuard` components in `router/guards.tsx`

## Directory Structure

```
trans-comarapa-app/
├── backend/
│   ├── core/               # Config, enums, exceptions, state machines, Redis
│   ├── models/             # SQLAlchemy models (22 entities)
│   ├── schemas/            # Pydantic request/response schemas
│   ├── repositories/       # Data access layer (base + 4 specific)
│   ├── services/           # Business logic (auth, trip, ticket, package, user_mgmt, stats)
│   ├── routes/             # API endpoints (18 route modules)
│   ├── db/                 # Database config, seed scripts, migrations
│   ├── alembic/            # Migration versions
│   └── tests/              # Pytest test suite
├── frontend/               # React + Vite application (Source: src/)
├── docs/                   # Documentation + diagrams + plans
└── .agents/                # AI agent rules, skills, workflows
```
