"""
Pruebas unitarias para la gestión de boletos.
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
from models.client import Client
from models.seat import Seat
from models.ticket import Ticket
from models.user import User, UserRole

@pytest.fixture
def setup_ticket_data(db_session):
    """Configura datos para pruebas de boletos."""
    # Limpiar datos existentes
    db_session.query(Ticket).delete()
    db_session.query(Trip).delete()
    db_session.query(Driver).delete()
    db_session.query(Assistant).delete()
    db_session.query(Secretary).delete()
    db_session.query(Client).delete()
    db_session.query(Seat).delete()
    db_session.query(Bus).delete()
    db_session.query(Route).delete()
    db_session.query(Location).delete()

    # Eliminar usuarios existentes con los mismos emails
    for email in ["driver1@example.com", "assistant1@example.com", "secretary1@example.com", "client1@example.com"]:
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

    # Crear usuarios para driver, assistant, secretary y client
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

    client_user = User(
        username="client1",
        email="client1@example.com",
        hashed_password=User.get_password_hash("password123"),
        role=UserRole.CLIENT,
        is_active=True,
        is_admin=False,
        firstname="Client",
        lastname="Test"
    )

    db_session.add_all([driver_user, assistant_user, secretary_user, client_user])
    db_session.commit()

    # Crear driver, assistant, secretary y client
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

    client = Client(
        user_id=client_user.id,
        firstname="Client",
        lastname="Test",
        phone="123456789",
        address="Dirección de prueba",
        city="Ciudad de prueba",
        state="Estado de prueba"
    )

    db_session.add_all([driver, assistant, secretary, client])

    # Crear bus
    bus = Bus(
        license_plate="ABC123",
        capacity=40,
        model="Bus Model"
    )
    db_session.add(bus)
    db_session.commit()

    # Crear asientos para el bus
    seats = []
    for i in range(1, 41):
        seat = Seat(
            seat_number=i,
            bus_id=bus.id,
            deck="lower"
        )
        seats.append(seat)

    db_session.add_all(seats)
    db_session.commit()

    # Crear viaje
    trip_datetime = datetime.now() + timedelta(days=1)
    trip = Trip(
        trip_datetime=trip_datetime,
        driver_id=driver.id,
        assistant_id=assistant.id,
        bus_id=bus.id,
        route_id=route.id,
        secretary_id=secretary.id
    )
    db_session.add(trip)
    db_session.commit()

    return {
        "trip": trip,
        "client": client,
        "secretary": secretary,
        "seats": seats
    }

@pytest.mark.unit
def test_create_ticket(db_session, setup_ticket_data, admin_token, client):
    """Prueba de creación de boleto."""
    data = setup_ticket_data

    response = client.post(
        "/api/v1/tickets/",
        headers={"Authorization": f"Bearer {admin_token}"},
        json={
            "state": "pending",
            "seat_id": data["seats"][0].id,
            "client_id": data["client"].id,
            "trip_id": data["trip"].id,
            "secretary_id": data["secretary"].id
        }
    )

    assert response.status_code == status.HTTP_201_CREATED
    ticket_data = response.json()
    assert ticket_data["state"] == "pending"
    assert ticket_data["seat_id"] == data["seats"][0].id
    assert ticket_data["client_id"] == data["client"].id
    assert ticket_data["trip_id"] == data["trip"].id

@pytest.mark.unit
def test_create_duplicate_ticket(db_session, setup_ticket_data, admin_token, client):
    """Prueba de creación de boleto duplicado."""
    data = setup_ticket_data

    # Crear un boleto
    ticket = Ticket(
        state="pending",
        seat_id=data["seats"][0].id,
        client_id=data["client"].id,
        trip_id=data["trip"].id,
        secretary_id=data["secretary"].id
    )
    db_session.add(ticket)
    db_session.commit()

    # Intentar crear otro boleto para el mismo asiento y viaje
    response = client.post(
        "/api/v1/tickets/",
        headers={"Authorization": f"Bearer {admin_token}"},
        json={
            "state": "pending",
            "seat_id": data["seats"][0].id,
            "client_id": data["client"].id,
            "trip_id": data["trip"].id,
            "secretary_id": data["secretary"].id
        }
    )

    assert response.status_code == status.HTTP_409_CONFLICT

@pytest.mark.unit
def test_update_ticket_state(db_session, setup_ticket_data, admin_token, client):
    """Prueba de actualización de estado de boleto."""
    data = setup_ticket_data

    # Crear un boleto
    ticket = Ticket(
        state="pending",
        seat_id=data["seats"][0].id,
        client_id=data["client"].id,
        trip_id=data["trip"].id,
        secretary_id=data["secretary"].id
    )
    db_session.add(ticket)
    db_session.commit()

    # Actualizar el estado del boleto
    response = client.put(
        f"/api/v1/tickets/{ticket.id}",
        headers={"Authorization": f"Bearer {admin_token}"},
        json={
            "state": "confirmed",
            "seat_id": data["seats"][0].id,
            "client_id": data["client"].id,
            "trip_id": data["trip"].id,
            "secretary_id": data["secretary"].id
        }
    )

    assert response.status_code == status.HTTP_200_OK
    ticket_data = response.json()
    assert ticket_data["state"] == "confirmed"

@pytest.mark.unit
def test_get_ticket(db_session, setup_ticket_data, admin_token, client):
    """Prueba de obtención de boleto."""
    data = setup_ticket_data

    # Crear un boleto
    ticket = Ticket(
        state="pending",
        seat_id=data["seats"][0].id,
        client_id=data["client"].id,
        trip_id=data["trip"].id,
        secretary_id=data["secretary"].id
    )
    db_session.add(ticket)
    db_session.commit()

    # Obtener el boleto
    response = client.get(
        f"/api/v1/tickets/{ticket.id}",
        headers={"Authorization": f"Bearer {admin_token}"}
    )

    assert response.status_code == status.HTTP_200_OK
    ticket_data = response.json()
    assert ticket_data["id"] == ticket.id
    assert ticket_data["state"] == "pending"
    assert ticket_data["seat_id"] == data["seats"][0].id
