"""
Pruebas unitarias para el modelo de usuario.
"""
import pytest
from models.user import User, UserRole

@pytest.mark.unit
def test_password_hashing():
    """Prueba de hash de contraseña."""
    password = "testpassword123"
    hashed_password = User.get_password_hash(password)
    
    # Verificar que el hash no es igual a la contraseña original
    assert hashed_password != password
    
    # Verificar que la verificación funciona correctamente
    assert User.verify_password(password, hashed_password) is True
    assert User.verify_password("wrongpassword", hashed_password) is False

@pytest.mark.unit
def test_user_creation(db_session):
    """Prueba de creación de usuario."""
    user = User(
        username="testuser2",
        email="testuser2@example.com",
        hashed_password=User.get_password_hash("password123"),
        role=UserRole.CLIENT,
        is_active=True,
        is_admin=False,
        firstname="Test",
        lastname="User2"
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    
    # Verificar que el usuario se ha creado correctamente
    assert user.id is not None
    assert user.email == "testuser2@example.com"
    assert user.role == UserRole.CLIENT
    assert user.is_active is True
    assert user.is_admin is False
    assert user.firstname == "Test"
    assert user.lastname == "User2"

@pytest.mark.unit
def test_user_role_enum():
    """Prueba de enumeración de roles de usuario."""
    assert UserRole.ADMIN.value == "admin"
    assert UserRole.SECRETARY.value == "secretary"
    assert UserRole.DRIVER.value == "driver"
    assert UserRole.ASSISTANT.value == "assistant"
    assert UserRole.CLIENT.value == "client"
    assert UserRole.USER.value == "user"
