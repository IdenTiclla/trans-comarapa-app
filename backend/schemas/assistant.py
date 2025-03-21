from pydantic import BaseModel, Field

class AssistantBase(BaseModel):
    first_name: str = Field(..., description="Assistant first name", example="John")
    phone_number: str = Field(max_length=8, description="Assistant phone number", example="64487591")

class AssistantCreate(AssistantBase):
    """
    Schema for creating a new assistant.
    """
    pass

    class Config:
        from_attributes = True

class Assistant(AssistantBase):
    id: int = Field(..., description="Identifier for the bus assistant.", example=1)

    class Config:
        from_attributes = True
