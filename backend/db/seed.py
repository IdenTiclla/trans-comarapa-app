from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
from models.person import Person
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
from models.package_state_history import PackageStateHistory
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
        # Disable foreign key checks temporarily for MySQL
        db.execute(text("SET FOREIGN_KEY_CHECKS = 0"))
        
        # Delete all data in reverse order of dependencies
        db.query(PackageStateHistory).delete()
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
        # Delete Person instances before User since Person has FK to User
        db.query(Person).delete()
        db.query(User).delete()

        # Re-enable foreign key checks
        db.execute(text("SET FOREIGN_KEY_CHECKS = 1"))
        
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
        # Create real locations for Trans Comarapa route
        location_data = [
            # Terminal principal Santa Cruz
            {
                "name": "Santa Cruz",
                "latitude": -17.783333,
                "longitude": -63.182222,
                "address": "Av. Omar Chávez Ortiz",
                "city": "Santa Cruz de la Sierra",
                "state": "Santa Cruz",
                "country": "Bolivia",
                "description": "Terminal Bimodal Santa Cruz"
            },
            # Pueblos en orden de la ruta Santa Cruz -> Comarapa
            {
                "name": "La Guardia",
                "latitude": -17.8833,
                "longitude": -63.3167,
                "address": "Plaza Principal",
                "city": "La Guardia",
                "state": "Santa Cruz",
                "country": "Bolivia",
                "description": "Pueblo de La Guardia"
            },
            {
                "name": "San José",
                "latitude": -17.9167,
                "longitude": -63.45,
                "address": "Plaza Central",
                "city": "San José",
                "state": "Santa Cruz",
                "country": "Bolivia",
                "description": "Pueblo de San José"
            },
            {
                "name": "Santa Rita",
                "latitude": -17.95,
                "longitude": -63.5833,
                "address": "Centro del pueblo",
                "city": "Santa Rita",
                "state": "Santa Cruz",
                "country": "Bolivia",
                "description": "Pueblo de Santa Rita"
            },
            {
                "name": "El Torno",
                "latitude": -17.9833,
                "longitude": -63.7167,
                "address": "Plaza Principal",
                "city": "El Torno",
                "state": "Santa Cruz",
                "country": "Bolivia",
                "description": "Pueblo de El Torno"
            },
            {
                "name": "Limoncito",
                "latitude": -18.0167,
                "longitude": -63.85,
                "address": "Centro",
                "city": "Limoncito",
                "state": "Santa Cruz",
                "country": "Bolivia",
                "description": "Pueblo de Limoncito"
            },
            {
                "name": "Jorochito",
                "latitude": -18.05,
                "longitude": -63.9833,
                "address": "Plaza Central",
                "city": "Jorochito",
                "state": "Santa Cruz",
                "country": "Bolivia",
                "description": "Pueblo de Jorochito"
            },
            {
                "name": "Taruma",
                "latitude": -18.0833,
                "longitude": -64.1167,
                "address": "Centro del pueblo",
                "city": "Taruma",
                "state": "Santa Cruz",
                "country": "Bolivia",
                "description": "Pueblo de Taruma"
            },
            {
                "name": "San Luis",
                "latitude": -18.1167,
                "longitude": -64.25,
                "address": "Plaza Principal",
                "city": "San Luis",
                "state": "Santa Cruz",
                "country": "Bolivia",
                "description": "Pueblo de San Luis"
            },
            {
                "name": "La Angostura",
                "latitude": -18.15,
                "longitude": -64.3833,
                "address": "Centro",
                "city": "La Angostura",
                "state": "Santa Cruz",
                "country": "Bolivia",
                "description": "Pueblo de La Angostura"
            },
            {
                "name": "Cuevas",
                "latitude": -18.1833,
                "longitude": -64.5167,
                "address": "Plaza Central",
                "city": "Cuevas",
                "state": "Santa Cruz",
                "country": "Bolivia",
                "description": "Pueblo de Cuevas"
            },
            {
                "name": "Achiras",
                "latitude": -18.2167,
                "longitude": -64.65,
                "address": "Centro del pueblo",
                "city": "Achiras",
                "state": "Santa Cruz",
                "country": "Bolivia",
                "description": "Pueblo de Achiras"
            },
            {
                "name": "Samaipata",
                "latitude": -18.183333,
                "longitude": -63.866667,
                "address": "Plaza Principal",
                "city": "Samaipata",
                "state": "Santa Cruz",
                "country": "Bolivia",
                "description": "Ciudad de Samaipata"
            },
            {
                "name": "Mairana",
                "latitude": -18.116667,
                "longitude": -63.95,
                "address": "Plaza Central",
                "city": "Mairana",
                "state": "Santa Cruz",
                "country": "Bolivia",
                "description": "Ciudad de Mairana"
            },
            {
                "name": "Hierba Buena",
                "latitude": -18.25,
                "longitude": -64.7833,
                "address": "Centro",
                "city": "Hierba Buena",
                "state": "Santa Cruz",
                "country": "Bolivia",
                "description": "Pueblo de Hierba Buena"
            },
            {
                "name": "Agua Clara",
                "latitude": -18.2833,
                "longitude": -64.9167,
                "address": "Plaza Principal",
                "city": "Agua Clara",
                "state": "Santa Cruz",
                "country": "Bolivia",
                "description": "Pueblo de Agua Clara"
            },
            {
                "name": "Los Negros",
                "latitude": -18.3167,
                "longitude": -65.05,
                "address": "Centro del pueblo",
                "city": "Los Negros",
                "state": "Santa Cruz",
                "country": "Bolivia",
                "description": "Pueblo de Los Negros"
            },
            {
                "name": "Mataral",
                "latitude": -18.35,
                "longitude": -65.1833,
                "address": "Plaza Central",
                "city": "Mataral",
                "state": "Santa Cruz",
                "country": "Bolivia",
                "description": "Pueblo de Mataral"
            },
            {
                "name": "El Quiñe",
                "latitude": -18.3833,
                "longitude": -65.3167,
                "address": "Centro",
                "city": "El Quiñe",
                "state": "Santa Cruz",
                "country": "Bolivia",
                "description": "Pueblo de El Quiñe"
            },
            {
                "name": "La Palizada",
                "latitude": -18.4167,
                "longitude": -65.45,
                "address": "Plaza Principal",
                "city": "La Palizada",
                "state": "Santa Cruz",
                "country": "Bolivia",
                "description": "Pueblo de La Palizada"
            },
            {
                "name": "San Isidro",
                "latitude": -18.45,
                "longitude": -65.5833,
                "address": "Centro del pueblo",
                "city": "San Isidro",
                "state": "Santa Cruz",
                "country": "Bolivia",
                "description": "Pueblo de San Isidro"
            },
            {
                "name": "Tambo",
                "latitude": -18.4833,
                "longitude": -65.7167,
                "address": "Plaza Central",
                "city": "Tambo",
                "state": "Santa Cruz",
                "country": "Bolivia",
                "description": "Pueblo de Tambo"
            },
            # Terminal destino Comarapa
            {
                "name": "Comarapa",
                "latitude": -17.916667,
                "longitude": -64.533333,
                "address": "Terminal de Buses",
                "city": "Comarapa",
                "state": "Santa Cruz",
                "country": "Bolivia",
                "description": "Terminal de Comarapa"
            }
        ]

        locations = {}
        for location_info in location_data:
            location = Location(**location_info)
            db.add(location)
            db.flush()  # Flush to get IDs
            locations[location_info["name"]] = location

        # Crear oficinas principales de Trans Comarapa - Solo Santa Cruz y Comarapa
        office_data = [
            {
                "name": "Oficina Central Santa Cruz",
                "phone": "78175576",
                "email": "santacruz@transcomarapa.com",
                "location_id": locations["Santa Cruz"].id
            },
            {
                "name": "Terminal Comarapa",
                "phone": "78175578",
                "email": "comarapa@transcomarapa.com",
                "location_id": locations["Comarapa"].id
            }
        ]

        offices = {}
        for office_info in office_data:
            office = Office(**office_info)
            db.add(office)
            db.flush()  # Flush to get IDs
            offices[office_info["name"]] = office

        # Create real Trans Comarapa routes
        route_data = [
            {
                "origin_location_id": locations["Santa Cruz"].id,
                "destination_location_id": locations["Comarapa"].id,
                "distance": 240.5,
                "duration": 4.5,
                "price": 35.0
            },
            {
                "origin_location_id": locations["Comarapa"].id,
                "destination_location_id": locations["Santa Cruz"].id,
                "distance": 240.5,
                "duration": 4.5,
                "price": 35.0
            }
        ]

        routes = []
        for route_info in route_data:
            route = Route(**route_info)
            db.add(route)
            routes.append(route)

        # Crear usuarios para clientes primero - Base de datos actualizada 2025
        client_user_data = []
        num_clients_to_create = 50 # Incrementado para mayor diversidad
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
                "email": f"cliente{i+1}_{timestamp}@transcomarapa.com",
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

        # Crear clientes con datos realistas bolivianos - Nuevo enfoque con Person
        clients = []
        bolivian_cities = ["Santa Cruz de la Sierra", "La Paz", "Cochabamba", "Sucre", "Tarija", "Oruro", "Potosí", "Trinidad", "Cobija", "Montero", "Warnes", "Vallegrande"]
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

            # Crear el Cliente que hereda de Person
            client = Client(
                user_id=user.id,
                firstname=firstname,
                lastname=lastname,
                phone=f"7{random.randint(1000000, 9999999)}",
                birth_date=fake.date_of_birth(minimum_age=18, maximum_age=70),
                # Campos específicos de Client
                document_id=document_id,
                address=fake.street_address(),
                city=random.choice(bolivian_cities),
                state=random.choice(bolivian_states)
            )
            db.add(client)
            clients.append(client)

        # Crear usuarios para conductores primero - Equipo 2025
        driver_user_data = []
        num_drivers_to_create = 12 # Equipo ampliado para 2025
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
                "email": f"conductor{i+1}_{timestamp}@transcomarapa.com",
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

        # Crear conductores con datos realistas bolivianos - Nuevo enfoque con Person
        drivers = []
        license_types = ["A", "B", "C", "P"]
        status_options = ["active", "on_leave", "suspended", "inactive"]

        # Generar nombres completos para los conductores
        driver_full_names = [fake.name() for _ in range(len(driver_users))]

        for i, user in enumerate(driver_users):
            # Fecha de vencimiento de licencia entre 1 y 5 años en el futuro (2026-2030)
            expiry_years = random.randint(1, 5)
            license_expiry = date.today().replace(year=date.today().year + expiry_years)

            # Dividir el nombre completo en nombre y apellido
            name_parts = driver_full_names[i].split()
            firstname = name_parts[0]
            lastname = " ".join(name_parts[1:]) if len(name_parts) > 1 else ""

            # Crear el Conductor que hereda de Person
            driver = Driver(
                user_id=user.id,
                firstname=firstname,
                lastname=lastname,
                phone=f"7{random.randint(1000000, 9999999)}",
                birth_date=fake.date_of_birth(minimum_age=25, maximum_age=60),
                # Campos específicos de Driver
                license_number=f"LC{random.randint(100000, 999999)}",
                license_type=random.choice(license_types),
                license_expiry=license_expiry,
                status=random.choice(status_options)
            )
            db.add(driver)
            drivers.append(driver)

        # Create sample buses with realistic 2025 models and Trans Comarapa fleet
        bus_models = ["O-500RS", "9900", "K450", "O-400RSD", "B450R", "Marcopolo Paradiso", "Irizar Century"]
        bus_brands = ["Mercedes Benz", "Volvo", "Scania", "Mercedes Benz", "Volvo", "Marcopolo", "Irizar"]
        bus_colors = ["Azul Trans Comarapa", "Blanco", "Rojo", "Verde", "Amarillo", "Azul Marino", "Plata"]
        bus_capacities = [45, 50, 42, 48, 46, 52, 44]
        bus_data = []

        for i in range(7):  # Incrementado a 7 buses
            # Generar placas únicas con timestamp
            timestamp = str(int(datetime.now().timestamp()) + i)[-4:]
            license_plate = f"{timestamp}ABC{i}"

            bus_info = {
                "license_plate": license_plate,
                "capacity": bus_capacities[i],
                "model": bus_models[i],
                "brand": bus_brands[i],
                "color": bus_colors[i]
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

        # Crear administrador asociado al usuario admin - Nuevo enfoque con Person
        administrator = Administrator(
            user_id=admin_user.id,
            firstname="Administrador",
            lastname="Sistema",
            phone="77000000",
            birth_date=date(1975, 3, 15)
        )
        db.add(administrator)
        db.commit()

        # Crear usuarios para secretarios - Personal administrativo 2025
        secretary_user_data = []
        num_secretaries_to_create = 8 # Personal ampliado para mayor cobertura
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
                "email": f"secretario{i+1}_{timestamp}@transcomarapa.com",
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

        # Crear secretarios con datos realistas bolivianos - Nuevo enfoque con Person
        secretaries = []
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

            # Crear el Secretario que hereda de Person
            secretary = Secretary(
                user_id=user.id,
                firstname=firstname,
                lastname=lastname,
                phone=f"7{random.randint(1000000, 9999999)}",
                birth_date=fake.date_of_birth(minimum_age=22, maximum_age=55),
                # Campo específico de Secretary
                office_id=offices[office_name].id
            )
            db.add(secretary)
            secretaries.append(secretary)

        # Crear usuarios para asistentes primero - Equipo de apoyo 2025
        assistant_user_data = []
        num_assistants_to_create = 12 # Equipo de asistentes ampliado
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
                "email": f"asistente{i+1}_{timestamp}@transcomarapa.com",
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

        # Crear asistentes con datos realistas bolivianos - Nuevo enfoque con Person
        assistants = []

        # Generar nombres completos para los asistentes
        assistant_full_names = [fake.name() for _ in range(len(assistant_users))]

        for i, user in enumerate(assistant_users):
            # Dividir el nombre completo en nombre y apellido
            name_parts = assistant_full_names[i].split()
            firstname = name_parts[0]
            lastname = " ".join(name_parts[1:]) if len(name_parts) > 1 else ""

            # Crear el Asistente que hereda de Person  
            assistant = Assistant(
                user_id=user.id,
                firstname=firstname,
                lastname=lastname,
                phone=f"7{random.randint(1000000, 9999999)}",
                birth_date=fake.date_of_birth(minimum_age=20, maximum_age=50)
            )
            db.add(assistant)
            assistants.append(assistant)

        # Commit first batch to get IDs
        db.commit()

        # Crear viajes con fechas y horas reales de Trans Comarapa
        trips = []

        # Horarios reales de Trans Comarapa
        # Comarapa -> Santa Cruz: 08:30 AM, 02:00 PM, 08:30 PM, 11:30 PM
        comarapa_to_santa_cruz_times = [
            (8, 30),   # 8:30 AM
            (14, 0),   # 2:00 PM
            (20, 30),  # 8:30 PM
            (23, 30)   # 11:30 PM
        ]
        
        # Santa Cruz -> Comarapa: 10:30 AM, 02:00 PM, 06:30 PM, 08:30 PM
        santa_cruz_to_comarapa_times = [
            (10, 30),  # 10:30 AM
            (14, 0),   # 2:00 PM
            (18, 30),  # 6:30 PM
            (20, 30)   # 8:30 PM
        ]

        # Posibles estados para los viajes
        # Weighted towards 'scheduled' for future dates, others for variety
        possible_trip_statuses = ['scheduled', 'scheduled', 'scheduled', 'scheduled', 'in_progress', 'completed', 'cancelled']

        # Crear viajes realistas para operaciones Trans Comarapa 2025
        # Incrementado a 80 viajes para mayor variedad
        num_trips_to_create = 80
        
        # Define the 6-month date range for trips, tickets, and packages (September 2024 to March 2025)
        now = datetime.now()
        six_months_ago = now - timedelta(days=6*30) # Approximate
        date_range_for_creation = [six_months_ago + timedelta(days=x) for x in range((now - six_months_ago).days + 1)]

        for _ in range(num_trips_to_create):
            # Seleccionar fecha aleatoria dentro del rango de 6 meses
            base_trip_date = random.choice(date_range_for_creation).date()
            
            # Seleccionar ruta aleatoria (Santa Cruz <-> Comarapa)
            selected_route = random.choice(routes)
            
            # Determinar horarios según la ruta
            if selected_route.origin_location.name == "Santa Cruz":
                # Santa Cruz -> Comarapa
                hour, minute = random.choice(santa_cruz_to_comarapa_times)
            else:
                # Comarapa -> Santa Cruz
                hour, minute = random.choice(comarapa_to_santa_cruz_times)
            
            trip_datetime_val = datetime.combine(base_trip_date, datetime.min.time()).replace(hour=hour, minute=minute, second=0, microsecond=0)

            selected_status = random.choice(possible_trip_statuses)

            # Adjust DATE based on status for realism, but keep the TIME intact
            if selected_status == 'completed' or selected_status == 'cancelled':
                # Ensure completed/cancelled trips are in the past portion of the 6 months
                if trip_datetime_val.date() > (now - timedelta(days=7)).date():
                    # Shift date back but keep the time
                    new_date = (now - timedelta(days=random.randint(8,180))).date()
                    trip_datetime_val = datetime.combine(new_date, trip_datetime_val.time())
            elif selected_status == 'in_progress':
                # Ensure in_progress trips are very recent or today, but keep time
                new_date = (now - timedelta(hours=random.randint(0, 24))).date()
                trip_datetime_val = datetime.combine(new_date, trip_datetime_val.time())
            elif selected_status == 'scheduled':
                # Ensure scheduled trips are in the future, but keep the time
                if trip_datetime_val <= now:
                    new_date = (now + timedelta(days=random.randint(1, 30))).date()
                    trip_datetime_val = datetime.combine(new_date, trip_datetime_val.time())
                elif trip_datetime_val.date() > (now + timedelta(days=60)).date():
                    new_date = (now + timedelta(days=random.randint(1,60))).date()
                    trip_datetime_val = datetime.combine(new_date, trip_datetime_val.time())

            # Seleccionar conductor, asistente, bus y secretario aleatorios
            driver = random.choice(drivers)
            assistant = random.choice(assistants)
            bus = random.choice(buses)
            secretary = random.choice(secretaries)
            # La ruta ya fue seleccionada arriba para determinar los horarios

            trip = Trip(
                trip_datetime=trip_datetime_val,
                status=selected_status, # Added status
                driver_id=driver.id,
                assistant_id=assistant.id,
                bus_id=bus.id,
                route_id=selected_route.id,
                secretary_id=secretary.id
            )
            db.add(trip)
            trips.append(trip)

        db.commit()

        # Create seats for each bus with row/column positions
        # Layout: 2+2 (4 seats per row with center aisle)
        for bus in buses:
            capacity = bus.capacity

            # Determine if bus has 2 floors based on bus.floors attribute or capacity
            floors = getattr(bus, "floors", 1) if hasattr(bus, "floors") else (2 if capacity > 40 else 1)

            if floors == 2:
                # Two-floor bus: split seats between FIRST and SECOND deck
                half = capacity // 2
                seat_number = 1

                # First floor seats
                for i in range(1, half + 1):
                    row = ((i - 1) // 4) + 1
                    column = ((i - 1) % 4) + 1
                    seat = Seat(
                        bus_id=bus.id,
                        seat_number=seat_number,
                        deck="FIRST",
                        row=row,
                        column=column
                    )
                    db.add(seat)
                    seat_number += 1

                # Second floor seats
                for i in range(1, capacity - half + 1):
                    row = ((i - 1) // 4) + 1
                    column = ((i - 1) % 4) + 1
                    seat = Seat(
                        bus_id=bus.id,
                        seat_number=seat_number,
                        deck="SECOND",
                        row=row,
                        column=column
                    )
                    db.add(seat)
                    seat_number += 1
            else:
                # Single floor bus: all seats on FIRST deck
                for i in range(1, capacity + 1):
                    row = ((i - 1) // 4) + 1
                    column = ((i - 1) % 4) + 1
                    seat = Seat(
                        bus_id=bus.id,
                        seat_number=i,
                        deck="FIRST",
                        row=row,
                        column=column
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

        all_tickets = [] # To store all created tickets for later simulation
        now = datetime.now()
        six_months_ago = now - timedelta(days=6*30)

        for trip_item in trips:
            num_tickets = random.randint(10, 20)
            bus_seats = seats_by_bus.get(trip_item.bus_id, [])
            trip_route_obj = db.query(Route).filter(Route.id == trip_item.route_id).first() # Renamed trip_route
            ticket_price = trip_route_obj.price if trip_route_obj and trip_route_obj.price is not None else 30.0

            if bus_seats:
                num_to_select = min(num_tickets, len(bus_seats))
                if num_to_select > 0:
                    selected_seats = random.sample(bus_seats, num_to_select)
                    for seat_item in selected_seats:
                        client_instance = random.choice(clients)
                        secretary_for_ticket = random.choice(secretaries)
                        
                        ticket_created_at = trip_item.trip_datetime - timedelta(days=random.randint(1, 30), hours=random.randint(0,23))
                        if ticket_created_at < six_months_ago: ticket_created_at = six_months_ago + timedelta(days=random.randint(0,5))
                        if ticket_created_at > now: ticket_created_at = now - timedelta(days=random.randint(0, (now - six_months_ago).days))

                        current_initial_ticket_state = "pending"
                        if trip_item.trip_datetime < now - timedelta(days=2) and ticket_created_at < trip_item.trip_datetime :
                            current_initial_ticket_state = random.choice(["completed", "confirmed"])
                        elif trip_item.status == 'cancelled':
                            current_initial_ticket_state = "cancelled"

                        # Asignar destino específico usando nombres simples
                        # Lista de destinos posibles para Trans Comarapa
                        possible_destinations = [
                            "Comarapa", "Santa Cruz", "Samaipata", "Mairana", "Los Negros", 
                            "San Isidro", "Tambo", "La Angostura", "Cuevas", "Achiras"
                        ]
                        
                        # 70% de probabilidad de usar el destino de la ruta, 30% destino alternativo
                        if random.random() < 0.7:
                            destination_name = trip_route_obj.destination_location.name
                        else:
                            # Elegir un destino alternativo
                            alternative_destinations = [d for d in possible_destinations if d != trip_route_obj.destination_location.name]
                            if alternative_destinations:
                                destination_name = random.choice(alternative_destinations)
                                # Ajustar precio para destinos intermedios (generalmente menor)
                                if destination_name in ["Samaipata", "Mairana"]:
                                    ticket_price = ticket_price * 0.6  # 60% del precio completo
                                elif destination_name in ["Los Negros", "San Isidro"]:
                                    ticket_price = ticket_price * 0.8  # 80% del precio completo
                            else:
                                destination_name = trip_route_obj.destination_location.name
                        
                        ticket = Ticket(
                            seat_id=seat_item.id, client_id=client_instance.id, trip_id=trip_item.id,
                            destination=destination_name,
                            state=current_initial_ticket_state, secretary_id=secretary_for_ticket.id,
                            price=ticket_price, payment_method=random.choice(payment_methods),
                            created_at=ticket_created_at, updated_at=ticket_created_at # Init updated_at
                        )
                        db.add(ticket)
                        db.flush()
                        all_tickets.append(ticket)

                        initial_history_entry = TicketStateHistory(
                            ticket_id=ticket.id, old_state=None, new_state=ticket.state,
                            changed_at=ticket.created_at, changed_by_user_id=secretary_for_ticket.user_id
                        )
                        db.add(initial_history_entry)
        
        db.commit() # Commit all tickets and their initial history entries

        # --- Simulate Further Ticket State Changes (Simplified) ---
        print("Simulating further ticket state changes (simplified)...")
        num_tickets_to_simulate_changes_for = len(all_tickets) // 3
        tickets_for_simulation = random.sample(all_tickets, num_tickets_to_simulate_changes_for)

        for ticket_to_simulate in tickets_for_simulation:
            # Directly use related objects; ensure your session/instance allows this or fetch if needed.
            # For seeding, direct access to ticket_to_simulate.trip should work if relationships are okay.
            ticket_trip = ticket_to_simulate.trip
            if not ticket_trip : continue # Should not happen if data is consistent
            trip_route_for_sim = ticket_trip.route
            if not trip_route_for_sim : continue

            last_changed_at = ticket_to_simulate.updated_at 
            current_sim_state = ticket_to_simulate.state
            simulating_secretary = random.choice(secretaries)
            change_made = False

            # Path 1: Pending -> Confirmed
            if current_sim_state == "pending" and ticket_trip.trip_datetime > now:
                old_state_sim = current_sim_state
                new_state_sim = "confirmed"
                # Confirm a bit after creation, well before trip, and before now.
                changed_at_sim = max(last_changed_at + timedelta(hours=1), ticket_to_simulate.created_at + timedelta(hours=1))
                changed_at_sim = min(changed_at_sim, ticket_trip.trip_datetime - timedelta(hours=2), now - timedelta(minutes=10))

                if changed_at_sim > last_changed_at and changed_at_sim < ticket_trip.trip_datetime:
                    ticket_to_simulate.state = new_state_sim
                    ticket_to_simulate.updated_at = changed_at_sim
                    db.add(TicketStateHistory(ticket_id=ticket_to_simulate.id, old_state=old_state_sim, new_state=new_state_sim, changed_at=changed_at_sim, changed_by_user_id=simulating_secretary.user_id))
                    db.add(ticket_to_simulate) 
                    current_sim_state = new_state_sim
                    last_changed_at = changed_at_sim
                    change_made = True

            # Path 2: Confirmed -> Completed (for past trips)
            elif current_sim_state == "confirmed" and ticket_trip.trip_datetime < now:
                old_state_sim = current_sim_state
                new_state_sim = "completed"
                route_duration_hours = float(trip_route_for_sim.duration if trip_route_for_sim else 3.0)
                # Complete after trip ends, before now.
                changed_at_sim = max(last_changed_at + timedelta(minutes=10), ticket_trip.trip_datetime + timedelta(hours=route_duration_hours + 0.5))
                changed_at_sim = min(changed_at_sim, now - timedelta(minutes=5))
                
                if changed_at_sim > last_changed_at:
                    ticket_to_simulate.state = new_state_sim
                    ticket_to_simulate.updated_at = changed_at_sim
                    db.add(TicketStateHistory(ticket_id=ticket_to_simulate.id, old_state=old_state_sim, new_state=new_state_sim, changed_at=changed_at_sim, changed_by_user_id=simulating_secretary.user_id))
                    db.add(ticket_to_simulate)
                    current_sim_state = new_state_sim
                    last_changed_at = changed_at_sim
                    change_made = True
            
            # Path 3: Pending or Confirmed -> Cancelled (small chance, for future trips)
            if not change_made and random.random() < 0.05 and current_sim_state in ["pending", "confirmed"] and ticket_trip.trip_datetime > now:
                old_state_sim = current_sim_state
                new_state_sim = "cancelled"
                # Cancel a bit after creation/confirmation, well before trip, and before now.
                changed_at_sim = max(last_changed_at + timedelta(minutes=15), ticket_to_simulate.created_at + timedelta(minutes=15))
                changed_at_sim = min(changed_at_sim, ticket_trip.trip_datetime - timedelta(hours=1), now - timedelta(minutes=5))

                if changed_at_sim > last_changed_at and changed_at_sim < ticket_trip.trip_datetime:
                    ticket_to_simulate.state = new_state_sim
                    ticket_to_simulate.updated_at = changed_at_sim
                    db.add(TicketStateHistory(ticket_id=ticket_to_simulate.id, old_state=old_state_sim, new_state=new_state_sim, changed_at=changed_at_sim, changed_by_user_id=simulating_secretary.user_id))
                    db.add(ticket_to_simulate)
                    # No further changes for cancelled tickets
        
        db.commit()

        # --- Package Seeding and Initial State History ---
        all_packages = [] 
        package_statuses_options = ["registered", "in_transit", "delivered", "cancelled", "lost"] # Renamed
        item_descriptions = [
            "Documentos importantes", "Ropa de temporada 2025", "Equipos electrónicos nuevos", "Productos alimenticios locales",
            "Medicamentos esenciales", "Libros y material educativo", "Herramientas de trabajo especializadas", "Artículos de hogar modernos",
            "Productos de belleza y cuidado personal", "Juguetes educativos", "Artículos deportivos premium", "Electrodomésticos pequeños inteligentes",
            "Repuestos automotrices", "Instrumentos musicales", "Material de construcción", "Productos artesanales bolivianos"
        ]
        package_counter = 1
        for trip_item in trips:
            num_packages = random.randint(3, 8)
            for _ in range(num_packages):
                sender = random.choice(clients)
                recipient = random.choice([c for c in clients if c.id != sender.id])
                tracking_number = f"PKG{package_counter:06d}"
                package_counter += 1

                package_created_at = trip_item.trip_datetime - timedelta(days=random.randint(1, 15), hours=random.randint(0,23))
                if package_created_at < six_months_ago: package_created_at = six_months_ago + timedelta(days=random.randint(0,5))
                if package_created_at > now: package_created_at = now - timedelta(days=random.randint(0, (now - six_months_ago).days))

                current_initial_package_state = "registered"
                if trip_item.trip_datetime < now - timedelta(days=2) and package_created_at < trip_item.trip_datetime:
                    current_initial_package_state = random.choice(["delivered", "in_transit"])
                elif trip_item.status == 'cancelled': 
                    if random.random() < 0.5: current_initial_package_state = "cancelled"

                selected_secretary = random.choice(secretaries)

                package = Package(
                    tracking_number=tracking_number, total_weight=round(random.uniform(0.5, 20.0), 2),
                    total_declared_value=round(random.uniform(50.0, 500.0), 2),
                    notes=f"Envío 2025: Paquete de {sender.firstname} {sender.lastname} para {recipient.firstname} {recipient.lastname} - Servicio premium",
                    status=current_initial_package_state, sender_id=sender.id, recipient_id=recipient.id,
                    trip_id=trip_item.id, secretary_id=selected_secretary.id, created_at=package_created_at,
                    updated_at=package_created_at # Init updated_at
                )
                db.add(package)
                db.flush()
                all_packages.append(package) 

                initial_pkg_history_entry = PackageStateHistory(
                    package_id=package.id, old_state=None, new_state=package.status,
                    changed_at=package.created_at, changed_by_user_id=selected_secretary.user_id
                )
                db.add(initial_pkg_history_entry)

                num_items = random.randint(1, 4)
                for item_index in range(num_items):
                    quantity = random.randint(1, 5)
                    description = random.choice(item_descriptions)
                    unit_price = round(random.uniform(10.0, 100.0), 2)
                    total_price = quantity * unit_price
                    package_item = PackageItem(
                        quantity=quantity, description=description, unit_price=unit_price,
                        total_price=total_price, package_id=package.id
                    )
                    db.add(package_item)

        db.commit() # Commit all packages and their initial history

        # --- Simulate Further Package State Changes (Simplified) ---
        print("Simulating further package state changes (simplified)...")
        num_packages_to_simulate_changes_for = len(all_packages) // 2
        packages_for_simulation = random.sample(all_packages, num_packages_to_simulate_changes_for)

        for package_to_simulate in packages_for_simulation:
            package_trip = package_to_simulate.trip
            if not package_trip: continue
            package_route = package_trip.route
            if not package_route: continue

            last_changed_at_pkg = package_to_simulate.updated_at
            current_sim_state_pkg = package_to_simulate.status
            simulating_secretary_pkg = random.choice(secretaries)
            change_made_pkg = False

            # Path 1: Registered -> In Transit
            if current_sim_state_pkg == "registered" and package_trip.trip_datetime > now - timedelta(days=10): # If trip is not too far in past
                old_state_pkg_sim = current_sim_state_pkg
                new_state_pkg_sim = "in_transit"
                # Change to in_transit around trip departure time
                changed_at_pkg_sim = max(last_changed_at_pkg + timedelta(hours=1), package_to_simulate.created_at + timedelta(hours=1))
                changed_at_pkg_sim = min(changed_at_pkg_sim, package_trip.trip_datetime + timedelta(hours=1), now - timedelta(minutes=10))
                # Ensure it's after creation and close to trip time, but before now if possible

                if changed_at_pkg_sim > last_changed_at_pkg and changed_at_pkg_sim < (package_trip.trip_datetime + timedelta(days=1)): # Allow it to be slightly after trip_datetime
                    package_to_simulate.status = new_state_pkg_sim
                    package_to_simulate.updated_at = changed_at_pkg_sim
                    db.add(PackageStateHistory(package_id=package_to_simulate.id, old_state=old_state_pkg_sim, new_state=new_state_pkg_sim, changed_at=changed_at_pkg_sim, changed_by_user_id=simulating_secretary_pkg.user_id))
                    db.add(package_to_simulate)
                    current_sim_state_pkg = new_state_pkg_sim
                    last_changed_at_pkg = changed_at_pkg_sim
                    change_made_pkg = True

            # Path 2: In Transit -> Delivered (for past trips)
            elif current_sim_state_pkg == "in_transit" and package_trip.trip_datetime < now:
                old_state_pkg_sim = current_sim_state_pkg
                new_state_pkg_sim = "delivered"
                route_duration_hours_pkg = float(package_route.duration if package_route else 3.0)
                # Deliver after trip + duration, before now
                changed_at_pkg_sim = max(last_changed_at_pkg + timedelta(hours=1), package_trip.trip_datetime + timedelta(hours=route_duration_hours_pkg + 1))
                changed_at_pkg_sim = min(changed_at_pkg_sim, now - timedelta(minutes=5))

                if changed_at_pkg_sim > last_changed_at_pkg:
                    package_to_simulate.status = new_state_pkg_sim
                    package_to_simulate.updated_at = changed_at_pkg_sim
                    db.add(PackageStateHistory(package_id=package_to_simulate.id, old_state=old_state_pkg_sim, new_state=new_state_pkg_sim, changed_at=changed_at_pkg_sim, changed_by_user_id=simulating_secretary_pkg.user_id))
                    db.add(package_to_simulate)
                    current_sim_state_pkg = new_state_pkg_sim
                    last_changed_at_pkg = changed_at_pkg_sim
                    change_made_pkg = True

            # Path 3: In Transit -> Lost (small chance, for past trips)
            if not change_made_pkg and random.random() < 0.02 and current_sim_state_pkg == "in_transit" and package_trip.trip_datetime < now:
                old_state_pkg_sim = current_sim_state_pkg
                new_state_pkg_sim = "lost"
                 # Lost sometime after going in transit, before now
                changed_at_pkg_sim = max(last_changed_at_pkg + timedelta(days=1), package_trip.trip_datetime + timedelta(days=1))
                changed_at_pkg_sim = min(changed_at_pkg_sim, now - timedelta(hours=1))

                if changed_at_pkg_sim > last_changed_at_pkg:
                    package_to_simulate.status = new_state_pkg_sim
                    package_to_simulate.updated_at = changed_at_pkg_sim
                    db.add(PackageStateHistory(package_id=package_to_simulate.id, old_state=old_state_pkg_sim, new_state=new_state_pkg_sim, changed_at=changed_at_pkg_sim, changed_by_user_id=simulating_secretary_pkg.user_id))
                    db.add(package_to_simulate)
                    change_made_pkg = True # No further changes for lost packages

            # Path 4: Registered -> Cancelled (small chance, before trip starts)
            elif not change_made_pkg and random.random() < 0.03 and current_sim_state_pkg == "registered" and package_trip.trip_datetime > now:
                old_state_pkg_sim = current_sim_state_pkg
                new_state_pkg_sim = "cancelled"
                # Cancel after registration, before trip, and before now
                changed_at_pkg_sim = max(last_changed_at_pkg + timedelta(minutes=30), package_to_simulate.created_at + timedelta(minutes=30))
                changed_at_pkg_sim = min(changed_at_pkg_sim, package_trip.trip_datetime - timedelta(hours=1), now - timedelta(minutes=5))
                
                if changed_at_pkg_sim > last_changed_at_pkg and changed_at_pkg_sim < package_trip.trip_datetime:
                    package_to_simulate.status = new_state_pkg_sim
                    package_to_simulate.updated_at = changed_at_pkg_sim
                    db.add(PackageStateHistory(package_id=package_to_simulate.id, old_state=old_state_pkg_sim, new_state=new_state_pkg_sim, changed_at=changed_at_pkg_sim, changed_by_user_id=simulating_secretary_pkg.user_id))
                    db.add(package_to_simulate)
                    # No further changes for cancelled packages

        db.commit() # Commit simulated package state changes

        # --- Seed Activities ---
        print("Seeding activities...")
        activities_to_seed = []

        # Obtener algunos usuarios para asociar actividades
        admin_user_for_activity = db.query(User).filter(User.role == UserRole.ADMIN).first()
        secretary_user_for_activity = db.query(User).filter(User.role == UserRole.SECRETARY).first()
        client_user_for_activity = db.query(User).filter(User.role == UserRole.CLIENT).first()

        # Actividades del sistema
        activities_to_seed.append(ActivityModel(activity_type="Sistema Reiniciado", details="El sistema de seeding completó la carga inicial de datos de 2025."))
        activities_to_seed.append(ActivityModel(activity_type="Mantenimiento Programado", details="Próximo mantenimiento el 2025-10-15 03:00 AM"))

        # Actividades asociadas a usuarios (si existen)
        if admin_user_for_activity:
            activities_to_seed.append(ActivityModel(user_id=admin_user_for_activity.id, activity_type="Login Exitoso", details=f"Admin {admin_user_for_activity.username} inició sesión desde terminal principal - Septiembre 2025"))
            activities_to_seed.append(ActivityModel(user_id=admin_user_for_activity.id, activity_type="Configuración Actualizada", details="Sistema de seguridad actualizado para temporada alta 2025 - Nuevas políticas implementadas."))
        
        if secretary_user_for_activity:
            # Buscar un ticket y paquete para los detalles
            first_ticket = db.query(Ticket).first()
            first_package = db.query(Package).first()

            if first_ticket:
                activities_to_seed.append(ActivityModel(user_id=secretary_user_for_activity.id, activity_type="Nueva Reserva Creada", details=f"Ticket ID: {first_ticket.id} para el viaje ID: {first_ticket.trip_id}"))
            activities_to_seed.append(ActivityModel(user_id=secretary_user_for_activity.id, activity_type="Venta Confirmada", details="Venta de mostrador procesada correctamente - Sistema POS actualizado 2025."))
            if first_package:
                 activities_to_seed.append(ActivityModel(user_id=secretary_user_for_activity.id, activity_type="Paquete Registrado", details=f"Paquete con tracking: {first_package.tracking_number}"))

        if client_user_for_activity:
            activities_to_seed.append(ActivityModel(user_id=client_user_for_activity.id, activity_type="Perfil Actualizado", details="Cliente actualizó información de contacto vía aplicación móvil - Septiembre 2025."))
            activities_to_seed.append(ActivityModel(user_id=client_user_for_activity.id, activity_type="Consulta de Viaje", details="Cliente consultó viajes disponibles para la ruta Santa Cruz - Comarapa."))

        # Crear algunas actividades más genéricas con fechas variadas para 2025
        activity_types_general = ["Actualización de Ruta", "Nuevo Conductor Contratado", "Mantenimiento de Bus", "Promoción Lanzada", "Reporte Generado"]
        sample_details = [
            "Ruta SCZ-Comarapa actualizada con nuevo precio para 2025.",
            "Nuevo conductor certificado se unió al equipo.",
            "Bus completó mantenimiento preventivo de inicio de año.",
            "Promoción de temporada alta implementada para enero-marzo 2025.",
            "Reporte de ventas de septiembre 2025 generado exitosamente."
        ]

        all_user_ids = [u.id for u in db.query(User.id).all()] # Obtener todos los user_ids para variedad

        for i in range(10): # Crear 10 actividades genéricas adicionales
            user_id_for_activity = random.choice(all_user_ids) if all_user_ids and random.choice([True, False]) else None
            activity_type_selected = random.choice(activity_types_general)
            detail_selected = random.choice(sample_details) # Podrías hacer esto más específico al tipo
            # Simular fechas pasadas para las actividades (marzo 2025 - septiembre 2025)
            past_date = datetime.now() - timedelta(days=random.randint(0, 180), hours=random.randint(0,23), minutes=random.randint(0,59))
            
            activities_to_seed.append(ActivityModel(
                user_id=user_id_for_activity,
                activity_type=activity_type_selected,
                details=f"{detail_selected} - Registro del sistema Trans Comarapa {i+1}",
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
            "admin1@transcomarapa.com",
            "secretary1@transcomarapa.com",
            "secretary2@transcomarapa.com",
            "secretary3@transcomarapa.com",
            "driver1@transcomarapa.com",
            "assistant1@transcomarapa.com",
            "client1@transcomarapa.com",
            "client2@transcomarapa.com",
            "client3@transcomarapa.com",
            "client4@transcomarapa.com",
            "client5@transcomarapa.com"
        ]

        # Disable foreign key checks temporarily for MySQL
        db.execute(text("SET FOREIGN_KEY_CHECKS = 0"))
        
        for email in test_emails:
            user = db.query(User).filter(User.email == email).first()
            if user:
                # Eliminar entidades asociadas (estas ahora heredan de Person)
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

                # También eliminar instancias de Person que pudieran existir
                db.query(Person).filter(Person.user_id == user.id).delete()

                # Eliminar usuario
                db.delete(user)
        
        # Re-enable foreign key checks
        db.execute(text("SET FOREIGN_KEY_CHECKS = 1"))

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
                name="Oficina Central Santa Cruz",
                phone="78175576",
                email="santacruz@transcomarapa.com",
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
                "email": "admin1@transcomarapa.com",
                "role": "admin",
                "password": "123456",
                "firstname": "Admin",
                "lastname": "Principal",
                "phone": "77123456",
                "birth_date": date(1980, 5, 15)
            },
            {
                "username": "secretary1",
                "email": "secretary1@transcomarapa.com",
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
                "email": "secretary2@transcomarapa.com",
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
                "email": "secretary3@transcomarapa.com",
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
                "email": "driver1@transcomarapa.com",
                "role": "driver",
                "password": "123456",
                "firstname": "Conductor",
                "lastname": "Principal",
                "phone": "77345678",
                "birth_date": date(1982, 3, 10),
                "license_number": "LC123456",
                "license_type": "A",
                "license_expiry": date(2026, 12, 31),
                "status": "active"
            },
            {
                "username": "assistant1",
                "email": "assistant1@transcomarapa.com",
                "role": "assistant",
                "password": "123456",
                "firstname": "Asistente",
                "lastname": "Principal",
                "phone": "77456789",
                "birth_date": date(1995, 7, 5)
            },
            {
                "username": "client1",
                "email": "client1@transcomarapa.com",
                "role": "client",
                "password": "123456",
                "firstname": "Cliente",
                "lastname": "Principal",
                "phone": "77567890",
                "birth_date": date(1988, 11, 25),
                "document_id": "12693562",  # CI de prueba
                "address": "Av. Principal 123",
                "city": "Santa Cruz de la Sierra",
                "state": "Santa Cruz"
            },
            {
                "username": "client2",
                "email": "client2@transcomarapa.com",
                "role": "client",
                "password": "123456",
                "firstname": "María",
                "lastname": "González",
                "phone": "77678901",
                "birth_date": date(1992, 3, 15),
                "document_id": "9876543",  # CI de prueba para búsqueda
                "address": "Calle Falsa 456",
                "city": "Cochabamba",
                "state": "Cochabamba"
            },
            {
                "username": "client3",
                "email": "client3@transcomarapa.com",
                "role": "client",
                "password": "123456",
                "firstname": "Pedro",
                "lastname": "Rojas",
                "phone": "77789012",
                "birth_date": date(1985, 8, 20),
                "document_id": "5432109",  # CI de prueba para búsqueda
                "address": "Av. Libertad 789",
                "city": "La Paz",
                "state": "La Paz"
            },
            {
                "username": "client4",
                "email": "client4@transcomarapa.com",
                "role": "client",
                "password": "123456",
                "firstname": "Luisa",
                "lastname": "Morales",
                "phone": "77890123",
                "birth_date": date(1990, 12, 3),
                "document_id": "151985270",  # CI que apareció en los logs de error
                "address": "Calle Nueva 321",
                "city": "Santa Cruz de la Sierra",
                "state": "Santa Cruz"
            },
            {
                "username": "client5",
                "email": "client5@transcomarapa.com",
                "role": "client",
                "password": "123456",
                "firstname": "Roberto",
                "lastname": "Silva",
                "phone": "77901234",
                "birth_date": date(1987, 4, 17),
                "document_id": "9753228",  # CI que apareció en los logs de error
                "address": "Av. Central 654",
                "city": "Cochabamba",
                "state": "Cochabamba"
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
            # Crear la entidad asociada según el rol - Nuevo enfoque con Person
            if user_data["role"] == "admin":
                entity = Administrator(
                    user_id=new_user.id,
                    firstname=user_data["firstname"],
                    lastname=user_data["lastname"],
                    phone=user_data["phone"],
                    birth_date=user_data["birth_date"]
                )
                db.add(entity)
                db.flush()
            elif user_data["role"] == "secretary":
                entity = Secretary(
                    user_id=new_user.id,
                    firstname=user_data["firstname"],
                    lastname=user_data["lastname"],
                    phone=user_data["phone"],
                    birth_date=user_data["birth_date"],
                    office_id=user_data["office_id"]
                )
                db.add(entity)
                db.flush()
            elif user_data["role"] == "driver":
                entity = Driver(
                    user_id=new_user.id,
                    firstname=user_data["firstname"],
                    lastname=user_data["lastname"],
                    phone=user_data["phone"],
                    birth_date=user_data["birth_date"],
                    license_number=user_data["license_number"],
                    license_type=user_data["license_type"],
                    license_expiry=user_data["license_expiry"],
                    status=user_data["status"]
                )
                db.add(entity)
                db.flush()
            elif user_data["role"] == "assistant":
                entity = Assistant(
                    user_id=new_user.id,
                    firstname=user_data["firstname"],
                    lastname=user_data["lastname"],
                    phone=user_data["phone"],
                    birth_date=user_data["birth_date"]
                )
                db.add(entity)
                db.flush()
            elif user_data["role"] == "client":
                entity = Client(
                    user_id=new_user.id,
                    firstname=user_data["firstname"],
                    lastname=user_data["lastname"],
                    phone=user_data["phone"],
                    birth_date=user_data["birth_date"],
                    # Campos específicos de Client
                    document_id=user_data.get("document_id"),
                    address=user_data["address"],
                    city=user_data["city"],
                    state=user_data["state"]
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
        print("• secretary1@transcomarapa.com (Secretaria Principal)")
        print("• secretary2@transcomarapa.com (Ana García)")
        print("• secretary3@transcomarapa.com (Carlos López)")
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