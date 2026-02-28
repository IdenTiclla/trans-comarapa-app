# Plan: Tooling Setup + Route Refactoring

## Context
After introducing the layered architecture (repositories, services, state machines), three route files (`trip.py`, `auth.py`, `user_management.py`) still bypass their services entirely with all business logic inline. Additionally, the tooling configs (pre-commit, ESLint, Prettier) were added but never fully installed. This plan completes both the tooling setup and the route refactoring.

---

## Phase 1: Tooling (Quick wins)

### 1A — Pre-commit hooks
**File:** `Makefile`
- Add `lint-install` target: `pip install pre-commit && pre-commit install`
- Add `lint` target: `pre-commit run --all-files`

### 1B — ESLint/Prettier in frontend
**File:** `frontend/package.json`
- Add devDependencies: `eslint` (^9), `eslint-plugin-vue` (^9), `prettier` (^3)
- Add scripts: `lint`, `lint:fix`, `format`, `format:check`

**File:** `frontend/eslint.config.js`
- Import and spread `eslint-plugin-vue` flat config (`pluginVue.configs['flat/recommended']`)
- Add `vue/multi-word-component-names: off` (Nuxt pages use single-word names)

Then run: `cd frontend && npm install`

### 1C — Docker alembic auto-migration
**File:** `backend/Dockerfile`
- Add `alembic upgrade head` before `exec uvicorn` in both dev (line 52) and prod (line 74) entrypoints

Then run: `make rebuild`

---

## Phase 2: Refactor `routes/user_management.py` (503 lines → ~60)

This is the simplest route — pure CRUD, all 8 service methods already exist.

### Step 1 — Enhance service
**File:** `backend/services/user_management_service.py`
- `create_user`: add username uniqueness check (use `repo.get_by_username`), add `Secretary` record creation when role == SECRETARY
- `delete_user`: add `current_user_id` param + self-delete guard → `ForbiddenException`
- `deactivate_user`: add `current_user_id` param + self-deactivate guard → `ForbiddenException`
- Add `get_my_profile(user)` — extract role-dispatch + entity lookup from route's `GET /users/me/profile`
- Add `update_my_profile(user, data)` — extract from route's `PUT /users/me/profile`

### Step 2 — Thin route
**File:** `backend/routes/user_management.py`
- Import `UserManagementService`, add `get_service` factory dependency
- Replace all handler bodies with 1-3 line service calls
- Remove all direct model/SQLAlchemy imports

---

## Phase 3: Refactor `routes/auth.py` (742 lines → ~150)

Auth keeps HTTP-layer concerns (cookies, token creation) but delegates business logic.

### Step 1 — Enhance service
**File:** `backend/services/auth_service.py`
- Add `build_token_data(user) -> dict` — extract the repeated JWT payload construction
- Add `build_response_body(user, access_token, refresh_token) -> dict` — extract response dict + legacy role entity lookup (currently copy-pasted in /login and /refresh)
- Add `update_user_profile(user, update_data) -> User` — extract PUT /me inline DB ops

### Step 2 — Thin route
**File:** `backend/routes/auth.py`
- Import `AuthService`, add `get_service` factory
- Extract `_set_auth_cookies(response, access_token, refresh_token)` private helper
- `/login` and `/refresh`: call `service.build_token_data()`, create tokens, call `service.build_response_body()`, set cookies
- `/me/person` and 5 `/me/{role}` endpoints: delegate to `service.get_user_person_info()`
- `PUT /me`: delegate to `service.update_user_profile()`
- `POST /register`: delegate to `service.register_user()`

---

## Phase 4: Refactor `routes/trip.py` (735 lines → ~70)

Most complex — service needs significant enhancement before route can be thinned.

### Step 1 — Enhance repository
**File:** `backend/repositories/trip_repository.py`
- Add `find_bus_conflict(bus_id, trip_datetime, exclude_trip_id=None)`
- Add `find_assistant_conflict(assistant_id, trip_datetime, exclude_trip_id=None)`
- Add `find_duplicate(trip_datetime, bus_id, route_id, driver_id, assistant_id)`
- Extend `get_with_filters` to support: `upcoming`, `origin`/`destination` (location name joins), `min_seats`, `status` as comma-separated list

### Step 2 — Enhance service
**File:** `backend/services/trip_service.py`
- `get_trips`: add all missing filter params (upcoming, origin, destination, min_seats, status list), return enriched dict with pagination (origin_name, destination_name, available_seats) — fix N+1 query with batch seat count
- Add `get_trip_detail(trip_id) -> dict` — enriched single-trip response with `seats_layout`, `available_seats_count`; reuse `SeatRepository.get_available_for_trip`
- Add `get_available_seats(trip_id) -> dict` — using `SeatRepository` (replaces N+1 loop)
- `create_trip`: add bus conflict, assistant conflict, duplicate detection, 30-min future validation
- `update_trip`: add driver/assistant/bus conflict checks with 2-hour buffer

### Step 3 — Thin route
**File:** `backend/routes/trip.py`
- Import `TripService`, add `get_service` factory
- Each handler → 1-3 line service delegation
- Remove all model/SQLAlchemy imports

---

## Files Modified Summary

| File | Change |
|------|--------|
| `Makefile` | Add lint-install, lint targets |
| `frontend/package.json` | Add eslint, prettier, eslint-plugin-vue deps + scripts |
| `frontend/eslint.config.js` | Add Vue plugin config |
| `backend/Dockerfile` | Add alembic upgrade head to entrypoints |
| `backend/services/user_management_service.py` | Add guards, Secretary creation, profile methods |
| `backend/routes/user_management.py` | Thin to service calls |
| `backend/services/auth_service.py` | Add token/response builders, profile update |
| `backend/routes/auth.py` | Thin to service calls + cookie helper |
| `backend/repositories/trip_repository.py` | Add conflict finders, extend filters |
| `backend/services/trip_service.py` | Add detail/seats methods, extend filters, add conflict checks |
| `backend/routes/trip.py` | Thin to service calls |

---

## Verification

After each phase:
1. `cd backend && pytest -v --cov=.` — run existing tests
2. `make up && make logs-backend` — check for startup errors
3. Manual smoke test via Swagger UI at `http://localhost:8000/docs`
4. After Phase 1: `make lint` to verify pre-commit hooks work
5. After Phase 1B: `cd frontend && npm run lint` to verify ESLint works
