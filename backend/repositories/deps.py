"""
Dependency injection factories for repositories.

Use with FastAPI's Depends() mechanism:
    @router.get("/")
    def endpoint(ticket_repo: TicketRepository = Depends(get_ticket_repo)):
        ...
"""

from fastapi import Depends
from sqlalchemy.orm import Session

from db.session import get_db
from repositories.ticket_repository import TicketRepository
from repositories.trip_repository import TripRepository
from repositories.package_repository import PackageRepository
from repositories.user_repository import UserRepository, ClientRepository
from repositories.seat_repository import SeatRepository


def get_ticket_repo(db: Session = Depends(get_db)) -> TicketRepository:
    return TicketRepository(db)


def get_trip_repo(db: Session = Depends(get_db)) -> TripRepository:
    return TripRepository(db)


def get_package_repo(db: Session = Depends(get_db)) -> PackageRepository:
    return PackageRepository(db)


def get_user_repo(db: Session = Depends(get_db)) -> UserRepository:
    return UserRepository(db)


def get_client_repo(db: Session = Depends(get_db)) -> ClientRepository:
    return ClientRepository(db)


def get_seat_repo(db: Session = Depends(get_db)) -> SeatRepository:
    return SeatRepository(db)
