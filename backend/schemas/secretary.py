from pydantic import BaseModel, Field
from datetime import datetime

class SecretaryBase(BaseModel):
    name: str = Field(..., description="Secretary's name", example="John Doe")
    email: str = Field(..., description="Secretary's email", example="john.doe@example.com")
    phone: str = Field(..., description="Secretary's phone number", example="12345678")

class SecretaryCreate(SecretaryBase):
    """
    Schema for creating a new secretary.
    """
    pass

class Secretary(SecretaryBase):
    id: int = Field(..., description="Secretary identifier", example=1)
    created_at: datetime = Field(..., description="Creation date", example=datetime.now())
    updated_at: datetime = Field(..., description="Last update date", example=datetime.now())
    

    class Config:
        from_attributes = True
        arbitrary_types_allowed = True
