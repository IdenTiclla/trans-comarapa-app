from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List, Dict, Any
from datetime import datetime

class UserBase(BaseModel):
    """
    Esquema base para usuarios.
    """
    firstname: str = Field(..., description="User's first name", example="John")
    lastname: str = Field(..., description="User's last name", example="Doe")
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
    firstname: Optional[str] = Field(None, description="User's first name", example="John")
    lastname: Optional[str] = Field(None, description="User's last name", example="Doe")
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

class UserResponse(UserBase):
    """
    Esquema para respuesta de usuario con información adicional.
    """
    id: int = Field(..., description="User ID", example=1)
    created_at: datetime = Field(..., description="Creation timestamp")
    updated_at: Optional[datetime] = Field(None, description="Last update timestamp")
    related_entity: Optional[Dict[str, Any]] = Field(None, description="Related entity information")

    class Config:
        from_attributes = True

class UserListResponse(BaseModel):
    """
    Esquema para respuesta de lista de usuarios con paginación.
    """
    items: List[UserResponse] = Field(..., description="List of users")
    total: int = Field(..., description="Total number of users matching criteria")
    skip: int = Field(..., description="Number of users skipped (offset)")
    limit: int = Field(..., description="Maximum number of users returned")
