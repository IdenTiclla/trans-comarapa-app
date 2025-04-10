from pydantic import BaseModel, Field

class SecretaryUserLink(BaseModel):
    """
    Schema for linking a secretary with a user account.
    """
    user_id: int = Field(..., description="ID of the user to link with the secretary", example=1)
