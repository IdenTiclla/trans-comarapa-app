from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from backend.models.passenger import Passenger
from backend.models.driver import Driver
from backend.models.bus import Bus
from backend.models.assistant import Assistant
from backend.models.trip import Trip
from backend.db.session import get_db
from dotenv import load_dotenv
import os

# Load environment variables
load_dotenv()
DATABASE_URL = os.getenv("DATABASE_URL")

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def cleanup_db():
    db = SessionLocal()
    try:
        # Delete all records from each table
        db.query(Trip).delete()
        db.query(Assistant).delete()
        db.query(Bus).delete()
        db.query(Driver).delete()
        db.query(Passenger).delete()
        
        db.commit()
        print("Database cleaned successfully.")
    except Exception as e:
        db.rollback()
        print(f"Error cleaning database: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    cleanup_db() 