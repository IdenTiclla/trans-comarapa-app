"""
Pruebas unitarias para la gestión de viajes.
"""
import pytest
from fastapi import status
from datetime import datetime, timedelta
from models.trip import Trip
from models.route import Route
from models.location import Location
from models.driver import Driver
from models.assistant import Assistant
from models.bus import Bus
from models.secretary import Secretary
from models.ticket import Ticket
from models.ticket_state_history import TicketStateHistory
from models.user import User, UserRole

@pytest.fixture
def setup_trip_data(db_session):
    """Configura datos para pruebas de viajes."""
    # Limpiar datos existentes
    db_session.query(TicketStateHistory).delete()
    db_session.query(Ticket).delete()
    db_session.query(Trip).delete()
    from models.person import Person
    for p in db_session.query(Person).all():
        db_session.delete(p)
    db_session.flush()
    from models.seat import Seat
    db_session.query(Seat).delete()
    db_session.query(Bus).delete()
    db_session.query(Route).delete()
    db_session.query(Location).delete()

    # Eliminar usuarios existentes con los mismos emails
    for email in ["driver1@example.com", "assistant1@example.com", "secretary1@example.com"]:
        existing_user = db_session.query(User).filter(User.email == email).first()
        if existing_user:
            db_session.delete(existing_user)

    db_session.commit()

    # Crear ubicaciones
    origin = Location(
        name="Ciudad A",
        address="Dirección A",
        latitude=-17.783333,
        longitude=-63.182222,
        country="Bolivia"
    )
    destination = Location(
        name="Ciudad B",
        address="Dirección B",
        latitude=-17.800000,
        longitude=-63.200000,
        country="Bolivia"
    )
    db_session.add_all([origin, destination])
    db_session.commit()

    # Crear ruta
    route = Route(
        origin_location_id=origin.id,
        destination_location_id=destination.id,
        distance=100.0,
        duration=2.5,
        price=50.0
    )
    db_session.add(route)

    # Crear usuarios para driver, assistant y secretary
    driver_user = User(
        username="driver1",
        email="driver1@example.com",
        hashed_password=User.get_password_hash("password123"),
        role=UserRole.DRIVER,
        is_active=True,
        is_admin=False,
        firstname="Driver",
        lastname="Test"
    )

    assistant_user = User(
        username="assistant1",
        email="assistant1@example.com",
        hashed_password=User.get_password_hash("password123"),
        role=UserRole.ASSISTANT,
        is_active=True,
        is_admin=False,
        firstname="Assistant",
        lastname="Test"
    )

    secretary_user = User(
        username="secretary1",
        email="secretary1@example.com",
        hashed_password=User.get_password_hash("password123"),
        role=UserRole.SECRETARY,
        is_active=True,
        is_admin=False,
        firstname="Secretary",
        lastname="Test"
    )

    db_session.add_all([driver_user, assistant_user, secretary_user])
    db_session.commit()

    # Crear driver, assistant y secretary
    driver = Driver(
        user_id=driver_user.id,
        firstname="Driver",
        lastname="Test",
        license_number="LIC123",
        phone="123456789"
    )

    assistant = Assistant(
        user_id=assistant_user.id,
        firstname="Assistant",
        lastname="Test",
        phone="123456789"
    )

    secretary = Secretary(
        user_id=secretary_user.id,
        firstname="Secretary",
        lastname="Test",
        office_id=None,  # No necesitamos una oficina para esta prueba
        phone="123456789"
    )

    db_session.add_all([driver, assistant, secretary])

    # Crear bus
    bus = Bus(
        license_plate="ABC123",
        capacity=40,
        model="Bus Model"
    )
    db_session.add(bus)

    db_session.commit()

    return {
        "route": route,
        "driver": driver,
        "assistant": assistant,
        "bus": bus,
        "secretary": secretary
    }

@pytest.mark.unit
def test_create_trip(db_session, setup_trip_data, admin_token, client):
    """Prueba de creación de viaje."""
    data = setup_trip_data

    # Fecha y hora del viaje (30 minutos en el futuro)
    trip_datetime = datetime.now() + timedelta(minutes=60)

    response = client.post(
        "/api/v1/trips/",
        headers={"Authorization": f"Bearer {admin_token}"},
        json={
            "trip_datetime": trip_datetime.isoformat(),
            "driver_id": data["driver"].id,
            "assistant_id": data["assistant"].id,
            "bus_id": data["bus"].id,
            "route_id": data["route"].id,
            "secretary_id": data["secretary"].id
        }
    )

    assert response.status_code == status.HTTP_201_CREATED
    trip_data = response.json()
    assert trip_data["driver_id"] == data["driver"].id
    assert trip_data["route_id"] == data["route"].id

@pytest.mark.unit
def test_create_trip_past_date(db_session, setup_trip_data, admin_token, client):
    """Prueba de creación de viaje con fecha pasada."""
    data = setup_trip_data

    # Fecha y hora del viaje (en el pasado)
    trip_datetime = datetime.now() - timedelta(hours=1)

    response = client.post(
        "/api/v1/trips/",
        headers={"Authorization": f"Bearer {admin_token}"},
        json={
            "trip_datetime": trip_datetime.isoformat(),
            "driver_id": data["driver"].id,
            "assistant_id": data["assistant"].id,
            "bus_id": data["bus"].id,
            "route_id": data["route"].id,
            "secretary_id": data["secretary"].id
        }
    )

    assert response.status_code == status.HTTP_422_UNPROCESSABLE_CONTENT

@pytest.mark.unit
def test_get_trip(db_session, setup_trip_data, admin_token, client):
    """Prueba de obtención de viaje."""
    data = setup_trip_data

    # Crear un viaje
    trip_datetime = datetime.now() + timedelta(hours=1)
    trip = Trip(
        trip_datetime=trip_datetime,
        driver_id=data["driver"].id,
        assistant_id=data["assistant"].id,
        bus_id=data["bus"].id,
        route_id=data["route"].id,
        secretary_id=data["secretary"].id
    )
    db_session.add(trip)
    db_session.commit()

    # Obtener el viaje
    response = client.get(
        f"/api/v1/trips/{trip.id}",
        headers={"Authorization": f"Bearer {admin_token}"}
    )

    assert response.status_code == status.HTTP_200_OK
    trip_data = response.json()
    assert trip_data["id"] == trip.id
    assert trip_data["driver_id"] == data["driver"].id
