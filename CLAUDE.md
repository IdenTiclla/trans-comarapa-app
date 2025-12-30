# CLAUDE.md

> Guidance for Claude Code when working with this repository

## Project Overview

**Trans Comarapa** - Transportation management system with layered architecture and RBAC

**Stack:**
- Backend: FastAPI + MySQL 8.0 + Redis 7 + JWT Auth
- Frontend: Nuxt 3 + Vue 3 + Tailwind + Pinia
- Roles: Admin, Secretary, Driver, Assistant, Client

**Services (Docker Compose):**
- `db` (MySQL) → `:3308`
- `redis` → `:6379`
- `backend` (FastAPI) → `:8000`
- `frontend` (Nuxt) → `:3000`

---

## Quick Start

```bash
make setup          # Complete setup + seed DB
```

**Test Users:** `[role]1@transcomarapa.com` / `123456` (admin, secretary, client)

---

## Essential Commands

### Development Workflow
```bash
# Docker services
make up/down/restart/status

# Logs
make logs-f                    # All services
make logs-backend/frontend/db  # Specific service

# Shell access
make shell-backend/frontend/db
```

### Database Operations
```bash
make seed           # Development data
make seed-minimal   # Fast minimal seed
make clear-db       # ⚠️ Delete all data
```

### Local Development
```bash
# Backend
cd backend && uv sync && source .venv/bin/activate
python run.py       # localhost:8000
pytest -v --cov=.   # Run tests

# Frontend
cd frontend && npm install
npm run dev         # localhost:3000
```

---

## Architecture

### Data Model Relationships
```
Users → [Admin, Secretary, Driver, Assistant, Client]
Buses → Seats (1:N)
Routes ↔ Locations (N:M)
Trips → Bus + Route + Driver + Assistant
Tickets → Trip + Client + Seat + Secretary
Packages → Trip + Sender + Recipient + Secretary
```

### Request Flow
```
UI → Store (Pinia) → Service (HTTP) → Route (API) → Schema (Validation) → Model (DB)
```

### Project Structure
```
backend/
├── models/      # SQLAlchemy entities (15 models)
├── schemas/     # Pydantic validation
├── routes/      # API endpoints (/api/v1/*)
└── tests/       # Unit & integration tests

frontend/
├── pages/       # Role-based dashboards
├── components/  # 22+ reusable components
├── stores/      # 12 Pinia stores
└── services/    # 14 API modules
```

---

## Development Patterns

### Authentication
- Login: `/api/v1/auth/login` → JWT tokens
- Store: `frontend/stores/auth.js`
- Middleware: Auto token refresh

### Naming Conventions
| Type | Pattern | Example |
|------|---------|---------|
| Service | `[entity]Service.js` | `ticketService.js` |
| Store | `[entity]Store.js` | `ticketStore.js` |
| Model | `class [Entity](Base)` | `class Ticket(Base)` |
| Schema | `[Entity]Create/Update` | `TicketCreate` |

### Code Standards
- **Backend:** SQLAlchemy 2.0+, all models inherit `Base`
- **Frontend:** Vue 3 Composition API, Tailwind CSS
- **API:** REST conventions, proper HTTP status codes
- **All endpoints:** `/api/v1/` prefix

---

## Adding New Features

### Complete Checklist

**1. Backend Model** (`backend/models/[entity].py`)
```python
from models.base import Base

class Entity(Base):
    __tablename__ = "entities"
    # Define columns, relationships
```

**2. Backend Schema** (`backend/schemas/[entity].py`)
```python
from pydantic import BaseModel

class EntityBase(BaseModel): ...
class EntityCreate(EntityBase): ...
class EntityUpdate(EntityBase): ...
class Entity(EntityBase): ...
```

**3. Backend Route** (`backend/routes/[entity].py`)
```python
from fastapi import APIRouter, Depends
router = APIRouter(prefix="/entities", tags=["entities"])

@router.get("/")
async def get_all(...): ...
```

**4. Migration**
```bash
cd backend
alembic revision --autogenerate -m "Add [entity]"
alembic upgrade head
```

**5. Frontend Service** (`frontend/services/[entity]Service.js`)
```javascript
export const getAll = () => apiFetch('/entities')
export const create = (data) => apiFetch('/entities', { method: 'POST', body: data })
```

**6. Frontend Store** (`frontend/stores/[entity]Store.js`)
```javascript
export const useEntityStore = defineStore('entity', () => {
  const items = ref([])
  const fetchAll = async () => { items.value = await getAll() }
  return { items, fetchAll }
})
```

**7. Frontend UI** (`frontend/pages/*/entities.vue`)
```vue
<script setup>
const store = useEntityStore()
await store.fetchAll()
</script>
```

**8. Testing** (`backend/tests/unit/test_[entity].py`)
```bash
pytest tests/unit/test_entity.py -v
```

### File Locations Reference
```
New entity "Reservation":
├── backend/models/reservation.py
├── backend/schemas/reservation.py
├── backend/routes/reservation.py
├── backend/tests/unit/test_reservation.py
├── frontend/services/reservationService.js
├── frontend/stores/reservationStore.js
└── frontend/pages/secretary/reservations.vue
```

---

## Environment Configuration

### Docker (Auto-configured)
No manual setup needed. `make setup` creates all configs.

### Local Development

**Backend `.env`:**
```env
DATABASE_URL=mysql+pymysql://root:password@localhost:3308/trans_comarapa
SECRET_KEY=your-secret-key
REDIS_URL=redis://localhost:6379
DEBUG=True
```

**Frontend `.env`:**
```env
NUXT_PUBLIC_API_BASE_URL=http://localhost:8000/api/v1
```

---

## Troubleshooting

### Quick Fixes
```bash
# Services won't start
make status && make logs-f

# DB connection errors
docker-compose ps  # Wait for health check (10-15s)

# Port conflicts
lsof -i :3000  # Find & kill process

# Fresh restart
make clean && make setup
```

### Direct Docker Commands
```bash
docker-compose ps                    # Status
docker-compose logs -f backend       # Follow logs
docker-compose exec backend bash     # Shell access
docker-compose restart backend       # Restart service
docker-compose down -v               # Nuclear option
```

---

## Current Implementation Status

- ✅ **Secretaries** (100%): Full dashboard, trip management, ticket sales
- 🟡 **Administrators** (70%): Dashboard, user management, ticket access
- 🟡 **Other Roles** (25%): Basic dashboards only

---

## Key Resources

- **API Docs:** http://localhost:8000/docs (Swagger UI)
- **Test Coverage:** `pytest --cov=.` in backend
- **Database:** MySQL at `:3308` (root/Passw0rd!)