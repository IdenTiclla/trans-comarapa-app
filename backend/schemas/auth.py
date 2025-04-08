from pydantic import BaseModel, Field, EmailStr, validator
from datetime import datetime
from typing import Optional


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"

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

class UserInDB(User):
    hashed_password: str
