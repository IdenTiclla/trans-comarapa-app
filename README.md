# Trans Comarapa - Transportation Management System

A professional web-based transportation management system for Trans Comarapa, featuring real-time operations, multi-role user management, and a premium modern UI/UX design.

## Tech Stack

- **Backend:** FastAPI + SQLAlchemy 2.0 + MySQL 8.0 + Redis 7 + JWT Auth (Python 3.12+)
- **Frontend:** React 19 + TypeScript + Redux Toolkit + Tailwind CSS 4 + shadcn/ui (Vite)
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
| Frontend App | http://localhost:3000 |
| API Docs (Swagger) | http://localhost:8000/docs |
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

### Frontend

```bash
cd frontend
npm install
npm run dev             # http://localhost:3000
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
cd frontend && npm test
```

## Key Features

- **Ticket Management** — Visual seat selection, reservation and sale flow, state tracking.
- **Trip Management** — Scheduling, driver/assistant assignment, status lifecycle.
- **Improved UX for Trips** — Persistence of selected date in URL and quick filters (Yesterday, Today, Tomorrow, etc.).
- **Package Management** — Registration, tracking, delivery with item-level detail.
- **Dashboards** — Role-specific dashboards with real-time statistics.
- **Premium UI** — Modern design system with bokeh effects, glassmorphism, and optimized layouts.
- **RBAC** — 5 user roles with granular permissions.
- **Audit Log** — Activity tracking for all operations.

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
│   ├── models/             # SQLAlchemy models
│   ├── schemas/            # Pydantic validation schemas
│   ├── repositories/       # Data access layer
│   ├── services/           # Business logic layer
│   ├── routes/             # API endpoints (/api/v1/*)
│   ├── db/                 # Database config + seed scripts
│   └── tests/              # Pytest test suite
├── frontend/                # React 19 app (Vite + TS)
│   └── src/
│       ├── pages/          # Route pages
│       ├── components/     # Reusable UI components
│       ├── services/       # API service modules
│       ├── store/          # Redux slices
│       ├── hooks/          # Custom hooks
│       ├── router/         # Routes + guards
│       ├── layouts/        # Page layouts
│       └── lib/            # Utilities
├── docs/                    # Documentation, diagrams, implementation plans
└── .agents/                 # AI agent rules, skills, workflows
```

## License

MIT
