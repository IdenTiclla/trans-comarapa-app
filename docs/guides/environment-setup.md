# Environment Setup Guide

## System Requirements

- **Docker & Docker Compose** (required)
- **Python 3.12+** (local backend dev)
- **Node.js 18+** (local frontend dev)
- **uv** (Python package manager)

## Quick Start

```bash
make setup    # Copies env.example → .env, builds images, starts services, seeds DB
```

## Docker Services

| Service | Port | Image |
|---------|------|-------|
| `db` | :3308 → 3306 | mysql:8.0 (tz: America/La_Paz) |
| `redis` | :6379 | redis:7-alpine |
| `backend` | :8000 | FastAPI (waits for db + redis healthy) |
| `frontend-react` | :3000 | React 19 + Vite |

**Volumes:** `mysql_data`, `redis_data` (persistent)
**Network:** `trans-comarapa-network` (bridge)

## Environment Variables

### Root `.env` (from `env.example`)

```bash
MYSQL_ROOT_PASSWORD=Passw0rd!
SECRET_KEY=your-secret-key-change-in-production
DEBUG=true
NODE_ENV=development
BACKEND_TARGET=development
FRONTEND_TARGET=development
NUXT_PUBLIC_API_BASE_URL=http://localhost:8000/api/v1
```

### Backend (auto-injected by Docker)

```bash
DATABASE_URL=mysql+pymysql://root:${MYSQL_ROOT_PASSWORD}@db:3306/trans_comarapa
SECRET_KEY=${SECRET_KEY}
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
REDIS_URL=redis://redis:6379
TZ=America/La_Paz
```

For **local dev** (without Docker), create `backend/.env`:
```bash
DATABASE_URL=mysql+pymysql://root:Passw0rd!@localhost:3308/trans_comarapa
SECRET_KEY=dev-secret-key
REDIS_URL=redis://localhost:6379
DEBUG=true
```

### Frontend React

```bash
VITE_API_BASE_URL=http://localhost:8000/api/v1
```

## Make Commands

```bash
# Docker
make up / down / restart / status
make clean              # Stop + remove containers + volumes
make rebuild            # Rebuild images without cache

# Logs
make logs-f             # Follow all logs
make logs-backend       # Backend only
make logs-frontend      # Frontend only
make logs-db            # Database only

# Database
make seed               # Full seed with test data
make seed-minimal       # Minimal data (faster)
make seed-demo          # Large dataset for demos
make clear-db           # Wipe all data

# Shell Access
make shell-backend      # Backend bash
make shell-frontend     # Frontend shell
make shell-db           # MySQL CLI

# Local Development
cd backend && uv sync && source .venv/bin/activate && python run.py
cd frontend-react && npm install && npm run dev  # localhost:3001
```

## Test Credentials

Password for all: `123456`

| Role | Email |
|------|-------|
| Admin | admin1@transcomarapa.com |
| Secretary | secretary1@transcomarapa.com |
| Driver | driver1@transcomarapa.com |
| Assistant | assistant1@transcomarapa.com |
| Client | client1@transcomarapa.com |

## Access Points

| Service | URL |
|---------|-----|
| React App | http://localhost:3000 (Docker) / :3001 (local) |
| API Swagger | http://localhost:8000/docs |
| MySQL | localhost:3308 (root/Passw0rd!) |
| Redis | localhost:6379 |

## Troubleshooting

### Puerto en uso
Cambiar el port en `docker-compose.yml` o detener el servicio conflictivo.

### DB connection fails
- Esperar healthchecks (~50s): `make status`
- Verificar logs: `make logs-db`
- Confirmar que `MYSQL_ROOT_PASSWORD` coincide entre `.env` y compose

### Frontend no conecta al API
- Verificar `VITE_API_BASE_URL=http://localhost:8000/api/v1`
- Dentro de Docker usar hostname `backend`; fuera usar `localhost`

### Seed falla
- DB debe estar healthy primero: `make status`
- Probar `make seed-minimal` para seeding más rápido
- Ver errores: `make logs-backend`

### Datos viejos persisten
- `make clean` remueve volúmenes
- `make clear-db` solo limpia datos sin remover containers

### Production checklist
- Cambiar `MYSQL_ROOT_PASSWORD` a password fuerte
- Generar nuevo `SECRET_KEY` (usar `python -c "import secrets; print(secrets.token_urlsafe(64))"`)
- Setear `DEBUG=false`, `NODE_ENV=production`
- Usar `BACKEND_TARGET=production`, `FRONTEND_TARGET=production`
