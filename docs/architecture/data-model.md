# Data Model - Trans Comarapa

## Entity Overview (22 models)

### Person & Role Hierarchy

All user-facing roles inherit from `Person` (name, CI, phone, etc.) and link to a `User` account (email, password hash, role).

```
Person (base)
├── Administrator  →  User (role: admin)
├── Secretary      →  User (role: secretary)    →  Office
├── Driver         →  User (role: driver)
├── Assistant      →  User (role: assistant)
└── Client         →  User (role: client)
```

| Model | Key Fields | Notes |
|-------|-----------|-------|
| `Person` | id, name, last_name, ci, phone, address | Base for all roles |
| `User` | id, email, hashed_password, role, is_active, person_id | Auth account |
| `Administrator` | person_id (FK) | |
| `Secretary` | person_id (FK), office_id (FK) | Assigned to an office |
| `Driver` | person_id (FK), license_number | |
| `Assistant` | person_id (FK) | |
| `Client` | person_id (FK) | Can be created during ticket sale |

### Transport Infrastructure

| Model | Key Fields | Relationships |
|-------|-----------|---------------|
| `Office` | id, name, address, location_id | Has many Secretaries |
| `Location` | id, name, department, province | Used by Routes and Offices |
| `Route` | id, name, estimated_duration, distance, price | N:M with Locations via `route_locations` |
| `RouteSchedule` | id, route_id, departure_time, days_of_week | Scheduled departures for a Route |
| `Bus` | id, plate_number, model, brand, total_seats, num_decks | Has many Seats |
| `Seat` | id, bus_id, seat_number, deck, row, column, is_active | Physical seat layout |

### Operations

| Model | Key Fields | Relationships |
|-------|-----------|---------------|
| `Trip` | id, bus_id, route_id, driver_id, assistant_id, departure_date, departure_time, status, price | Central operational entity |
| `Ticket` | id, trip_id, client_id, seat_id, secretary_id, state, payment_method, price | Links client to seat on a trip |
| `TicketStateHistory` | id, ticket_id, previous_state, new_state, changed_by, created_at | Audit trail for ticket state changes |
| `Package` | id, trip_id, sender_id, recipient_id, secretary_id, status, payment_status, total_price | Cargo/encomienda |
| `PackageItem` | id, package_id, description, quantity, weight | Individual items in a package |
| `PackageStateHistory` | id, package_id, previous_status, new_status, changed_by, created_at | Audit trail for package status changes |
| `Activity` | id, user_id, action, entity_type, entity_id, details, created_at | System-wide audit log |

## Entity Relationship Summary

```
Office ──1:N──> Secretary
Location ──1:N──> Office
Route <──N:M──> Location (via route_locations)
RouteSchedule ──N:1──> Route

Bus ──1:N──> Seat

Trip ──N:1──> Bus
Trip ──N:1──> Route
Trip ──N:1──> Driver
Trip ──N:1──> Assistant (optional)

Ticket ──N:1──> Trip
Ticket ──N:1──> Client
Ticket ──N:1──> Seat
Ticket ──N:1──> Secretary
Ticket ──1:N──> TicketStateHistory

Package ──N:1──> Trip
Package ──N:1──> Client (sender)
Package ──N:1──> Client (recipient)
Package ──N:1──> Secretary
Package ──1:N──> PackageItem
Package ──1:N──> PackageStateHistory

Activity ──N:1──> User
```

## Key Business Rules

- A **Seat** can only be sold once per **Trip** (unique constraint on trip_id + seat_id)
- **Tickets** start as `pending` (reservation) and transition through the state machine (see [state-machines.md](state-machines.md))
- **Packages** require a sender and recipient (both `Client` records)
- **Trips** have a status lifecycle: scheduled → boarding → departed → arrived
- A **Client** can be created inline during ticket sale if not already registered
- **Secretary** is the primary operational role — creates tickets, packages, and manages trips
