from pydantic import BaseModel, Field, EmailStr
from typing import Optional
from datetime import date

class UserData(BaseModel):
    """
    Datos del usuario para la creación combinada de secretario y usuario.
    """
    username: str = Field(..., description="Username", example="johndoe")
    email: EmailStr = Field(..., description="User's email", example="user@example.com")
    password: str = Field(..., description="User password", example="password123")
    is_active: bool = Field(True, description="Is user active", example=True)
    is_admin: bool = Field(False, description="Is user admin", example=False)

class SecretaryWithUser(BaseModel):
    """
    Esquema para crear un secretario junto con su usuario asociado en una sola operación.
    """
    # Datos del secretario
    firstname: str = Field(..., description="Secretary's first name", example="John")
    lastname: str = Field(..., description="Secretary's last name", example="Doe")
    phone: Optional[str] = Field(None, description="Secretary's phone number", example="12345678")
    birth_date: Optional[date] = Field(None, description="Secretary's birth date", example="1990-01-01")
    office_id: Optional[int] = Field(None, description="Secretary's office ID", example=1)
    
    # Datos del usuario
    user: UserData = Field(..., description="User data for the secretary")

class SecretaryWithUserResponse(BaseModel):
    """
    Esquema para la respuesta de creación de secretario con usuario.
    """
    # ID del secretario creado
    secretary_id: int = Field(..., description="ID of the created secretary", example=1)
    # ID del usuario creado
    user_id: int = Field(..., description="ID of the created user", example=1)
    # Datos completos
    firstname: str = Field(..., description="Secretary's first name", example="John")
    lastname: str = Field(..., description="Secretary's last name", example="Doe")
    phone: Optional[str] = Field(None, description="Secretary's phone number", example="12345678")
    birth_date: Optional[date] = Field(None, description="Secretary's birth date", example="1990-01-01")
    office_id: Optional[int] = Field(None, description="Secretary's office ID", example=1)
    username: str = Field(..., description="Username", example="johndoe")
    email: EmailStr = Field(..., description="User's email", example="user@example.com")
    is_active: bool = Field(..., description="Is user active", example=True)
    is_admin: bool = Field(..., description="Is user admin", example=False)
    
    class Config:
        from_attributes = True
