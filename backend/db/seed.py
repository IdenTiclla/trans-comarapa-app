from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
from models.passenger import Passenger
from models.driver import Driver
from models.bus import Bus
from models.assistant import Assistant
from models.trip import Trip
from models.route import Route
from models.location import Location
from models.client import Client
from models.seat import Seat
from models.ticket import Ticket
from db.base import Base
from db.session import get_db
from dotenv import load_dotenv
import os
from datetime import datetime, date, timedelta
import random

# Load environment variables
load_dotenv()
DATABASE_URL = os.getenv("DATABASE_URL")

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def clear_db():
    db = SessionLocal()
    try:
        # Delete all data in reverse order of dependencies
        db.query(Ticket).delete()
        db.query(Seat).delete()
        db.query(Trip).delete()
        db.query(Client).delete()
        db.query(Route).delete()
        db.query(Assistant).delete()
        db.query(Driver).delete()
        db.query(Bus).delete()
        db.query(Location).delete()
        db.query(Passenger).delete()
        
        db.commit()
        print("Database cleared successfully!")
    except Exception as e:
        db.rollback()
        print(f"Error clearing database: {e}")
    finally:
        db.close()

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

        # Create sample clients with realistic Bolivian names and data
        client_data = [
            {
                "name": "Carlos Rodríguez",
                "email": "carlos.rodriguez@gmail.com",
                "phone": "77612321",
                "address": "Av. Banzer #123",
                "city": "Santa Cruz de la Sierra",
                "state": "Santa Cruz",
                "birth_date": date(1990, 5, 15)
            },
            {
                "name": "María Flores",
                "email": "maria.flores@gmail.com",
                "phone": "77612322",
                "address": "Calle Los Pinos #456",
                "city": "Cochabamba",
                "state": "Cochabamba",
                "birth_date": date(1985, 8, 22)
            },
            {
                "name": "Juan Gutiérrez",
                "email": "juan.gutierrez@gmail.com",
                "phone": "77612323",
                "address": "Av. América #789",
                "city": "La Paz",
                "state": "La Paz",
                "birth_date": date(1992, 3, 10)
            },
            {
                "name": "Ana Mendoza",
                "email": "ana.mendoza@gmail.com",
                "phone": "77612324",
                "address": "Calle Ballivián #234",
                "city": "Santa Cruz de la Sierra",
                "state": "Santa Cruz",
                "birth_date": date(1988, 11, 28)
            },
            {
                "name": "Luis Vargas",
                "email": "luis.vargas@gmail.com",
                "phone": "77612325",
                "address": "Av. Centenario #567",
                "city": "Cobija",
                "state": "Pando",
                "birth_date": date(1995, 7, 4)
            },
            {
                "name": "Elena Torrez",
                "email": "elena.torrez@gmail.com",
                "phone": "77612326",
                "address": "Calle Jordan #890",
                "city": "Cochabamba",
                "state": "Cochabamba",
                "birth_date": date(1991, 2, 18)
            },
            {
                "name": "Jorge Villanueva",
                "email": "jorge.villanueva@gmail.com",
                "phone": "77612327",
                "address": "Av. Santos Dumont #345",
                "city": "Santa Cruz de la Sierra",
                "state": "Santa Cruz",
                "birth_date": date(1987, 9, 30)
            },
            {
                "name": "Patricia Rojas",
                "email": "patricia.rojas@gmail.com",
                "phone": "77612328",
                "address": "Calle 6 de Agosto #678",
                "city": "La Paz",
                "state": "La Paz",
                "birth_date": date(1993, 6, 12)
            },
            {
                "name": "Roberto Mercado",
                "email": "roberto.mercado@gmail.com",
                "phone": "77612329",
                "address": "Av. Irala #901",
                "city": "Santa Cruz de la Sierra",
                "state": "Santa Cruz",
                "birth_date": date(1984, 12, 5)
            },
            {
                "name": "Clara Quispe",
                "email": "clara.quispe@gmail.com",
                "phone": "77612330",
                "address": "Calle Murillo #234",
                "city": "Oruro",
                "state": "Oruro",
                "birth_date": date(1996, 4, 25)
            }
        ]
        
        clients = []
        for client_info in client_data:
            client = Client(**client_info)
            db.add(client)
            clients.append(client)

        # Create sample drivers with realistic Bolivian data
        driver_data = [
            {
                "name": "Roberto",
                "lastname": "Mercado",
                "phone_number": "77612326",
                "birth_date": date(1980, 6, 12),
                "license_number": "LC123456",
                "experience_years": 15
            },
            {
                "name": "Miguel",
                "lastname": "Suárez",
                "phone_number": "77612327",
                "birth_date": date(1975, 9, 8),
                "license_number": "LC234567",
                "experience_years": 20
            },
            {
                "name": "David",
                "lastname": "Castro",
                "phone_number": "77612328",
                "birth_date": date(1982, 4, 25),
                "license_number": "LC345678",
                "experience_years": 12
            },
            {
                "name": "Pedro",
                "lastname": "Torres",
                "phone_number": "77612329",
                "birth_date": date(1978, 12, 3),
                "license_number": "LC456789",
                "experience_years": 18
            },
            {
                "name": "José",
                "lastname": "Peredo",
                "phone_number": "77612330",
                "birth_date": date(1985, 2, 15),
                "license_number": "LC567890",
                "experience_years": 10
            }
        ]
        
        drivers = []
        for driver_info in driver_data:
            driver = Driver(**driver_info)
            db.add(driver)
            drivers.append(driver)

        # Create sample buses with realistic models
        bus_data = [
            {
                "license_plate": "2312ABC",
                "capacity": 45,
                "model": "Mercedes Benz O-500"
            },
            {
                "license_plate": "2313DEF",
                "capacity": 50,
                "model": "Volvo 9800"
            },
            {
                "license_plate": "2314GHI",
                "capacity": 42,
                "model": "Scania K410"
            },
            {
                "license_plate": "2315JKL",
                "capacity": 48,
                "model": "Mercedes Benz O-400"
            },
            {
                "license_plate": "2316MNO",
                "capacity": 46,
                "model": "Volvo B420R"
            }
        ]
        
        buses = []
        for bus_info in bus_data:
            bus = Bus(**bus_info)
            db.add(bus)
            buses.append(bus)

        # Create sample assistants
        assistant_data = [
            {
                "first_name": "Fernando",
                "phone_number": "77612331"
            },
            {
                "first_name": "Patricia",
                "phone_number": "77612332"
            },
            {
                "first_name": "Ricardo",
                "phone_number": "77612333"
            },
            {
                "first_name": "Carmen",
                "phone_number": "77612334"
            },
            {
                "first_name": "Daniel",
                "phone_number": "77612335"
            }
        ]
        
        assistants = []
        for assistant_info in assistant_data:
            assistant = Assistant(**assistant_info)
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

        trips = []
        for i in range(5):
            trip = Trip(
                trip_datetime=trip_times[i],
                driver_id=drivers[i].id,
                assistant_id=assistants[i].id,
                bus_id=buses[i].id,
                route_id=routes[i].id
            )
            db.add(trip)
            trips.append(trip)
        
        db.commit()
        
        # Create seats for each bus
        for bus in buses:
            # Create realistic seat layout based on bus capacity
            capacity = bus.capacity
            # For simplicity, we'll create single deck buses with seats arranged in rows
            # Each row has 4 seats (2 on each side of aisle)
            rows = capacity // 4
            remaining = capacity % 4
            
            seat_count = 1
            # Add seats in rows
            for row in range(1, rows + 1):
                for position in ["A", "B", "C", "D"]:
                    seat = Seat(
                        bus_id=bus.id,
                        seat_number=seat_count,
                        deck="main"  # For now, all buses are single deck
                    )
                    db.add(seat)
                    seat_count += 1
            
            # Add remaining seats
            for i in range(remaining):
                seat = Seat(
                    bus_id=bus.id,
                    seat_number=seat_count,
                    deck="main"
                )
                db.add(seat)
                seat_count += 1
        
        db.commit()
        
        # Get all seats for reference
        all_seats = db.query(Seat).all()
        seats_by_bus = {}
        for seat in all_seats:
            if seat.bus_id not in seats_by_bus:
                seats_by_bus[seat.bus_id] = []
            seats_by_bus[seat.bus_id].append(seat)
        
        # Create tickets for some trips
        ticket_states = ["reserved", "purchased", "cancelled", "used"]
        
        for trip in trips:
            # For each trip, create 10-20 tickets
            num_tickets = random.randint(10, 20)
            # Get seats for this bus
            bus_seats = seats_by_bus.get(trip.bus_id, [])
            
            if bus_seats:
                # Randomly select seats for this trip
                selected_seats = random.sample(bus_seats, min(num_tickets, len(bus_seats)))
                
                for seat in selected_seats:
                    # Randomly select a client
                    client = random.choice(clients)
                    # Create ticket
                    ticket = Ticket(
                        seat_id=seat.id,
                        client_id=client.id,
                        trip_id=trip.id,
                        state=random.choice(ticket_states)
                    )
                    db.add(ticket)
        
        # Final commit
        db.commit()
        print("Database seeded successfully!")
        
    except Exception as e:
        db.rollback()
        print(f"Error seeding database: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    clear_db()
    seed_db()