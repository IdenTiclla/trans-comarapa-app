# CLAUDE.md

> Guidance for Claude Code when working with this repository

## Project Overview

**Trans Comarapa** — Transportation management system with layered architecture and RBAC

**Stack:** FastAPI + MySQL 8.0 + Redis 7 | React 19 + TypeScript + Redux Toolkit + Tailwind + shadcn/ui
**Roles:** Admin, Secretary, Driver, Assistant, Client
**Docker Services:** `db` (:3308), `redis` (:6379), `backend` (:8000), `frontend` (:3000)

## Quick Start

```bash
make setup          # Complete setup + seed DB
```

**Test Users:** `{role}@transcomarapa.com` / `123456` — admin1, secretary{1,2}.{santacruz|comarapa|losnegros|sanisidro}, driver{1-3}, assistant{1-3}, client{1-5}

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

# Frontend local
cd frontend && npm install && npm run dev    # localhost:3000
npm run lint      # must pass — see ui-conventions.md
npx tsc --noEmit  # must pass
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

- **Backend:** SQLAlchemy 2.0+, all models inherit `Base`, layered architecture
- **React:** TypeScript strict (no `any`), functional components, Redux Toolkit, Tailwind + shadcn/ui, sonner for toasts
- **API:** REST conventions, all endpoints `/api/v1/` prefix, React uses `apiFetch` from `lib/api.ts`
- **UI / a11y / file-size / typing (MANDATORY for any `frontend/` work):** [docs/guides/ui-conventions.md](docs/guides/ui-conventions.md) — rules enforced by ESLint, CI blocks violations
- **Fluid responsive design (MANDATORY for any layout work):** [docs/guides/fluid-responsive-design.md](docs/guides/fluid-responsive-design.md) — debe verse correcto en cualquier ancho 320–1920
- **Naming & adding features:** [docs/guides/conventions.md](docs/guides/conventions.md)

## Lessons Learned

**IMPORTANT:** Before writing code, review [docs/lessons/](docs/lessons/) (indexed in [docs/INDEX.md](docs/INDEX.md#lessons-learned)) for past mistakes. After fixing any bug, document it in `docs/lessons/NNN-short-description.md`.

## Key Resources

- **Full documentation index:** [docs/INDEX.md](docs/INDEX.md)
- **Environment setup:** [docs/guides/environment-setup.md](docs/guides/environment-setup.md)
- **Implementation plans:** [docs/implementation-plans/](docs/implementation-plans/)
- **API Docs:** http://localhost:8000/docs (Swagger UI)
- **React App:** http://localhost:3000
- **Database:** MySQL at `:3308` (root/Passw0rd!)
