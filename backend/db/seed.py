from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from models.passenger import Passenger
from models.driver import Driver
from models.bus import Bus
from models.assistant import Assistant
from models.trip import Trip
from models.route import Route
from models.location import Location
from db.session import get_db
from dotenv import load_dotenv
import os
from datetime import datetime, date

# Load environment variables
load_dotenv()
DATABASE_URL = os.getenv("DATABASE_URL")

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def seed_db():
    db = SessionLocal()
    try:
        # Create sample locations first
        location_data = [
            {
                "name": "Terminal Bimodal Santa Cruz",
                "latitude": -17.783333,
                "longitude": -63.182222,
                "address": "Av. Omar Chávez Ortiz",
                "city": "Santa Cruz de la Sierra",
                "state": "Santa Cruz",
                "country": "Bolivia",
                "description": "Terminal principal de Santa Cruz"
            },
            {
                "name": "Terminal Comarapa",
                "latitude": -17.916667,
                "longitude": -64.533333,
                "address": "Av. Principal",
                "city": "Comarapa",
                "state": "Santa Cruz",
                "country": "Bolivia",
                "description": "Terminal de buses de Comarapa"
            },
            {
                "name": "Terminal Cochabamba",
                "latitude": -17.393888,
                "longitude": -66.156944,
                "address": "Av. Aroma",
                "city": "Cochabamba",
                "state": "Cochabamba",
                "country": "Bolivia",
                "description": "Terminal de buses de Cochabamba"
            },
            {
                "name": "Terminal Samaipata",
                "latitude": -18.183333,
                "longitude": -63.866667,
                "address": "Calle Principal",
                "city": "Samaipata",
                "state": "Santa Cruz",
                "country": "Bolivia",
                "description": "Terminal de Samaipata"
            },
            {
                "name": "Terminal Mairana",
                "latitude": -18.116667,
                "longitude": -63.95,
                "address": "Av. Principal",
                "city": "Mairana",
                "state": "Santa Cruz",
                "country": "Bolivia",
                "description": "Terminal de Mairana"
            }
        ]
        
        locations = {}
        for location_info in location_data:
            location = Location(**location_info)
            db.add(location)
            db.flush()  # Flush to get IDs
            locations[location_info["name"]] = location
        
        # Create sample routes with location references
        route_data = [
            {
                "origin_location_id": locations["Terminal Bimodal Santa Cruz"].id,
                "destination_location_id": locations["Terminal Comarapa"].id,
                "distance": 240.5,
                "duration": 4.5,
                "price": 35.0
            },
            {
                "origin_location_id": locations["Terminal Comarapa"].id,
                "destination_location_id": locations["Terminal Cochabamba"].id,
                "distance": 195.0,
                "duration": 3.5,
                "price": 40.0
            },
            {
                "origin_location_id": locations["Terminal Bimodal Santa Cruz"].id,
                "destination_location_id": locations["Terminal Samaipata"].id,
                "distance": 120.0,
                "duration": 2.0,
                "price": 25.0
            },
            {
                "origin_location_id": locations["Terminal Comarapa"].id,
                "destination_location_id": locations["Terminal Samaipata"].id,
                "distance": 120.5,
                "duration": 2.5,
                "price": 20.0
            },
            {
                "origin_location_id": locations["Terminal Bimodal Santa Cruz"].id,
                "destination_location_id": locations["Terminal Mairana"].id,
                "distance": 150.0,
                "duration": 2.75,
                "price": 30.0
            }
        ]
        
        routes = []
        for route_info in route_data:
            route = Route(**route_info)
            db.add(route)
            routes.append(route)

        # Create sample passengers with realistic Bolivian names
        passenger_data = [
            ("Carlos", "Rodríguez", "77612321", date(1990, 5, 15)),
            ("María", "Flores", "77612322", date(1985, 8, 22)),
            ("Juan", "Gutiérrez", "77612323", date(1992, 3, 10)),
            ("Ana", "Mendoza", "77612324", date(1988, 11, 28)),
            ("Luis", "Vargas", "77612325", date(1995, 7, 4))
        ]
        
        for name, lastname, phone, birth in passenger_data:
            passenger = Passenger(
                name=name,
                lastname=lastname,
                phone_number=phone,
                birth_date=birth
            )
            db.add(passenger)

        # Create sample drivers
        driver_data = [
            ("Roberto", "Mercado", "77612326", date(1980, 6, 12), "LC123456", 15),
            ("Miguel", "Suárez", "77612327", date(1975, 9, 8), "LC234567", 20),
            ("David", "Castro", "77612328", date(1982, 4, 25), "LC345678", 12),
            ("Pedro", "Torres", "77612329", date(1978, 12, 3), "LC456789", 18),
            ("José", "Peredo", "77612330", date(1985, 2, 15), "LC567890", 10)
        ]
        
        drivers = []
        for name, lastname, phone, birth, license, exp in driver_data:
            driver = Driver(
                name=name,
                lastname=lastname,
                phone_number=phone,
                birth_date=birth,
                license_number=license,
                experience_years=exp
            )
            db.add(driver)
            drivers.append(driver)

        # Create sample buses with realistic models
        bus_data = [
            ("2312ABC", 45, "Mercedes Benz O-500"),
            ("2313DEF", 50, "Volvo 9800"),
            ("2314GHI", 42, "Scania K410"),
            ("2315JKL", 48, "Mercedes Benz O-400"),
            ("2316MNO", 46, "Volvo B420R")
        ]
        
        buses = []
        for plate, capacity, model in bus_data:
            bus = Bus(
                license_plate=plate,
                capacity=capacity,
                model=model
            )
            db.add(bus)
            buses.append(bus)

        # Create sample assistants
        assistant_data = [
            ("Fernando", "77612331"),
            ("Patricia", "77612332"),
            ("Ricardo", "77612333"),
            ("Carmen", "77612334"),
            ("Daniel", "77612335")
        ]
        
        assistants = []
        for name, phone in assistant_data:
            assistant = Assistant(
                first_name=name,
                phone_number=phone
            )
            db.add(assistant)
            assistants.append(assistant)

        # Commit first batch to get IDs
        db.commit()

        # Create sample trips with different dates and times
        trip_times = [
            datetime(2024, 3, 23, 8, 0),   # 8:00 AM
            datetime(2024, 3, 23, 14, 30),  # 2:30 PM
            datetime(2024, 3, 23, 20, 0),   # 8:00 PM
            datetime(2024, 3, 24, 6, 0),    # 6:00 AM next day
            datetime(2024, 3, 24, 16, 0)    # 4:00 PM next day
        ]

        for i in range(5):
            trip = Trip(
                trip_datetime=trip_times[i],
                driver_id=drivers[i].id,
                assistant_id=assistants[i].id,
                bus_id=buses[i].id,
                route_id=routes[i].id
            )
            db.add(trip)

        # Final commit
        db.commit()
        print("Database seeded successfully!")
        
    except Exception as e:
        db.rollback()
        print(f"Error seeding database: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    seed_db()