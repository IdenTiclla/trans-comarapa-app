# CLAUDE.md

> Guidance for Claude Code when working with this repository

## Project Overview

**Trans Comarapa** — Transportation management system with layered architecture and RBAC

**Stack:** FastAPI + MySQL 8.0 + Redis 7 | React 19 + TypeScript + Redux Toolkit + Tailwind + shadcn/ui
**Roles:** Admin, Secretary, Driver, Assistant, Client
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

## Architecture (summary)

**Backend:** `Route → Service → Repository → Model` ([details](docs/architecture/overview.md))
- Routes: thin adapters, no business logic
- Services: all validation, orchestration, `db.commit()`
- Repositories: data access only, `db.flush()`
- Models: data structure only (use `core/security.py` for hashing)

**Frontend React:** `Page → Component → Hook → Store → Service → apiFetch` ([details](docs/architecture/overview.md))

**Data Model:** 22 SQLAlchemy models ([details](docs/architecture/data-model.md))
**State Machines:** Ticket, Package, Trip transitions ([details](docs/architecture/state-machines.md))
**API Reference:** All REST endpoints ([details](docs/architecture/api-reference.md))

## Code Standards

- **File size limits** per file type defined in each skill (`backend-dev/SKILL.md`, `frontend-dev/SKILL.md`)
- **Backend:** SQLAlchemy 2.0+, all models inherit `Base`, layered architecture
- **React:** TypeScript, functional components, Redux Toolkit, Tailwind + shadcn/ui, sonner for toasts
- **API:** REST conventions, all endpoints `/api/v1/` prefix, React uses `apiFetch` from `lib/api.ts`
- **Naming conventions:** [docs/guides/naming-conventions.md](docs/guides/naming-conventions.md)
- **Adding features:** [docs/guides/adding-features.md](docs/guides/adding-features.md)

## Lessons Learned

**IMPORTANT:** Before writing code, review `docs/lessons/` for past mistakes. After fixing any bug, document it in `docs/lessons/NNN-short-description.md`.

- `001`: Don't use Python `set` with objects containing WebSocket/network references — use `list`
- `002`: Never call `.toFixed()`, `Object.entries()` directly on API response fields — use `?? 0` / `?? {}`

## Key Resources

- **Full documentation index:** [docs/INDEX.md](docs/INDEX.md)
- **Environment setup:** [docs/guides/environment-setup.md](docs/guides/environment-setup.md)
- **Implementation plans:** [docs/implementation-plans/](docs/implementation-plans/)
- **API Docs:** http://localhost:8000/docs (Swagger UI)
- **React App:** http://localhost:3001
- **Database:** MySQL at `:3308` (root/Passw0rd!)
