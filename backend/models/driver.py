from sqlalchemy import Column, Integer, String, Date
from sqlalchemy.orm import relationship
from db.base import Base

class Driver(Base):
    __tablename__ = "drivers"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), index=True)
    lastname = Column(String(100), index=True)
    phone_number = Column(String(8))
    birth_date = Column(Date())
    license_number = Column(String(8), unique=True)
    experience_years = Column(Integer)
    trips = relationship("Trip", back_populates="driver")
