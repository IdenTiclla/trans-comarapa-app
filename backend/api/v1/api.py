from fastapi import APIRouter
from routes import driver, bus, assistant, trip, location, route, ticket, seat, client, package

# Crear un router principal para la versión 1 de la API
api_router = APIRouter()

# Incluir todos los routers existentes
api_router.include_router(driver.router, prefix="/drivers")
api_router.include_router(bus.router, prefix="/buses")
api_router.include_router(assistant.router, prefix="/assistants")
api_router.include_router(trip.router, prefix="/trips")
api_router.include_router(location.router, prefix="/locations")
api_router.include_router(route.router, prefix="/routes")
api_router.include_router(ticket.router, prefix="/tickets")
api_router.include_router(seat.router, prefix="/seats")
api_router.include_router(client.router, prefix="/clients")
api_router.include_router(package.router, prefix="/packages")

# Nota: El prefijo '/busses' se cambia a '/buses' para seguir convenciones REST
