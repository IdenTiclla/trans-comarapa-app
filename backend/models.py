from sqlalchemy import Column, Integer, String, Date
from .database import Base


class Passenger(Base):
    __tablename__ = "passengers"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), index=True)
    lastname = Column(String(100), index=True)
    phone_number = Column(String(8))
    birth_date = Column(Date())

class Driver(Base):
    __tablename__ = "drivers"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), index=True)
    lastname = Column(String(100), index=True)
    phone_number = Column(String(8))
    birth_date = Column(Date())
    license_number = Column(String(8), unique=True)
    experience_years = Column(Integer)
