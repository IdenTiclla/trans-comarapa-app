from sqlalchemy import create_engine
from db.base import Base
from dotenv import load_dotenv
import os

# Importar todos los modelos para que SQLAlchemy los registre
from models.user import User
from models.administrator import Administrator
from models.secretary import Secretary
from models.driver import Driver
from models.assistant import Assistant
from models.client import Client
from models.office import Office
from models.location import Location
from models.route import Route
from models.bus import Bus
from models.seat import Seat
from models.trip import Trip
from models.ticket import Ticket
from models.package import Package
from models.package_item import PackageItem

# Load environment variables
load_dotenv()
DATABASE_URL = os.getenv("DATABASE_URL")

def create_tables():
    """Crear todas las tablas en la base de datos"""
    engine = create_engine(DATABASE_URL)
    
    print("Creando todas las tablas...")
    Base.metadata.create_all(bind=engine)
    print("¡Tablas creadas exitosamente!")

if __name__ == "__main__":
    create_tables() 