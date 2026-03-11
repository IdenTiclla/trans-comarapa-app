# Naming Conventions

## Backend

| Type | Pattern | Example |
|------|---------|---------|
| Model | `class [Entity](Base)` | `class Ticket(Base)` |
| Schema | `[Entity]Create/Update` | `TicketCreate` |
| Route | `routes/[entity].py` | `routes/ticket.py` |
| Service | `services/[entity]_service.py` | `services/ticket_service.py` |
| Repository | `repositories/[entity]_repository.py` | `repositories/ticket_repository.py` |

## Frontend React

| Type | Pattern | Example |
|------|---------|---------|
| Service | `[entity].service.ts` | `ticket.service.ts` |
| Store | `[entity].slice.ts` | `ticket.slice.ts` |
| Page | `[Entity]Page.tsx` | `TripDetailPage.tsx` |
| Hook | `use-[name].ts` | `use-trip-details.ts` |
| Component | `[PascalCase].tsx` | `BusSeatGrid.tsx` |
