from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func # For server_default=func.now() if needed, or use datetime
from datetime import datetime
from db.base import Base # Assuming your Base is in db.base
# Assuming User model for changed_by_user_id, adjust path if necessary
# from models.user import User # This will be resolved by SQLAlchemy's registry

class PackageStateHistory(Base):
    __tablename__ = "package_state_history"

    id = Column(Integer, primary_key=True, index=True)
    package_id = Column(Integer, ForeignKey("packages.id"), nullable=False, index=True)
    old_state = Column(String(50), nullable=True)
    new_state = Column(String(50), nullable=False)
    changed_at = Column(DateTime, default=datetime.now, nullable=False)
    changed_by_user_id = Column(Integer, ForeignKey("users.id"), nullable=True) # Or make it not nullable if a user must always be associated

    package = relationship("Package", back_populates="state_history")
    # The relationship to User will be automatically picked up if User model is loaded
    # Or can be explicitly defined if there are ambiguities or specific needs.
    changed_by_user = relationship("User") # Add back_populates in User model if needed, though often not for this direction

    def __repr__(self):
        return f"<PackageStateHistory(package_id={self.package_id}, old_state='{self.old_state}', new_state='{self.new_state}', changed_at='{self.changed_at}')>" 