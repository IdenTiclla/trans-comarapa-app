---
name: Backend Development conventions
description: Core conventions and architecture rules for Python/FastAPI backend development in this project.
---

# Backend Architecture & Conventions

This skill defines the strict architectural rules that must be followed when working on the backend of the `trans-comarapa-app` project. The project is transitioning from fat routes to a clean Service-Repository architecture.

## 1. Directory Structure

- `backend/core/`: Configuration, enums, exceptions, and state machines.
- `backend/models/`: SQLAlchemy ORM models.
- `backend/schemas/`: Pydantic schemas for request/response validation.
- `backend/repositories/`: Data access logic (CRUD operations).
- `backend/services/`: **All business logic goes here**.
- `backend/routes/`: FastAPI routers. Should only contain thin adapters.

## 2. Core Principles

### 2.1 Services & Repositories (CRITICAL)
**Never put business logic in FastAPI route functions (`backend/routes/`).**
- Routes should be extremely thin: receive request -> call service -> return response.
- Use the Repository pattern for all database access. Repositories (`backend/repositories/`) should inherit from `BaseRepository`.
- Services (`backend/services/`) handle rules, validation, and orchestrate repositories.
- Services should act on a single database transaction level where possible. They initiate `db.commit()` only when the whole operation succeeds. Repositories should only use `db.flush()`.

### 2.2 Exceptions
Use domain-specific exceptions defined in `backend/core/exceptions.py` instead of returning generic HTTP exceptions directly from services.
- `AppException` (base class)
- `NotFoundException`
- `ValidationException`
- `ConflictException`
- `InvalidStateTransitionException`

The global exception handler (`backend/core/exception_handlers.py`) will automatically map these to appropriate HTTP status codes (e.g., 404, 400, 409).

### 2.3 Enums
Do not use "magic strings" for statuses, methods or states. 
- Always use the predefined Enums from `backend/core/enums.py` (e.g. `TicketState`, `PackageStatus`, `TripStatus`, `PaymentMethod`).

### 2.4 State Machines
When changing the status of an entity (e.g., Tickets, Packages, Trips), validate the transition using `backend/core/state_machines.py` to ensure it follows the allowed workflow before applying the change.
- Never write `if current_state == 'x'` inline logic. Use `validate_transition()`.

### 2.5 Logging
Do absolutely not use `print()` statements for debugging or information logging in production code.
- Import the configured logger: `import logging`, `logger = logging.getLogger(__name__)`.
- Use `logger.info()`, `logger.warning()`, `logger.error()`, or `logger.debug()` as appropriate.

## 3. Implementation Example

**Thin Route (`routes/item.py`)**:
```python
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from schemas.item import ItemCreate, ItemResponse
from services.item_service import ItemService
from db.session import get_db

router = APIRouter(tags=["Items"])

def get_service(db: Session = Depends(get_db)) -> ItemService:
    return ItemService(db)

@router.post("", response_model=ItemResponse, status_code=201)
async def create_item(data: ItemCreate, service: ItemService = Depends(get_service)):
    return service.create_item(data)
```

**Service (`services/item_service.py`)**:
```python
from sqlalchemy.orm import Session
from repositories.item_repository import ItemRepository
from core.exceptions import ValidationException

class ItemService:
    def __init__(self, db: Session):
        self.db = db
        self.item_repo = ItemRepository(db)
        
    def create_item(self, data):
        # Business logic here
        if data.price < 0:
            raise ValidationException("Price cannot be negative")
            
        item = self.item_repo.create(data.dict())
        self.db.commit()
        return item
```

## 4. Code Reusability & Best Practices

To ensure long-term maintainability, adhere to the following clean code and reusability guidelines:

- **DRY (Don't Repeat Yourself)**:
  - **Shared DB queries**: Put them in the specific repository (e.g., `ticket_repository.py`) and reuse them across services. Do not duplicate query logic.
  - **Helper Functions**: Pure business-agnostic formatting or calculation logic should be moved to a `utils.py` or `core/utils/` module.
- **Dependency Injection**: Always use FastAPI's `Depends()` for injecting database sessions and Services into routers. Services should inject repositories in their `__init__`.
- **Early Returns**: Flatten your code by validating and raising exceptions early, avoiding deep `if-else` blocks.
  ```python
  # BAD
  if user:
      if user.is_active:
          do_something()
          
  # GOOD
  if not user:
      raise NotFoundException("User not found")
  if not user.is_active:
      raise ValidationException("User is not active")
  do_something()
  ```
- **Type Hinting**: Python type hinting is **mandatory**. Every function parameter and return value must have a type annotation. Use Pydantic schemas for data validation and parsing.
- **Descriptive Naming**: Variables and functions must immediately describe their intention. Methods in repositories should be clear (e.g., `get_active_tickets_by_trip_id`, not `get_tickets`).
