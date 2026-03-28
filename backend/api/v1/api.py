from fastapi import APIRouter
from routes import (
    driver,
    bus,
    assistant,
    trip,
    location,
    route,
    ticket,
    seat,
    seat_lock,
    client,
    package,
    secretary,
    auth,
    administrator,
    stats,
    user_management,
    activities,
    persons,
    office,
    cash_register,
    report,
    financial,
    owner,
)

api_router = APIRouter()

api_router.include_router(auth.router)
api_router.include_router(persons.router)
api_router.include_router(driver.router, prefix="/drivers")
api_router.include_router(bus.router, prefix="/buses")
api_router.include_router(assistant.router, prefix="/assistants")
api_router.include_router(trip.router, prefix="/trips")
api_router.include_router(location.router, prefix="/locations")
api_router.include_router(office.router, prefix="/offices")
api_router.include_router(route.router, prefix="/routes")
api_router.include_router(ticket.router, prefix="/tickets")
api_router.include_router(seat.router, prefix="/seats")
api_router.include_router(seat_lock.router, prefix="/seats")
api_router.include_router(client.router, prefix="/clients")
api_router.include_router(package.router, prefix="/packages")
api_router.include_router(secretary.router, prefix="/secretaries")
api_router.include_router(administrator.router, prefix="/administrators")
api_router.include_router(stats.router, prefix="/stats")
api_router.include_router(user_management.router)
api_router.include_router(activities.router)
api_router.include_router(cash_register.router)
api_router.include_router(report.router, prefix="/reports")
api_router.include_router(financial.router)
api_router.include_router(owner.router)
