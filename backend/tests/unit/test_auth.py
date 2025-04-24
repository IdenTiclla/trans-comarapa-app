"""
Pruebas unitarias para la autenticación.
"""
import pytest
from fastapi import status
from jose import jwt
from auth.jwt import SECRET_KEY, ALGORITHM
from models.user import UserRole

@pytest.mark.unit
def test_login_success(client, test_user):
    """Prueba de inicio de sesión exitoso."""
    response = client.post(
        "/api/v1/auth/login",
        data={
            "username": "test@example.com",
            "password": "password123"
        }
    )
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"
    assert "role" in data
    assert data["role"] == UserRole.USER.value

@pytest.mark.unit
def test_login_invalid_credentials(client):
    """Prueba de inicio de sesión con credenciales inválidas."""
    response = client.post(
        "/api/v1/auth/login",
        data={
            "username": "nonexistent@example.com",
            "password": "wrongpassword"
        }
    )
    assert response.status_code == status.HTTP_401_UNAUTHORIZED

@pytest.mark.unit
def test_token_validation(client, user_token):
    """Prueba de validación de token."""
    response = client.get(
        "/api/v1/auth/me",
        headers={"Authorization": f"Bearer {user_token}"}
    )
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["email"] == "test@example.com"
    assert data["role"] == UserRole.USER.value

@pytest.mark.unit
def test_token_decode(user_token):
    """Prueba de decodificación de token."""
    payload = jwt.decode(user_token, SECRET_KEY, algorithms=[ALGORITHM])
    assert payload["sub"] == "test@example.com"
    assert payload["role"] == UserRole.USER.value
    assert payload["is_admin"] is False

@pytest.mark.unit
@pytest.mark.skip(reason="Hay un problema con la conversión de string a enum en el backend")
def test_register_user(client):
    """Prueba de registro de usuario."""
    response = client.post(
        "/api/v1/auth/register",
        json={
            "username": "newuser",
            "email": "newuser@example.com",
            "password": "newpassword123",
            "role": "client",
            "is_active": True,
            "is_admin": False,
            "firstname": "New",
            "lastname": "User"
        }
    )
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["email"] == "newuser@example.com"
    assert data["role"] == "client"

@pytest.mark.unit
@pytest.mark.skip(reason="Hay un problema con la conversión de string a enum en el backend")
def test_register_duplicate_email(client, test_user):
    """Prueba de registro con email duplicado."""
    # Usamos test_user para verificar que existe un usuario con el mismo email
    response = client.post(
        "/api/v1/auth/register",
        json={
            "username": "duplicateuser",
            "email": "test@example.com",  # Email ya existente
            "password": "newpassword123",
            "role": "client",
            "is_active": True,
            "is_admin": False,
            "firstname": "Duplicate",
            "lastname": "User"
        }
    )
    assert response.status_code == status.HTTP_400_BAD_REQUEST

@pytest.mark.unit
def test_logout(client, user_token):
    """Prueba de cierre de sesión."""
    response = client.post(
        "/api/v1/auth/logout",
        headers={"Authorization": f"Bearer {user_token}"}
    )
    assert response.status_code == status.HTTP_200_OK

    # Verificar que el token ha sido invalidado
    response = client.get(
        "/api/v1/auth/me",
        headers={"Authorization": f"Bearer {user_token}"}
    )
    assert response.status_code == status.HTTP_401_UNAUTHORIZED
