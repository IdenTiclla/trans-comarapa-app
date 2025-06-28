import os
import sys
from pathlib import Path

# Asegurarse de que las importaciones funcionen correctamente
# independientemente de desde dónde se ejecute
BASE_DIR = Path(__file__).resolve().parent
if str(BASE_DIR) not in sys.path:
    sys.path.insert(0, str(BASE_DIR))

from fastapi import FastAPI, Request
from fastapi.openapi.models import SecurityScheme
from fastapi.openapi.utils import get_openapi
from fastapi.middleware.cors import CORSMiddleware
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from db.base import Base
from db.session import engine
from dotenv import load_dotenv
from api.v1.api import api_router as api_router_v1

# Import all models to ensure they are registered with SQLAlchemy
# Estas importaciones son necesarias para que SQLAlchemy cree las tablas
# aunque no se usen directamente en este archivo
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
# pylint: enable=unused-import

load_dotenv()
DEBUG = os.getenv("DEBUG", "True")

# Rate limiter configuration
limiter = Limiter(key_func=get_remote_address)

# Create all tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Trans Comarapa API",
    description="API para la gestión de boletos, paquetes y viajes de Trans Comarapa.",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
    debug=DEBUG
)

# Add rate limiter to the app
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# Configurar CORS - Configuración permisiva para desarrollo
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",  # Frontend development server
        "http://127.0.0.1:3000",  # Alternative localhost
        "http://frontend:3000",   # Docker container name
        "http://0.0.0.0:3000",    # Docker internal network
    ],
    allow_credentials=True,  # Allow credentials (cookies, authorization headers)
    allow_methods=["*"],     # Allow all HTTP methods
    allow_headers=["*"],     # Allow all headers
)

# Incluir el router de la versión 1 con el prefijo /api/v1
app.include_router(api_router_v1, prefix="/api/v1")

# También podemos incluir otras versiones en el futuro, por ejemplo:
# from api.v2.api import api_router as api_router_v2
# app.include_router(api_router_v2, prefix="/api/v2")

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
        "app_name": "Trans Comarapa API",
        "version": "1.0.0",
        "description": "API para la gestión de boletos, paquetes y viajes",
        "api_versions": {
            "v1": "/api/v1"
        },
        "documentation": {
            "swagger": "/docs",
            "redoc": "/redoc"
        }
    }
