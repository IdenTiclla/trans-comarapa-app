from pydantic import BaseModel, ConfigDict, Field
from datetime import date, datetime
from typing import Optional
from schemas.person import PersonBase, PersonCreate, Person as PersonSchema

class SecretaryBase(PersonBase):
    """
    Esquema base para secretarios, hereda de PersonBase.
    """
    office_id: Optional[int] = Field(None, description="Secretary's office ID", json_schema_extra={"example": 1})

class SecretaryCreate(PersonCreate, SecretaryBase):
    """
    Esquema para crear un nuevo secretario.
    """
    pass

class SecretaryUpdate(BaseModel):
    firstname: Optional[str] = Field(None, max_length=100, description="First name")
    lastname: Optional[str] = Field(None, max_length=100, description="Last name")
    phone: Optional[str] = Field(None, max_length=20, description="Phone number")
    birth_date: Optional[date] = Field(None, description="Birth date")
    office_id: Optional[int] = Field(None, description="Office ID")

class Secretary(PersonSchema, SecretaryBase):
    """
    Esquema para representar un secretario.
    """
    model_config = ConfigDict(from_attributes=True, arbitrary_types_allowed=True)

# Importación al final para evitar ciclos de importación
from schemas.auth import User
