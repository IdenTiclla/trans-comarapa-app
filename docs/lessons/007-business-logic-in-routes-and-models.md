# Lesson 007: Lógica de negocio en modelos y rutas "fat"

**Fecha:** 2026-05-06
**Contexto:** Refactorización de arquitectura — migrando lógica de negocio desde rutas y modelos hacia la capa Service → Repository

## Error

```python
# MAL — Lógica de negocio directamente en la ruta
@router.post("", response_model=DriverSchema)
def create_driver(driver: DriverCreate, db: Session = Depends(get_db)):
    existing = db.query(Driver).filter(Driver.license_number == driver.license_number).first()
    if existing:
        raise HTTPException(status_code=409, detail="License number already exists.")
    new_driver = Driver(**driver.model_dump())
    db.add(new_driver)
    db.commit()
    db.refresh(new_driver)
    return new_driver
```

```python
# MAL — Hashing de contraseñas en el modelo
class User(Base):
    _pwd_context = CryptContext(schemes=["sha256_crypt"], ...)
    
    @staticmethod
    def get_password_hash(password):
        return _get_password_hash(password)
```

**Resultado:** Modelos con responsabilidades múltiples, rutas de 2700+ líneas con patrones duplicados 14 veces, imposible de testear sin base de datos.

## Causa raíz

La ausencia de capas Service y Repository forzó la acumulación de lógica de validación, acceso a datos y orquestación directamente en las rutas HTTP y modelos ORM. Esto viola el principio de responsabilidad única y hace imposible escribir tests unitarios aislados.

## Solución

```python
# BIEN — Ruta delgada que delega al servicio
@router.post("", response_model=DriverSchema)
def create_driver(driver: DriverCreate, service: DriverService = Depends(get_service)):
    return service.create(driver.model_dump())

# BIEN — Servicio con lógica de negocio y DI para testear
class DriverService:
    def __init__(self, db: Session, repo: DriverRepository | None = None):
        self.db = db
        self.repo = repo or DriverRepository(db)
    
    def create(self, data: dict) -> Driver:
        if data.get("license_number"):
            existing = self.repo.get_by_license_number(data["license_number"])
            if existing:
                raise ConflictException("License number already exists.")
        driver = Driver(**data)
        self.repo.create(driver)
        self.db.commit()
        return driver

# BIEN — Importar hashing desde core.security, no desde el modelo
from core.security import get_password_hash
hashed = get_password_hash("mypassword")
```

## Regla

Siempre seguir la arquitectura Route → Service → Repository. Las rutas nunca deben contener `db.query()`, `db.commit()`, ni lógica de validación. Los modelos solo definen estructura de datos. El hashing de contraseñas vive en `core/security.py`, no en los modelos.
