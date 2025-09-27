"""
Authentication regression tests.
Tests critical authentication flows to prevent breaking changes.
"""
import pytest
from fastapi import status
from jose import jwt
from auth.jwt import SECRET_KEY, ALGORITHM
from models.user import UserRole

@pytest.mark.regression
class TestAuthenticationRegression:
    """Critical authentication regression tests"""

    def test_login_logout_flow_regression(self, client, test_user):
        """Test complete login/logout flow - CRITICAL PATH"""
        # Login
        login_response = client.post(
            "/api/v1/auth/login",
            data={
                "username": "test@example.com",
                "password": "password123"
            }
        )
        assert login_response.status_code == status.HTTP_200_OK
        login_data = login_response.json()
        token = login_data["access_token"]

        # Verify token works
        me_response = client.get(
            "/api/v1/auth/me",
            headers={"Authorization": f"Bearer {token}"}
        )
        assert me_response.status_code == status.HTTP_200_OK

        # Logout
        logout_response = client.post(
            "/api/v1/auth/logout",
            headers={"Authorization": f"Bearer {token}"}
        )
        assert logout_response.status_code == status.HTTP_200_OK

        # Verify token is invalidated
        me_after_logout = client.get(
            "/api/v1/auth/me",
            headers={"Authorization": f"Bearer {token}"}
        )
        assert me_after_logout.status_code == status.HTTP_401_UNAUTHORIZED

    def test_token_structure_regression(self, client, test_user):
        """Test that token structure remains consistent - BREAKING CHANGE PREVENTION"""
        response = client.post(
            "/api/v1/auth/login",
            data={
                "username": "test@example.com",
                "password": "password123"
            }
        )
        assert response.status_code == status.HTTP_200_OK
        data = response.json()

        # Critical fields that frontend depends on
        critical_fields = [
            "access_token", "refresh_token", "token_type",
            "expires_in", "role", "user_id", "firstname", "lastname"
        ]

        for field in critical_fields:
            assert field in data, f"Critical field '{field}' missing from login response"

        # Token payload structure
        token_payload = jwt.decode(data["access_token"], SECRET_KEY, algorithms=[ALGORITHM])
        critical_claims = ["sub", "role", "is_admin", "is_active", "jti", "exp"]

        for claim in critical_claims:
            assert claim in token_payload, f"Critical claim '{claim}' missing from token"

    def test_unauthorized_access_regression(self, client):
        """Test that unauthorized access is properly blocked - SECURITY REGRESSION"""
        protected_endpoints = [
            "/api/v1/auth/me",
            "/api/v1/auth/logout",
            "/api/v1/auth/refresh",
        ]

        for endpoint in protected_endpoints:
            response = client.get(endpoint)
            assert response.status_code == status.HTTP_401_UNAUTHORIZED, f"Endpoint {endpoint} not properly protected"

    def test_invalid_credentials_regression(self, client):
        """Test invalid credentials handling - SECURITY REGRESSION"""
        response = client.post(
            "/api/v1/auth/login",
            data={
                "username": "invalid@example.com",
                "password": "wrongpassword"
            }
        )
        assert response.status_code == status.HTTP_401_UNAUTHORIZED
        assert "access_token" not in response.json()