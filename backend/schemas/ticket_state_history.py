from pydantic import BaseModel, Field, ConfigDict
from datetime import datetime
from typing import Optional

class TicketStateHistoryBase(BaseModel):
    ticket_id: int = Field(..., gt=0)
    old_state: Optional[str] = None
    new_state: str
    changed_by_user_id: Optional[int] = Field(default=None, gt=0)

    model_config = ConfigDict(from_attributes=True)

class TicketStateHistoryCreate(TicketStateHistoryBase):
    pass

class TicketStateHistory(TicketStateHistoryBase):
    id: int
    changed_at: datetime

    # If you want to include user details in the response, you can add a User schema here
    # from .user import User # Assuming you have a schemas/user.py
    # changed_by_user: Optional[User] = None 