from pydantic import BaseModel, Field
from typing import Optional
from schemas.person import PersonBase, PersonCreate, PersonResponse, PersonUpdate, OwnerResponse, OwnerUpdate

class OwnerCreate(PersonCreate):
    """
    Esquema para crear un nuevo dueño/socio.
    """
    pass  # Hereda todos los campos de PersonCreate

# Alias para compatibilidad hacia atrás y simplicidad
Owner = OwnerResponse
OwnerPatch = OwnerUpdate

class OwnerBase(PersonBase):
    """
    Esquema base para dueños.
    """
    pass
