# Plan de Mejora Arquitectonica - Trans Comarapa

## Contexto

El proyecto tiene logica de negocio incrustada en las rutas de FastAPI (18 archivos, algunos de +2000 lineas), sin capa de servicios ni repositorios. En frontend hay patrones inconsistentes (stores mezclando Options/Composition API, API calls directos en composables, middleware duplicado). La infraestructura carece de migraciones Alembic, linting frontend, y pre-commit hooks. Este plan introduce patrones del mundo real para hacer el codigo mantenible a largo plazo.

---

## FASE 1: Cimientos Backend (sin romper nada existente)

### 1.1 Excepciones de dominio
**Archivo nuevo**: `backend/core/exceptions.py`
- `AppException` (base) con `message` y `code`
- `NotFoundException`, `ConflictException`, `ValidationException`, `ForbiddenException`
- `InvalidStateTransitionException` (para tickets, packages, trips)

### 1.2 Manejador global de excepciones
**Archivo nuevo**: `backend/core/exception_handlers.py`
- Mapea `AppException.code` a HTTP status codes (NOT_FOUND->404, CONFLICT->409, etc.)
- Registrar en `backend/main.py` con `app.add_exception_handler(AppException, handler)`

### 1.3 Enums para estados (reemplazar magic strings)
**Archivo nuevo**: `backend/core/enums.py`
- `TicketState`: pending, confirmed, cancelled, completed
- `PackageStatus`: registered_at_office, assigned_to_trip, in_transit, arrived_at_destination, delivered
- `TripStatus`: scheduled, boarding, departed, arrived, cancelled, delayed
- `PaymentMethod`: cash, transfer, qr
- Reemplazar listas hardcodeadas en `schemas/ticket.py` y `schemas/package.py`

### 1.4 Maquinas de estado centralizadas
**Archivo nuevo**: `backend/core/state_machines.py`
- Diccionarios de transiciones validas por entidad
- Funcion `validate_transition(entity, transitions, current, target)` que lanza `InvalidStateTransitionException`
- Reemplaza validaciones inline en `routes/package.py:323-329` y `routes/ticket.py`

### 1.5 Logging (reemplazar print statements)
**Archivo nuevo**: `backend/core/logging_config.py`
- Formato: `%(asctime)s | %(levelname)-8s | %(name)s | %(message)s`
- Llamar `setup_logging()` desde `main.py`
- Reemplazar `print(f"[DEBUG]...")` por `logger.debug(...)` en:
  - `routes/ticket.py` (18 prints)
  - `routes/package.py` (2 prints)
  - `routes/trip.py` (1 print)

### 1.6 Health endpoint y pool config
- Agregar `GET /health` en `main.py`
- Configurar connection pool en `db/session.py`: `pool_size=10, max_overflow=20, pool_pre_ping=True, pool_recycle=1800`

---

## FASE 2: Capa de Repositorio

### 2.1 Repositorio base generico
**Archivo nuevo**: `backend/repositories/base.py`
- Clase `BaseRepository[ModelType]` con `get_by_id`, `get_all`, `create`, `update`, `delete`
- Usa `flush()` en lugar de `commit()` (el commit lo hace el servicio)

### 2.2 Repositorios especificos
Cada uno hereda de `BaseRepository` y agrega queries de dominio:

| Repositorio | Queries especificas extraidas de |
|---|---|
| `repositories/ticket_repository.py` | `routes/ticket.py` - get_by_trip, get_active_by_seat_and_trip, count_occupied_seats |
| `repositories/trip_repository.py` | `routes/trip.py` - find_driver_conflict, get_with_filters (sorting, pagination, search) |
| `repositories/package_repository.py` | `routes/package.py` - get_unassigned, get_by_sender, search_by_tracking |
| `repositories/user_repository.py` | `routes/user_management.py` - get_by_email, get_client_by_id |
| `repositories/seat_repository.py` | `routes/ticket.py` - get_available_for_trip |

### 2.3 Inyeccion via FastAPI Depends
**Archivo nuevo**: `backend/repositories/deps.py`
- Factory functions: `get_ticket_repo(db=Depends(get_db))` -> `TicketRepository(db)`

---

## FASE 3: Capa de Servicio (la ganancia mas grande)

### 3.1 Patron de servicio
Cada servicio recibe `db: Session`, instancia sus repositorios, y contiene TODA la logica de negocio. Las rutas quedan como adaptadores HTTP delgados (~50 lineas).

### 3.2 Servicios a crear (en orden de prioridad)

| Servicio | Extrae logica de | Lineas antes -> despues (ruta) |
|---|---|---|
| `services/ticket_service.py` | `routes/ticket.py` | 479 -> ~50 |
| `services/trip_service.py` | `routes/trip.py` | 732 -> ~80 |
| `services/package_service.py` | `routes/package.py` | 511 -> ~60 |
| `services/auth_service.py` | `routes/auth.py` | 741 -> ~80 |
| `services/user_management_service.py` | `routes/user_management.py` | 502 -> ~60 |
| `services/stats/` (subdirectorio) | `routes/stats.py` | 2270 -> ~100 |

### 3.3 Ejemplo: ruta refactorizada
```python
# routes/ticket.py (DESPUES - ~50 lineas)
router = APIRouter(tags=["Tickets"])

def get_service(db: Session = Depends(get_db)) -> TicketService:
    return TicketService(db)

@router.post("", response_model=TicketSchema, status_code=201)
async def create_ticket(data: TicketCreate, service: TicketService = Depends(get_service)):
    return service.create_ticket(data)
```

### 3.4 Estrategia de migracion
- Un archivo a la vez, empezando por `ticket.py` (mas simple)
- Correr `pytest -v` despues de cada archivo
- Los API contracts (paths, params, responses) NO cambian

---

## FASE 4: Alembic y Migraciones

- Inicializar: `cd backend && alembic init alembic`
- Configurar `alembic/env.py` para usar `Base` y `DATABASE_URL` existentes
- Importar todos los modelos en env.py
- Generar migracion inicial: `alembic revision --autogenerate -m "initial_schema"`
- Eliminar `Base.metadata.create_all(bind=engine)` de `main.py`
- Agregar `make db-migrate` y `make db-upgrade` al Makefile raiz

---

## FASE 5: Frontend - Estandarizacion

### 5.1 Eliminar middleware duplicado
- Eliminar `middleware/default.global.js`
- Mover rutas publicas extendidas (`/about`, `/services`, `/welcome`) a `middleware/auth.global.ts`

### 5.2 Estandarizar stores a Composition API
Migrar stores que usan Options API al patron Composition API consistente:
- `ticketStore.js`, `tripStore.js`, `packageStore.js`, `busStore.js`, `routeStore.js`, `locationStore.js`, `clientStore.js`, `driverStore.js`, `assistantStore.js`, `statsStore.js`, `auth.js`, `app.js`

Patron estandar:
```javascript
export const useEntityStore = defineStore('entity', () => {
  const items = ref([])
  const isLoading = ref(false)
  const error = ref(null)
  // ... actions como funciones async
  return { items, isLoading, error, ... }
})
```

### 5.3 Corregir duplicados en packageStore
- `stores/packageStore.js` tiene `assignToTrip`, `unassignFromTrip`, `updateStatus` definidas DOS VECES
- Eliminar el segundo bloque duplicado

### 5.4 Arreglar composables que saltan la capa de servicios
- `composables/useTripDetails.js`: Reemplazar `$fetch` directo por `ticketService.getTicketsByTripId()` y `packageService.getPackagesByTrip()`
- `composables/useClientSearch.js`: Reemplazar `$fetch` directo por `clientService`

### 5.5 Sistema global de notificaciones
- **Archivo nuevo**: `composables/useNotification.js` - notify, success, error, warning, dismiss
- **Componente nuevo**: `components/ui/NotificationToast.vue`
- Integrar en `app.vue` o layout default

---

## FASE 6: Infraestructura y DX

### 6.1 ESLint + Prettier para frontend
```bash
cd frontend && npm install -D eslint @nuxt/eslint-config prettier eslint-config-prettier
```
- Crear `.eslintrc.cjs` y `.prettierrc`

### 6.2 Pre-commit hooks
- Crear `.pre-commit-config.yaml` en la raiz
- Hooks: ruff (backend), eslint (frontend)

### 6.3 Proteger secrets
- Verificar que `.env` este en `.gitignore` (esta, pero fue committeado historicamente)
- Rotar SECRET_KEY en produccion

---

## Estructura final del backend

```
backend/
├── core/
│   ├── enums.py              # NUEVO - Estados como Enums
│   ├── exceptions.py         # NUEVO - Excepciones de dominio
│   ├── exception_handlers.py # NUEVO - Mapeo excepciones -> HTTP
│   ├── state_machines.py     # NUEVO - Transiciones de estado
│   ├── logging_config.py     # NUEVO - Config de logging
│   └── redis.py              # EXISTENTE
├── repositories/
│   ├── base.py               # NUEVO - CRUD generico
│   ├── deps.py               # NUEVO - Factories para DI
│   ├── ticket_repository.py  # NUEVO
│   ├── trip_repository.py    # NUEVO
│   ├── package_repository.py # NUEVO
│   ├── user_repository.py    # NUEVO
│   └── seat_repository.py    # NUEVO
├── services/
│   ├── ticket_service.py     # NUEVO - Logica de negocio
│   ├── trip_service.py       # NUEVO
│   ├── package_service.py    # NUEVO
│   ├── auth_service.py       # NUEVO
│   ├── user_management_service.py # NUEVO
│   └── stats/                # NUEVO - Subdirectorio
│       ├── __init__.py
│       ├── ticket_stats.py
│       ├── package_stats.py
│       └── revenue_stats.py
├── models/                   # SIN CAMBIOS
├── schemas/                  # CAMBIOS MENORES (usar Enums)
├── routes/                   # ADELGAZADOS (~50 lineas c/u)
├── db/                       # CAMBIOS MENORES (pool config)
└── tests/
    └── unit/
        ├── test_ticket_service.py  # NUEVO
        ├── test_trip_service.py    # NUEVO
        └── test_state_machines.py  # NUEVO
```

---

## Orden de ejecucion y dependencias

```
FASE 1 (Cimientos)     -- Independiente. Deployable inmediatamente.
    |
    v
FASE 2 (Repositorios)  -- Depende de Fase 1 (excepciones + enums)
    |
    v
FASE 3 (Servicios)     -- Depende de Fase 2 (repositorios)
                           Hacer un servicio a la vez con tests.

FASE 4 (Alembic)       -- Independiente. Paralelo con Fase 2-3.
FASE 5 (Frontend)      -- Independiente del backend. Paralelo con cualquier fase.
FASE 6 (Infra/DX)      -- Independiente. En cualquier momento.
```

---

## Verificacion

Despues de cada fase:
1. `cd backend && pytest -v --cov=.` - Todos los tests existentes deben pasar
2. `make up && make seed` - La app debe funcionar normalmente
3. Probar manualmente: login como secretary, crear viaje, vender ticket, registrar paquete
4. Verificar que los API contracts no cambiaron (mismos paths, params, responses)
5. Frontend: navegar por todos los dashboards, verificar que no hay errores en consola

---

## Nota sobre el archivo final
Al implementar, guardar una copia de este plan en `docs/implementation-plans/architecture-improvement-plan.md`
