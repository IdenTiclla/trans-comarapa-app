from pydantic import BaseModel, Field, EmailStr
from typing import Optional
from datetime import date

class UserData(BaseModel):
    """
    Datos del usuario para la creación combinada de administrador y usuario.
    """
    username: str = Field(..., description="Username", example="admin")
    email: EmailStr = Field(..., description="User's email", example="admin@example.com")
    password: str = Field(..., description="User password", example="admin123")
    is_active: bool = Field(True, description="Is user active", example=True)
    is_admin: bool = Field(True, description="Is user admin", example=True)

class AdministratorWithUser(BaseModel):
    """
    Esquema para crear un administrador junto con su usuario asociado en una sola operación.
    """
    # Datos del administrador
    firstname: str = Field(..., description="Administrator's first name", example="John")
    lastname: str = Field(..., description="Administrator's last name", example="Doe")
    phone: Optional[str] = Field(None, description="Administrator's phone number", example="77000000")
    birth_date: Optional[date] = Field(None, description="Administrator's birth date", example="1980-01-01")
    
    # Datos del usuario
    user: UserData = Field(..., description="User data for the administrator")

class AdministratorWithUserResponse(BaseModel):
    """
    Esquema para la respuesta de creación de administrador con usuario.
    """
    # ID del administrador creado
    administrator_id: int = Field(..., description="ID of the created administrator", example=1)
    # ID del usuario creado
    user_id: int = Field(..., description="ID of the created user", example=1)
    # Datos completos
    firstname: str = Field(..., description="Administrator's first name", example="John")
    lastname: str = Field(..., description="Administrator's last name", example="Doe")
    phone: Optional[str] = Field(None, description="Administrator's phone number", example="77000000")
    birth_date: Optional[date] = Field(None, description="Administrator's birth date", example="1980-01-01")
    username: str = Field(..., description="Username", example="admin")
    email: EmailStr = Field(..., description="User's email", example="admin@example.com")
    is_active: bool = Field(..., description="Is user active", example=True)
    is_admin: bool = Field(..., description="Is user admin", example=True)
    
    class Config:
        from_attributes = True
