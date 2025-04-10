import os
import sys
from pathlib import Path

# Asegurarse de que las importaciones funcionen correctamente
# independientemente de desde dónde se ejecute
BASE_DIR = Path(__file__).resolve().parent
if str(BASE_DIR) not in sys.path:
    sys.path.insert(0, str(BASE_DIR))

from fastapi import FastAPI
from fastapi.openapi.models import SecurityScheme
from fastapi.openapi.utils import get_openapi
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
# pylint: enable=unused-import

load_dotenv()
DEBUG = os.getenv("DEBUG", "True")

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
