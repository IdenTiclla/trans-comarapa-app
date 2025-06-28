from pydantic import BaseModel, EmailStr, Field
from typing import Optional, Dict, Any
from datetime import datetime, date

class UnifiedProfileResponse(BaseModel):
    """
    Esquema unificado para el perfil del usuario que combina datos de User y Person.
    Este esquema reemplaza los múltiples endpoints de perfil existentes.
    """
    # Datos básicos del usuario
    id: int = Field(..., description="User ID", example=1)
    username: str = Field(..., description="Username", example="johndoe")
    email: EmailStr = Field(..., description="User's email", example="user@example.com")
    role: str = Field(..., description="User role", example="client")
    is_active: bool = Field(..., description="Is user active", example=True)
    is_admin: bool = Field(..., description="Is user admin", example=False)
    created_at: datetime = Field(..., description="Account creation timestamp")
    updated_at: Optional[datetime] = Field(None, description="Last account update timestamp")
    
    # Datos de la persona (de la entidad Person asociada)
    person: Optional[Dict[str, Any]] = Field(None, description="Person data including role-specific fields")
    
    # Campos computados para compatibilidad
    firstname: Optional[str] = Field(None, description="Person's first name", example="John")
    lastname: Optional[str] = Field(None, description="Person's last name", example="Doe")
    phone: Optional[str] = Field(None, description="Person's phone number", example="12345678")
    birth_date: Optional[date] = Field(None, description="Person's birth date", example="1990-01-01")
    
    class Config:
        from_attributes = True

class ProfileUpdateRequest(BaseModel):
    """
    Esquema para actualizar el perfil del usuario autenticado.
    Permite actualizar tanto datos del User como del Person asociado.
    """
    # Datos del usuario (limitados para seguridad)
    email: Optional[EmailStr] = Field(None, description="New email address")
    
    # Datos de persona que se pueden actualizar
    firstname: Optional[str] = Field(None, max_length=100, description="Person's first name")
    lastname: Optional[str] = Field(None, max_length=100, description="Person's last name")
    phone: Optional[str] = Field(None, max_length=20, description="Person's phone number")
    birth_date: Optional[date] = Field(None, description="Person's birth date")
    bio: Optional[str] = Field(None, max_length=500, description="Person's biography")
    
    # Campos específicos por rol (opcionales)
    role_specific_data: Optional[Dict[str, Any]] = Field(None, description="Role-specific data to update")