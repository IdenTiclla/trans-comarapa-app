from pydantic import BaseModel, Field

class AssistantCreate(BaseModel):
    first_name: str = Field(..., description="Assistant first name", example="John")
    phone_number: str = Field(max_length=8, description="Assistant phone number", example="64487591")

