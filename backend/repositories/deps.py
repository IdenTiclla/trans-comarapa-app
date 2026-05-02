from fastapi import Depends
from sqlalchemy.orm import Session

from db.session import get_db
from repositories.ticket_repository import TicketRepository
from repositories.trip_repository import TripRepository
from repositories.package_repository import PackageRepository
from repositories.user_repository import UserRepository, ClientRepository
from repositories.seat_repository import SeatRepository
from repositories.bus_repository import BusRepository
from repositories.cash_register_repository import CashRegisterRepository
from repositories.office_repository import OfficeRepository
from repositories.route_repository import RouteRepository, LocationRepository
from repositories.owner_repository import OwnerRepository
from repositories.person_repository import PersonRepository
from repositories.report_repository import ReportRepository


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


def get_bus_repo(db: Session = Depends(get_db)) -> BusRepository:
    return BusRepository(db)


def get_cash_register_repo(db: Session = Depends(get_db)) -> CashRegisterRepository:
    return CashRegisterRepository(db)


def get_office_repo(db: Session = Depends(get_db)) -> OfficeRepository:
    return OfficeRepository(db)


def get_route_repo(db: Session = Depends(get_db)) -> RouteRepository:
    return RouteRepository(db)


def get_location_repo(db: Session = Depends(get_db)) -> LocationRepository:
    return LocationRepository(db)


def get_owner_repo(db: Session = Depends(get_db)) -> OwnerRepository:
    return OwnerRepository(db)


def get_person_repo(db: Session = Depends(get_db)) -> PersonRepository:
    return PersonRepository(db)


def get_report_repo(db: Session = Depends(get_db)) -> ReportRepository:
    return ReportRepository(db)
