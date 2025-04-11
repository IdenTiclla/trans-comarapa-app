from pydantic import BaseModel, EmailStr, Field
from typing import Optional

class UserBase(BaseModel):
    """
    Esquema base para usuarios.
    """
    email: EmailStr = Field(..., description="User's email", example="user@example.com")
    username: str = Field(..., description="Username", example="johndoe")
    role: str = Field(..., description="User role", example="client")
    is_active: bool = Field(True, description="Is user active", example=True)
    is_admin: bool = Field(False, description="Is user admin", example=False)

class UserCreate(UserBase):
    """
    Esquema para crear un nuevo usuario.
    """
    password: str = Field(..., description="User password", example="password123")

class UserUpdate(BaseModel):
    """
    Esquema para actualizar un usuario.
    """
    email: Optional[EmailStr] = Field(None, description="User's email", example="user@example.com")
    username: Optional[str] = Field(None, description="Username", example="johndoe")
    role: Optional[str] = Field(None, description="User role", example="client")
    is_active: Optional[bool] = Field(None, description="Is user active", example=True)
    is_admin: Optional[bool] = Field(None, description="Is user admin", example=False)
    password: Optional[str] = Field(None, description="User password", example="password123")

class User(UserBase):
    """
    Esquema para representar un usuario.
    """
    id: int = Field(..., description="User ID", example=1)

    class Config:
        from_attributes = True
