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

            client_info = {
                "firstname": firstname,
                "lastname": lastname,
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

        # Posibles estados para los viajes
        # Weighted towards 'scheduled' for future dates, others for variety
        possible_trip_statuses = ['scheduled', 'scheduled', 'scheduled', 'scheduled', 'in_progress', 'completed', 'cancelled']

        # Crear 20 viajes con combinaciones aleatorias
        # Increased to 60 trips
        num_trips_to_create = 60
        for _ in range(num_trips_to_create):
            # Seleccionar fecha y hora aleatorias
            original_trip_date = random.choice(future_dates) # Start with a future date
            hour, minute = random.choice(departure_times)
            trip_datetime = datetime.combine(original_trip_date, datetime.min.time()).replace(hour=hour, minute=minute, second=0, microsecond=0)

            selected_status = random.choice(possible_trip_statuses)

            # Adjust datetime based on status for realism
            if selected_status == 'completed' or selected_status == 'cancelled':
                # Make it a past date
                days_in_past = random.randint(1, 30)
                trip_datetime = (datetime.now() - timedelta(days=days_in_past)).replace(hour=hour, minute=minute, second=0, microsecond=0)
            elif selected_status == 'in_progress':
                # Make it today (but possibly earlier) or yesterday
                if random.choice([True, False]): # 50% chance for today
                    current_time = datetime.now()
                    # If chosen hour is later than current hour, set to yesterday to make sense
                    if hour > current_time.hour:
                         trip_datetime = (current_time - timedelta(days=1)).replace(hour=hour, minute=minute, second=0, microsecond=0)
                    else: # Set to today at the chosen time
                         trip_datetime = current_time.replace(hour=hour, minute=minute, second=0, microsecond=0)

                else: # Set to yesterday
                    trip_datetime = (datetime.now() - timedelta(days=1)).replace(hour=hour, minute=minute, second=0, microsecond=0)
            # For 'scheduled' status, ensure the date is still in the future
            elif selected_status == 'scheduled':
                if trip_datetime <= datetime.now(): # If original random choice made it past due to random time selection
                    days_in_future = random.randint(1, 7)
                    trip_datetime = (datetime.now() + timedelta(days=days_in_future)).replace(hour=hour, minute=minute, second=0, microsecond=0)

            # Seleccionar conductor, asistente, bus, ruta y secretario aleatorios
            driver = random.choice(drivers)
            assistant = random.choice(assistants)
            bus = random.choice(buses)
            route = random.choice(routes)
            secretary = random.choice(secretaries)

            trip = Trip(
                trip_datetime=trip_datetime,
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
                        # Crear ticket
                        ticket = Ticket(
                            seat_id=seat.id,
                            client_id=client.id,
                            trip_id=trip.id,
                            state=random.choice(ticket_states),
                            secretary_id=random.choice(secretaries).id,  # Asignar un secretario aleatorio a cada ticket
                            price=ticket_price,
                            payment_method=random.choice(payment_methods)
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
            "driver1@comarapa.com",
            "assistant1@comarapa.com",
            "client1@comarapa.com"
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
                "address": "Av. Principal 123",
                "city": "Santa Cruz de la Sierra",
                "state": "Santa Cruz"
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
                    phone=user_data["phone"],
                    birth_date=user_data["birth_date"],
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
            print("--------------------------------")

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