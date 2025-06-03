from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional

class PackageStateHistoryBase(BaseModel):
    package_id: int = Field(..., gt=0)
    old_state: Optional[str] = None
    new_state: str
    changed_by_user_id: Optional[int] = Field(default=None, gt=0)

    class Config:
        from_attributes = True

class PackageStateHistoryCreate(PackageStateHistoryBase):
    pass

class PackageStateHistory(PackageStateHistoryBase):
    id: int
    changed_at: datetime

    # Optional: If you want to include user details in the response
    # from .user import User  # Assuming schemas/user.py exists
    # changed_by_user: Optional[User] = None 