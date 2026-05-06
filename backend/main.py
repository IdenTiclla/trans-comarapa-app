import sys
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent
if str(BASE_DIR) not in sys.path:
    sys.path.insert(0, str(BASE_DIR))

from core.logging_config import setup_logging
setup_logging()

from fastapi import FastAPI, Request
from fastapi.openapi.utils import get_openapi
from fastapi.middleware.cors import CORSMiddleware
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from db.base import Base
from db.session import engine
from api.v1.api import api_router as api_router_v1
from core.exception_handlers import register_exception_handlers
from core.config import settings

# pylint: disable=unused-import
from models.driver import Driver
from models.bus import Bus
from models.assistant import Assistant
from models.trip import Trip
from models.route import Route
from models.location import Location
from models.seat import Seat
from models.client import Client
from models.ticket import Ticket
from models.package import Package
from models.secretary import Secretary
from models.administrator import Administrator
from models.office import Office
from models.user import User
from models.activity import Activity
from models.ticket_state_history import TicketStateHistory
from models.route_schedule import RouteSchedule
from models.owner import Owner
from models.owner_withdrawal import OwnerWithdrawal
# pylint: enable=unused-import


def get_rate_limiter():
    if settings.TESTING:
        def disabled_limiter(*args, **kwargs):
            return lambda func: func
        return type('DisabledLimiter', (), {
            'limit': disabled_limiter,
            'key_func': get_remote_address
        })()
    else:
        return Limiter(key_func=get_remote_address)

limiter = get_rate_limiter()

app = FastAPI(
    title=settings.APP_NAME,
    description="API para la gestión de boletos, paquetes y viajes de Trans Comarapa.",
    version=settings.APP_VERSION,
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
    debug=settings.DEBUG
)

if not settings.TESTING:
    app.state.limiter = limiter
    app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

register_exception_handlers(app)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type", "Accept"],
)

# Incluir el router de la versión 1 con el prefijo /api/v1
app.include_router(api_router_v1, prefix="/api/v1")

# Personalizar el esquema OpenAPI para incluir múltiples esquemas de autenticación
def custom_openapi():
    if app.openapi_schema:
        return app.openapi_schema

    openapi_schema = get_openapi(
        title=app.title,
        version=app.version,
        description=app.description,
        routes=app.routes,
    )

    # Asegurar que la estructura de components existe
    if "components" not in openapi_schema:
        openapi_schema["components"] = {}
    if "securitySchemes" not in openapi_schema["components"]:
        openapi_schema["components"]["securitySchemes"] = {}

    # Añadir el esquema de seguridad HTTPBearer
    openapi_schema["components"]["securitySchemes"]["HTTPBearer"] = {
        "type": "http",
        "scheme": "bearer",
        "bearerFormat": "JWT",
        "description": "Ingresa tu token JWT directamente. Útil para pruebas y clientes API."
    }

    # Asegurarse de que el esquema OAuth2 existente se mantenga
    if "OAuth2PasswordBearer" in openapi_schema["components"]["securitySchemes"]:
        openapi_schema["components"]["securitySchemes"]["OAuth2PasswordBearer"]["description"] = "Flujo OAuth2 con usuario y contraseña para generar token JWT."

    app.openapi_schema = openapi_schema
    return app.openapi_schema

app.openapi = custom_openapi

@app.get('/')
def index():
    return {
        "app_name": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "description": "API para la gestión de boletos, paquetes y viajes",
        "api_versions": {
            "v1": "/api/v1"
        },
        "documentation": {
            "swagger": "/docs",
            "redoc": "/redoc"
        }
    }


@app.get('/health')
def health_check():
    """Health check endpoint for monitoring and load balancers."""
    from sqlalchemy import text
    from db.session import SessionLocal
    try:
        db = SessionLocal()
        try:
            db.execute(text("SELECT 1"))
            db_status = "healthy"
        finally:
            db.close()
    except Exception:
        db_status = "unhealthy"
    return {
        "status": "ok",
        "database": db_status,
        "version": settings.APP_VERSION
    }
