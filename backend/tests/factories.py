"""Test data factories using factory_boy for consistent test data creation."""

import factory
from models.user import User, UserRole
from models.bus import Bus
from models.seat import Seat
from models.trip import Trip
from models.ticket import Ticket
from models.client import Client
from models.secretary import Secretary
from models.driver import Driver
from models.assistant import Assistant
from models.route import Route
from models.location import Location


class UserFactory(factory.Factory):
    class Meta:
        model = User

    id = factory.Sequence(lambda n: n + 1)
    username = factory.LazyAttribute(lambda o: f"user_{o.id}")
    email = factory.LazyAttribute(lambda o: f"user_{o.id}@test.com")
    hashed_password = "hashed_fake"
    role = UserRole.USER
    is_active = True
    is_admin = False
    firstname = factory.Faker("first_name")
    lastname = factory.Faker("last_name")


class BusFactory(factory.Factory):
    class Meta:
        model = Bus

    id = factory.Sequence(lambda n: n + 1)
    license_plate = factory.Sequence(lambda n: f"ABC{n:03d}")
    capacity = 40
    model = "Test Bus"


class SeatFactory(factory.Factory):
    class Meta:
        model = Seat

    id = factory.Sequence(lambda n: n + 1)
    seat_number = factory.Sequence(lambda n: n + 1)
    bus_id = 1
    deck = "FIRST"
    row = 1
    column = 1


class ClientFactory(factory.Factory):
    class Meta:
        model = Client

    id = factory.Sequence(lambda n: n + 1)
    firstname = factory.Faker("first_name")
    lastname = factory.Faker("last_name")
    phone = "70012345"
    document_id = factory.Sequence(lambda n: f"{n:08d}")


class SecretaryFactory(factory.Factory):
    class Meta:
        model = Secretary

    id = factory.Sequence(lambda n: n + 1)
    firstname = factory.Faker("first_name")
    lastname = factory.Faker("last_name")
    phone = "70012345"


class DriverFactory(factory.Factory):
    class Meta:
        model = Driver

    id = factory.Sequence(lambda n: n + 1)
    firstname = factory.Faker("first_name")
    lastname = factory.Faker("last_name")
    phone = "70012345"
    license_number = factory.Sequence(lambda n: f"LIC{n:05d}")


class AssistantFactory(factory.Factory):
    class Meta:
        model = Assistant

    id = factory.Sequence(lambda n: n + 1)
    firstname = factory.Faker("first_name")
    lastname = factory.Faker("last_name")
    phone = "70012345"


class LocationFactory(factory.Factory):
    class Meta:
        model = Location

    id = factory.Sequence(lambda n: n + 1)
    name = factory.Faker("city")
    address = factory.Faker("address")
    latitude = -17.783333
    longitude = -63.182222
    country = "Bolivia"


class RouteFactory(factory.Factory):
    class Meta:
        model = Route

    id = factory.Sequence(lambda n: n + 1)
    origin_location_id = 1
    destination_location_id = 2
    distance = 100.0
    duration = 2.5
    price = 50.0


class TripFactory(factory.Factory):
    class Meta:
        model = Trip

    id = factory.Sequence(lambda n: n + 1)
    driver_id = 1
    assistant_id = 1
    bus_id = 1
    route_id = 1
    secretary_id = 1
    state = "scheduled"


class TicketFactory(factory.Factory):
    class Meta:
        model = Ticket

    id = factory.Sequence(lambda n: n + 1)
    state = "pending"
    seat_id = 1
    client_id = 1
    trip_id = 1
    secretary_id = 1
    price = 50.0
    payment_method = "cash"
