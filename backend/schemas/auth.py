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
    # Campos esenciales
    expires_in: Optional[int] = None  # Tiempo de expiración en segundos
    refresh_token: Optional[str] = None
    refresh_token_expires_in: Optional[int] = None

    # Información del usuario
    role: str
    user_id: int
    firstname: Optional[str] = None
    lastname: Optional[str] = None

class TokenData(BaseModel):
    email: EmailStr | None = None
    role: str | None = None
    is_admin: bool | None = None
    is_active: bool | None = None
    firstname: str | None = None
    lastname: str | None = None
    jti: str | None = None  # JWT ID para identificar tokens únicos
    token_type: str | None = None  # "refresh" para refresh tokens

class PasswordResetRequest(BaseModel):
    email: EmailStr = Field(..., description="Email del usuario que quiere restablecer su contraseña")

class PasswordReset(BaseModel):
    token: str = Field(..., description="Token de restablecimiento de contraseña")
    new_password: str = Field(..., min_length=8, description="Nueva contraseña", json_schema_extra={"example": "NuevaContraseña123"})

class PasswordResetResponse(BaseModel):
    message: str

# Importación para evitar ciclos de importación donde sea necesario
from schemas.user import User
