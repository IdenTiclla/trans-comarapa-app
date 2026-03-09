# Trans Comarapa - Transportation Management System

A web-based transportation management system for Trans Comarapa, featuring real-time operations, multi-role user management, and modern UI/UX design.

## Tech Stack

- **Backend:** FastAPI + SQLAlchemy 2.0 + MySQL 8.0 + Redis 7 + JWT Auth (Python 3.12+)
- **Frontend (active):** React 19 + TypeScript + Redux Toolkit + Tailwind CSS + shadcn/ui (port `:3001`)
- **Frontend (legacy):** Nuxt 3 + Vue 3 (port `:3000`) — reference only, no active development
- **Roles:** Admin, Secretary, Driver, Assistant, Client
- **Containerization:** Docker + Docker Compose

## Quick Start

```bash
# Clone and setup everything (Docker required)
git clone <repository-url>
cd trans-comarapa-app
make setup
```

This builds all Docker images, starts services, runs migrations, and seeds the database.

### Access Points

| Service | URL |
|---------|-----|
| React App | http://localhost:3001 |
| API Docs (Swagger) | http://localhost:8000/docs |
| Legacy Nuxt App | http://localhost:3000 |
| MySQL | localhost:3308 (root/Passw0rd!) |

### Test Credentials

All test users use password `123456`:

| Role | Email |
|------|-------|
| Admin | admin1@transcomarapa.com |
| Secretary | secretary1@transcomarapa.com |
| Client | client1@transcomarapa.com |
| Driver | driver1@transcomarapa.com |
| Assistant | assistant1@transcomarapa.com |

## Local Development (without Docker)

### Backend

```bash
cd backend
uv sync && source .venv/bin/activate
cp .env.example .env   # edit with your DB credentials
alembic upgrade head
python db/seed.py       # seed test data
python run.py           # http://localhost:8000
```

### Frontend React

```bash
cd frontend-react
npm install
npm run dev             # http://localhost:3001
```

## Essential Commands

```bash
# Docker
make up / down / restart / status
make logs-f / logs-backend / logs-frontend / logs-db
make shell-backend / shell-frontend / shell-db

# Database
make seed              # full seed with test data
make seed-minimal      # minimal seed
make clear-db          # wipe database

# Testing
cd backend && pytest -v --cov=.
```

## Key Features

- **Ticket Management** — Visual seat selection, reservation and sale flow, state tracking
- **Trip Management** — Scheduling, driver/assistant assignment, status lifecycle
- **Package Management** — Registration, tracking, delivery with item-level detail
- **Dashboards** — Role-specific dashboards with real-time statistics
- **RBAC** — 5 user roles with granular permissions on backend and frontend
- **Audit Log** — Activity tracking for all operations

## Documentation

All documentation lives in [`docs/`](docs/). Start at [docs/INDEX.md](docs/INDEX.md) for the full index.

Key documents:

| Document | Description |
|----------|-------------|
| [docs/INDEX.md](docs/INDEX.md) | Master documentation index |
| [docs/pvm.md](docs/pvm.md) | Product Vision Map (strategy & roadmap) |
| [docs/prd.md](docs/prd.md) | Product Requirements Document |
| [docs/architecture.md](docs/architecture.md) | System architecture and layer boundaries |
| [docs/data-model.md](docs/data-model.md) | Database schema and entity relationships |
| [docs/state-machines.md](docs/state-machines.md) | Ticket, package, and trip state transitions |
| [docs/api-reference.md](docs/api-reference.md) | All REST API endpoints |
| [README-Docker.md](README-Docker.md) | Docker setup guide |

## Project Structure

```
trans-comarapa-app/
├── backend/                 # FastAPI REST API
│   ├── core/               # Config, enums, exceptions, state machines
│   ├── models/             # SQLAlchemy models (22 entities)
│   ├── schemas/            # Pydantic validation schemas
│   ├── repositories/       # Data access layer
│   ├── services/           # Business logic layer
│   ├── routes/             # API endpoints (/api/v1/*)
│   ├── db/                 # Database config + seed scripts
│   └── tests/              # Pytest test suite
├── frontend-react/          # React 19 app (active)
│   └── src/
│       ├── pages/          # Route pages (lazy-loaded)
│       ├── components/     # Reusable UI components
│       ├── services/       # API service modules (18)
│       ├── store/          # Redux slices (13)
│       ├── hooks/          # Custom hooks (6)
│       ├── router/         # Routes + guards
│       ├── layouts/        # Page layouts
│       ├── lib/            # Utilities (apiFetch, constants)
│       └── types/          # TypeScript interfaces
├── frontend/                # Nuxt 3 app (legacy, reference only)
├── docs/                    # Documentation, diagrams, implementation plans
└── .agents/                 # AI agent rules, skills, workflows
```

## License

MIT
