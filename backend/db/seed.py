from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
from models.driver import Driver
from models.bus import Bus
from models.assistant import Assistant
from models.trip import Trip
from models.route import Route
from models.location import Location
from models.client import Client
from models.seat import Seat
from models.ticket import Ticket
from models.secretary import Secretary
from models.package import Package
from models.user import User, UserRole
from models.administrator import Administrator
from models.office import Office
from db.base import Base
from db.session import get_db
from dotenv import load_dotenv
import os
from datetime import datetime, date, timedelta
import random
import warnings
from faker import Faker

# Suprimir advertencias de passlib/bcrypt
warnings.filterwarnings("ignore", message=".*error reading bcrypt version.*")

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
        db.query(Package).delete()
        db.query(Seat).delete()
        db.query(Trip).delete()
        db.query(Client).delete()
        db.query(Route).delete()
        db.query(Assistant).delete()
        db.query(Driver).delete()
        db.query(Bus).delete()
        db.query(Office).delete()
        db.query(Location).delete()
        db.query(Secretary).delete()
        db.query(Administrator).delete()
        db.query(User).delete()

        db.commit()
        print("Database cleared successfully!")
    except Exception as e:
        db.rollback()
        print(f"Error clearing database: {e}")
    finally:
        db.close()

def seed_db():
    db = SessionLocal()
    # Inicializar Faker con localización española para nombres más realistas
    fake = Faker(['es_ES'])
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

        # Crear oficinas en las ubicaciones
        office_data = [
            {
                "name": "Oficina Central Santa Cruz",
                "phone": "33445566",
                "email": "santacruz@transcomarapa.com",
                "location_id": locations["Terminal Bimodal Santa Cruz"].id
            },
            {
                "name": "Oficina Cochabamba",
                "phone": "44556677",
                "email": "cochabamba@transcomarapa.com",
                "location_id": locations["Terminal Cochabamba"].id
            },
            {
                "name": "Oficina Comarapa",
                "phone": "77889900",
                "email": "comarapa@transcomarapa.com",
                "location_id": locations["Terminal Comarapa"].id
            },
            {
                "name": "Oficina Samaipata",
                "phone": "66778899",
                "email": "samaipata@transcomarapa.com",
                "location_id": locations["Terminal Samaipata"].id
            },
            {
                "name": "Oficina Mairana",
                "phone": "55667788",
                "email": "mairana@transcomarapa.com",
                "location_id": locations["Terminal Mairana"].id
            }
        ]

        offices = {}
        for office_info in office_data:
            office = Office(**office_info)
            db.add(office)
            db.flush()  # Flush to get IDs
            offices[office_info["name"]] = office

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

        # Crear usuarios para clientes primero
        client_user_data = []
        for i in range(10):
            # Generar un nombre de usuario único con un timestamp
            timestamp = int(datetime.now().timestamp()) + i
            client_user = {
                "username": f"cliente{i+1}_{timestamp}",
                "email": fake.email(),
                "role": "client",
                "hashed_password": User.get_password_hash(f"cliente{i+1}"),
                "full_name": fake.name(),
                "is_active": True,
                "is_admin": False
            }
            client_user_data.append(client_user)

        client_users = []
        for user_info in client_user_data:
            user = User(**user_info)
            db.add(user)
            client_users.append(user)

        # Commit para obtener IDs de usuarios
        db.commit()

        # Crear clientes con datos realistas bolivianos
        client_data = []
        bolivian_cities = ["Santa Cruz de la Sierra", "La Paz", "Cochabamba", "Sucre", "Tarija", "Oruro", "Potosí", "Trinidad", "Cobija"]
        bolivian_states = ["Santa Cruz", "La Paz", "Cochabamba", "Chuquisaca", "Tarija", "Oruro", "Potosí", "Beni", "Pando"]

        for i, user in enumerate(client_users):
            client_info = {
                "name": user.full_name,  # Nombre completo
                "phone": f"7{random.randint(1000000, 9999999)}",  # Número de teléfono boliviano
                "address": fake.street_address(),
                "city": random.choice(bolivian_cities),
                "state": random.choice(bolivian_states),
                "birth_date": fake.date_of_birth(minimum_age=18, maximum_age=70),
                "user_id": user.id
            }
            client_data.append(client_info)

        clients = []
        for client_info in client_data:
            client = Client(**client_info)
            db.add(client)
            clients.append(client)

        # Crear usuarios para conductores primero
        driver_user_data = []
        for i in range(5):
            # Generar un nombre de usuario único con un timestamp
            timestamp = int(datetime.now().timestamp()) + i + 100
            driver_user = {
                "username": f"conductor{i+1}_{timestamp}",
                "email": fake.email(),
                "role": "driver",
                "hashed_password": User.get_password_hash(f"conductor{i+1}"),
                "full_name": fake.name(),
                "is_active": True,
                "is_admin": False
            }
            driver_user_data.append(driver_user)

        driver_users = []
        for user_info in driver_user_data:
            user = User(**user_info)
            db.add(user)
            driver_users.append(user)

        # Commit para obtener IDs de usuarios
        db.commit()

        # Crear conductores con datos realistas bolivianos
        driver_data = []
        license_types = ["A", "B", "C", "P"]
        status_options = ["active", "on_leave", "suspended", "inactive"]

        for i, user in enumerate(driver_users):
            # Fecha de vencimiento de licencia entre 1 y 5 años en el futuro
            expiry_years = random.randint(1, 5)
            license_expiry = date.today().replace(year=date.today().year + expiry_years)

            driver_info = {
                "name": user.full_name,  # Nombre completo
                "phone": f"7{random.randint(1000000, 9999999)}",  # Número de teléfono boliviano
                "birth_date": fake.date_of_birth(minimum_age=25, maximum_age=60),
                "license_number": f"LC{random.randint(100000, 999999)}",
                "license_type": random.choice(license_types),
                "license_expiry": license_expiry,
                "status": random.choice(status_options),
                "user_id": user.id
            }
            driver_data.append(driver_info)

        drivers = []
        for driver_info in driver_data:
            driver = Driver(**driver_info)
            db.add(driver)
            drivers.append(driver)

        # Create sample buses with realistic models
        bus_models = ["Mercedes Benz O-500", "Volvo 9800", "Scania K410", "Mercedes Benz O-400", "Volvo B420R"]
        bus_capacities = [45, 50, 42, 48, 46]
        bus_data = []

        for i in range(5):
            # Generar placas únicas con timestamp
            timestamp = str(int(datetime.now().timestamp()) + i)[-4:]
            license_plate = f"{timestamp}ABC{i}"

            bus_info = {
                "license_plate": license_plate,
                "capacity": bus_capacities[i],
                "model": bus_models[i]
            }
            bus_data.append(bus_info)

        buses = []
        for bus_info in bus_data:
            bus = Bus(**bus_info)
            db.add(bus)
            buses.append(bus)

        # Crear usuario administrador
        # Generar un nombre de usuario y email únicos con un timestamp
        timestamp = int(datetime.now().timestamp())
        admin_user = User(
            username=f"admin_{timestamp}",
            email=f"admin_{timestamp}@transcomarapa.com",
            role="admin",
            hashed_password=User.get_password_hash("admin123"),
            full_name="Administrador Sistema",
            is_active=True,
            is_admin=True
        )
        db.add(admin_user)
        db.commit()

        # Crear administrador asociado al usuario admin
        administrator = Administrator(
            name="Administrador Sistema",
            phone="77000000",
            birth_date=date(1980, 1, 1),
            user_id=admin_user.id
        )
        db.add(administrator)
        db.commit()

        # Crear usuarios para secretarios
        secretary_user_data = []
        for i in range(5):
            # Generar un nombre de usuario único con un timestamp
            timestamp = int(datetime.now().timestamp()) + i + 300
            secretary_user = {
                "username": f"secretario{i+1}_{timestamp}",
                "email": fake.email(),
                "role": "secretary",
                "hashed_password": User.get_password_hash(f"secretario{i+1}"),
                "full_name": fake.name(),
                "is_active": True,
                "is_admin": False
            }
            secretary_user_data.append(secretary_user)

        secretary_users = []
        for user_info in secretary_user_data:
            user = User(**user_info)
            db.add(user)
            secretary_users.append(user)

        # Commit para obtener IDs de usuarios
        db.commit()

        # Crear secretarios con datos realistas bolivianos
        secretary_data = []
        office_names = list(offices.keys())

        for i, user in enumerate(secretary_users):
            # Asignar una oficina aleatoria a cada secretario
            office_name = random.choice(office_names)

            secretary_info = {
                "name": user.full_name,  # Nombre completo
                "phone": f"7{random.randint(1000000, 9999999)}",  # Número de teléfono boliviano
                "birth_date": fake.date_of_birth(minimum_age=22, maximum_age=55),
                "office_id": offices[office_name].id,
                "user_id": user.id
            }
            secretary_data.append(secretary_info)

        secretaries = []
        for secretary_info in secretary_data:
            secretary = Secretary(**secretary_info)
            db.add(secretary)
            secretaries.append(secretary)

        # Crear usuarios para asistentes primero
        assistant_user_data = []
        for i in range(5):
            # Generar un nombre de usuario único con un timestamp
            timestamp = int(datetime.now().timestamp()) + i + 200
            assistant_user = {
                "username": f"asistente{i+1}_{timestamp}",
                "email": fake.email(),
                "role": "assistant",
                "hashed_password": User.get_password_hash(f"asistente{i+1}"),
                "full_name": fake.name(),
                "is_active": True,
                "is_admin": False
            }
            assistant_user_data.append(assistant_user)

        assistant_users = []
        for user_info in assistant_user_data:
            user = User(**user_info)
            db.add(user)
            assistant_users.append(user)

        # Commit para obtener IDs de usuarios
        db.commit()

        # Crear asistentes con datos realistas bolivianos
        assistant_data = []

        for i, user in enumerate(assistant_users):
            assistant_info = {
                "name": user.full_name,  # Nombre completo
                "phone": f"7{random.randint(1000000, 9999999)}",  # Número de teléfono boliviano
                "birth_date": fake.date_of_birth(minimum_age=20, maximum_age=50),
                "user_id": user.id
            }
            assistant_data.append(assistant_info)

        assistants = []
        for assistant_info in assistant_data:
            assistant = Assistant(**assistant_info)
            db.add(assistant)
            assistants.append(assistant)

        # Commit first batch to get IDs
        db.commit()

        # Crear viajes con fechas y horas variadas
        trips = []

        # Generar fechas para los próximos 30 días
        today = date.today()
        future_dates = [today + timedelta(days=i) for i in range(30)]

        # Horarios comunes de salida
        departure_times = [
            (6, 0),    # 6:00 AM
            (8, 30),   # 8:30 AM
            (11, 0),   # 11:00 AM
            (14, 30),  # 2:30 PM
            (17, 0),   # 5:00 PM
            (20, 0),   # 8:00 PM
            (22, 30)   # 10:30 PM
        ]

        # Crear 20 viajes con combinaciones aleatorias
        for _ in range(20):
            # Seleccionar fecha y hora aleatorias
            trip_date = random.choice(future_dates)
            hour, minute = random.choice(departure_times)
            trip_datetime = datetime.combine(trip_date, datetime.min.time()).replace(hour=hour, minute=minute)

            # Seleccionar conductor, asistente, bus, ruta y secretario aleatorios
            driver = random.choice(drivers)
            assistant = random.choice(assistants)
            bus = random.choice(buses)
            route = random.choice(routes)
            secretary = random.choice(secretaries)

            trip = Trip(
                trip_datetime=trip_datetime,
                driver_id=driver.id,
                assistant_id=assistant.id,
                bus_id=bus.id,
                route_id=route.id,
                secretary_id=secretary.id
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

        # Crear tickets para algunos viajes
        ticket_states = ["reserved", "purchased", "cancelled", "used"]

        for trip in trips:
            # Para cada viaje, crear entre 10-20 tickets
            num_tickets = random.randint(10, 20)
            # Obtener asientos para este bus
            bus_seats = seats_by_bus.get(trip.bus_id, [])

            if bus_seats:
                # Seleccionar asientos aleatorios para este viaje
                selected_seats = random.sample(bus_seats, min(num_tickets, len(bus_seats)))

                for seat in selected_seats:
                    # Seleccionar un cliente aleatorio
                    client = random.choice(clients)
                    # Crear ticket
                    ticket = Ticket(
                        seat_id=seat.id,
                        client_id=client.id,
                        trip_id=trip.id,
                        state=random.choice(ticket_states),
                        secretary_id=random.choice(secretaries).id  # Asignar un secretario aleatorio a cada ticket
                    )
                    db.add(ticket)

        # Crear paquetes de muestra
        package_statuses = ["pending", "in_transit", "delivered", "cancelled"]
        package_names = ["Documentos", "Ropa", "Electrónicos", "Alimentos", "Medicamentos", "Libros", "Herramientas"]
        package_descriptions = [
            "Documentos importantes",
            "Ropa de temporada",
            "Equipos electrónicos delicados",
            "Productos alimenticios no perecederos",
            "Medicamentos urgentes",
            "Material educativo",
            "Herramientas de trabajo"
        ]

        for trip in trips:
            # Para cada viaje, crear entre 3-8 paquetes
            num_packages = random.randint(3, 8)

            for _ in range(num_packages):
                # Seleccionar remitente y destinatario aleatorios (clientes diferentes)
                sender = random.choice(clients)
                recipient = random.choice([c for c in clients if c.id != sender.id])

                # Seleccionar nombre y descripción aleatorios
                name_index = random.randint(0, len(package_names) - 1)
                name = package_names[name_index]
                # Acortar la descripción para evitar errores de longitud
                description = package_descriptions[name_index][:50]

                # Crear paquete
                package = Package(
                    name=name,
                    description=description,
                    weight=round(random.uniform(0.5, 20.0), 2),  # Peso entre 0.5 y 20 kg
                    price=round(random.uniform(10.0, 100.0), 2),  # Precio entre 10 y 100 Bs
                    status=random.choice(package_statuses),
                    sender_id=sender.id,
                    recipient_id=recipient.id,
                    trip_id=trip.id,
                    secretary_id=random.choice(secretaries).id  # Asignar un secretario aleatorio a cada paquete
                )
                db.add(package)

        # Final commit
        db.commit()
        print("Database seeded successfully!")

    except Exception as e:
        db.rollback()
        print(f"Error seeding database: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    # Comentamos la limpieza de la base de datos para evitar problemas con las claves foráneas
    # clear_db()
    seed_db()