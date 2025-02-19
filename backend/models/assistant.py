from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship

from ..db.base import Base

class Assistant(Base):
    __tablename__ = 'assistants'

    id = Column(Integer, primary_key=True, nullable=False)
    first_name = Column(String(100))  # example field for assistant's name
    phone_number = Column(String(8))

    # Optionally, add a back-reference relationship to Trip if necessary:
    # trips = relationship("Trip", back_populates="assistant")
