from sqlalchemy import create_engine, text, func
from sqlalchemy.orm import sessionmaker
from collections import defaultdict

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
from core.security import get_password_hash
from models.user import User, UserRole
from models.administrator import Administrator
from models.office import Office
from models.activity import Activity as ActivityModel
from models.ticket_state_history import TicketStateHistory
from models.package_state_history import PackageStateHistory
from models.owner import Owner
from models.owner_withdrawal import OwnerWithdrawal
from models.route_schedule import RouteSchedule
from models.cash_register import CashRegister
from models.cash_transaction import CashTransaction
from core.enums import CashRegisterStatus, CashTransactionType, PaymentMethod
from db.base import Base
from db.session import get_db
from dotenv import load_dotenv
import os
from datetime import datetime, date, timedelta, time as dt_time
import random
import warnings
from faker import Faker

warnings.filterwarnings("ignore", message=".*error reading bcrypt version.*")

load_dotenv()
DATABASE_URL = os.getenv("DATABASE_URL")
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# ── Constants ────────────────────────────────────────────────────────────────

_LF = ["name", "latitude", "longitude", "address", "city", "state", "country", "description"]
LOCATIONS_RAW = [
    ("Santa Cruz", -17.783333, -63.182222, "Av. Omar Chávez Ortiz", "Santa Cruz de la Sierra", "Santa Cruz", "Bolivia", "Terminal Bimodal Santa Cruz"),
    ("La Guardia", -17.8833, -63.3167, "Plaza Principal", "La Guardia", "Santa Cruz", "Bolivia", "Pueblo de La Guardia"),
    ("San José", -17.9167, -63.45, "Plaza Central", "San José", "Santa Cruz", "Bolivia", "Pueblo de San José"),
    ("Santa Rita", -17.95, -63.5833, "Centro del pueblo", "Santa Rita", "Santa Cruz", "Bolivia", "Pueblo de Santa Rita"),
    ("El Torno", -17.9833, -63.7167, "Plaza Principal", "El Torno", "Santa Cruz", "Bolivia", "Pueblo de El Torno"),
    ("Limoncito", -18.0167, -63.85, "Centro", "Limoncito", "Santa Cruz", "Bolivia", "Pueblo de Limoncito"),
    ("Jorochito", -18.05, -63.9833, "Plaza Central", "Jorochito", "Santa Cruz", "Bolivia", "Pueblo de Jorochito"),
    ("Taruma", -18.0833, -64.1167, "Centro del pueblo", "Taruma", "Santa Cruz", "Bolivia", "Pueblo de Taruma"),
    ("San Luis", -18.1167, -64.25, "Plaza Principal", "San Luis", "Santa Cruz", "Bolivia", "Pueblo de San Luis"),
    ("La Angostura", -18.15, -64.3833, "Centro", "La Angostura", "Santa Cruz", "Bolivia", "Pueblo de La Angostura"),
    ("Cuevas", -18.1833, -64.5167, "Plaza Central", "Cuevas", "Santa Cruz", "Bolivia", "Pueblo de Cuevas"),
    ("Achiras", -18.2167, -64.65, "Centro del pueblo", "Achiras", "Santa Cruz", "Bolivia", "Pueblo de Achiras"),
    ("Samaipata", -18.183333, -63.866667, "Plaza Principal", "Samaipata", "Santa Cruz", "Bolivia", "Ciudad de Samaipata"),
    ("Mairana", -18.116667, -63.95, "Plaza Central", "Mairana", "Santa Cruz", "Bolivia", "Ciudad de Mairana"),
    ("Hierba Buena", -18.25, -64.7833, "Centro", "Hierba Buena", "Santa Cruz", "Bolivia", "Pueblo de Hierba Buena"),
    ("Agua Clara", -18.2833, -64.9167, "Plaza Principal", "Agua Clara", "Santa Cruz", "Bolivia", "Pueblo de Agua Clara"),
    ("Los Negros", -18.3167, -65.05, "Centro del pueblo", "Los Negros", "Santa Cruz", "Bolivia", "Pueblo de Los Negros"),
    ("Mataral", -18.35, -65.1833, "Plaza Central", "Mataral", "Santa Cruz", "Bolivia", "Pueblo de Mataral"),
    ("El Quiñe", -18.3833, -65.3167, "Centro", "El Quiñe", "Santa Cruz", "Bolivia", "Pueblo de El Quiñe"),
    ("La Palizada", -18.4167, -65.45, "Plaza Principal", "La Palizada", "Santa Cruz", "Bolivia", "Pueblo de La Palizada"),
    ("San Isidro", -18.45, -65.5833, "Centro del pueblo", "San Isidro", "Santa Cruz", "Bolivia", "Pueblo de San Isidro"),
    ("Tambo", -18.4833, -65.7167, "Plaza Central", "Tambo", "Santa Cruz", "Bolivia", "Pueblo de Tambo"),
    ("Comarapa", -17.916667, -64.533333, "Terminal de Buses", "Comarapa", "Santa Cruz", "Bolivia", "Terminal de Comarapa"),
]
LOCATION_DATA = [dict(zip(_LF, loc)) for loc in LOCATIONS_RAW]

OFFICES_RAW = [
    ("Oficina Santa Cruz", "78175576", "santacruz@transcomarapa.com", "Santa Cruz"),
    ("Oficina Comarapa", "78175578", "comarapa@transcomarapa.com", "Comarapa"),
    ("Oficina Los Negros", "78175579", "losnegros@transcomarapa.com", "Los Negros"),
    ("Oficina San Isidro", "78175580", "sanisidro@transcomarapa.com", "San Isidro"),
]

ROUTE_DATA = [
    {"origin": "Santa Cruz", "destination": "Comarapa", "distance": 240.5, "duration": 4.5, "price": 35.0},
    {"origin": "Comarapa", "destination": "Santa Cruz", "distance": 240.5, "duration": 4.5, "price": 35.0},
]

SCZ_TO_COM_TIMES = [dt_time(10, 30), dt_time(14, 0), dt_time(18, 30), dt_time(20, 30)]
COM_TO_SCZ_TIMES = [dt_time(8, 30), dt_time(14, 0), dt_time(20, 30), dt_time(23, 30)]
SCZ_TO_COM_HM = [(10, 30), (14, 0), (18, 30), (20, 30)]
COM_TO_SCZ_HM = [(8, 30), (14, 0), (20, 30), (23, 30)]

TRIP_STATUSES_WEIGHTED = ["scheduled"] * 4 + ["in_progress", "completed", "cancelled"]
TICKET_PAYMENT_METHODS = ["cash", "credit_card", "qr_payment", "bank_transfer"]
DESTINATION_NAMES = [
    "Comarapa", "Santa Cruz", "Samaipata", "Mairana", "Los Negros",
    "San Isidro", "Tambo", "La Angostura", "Cuevas", "Achiras",
]
INTERMEDIATE_PRICES = {"Samaipata": 0.6, "Mairana": 0.6, "Los Negros": 0.8, "San Isidro": 0.8}

BOLIVIAN_CITIES = [
    "Santa Cruz de la Sierra", "La Paz", "Cochabamba", "Sucre", "Tarija",
    "Oruro", "Potosí", "Trinidad", "Cobija", "Montero", "Warnes", "Vallegrande",
]
BOLIVIAN_STATES = [
    "Santa Cruz", "La Paz", "Cochabamba", "Chuquisaca", "Tarija",
    "Oruro", "Potosí", "Beni", "Pando",
]

BUS_FLEET = [
    ("O-500RS", "Mercedes Benz", "Azul Trans Comarapa", 45, 1),
    ("9900", "Volvo", "Blanco", 50, 2),
    ("K450", "Scania", "Rojo", 42, 1),
    ("O-400RSD", "Mercedes Benz", "Verde", 48, 2),
    ("B450R", "Volvo", "Amarillo", 46, 1),
    ("Marcopolo Paradiso", "Marcopolo", "Azul Marino", 52, 2),
    ("Irizar Century", "Irizar", "Plata", 44, 1),
]

OWNER_NAMES = [
    ("Ricardo", "Mendoza Quiroga"),
    ("Fernando", "Vargas Soliz"),
    ("Miguel", "Torrez Arce"),
    ("Patricia", "Rojas de Mendoza"),
    ("Jorge", "Gutiérrez Flores"),
]

PACKAGE_ITEM_DESCRIPTIONS = [
    "Documentos importantes", "Ropa de temporada 2025", "Equipos electrónicos nuevos",
    "Productos alimenticios locales", "Medicamentos esenciales", "Libros y material educativo",
    "Herramientas de trabajo especializadas", "Artículos de hogar modernos",
    "Productos de belleza y cuidado personal", "Juguetes educativos",
    "Artículos deportivos premium", "Electrodomésticos pequeños inteligentes",
    "Repuestos automotrices", "Instrumentos musicales", "Material de construcción",
    "Productos artesanales bolivianos",
]

NUM_CLIENTS = 50
NUM_DRIVERS = 12
NUM_SECRETARIES = 8
NUM_ASSISTANTS = 12
NUM_TRIPS = 80
NUM_UNASSIGNED_PACKAGES = 15
TICKETS_PER_TRIP = (10, 20)
PACKAGES_PER_TRIP = (3, 8)
SEED_DAYS = 180

ROLE_ENTITY_MAP = {
    "admin": Administrator,
    "secretary": Secretary,
    "driver": Driver,
    "assistant": Assistant,
    "client": Client,
}


# ── Helpers ──────────────────────────────────────────────────────────────────

def _parse_name(full_name):
    parts = full_name.split()
    if not parts:
        return "SinNombre", "SinApellido"
    return parts[0], " ".join(parts[1:]) if len(parts) > 1 else parts[0]


def _phone():
    return f"7{random.randint(1000000, 9999999)}"


def _create_users_and_entities(db, fake, role, prefix, count, entity_factory, ts_base):
    full_names = [fake.name() for _ in range(count)]
    users = []
    for i in range(count):
        fn, ln = _parse_name(full_names[i])
        users.append(User(
            username=f"{prefix}{i+1}",
            email=f"{prefix}{i+1}@transcomarapa.com",
            firstname=fn, lastname=ln, role=role,
            hashed_password=get_password_hash("123456"),
            is_active=True, is_admin=(role == "admin"),
        ))
    db.add_all(users)
    db.flush()

    entities = []
    for i, user in enumerate(users):
        fn, ln = _parse_name(full_names[i])
        entities.append(entity_factory(i, user, fn, ln))
    db.add_all(entities)
    db.flush()
    return users, entities


def _ticket_state_for_trip(trip_status):
    if trip_status == "cancelled":
        return "cancelled"
    if trip_status == "completed":
        return random.choices(["completed", "confirmed"], weights=[70, 30])[0]
    if trip_status == "in_progress":
        return "confirmed"
    return random.choices(["pending", "confirmed"], weights=[65, 35])[0]


def _package_state_for_trip(trip_status):
    if trip_status == "cancelled":
        return "registered_at_office"
    if trip_status == "completed":
        return random.choices(
            ["delivered", "arrived_at_destination", "in_transit"],
            weights=[50, 35, 15],
        )[0]
    if trip_status == "in_progress":
        return "in_transit"
    return random.choices(
        ["assigned_to_trip", "registered_at_office"], weights=[70, 30],
    )[0]


def _ticket_history_meta(final_state, created_at, trip_dt, route_duration, user_id):
    chain = [(None, "pending", created_at, user_id)]
    if final_state in ("confirmed", "completed"):
        ts = created_at + timedelta(hours=random.randint(1, 12))
        chain.append(("pending", "confirmed", ts, user_id))
        if final_state == "completed":
            chain.append((
                "confirmed", "completed",
                trip_dt + timedelta(hours=route_duration + random.uniform(0.5, 1.5)),
                user_id,
            ))
    elif final_state == "cancelled":
        chain.append((
            "pending", "cancelled",
            created_at + timedelta(hours=random.randint(1, 24)),
            user_id,
        ))
    return chain


def _package_history_meta(final_state, created_at, trip_dt, route_duration, user_id):
    chain = [(None, "registered_at_office", created_at, user_id)]
    if final_state == "registered_at_office":
        return chain
    chain.append((
        "registered_at_office", "assigned_to_trip",
        created_at + timedelta(hours=random.randint(1, 12)),
        user_id,
    ))
    if final_state == "assigned_to_trip":
        return chain
    chain.append(("assigned_to_trip", "in_transit", trip_dt, user_id))
    if final_state == "in_transit":
        return chain
    arrived_at = trip_dt + timedelta(hours=route_duration)
    chain.append(("in_transit", "arrived_at_destination", arrived_at, user_id))
    if final_state == "arrived_at_destination":
        return chain
    chain.append((
        "arrived_at_destination", "delivered",
        arrived_at + timedelta(hours=random.randint(1, 48)),
        user_id,
    ))
    return chain


# ── clear_db ─────────────────────────────────────────────────────────────────

def clear_db():
    db = SessionLocal()
    try:
        db.execute(text("SET FOREIGN_KEY_CHECKS = 0;"))
        for model in [
            PackageStateHistory, TicketStateHistory, Ticket, PackageItem, Package,
            Seat, Trip, Client, RouteSchedule, Route, Assistant, Driver,
            OwnerWithdrawal, CashTransaction, CashRegister, Owner, Bus,
            Office, Location, Secretary, Administrator, ActivityModel, Person, User,
        ]:
            db.query(model).delete()
        db.execute(text("SET FOREIGN_KEY_CHECKS = 1;"))
        db.commit()
        print("Database cleared successfully!")
    except Exception as e:
        db.rollback()
        print(f"Error clearing database: {e}")
    finally:
        db.close()


# ── seed_db ──────────────────────────────────────────────────────────────────

def seed_db():
    db = SessionLocal()
    fake = Faker(["es_ES"])
    try:
        now = datetime.now()
        ts_base = int(now.timestamp())
        six_months_ago = now - timedelta(days=SEED_DAYS)
        date_range = [
            six_months_ago + timedelta(days=x)
            for x in range((now - six_months_ago).days + 1)
        ]

        # ── Locations ──
        locations = {}
        for ld in LOCATION_DATA:
            loc = Location(**ld)
            db.add(loc)
            locations[ld["name"]] = loc
        db.flush()

        # ── Offices ──
        offices = {}
        for name, phone, email, loc_name in OFFICES_RAW:
            off = Office(name=name, phone=phone, email=email,
                         location_id=locations[loc_name].id)
            db.add(off)
            offices[name] = off
        db.flush()

        # ── Routes ──
        routes = []
        for rd in ROUTE_DATA:
            route = Route(
                origin_location_id=locations[rd["origin"]].id,
                destination_location_id=locations[rd["destination"]].id,
                distance=rd["distance"], duration=rd["duration"], price=rd["price"],
            )
            db.add(route)
            routes.append(route)
        db.flush()

        # Pre-build route metadata (avoids lazy loads)
        route_info = {}
        for route, rd in zip(routes, ROUTE_DATA):
            route_info[route.id] = {
                "origin": rd["origin"], "destination": rd["destination"],
                "origin_loc_id": locations[rd["origin"]].id,
                "dest_loc_id": locations[rd["destination"]].id,
                "price": rd["price"], "duration": rd["duration"],
            }

        # ── Route Schedules ──
        schedules = []
        for route, rd in zip(routes, ROUTE_DATA):
            times = SCZ_TO_COM_TIMES if rd["origin"] == "Santa Cruz" else COM_TO_SCZ_TIMES
            for t in times:
                schedules.append(RouteSchedule(route_id=route.id, departure_time=t, is_active=True))
        db.add_all(schedules)
        db.commit()
        print("Created locations, offices, routes, schedules")

        # ── Clients ──
        def client_factory(i, user, fn, ln):
            ci_len = random.choice([7, 8, 9, 10])
            return Client(
                user_id=user.id, firstname=fn, lastname=ln, phone=_phone(),
                birth_date=fake.date_of_birth(minimum_age=18, maximum_age=70),
                document_id=str(random.randint(10 ** (ci_len - 1), 10 ** ci_len - 1)),
                address=fake.street_address(),
                city=random.choice(BOLIVIAN_CITIES),
                state=random.choice(BOLIVIAN_STATES),
            )

        client_users, clients = _create_users_and_entities(
            db, fake, "client", "cliente", NUM_CLIENTS, client_factory, ts_base,
        )

        # ── Drivers ──
        license_types = ["A", "B", "C", "P"]
        driver_statuses = ["active", "on_leave", "suspended", "inactive"]

        def driver_factory(i, user, fn, ln):
            return Driver(
                user_id=user.id, firstname=fn, lastname=ln, phone=_phone(),
                birth_date=fake.date_of_birth(minimum_age=25, maximum_age=60),
                license_number=f"LC{random.randint(100000, 999999)}",
                license_type=random.choice(license_types),
                license_expiry=date.today().replace(year=date.today().year + random.randint(1, 5)),
                status=random.choice(driver_statuses),
            )

        driver_users, drivers = _create_users_and_entities(
            db, fake, "driver", "conductor", NUM_DRIVERS, driver_factory, ts_base + 200,
        )

        # ── Secretaries ──
        office_names = list(offices.keys())

        def secretary_factory(i, user, fn, ln):
            return Secretary(
                user_id=user.id, firstname=fn, lastname=ln, phone=_phone(),
                birth_date=fake.date_of_birth(minimum_age=22, maximum_age=55),
                office_id=offices[random.choice(office_names)].id,
            )

        secretary_users, secretaries = _create_users_and_entities(
            db, fake, "secretary", "secretario", NUM_SECRETARIES, secretary_factory, ts_base + 400,
        )

        # ── Assistants ──
        def assistant_factory(i, user, fn, ln):
            return Assistant(
                user_id=user.id, firstname=fn, lastname=ln, phone=_phone(),
                birth_date=fake.date_of_birth(minimum_age=20, maximum_age=50),
            )

        assistant_users, assistants = _create_users_and_entities(
            db, fake, "assistant", "asistente", NUM_ASSISTANTS, assistant_factory, ts_base + 600,
        )

        # ── Admin ──
        admin_user = User(
            username=f"admin_bulk", email=f"admin_bulk@transcomarapa.com",
            firstname="Administrador", lastname="Sistema", role="admin",
            hashed_password=get_password_hash("123456"),
            is_active=True, is_admin=True,
        )
        db.add(admin_user)
        db.flush()
        db.add(Administrator(
            user_id=admin_user.id, firstname="Administrador", lastname="Sistema",
            phone="77000000", birth_date=date(1975, 3, 15),
        ))
        db.flush()

        # ── Owners ──
        owner_users = []
        for i, (fn, ln) in enumerate(OWNER_NAMES):
            owner_users.append(User(
                username=f"socio{i+1}",
                email=f"socio{i+1}@transcomarapa.com",
                firstname=fn, lastname=ln, role="owner",
                hashed_password=get_password_hash("123456"),
                is_active=True, is_admin=False,
            ))
        db.add_all(owner_users)
        db.flush()

        owners = []
        for i, user in enumerate(owner_users):
            fn, ln = OWNER_NAMES[i]
            owners.append(Owner(
                user_id=user.id, firstname=fn, lastname=ln, phone=_phone(),
                birth_date=fake.date_of_birth(minimum_age=35, maximum_age=65),
            ))
        db.add_all(owners)
        db.flush()

        # ── Buses ──
        buses = []
        for i, (model, brand, color, cap, floors) in enumerate(BUS_FLEET):
            suffix = str(ts_base + i)[-4:]
            buses.append(Bus(
                license_plate=f"{suffix}ABC{i}", capacity=cap,
                model=model, brand=brand, color=color, floors=floors,
            ))
        db.add_all(buses)
        db.flush()

        for i, bus in enumerate(buses):
            bus.owner_id = owners[i % len(owners)].id

        # ── Seats ──
        all_seats = []
        for bus in buses:
            cap = bus.capacity
            fl = bus.floors or 1
            if fl == 2:
                half = cap // 2
                num = 1
                for deck, count in [("FIRST", half), ("SECOND", cap - half)]:
                    for j in range(1, count + 1):
                        all_seats.append(Seat(
                            bus_id=bus.id, seat_number=num, deck=deck,
                            row=((j - 1) // 4) + 1, column=((j - 1) % 4) + 1,
                        ))
                        num += 1
            else:
                for j in range(1, cap + 1):
                    all_seats.append(Seat(
                        bus_id=bus.id, seat_number=j, deck="FIRST",
                        row=((j - 1) // 4) + 1, column=((j - 1) % 4) + 1,
                    ))
        db.add_all(all_seats)
        db.commit()
        print(
            f"Created {len(clients)} clients, {len(drivers)} drivers, "
            f"{len(secretaries)} secretaries, {len(assistants)} assistants, "
            f"{len(owners)} owners, {len(buses)} buses, {len(all_seats)} seats"
        )

        # ── Trips ──
        trips = []
        for _ in range(NUM_TRIPS):
            trip_date = random.choice(date_range).date()
            route = random.choice(routes)
            ri = route_info[route.id]
            hm = SCZ_TO_COM_HM if ri["origin"] == "Santa Cruz" else COM_TO_SCZ_HM
            hour, minute = random.choice(hm)
            trip_dt = datetime.combine(trip_date, datetime.min.time()).replace(
                hour=hour, minute=minute,
            )
            status = random.choice(TRIP_STATUSES_WEIGHTED)

            if status in ("completed", "cancelled") and trip_dt > now - timedelta(days=7):
                trip_dt = datetime.combine(
                    (now - timedelta(days=random.randint(8, SEED_DAYS))).date(),
                    trip_dt.time(),
                )
            elif status == "in_progress":
                trip_dt = datetime.combine(
                    (now - timedelta(hours=random.randint(0, 24))).date(),
                    trip_dt.time(),
                )
            elif status == "scheduled":
                if trip_dt <= now:
                    trip_dt = datetime.combine(
                        (now + timedelta(days=random.randint(1, 30))).date(),
                        trip_dt.time(),
                    )
                elif trip_dt > now + timedelta(days=60):
                    trip_dt = datetime.combine(
                        (now + timedelta(days=random.randint(1, 60))).date(),
                        trip_dt.time(),
                    )

            trips.append(Trip(
                trip_datetime=trip_dt, status=status,
                driver_id=random.choice(drivers).id,
                assistant_id=random.choice(assistants).id,
                bus_id=random.choice(buses).id,
                route_id=route.id,
                secretary_id=random.choice(secretaries).id,
            ))
        db.add_all(trips)
        db.commit()
        print(f"{len(trips)} trips created")

        # Seats lookup by bus
        seats_by_bus = defaultdict(list)
        for s in all_seats:
            seats_by_bus[s.bus_id].append(s)

        # ── Tickets + History ──
        tickets_batch = []
        ticket_hist_meta = []

        for trip in trips:
            bus_seats = seats_by_bus.get(trip.bus_id, [])
            if not bus_seats:
                continue
            ri = route_info[trip.route_id]
            base_price = ri["price"] or 30.0
            num = min(random.randint(*TICKETS_PER_TRIP), len(bus_seats))

            for seat in random.sample(bus_seats, num):
                created_at = trip.trip_datetime - timedelta(
                    days=random.randint(1, 30), hours=random.randint(0, 23),
                )
                created_at = max(created_at, six_months_ago)
                created_at = min(created_at, now)

                state = _ticket_state_for_trip(trip.status)
                sec = random.choice(secretaries)

                if random.random() < 0.7:
                    dest = ri["destination"]
                    price = base_price
                else:
                    alt = [d for d in DESTINATION_NAMES if d != ri["destination"]]
                    dest = random.choice(alt) if alt else ri["destination"]
                    price = base_price * INTERMEDIATE_PRICES.get(dest, 1.0)

                idx = len(tickets_batch)
                tickets_batch.append(Ticket(
                    seat_id=seat.id, client_id=random.choice(clients).id,
                    trip_id=trip.id, destination=dest, state=state,
                    secretary_id=sec.id, price=price,
                    payment_method=random.choice(TICKET_PAYMENT_METHODS),
                    created_at=created_at, updated_at=created_at,
                ))
                for entry in _ticket_history_meta(
                    state, created_at, trip.trip_datetime,
                    ri["duration"] or 4.5, sec.user_id,
                ):
                    ticket_hist_meta.append((idx, *entry))

        db.add_all(tickets_batch)
        db.flush()

        hist_entries = []
        for idx, old_st, new_st, changed_at, uid in ticket_hist_meta:
            hist_entries.append(TicketStateHistory(
                ticket_id=tickets_batch[idx].id,
                old_state=old_st, new_state=new_st,
                changed_at=changed_at, changed_by_user_id=uid,
            ))
        db.add_all(hist_entries)
        db.commit()
        print(f"{len(tickets_batch)} tickets created with history")

        # ── Packages + History + Items ──
        location_to_office = {off.location_id: off.id for off in offices.values()}
        office_ids = [off.id for off in offices.values()]
        packages_batch = []
        pkg_hist_meta = []
        counter = 0

        for trip in trips:
            ri = route_info[trip.route_id]
            for _ in range(random.randint(*PACKAGES_PER_TRIP)):
                sender = random.choice(clients)
                recipient = random.choice([c for c in clients if c.id != sender.id])
                created_at = trip.trip_datetime - timedelta(
                    days=random.randint(1, 15), hours=random.randint(0, 23),
                )
                created_at = max(created_at, six_months_ago)
                created_at = min(created_at, now)
                state = _package_state_for_trip(trip.status)
                sec = random.choice(secretaries)
                counter += 1
                pkg_idx = len(packages_batch)

                packages_batch.append(Package(
                    tracking_number=f"PKG{counter:06d}",
                    total_weight=round(random.uniform(0.5, 20.0), 2),
                    total_declared_value=round(random.uniform(50.0, 500.0), 2),
                    notes=f"Envío 2025: {sender.firstname} {sender.lastname} -> "
                          f"{recipient.firstname} {recipient.lastname}",
                    status=state, sender_id=sender.id, recipient_id=recipient.id,
                    trip_id=trip.id, secretary_id=sec.id,
                    created_at=created_at, updated_at=created_at,
                    origin_office_id=location_to_office.get(ri["origin_loc_id"]),
                    destination_office_id=location_to_office.get(ri["dest_loc_id"]),
                ))
                for entry in _package_history_meta(
                    state, created_at, trip.trip_datetime,
                    ri["duration"] or 4.5, sec.user_id,
                ):
                    pkg_hist_meta.append((pkg_idx, *entry))

        for _ in range(NUM_UNASSIGNED_PACKAGES):
            sender = random.choice(clients)
            recipient = random.choice([c for c in clients if c.id != sender.id])
            created_at = now - timedelta(days=random.randint(0, 7), hours=random.randint(0, 23))
            sec = random.choice(secretaries)
            origin_office = sec.office_id
            dest_office = random.choice([oid for oid in office_ids if oid != origin_office])
            counter += 1
            pkg_idx = len(packages_batch)

            packages_batch.append(Package(
                tracking_number=f"PKG{counter:06d}",
                total_weight=round(random.uniform(0.5, 20.0), 2),
                total_declared_value=round(random.uniform(50.0, 500.0), 2),
                notes=f"Encomienda pendiente - {sender.firstname} {sender.lastname}",
                status="registered_at_office",
                sender_id=sender.id, recipient_id=recipient.id,
                trip_id=None, secretary_id=sec.id,
                created_at=created_at, updated_at=created_at,
                origin_office_id=origin_office,
                destination_office_id=dest_office,
            ))
            pkg_hist_meta.append((pkg_idx, None, "registered_at_office", created_at, sec.user_id))

        db.add_all(packages_batch)
        db.flush()

        pkg_hist_entries = []
        for idx, old_st, new_st, changed_at, uid in pkg_hist_meta:
            pkg_hist_entries.append(PackageStateHistory(
                package_id=packages_batch[idx].id,
                old_state=old_st, new_state=new_st,
                changed_at=changed_at, changed_by_user_id=uid,
            ))
        db.add_all(pkg_hist_entries)

        all_items = []
        for pkg in packages_batch:
            for _ in range(random.randint(1, 4)):
                qty = random.randint(1, 5)
                unit_price = round(random.uniform(10.0, 100.0), 2)
                all_items.append(PackageItem(
                    quantity=qty,
                    description=random.choice(PACKAGE_ITEM_DESCRIPTIONS),
                    unit_price=unit_price, total_price=qty * unit_price,
                    package_id=pkg.id,
                ))
        db.add_all(all_items)
        db.commit()
        print(
            f"{len(packages_batch)} packages, {len(pkg_hist_entries)} history, "
            f"{len(all_items)} items created"
        )

        # ── Cash Registers + Transactions ──
        all_offices_list = list(offices.values())
        if all_offices_list and secretary_users:
            cash_registers = []
            for office in all_offices_list:
                opener = random.choice(secretary_users)
                for days_ago in range(30, 0, -1):
                    reg_date = date.today() - timedelta(days=days_ago)
                    cash_registers.append(CashRegister(
                        office_id=office.id, date=reg_date,
                        opened_by_id=opener.id, closed_by_id=opener.id,
                        initial_balance=500.0, final_balance=0.0,
                        status=CashRegisterStatus.CLOSED,
                        opened_at=datetime.combine(reg_date, dt_time(6, 0)),
                        closed_at=datetime.combine(reg_date, dt_time(20, 0)),
                    ))
                cash_registers.append(CashRegister(
                    office_id=office.id, date=date.today(),
                    opened_by_id=opener.id, initial_balance=500.0,
                    status=CashRegisterStatus.OPEN,
                    opened_at=datetime.combine(date.today(), dt_time(6, 0)),
                ))
            db.add_all(cash_registers)
            db.commit()
            print(f"{len(cash_registers)} cash registers created")

            # Pre-build lookups (eliminates N+1 queries)
            secretary_office_map = {s.id: s.office_id for s in secretaries}
            register_map = {}
            office_reg_sorted = defaultdict(list)
            date_registers = defaultdict(list)
            for reg in cash_registers:
                register_map[(reg.office_id, reg.date)] = reg
                office_reg_sorted[reg.office_id].append(reg)
                date_registers[reg.date].append(reg)
            for oid in office_reg_sorted:
                office_reg_sorted[oid].sort(key=lambda r: r.date, reverse=True)

            # Pre-compute package totals from items
            pkg_totals = defaultdict(float)
            for item in all_items:
                pkg_totals[item.package_id] += item.total_price

            # Ticket transactions
            paid_tickets = [t for t in tickets_batch if t.state in ("confirmed", "completed")]
            tx_batch = []
            for ticket in paid_tickets:
                office_id = secretary_office_map.get(ticket.secretary_id)
                if not office_id:
                    continue
                ticket_date = ticket.created_at.date() if ticket.created_at else date.today()
                reg = register_map.get((office_id, ticket_date))
                if not reg:
                    regs = office_reg_sorted.get(office_id, [])
                    reg = regs[0] if regs else None
                if reg:
                    tx_batch.append(CashTransaction(
                        cash_register_id=reg.id,
                        type=CashTransactionType.TICKET_SALE,
                        amount=float(ticket.price),
                        payment_method=PaymentMethod.CASH,
                        reference_id=ticket.id, reference_type="ticket",
                        description=f"Venta boleto #{ticket.id}",
                        created_at=ticket.created_at or now,
                    ))

            # Package transactions
            paid_statuses = ("delivered", "arrived_at_destination", "in_transit")
            for pkg in packages_batch:
                if pkg.status not in paid_statuses or not pkg.trip_id:
                    continue
                total = pkg_totals.get(pkg.id, 0)
                if total <= 0:
                    continue
                pkg_date = pkg.created_at.date() if pkg.created_at else date.today()
                regs = date_registers.get(pkg_date, [])
                reg = regs[0] if regs else None
                if not reg:
                    for oid in office_reg_sorted:
                        if office_reg_sorted[oid]:
                            reg = office_reg_sorted[oid][0]
                            break
                if reg:
                    tx_batch.append(CashTransaction(
                        cash_register_id=reg.id,
                        type=CashTransactionType.PACKAGE_PAYMENT,
                        amount=total,
                        payment_method=PaymentMethod.CASH,
                        reference_id=pkg.id, reference_type="package",
                        description=f"Pago encomienda #{pkg.tracking_number}",
                        created_at=pkg.created_at or now,
                    ))

            db.add_all(tx_batch)
            db.commit()

            # Update final balances
            for reg in cash_registers:
                if reg.status == CashRegisterStatus.CLOSED:
                    total_in = db.query(func.sum(CashTransaction.amount)).filter(
                        CashTransaction.cash_register_id == reg.id,
                        CashTransaction.type.in_([
                            CashTransactionType.TICKET_SALE,
                            CashTransactionType.PACKAGE_PAYMENT,
                            CashTransactionType.POR_COBRAR_COLLECTION,
                        ]),
                    ).scalar() or 0.0
                    total_out = db.query(func.sum(CashTransaction.amount)).filter(
                        CashTransaction.cash_register_id == reg.id,
                        CashTransaction.type == CashTransactionType.WITHDRAWAL,
                    ).scalar() or 0.0
                    reg.final_balance = reg.initial_balance + total_in - total_out
            db.commit()
            print(f"{len(tx_batch)} cash transactions created")
        else:
            print("No offices or secretaries found, skipping cash register seeding")

        # ── Activities ──
        activities = [
            ActivityModel(
                activity_type="Sistema Reiniciado",
                details="El sistema de seeding completó la carga inicial de datos 2025.",
            ),
            ActivityModel(
                activity_type="Mantenimiento Programado",
                details="Próximo mantenimiento el 2025-10-15 03:00 AM",
            ),
        ]

        if admin_user:
            activities.extend([
                ActivityModel(
                    user_id=admin_user.id, activity_type="Login Exitoso",
                    details=f"Admin {admin_user.username} inició sesión",
                ),
                ActivityModel(
                    user_id=admin_user.id, activity_type="Configuración Actualizada",
                    details="Sistema de seguridad actualizado 2025",
                ),
            ])

        sec_user = secretary_users[0] if secretary_users else None
        if sec_user:
            activities.append(ActivityModel(
                user_id=sec_user.id, activity_type="Venta Confirmada",
                details="Venta de mostrador procesada",
            ))
            first_ticket = db.query(Ticket).first()
            first_pkg = db.query(Package).first()
            if first_ticket:
                activities.append(ActivityModel(
                    user_id=sec_user.id, activity_type="Nueva Reserva",
                    details=f"Ticket ID: {first_ticket.id}",
                ))
            if first_pkg:
                activities.append(ActivityModel(
                    user_id=sec_user.id, activity_type="Paquete Registrado",
                    details=f"Tracking: {first_pkg.tracking_number}",
                ))

        client_user = client_users[0] if client_users else None
        if client_user:
            activities.extend([
                ActivityModel(
                    user_id=client_user.id, activity_type="Perfil Actualizado",
                    details="Cliente actualizó información de contacto",
                ),
                ActivityModel(
                    user_id=client_user.id, activity_type="Consulta de Viaje",
                    details="Consulta viajes Santa Cruz - Comarapa",
                ),
            ])

        all_user_ids = [
            u.id for u in (
                client_users + driver_users + secretary_users
                + assistant_users + owner_users + [admin_user]
            )
        ]
        act_types = [
            "Actualización de Ruta", "Nuevo Conductor", "Mantenimiento de Bus",
            "Promoción Lanzada", "Reporte Generado",
        ]
        act_details = [
            "Ruta SCZ-Comarapa actualizada con nuevo precio 2025.",
            "Nuevo conductor certificado se unió al equipo.",
            "Bus completó mantenimiento preventivo.",
            "Promoción de temporada alta implementada.",
            "Reporte de ventas generado exitosamente.",
        ]
        for i in range(10):
            uid = random.choice(all_user_ids) if random.choice([True, False]) else None
            activities.append(ActivityModel(
                user_id=uid,
                activity_type=random.choice(act_types),
                details=f"{random.choice(act_details)} - Registro {i+1}",
                created_at=now - timedelta(
                    days=random.randint(0, SEED_DAYS),
                    hours=random.randint(0, 23),
                    minutes=random.randint(0, 59),
                ),
            ))

        db.add_all(activities)
        db.commit()
        print(f"{len(activities)} activities seeded")
        print("Database seeded successfully!")

    except Exception as e:
        db.rollback()
        print(f"Error seeding database: {e}")
        raise
    finally:
        db.close()


# ── create_test_users ────────────────────────────────────────────────────────

def create_test_users():
    db = SessionLocal()
    try:
        secretary_configs = [
            {"n": 1, "slug": "santacruz", "firstname": "María", "lastname": "Pérez", "phone": "77100001"},
            {"n": 2, "slug": "santacruz", "firstname": "Laura", "lastname": "Gómez", "phone": "77100002"},
            {"n": 1, "slug": "comarapa", "firstname": "Carmen", "lastname": "Rojas", "phone": "77100003"},
            {"n": 2, "slug": "comarapa", "firstname": "Rosa", "lastname": "Mendoza", "phone": "77100004"},
            {"n": 1, "slug": "losnegros", "firstname": "Ana", "lastname": "Flores", "phone": "77100005"},
            {"n": 2, "slug": "losnegros", "firstname": "Luisa", "lastname": "Torrez", "phone": "77100006"},
            {"n": 1, "slug": "sanisidro", "firstname": "Patricia", "lastname": "Vargas", "phone": "77100007"},
            {"n": 2, "slug": "sanisidro", "firstname": "Gabriela", "lastname": "Herrera", "phone": "77100008"},
        ]

        test_emails = [
            "admin1@transcomarapa.com",
            "driver1@transcomarapa.com", "driver2@transcomarapa.com", "driver3@transcomarapa.com",
            "assistant1@transcomarapa.com", "assistant2@transcomarapa.com", "assistant3@transcomarapa.com",
            "client1@transcomarapa.com", "client2@transcomarapa.com", "client3@transcomarapa.com",
            "client4@transcomarapa.com", "client5@transcomarapa.com",
            "secretary1@transcomarapa.com", "secretary2@transcomarapa.com", "secretary3@transcomarapa.com",
        ]
        for sc in secretary_configs:
            test_emails.append(f"secretary{sc['n']}.{sc['slug']}@transcomarapa.com")

        print("Limpiando datos de usuarios de prueba existentes...")
        db.execute(text("SET FOREIGN_KEY_CHECKS = 0;"))
        for email in test_emails:
            user = db.query(User).filter(User.email == email).first()
            if user:
                entity_model = ROLE_ENTITY_MAP.get(user.role)
                if entity_model:
                    db.query(entity_model).filter(entity_model.user_id == user.id).delete()
                db.query(Person).filter(Person.user_id == user.id).delete()
                db.delete(user)
        db.execute(text("SET FOREIGN_KEY_CHECKS = 1;"))
        db.commit()
        print("Datos de usuarios de prueba limpiados correctamente")

        offices = db.query(Office).all()
        if not offices:
            location = Location(
                name="Terminal Predeterminada",
                latitude=-17.783333, longitude=-63.182222,
                address="Av. Principal", city="Santa Cruz de la Sierra",
                state="Santa Cruz", country="Bolivia",
                description="Terminal predeterminada para pruebas",
            )
            db.add(location)
            db.flush()
            office = Office(
                name="Oficina Central Santa Cruz",
                phone="78175576", email="santacruz@transcomarapa.com",
                location_id=location.id,
            )
            db.add(office)
            db.commit()
            offices = [office]

        office_map = {}
        for office in offices:
            name_lower = office.name.lower()
            if "santa cruz" in name_lower:
                office_map["santacruz"] = office
            elif "comarapa" in name_lower:
                office_map["comarapa"] = office
            elif "los negros" in name_lower:
                office_map["losnegros"] = office
            elif "san isidro" in name_lower:
                office_map["sanisidro"] = office
        default_office = offices[0]

        test_users = [
            {
                "username": "admin1", "email": "admin1@transcomarapa.com",
                "role": "admin", "password": "123456",
                "firstname": "Admin", "lastname": "Principal",
                "phone": "77123456", "birth_date": date(1980, 5, 15),
            },
        ]

        for sc in secretary_configs:
            test_users.append({
                "username": f"secretary{sc['n']}.{sc['slug']}",
                "email": f"secretary{sc['n']}.{sc['slug']}@transcomarapa.com",
                "role": "secretary", "password": "123456",
                "firstname": sc["firstname"], "lastname": sc["lastname"],
                "phone": sc["phone"], "birth_date": date(1990, 1, 1),
                "office_id": office_map.get(sc["slug"], default_office).id,
            })

        for n, fn, ln, ph, lc in [
            (1, "Conductor", "Principal", "77300001", "LC123456"),
            (2, "Jorge", "Mendoza", "77300002", "LC234567"),
            (3, "Roberto", "Suárez", "77300003", "LC345678"),
        ]:
            test_users.append({
                "username": f"driver{n}", "email": f"driver{n}@transcomarapa.com",
                "role": "driver", "password": "123456",
                "firstname": fn, "lastname": ln, "phone": ph,
                "birth_date": date(1982, 3, 10),
                "license_number": lc, "license_type": "A",
                "license_expiry": date(2027, 12, 31), "status": "active",
            })

        for n, fn, ln, ph in [
            (1, "Asistente", "Principal", "77400001"),
            (2, "Carlos", "García", "77400002"),
            (3, "Miguel", "Ángel", "77400003"),
        ]:
            test_users.append({
                "username": f"assistant{n}", "email": f"assistant{n}@transcomarapa.com",
                "role": "assistant", "password": "123456",
                "firstname": fn, "lastname": ln, "phone": ph,
                "birth_date": date(1995, 7, 5),
            })

        test_users.extend([
            {
                "username": "client1", "email": "client1@transcomarapa.com",
                "role": "client", "password": "123456",
                "firstname": "Cliente", "lastname": "Principal",
                "phone": "77567890", "birth_date": date(1988, 11, 25),
                "document_id": "12693562", "address": "Av. Principal 123",
                "city": "Santa Cruz de la Sierra", "state": "Santa Cruz",
            },
            {
                "username": "client2", "email": "client2@transcomarapa.com",
                "role": "client", "password": "123456",
                "firstname": "María", "lastname": "González",
                "phone": "77678901", "birth_date": date(1992, 3, 15),
                "document_id": "9876543", "address": "Calle Falsa 456",
                "city": "Cochabamba", "state": "Cochabamba",
            },
            {
                "username": "client3", "email": "client3@transcomarapa.com",
                "role": "client", "password": "123456",
                "firstname": "Pedro", "lastname": "Rojas",
                "phone": "77789012", "birth_date": date(1985, 8, 20),
                "document_id": "5432109", "address": "Av. Libertad 789",
                "city": "La Paz", "state": "La Paz",
            },
            {
                "username": "client4", "email": "client4@transcomarapa.com",
                "role": "client", "password": "123456",
                "firstname": "Luisa", "lastname": "Morales",
                "phone": "77890123", "birth_date": date(1990, 12, 3),
                "document_id": "151985270", "address": "Calle Nueva 321",
                "city": "Santa Cruz de la Sierra", "state": "Santa Cruz",
            },
            {
                "username": "client5", "email": "client5@transcomarapa.com",
                "role": "client", "password": "123456",
                "firstname": "Roberto", "lastname": "Silva",
                "phone": "77901234", "birth_date": date(1987, 4, 17),
                "document_id": "9753228", "address": "Av. Central 654",
                "city": "Cochabamba", "state": "Cochabamba",
            },
        ])

        for ud in test_users:
            user = User(
                username=ud["username"], email=ud["email"],
                role=ud["role"],
                hashed_password=get_password_hash(ud["password"]),
                is_active=True, is_admin=(ud["role"] == "admin"),
                firstname=ud["firstname"], lastname=ud["lastname"],
            )
            db.add(user)
            db.flush()

            common = dict(
                user_id=user.id, firstname=ud["firstname"], lastname=ud["lastname"],
                phone=ud["phone"], birth_date=ud["birth_date"],
            )
            role = ud["role"]
            if role == "admin":
                db.add(Administrator(**common))
            elif role == "secretary":
                db.add(Secretary(**common, office_id=ud["office_id"]))
            elif role == "driver":
                db.add(Driver(
                    **common, license_number=ud["license_number"],
                    license_type=ud["license_type"],
                    license_expiry=ud["license_expiry"], status=ud["status"],
                ))
            elif role == "assistant":
                db.add(Assistant(**common))
            elif role == "client":
                db.add(Client(
                    **common, document_id=ud.get("document_id"),
                    address=ud["address"], city=ud["city"], state=ud["state"],
                ))
            db.flush()

        db.commit()
        print("Usuarios de prueba creados/actualizados exitosamente!")

        print("\n╔══════════════════════════════════════════════════════════════╗")
        print("║              USUARIOS DE PRUEBA — Trans Comarapa            ║")
        print("╠══════════════════════════════════════════════════════════════╣")
        print("║  Password para TODOS: 123456                               ║")
        print("╠══════════════════════════════════════════════════════════════╣")
        print("║  ADMIN                                                     ║")
        print("║    admin1@transcomarapa.com                                ║")
        print("╠══════════════════════════════════════════════════════════════╣")
        print("║  SECRETARIAS (2 por oficina)                               ║")
        for sc in secretary_configs:
            print(f"║    secretary{sc['n']}.{sc['slug']}@transcomarapa.com"
                  f"  ({sc['firstname']} {sc['lastname']} — {sc['slug']})")
        print("╠══════════════════════════════════════════════════════════════╣")
        print("║  CONDUCTORES                                               ║")
        print("║    driver1@transcomarapa.com                               ║")
        print("║    driver2@transcomarapa.com                               ║")
        print("║    driver3@transcomarapa.com                               ║")
        print("╠══════════════════════════════════════════════════════════════╣")
        print("║  ASISTENTES                                                ║")
        print("║    assistant1@transcomarapa.com                            ║")
        print("║    assistant2@transcomarapa.com                            ║")
        print("║    assistant3@transcomarapa.com                            ║")
        print("╠══════════════════════════════════════════════════════════════╣")
        print("║  CLIENTES                                                  ║")
        print("║    client1@transcomarapa.com  (CI: 12693562)               ║")
        print("║    client2@transcomarapa.com  (CI: 9876543)                ║")
        print("║    client3@transcomarapa.com  (CI: 5432109)                ║")
        print("║    client4@transcomarapa.com  (CI: 151985270)              ║")
        print("║    client5@transcomarapa.com  (CI: 9753228)                ║")
        print("╚══════════════════════════════════════════════════════════════╝")

    except Exception as e:
        db.rollback()
        print(f"Error creando usuarios de prueba: {e}")
    finally:
        db.close()


# ── Main ─────────────────────────────────────────────────────────────────────

if __name__ == "__main__":
    print("WARNING: The database will be cleared before seeding if clear_db() is called.")
    clear_db()
    print("Seeding database with a large set of diverse data...")
    seed_db()
    print("Creating/updating specific test users...")
    create_test_users()
    print("Seeding complete.")
