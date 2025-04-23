from fastapi import APIRouter
from routes import driver, bus, assistant, trip, location, route, ticket, seat, client, package, secretary, auth, administrator, stats, user_management

# Crear un router principal para la versión 1 de la API
api_router = APIRouter()

# Incluir el router de autenticación
api_router.include_router(auth.router)

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
api_router.include_router(secretary.router, prefix="/secretaries")
api_router.include_router(administrator.router, prefix="/administrators")
api_router.include_router(stats.router, prefix="/stats")
api_router.include_router(user_management.router)

# Nota: El prefijo '/busses' se cambia a '/buses' para seguir convenciones REST
