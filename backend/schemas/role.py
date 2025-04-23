from typing import List
from pydantic import BaseModel, Field

class RoleList(BaseModel):
    """
    Esquema para lista de roles disponibles.
    """
    roles: List[str] = Field(..., description="List of available roles")
