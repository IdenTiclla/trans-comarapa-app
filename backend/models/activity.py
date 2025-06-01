from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from db.base import Base # Cambiado de db.base_class a db.base

class Activity(Base):
    __tablename__ = "activities"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True) # Puede ser una actividad del sistema
    activity_type = Column(String(255), nullable=False, index=True)
    details = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), index=True)

    user = relationship("User") # Relación con el modelo User

    def __repr__(self):
        return f"<Activity(id={self.id}, type='{self.activity_type}', user_id={self.user_id})>" 