from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
from sqlalchemy.exc import SQLAlchemyError

from dotenv import load_dotenv
import os
import logging
import sys

# Load environment variables
load_dotenv()

logger = logging.getLogger(__name__)

# Obtener configuración de la base de datos
DATABASE_URL = os.getenv("DATABASE_URL")
SECRET_KEY = os.getenv("SECRET_KEY")
DEBUG = os.getenv("DEBUG", "False") == "True"

# Validar que DATABASE_URL esté configurada
if not DATABASE_URL:
    logger.error("DATABASE_URL environment variable is not set")
    sys.exit(1)

# Validar que no sea una URL por defecto insegura
if "localhost" not in DATABASE_URL and "your-database-url" in DATABASE_URL.lower():
    logger.error("DATABASE_URL appears to be a placeholder. Please set a valid database URL.")
    sys.exit(1)

try:
    # Crear el motor de base de datos con pool config
    engine = create_engine(
        DATABASE_URL,
        pool_size=10,
        max_overflow=20,
        pool_pre_ping=True,
        pool_recycle=1800,
    )
    
    # Probar la conexión inmediatamente
    with engine.connect() as connection:
        # Ejecutar una consulta simple para verificar la conexión
        result = connection.execute(text("SELECT 1"))
        result.fetchone()
        logger.info("Database connection successful")
        
except SQLAlchemyError as e:
    logger.error(f"Failed to connect to database: {e}")
    logger.error(f"Database URL: {DATABASE_URL}")
    sys.exit(1)
except Exception as e:
    logger.error(f"Unexpected error connecting to database: {e}")
    sys.exit(1)

# Crear el session maker
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base = declarative_base()

# Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()