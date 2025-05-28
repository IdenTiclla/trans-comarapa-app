from pydantic import Field
from datetime import datetime
from typing import Optional
from schemas.person import PersonBase, PersonCreate, Person as PersonSchema

class SecretaryBase(PersonBase):
    """
    Esquema base para secretarios, hereda de PersonBase.
    """
    # Campos específicos de Secretary
    office_id: Optional[int] = Field(None, description="Secretary's office ID", example=1)

class SecretaryCreate(PersonCreate, SecretaryBase):
    """
    Esquema para crear un nuevo secretario.
    """
    pass

class Secretary(PersonSchema, SecretaryBase):
    """
    Esquema para representar un secretario.
    """
    class Config:
        from_attributes = True
        arbitrary_types_allowed = True

# Importación al final para evitar ciclos de importación
from schemas.auth import User
