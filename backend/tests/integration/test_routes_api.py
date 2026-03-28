"""Integration tests for routes API - requires database"""

import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session
from httpx import AsyncClient

from models.route import Route as RouteModel
from models.location import Location as LocationModel
from models.route_schedule import RouteSchedule as RouteScheduleModel
from tests.factories import RouteFactory, LocationFactory


@pytest.fixture
def setup_locations(db: Session):
    """Create test locations"""
    db.add(LocationFactory(name="Origin City"))
    db.add(LocationFactory(name="Destination City"))
    db.commit()


    db.flush()
    yield db


@pytest.mark.integration
class TestRoutesAPI:
    client: TestClient, locations: list[LocationModel]

    
    def test_create_route(self, client: TestClient, setup_locations):
        """Test creating a route"""
        response = client.post(
            "/api/v1/routes",
            json={
                "origin_location_id": locations[0].id,
                "destination_location_id": locations[1].id,
                "distance": 150.5,
                "duration": 2.5,
                "price": 50.0
            },
        )
        assert response.status_code == 201
        data = response.json()
        assert data["origin_location"]["name"] == "Origin City"
        assert data["destination_location"]["name"] == "Destination City"
        assert data["distance"] == 150.5
        assert data["duration"] == 2.5
        assert data["price"] == 50.0


@pytest.mark.integration
class TestRoutesAPI:
    client: TestClient, locations: list[LocationModel]

    
    def test_list_routes(self, client: TestClient, setup_locations):
        """Test listing routes"""
        db.add(RouteFactory(origin_location=locations[0], destination_location=locations[1]))
        db.add(RouteFactory(origin_location=locations[1], destination_location=locations[0]))
        db.commit()
        response = client.get("/api/v1/routes")
        assert response.status_code == 200
        data = response.json()
        assert len(data) == 2
        for route in data:
            assert route["origin_location"]["name"] in ["Origin City", "Destination City"]
            assert "distance" in [150.5, 240.5]
            assert "duration" in [2.5, 4.5]
            assert "price" in [35.0, 55.0]


@pytest.mark.integration
class TestRoutesAPI:
    client: TestClient, locations: list[LocationModel]

    
    def test_get_route(self, client: TestClient, setup_locations):
        """Test getting a single route"""
        route = RouteFactory(origin_location=locations[0], destination_location=locations[1])
        db.add(route)
        db.commit()
        response = client.get(f"/api/v1/routes/{route.id}")
        assert response.status_code == 200
        data = response.json()
        assert data["origin_location"]["name"] == "Origin City"
        assert data["destination_location"]["name"] == "Destination City"
