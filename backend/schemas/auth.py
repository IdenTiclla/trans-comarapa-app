from pydantic import BaseModel, Field, EmailStr, validator
from datetime import datetime
from typing import Optional, Annotated

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"

class TokenWithSecretaryInfo(Token):
    secretary_id: Optional[int] = None
    secretary_name: Optional[str] = None

class TokenWithRoleInfo(Token):
    secretary_id: Optional[int] = None
    secretary_name: Optional[str] = None
    driver_id: Optional[int] = None
    driver_name: Optional[str] = None
    assistant_id: Optional[int] = None
    assistant_name: Optional[str] = None

class TokenData(BaseModel):
    email: EmailStr | None = None
    role: str | None = None
    is_admin: bool | None = None
    is_active: bool | None = None


class UserBase(BaseModel):
    email: EmailStr
    full_name: str
    role: str
    is_active: bool = True
    is_admin: bool = False


class UserCreate(UserBase):
    password: str = Field(..., min_length=8, description="User's password", example="SecurePassword123")

class User(UserBase):
    id: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True
        json_encoders = {
            datetime: lambda dt: dt.isoformat()
        }
        # Excluir el campo secretary para evitar la recursión
        exclude = {"secretary"}

class UserInDB(User):
    hashed_password: str

class PasswordResetRequest(BaseModel):
    email: EmailStr = Field(..., description="Email del usuario que quiere restablecer su contraseña")

class PasswordReset(BaseModel):
    token: str = Field(..., description="Token de restablecimiento de contraseña")
    new_password: str = Field(..., min_length=8, description="Nueva contraseña", example="NuevaContraseña123")

class PasswordResetResponse(BaseModel):
    message: str

# Importación al final para evitar ciclos de importación
from schemas.secretary import Secretary
