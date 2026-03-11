# API Reference - Trans Comarapa

Base URL: `http://localhost:8000/api/v1`

Interactive docs: `http://localhost:8000/docs` (Swagger UI)

## Authentication

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/auth/login` | Login with email/password, returns JWT tokens | No |
| POST | `/auth/logout` | Invalidate current token (Redis blacklist) | Yes |
| POST | `/auth/refresh` | Refresh access token | Yes |

## User Management

| Method | Endpoint | Description | Roles |
|--------|----------|-------------|-------|
| GET | `/users` | List all users | Admin |
| GET | `/users/{id}` | Get user by ID | Admin |
| PUT | `/users/{id}` | Update user | Admin |
| DELETE | `/users/{id}` | Delete user | Admin |
| GET | `/users/me/profile` | Get current user profile | Any |
| PUT | `/users/me/profile` | Update current user profile | Any |

## Role-Specific User CRUD

| Method | Endpoint | Description | Roles |
|--------|----------|-------------|-------|
| GET | `/administrators` | List administrators | Admin |
| POST | `/administrators` | Create administrator | Admin |
| GET | `/secretaries` | List secretaries | Admin |
| POST | `/secretaries` | Create secretary | Admin |
| GET | `/drivers` | List drivers | Admin, Secretary |
| POST | `/drivers` | Create driver | Admin |
| GET | `/assistants` | List assistants | Admin, Secretary |
| POST | `/assistants` | Create assistant | Admin |
| GET | `/clients` | List clients | Admin, Secretary |
| POST | `/clients` | Create client | Admin, Secretary |
| GET | `/clients/{id}` | Get client by ID | Admin, Secretary |

## Persons

| Method | Endpoint | Description | Roles |
|--------|----------|-------------|-------|
| GET | `/persons` | List all persons | Admin, Secretary |
| GET | `/persons/search` | Search persons by name/CI | Admin, Secretary |

## Trips

| Method | Endpoint | Description | Roles |
|--------|----------|-------------|-------|
| GET | `/trips` | List trips (filterable by date, status, route) | Any authenticated |
| POST | `/trips` | Create trip | Admin, Secretary |
| GET | `/trips/{id}` | Get trip details (includes bus, route, driver) | Any authenticated |
| PUT | `/trips/{id}` | Update trip | Admin, Secretary |
| DELETE | `/trips/{id}` | Delete trip | Admin |
| PUT | `/trips/{id}/status` | Update trip status | Admin, Secretary, Driver |

## Tickets

| Method | Endpoint | Description | Roles |
|--------|----------|-------------|-------|
| GET | `/tickets` | List tickets (filterable) | Admin, Secretary |
| POST | `/tickets` | Create ticket (reserve or sell) | Secretary |
| GET | `/tickets/{id}` | Get ticket details | Admin, Secretary, Client (own) |
| PUT | `/tickets/{id}` | Update ticket (confirm, change payment) | Secretary |
| PUT | `/tickets/{id}/cancel` | Cancel ticket | Secretary |

## Seats

| Method | Endpoint | Description | Roles |
|--------|----------|-------------|-------|
| GET | `/seats/bus/{bus_id}` | Get all seats for a bus | Any authenticated |
| GET | `/seats/trip/{trip_id}` | Get seat availability for a trip | Any authenticated |
| GET | `/seats/{id}` | Get seat by ID | Any authenticated |

## Buses

| Method | Endpoint | Description | Roles |
|--------|----------|-------------|-------|
| GET | `/buses` | List buses | Admin, Secretary |
| POST | `/buses` | Create bus | Admin |
| GET | `/buses/{id}` | Get bus details | Admin, Secretary |
| PUT | `/buses/{id}` | Update bus | Admin |
| DELETE | `/buses/{id}` | Delete bus | Admin |

## Routes

| Method | Endpoint | Description | Roles |
|--------|----------|-------------|-------|
| GET | `/routes` | List routes | Any authenticated |
| POST | `/routes` | Create route | Admin |
| GET | `/routes/{id}` | Get route details | Any authenticated |
| PUT | `/routes/{id}` | Update route | Admin |
| DELETE | `/routes/{id}` | Delete route | Admin |

## Locations

| Method | Endpoint | Description | Roles |
|--------|----------|-------------|-------|
| GET | `/locations` | List locations | Any authenticated |
| POST | `/locations` | Create location | Admin |
| GET | `/locations/{id}` | Get location by ID | Any authenticated |

## Packages

| Method | Endpoint | Description | Roles |
|--------|----------|-------------|-------|
| GET | `/packages` | List packages (filterable) | Admin, Secretary |
| POST | `/packages` | Create package with items | Secretary |
| GET | `/packages/{id}` | Get package details | Admin, Secretary |
| PUT | `/packages/{id}` | Update package | Secretary |
| PUT | `/packages/{id}/status` | Update package status | Secretary |

## Statistics

| Method | Endpoint | Description | Roles |
|--------|----------|-------------|-------|
| GET | `/stats/dashboard` | Consolidated dashboard stats | Admin, Secretary |
| GET | `/stats/tickets/stats` | Ticket analytics | Admin, Secretary |
| GET | `/stats/packages/stats` | Package analytics | Admin, Secretary |
| GET | `/stats/trips/stats` | Trip analytics | Admin, Secretary |
| GET | `/stats/sales/recent` | Recent sales | Admin, Secretary |
| GET | `/stats/sales/summary` | Sales summary by period | Admin, Secretary |

## Activities (Audit Log)

| Method | Endpoint | Description | Roles |
|--------|----------|-------------|-------|
| GET | `/activities` | List activity log entries | Admin |

## Common Query Parameters

Many list endpoints support:
- `page` / `per_page` — Pagination (default: page=1, per_page=20)
- `search` — Text search across relevant fields
- `date_from` / `date_to` — Date range filtering
- `status` / `state` — Filter by entity status

## Error Responses

All errors follow this format:

```json
{
  "detail": "Human-readable error message"
}
```

| HTTP Code | Meaning |
|-----------|---------|
| 400 | Validation error or invalid state transition |
| 401 | Unauthenticated (missing/expired token) |
| 403 | Forbidden (insufficient role) |
| 404 | Entity not found |
| 409 | Conflict (duplicate entry) |
| 422 | Pydantic validation failure |

## Test Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin1@transcomarapa.com | 123456 |
| Secretary | secretary1@transcomarapa.com | 123456 |
| Client | client1@transcomarapa.com | 123456 |
| Driver | driver1@transcomarapa.com | 123456 |
| Assistant | assistant1@transcomarapa.com | 123456 |
