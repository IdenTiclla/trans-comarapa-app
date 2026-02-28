from pydantic import BaseModel, Field, ConfigDict
from typing import Optional
from datetime import datetime, date
from enum import Enum

class PersonType(str, Enum):
    DRIVER = "driver"
    CLIENT = "client"
    SECRETARY = "secretary"
    ASSISTANT = "assistant"
    ADMINISTRATOR = "administrator"

class PersonBase(BaseModel):
    """
    Esquema base para el modelo Person unificado.
    """
    firstname: Optional[str] = Field(None, max_length=100, description="Person's first name", json_schema_extra={"example": "John"})
    lastname: Optional[str] = Field(None, max_length=100, description="Person's last name", json_schema_extra={"example": "Doe"})
    phone: Optional[str] = Field(None, max_length=20, description="Person's phone number", json_schema_extra={"example": "12345678"})
    birth_date: Optional[date] = Field(None, description="Person's birth date", json_schema_extra={"example": "1990-01-01"})
    bio: Optional[str] = Field(None, max_length=500, description="Person's biography", json_schema_extra={"example": "A brief description"})

class PersonCreate(PersonBase):
    """
    Esquema para crear una nueva persona.
    """
    type: PersonType = Field(..., description="Type of person", json_schema_extra={"example": "client"})
    user_id: int = Field(..., description="ID of the associated user account", json_schema_extra={"example": 1})

class PersonUpdate(BaseModel):
    """
    Esquema para actualizar una persona existente.
    """
    firstname: Optional[str] = Field(None, max_length=100, description="Person's first name")
    lastname: Optional[str] = Field(None, max_length=100, description="Person's last name")
    phone: Optional[str] = Field(None, max_length=20, description="Person's phone number")
    birth_date: Optional[date] = Field(None, description="Person's birth date")
    bio: Optional[str] = Field(None, max_length=500, description="Person's biography")

class PersonResponse(PersonBase):
    """
    Esquema para respuesta de una persona.
    """
    id: int = Field(..., description="Person identifier", json_schema_extra={"example": 1})
    user_id: int = Field(..., description="ID of the associated user account", json_schema_extra={"example": 1})
    type: PersonType = Field(..., description="Type of person", json_schema_extra={"example": "client"})
    avatar_url: Optional[str] = Field(None, description="URL of person's avatar")
    created_at: datetime = Field(..., description="Creation date")
    updated_at: datetime = Field(..., description="Last update date")
    
    model_config = ConfigDict(from_attributes=True)

# Esquemas específicos heredan de PersonBase
class DriverResponse(PersonResponse):
    """
    Esquema de respuesta específico para conductores.
    """
    license_number: Optional[str] = Field(None, description="Driver's license number")
    license_type: Optional[str] = Field(None, description="Driver's license type")
    license_expiry: Optional[date] = Field(None, description="License expiry date")
    status: Optional[str] = Field(None, description="Driver status")

class ClientResponse(PersonResponse):
    """
    Esquema de respuesta específico para clientes.
    """
    document_id: Optional[str] = Field(None, description="Client's document ID")
    email: Optional[str] = Field(None, description="Client's email")
    is_minor: Optional[bool] = Field(None, description="Whether client is a minor")
    address: Optional[str] = Field(None, description="Client's address")
    city: Optional[str] = Field(None, description="Client's city")
    state: Optional[str] = Field(None, description="Client's state")

class SecretaryResponse(PersonResponse):
    """
    Esquema de respuesta específico para secretarias.
    """
    office_id: Optional[int] = Field(None, description="Associated office ID")

class AssistantResponse(PersonResponse):
    """
    Esquema de respuesta específico para asistentes.
    """
    pass  # No campos adicionales

class AdministratorResponse(PersonResponse):
    """
    Esquema de respuesta específico para administradores.
    """
    pass  # No campos adicionales

# Esquemas de actualización específicos
class DriverUpdate(PersonUpdate):
    """
    Esquema para actualizar conductores.
    """
    license_number: Optional[str] = Field(None, description="Driver's license number")
    license_type: Optional[str] = Field(None, description="Driver's license type")
    license_expiry: Optional[date] = Field(None, description="License expiry date")
    status: Optional[str] = Field(None, description="Driver status")

class ClientUpdate(PersonUpdate):
    """
    Esquema para actualizar clientes.
    """
    document_id: Optional[str] = Field(None, description="Client's document ID")
    email: Optional[str] = Field(None, description="Client's email")
    is_minor: Optional[bool] = Field(None, description="Whether client is a minor")
    address: Optional[str] = Field(None, description="Client's address")
    city: Optional[str] = Field(None, description="Client's city")
    state: Optional[str] = Field(None, description="Client's state")

# Mantener esquemas legacy para compatibilidad
Person = PersonResponse  # Alias para compatibilidad hacia atrás
