from sqlalchemy import Column, Integer, String
from ..database import Base

class Bus(Base):
    __tablename__ = "buses"

    id = Column(Integer, primary_key=True, index=True)
    license_plate = Column(String(10), unique=True)
    capacity = Column(Integer)
    model = Column(String(100))
