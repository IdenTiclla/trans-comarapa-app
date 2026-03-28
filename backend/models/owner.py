from sqlalchemy import Column, Integer, ForeignKey
from sqlalchemy.orm import relationship
from models.person import Person

class Owner(Person):
    __tablename__ = "owners"

    id = Column(Integer, ForeignKey('persons.id'), primary_key=True)
    
    # Un dueño puede tener varios buses
    buses = relationship("Bus", back_populates="owner")
    withdrawals = relationship("OwnerWithdrawal", back_populates="owner")

    __mapper_args__ = {
        'polymorphic_identity': 'owner',
    }
    
    def __repr__(self):
        return f"<Owner(id={self.id}, name='{self.full_name}')>"
