import pytest
from fastapi.testclient import TestClient

@pytest.mark.integration
def test_get_owners_empty(client: TestClient, admin_token):
    headers = {"Authorization": f"Bearer {admin_token}"}
    response = client.get("/api/v1/owners", headers=headers)
    assert response.status_code == 200
    data = response.json()
    assert "items" in data

@pytest.mark.integration
def test_create_owner(client: TestClient, admin_token):
    headers = {"Authorization": f"Bearer {admin_token}"}
    payload = {
        "firstname": "Test",
        "lastname": "Owner",
        "ci": "12345678",
        "phone": "5551234",
        "email": "test-owner@example.com"
    }
    response = client.post("/api/v1/owners", json=payload, headers=headers)
    assert response.status_code == 201, response.text
    data = response.json()
    assert data["firstname"] == "Test"
    assert data["lastname"] == "Owner"
    assert "id" in data

    # Verify it can be fetched
    fetch_resp = client.get(f"/api/v1/owners/{data['id']}", headers=headers)
    assert fetch_resp.status_code == 200
    assert fetch_resp.json()["id"] == data["id"]
