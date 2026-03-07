# State Machines - Trans Comarapa

All state transitions are enforced by `backend/core/state_machines.py` using `validate_transition()`. Direct string comparisons for state changes are prohibited — always use the state machine.

Source enums: `backend/core/enums.py`

## Ticket States

```
pending ──────> confirmed ──────> completed
   │                │
   │                │
   v                v
cancelled       cancelled
```

| From | Allowed Transitions |
|------|-------------------|
| `pending` | `confirmed`, `cancelled` |
| `confirmed` | `completed`, `cancelled` |
| `cancelled` | _(terminal)_ |
| `completed` | _(terminal)_ |

**Business context:**
- `pending` = reservation (seat is held but not paid)
- `confirmed` = paid/sold ticket
- `completed` = passenger traveled (trip finished)
- `cancelled` = ticket voided (seat released)

**API operations:**
- Create reservation: `POST /api/v1/tickets` with `state: "pending"`
- Confirm sale: `PUT /api/v1/tickets/{id}` with `state: "confirmed"`
- Cancel: `PUT /api/v1/tickets/{id}/cancel`

## Package Statuses

```
registered_at_office ──> assigned_to_trip ──> in_transit ──> arrived_at_destination ──> delivered
                              │
                              v
                    registered_at_office
                    (unassign from trip)
```

| From | Allowed Transitions |
|------|-------------------|
| `registered_at_office` | `assigned_to_trip` |
| `assigned_to_trip` | `in_transit`, `registered_at_office` |
| `in_transit` | `arrived_at_destination` |
| `arrived_at_destination` | `delivered` |
| `delivered` | _(terminal)_ |

**Payment statuses** (separate from delivery status):
- `paid_on_send` — sender pays at origin
- `collect_on_delivery` — recipient pays at destination

## Trip Statuses

```
scheduled ──> boarding ──> departed ──> arrived
    │             │
    │             v
    │         cancelled
    │             ^
    v             │
  delayed ───────┘
    │
    v
  boarding / departed / cancelled
```

| From | Allowed Transitions |
|------|-------------------|
| `scheduled` | `boarding`, `departed`, `departed`, `cancelled`, `delayed` |
| `boarding` | `departed`, `cancelled`, `delayed` |
| `departed` | `arrived` |
| `arrived` | _(terminal)_ |
| `cancelled` | _(terminal)_ |
| `delayed` | `boarding`, `departed`, `cancelled` |

## Payment Methods

Not a state machine, but a fixed enum:
- `cash`
- `transfer`
- `qr`

## Implementation Details

```python
# Usage in services:
from core.state_machines import validate_transition, TICKET_TRANSITIONS

validate_transition(
    entity="ticket",
    transitions=TICKET_TRANSITIONS,
    current_state=ticket.state,
    target_state=new_state,
)
# Raises InvalidStateTransitionException if not allowed
```
