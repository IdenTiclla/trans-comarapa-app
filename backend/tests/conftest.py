"""
Configuración y fixtures para pruebas con pytest.
Este archivo contiene configuraciones globales y fixtures que pueden ser utilizados
por todos los tests.
"""
import os
import pytest

# Establecer que estamos en modo testing
os.environ["TESTING"] = "true"
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool
from fastapi.testclient import TestClient
from datetime import datetime, timedelta

from db.base import Base
from db.session import get_db
from main import app
from auth.jwt import create_access_token
from models.user import User, UserRole

# Configuración de la base de datos de prueba
TEST_DATABASE_URL = os.getenv("TEST_DATABASE_URL", os.getenv("DATABASE_URL", "mysql+pymysql://root:password@localhost:3306/trans_comarapa_test"))

@pytest.fixture(scope="session")
def test_engine():
    """Crea un motor de base de datos para pruebas."""
    engine = create_engine(
        TEST_DATABASE_URL,
        poolclass=StaticPool,
    )
    Base.metadata.create_all(bind=engine)
    yield engine
    Base.metadata.drop_all(bind=engine)

@pytest.fixture(scope="function")
def db_session(test_engine):
    """Crea una sesión de base de datos para pruebas."""
    TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)
    session = TestingSessionLocal()
    try:
        yield session
    finally:
        session.rollback()
        session.close()

@pytest.fixture(scope="function")
def client(db_session):
    """Crea un cliente de prueba para la API."""
    # Limpiar blacklist de tokens antes de cada test
    from auth.blacklist import token_blacklist
    token_blacklist.clear_blacklist()
    
    def override_get_db():
        try:
            yield db_session
        finally:
            pass

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()
    
    # Limpiar blacklist después de cada test
    token_blacklist.clear_blacklist()

@pytest.fixture(scope="function")
def test_user(db_session):
    """Crea un usuario de prueba."""
    # Eliminar usuario existente con el mismo email si existe
    existing_user = db_session.query(User).filter(User.email == "test@example.com").first()
    if existing_user:
        db_session.delete(existing_user)
        db_session.commit()

    user = User(
        username="testuser",
        email="test@example.com",
        hashed_password=User.get_password_hash("password123"),
        role=UserRole.USER,
        is_active=True,
        is_admin=False,
        firstname="Test",
        lastname="User"
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    return user

@pytest.fixture(scope="function")
def test_admin(db_session):
    """Crea un usuario administrador de prueba."""
    # Eliminar usuario existente con el mismo email si existe
    existing_admin = db_session.query(User).filter(User.email == "admin@example.com").first()
    if existing_admin:
        db_session.delete(existing_admin)
        db_session.commit()

    admin = User(
        username="testadmin",
        email="admin@example.com",
        hashed_password=User.get_password_hash("admin123"),
        role=UserRole.ADMIN,
        is_active=True,
        is_admin=True,
        firstname="Admin",
        lastname="User"
    )
    db_session.add(admin)
    db_session.commit()
    db_session.refresh(admin)
    return admin

@pytest.fixture(scope="function")
def user_token(test_user):
    """Crea un token JWT para el usuario de prueba."""
    return create_access_token(
        data={
            "sub": test_user.email,
            "role": test_user.role.value,
            "is_admin": test_user.is_admin,
            "is_active": test_user.is_active,
            "firstname": test_user.firstname,
            "lastname": test_user.lastname
        }
    )

@pytest.fixture(scope="function")
def user_refresh_token(test_user):
    """Crea un refresh token JWT para el usuario de prueba."""
    from datetime import timedelta
    return create_access_token(
        data={
            "sub": test_user.email,
            "role": test_user.role.value,
            "token_type": "refresh",
            "firstname": test_user.firstname,
            "lastname": test_user.lastname
        },
        expires_delta=timedelta(days=7)
    )

@pytest.fixture(scope="function")
def admin_token(test_admin):
    """Crea un token JWT para el administrador de prueba."""
    return create_access_token(
        data={
            "sub": test_admin.email,
            "role": test_admin.role.value,
            "is_admin": test_admin.is_admin,
            "is_active": test_admin.is_active,
            "firstname": test_admin.firstname,
            "lastname": test_admin.lastname
        }
    )
