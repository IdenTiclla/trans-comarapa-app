# Plan de Refactorización Arquitectónica: Patrón Repositorio Estricto

## Descripción del Problema
Actualmente, la capa de Servicios (`backend/services/*.py`) está violando el patrón arquitectónico al interactuar directamente con la sesión de la base de datos (`self.db.query`, `self.db.add`, `self.db.delete`). Esto crea una abstracción con fugas (Leaky Abstraction), acoplando la lógica de negocio con SQLAlchemy y haciendo que los Repositorios pierdan su propósito.

## Objetivo
Refactorizar todos los servicios para que utilicen exclusivamente la capa de Repositorios para las operaciones de base de datos, manteniendo la responsabilidad de la transacción (`self.db.commit()`) en el Servicio.

## Tareas por Módulo

### 1. Creación de Repositorios Faltantes
Varios servicios no tienen un repositorio correspondiente. Se deben crear en `backend/repositories/`:
- [NEW] `route_repository.py`: Para `RouteModel`, `RouteScheduleModel` y `LocationModel`.
- [NEW] `owner_repository.py`: Para `Owner`.
- [NEW] `person_repository.py`: Para `Person`, `Administrator`, `Client`, `Driver`, `Secretary`, etc.
- [NEW] `seat_lock_repository.py`: Para `SeatLock`.
- [NEW] `report_repository.py`: Para manejar las consultas complejas de `report_service.py` y `financial_summary_service.py`.

### 2. Refactorización de Repositorios Existentes
Mover toda la lógica de construcción de queries (filtros, joins) desde los servicios a métodos específicos en los repositorios.
- [MODIFY] `bus_repository.py`: Añadir métodos como `check_license_plate_exists`.
- [MODIFY] `cash_register_repository.py`: Mover las queries de `cash_register_service.py`.
- [MODIFY] `office_repository.py`: Mover las queries de `office_service.py`.
- [MODIFY] `package_repository.py`: Mover las queries de `package_service.py`.
- [MODIFY] `ticket_repository.py`: Mover las queries de `ticket_service.py`.
- [MODIFY] `trip_repository.py`: Mover las queries de `trip_service.py`.
- [MODIFY] `user_repository.py`: Mover las queries de `auth_service.py` y `user_management_service.py`.

### 3. Refactorización de Servicios (Eliminación de leaks)
Reemplazar todos los `self.db.query`, `self.db.add`, `self.db.delete` por llamadas a `self.repo`.
- [MODIFY] `auth_service.py`
- [MODIFY] `bus_service.py`
- [MODIFY] `cash_register_service.py`
- [MODIFY] `financial_summary_service.py`
- [MODIFY] `office_service.py`
- [MODIFY] `owner_financial_service.py`
- [MODIFY] `owner_service.py`
- [MODIFY] `package_service.py`
- [MODIFY] `person_service.py`
- [MODIFY] `report_service.py`
- [MODIFY] `route_service.py`
- [MODIFY] `seat_lock_service.py`
- [MODIFY] `ticket_service.py`
- [MODIFY] `trip_service.py`
- [MODIFY] `user_management_service.py`

> [!IMPORTANT]
> **Regla de Oro:** La palabra `query`, `add` o `delete` vinculada a `self.db` NUNCA debe aparecer en los servicios después de la refactorización. Los servicios solo llamarán a `self.repo.metodo()` y a `self.db.commit()`.

## Plan de Verificación

### Automated Tests
- Ejecutar la suite de pruebas unitarias y de integración para asegurar que ninguna funcionalidad se ha roto (`make test`).

### Manual Verification
- Levantar el entorno (`make up`) y probar los endpoints principales (crear bus, crear viaje, vender boleto) desde Swagger para confirmar que la persistencia y validaciones funcionan correctamente.
