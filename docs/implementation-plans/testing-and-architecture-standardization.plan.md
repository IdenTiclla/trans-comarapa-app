# Plan: Testing & Architecture Standardization (v2)

## Contexto

El proyecto tiene una base sólida pero enfrenta problemas críticos de calidad:

1. **Tests "unitarios" impuros**: `backend/tests/unit/` depende de MySQL real — son integration tests mal clasificados
2. **Servicios no testeables**: Los servicios hardcodean `self.repo = XRepository(db)` en `__init__`, imposibilitando inyectar mocks
3. **Frontend con mocking frágil**: `vi.mock` global en `setup.ts` + mocks manuales por servicio — no prueba la integración real servicio→API
4. **Sin factories**: Fixtures de 200+ líneas creando datos manualmente
5. **Sin thresholds de coverage**: No hay gates de calidad
6. **Skills desactualizadas**: No documentan DI, MSW, factories, ni categorías de test

**Objetivo**: Profesionalizar el stack de testing siguiendo estándares de la industria (Testing Pyramid, DI, MSW, AAA, factories).

---

## Gaps Identificados (v1 → v2)

| # | Gap | Impacto |
|---|-----|---------|
| 1 | DI con `Optional[repo]=None` es aceptable pero el plan no explica por qué se descartó Protocol-based DI | Falta justificación técnica |
| 2 | No hay test data factories (factory-boy) | Fixtures de 200+ líneas |
| 3 | No hay configuración de pytest markers (`--strict-markers`) | Tests mal clasificados sin warning |
| 4 | No hay `conftest.py` separado para unit tests (sin DB) | Unit tests siguen requiriendo MySQL |
| 5 | No hay `renderWithProviders` utility para frontend | Boilerplate en cada test de componente |
| 6 | MSW setup incompleto (falta organización de handlers, migration path) | Tests frontend no cubren servicio→API |
| 7 | No hay coverage thresholds | Sin gates de calidad |
| 8 | No hay patrón para testing de hooks (`renderHook`) | Hooks custom no testeables |
| 9 | `BusService` no usa repository (viola arquitectura) | Inconsistencia arquitectónica |
| 10 | `pytest-mock` no está en dependencias | No se puede usar `mocker` fixture |
| 11 | Test naming convention no definido | Tests inconsistentes |
| 12 | No hay CI/CD integration plan | Tests no corren en PRs |
| 13 | `setup.ts` mock global de `apiFetch` conflicta con MSW | Migration path necesario |
| 14 | No hay documentación ni guía de testing | Conocimiento tribal |
| 15 | Skills no cubren nuevos patrones | AI agent repite errores |

---

## Fase 1: Infraestructura Backend

### 1A. Agregar dependencias de test

**Archivo:** `backend/pyproject.toml`

```toml
[project.optional-dependencies]
test = [
    "pytest>=7.4.0",
    "pytest-asyncio>=0.21.1",
    "httpx>=0.24.1",
    "pytest-cov>=4.1.0",
    "pytest-mock>=3.12.0",     # NUEVO
    "factory-boy>=3.3.0",      # NUEVO
]
```

### 1B. Configurar pytest markers

**Archivo:** `backend/pyproject.toml`

```toml
[tool.pytest.ini_options]
testpaths = ["tests"]
markers = [
    "unit: Pure unit tests (no DB, no Redis, no HTTP)",
    "integration: Tests that need a running database",
    "regression: Tests for previously fixed bugs",
    "slow: Tests that take more than 5 seconds",
]
addopts = "-v --strict-markers"
```

### 1C. Crear conftest para unit tests (sin DB)

**Crear:** `backend/tests/unit/conftest.py`

```python
"""Fixtures for pure unit tests. No database, no external services."""
import pytest
from unittest.mock import MagicMock, create_autospec
from sqlalchemy.orm import Session


@pytest.fixture
def mock_db():
    """A MagicMock Session for unit tests."""
    return create_autospec(Session, instance=True)


@pytest.fixture
def mock_query(mock_db):
    """Pre-configured mock query chain."""
    query = MagicMock()
    mock_db.query.return_value = query
    query.filter.return_value = query
    query.first.return_value = None
    query.all.return_value = []
    return query
```

### 1D. Crear test data factories

**Crear:** `backend/tests/factories.py`

```python
"""Test data factories using factory_boy for consistent test data creation."""
import factory
from models.user import User, UserRole
from models.bus import Bus
from models.seat import Seat
from models.trip import Trip
from models.ticket import Ticket
from models.client import Client


class UserFactory(factory.Factory):
    class Meta:
        model = User

    id = factory.Sequence(lambda n: n + 1)
    username = factory.LazyAttribute(lambda o: f"user_{o.id}")
    email = factory.LazyAttribute(lambda o: f"user_{o.id}@test.com")
    hashed_password = "hashed_fake"
    role = UserRole.USER
    is_active = True
    is_admin = False
    firstname = factory.Faker("first_name")
    lastname = factory.Faker("last_name")


class BusFactory(factory.Factory):
    class Meta:
        model = Bus

    id = factory.Sequence(lambda n: n + 1)
    license_plate = factory.Sequence(lambda n: f"ABC{n:03d}")
    capacity = 40
    model = "Test Bus"


class SeatFactory(factory.Factory):
    class Meta:
        model = Seat

    id = factory.Sequence(lambda n: n + 1)
    seat_number = factory.Sequence(lambda n: n + 1)
    bus_id = 1
    deck = "FIRST"
    row = 1
    column = 1


class ClientFactory(factory.Factory):
    class Meta:
        model = Client

    id = factory.Sequence(lambda n: n + 1)
    firstname = factory.Faker("first_name")
    lastname = factory.Faker("last_name")
    phone = "70012345"


class TicketFactory(factory.Factory):
    class Meta:
        model = Ticket

    id = factory.Sequence(lambda n: n + 1)
    state = "pending"
    seat_id = 1
    client_id = 1
    trip_id = 1
    secretary_id = 1
    price = 50.0
    payment_method = "cash"
```

### 1E. Reclasificar tests existentes

| Archivo actual | Marker actual | Marker correcto | Razón |
|---|---|---|---|
| `test_state_machines.py` | ninguno | `@pytest.mark.unit` | Pura lógica, sin DB |
| `test_auth.py` | `@pytest.mark.unit` | `@pytest.mark.integration` | Usa TestClient + DB |
| `test_ticket.py` | `@pytest.mark.unit` | `@pytest.mark.integration` | Usa TestClient + DB |
| `test_user_model.py` | verificar | probablemente `integration` | Probablemente usa DB |
| `test_person_model.py` | verificar | `@pytest.mark.integration` | Ya está en integration/ |

---

## Fase 2: DI en Servicios Backend

### 2A. Patrón de refactorización

```python
# ANTES (Acoplamiento fuerte)
class TicketService:
    def __init__(self, db: Session):
        self.db = db
        self.repo = TicketRepository(db)

# DESPUÉS (Inyección de Dependencias)
class TicketService:
    def __init__(
        self,
        db: Session,
        repo: TicketRepository | None = None,
        lock_service: SeatLockService | None = None,
    ):
        self.db = db
        self.repo = repo or TicketRepository(db)
        self.lock_service = lock_service or SeatLockService()
```

**¿Por qué `Optional` con default `None` y no Protocol-based DI?**
Las routes usan `Depends(get_service)` que llama `XService(db)` — el path por defecto funciona exactamente igual. El `None` default es puramente para inyección en tests. Protocol-based DI (crear 12+ Protocol classes y modificar cada route) es demasiada ceremonia para un codebase de ~12 servicios. No vale la pena a esta escala.

### 2B. Orden de prioridad

1. `ticket_service.py` — más complejo, más lógica de negocio
2. `trip_service.py` — transiciones de estado complejas
3. `package_service.py` — transiciones de estado
4. `bus_service.py` — **también necesita crear BusRepository** (actualmente hace `self.db.query()` directo)
5. `auth_service.py` — lógica de autenticación
6. Resto: `route_service.py`, `person_service.py`, `office_service.py`, `cash_register_service.py`, `seat_lock_service.py`, `report_service.py`, `user_management_service.py`

### 2C. Ejemplo de test unitario puro

```python
"""tests/unit/services/test_ticket_service.py"""
import pytest
from unittest.mock import create_autospec
from sqlalchemy.orm import Session

from services.ticket_service import TicketService
from repositories.ticket_repository import TicketRepository
from core.exceptions import ConflictException
from tests.factories import TicketFactory


class TestTicketServiceCancel:
    """Test TicketService.cancel_ticket in isolation."""

    def test_cancel_pending_ticket_succeeds(self, mock_db):
        # Arrange
        mock_repo = create_autospec(TicketRepository, instance=True)
        ticket = TicketFactory(state="pending")
        mock_repo.get_by_id_or_raise.return_value = ticket
        service = TicketService(mock_db, repo=mock_repo)

        # Act
        result = service.cancel_ticket(ticket.id)

        # Assert
        assert result.state == "cancelled"
        mock_repo.log_state_change.assert_called_once()
        mock_db.commit.assert_called()

    def test_cancel_already_cancelled_skips_transition(self, mock_db):
        # Arrange
        mock_repo = create_autospec(TicketRepository, instance=True)
        ticket = TicketFactory(state="cancelled")
        mock_repo.get_by_id_or_raise.return_value = ticket
        service = TicketService(mock_db, repo=mock_repo)

        # Act
        result = service.cancel_ticket(ticket.id)

        # Assert
        assert result.state == "cancelled"
        mock_repo.log_state_change.assert_not_called()
        mock_db.commit.assert_not_called()
```

**Naming convention:** `test_[method]_[scenario]_[expected]` o agrupar por clase `TestXServiceMethod`.

---

## Fase 3: Infraestructura Frontend

### 3A. Instalar MSW

```bash
cd frontend-react && npm install -D msw@^2.7.0
```

### 3B. Crear handlers MSW

**Crear:** `frontend-react/src/test/mocks/handlers.ts`

```typescript
import { http, HttpResponse } from 'msw'

const API = 'http://localhost:8000/api/v1'

export const clientHandlers = [
  http.get(`${API}/clients/search`, ({ request }) => {
    const url = new URL(request.url)
    const term = url.searchParams.get('term')
    return HttpResponse.json({
      clients: term ? [
        { id: 1, firstname: 'Juan', lastname: 'Perez', document_id: '123', phone: '7123' }
      ] : []
    })
  }),
]

export const ticketHandlers = [
  http.get(`${API}/tickets`, () => {
    return HttpResponse.json({ tickets: [] })
  }),
]

export const handlers = [
  ...clientHandlers,
  ...ticketHandlers,
]
```

### 3C. Crear servidor MSW

**Crear:** `frontend-react/src/test/mocks/server.ts`

```typescript
import { setupServer } from 'msw/node'
import { handlers } from './handlers'

export const server = setupServer(...handlers)
```

### 3D. Migrar setup.ts

**Modificar:** `frontend-react/src/test/setup.ts`

```typescript
import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterAll, afterEach, beforeAll } from 'vitest'
import { server } from './mocks/server'

// MSW lifecycle
beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }))
afterEach(() => {
  cleanup()
  server.resetHandlers()
})
afterAll(() => server.close())

// REMOVIDO: vi.mock('@/lib/api') — MSW lo reemplaza
```

**Migration path:** Tests existentes con `vi.mock` siguen funcionando durante la migración. Se migran gradualmente a MSW.

### 3E. Crear renderWithProviders

**Crear:** `frontend-react/src/test/test-utils.tsx`

```tsx
import React, { PropsWithChildren } from 'react'
import { render, RenderOptions } from '@testing-library/react'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import { MemoryRouter } from 'react-router'
// Import reducers
import authReducer from '@/store/auth.slice'
import appReducer from '@/store/app.slice'

interface ExtendedRenderOptions extends Omit<RenderOptions, 'queries'> {
  preloadedState?: Record<string, unknown>
  store?: ReturnType<typeof configureStore>
  route?: string
}

export function renderWithProviders(
  ui: React.ReactElement,
  {
    preloadedState = {},
    store = configureStore({
      reducer: { auth: authReducer, app: appReducer },
      preloadedState,
    }),
    route = '/',
    ...renderOptions
  }: ExtendedRenderOptions = {}
) {
  function Wrapper({ children }: PropsWithChildren) {
    return (
      <Provider store={store}>
        <MemoryRouter initialEntries={[route]}>
          {children}
        </MemoryRouter>
      </Provider>
    )
  }
  return { store, ...render(ui, { wrapper: Wrapper, ...renderOptions }) }
}

export * from '@testing-library/react'
export { default as userEvent } from '@testing-library/user-event'
```

### 3F. Coverage thresholds

**Modificar:** `frontend-react/vitest.config.ts`

```typescript
coverage: {
  reporter: ['text', 'json', 'html'],
  exclude: ['node_modules/', 'src/test/', 'src/components/ui/'],
  thresholds: {
    lines: 20,
    branches: 20,
    functions: 20,
    statements: 20,
  },
},
```

### 3G. Patrón para testing de hooks

```tsx
import { renderHook, waitFor } from '@testing-library/react'
import { useTripDetailPage } from '@/hooks/use-trip-detail-page'

const wrapper = ({ children }) => (
  <Provider store={store}><MemoryRouter>{children}</MemoryRouter></Provider>
)

it('fetches trip data on mount', async () => {
  const { result } = renderHook(() => useTripDetailPage('1'), { wrapper })
  await waitFor(() => {
    expect(result.current.trip).toBeDefined()
  })
})
```

### 3H. Migrar QuickSearch.test.tsx como ejemplo

Reemplazar los `vi.mock('@/services/...')` individuales por handlers MSW con `server.use()` para overrides per-test.

---

## Fase 4: Institucionalización

### 4A. Actualizar Skills

**`.agents/skills/unit-testing/SKILL.md`:**
- Agregar sección "Test Categories" (unit vs integration vs regression)
- Backend: DI pattern, factories, `create_autospec`, `pytest -m unit`
- Frontend: MSW, `renderWithProviders`, `renderHook`, `server.use()`
- Naming convention: `test_[method]_[scenario]_[expected]`

**`.agents/skills/backend-dev/SKILL.md`:**
- Agregar sección 2.6 "Dependency Injection for Testability"

**`.agents/skills/frontend-dev/SKILL.md`:**
- Agregar sección 7 "Testing Conventions" (MSW, renderWithProviders, userEvent)

### 4B. Crear documentación

- `docs/guides/testing.md` — Guía completa de testing (filosofía, backend, frontend, comandos)
- `docs/lessons/003-unit-vs-integration-tests.md` — Lesson learned
- Actualizar `CLAUDE.md` con sección "Testing Standards"
- Actualizar `docs/INDEX.md` con referencia a guía de testing

---

## Fase 5: CI/CD (Futuro)

Documentado para implementación futura:

- GitHub Actions `.github/workflows/test.yml`:
  - Job `backend-unit`: `pytest -m unit` (sin servicios, rápido)
  - Job `backend-integration`: `pytest -m integration` (con MySQL service container)
  - Job `frontend-unit`: `vitest run --coverage`
- Coverage gates: fallar PR si coverage baja del threshold

---

## Archivos Críticos

```
backend/pyproject.toml                     # Dependencias + pytest config
backend/tests/conftest.py                  # Mantener para integration
backend/tests/unit/conftest.py             # NUEVO: fixtures sin DB
backend/tests/factories.py                 # NUEVO: factory-boy
backend/services/ticket_service.py         # Template DI
frontend-react/package.json               # MSW dependency
frontend-react/src/test/setup.ts           # Migrar a MSW
frontend-react/src/test/mocks/handlers.ts  # NUEVO
frontend-react/src/test/mocks/server.ts    # NUEVO
frontend-react/src/test/test-utils.tsx     # NUEVO: renderWithProviders
frontend-react/vitest.config.ts            # Coverage thresholds
```

## Orden de Implementación

| # | Tarea | Esfuerzo | Dependencias |
|---|-------|----------|-------------|
| 1 | Agregar pytest-mock, factory-boy a pyproject.toml | Pequeño | Ninguna |
| 2 | Configurar pytest markers en pyproject.toml | Pequeño | Ninguna |
| 3 | Crear `tests/unit/conftest.py` con mock fixtures | Pequeño | Ninguna |
| 4 | Crear `tests/factories.py` | Medio | #1 |
| 5 | Reclasificar markers de tests existentes | Pequeño | #2 |
| 6 | Agregar DI a TicketService + escribir primer unit test puro | Medio | #3, #4 |
| 7 | Agregar DI a servicios restantes (incremental) | Medio | #6 |
| 8 | Instalar MSW en frontend | Pequeño | Ninguna |
| 9 | Crear handlers + server MSW | Medio | #8 |
| 10 | Crear test-utils.tsx con renderWithProviders | Medio | Ninguna |
| 11 | Migrar setup.ts a MSW | Pequeño | #9 |
| 12 | Migrar QuickSearch.test.tsx a MSW | Medio | #9, #10, #11 |
| 13 | Agregar coverage thresholds a vitest.config.ts | Pequeño | Ninguna |
| 14 | Actualizar 3 SKILL.md | Medio | #6, #9, #10 |
| 15 | Crear docs/guides/testing.md | Medio | #14 |
| 16 | Crear lesson 003 | Pequeño | Ninguna |

**PRs sugeridos:** #1-5 (infra backend), #6-7 (DI backend), #8-13 (infra frontend), #14-16 (docs/skills)

## Verificación

```bash
# Backend: Solo unit tests (rápido, sin DB)
cd backend && uv run pytest -m unit -v

# Backend: Solo integration (necesita MySQL)
cd backend && uv run pytest -m integration -v

# Backend: Strict markers (no warnings)
cd backend && uv run pytest --strict-markers

# Frontend: Todos los tests
cd frontend-react && npm run test:run

# Frontend: Con coverage
cd frontend-react && npm run test:coverage
```

## Resumen de Beneficios

- **Velocidad:** Unit tests corren 10-50x más rápido (sin DB)
- **Aislamiento:** Cambios en DB no rompen tests de lógica de negocio
- **Realismo:** MSW detecta errores en URLs/headers que vi.mock ignora
- **Consistencia:** Factories eliminan fixtures manuales de 200+ líneas
- **Calidad:** Coverage thresholds previenen regresiones
- **Conocimiento:** Skills y docs aseguran que humanos y AI sigan los patrones
