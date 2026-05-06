# Naming Conventions

## Backend

| Type | Pattern | Example |
|------|---------|---------|
| Model | `class [Entity](Base)` | `class Ticket(Base)` |
| Schema | `[Entity]Create/Update` | `TicketCreate` |
| Route | `routes/[entity].py` | `routes/ticket.py` |
| Service | `services/[entity]_service.py` | `services/ticket_service.py` |
| Repository | `repositories/[entity]_repository.py` | `repositories/ticket_repository.py` |

### HTTP Methods

- **PATCH** for partial updates (e.g., status changes, single field updates)
- **PUT** for full resource replacement
- **POST** for creation and action endpoints (e.g., `/dispatch`, `/cancel`)

> **Note:** Some legacy endpoints use PUT for partial updates. New endpoints should follow the PATCH convention.

## Frontend React

| Type | Pattern | Example |
|------|---------|---------|
| Service | `[entity].service.ts` | `ticket.service.ts` |
| Store | `[entity].slice.ts` | `ticket.slice.ts` |
| Page | `[Entity]Page.tsx` | `TripDetailPage.tsx` |
| Hook | `use-[name].ts` | `use-trip-details.ts` |
| Component | `[PascalCase].tsx` | `BusSeatGrid.tsx` |
