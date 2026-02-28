from pydantic import BaseModel, Field, EmailStr, ConfigDict
from typing import Optional
from datetime import date

class UserData(BaseModel):
    """
    Datos del usuario para la creación combinada de administrador y usuario.
    """
    username: str = Field(..., description="Username", json_schema_extra={"example": "admin"})
    email: EmailStr = Field(..., description="User's email", json_schema_extra={"example": "admin@example.com"})
    password: str = Field(..., description="User password", json_schema_extra={"example": "admin123"})
    is_active: bool = Field(True, description="Is user active", json_schema_extra={"example": True})
    is_admin: bool = Field(True, description="Is user admin", json_schema_extra={"example": True})

class AdministratorWithUser(BaseModel):
    """
    Esquema para crear un administrador junto con su usuario asociado en una sola operación.
    """
    # Datos del administrador
    firstname: str = Field(..., description="Administrator's first name", json_schema_extra={"example": "John"})
    lastname: str = Field(..., description="Administrator's last name", json_schema_extra={"example": "Doe"})
    phone: Optional[str] = Field(None, description="Administrator's phone number", json_schema_extra={"example": "77000000"})
    birth_date: Optional[date] = Field(None, description="Administrator's birth date", json_schema_extra={"example": "1980-01-01"})
    
    # Datos del usuario
    user: UserData = Field(..., description="User data for the administrator")

class AdministratorWithUserResponse(BaseModel):
    """
    Esquema para la respuesta de creación de administrador con usuario.
    """
    # ID del administrador creado
    administrator_id: int = Field(..., description="ID of the created administrator", json_schema_extra={"example": 1})
    # ID del usuario creado
    user_id: int = Field(..., description="ID of the created user", json_schema_extra={"example": 1})
    # Datos completos
    firstname: str = Field(..., description="Administrator's first name", json_schema_extra={"example": "John"})
    lastname: str = Field(..., description="Administrator's last name", json_schema_extra={"example": "Doe"})
    phone: Optional[str] = Field(None, description="Administrator's phone number", json_schema_extra={"example": "77000000"})
    birth_date: Optional[date] = Field(None, description="Administrator's birth date", json_schema_extra={"example": "1980-01-01"})
    username: str = Field(..., description="Username", json_schema_extra={"example": "admin"})
    email: EmailStr = Field(..., description="User's email", json_schema_extra={"example": "admin@example.com"})
    is_active: bool = Field(..., description="Is user active", json_schema_extra={"example": True})
    is_admin: bool = Field(..., description="Is user admin", json_schema_extra={"example": True})
    
    model_config = ConfigDict(from_attributes=True)
