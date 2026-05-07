# Codebase Cleanup, Dead Code Removal & Hardcode Audit Plan

> **Date:** 2026-05-06  
> **Scope:** Backend + Frontend + Docker/Config  
> **Estimated effort:** 12 phases, each independently deployable  

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Phase 1 — Production-Breaking Fixes (CRITICAL)](#phase-1--production-breaking-fixes-critical)
3. [Phase 2 — Remove Dead Files](#phase-2--remove-dead-files)
4. [Phase 3 — Remove Unused Imports & Code](#phase-3--remove-unused-imports--code)
5. [Phase 4 — Remove Unused npm Dependencies](#phase-4--remove-unused-npm-dependencies)
6. [Phase 5 — Centralize Hardcoded Business Config (Backend)](#phase-5--centralize-hardcoded-business-config-backend)
7. [Phase 6 — Centralize Hardcoded Frontend Constants](#phase-6--centralize-hardcoded-frontend-constants)
8. [Phase 7 — Fix Hardcoded Office Data (Phone/Address Inconsistency)](#phase-7--fix-hardcoded-office-data-phoneaddress-inconsistency)
9. [Phase 8 — Config & Environment Fixes](#phase-8--config--environment-fixes)
10. [Phase 9 — Fix Security Issues](#phase-9--fix-security-issues)
11. [Phase 10 — Fix Architecture Violations](#phase-10--fix-architecture-violations)
12. [Phase 11 — Frontend Cleanup: Types, Stores, Services](#phase-11--frontend-cleanup-types-stores-services)
13. [Phase 12 — Code Quality & Consistency](#phase-12--code-quality--consistency)

---

## Executive Summary

### Findings Overview

| Category | Backend | Frontend | Total |
|----------|---------|----------|-------|
| Production-breaking bugs | 5 | 1 | **6** |
| Dead files to delete | 10 | 22 | **32** |
| Unused imports/functions | 16 | 48+ | **64+** |
| Unused npm packages | — | 4 | **4** |
| Hardcoded values to centralize | 40+ | 50+ | **90+** |
| Security issues | 6 | 1 | **7** |
| Architecture violations | 9 files | — | **9** |
| Config/env issues | 22 | — | **22** |

### Severity Breakdown

| Severity | Count |
|----------|-------|
| CRITICAL (will break production) | 6 |
| HIGH (security or data integrity risk) | 12 |
| MEDIUM (maintainability, inconsistency) | 25 |
| LOW (code hygiene, cosmetics) | 20 |

---

## Phase 1 — Production-Breaking Fixes (CRITICAL)

> **Priority:** P0 — Must fix before any deployment  
> **Risk:** App will crash or be unreachable in production  

### 1.1 Production docker-compose missing Redis service

**File:** `docker-compose.prod.yml`

The production compose file has no Redis service and passes no `REDIS_URL` to the backend. The backend imports `RedisClient()` at module level (`core/redis.py:23`) and `auth/blacklist.py` uses it. **The backend will crash on startup in production.**

**Fix:** Add Redis service to `docker-compose.prod.yml` and pass `REDIS_URL=redis://redis:6379` to the backend container.

### 1.2 Production frontend port mismatch

**Files:** `frontend/Dockerfile` (line 51: `EXPOSE 80`, nginx on 80) vs `docker-compose.prod.yml` (line 59: `"3000:3000"`)

The production Dockerfile uses nginx on port 80, but compose maps `3000:3000`. **Frontend will be unreachable in production.**

**Fix:** Change compose prod port mapping to `"3000:80"` or `"80:80"`.

### 1.3 JWT env var names mismatch between Docker and code

**Files:**
- `docker-compose.yml:59-60` → `ALGORITHM=HS256`, `ACCESS_TOKEN_EXPIRE_MINUTES=30`
- `backend/auth/jwt.py:21-22` → reads `JWT_ALGORITHM`, `JWT_ACCESS_TOKEN_EXPIRE_MINUTES`

The compose files pass `ALGORITHM` and `ACCESS_TOKEN_EXPIRE_MINUTES` but the code reads `JWT_ALGORITHM` and `JWT_ACCESS_TOKEN_EXPIRE_MINUTES`. Works by coincidence (defaults match), but the compose env vars are dead letters.

**Fix:** Rename env vars in both compose files to `JWT_ALGORITHM` and `JWT_ACCESS_TOKEN_EXPIRE_MINUTES`.

### 1.4 Wrong variable name in root `.env`

**Files:** `.env:16` and `env.example:16` use `NUXT_PUBLIC_API_BASE_URL`

The project migrated from Nuxt to React. The correct variable is `VITE_API_BASE_URL`.

**Fix:** Rename `NUXT_PUBLIC_API_BASE_URL` → `VITE_API_BASE_URL` in both files.

### 1.5 Vite env vars not available at Docker build time

**Files:** `docker-compose.prod.yml:62` (runtime env), `frontend/Dockerfile:30-31` (build)

Vite embeds `VITE_*` vars at build time, not runtime. The production Dockerfile needs a build `ARG` for the API URL.

**Fix:** Add `ARG VITE_API_BASE_URL` and `ENV VITE_API_BASE_URL=$VITE_API_BASE_URL` before `RUN npm run build` in the frontend Dockerfile. Update `docker-compose.prod.yml` to use `build.args`.

### 1.6 Nginx directory referenced in prod compose but doesn't exist

**File:** `docker-compose.prod.yml:83-84` mounts `./nginx/nginx.conf` and `./nginx/ssl`

The `nginx/` directory does not exist. The production compose nginx service will fail.

**Fix:** Create `nginx/` directory with appropriate `nginx.conf` and ssl placeholder, or remove nginx service if not yet needed.

---

## Phase 2 — Remove Dead Files

> **Priority:** P1  
> **Risk:** Zero — these files are never imported  

### 2.1 Backend dead files

| File | Lines | Reason |
|------|-------|--------|
| `backend/schemas/driver_with_user.py` | 40 | Never imported anywhere |
| `backend/services/stats/__init__.py` | 1 | Empty package, no consumers |
| `backend/models/base.py` | 3 | Duplicate of `db/base.py`, never imported |
| `backend/auth/utils.py` | 47 | Entire module superseded by `AuthService` |
| `backend/repositories/deps.py` | 72 | DI factories never used |
| `backend/db/cleanup.py` | — | Broken: imports non-existent `models.passenger` |
| `backend/test_db.py` | — | Broken: references `u.office_id` which doesn't exist |
| `backend/setup.py` | — | Redundant: superseded by `pyproject.toml`, incomplete |
| `backend/run_regression_tests.py` | — | Duplicates test config, hardcoded credentials |
| `backend/pytest.ini` | 10 | Conflicts with `pyproject.toml` pytest config |

### 2.2 Frontend dead files

| File | Lines | Reason |
|------|-------|--------|
| `src/services/person.service.ts` | ~40 | Never imported |
| `src/lib/package-utils.ts` | ~50 | Never imported |
| `src/lib/trip-formatters.ts` | ~60 | Never imported |
| `src/hooks/use-destination-search.ts` | ~30 | Never imported |
| `src/components/common/ErrorBoundary.tsx` | ~50 | Exported from index.ts but never imported by any page |
| `src/components/common/NotificationModal.tsx` | ~50 | Same |
| `src/components/common/ProfileSkeleton.tsx` | ~20 | Same |
| `src/components/common/ConfirmDialog.tsx` | ~50 | Same |
| `src/components/forms/FormFileUpload.tsx` | 248 | Never imported |
| `src/components/forms/FormRadio.tsx` | 124 | Never imported |
| `src/components/forms/FormSearchSelect.tsx` | 272 | Never imported |
| `src/components/forms/FormTextarea.tsx` | 96 | Never imported |
| `src/components/admin/UserDetail.tsx` | ~100 | Never imported (has its own `getInitials` duplicate) |
| `src/components/admin/RouteScheduleManager.tsx` | ~100 | Never imported |
| `src/components/trips/TripCountdown.tsx` | ~60 | Never imported |
| `src/components/seats/BusTripHeader.tsx` | ~80 | Never imported |
| `src/components/dashboard/MonthlyMetricsChart.tsx` | ~60 | Never imported (chart.js dependency only used here) |
| `src/components/ui/radio-group.tsx` | ~50 | Never imported |
| `src/pages/PackagesPage.tsx` | 110 | Dead page, superseded by `packages/PackagesIndexPage.tsx` |
| `src/pages/TripsPage.tsx` | 125 | Dead page, superseded by `trips/TripsIndexPage.tsx` |
| `query_trips.py` | — | Stray Python script in frontend directory |
| `src/components/clients/ClientFilters.tsx.patch` | — | Leftover patch file |

**Estimated lines removed:** ~2,100 lines frontend + ~250 lines backend

---

## Phase 3 — Remove Unused Imports & Code

> **Priority:** P1  
> **Risk:** Low — just removing unreferenced symbols  

### 3.1 Backend unused imports

| File | Line | Unused Symbol |
|------|------|---------------|
| `routes/auth.py` | 4 | `Dict`, `Any` from typing |
| `routes/auth.py` | 15 | `create_user` from `auth.utils` |
| `routes/auth.py` | 19 | `SecretarySchema` |
| `main.py` | 16 | `SecurityScheme` |
| `services/trip_service.py` | 14-17 | `Seat`, `Ticket`, `Package`, `Person` models |
| `routes/secretary.py` | 23 | `ValidationException` |
| `routes/stats.py` | 13-14 | `RouteModel`, `BusModel` |

### 3.2 Backend unused functions/methods

| File | Lines | Method |
|------|-------|--------|
| `auth/blacklist.py` | 82-98 | `clear_blacklist()` |
| `auth/blacklist.py` | 100-123 | `get_blacklist_stats()` |
| `services/financial_summary_service.py` | 9-48 | `OfficeFinancialSummary`, `WithdrawalRecord` dataclasses |

### 3.3 Backend commented-out code to remove

| File | Lines | Description |
|------|-------|-------------|
| `routes/activities.py` | 12, 54-60 | Commented import and code block |
| `models/package_state_history.py` | 20-22 | Commented-out optional fields |
| `models/ticket_state_history.py` | 20-22 | Same |
| `main.py` | 116-118 | Commented-out v2 API router |
| `db/session.py` | 58 | Commented-out `Base` definition |

### 3.4 Backend duplicate route to remove

| File | Lines | Issue |
|------|-------|-------|
| `routes/client.py` | 168-185 | Duplicate `POST /{client_id}/tickets` — unreachable dead route |

### 3.5 Frontend unused service methods

| File | Unused Methods |
|------|---------------|
| `services/package.service.ts` | `getByTrackingNumber`, `unassignFromTrip`, `getItems`, `addItem`, `updateItem`, `deleteItem`, `getBySender`, `getByRecipient` |
| `services/ticket.service.ts` | `getByClientId`, `getBySeatId` |
| `services/trip.service.ts` | `cancel`, `getSeats` |
| `services/route.service.ts` | `getSchedules`, `createSchedule`, `updateSchedule`, `deleteSchedule`, `search` |
| `services/user-management.service.ts` | `getById`, `getRoles` |
| `services/financial.service.ts` | `getWithdrawalsCsvUrl` |
| `services/driver.service.ts` | `getById`, `create`, `delete` |
| `services/assistant.service.ts` | `getById`, `create`, `update`, `delete` |
| `services/location.service.ts` | `getById` |

### 3.6 Frontend unused lib exports

| File | Unused Exports |
|------|---------------|
| `lib/package-status.ts` | `getTimelineIconBg`, `PACKAGE_STATUS_VALUES`, `PACKAGE_PAYMENT_STATUS_VALUES` |
| `lib/package-constants.ts` | `PACKAGE_STATUSES`, `PACKAGE_STATUS_COLORS`, `PACKAGE_PAYMENT_STATUSES`, `PAYMENT_METHODS`, `PACKAGE_PAYMENT_STATUS_LABELS`, `PAYMENT_METHOD_LABELS` |
| `lib/person-utils.ts` | `getEffectiveFirstName`, `getEffectiveLastName`, `getInitials` |
| `lib/constants.ts` | `PUBLIC_ROUTES` |

---

## Phase 4 — Remove Unused npm Dependencies

> **Priority:** P1  
> **Risk:** Low — these are never imported  

| Package | Type | Reason |
|---------|------|--------|
| `chart.js` | dependency | Never imported in src/ |
| `react-chartjs-2` | dependency | Never imported (was only used by dead `MonthlyMetricsChart.tsx`) |
| `lodash-es` | dependency | Never imported (project uses `lodash`) |
| `@types/lodash-es` | devDependency | Unnecessary since `lodash-es` is unused |

**Action:** `npm uninstall chart.js react-chartjs-2 lodash-es @types/lodash-es`

---

## Phase 5 — Centralize Hardcoded Business Config (Backend)

> **Priority:** P2  
> **Goal:** Create `backend/core/config.py` with all business constants, read from env vars with sensible defaults  

### 5.1 Create centralized config module

Create `backend/core/config.py` with a `Settings` class (or dataclass):

```python
class Settings:
    # App
    APP_NAME: str = "Trans Comarapa API"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = True
    TIMEZONE: str = "America/La_Paz"

    # JWT
    JWT_ALGORITHM: str = "HS256"
    JWT_ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    JWT_REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    JWT_BLACKLIST_EXPIRE_SECONDS: int = 86400  # 24h

    # Database Pool
    DB_POOL_SIZE: int = 10
    DB_MAX_OVERFLOW: int = 20
    DB_POOL_RECYCLE: int = 1800

    # Business Logic
    SEAT_LOCK_TTL_SECONDS: int = 300       # 5 min
    TRIP_MIN_DEPARTURE_BUFFER_MINUTES: int = 30
    TRIP_CONFLICT_BUFFER_HOURS: int = 2
    CASH_REGISTER_HISTORY_DAYS: int = 7
    RATE_LIMIT_AUTH_LOGIN: str = "10/minute"
    RATE_LIMIT_AUTH_REGISTER: str = "3/minute"
    RATE_LIMIT_DEFAULT: str = "100/minute"

    # Email domain
    EMAIL_DOMAIN: str = "transcomarapa.com"

    # Default passwords (for seeding only)
    DEFAULT_OWNER_PASSWORD: str = "socio123"
    DEFAULT_CLIENT_PASSWORD: str = "123456"

    # CORS
    CORS_ORIGINS: str = "http://localhost:3000,http://localhost:5173"
```

All values should be readable from environment variables with the above defaults.

### 5.2 Replace hardcoded values across backend

| Current Location | What to Replace |
|-----------------|-----------------|
| `main.py:54` | `DEBUG` → `settings.DEBUG` |
| `main.py:77` | `title` → `settings.APP_NAME` |
| `main.py:79` | `version` → `settings.APP_VERSION` |
| `main.py:99-106` | CORS origins → parse `settings.CORS_ORIGINS` |
| `auth/jwt.py:21-22` | Algorithm/expiry → `settings.JWT_*` |
| `auth/blacklist.py:33` | Expiry → `settings.JWT_BLACKLIST_EXPIRE_SECONDS` |
| `routes/auth.py:54` | Cookie max-age → `settings.JWT_REFRESH_TOKEN_EXPIRE_DAYS` |
| `routes/auth.py:87,128` | Refresh expiry → `settings.JWT_REFRESH_TOKEN_EXPIRE_DAYS` |
| `routes/auth.py:111,138` | Rate limits → `settings.RATE_LIMIT_*` |
| `services/seat_lock_service.py:15` | TTL → `settings.SEAT_LOCK_TTL_SECONDS` |
| `services/trip_service.py:295` | Departure buffer → `settings.TRIP_MIN_DEPARTURE_BUFFER_MINUTES` |
| `repositories/trip_repository.py:27` | Conflict buffer → `settings.TRIP_CONFLICT_BUFFER_HOURS` |
| `services/cash_register_service.py:171` | History days → `settings.CASH_REGISTER_HISTORY_DAYS` |
| `db/session.py:34-36` | Pool settings → `settings.DB_*` |
| `services/owner_service.py:30,35` | Email domain/password → `settings.EMAIL_DOMAIN`, `settings.DEFAULT_OWNER_PASSWORD` |
| `routes/client.py:64,69,77` | Email domain/password → `settings.EMAIL_DOMAIN` |

### 5.3 Fix inconsistent timezone handling

Many models use naive `datetime.now` while others use `datetime.now(timezone.utc)`. Standardize all models to use `datetime.now(timezone.utc)` with the configured timezone applied at the presentation layer.

**Files to fix:**
- `models/ticket.py:22-23`
- `models/office.py:15-16`
- `models/seat.py:16-17`
- `models/cash_register.py:20,22-23`
- `models/cash_transaction.py:22-23`
- `models/ticket_state_history.py:14`
- `models/package_state_history.py:16`

---

## Phase 6 — Centralize Hardcoded Frontend Constants

> **Priority:** P2  
> **Goal:** Create single source of truth for company data, routes, locale, and timing  

### 6.1 Create `src/lib/company-config.ts`

Centralize all company information:

```typescript
export const COMPANY = {
  name: "Trans Comarapa",
  legalName: 'SINDICATO MIXTO DE TRANSPORTISTAS DE LARGA Y CORTA DISTANCIA "MANUEL MARIA CABALLERO"',
  slogan: "Conectando el corazon de Bolivia con seguridad y confianza",
  domain: "transcomarapa.com",
  heroImages: [
    "/images/buses_challa.jpeg",
    "/images/flota_blanca_rene.png",
    "/images/doble_piso_verde.png",
    "/images/flota roja.jpeg",
  ],
  stats: { locations: 23, years: 10, offices: 4 },
} as const;

export const OFFICES = {
  santa_cruz: {
    name: "Santa Cruz",
    phone: "78175576",
    address: "Av. Doble Via La Guardieza 4to. Anillo",
  },
  comarapa: {
    name: "Comarapa",
    phone: "78175578",
    address: "Av. Comarapa (Mercado Campesino)",
  },
  san_isidro: {
    name: "San Isidro",
    phone: "78515650",
    address: "Av. San Isidro",
  },
  los_negros: {
    name: "Los Negros",
    phone: "69029690",
    address: "Av. Los Negros",
  },
} as const;
```

### 6.2 Replace hardcoded company data in 14+ files

Key files to update:
- `store/app.slice.ts:17` → `COMPANY.name`
- `components/layout/AppSidebar.tsx:37` → `COMPANY.name`
- `pages/LoginPage.tsx:101,121,195` → `COMPANY.name`, `COMPANY.domain`
- `layouts/LoginLayout.tsx:51,62-86` → `COMPANY.*`, `OFFICES`
- `layouts/AuthLayout.tsx:8,17` → `COMPANY.name`
- `components/tickets/TicketDisplay.tsx:107-149` → `COMPANY.*`, `OFFICES`
- `components/packages/receipt/ReceiptDocument.tsx:42-45` → `OFFICES`
- `components/trips/sheet/SheetHeader.tsx:21-26` → `COMPANY.*`, `OFFICES`
- `components/trips/manifest/ManifestHeader.tsx:21-26` → `COMPANY.*`, `OFFICES`
- `components/seats/BusTripHeader.tsx:71-72` → `COMPANY.*`
- `components/packages/receipt/ReceiptHeader.tsx:25-26` → `COMPANY.name`
- `components/dashboard/QuickSearch.tsx:61` → `COMPANY.name`

### 6.3 Create `src/lib/locale-config.ts`

```typescript
export const LOCALE = "es-BO" as const;
export const CURRENCY = "BOB" as const;
```

Replace 30+ scattered `'es-BO'` and `'es-ES'` strings. Pick ONE locale consistently.

### 6.4 Create `src/lib/timing.ts`

Centralize all timeout/interval values:

```typescript
export const TIMING = {
  API_TIMEOUT: 15000,
  SEAT_LOCK_POLL: 3000,
  WS_RECONNECT_DELAY: 3000,
  WS_PING_INTERVAL: 30000,
  DASHBOARD_REFRESH: 5 * 60 * 1000,
  RECENT_SALES_REFRESH: 60000,
  CAROUSEL_INTERVAL: 5000,
  COUNTDOWN_TICK: 1000,
  SEARCH_DEBOUNCE: 300,
  CLIENT_SEARCH_DEBOUNCE: 350,
  TOAST_DURATION: 5000,
} as const;
```

---

## Phase 7 — Fix Hardcoded Office Data (Phone/Address Inconsistency)

> **Priority:** P2  
> **Issue:** Phone numbers are DIFFERENT across components — likely a bug  

### 7.1 Inconsistency found

| Component | Santa Cruz Phone | Comarapa Phone | San Isidro Phone | Los Negros Phone |
|-----------|-----------------|----------------|------------------|------------------|
| `TicketDisplay.tsx` | 781-75576 | 781-75578 | 785-15650 | 690-29690 |
| `ReceiptDocument.tsx` | 68921188 | 68921154 | 71641780 | 71641781 |
| `SheetHeader.tsx` | 78175576 | 781-75578 | — | — |
| `ManifestHeader.tsx` | 78175576 | 781-75578 | — | — |

**These should all be the same.** Need to confirm correct numbers and centralize via `OFFICES` config from Phase 6.

### 7.2 Schedule info hardcoded in multiple places

- `TicketDisplay.tsx:237-240` — Full schedule hardcoded
- `SheetHeader.tsx:32` — Route banner hardcoded
- `ManifestHeader.tsx:32` — Same banner, duplicated

These should be fetched from the backend or at minimum centralized in config.

---

## Phase 8 — Config & Environment Fixes

> **Priority:** P2  

### 8.1 Fix `DEBUG` default inconsistency

| File | Current Default | Should Be |
|------|----------------|-----------|
| `main.py:54` | `"True"` (string) | Read from centralized config |
| `db/session.py:18` | `"False"` | Same config source |
| `routes/auth.py:37` | `"true"` (lowercase) | Same config source |

### 8.2 Create complete `env.example`

Add all missing variables:
- `DATABASE_URL` (currently undocumented but app exits without it)
- `REDIS_URL`
- `JWT_ALGORITHM`
- `JWT_ACCESS_TOKEN_EXPIRE_MINUTES`
- `LOG_LEVEL`
- `TESTING`
- `CORS_ORIGINS`
- `DEBUG`

### 8.3 Create `backend/.env.example` for local dev

### 8.4 Clean up `.gitignore`

Remove Nuxt leftovers (`.nuxt`, `.output`).

### 8.5 Fix `frontend/.dockerignore`

Allow `.env.production` through for Vite build-time vars.

### 8.6 Fix Makefile

Replace `pip install -r requirements.txt` with `uv sync` in `update-deps` target.

### 8.7 Fix Docker entrypoint

Replace fragile `sleep 10` with proper MySQL health check loop.

### 8.8 Production compose fixes

- Remove exposed MySQL port (`3308:3306`)
- Add `TZ=America/La_Paz` to all services
- Remove deprecated `version: '3.8'`

---

## Phase 9 — Fix Security Issues

> **Priority:** P2 (HIGH)  

### 9.1 Add authentication to unprotected endpoints

**Files with ZERO auth on all endpoints:**
- `routes/driver.py` — CRUD operations unprotected
- `routes/assistant.py` — CRUD operations unprotected
- `routes/client.py` — Including client creation with auto-generated users
- `routes/location.py` — All unprotected
- `routes/seat.py` — All unprotected

**Fix:** Add `current_user: DBUser = Depends(get_current_user)` + role checks to all endpoints.

### 9.2 Fix WebSocket authentication bypass

**File:** `routes/seat_lock.py:127-128`

Currently takes `user_id` from query params with NO JWT validation. Anyone can impersonate any user.

**Fix:** Validate JWT token from WebSocket handshake (query param or header).

### 9.3 Fix weak auto-generated client credentials

**File:** `routes/client.py:74-77`

- Uses document ID as password (easily guessable)
- Falls back to `"default_password_123"`

**Fix:** Generate secure random passwords, force change on first login.

### 9.4 Fix information leakage

**File:** `routes/location.py:37,152` — Returns raw exception messages.

**Fix:** Log the exception, return generic error to client.

### 9.5 Fix health check connection leak

**File:** `main.py:176-179`

If `db.execute()` throws, `db.close()` is never called.

**Fix:** Use `try/finally` or context manager.

### 9.6 Restrict CORS in production

**File:** `main.py:107-110`

`allow_methods=["*"]` and `allow_headers=["*"]` are too permissive.

**Fix:** Whitelist specific methods and headers.

---

## Phase 10 — Fix Architecture Violations

> **Priority:** P3 (this is the largest effort, can be done incrementally)  

### 10.1 Refactor `stats.py` (2,727 lines → ~300 lines)

This is the single biggest architecture violation:
- All business logic in routes, no service/repository layer
- `month_names` array copy-pasted ~15 times
- Monthly data generation pattern duplicated ~15 times
- `CashSummaryResponse` class defined twice
- N+1 queries in loops

**Approach:**
1. Create `services/stats_service.py` with extracted business logic
2. Create `repositories/stats_repository.py` for data access
3. Extract shared helpers: `get_date_range()`, `calculate_trend()`, `generate_monthly_data()`
4. Define schemas in `schemas/stats.py`
5. Make routes thin: just call service, return result

### 10.2 Refactor legacy CRUD routes to Service → Repository

**Files to refactor:**
1. `routes/driver.py` — Direct `db.query()` → `DriverService` + `DriverRepository`
2. `routes/assistant.py` — Same pattern
3. `routes/secretary.py` — Same pattern
4. `routes/client.py` — Same pattern (includes user creation logic)
5. `routes/location.py` — Same pattern
6. `routes/seat.py` — Same pattern
7. `routes/persons.py` — Same pattern
8. `routes/administrator.py` — Same pattern

**Approach:** One route file at a time, creating service + repository + tests.

### 10.3 Remove business logic from models

**File:** `models/user.py`

- `verify_password()`, `get_password_hash()`, `set_password()` should be in services
- Duplicate `CryptContext` instantiation (also in `core/security.py`)
- `effective_firstname`, `effective_lastname`, `full_name` properties with fallback logic

---

## Phase 11 — Frontend Cleanup: Types, Stores, Services

> **Priority:** P3  

### 11.1 Remove unused store selectors and actions

| Store File | Unused Exports |
|-----------|---------------|
| `store/app.slice.ts` | `setLoading`, `addNotification`, `removeNotification`, `selectAppName`, `selectIsLoading`, `selectNotifications` |
| `store/stats.slice.ts` | `clearStatsError`, `selectDashboardStats` |
| `store/trip.slice.ts` | `clearCurrentTrip`, `selectTripTotal` |
| `store/bus.slice.ts` | `clearCurrentBus` |
| `store/route.slice.ts` | `clearCurrentRoute` |
| `store/package.slice.ts` | `clearCurrentPackage`, `selectPackagePagination`, `selectIsLoading` |
| `store/location.slice.ts` | `selectLocationLoading` |
| `store/secretary.slice.ts` | `selectSecretaryLoading` |
| `store/ticket.slice.ts` | `selectTicketLoading` |

### 11.2 Remove unused type definitions

| File | Unused Types |
|------|-------------|
| `types/index.ts` | `User`, `PaginatedResponse<T>`, `ApiErrorClass` |
| `types/client.ts` | `ClientRecord` (duplicate) |
| `types/trip.ts` | `TripQueryParams` (duplicate of service's version) |
| `types/cash-register.ts` | `CashRegisterWithTransactions` |

### 11.3 Fix duplicate interfaces

- `PackageItem` defined in both `types/package.ts` and `lib/package-utils.ts`
- `Secretary` defined in both `types/secretary.ts` and `services/secretary.service.ts`
- `TripQueryParams` defined in both `types/trip.ts` and `services/trip.service.ts`
- `getInitials` defined in 4 separate files

### 11.4 Remove unused CSS

| File | Unused Class |
|------|-------------|
| `styles/globals.css:139-152` | `.force-center-login` |
| `styles/globals.css:154-158` | `.login-content-wrapper` |

### 11.5 Remove unused `stats.service.ts` methods

**File:** `services/stats.service.ts` — ~30 methods never called externally. These are internal implementation details exposed as public API. Consider making them private or removing if truly unused.

---

## Phase 12 — Code Quality & Consistency

> **Priority:** P3  

### 12.1 Standardize API response formats

Currently mixed: some routes return schemas, others return `Dict[str, Any]`, others return raw dicts.

**Approach:** Define standard response wrappers in `schemas/base.py`.

### 12.2 Standardize error language

Mix of Spanish and English error messages. Pick one (Spanish for user-facing, English for internal).

### 12.3 Standardize HTTP methods

Inconsistent use of PUT vs PATCH for updates. Pick one convention (PATCH for partial updates).

### 12.4 Extract hardcoded hex colors into Tailwind theme

100+ instances of arbitrary colors like `text-[#1a365d]`, `bg-[#16499B]`, etc. Define as CSS custom properties or Tailwind theme tokens.

### 12.5 Centralize route paths in frontend

40+ hardcoded navigation paths scattered across components. Create `src/lib/routes.ts` with all path constants.

### 12.6 Fix frontend `financial.service.ts:77`

Uses hardcoded `/api/v1/` instead of `API_BASE_URL`.

---

## Implementation Order

```
Phase 1  → Fix production-breaking issues (P0, immediate)
Phase 2  → Delete dead files (P1, quick wins, ~2,350 lines removed)
Phase 3  → Remove unused imports/code (P1, quick wins)
Phase 4  → Remove unused npm packages (P1, 1 command)
Phase 5  → Centralize backend config (P2, reduces hardcoding by ~40 instances)
Phase 6  → Centralize frontend constants (P2, reduces hardcoding by ~50 instances)
Phase 7  → Fix phone/address inconsistency (P2, data bug fix)
Phase 8  → Config & environment fixes (P2, dev experience)
Phase 9  → Security fixes (P2, important)
Phase 10 → Architecture violations (P3, largest effort, do incrementally)
Phase 11 → Frontend type/store cleanup (P3, reduce confusion)
Phase 12 → Code quality consistency (P3, ongoing)
```

---

## Verification Checklist

After each phase:

- [ ] `cd backend && pytest -v --cov=.` passes
- [ ] `cd frontend && npm run lint` passes
- [ ] `cd frontend && npx tsc --noEmit` passes
- [ ] `docker compose up` starts without errors
- [ ] Manual smoke test: login, create ticket, view dashboard
