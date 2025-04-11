from pydantic import BaseModel, Field, EmailStr, validator
from datetime import datetime
from typing import Optional, Annotated

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"

class TokenWithSecretaryInfo(Token):
    secretary_id: Optional[int] = None
    secretary_firstname: Optional[str] = None
    secretary_lastname: Optional[str] = None

class UserInfo(BaseModel):
    id: int
    firstname: str
    lastname: str

class TokenWithRoleInfo(Token):
    # Campos antiguos para mantener compatibilidad con el frontend existente
    secretary_id: Optional[int] = None
    secretary_firstname: Optional[str] = None
    secretary_lastname: Optional[str] = None
    driver_id: Optional[int] = None
    driver_firstname: Optional[str] = None
    driver_lastname: Optional[str] = None
    assistant_id: Optional[int] = None
    assistant_firstname: Optional[str] = None
    assistant_lastname: Optional[str] = None
    admin_id: Optional[int] = None
    admin_firstname: Optional[str] = None
    admin_lastname: Optional[str] = None
    client_id: Optional[int] = None
    client_firstname: Optional[str] = None
    client_lastname: Optional[str] = None

    # Nuevos campos más limpios
    role: Optional[str] = None
    user_id: Optional[int] = None
    user_info: Optional[UserInfo] = None

class TokenData(BaseModel):
    email: EmailStr | None = None
    role: str | None = None
    is_admin: bool | None = None
    is_active: bool | None = None

class PasswordResetRequest(BaseModel):
    email: EmailStr = Field(..., description="Email del usuario que quiere restablecer su contraseña")

class PasswordReset(BaseModel):
    token: str = Field(..., description="Token de restablecimiento de contraseña")
    new_password: str = Field(..., min_length=8, description="Nueva contraseña", example="NuevaContraseña123")

class PasswordResetResponse(BaseModel):
    message: str

# Importación para evitar ciclos de importación donde sea necesario
from schemas.user import User
