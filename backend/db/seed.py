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
from models.package_item import PackageItem
from models.user import User, UserRole
from models.administrator import Administrator
from models.office import Office
from models.activity import Activity as ActivityModel
from models.ticket_state_history import TicketStateHistory
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
        db.query(TicketStateHistory).delete()
        db.query(Ticket).delete()
        db.query(PackageItem).delete()
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
        db.query(ActivityModel).delete()
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
        num_clients_to_create = 40 # Increased from 10
        for i in range(num_clients_to_create):
            full_name = fake.name()
            name_parts = full_name.split()
            firstname = name_parts[0]
            if len(name_parts) > 1:
                lastname = " ".join(name_parts[1:])
            elif len(name_parts) == 1:
                lastname = name_parts[0]
            else:
                lastname = "ApellidoPorDefecto"

            timestamp = int(datetime.now().timestamp()) + i
            client_user = {
                "username": f"cliente{i+1}_{timestamp}",
                "email": fake.email(),
                "firstname": firstname,
                "lastname": lastname,
                "role": "client",
                "hashed_password": User.get_password_hash(f"cliente{i+1}"),
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

        # Generar nombres completos para los clientes
        client_full_names = [fake.name() for _ in range(len(client_users))]

        for i, user in enumerate(client_users):
            # Dividir el nombre completo en nombre y apellido
            name_parts = client_full_names[i].split()
            firstname = name_parts[0]
            lastname = " ".join(name_parts[1:]) if len(name_parts) > 1 else ""

            # Generar CI boliviano realista (7-10 dígitos)
            ci_length = random.choice([7, 8, 9, 10])
            document_id = str(random.randint(10**(ci_length-1), 10**ci_length - 1))

            client_info = {
                "firstname": firstname,
                "lastname": lastname,
                "document_id": document_id,  # Nuevo campo CI
                "phone": f"7{random.randint(1000000, 9999999)}",  # Número de teléfono boliviano
                "email": fake.email(),  # Agregar email aleatorio
                "address": fake.street_address(),
                "city": random.choice(bolivian_cities),
                "state": random.choice(bolivian_states),
                "birth_date": fake.date_of_birth(minimum_age=18, maximum_age=70),
                "is_minor": False,  # Agregar campo is_minor
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
        num_drivers_to_create = 10 # Increased from 5
        for i in range(num_drivers_to_create):
            full_name = fake.name()
            name_parts = full_name.split()
            firstname = name_parts[0]
            if len(name_parts) > 1:
                lastname = " ".join(name_parts[1:])
            elif len(name_parts) == 1:
                lastname = name_parts[0]
            else:
                lastname = "ApellidoPorDefecto"

            timestamp = int(datetime.now().timestamp()) + i + (num_clients_to_create * 2) # Adjust timestamp offset
            driver_user = {
                "username": f"conductor{i+1}_{timestamp}",
                "email": fake.email(),
                "firstname": firstname,
                "lastname": lastname,
                "role": "driver",
                "hashed_password": User.get_password_hash(f"conductor{i+1}"),
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

        # Generar nombres completos para los conductores
        driver_full_names = [fake.name() for _ in range(len(driver_users))]

        for i, user in enumerate(driver_users):
            # Fecha de vencimiento de licencia entre 1 y 5 años en el futuro
            expiry_years = random.randint(1, 5)
            license_expiry = date.today().replace(year=date.today().year + expiry_years)

            # Dividir el nombre completo en nombre y apellido
            name_parts = driver_full_names[i].split()
            firstname = name_parts[0]
            lastname = " ".join(name_parts[1:]) if len(name_parts) > 1 else ""

            driver_info = {
                "firstname": firstname,
                "lastname": lastname,
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
        admin_full_name = fake.name() # Usar fake para consistencia, aunque luego se sobreescriba en AdministratorModel
        admin_name_parts = admin_full_name.split()
        admin_firstname = admin_name_parts[0]
        if len(admin_name_parts) > 1:
            admin_lastname = " ".join(admin_name_parts[1:])
        elif len(admin_name_parts) == 1:
            admin_lastname = admin_name_parts[0]
        else:
            admin_lastname = "AdminLastNameDefault"

        timestamp = int(datetime.now().timestamp())
        admin_user = User(
            username=f"admin_{timestamp}",
            email=f"admin_{timestamp}@transcomarapa.com",
            firstname=admin_firstname,
            lastname=admin_lastname,
            role="admin",
            hashed_password=User.get_password_hash("admin123"),
            is_active=True,
            is_admin=True
        )
        db.add(admin_user)
        db.commit()

        # Crear administrador asociado al usuario admin
        administrator = Administrator(
            firstname="Administrador",
            lastname="Sistema",
            phone="77000000",
            birth_date=date(1980, 1, 1),
            user_id=admin_user.id
        )
        db.add(administrator)
        db.commit()

        # Crear usuarios para secretarios
        secretary_user_data = []
        num_secretaries_to_create = 7 # Increased from 5
        for i in range(num_secretaries_to_create):
            full_name = fake.name()
            name_parts = full_name.split()
            firstname = name_parts[0]
            if len(name_parts) > 1:
                lastname = " ".join(name_parts[1:])
            elif len(name_parts) == 1:
                lastname = name_parts[0]
            else:
                lastname = "ApellidoPorDefecto"

            timestamp = int(datetime.now().timestamp()) + i + (num_clients_to_create * 2 + num_drivers_to_create * 2) # Adjust timestamp offset
            secretary_user = {
                "username": f"secretario{i+1}_{timestamp}",
                "email": fake.email(),
                "firstname": firstname,
                "lastname": lastname,
                "role": "secretary",
                "hashed_password": User.get_password_hash(f"secretario{i+1}"),
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

        # Generar nombres completos para los secretarios
        secretary_full_names = [fake.name() for _ in range(len(secretary_users))]

        for i, user in enumerate(secretary_users):
            # Asignar una oficina aleatoria a cada secretario
            office_name = random.choice(office_names)

            # Dividir el nombre completo en nombre y apellido
            name_parts = secretary_full_names[i].split()
            firstname = name_parts[0]
            lastname = " ".join(name_parts[1:]) if len(name_parts) > 1 else ""

            secretary_info = {
                "firstname": firstname,
                "lastname": lastname,
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
        num_assistants_to_create = 10 # Increased from 5
        for i in range(num_assistants_to_create):
            full_name = fake.name()
            name_parts = full_name.split()
            firstname = name_parts[0]
            if len(name_parts) > 1:
                lastname = " ".join(name_parts[1:])
            elif len(name_parts) == 1:
                lastname = name_parts[0]
            else:
                lastname = "ApellidoPorDefecto"

            timestamp = int(datetime.now().timestamp()) + i + (num_clients_to_create * 2 + num_drivers_to_create * 2 + num_secretaries_to_create * 2) # Adjust timestamp offset
            assistant_user = {
                "username": f"asistente{i+1}_{timestamp}",
                "email": fake.email(),
                "firstname": firstname,
                "lastname": lastname,
                "role": "assistant",
                "hashed_password": User.get_password_hash(f"asistente{i+1}"),
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

        # Generar nombres completos para los asistentes
        assistant_full_names = [fake.name() for _ in range(len(assistant_users))]

        for i, user in enumerate(assistant_users):
            # Dividir el nombre completo en nombre y apellido
            name_parts = assistant_full_names[i].split()
            firstname = name_parts[0]
            lastname = " ".join(name_parts[1:]) if len(name_parts) > 1 else ""

            assistant_info = {
                "firstname": firstname,
                "lastname": lastname,
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

        # Posibles estados para los viajes
        # Weighted towards 'scheduled' for future dates, others for variety
        possible_trip_statuses = ['scheduled', 'scheduled', 'scheduled', 'scheduled', 'in_progress', 'completed', 'cancelled']

        # Crear 20 viajes con combinaciones aleatorias
        # Increased to 60 trips
        num_trips_to_create = 60
        
        # Define the 6-month date range for trips, tickets, and packages
        now = datetime.now()
        six_months_ago = now - timedelta(days=6*30) # Approximate
        date_range_for_creation = [six_months_ago + timedelta(days=x) for x in range((now - six_months_ago).days + 1)]

        for _ in range(num_trips_to_create):
            # Seleccionar fecha y hora aleatorias within the last 6 months for trip_datetime
            base_trip_date = random.choice(date_range_for_creation).date()
            hour, minute = random.choice(departure_times)
            trip_datetime_val = datetime.combine(base_trip_date, datetime.min.time()).replace(hour=hour, minute=minute, second=0, microsecond=0)

            selected_status = random.choice(possible_trip_statuses)

            # Adjust datetime based on status for realism (simplified for seeding)
            if selected_status == 'completed' or selected_status == 'cancelled':
                # Ensure completed/cancelled trips are in the past portion of the 6 months
                if trip_datetime_val > now - timedelta(days=7): # if in last week, shift further back
                    trip_datetime_val = now - timedelta(days=random.randint(8,180))
            elif selected_status == 'in_progress':
                # Ensure in_progress trips are very recent or today
                trip_datetime_val = now - timedelta(hours=random.randint(0, 24))
            elif selected_status == 'scheduled':
                 # Ensure scheduled trips are in the future, but within a reasonable seeding window (e.g. next 30 days from now)
                if trip_datetime_val <= now:
                    trip_datetime_val = now + timedelta(days=random.randint(1, 30))
                elif trip_datetime_val > now + timedelta(days=60): # if too far in future due to date_range_for_creation
                    trip_datetime_val = now + timedelta(days=random.randint(1,60))

            # Seleccionar conductor, asistente, bus, ruta y secretario aleatorios
            driver = random.choice(drivers)
            assistant = random.choice(assistants)
            bus = random.choice(buses)
            route = random.choice(routes)
            secretary = random.choice(secretaries)

            trip = Trip(
                trip_datetime=trip_datetime_val,
                status=selected_status, # Added status
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
            capacity = bus.capacity
            rows = capacity // 4
            remaining = capacity % 4

            seat_count = 1

            # Lógica para determinar si el bus es de dos pisos
            # Puedes ajustar esto según tu modelo real, aquí se asume que los buses con capacidad > 40 son de dos pisos
            is_double_deck = getattr(bus, "double_deck", False) or capacity > 40

            # Si es de dos pisos, la mitad de los asientos serán FIRST y la otra mitad SECOND
            if is_double_deck:
                half = (capacity // 2)
                for i in range(1, capacity + 1):
                    deck = "FIRST" if i <= half else "SECOND"
                    seat = Seat(
                        bus_id=bus.id,
                        seat_number=i,
                        deck=deck
                    )
                    db.add(seat)
            else:
                # Todos los asientos en FIRST
                for i in range(1, capacity + 1):
                    seat = Seat(
                        bus_id=bus.id,
                        seat_number=i,
                        deck="FIRST"
                    )
                    db.add(seat)

        db.commit()

        # Get all seats for reference
        all_seats = db.query(Seat).all()
        seats_by_bus = {}
        for seat in all_seats:
            if seat.bus_id not in seats_by_bus:
                seats_by_bus[seat.bus_id] = []
            seats_by_bus[seat.bus_id].append(seat)

        # Crear tickets para algunos viajes
        # Estados válidos según el schema TicketBase
        ticket_states = ["pending", "confirmed", "cancelled", "completed"]
        payment_methods = ["cash", "credit_card", "qr_payment", "bank_transfer"]

        for trip in trips:
            # Para cada viaje, crear entre 10-20 tickets
            num_tickets = random.randint(10, 20)
            # Obtener asientos para este bus
            bus_seats = seats_by_bus.get(trip.bus_id, [])

            # Obtener el precio de la ruta asociada al viaje
            # Es importante que 'trip.route' esté cargado o accesible.
            # Si 'trip.route' no está cargado por defecto (lazy loading),
            # podrías necesitar obtener la ruta explícitamente o asegurar que se cargue.
            # Aquí asumimos que 'trip.route' es accesible y tiene un atributo 'price'.
            trip_route = db.query(Route).filter(Route.id == trip.route_id).first()
            ticket_price = trip_route.price if trip_route and trip_route.price is not None else 30.0 # Precio por defecto si no se encuentra

            if bus_seats:
                # Seleccionar asientos aleatorios para este viaje
                # Asegurarse de no seleccionar más asientos de los disponibles
                num_to_select = min(num_tickets, len(bus_seats))
                if num_to_select > 0:
                    selected_seats = random.sample(bus_seats, num_to_select)

                    for seat in selected_seats:
                        # Seleccionar un cliente aleatorio
                        client = random.choice(clients)
                        secretary_for_ticket = random.choice(secretaries)
                        ticket_created_at = trip.trip_datetime - timedelta(days=random.randint(1, 30)) # Ticket created before trip
                        # Ensure ticket_created_at is within the 6-month window
                        if ticket_created_at < six_months_ago:
                            ticket_created_at = six_months_ago + timedelta(days=random.randint(0,5))
                        if ticket_created_at > now:
                            ticket_created_at = now - timedelta(days=random.randint(0, (now - six_months_ago).days))

                        # Determine ticket state based on trip status and creation date
                        current_ticket_state = random.choice(ticket_states)
                        if trip.status == 'completed' and ticket_created_at < trip.trip_datetime:
                            current_ticket_state = 'completed'
                        elif trip.status == 'cancelled':
                            current_ticket_state = 'cancelled'
                        elif trip.status == 'in_progress' and ticket_created_at < trip.trip_datetime:
                            current_ticket_state = 'confirmed' # or completed if it's a short trip
                        elif trip.status == 'scheduled' and ticket_created_at > now:
                            current_ticket_state = 'pending' # Future scheduled trip, ticket likely pending

                        # Crear ticket
                        ticket = Ticket(
                            seat_id=seat.id,
                            client_id=client.id,
                            trip_id=trip.id,
                            state=current_ticket_state,
                            secretary_id=secretary_for_ticket.id,
                            price=ticket_price,
                            payment_method=random.choice(payment_methods),
                            created_at=ticket_created_at
                        )
                        db.add(ticket)
                        db.flush() # Get ticket ID

                        # Log initial state to TicketStateHistory
                        history_entry = TicketStateHistory(
                            ticket_id=ticket.id,
                            old_state=None,
                            new_state=ticket.state,
                            changed_at=ticket.created_at, # Use ticket creation time for initial state
                            changed_by_user_id=secretary_for_ticket.user_id # Associate with secretary who created ticket
                        )
                        db.add(history_entry)

        # Crear paquetes de muestra con nueva estructura PackageItem
        package_statuses = ["registered", "in_transit", "delivered", "cancelled"]
        
        # Datos de items comunes para paquetes
        item_descriptions = [
            "Documentos importantes",
            "Ropa de temporada", 
            "Equipos electrónicos",
            "Productos alimenticios",
            "Medicamentos",
            "Libros y material educativo",
            "Herramientas de trabajo",
            "Artículos de hogar",
            "Productos de belleza",
            "Juguetes",
            "Artículos deportivos",
            "Electrodomésticos pequeños"
        ]

        package_counter = 1
        for trip in trips:
            # Para cada viaje, crear entre 3-8 paquetes
            num_packages = random.randint(3, 8)

            for _ in range(num_packages):
                # Seleccionar remitente y destinatario aleatorios (clientes diferentes)
                sender = random.choice(clients)
                recipient = random.choice([c for c in clients if c.id != sender.id])
                
                # Generar tracking number único
                tracking_number = f"PKG{package_counter:06d}"
                package_counter += 1

                # Crear paquete con nueva estructura
                package_created_at = trip.trip_datetime - timedelta(days=random.randint(1, 15)) # Package created before trip
                 # Ensure package_created_at is within the 6-month window
                if package_created_at < six_months_ago:
                    package_created_at = six_months_ago + timedelta(days=random.randint(0,5))
                if package_created_at > now:
                     package_created_at = now - timedelta(days=random.randint(0, (now - six_months_ago).days))

                current_package_status = random.choice(package_statuses)
                if trip.status == 'completed' and package_created_at < trip.trip_datetime:
                    current_package_status = 'delivered'
                elif trip.status == 'cancelled':
                    current_package_status = 'cancelled'
                elif trip.status == 'in_progress' and package_created_at < trip.trip_datetime:
                    current_package_status = 'in_transit'

                package = Package(
                    tracking_number=tracking_number,
                    total_weight=round(random.uniform(0.5, 20.0), 2),  # Peso total entre 0.5 y 20 kg
                    total_declared_value=round(random.uniform(50.0, 500.0), 2),  # Valor declarado
                    notes=f"Paquete de {sender.firstname} {sender.lastname} para {recipient.firstname} {recipient.lastname}",
                    status=current_package_status,
                    sender_id=sender.id,
                    recipient_id=recipient.id,
                    trip_id=trip.id,
                    secretary_id=random.choice(secretaries).id,
                    created_at=package_created_at
                )
                db.add(package)
                db.flush()  # Para obtener el ID del paquete

                # Crear entre 1-4 items por paquete
                num_items = random.randint(1, 4)
                total_package_amount = 0
                
                for item_index in range(num_items):
                    quantity = random.randint(1, 5)
                    description = random.choice(item_descriptions)
                    unit_price = round(random.uniform(10.0, 100.0), 2)
                    total_price = quantity * unit_price
                    total_package_amount += total_price
                    
                    # Crear item del paquete
                    package_item = PackageItem(
                        quantity=quantity,
                        description=description,
                        unit_price=unit_price,
                        total_price=total_price,
                        package_id=package.id
                    )
                    db.add(package_item)

                # Actualizar el total_amount del paquete (se calculará automáticamente por la propiedad)
                # No necesitamos hacer nada aquí ya que total_amount es una propiedad calculada

        # Commit todos los datos principales antes de crear actividades
        db.commit()

        # --- Seed Activities ---
        print("Seeding activities...")
        activities_to_seed = []

        # Obtener algunos usuarios para asociar actividades
        admin_user_for_activity = db.query(User).filter(User.role == UserRole.ADMIN).first()
        secretary_user_for_activity = db.query(User).filter(User.role == UserRole.SECRETARY).first()
        client_user_for_activity = db.query(User).filter(User.role == UserRole.CLIENT).first()

        # Actividades del sistema
        activities_to_seed.append(ActivityModel(activity_type="Sistema Reiniciado", details="El sistema de seeding completó la carga inicial de datos."))
        activities_to_seed.append(ActivityModel(activity_type="Mantenimiento Programado", details="Próximo mantenimiento el 2024-08-15 03:00 AM"))

        # Actividades asociadas a usuarios (si existen)
        if admin_user_for_activity:
            activities_to_seed.append(ActivityModel(user_id=admin_user_for_activity.id, activity_type="Login Exitoso", details=f"Admin {admin_user_for_activity.username} inició sesión desde IP 192.168.1.100"))
            activities_to_seed.append(ActivityModel(user_id=admin_user_for_activity.id, activity_type="Configuración Actualizada", details="Se actualizó el parámetro MAX_LOGIN_ATTEMPTS a 5."))
        
        if secretary_user_for_activity:
            # Buscar un ticket y paquete para los detalles
            first_ticket = db.query(Ticket).first()
            first_package = db.query(Package).first()

            if first_ticket:
                activities_to_seed.append(ActivityModel(user_id=secretary_user_for_activity.id, activity_type="Nueva Reserva Creada", details=f"Ticket ID: {first_ticket.id} para el viaje ID: {first_ticket.trip_id}"))
            activities_to_seed.append(ActivityModel(user_id=secretary_user_for_activity.id, activity_type="Venta Confirmada", details="Venta de mostrador procesada correctamente."))
            if first_package:
                 activities_to_seed.append(ActivityModel(user_id=secretary_user_for_activity.id, activity_type="Paquete Registrado", details=f"Paquete con tracking: {first_package.tracking_number}"))

        if client_user_for_activity:
            activities_to_seed.append(ActivityModel(user_id=client_user_for_activity.id, activity_type="Perfil Actualizado", details="El cliente actualizó su número de teléfono."))
            activities_to_seed.append(ActivityModel(user_id=client_user_for_activity.id, activity_type="Consulta de Viaje", details="Cliente consultó viajes disponibles para la ruta Santa Cruz - Cochabamba."))

        # Crear algunas actividades más genéricas con fechas variadas
        activity_types_general = ["Actualización de Ruta", "Nuevo Conductor Contratado", "Mantenimiento de Bus", "Promoción Lanzada", "Reporte Generado"]
        sample_details = [
            "Ruta SCZ-CBBA actualizada con nuevo precio.", 
            "Juan Pérez se unió al equipo de conductores.", 
            "Bus con placa 1234ABC completó mantenimiento preventivo.",
            "Descuento del 10% en pasajes para el mes de Agosto.",
            "Reporte de ventas mensual generado exitosamente."
        ]

        all_user_ids = [u.id for u in db.query(User.id).all()] # Obtener todos los user_ids para variedad

        for i in range(10): # Crear 10 actividades genéricas adicionales
            user_id_for_activity = random.choice(all_user_ids) if all_user_ids and random.choice([True, False]) else None
            activity_type_selected = random.choice(activity_types_general)
            detail_selected = random.choice(sample_details) # Podrías hacer esto más específico al tipo
            # Simular fechas pasadas para las actividades
            past_date = datetime.now() - timedelta(days=random.randint(0, 30), hours=random.randint(0,23), minutes=random.randint(0,59))
            
            activities_to_seed.append(ActivityModel(
                user_id=user_id_for_activity,
                activity_type=activity_type_selected,
                details=f"{detail_selected} (ejemplo {i+1})",
                created_at=past_date
            ))

        db.add_all(activities_to_seed)
        print(f"{len(activities_to_seed)} activities seeded.")

        # Final commit
        db.commit()
        print("Database seeded successfully!")

    except Exception as e:
        db.rollback()
        print(f"Error seeding database: {e}")
    finally:
        db.close()

def create_test_users():
    """
    Crea usuarios de prueba con credenciales fijas para facilitar el testing.
    """
    db = SessionLocal()
    try:
        # Limpiar datos existentes para evitar conflictos
        print("Limpiando datos de usuarios de prueba existentes...")
        # Obtener IDs de usuarios de prueba
        test_emails = [
            "admin1@comarapa.com",
            "secretary1@comarapa.com",
            "secretary2@comarapa.com",
            "secretary3@comarapa.com",
            "driver1@comarapa.com",
            "assistant1@comarapa.com",
            "client1@comarapa.com",
            "client2@comarapa.com",
            "client3@comarapa.com",
            "client4@comarapa.com",
            "client5@comarapa.com"
        ]

        for email in test_emails:
            user = db.query(User).filter(User.email == email).first()
            if user:
                # Eliminar entidades asociadas
                if user.role == "admin" or user.role == "ADMIN":
                    db.query(Administrator).filter(Administrator.user_id == user.id).delete()
                elif user.role == "secretary" or user.role == "SECRETARY":
                    db.query(Secretary).filter(Secretary.user_id == user.id).delete()
                elif user.role == "driver" or user.role == "DRIVER":
                    db.query(Driver).filter(Driver.user_id == user.id).delete()
                elif user.role == "assistant" or user.role == "ASSISTANT":
                    db.query(Assistant).filter(Assistant.user_id == user.id).delete()
                elif user.role == "client" or user.role == "CLIENT":
                    db.query(Client).filter(Client.user_id == user.id).delete()

                # Eliminar usuario
                db.delete(user)

        db.commit()
        print("Datos de usuarios de prueba limpiados correctamente")

        # Verificar si hay oficinas, si no hay, crear una
        office_count = db.query(Office).count()
        if office_count == 0:
            print("No hay oficinas en la base de datos. Creando una oficina predeterminada...")
            # Crear una ubicación primero
            location = Location(
                name="Terminal Predeterminada",
                latitude=-17.783333,
                longitude=-63.182222,
                address="Av. Principal",
                city="Santa Cruz de la Sierra",
                state="Santa Cruz",
                country="Bolivia",
                description="Terminal predeterminada para pruebas"
            )
            db.add(location)
            db.flush()  # Para obtener el ID

            # Crear una oficina
            office = Office(
                name="Oficina Predeterminada",
                phone="33445566",
                email="default@transcomarapa.com",
                location_id=location.id
            )
            db.add(office)
            db.commit()
            print(f"Oficina predeterminada creada con ID: {office.id}")

        # Obtener la primera oficina para asignarla a los secretarios
        office = db.query(Office).first()
        # Lista de usuarios de prueba con credenciales fijas
        test_users = [
            {
                "username": "admin1",
                "email": "admin1@comarapa.com",
                "role": "admin",
                "password": "123456",
                "firstname": "Admin",
                "lastname": "Principal",
                "phone": "77123456",
                "birth_date": date(1985, 5, 15)
            },
            {
                "username": "secretary1",
                "email": "secretary1@comarapa.com",
                "role": "secretary",
                "password": "123456",
                "firstname": "Secretaria",
                "lastname": "Principal",
                "phone": "77234567",
                "birth_date": date(1990, 8, 20),
                "office_id": office.id  # Usar la oficina obtenida anteriormente
            },
            {
                "username": "secretary2",
                "email": "secretary2@comarapa.com",
                "role": "secretary",
                "password": "123456",
                "firstname": "Ana",
                "lastname": "García",
                "phone": "77234568",
                "birth_date": date(1988, 6, 12),
                "office_id": office.id
            },
            {
                "username": "secretary3",
                "email": "secretary3@comarapa.com",
                "role": "secretary",
                "password": "123456",
                "firstname": "Carlos",
                "lastname": "López",
                "phone": "77234569",
                "birth_date": date(1992, 9, 8),
                "office_id": office.id
            },
            {
                "username": "driver1",
                "email": "driver1@comarapa.com",
                "role": "driver",
                "password": "123456",
                "firstname": "Conductor",
                "lastname": "Principal",
                "phone": "77345678",
                "birth_date": date(1982, 3, 10),
                "license_number": "LC123456",
                "license_type": "A",
                "license_expiry": date(2025, 12, 31),
                "status": "active"
            },
            {
                "username": "assistant1",
                "email": "assistant1@comarapa.com",
                "role": "assistant",
                "password": "123456",
                "firstname": "Asistente",
                "lastname": "Principal",
                "phone": "77456789",
                "birth_date": date(1995, 7, 5)
            },
            {
                "username": "client1",
                "email": "client1@comarapa.com",
                "role": "client",
                "password": "123456",
                "firstname": "Cliente",
                "lastname": "Principal",
                "phone": "77567890",
                "birth_date": date(1988, 11, 25),
                "document_id": "12693562",  # CI de prueba
                "address": "Av. Principal 123",
                "city": "Santa Cruz de la Sierra",
                "state": "Santa Cruz",
                "is_minor": False
            },
            {
                "username": "client2",
                "email": "client2@comarapa.com",
                "role": "client",
                "password": "123456",
                "firstname": "María",
                "lastname": "González",
                "phone": "77678901",
                "birth_date": date(1992, 3, 15),
                "document_id": "9876543",  # CI de prueba para búsqueda
                "address": "Calle Falsa 456",
                "city": "Cochabamba",
                "state": "Cochabamba",
                "is_minor": False
            },
            {
                "username": "client3",
                "email": "client3@comarapa.com",
                "role": "client",
                "password": "123456",
                "firstname": "Pedro",
                "lastname": "Rojas",
                "phone": "77789012",
                "birth_date": date(1985, 8, 20),
                "document_id": "5432109",  # CI de prueba para búsqueda
                "address": "Av. Libertad 789",
                "city": "La Paz",
                "state": "La Paz",
                "is_minor": False
            },
            {
                "username": "client4",
                "email": "client4@comarapa.com",
                "role": "client",
                "password": "123456",
                "firstname": "Luisa",
                "lastname": "Morales",
                "phone": "77890123",
                "birth_date": date(1990, 12, 3),
                "document_id": "151985270",  # CI que apareció en los logs de error
                "address": "Calle Nueva 321",
                "city": "Santa Cruz de la Sierra",
                "state": "Santa Cruz",
                "is_minor": False
            },
            {
                "username": "client5",
                "email": "client5@comarapa.com",
                "role": "client",
                "password": "123456",
                "firstname": "Roberto",
                "lastname": "Silva",
                "phone": "77901234",
                "birth_date": date(1987, 4, 17),
                "document_id": "9753228",  # CI que apareció en los logs de error
                "address": "Av. Central 654",
                "city": "Cochabamba",
                "state": "Cochabamba",
                "is_minor": False
            }
        ]

        # Crear los usuarios de prueba
        for user_data in test_users:
            # Crear nuevo usuario
            new_user = User(
                username=user_data["username"],
                email=user_data["email"],
                role=user_data["role"],
                hashed_password=User.get_password_hash(user_data["password"]),
                is_active=True,
                is_admin=user_data["role"] == "admin",
                firstname=user_data["firstname"],
                lastname=user_data["lastname"]
            )
            db.add(new_user)
            db.flush()  # Para obtener el ID del usuario
            # Crear la entidad asociada según el rol
            if user_data["role"] == "admin":
                entity = Administrator(
                    firstname=user_data["firstname"],
                    lastname=user_data["lastname"],
                    phone=user_data["phone"],
                    birth_date=user_data["birth_date"],
                    user_id=new_user.id
                )
                db.add(entity)
                db.flush()
            elif user_data["role"] == "secretary":
                entity = Secretary(
                    firstname=user_data["firstname"],
                    lastname=user_data["lastname"],
                    phone=user_data["phone"],
                    birth_date=user_data["birth_date"],
                    office_id=user_data["office_id"],
                    user_id=new_user.id
                )
                db.add(entity)
                db.flush()
            elif user_data["role"] == "driver":
                entity = Driver(
                    firstname=user_data["firstname"],
                    lastname=user_data["lastname"],
                    phone=user_data["phone"],
                    birth_date=user_data["birth_date"],
                    license_number=user_data["license_number"],
                    license_type=user_data["license_type"],
                    license_expiry=user_data["license_expiry"],
                    status=user_data["status"],
                    user_id=new_user.id
                )
                db.add(entity)
                db.flush()
            elif user_data["role"] == "assistant":
                entity = Assistant(
                    firstname=user_data["firstname"],
                    lastname=user_data["lastname"],
                    phone=user_data["phone"],
                    birth_date=user_data["birth_date"],
                    user_id=new_user.id
                )
                db.add(entity)
                db.flush()
            elif user_data["role"] == "client":
                entity = Client(
                    firstname=user_data["firstname"],
                    lastname=user_data["lastname"],
                    document_id=user_data.get("document_id"),  # Nuevo campo CI
                    phone=user_data["phone"],
                    email=user_data["email"],  # Nuevo campo email
                    birth_date=user_data["birth_date"],
                    is_minor=user_data.get("is_minor", False),  # Nuevo campo is_minor
                    address=user_data["address"],
                    city=user_data["city"],
                    state=user_data["state"],
                    user_id=new_user.id
                )
                db.add(entity)
                db.flush()

        # Commit final
        db.commit()
        print("Usuarios de prueba creados/actualizados exitosamente!")

        # Imprimir lista de usuarios para pruebas
        print("\nLista de usuarios para pruebas:")
        print("================================")
        for user_data in test_users:
            print(f"Rol: {user_data['role']}")
            print(f"Email: {user_data['email']}")
            print(f"Contraseña: {user_data['password']}")
            print(f"Nombre: {user_data['firstname']} {user_data['lastname']}")
            if user_data['role'] == 'client' and 'document_id' in user_data:
                print(f"CI: {user_data['document_id']}")
            print("--------------------------------")

        print("\nClientes de prueba para búsqueda:")
        print("=================================")
        print("• Cliente Principal (CI: 12693562)")
        print("• María González (CI: 9876543)")
        print("• Pedro Rojas (CI: 5432109)")
        print("• Luisa Morales (CI: 151985270) - Usado en pruebas de paquetes")
        print("• Roberto Silva (CI: 9753228) - Usado en pruebas de paquetes")
        print("\nSecretarios de prueba:")
        print("======================")
        print("• secretary1@comarapa.com (Secretaria Principal)")
        print("• secretary2@comarapa.com (Ana García)")
        print("• secretary3@comarapa.com (Carlos López)")
        print("Contraseña para todos: 123456")
        print("\nPuedes buscar por nombre, apellido o CI en el frontend")
        print("\nPara registrar paquetes, usa cualquiera de los secretarios de arriba.")

    except Exception as e:
        db.rollback()
        print(f"Error creando usuarios de prueba: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    print("WARNING: The database will be cleared before seeding if clear_db() is called.")
    # Uncomment the next line to clear the database before seeding.
    # Be careful if you have important data!
    clear_db() 
    print("Seeding database with a large set of diverse data...")
    seed_db()
    print("Creating/updating specific test users...")
    create_test_users()
    print("Seeding complete.")