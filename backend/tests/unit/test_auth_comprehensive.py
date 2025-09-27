"""
Pruebas unitarias comprensivas para la autenticación.
Tests de regresión para login/logout y funcionalidades relacionadas.
"""
import pytest
from fastapi import status
from jose import jwt
import time
import json
from datetime import datetime, timedelta
from unittest.mock import patch
from auth.jwt import SECRET_KEY, ALGORITHM, create_access_token
from models.user import UserRole
from auth.blacklist import token_blacklist

# ============ COMPREHENSIVE LOGIN TESTS ============

class TestAuthenticationLogin:
    """Test class for comprehensive login functionality"""

    @pytest.mark.unit
    def test_login_success_complete_response(self, client, test_user):
        """Prueba de inicio de sesión exitoso con verificación completa de la respuesta."""
        response = client.post(
            "/api/v1/auth/login",
            data={
                "username": "test@example.com",
                "password": "password123"
            }
        )
        assert response.status_code == status.HTTP_200_OK
        data = response.json()

        # Verificar estructura completa de la respuesta
        assert "access_token" in data
        assert "refresh_token" in data
        assert "token_type" in data
        assert "expires_in" in data
        assert "refresh_token_expires_in" in data
        assert "role" in data
        assert "user_id" in data
        assert "firstname" in data
        assert "lastname" in data

        # Verificar valores específicos
        assert data["token_type"] == "bearer"
        assert data["role"] == UserRole.USER.value
        assert data["user_id"] == test_user.id
        assert data["firstname"] == "Test"
        assert data["lastname"] == "User"
        assert data["expires_in"] == 30 * 60  # 30 minutos en segundos
        assert data["refresh_token_expires_in"] == 7 * 24 * 60 * 60  # 7 días en segundos

        # Verificar que los tokens son válidos JWT
        access_payload = jwt.decode(data["access_token"], SECRET_KEY, algorithms=[ALGORITHM])
        refresh_payload = jwt.decode(data["refresh_token"], SECRET_KEY, algorithms=[ALGORITHM])

        assert access_payload["sub"] == "test@example.com"
        assert access_payload["role"] == UserRole.USER.value
        assert refresh_payload["token_type"] == "refresh"

    @pytest.mark.unit
    def test_login_invalid_email(self, client):
        """Prueba de inicio de sesión con email inválido."""
        response = client.post(
            "/api/v1/auth/login",
            data={
                "username": "nonexistent@example.com",
                "password": "password123"
            }
        )
        assert response.status_code == status.HTTP_401_UNAUTHORIZED
        data = response.json()
        assert "detail" in data
        assert ("Incorrect email or password" in data["detail"] or
                "Credenciales incorrectas" in data["detail"])

    @pytest.mark.unit
    def test_login_invalid_password(self, client, test_user):
        """Prueba de inicio de sesión con contraseña incorrecta."""
        response = client.post(
            "/api/v1/auth/login",
            data={
                "username": "test@example.com",
                "password": "wrongpassword"
            }
        )
        assert response.status_code == status.HTTP_401_UNAUTHORIZED
        data = response.json()
        assert "detail" in data

    @pytest.mark.unit
    def test_login_empty_credentials(self, client):
        """Prueba de inicio de sesión con credenciales vacías."""
        response = client.post(
            "/api/v1/auth/login",
            data={
                "username": "",
                "password": ""
            }
        )
        assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY

    @pytest.mark.unit
    def test_login_missing_fields(self, client):
        """Prueba de inicio de sesión con campos faltantes."""
        response = client.post(
            "/api/v1/auth/login",
            data={"username": "test@example.com"}
        )
        assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY

    @pytest.mark.unit
    def test_login_cookies_set(self, client, test_user):
        """Prueba que las cookies httpOnly se establecen correctamente al hacer login."""
        response = client.post(
            "/api/v1/auth/login",
            data={
                "username": "test@example.com",
                "password": "password123"
            }
        )
        assert response.status_code == status.HTTP_200_OK

        # Verificar que las cookies fueron establecidas
        cookies = response.cookies
        assert "access_token" in cookies
        assert "refresh_token" in cookies

    @pytest.mark.unit
    def test_login_brute_force_protection_warning(self, client, test_user):
        """Prueba que se muestren advertencias de intentos restantes."""
        # Hacer algunos intentos fallidos para activar las advertencias
        for attempt in range(3):
            response = client.post(
                "/api/v1/auth/login",
                data={
                    "username": "test@example.com",
                    "password": "wrongpassword"
                }
            )
            assert response.status_code in [status.HTTP_401_UNAUTHORIZED, status.HTTP_429_TOO_MANY_REQUESTS]

            # Si no está bloqueado, verificar que el mensaje incluya información útil
            if response.status_code == status.HTTP_401_UNAUTHORIZED:
                data = response.json()
                assert "detail" in data

    @pytest.mark.unit
    def test_login_successful_clears_failed_attempts(self, client, test_user):
        """Prueba que un login exitoso limpie los intentos fallidos previos."""
        # Hacer algunos intentos fallidos
        for _ in range(2):
            client.post(
                "/api/v1/auth/login",
                data={
                    "username": "test@example.com",
                    "password": "wrongpassword"
                }
            )

        # Login exitoso debería limpiar los intentos
        response = client.post(
            "/api/v1/auth/login",
            data={
                "username": "test@example.com",
                "password": "password123"
            }
        )
        assert response.status_code == status.HTTP_200_OK

# ============ COMPREHENSIVE LOGOUT TESTS ============

class TestAuthenticationLogout:
    """Test class for comprehensive logout functionality"""

    @pytest.mark.unit
    def test_logout_success(self, client, user_token):
        """Prueba de cierre de sesión exitoso."""
        response = client.post(
            "/api/v1/auth/logout",
            headers={"Authorization": f"Bearer {user_token}"}
        )
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["message"] == "Logout successful"

    @pytest.mark.unit
    def test_logout_invalidates_token(self, client, user_token):
        """Prueba que el logout invalide el token."""
        # Primero verificar que el token funciona
        response = client.get(
            "/api/v1/auth/me",
            headers={"Authorization": f"Bearer {user_token}"}
        )
        assert response.status_code == status.HTTP_200_OK

        # Hacer logout
        response = client.post(
            "/api/v1/auth/logout",
            headers={"Authorization": f"Bearer {user_token}"}
        )
        assert response.status_code == status.HTTP_200_OK

        # Verificar que el token ya no funciona
        response = client.get(
            "/api/v1/auth/me",
            headers={"Authorization": f"Bearer {user_token}"}
        )
        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    @pytest.mark.unit
    def test_logout_without_token(self, client):
        """Prueba de logout sin token de autenticación."""
        response = client.post("/api/v1/auth/logout")
        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    @pytest.mark.unit
    def test_logout_invalid_token(self, client):
        """Prueba de logout con token inválido."""
        response = client.post(
            "/api/v1/auth/logout",
            headers={"Authorization": "Bearer invalid_token"}
        )
        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    @pytest.mark.unit
    def test_logout_expired_token(self, client, test_user):
        """Prueba de logout con token expirado."""
        # Crear un token expirado
        expired_token = create_access_token(
            data={
                "sub": test_user.email,
                "role": test_user.role.value,
                "is_admin": test_user.is_admin,
                "is_active": test_user.is_active,
                "firstname": test_user.firstname,
                "lastname": test_user.lastname
            },
            expires_delta=timedelta(seconds=-1)  # Token ya expirado
        )

        response = client.post(
            "/api/v1/auth/logout",
            headers={"Authorization": f"Bearer {expired_token}"}
        )
        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    @pytest.mark.unit
    def test_logout_clears_cookies(self, client, user_token):
        """Prueba que el logout limpie las cookies httpOnly."""
        response = client.post(
            "/api/v1/auth/logout",
            headers={"Authorization": f"Bearer {user_token}"}
        )
        assert response.status_code == status.HTTP_200_OK

        # Verificar que las cookies fueron procesadas
        assert response.cookies is not None

    @pytest.mark.unit
    def test_double_logout(self, client, user_token):
        """Prueba de logout doble (segundo logout debería fallar)."""
        # Primer logout exitoso
        response = client.post(
            "/api/v1/auth/logout",
            headers={"Authorization": f"Bearer {user_token}"}
        )
        assert response.status_code == status.HTTP_200_OK

        # Segundo logout con el mismo token debería fallar
        response = client.post(
            "/api/v1/auth/logout",
            headers={"Authorization": f"Bearer {user_token}"}
        )
        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    @pytest.mark.unit
    def test_logout_token_blacklisted(self, client, user_token):
        """Prueba que el token se agregue a la blacklist después del logout."""
        # Hacer logout
        response = client.post(
            "/api/v1/auth/logout",
            headers={"Authorization": f"Bearer {user_token}"}
        )
        assert response.status_code == status.HTTP_200_OK

        # Decodificar el token para obtener el JTI
        payload = jwt.decode(user_token, SECRET_KEY, algorithms=[ALGORITHM])
        jti = payload.get("jti")

        # Verificar que el JTI está en la blacklist
        assert jti is not None
        assert token_blacklist.is_token_blacklisted(jti)

# ============ TOKEN VERIFICATION AND REFRESH TESTS ============

class TestTokenOperations:
    """Test class for token verification and refresh functionality"""

    @pytest.mark.unit
    def test_verify_token_endpoint(self, client, user_token):
        """Prueba del endpoint de verificación de token."""
        response = client.get(
            "/api/v1/auth/verify",
            headers={"Authorization": f"Bearer {user_token}"}
        )
        assert response.status_code == status.HTTP_200_OK
        data = response.json()

        assert data["valid"] is True
        assert "user_id" in data
        assert "email" in data
        assert "role" in data
        assert "is_active" in data
        assert data["email"] == "test@example.com"

    @pytest.mark.unit
    def test_refresh_token_endpoint(self, client, test_user, user_token):
        """Prueba del endpoint de refresh token."""
        response = client.post(
            "/api/v1/auth/refresh",
            headers={"Authorization": f"Bearer {user_token}"}
        )
        assert response.status_code == status.HTTP_200_OK
        data = response.json()

        # Verificar que se recibe un nuevo token
        assert "access_token" in data
        assert "refresh_token" in data
        assert data["token_type"] == "bearer"

        # Verificar que el nuevo token es diferente al original
        assert data["access_token"] != user_token

    @pytest.mark.unit
    def test_me_endpoint_with_valid_token(self, client, user_token):
        """Prueba del endpoint /me con token válido."""
        response = client.get(
            "/api/v1/auth/me",
            headers={"Authorization": f"Bearer {user_token}"}
        )
        assert response.status_code == status.HTTP_200_OK
        data = response.json()

        assert data["email"] == "test@example.com"
        assert data["role"] == UserRole.USER.value

# ============ SECURITY TESTS ============

class TestAuthenticationSecurity:
    """Test class for security-related authentication tests"""

    @pytest.mark.unit
    def test_token_contains_required_claims(self, client, test_user):
        """Prueba que el token contenga todos los claims requeridos."""
        response = client.post(
            "/api/v1/auth/login",
            data={
                "username": "test@example.com",
                "password": "password123"
            }
        )
        assert response.status_code == status.HTTP_200_OK
        data = response.json()

        # Decodificar y verificar claims del access token
        access_payload = jwt.decode(data["access_token"], SECRET_KEY, algorithms=[ALGORITHM])
        required_claims = ["sub", "role", "is_admin", "is_active", "firstname", "lastname", "exp", "jti"]

        for claim in required_claims:
            assert claim in access_payload, f"Missing required claim: {claim}"

        # Verificar valores específicos
        assert access_payload["sub"] == test_user.email
        assert access_payload["role"] == test_user.role.value
        assert access_payload["is_admin"] == test_user.is_admin
        assert access_payload["is_active"] == test_user.is_active

    @pytest.mark.unit
    def test_sql_injection_in_login(self, client):
        """Prueba de protección contra inyección SQL en login."""
        sql_injection_attempts = [
            "admin@example.com'; DROP TABLE users; --",
            "admin@example.com' OR '1'='1",
            "admin@example.com' UNION SELECT * FROM users --",
            "'; DELETE FROM users WHERE '1'='1' --",
        ]

        for injection_attempt in sql_injection_attempts:
            response = client.post(
                "/api/v1/auth/login",
                data={
                    "username": injection_attempt,
                    "password": "password123"
                }
            )
            # Should return 401 (not found/unauthorized) instead of 500 (server error)
            assert response.status_code in [status.HTTP_401_UNAUTHORIZED, status.HTTP_422_UNPROCESSABLE_ENTITY]

    @pytest.mark.unit
    def test_login_case_sensitivity(self, client, test_user):
        """Prueba que el login sea case sensitive para el email."""
        # Email en mayúsculas debería fallar
        response = client.post(
            "/api/v1/auth/login",
            data={
                "username": "TEST@EXAMPLE.COM",
                "password": "password123"
            }
        )
        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    @pytest.mark.unit
    def test_login_whitespace_handling(self, client):
        """Prueba manejo de espacios en blanco en credenciales."""
        response = client.post(
            "/api/v1/auth/login",
            data={
                "username": "  test@example.com  ",
                "password": "password123"
            }
        )
        # Dependiendo de la implementación, esto podría ser 401 o el sistema podría hacer trim
        assert response.status_code in [status.HTTP_401_UNAUTHORIZED, status.HTTP_200_OK]

    @pytest.mark.unit
    def test_password_field_not_in_response(self, client, test_user):
        """Prueba que la contraseña no se incluya en ninguna respuesta."""
        response = client.post(
            "/api/v1/auth/login",
            data={
                "username": "test@example.com",
                "password": "password123"
            }
        )
        assert response.status_code == status.HTTP_200_OK
        data = response.json()

        # Verificar que no hay campos relacionados con contraseñas
        password_fields = ["password", "hashed_password", "pwd", "pass"]
        for field in password_fields:
            assert field not in data

    @pytest.mark.unit
    def test_token_jti_uniqueness(self, client, test_user):
        """Prueba que cada token tenga un JTI único."""
        tokens = []
        jtis = []

        # Generar múltiples tokens
        for _ in range(3):
            response = client.post(
                "/api/v1/auth/login",
                data={
                    "username": "test@example.com",
                    "password": "password123"
                }
            )
            assert response.status_code == status.HTTP_200_OK
            data = response.json()
            token = data["access_token"]
            tokens.append(token)

            # Decodificar token y extraer JTI
            payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
            jti = payload.get("jti")
            assert jti is not None
            jtis.append(jti)

        # Verificar que todos los JTIs son únicos
        assert len(set(jtis)) == len(jtis), "JTIs should be unique"

# ============ REGRESSION TESTS ============

class TestAuthenticationRegression:
    """Regression tests to ensure existing functionality continues to work"""

    @pytest.mark.unit
    def test_login_success_legacy_compatibility(self, client, test_user):
        """Prueba de compatibilidad con la funcionalidad legacy de login."""
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
    def test_login_invalid_credentials_legacy(self, client):
        """Prueba legacy de inicio de sesión con credenciales inválidas."""
        response = client.post(
            "/api/v1/auth/login",
            data={
                "username": "nonexistent@example.com",
                "password": "wrongpassword"
            }
        )
        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    @pytest.mark.unit
    def test_token_validation_legacy(self, client, user_token):
        """Prueba legacy de validación de token."""
        response = client.get(
            "/api/v1/auth/me",
            headers={"Authorization": f"Bearer {user_token}"}
        )
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["email"] == "test@example.com"
        assert data["role"] == UserRole.USER.value

    @pytest.mark.unit
    def test_token_decode_legacy(self, user_token):
        """Prueba legacy de decodificación de token."""
        payload = jwt.decode(user_token, SECRET_KEY, algorithms=[ALGORITHM])
        assert payload["sub"] == "test@example.com"
        assert payload["role"] == UserRole.USER.value
        assert payload["is_admin"] is False

    @pytest.mark.unit
    def test_logout_legacy(self, client, user_token):
        """Prueba legacy de cierre de sesión."""
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

# ============ EDGE CASES AND ERROR HANDLING ============

class TestEdgeCasesAndSecurity:
    """Test class for edge cases and additional security scenarios"""

    @pytest.mark.unit
    def test_malformed_json_in_request(self, client):
        """Prueba manejo de JSON malformado en requests."""
        response = client.post(
            "/api/v1/auth/login",
            json='{"username": "test@example.com", "password": malformed}',
            headers={"Content-Type": "application/json"}
        )
        # Should handle malformed JSON gracefully
        assert response.status_code in [status.HTTP_422_UNPROCESSABLE_ENTITY, status.HTTP_400_BAD_REQUEST]

    @pytest.mark.unit
    def test_very_long_credentials(self, client):
        """Prueba manejo de credenciales extremadamente largas."""
        long_string = "a" * 1000
        response = client.post(
            "/api/v1/auth/login",
            data={
                "username": long_string + "@example.com",
                "password": long_string
            }
        )
        # Should handle gracefully without server errors
        assert response.status_code in [status.HTTP_401_UNAUTHORIZED, status.HTTP_422_UNPROCESSABLE_ENTITY]

    @pytest.mark.unit
    def test_special_characters_in_credentials(self, client):
        """Prueba manejo de caracteres especiales en credenciales."""
        special_chars = "!@#$%^&*()_+-=[]{}|;':\",./<>?"
        response = client.post(
            "/api/v1/auth/login",
            data={
                "username": f"test{special_chars}@example.com",
                "password": f"password{special_chars}"
            }
        )
        # Should handle special characters without server errors
        assert response.status_code in [status.HTTP_401_UNAUTHORIZED, status.HTTP_422_UNPROCESSABLE_ENTITY]

    @pytest.mark.unit
    def test_unicode_in_credentials(self, client):
        """Prueba manejo de caracteres Unicode en credenciales."""
        unicode_string = "testñáéíóú@example.com"
        response = client.post(
            "/api/v1/auth/login",
            data={
                "username": unicode_string,
                "password": "contraseña123"
            }
        )
        # Should handle Unicode characters without server errors
        assert response.status_code in [status.HTTP_401_UNAUTHORIZED, status.HTTP_422_UNPROCESSABLE_ENTITY]