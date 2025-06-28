import pytest
from datetime import date
from models.user import User
from models.person import Person
from models.driver import Driver
from models.client import Client
from models.secretary import Secretary
from models.assistant import Assistant
from models.administrator import Administrator


@pytest.mark.integration
def test_person_inheritance(db_session):
    """Verificar que la herencia funciona correctamente"""
    # Crear usuario
    user = User(
        username="testdriver",
        email="driver@test.com",
        role="Driver",
        hashed_password="hashed_password"
    )
    db_session.add(user)
    db_session.flush()
    
    # Crear conductor
    driver = Driver(
        user_id=user.id,
        firstname="John",
        lastname="Doe",
        phone="123456789",
        license_number="ABC123",
        license_expiry=date(2025, 12, 31)
    )
    db_session.add(driver)
    db_session.commit()
    
    # Verificar que se puede acceder como Person
    person = db_session.query(Person).filter(Person.user_id == user.id).first()
    assert person is not None
    assert person.type == "driver"
    assert person.firstname == "John"
    assert person.lastname == "Doe"
    assert isinstance(person, Driver)
    assert person.license_number == "ABC123"
    assert person.license_expiry == date(2025, 12, 31)


@pytest.mark.integration
def test_client_inheritance(db_session):
    """Verificar que la herencia funciona para clientes"""
    user = User(
        username="testclient",
        email="client@test.com",
        role="Client",
        hashed_password="hashed_password"
    )
    db_session.add(user)
    db_session.flush()
    
    client = Client(
        user_id=user.id,
        firstname="Jane",
        lastname="Smith",
        phone="987654321",
        address="123 Main St",
        city="Test City"
    )
    db_session.add(client)
    db_session.commit()
    
    # Verificar acceso como Person
    person = db_session.query(Person).filter(Person.user_id == user.id).first()
    assert person is not None
    assert person.type == "client"
    assert isinstance(person, Client)
    assert person.address == "123 Main St"
    assert person.city == "Test City"


@pytest.mark.integration
def test_user_compatibility(db_session):
    """Verificar compatibilidad hacia atrás"""
    # Usuario con campos legacy
    user = User(
        username="legacyuser",
        email="legacy@test.com",
        role="Admin",
        hashed_password="hashed_password",
        firstname="Jane",  # Campo legacy
        lastname="Smith"   # Campo legacy
    )
    db_session.add(user)
    db_session.commit()
    
    # Debe funcionar el acceso legacy
    assert user.firstname == "Jane"
    assert user.lastname == "Smith"
    assert user.full_name == "Jane Smith"
    
    # Debe funcionar el acceso efectivo
    assert user.effective_firstname == "Jane"
    assert user.effective_lastname == "Smith"


@pytest.mark.integration
def test_person_priority_over_legacy(db_session):
    """Verificar que person tiene prioridad sobre legacy"""
    # Usuario con campos legacy
    user = User(
        username="testuser",
        email="test@test.com",
        role="Client",
        hashed_password="hashed_password",
        firstname="Old",    # Legacy
        lastname="Name"     # Legacy
    )
    db_session.add(user)
    db_session.flush()
    
    # Crear person
    person = Client(
        user_id=user.id,
        firstname="New",    # Nuevo
        lastname="Person",  # Nuevo
        address="Test Address"
    )
    db_session.add(person)
    db_session.commit()
    
    # Person debe tener prioridad
    assert user.effective_firstname == "New"
    assert user.effective_lastname == "Person"
    assert user.full_name == "New Person"


@pytest.mark.integration
def test_person_full_name_property(db_session):
    """Verificar la propiedad full_name de Person"""
    user = User(
        username="testuser",
        email="test@test.com",
        role="Secretary",
        hashed_password="hashed_password"
    )
    db_session.add(user)
    db_session.flush()
    
    secretary = Secretary(
        user_id=user.id,
        firstname="John",
        lastname="Doe"
    )
    db_session.add(secretary)
    db_session.commit()
    
    assert secretary.full_name == "John Doe"
    
    # Test con solo firstname
    secretary.lastname = None
    db_session.commit()
    assert secretary.full_name == "John"
    
    # Test sin nombres
    secretary.firstname = None
    db_session.commit()
    assert secretary.full_name == "Usuario"


@pytest.mark.integration
def test_polymorphic_queries(db_session):
    """Verificar que las consultas polimórficas funcionan"""
    # Crear varios tipos de personas
    user1 = User(username="driver1", email="driver1@test.com", role="Driver", hashed_password="pass")
    user2 = User(username="client1", email="client1@test.com", role="Client", hashed_password="pass")
    user3 = User(username="admin1", email="admin1@test.com", role="Admin", hashed_password="pass")
    
    db_session.add_all([user1, user2, user3])
    db_session.flush()
    
    driver = Driver(user_id=user1.id, firstname="Driver", lastname="One", license_number="D001")
    client = Client(user_id=user2.id, firstname="Client", lastname="One", address="Address 1")
    admin = Administrator(user_id=user3.id, firstname="Admin", lastname="One")
    
    db_session.add_all([driver, client, admin])
    db_session.commit()
    
    # Consultar todas las personas
    all_persons = db_session.query(Person).all()
    assert len(all_persons) == 3
    
    # Verificar tipos
    types = [p.type for p in all_persons]
    assert "driver" in types
    assert "client" in types
    assert "administrator" in types
    
    # Consultar solo drivers
    drivers = db_session.query(Driver).all()
    assert len(drivers) == 1
    assert drivers[0].license_number == "D001"
    
    # Consultar solo clients
    clients = db_session.query(Client).all()
    assert len(clients) == 1
    assert clients[0].address == "Address 1"


@pytest.mark.integration
def test_cascade_delete(db_session):
    """Verificar que el cascade delete funciona correctamente"""
    user = User(
        username="testuser",
        email="test@test.com",
        role="Driver",
        hashed_password="hashed_password"
    )
    db_session.add(user)
    db_session.flush()
    
    driver = Driver(
        user_id=user.id,
        firstname="Test",
        lastname="Driver",
        license_number="TEST123"
    )
    db_session.add(driver)
    db_session.commit()
    
    driver_id = driver.id
    user_id = user.id
    
    # Eliminar usuario
    db_session.delete(user)
    db_session.commit()
    
    # Verificar que person también se eliminó
    person = db_session.query(Person).filter(Person.id == driver_id).first()
    assert person is None
    
    driver = db_session.query(Driver).filter(Driver.id == driver_id).first()
    assert driver is None


@pytest.mark.integration
def test_unique_user_id_constraint(db_session):
    """Verificar que un usuario solo puede tener una persona"""
    user = User(
        username="testuser",
        email="test@test.com",
        role="Client",
        hashed_password="hashed_password"
    )
    db_session.add(user)
    db_session.flush()
    
    # Crear primera persona
    client1 = Client(
        user_id=user.id,
        firstname="First",
        lastname="Client"
    )
    db_session.add(client1)
    db_session.commit()
    
    # Intentar crear segunda persona para el mismo usuario
    client2 = Client(
        user_id=user.id,
        firstname="Second",
        lastname="Client"
    )
    db_session.add(client2)
    
    with pytest.raises(Exception):  # Debe fallar por constraint unique
        db_session.commit()


@pytest.mark.integration
def test_person_relationship_with_user(db_session):
    """Verificar que la relación user-person funciona en ambas direcciones"""
    user = User(
        username="testuser",
        email="test@test.com",
        role="Assistant",
        hashed_password="hashed_password"
    )
    db_session.add(user)
    db_session.flush()
    
    assistant = Assistant(
        user_id=user.id,
        firstname="Test",
        lastname="Assistant"
    )
    db_session.add(assistant)
    db_session.commit()
    
    # Acceso desde user a person
    assert user.person is not None
    assert user.person.id == assistant.id
    assert user.person.firstname == "Test"
    
    # Acceso desde person a user
    assert assistant.user is not None
    assert assistant.user.id == user.id
    assert assistant.user.username == "testuser"