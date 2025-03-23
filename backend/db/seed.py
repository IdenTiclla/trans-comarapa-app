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
from datetime import datetime

# Load environment variables
load_dotenv()
DATABASE_URL = os.getenv("DATABASE_URL")

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def seed_db():
    db = SessionLocal()
    try:
        # Create sample passengers
        for i in range(5):
            passenger = Passenger(
                name=f"Passenger {i+1}",
                lastname=f"Lastname {i+1}",
                phone_number=f"7761232{i+1}",
                birth_date=f"1998-01-{i+1:02d}"
            )
            db.add(passenger)

        # Create sample drivers
        drivers = []
        for i in range(5):
            driver = Driver(
                name=f"Driver {i+1}",
                lastname=f"Lastname {i+1}",
                phone_number=f"7761232{i+1}",
                birth_date=f"1990-01-{i+1:02d}",
                license_number=f"1234567{i+1}",
                experience_years=i+1
            )
            db.add(driver)
            drivers.append(driver)

        # Create sample buses
        buses = []
        for i in range(5):
            bus = Bus(
                license_plate=f"2312ABX{i+1}",
                capacity=45,
                model=f"Model {i+1}"
            )
            db.add(bus)
            buses.append(bus)

        # Create sample assistants
        assistants = []
        for i in range(5):
            assistant = Assistant(
                first_name=f"Assistant {i+1}",
                phone_number=f"7761232{i+1}"
            )
            db.add(assistant)
            assistants.append(assistant)

        db.commit()

        # Create sample trips
        for i in range(5):
            trip = Trip(
                trip_datetime=datetime(2023, 10, 1, 14, 30),
                driver_id=drivers[i].id,
                assistant_id=assistants[i].id,
                bus_id=buses[i].id
            )
            db.add(trip)

        db.commit()
    except Exception as e:
        db.rollback()
        print(f"Error seeding database: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    seed_db() 