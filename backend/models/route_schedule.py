from sqlalchemy import Column, Integer, Time, Boolean, ForeignKey, UniqueConstraint
from sqlalchemy.orm import relationship
from db.base import Base

class RouteSchedule(Base):
    __tablename__ = "route_schedules"

    id = Column(Integer, primary_key=True, index=True)
    route_id = Column(Integer, ForeignKey('routes.id'), nullable=False)
    departure_time = Column(Time, nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)

    __table_args__ = (
        UniqueConstraint('route_id', 'departure_time', name='uq_route_departure_time'),
    )

    route = relationship("Route", back_populates="schedules")
