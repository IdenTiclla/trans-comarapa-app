"""Fixtures for pure unit tests. No database, no external services."""

import pytest
from unittest.mock import MagicMock, create_autospec
from sqlalchemy.orm import Session

from services.route_service import RouteService
from repositories.route_repository import RouteRepository
from tests.factories import RouteFactory
from schemas.route import RouteCreate, RouteUpdate


from core.exceptions import NotFoundException, ConflictException, ValidationException


from models.route import Route as RouteModel
from models.location import Location as LocationModel
from models.route_schedule import RouteSchedule as RouteScheduleModel


@pytest.fixture
def mock_repo():
    """A MagicMock RouteRepository for unit tests."""
    return create_autospec(RouteRepository, instance=True)


    

@pytest.mark.unit
class TestRouteServiceGetAll:
    def test_get_all_returns_routes_with_locations(self, mock_db, mock_repo):
        mock_origin_location = MagicMock()
        mock_origin_location.name = "Origin Test"
        mock_destination_location = MagicMock()
        mock_destination_location.name = "Destination Test"
        
        mock_route_1 = MagicMock()
        mock_route_1.origin_location = mock_origin_location
        mock_route_1.destination_location = mock_destination_location
        mock_route_2 = MagicMock()
        mock_route_2.origin_location = mock_destination_location
        mock_route_2.destination_location = mock_origin_location
        
        mock_db.query.options.return_value.joinedload.return_value = [mock_origin_location, mock_destination_location]
        mock_db.query.options.return_value.filter.return_value.all.return_value = [
            mock_route_1,
            mock_route_2,
        ]
        
        service = RouteService(mock_db, repo=mock_repo)
        
        result = service.get_all()
        
        assert len(result) == 2
        assert result[0].origin_location.name == "Origin Test"
        assert result[1].destination_location.name == "Destination Test"


        mock_repo.get_all.assert_not_called()
    
    def test_get_all_without_locations(self, mock_db, mock_repo):
        mock_route = MagicMock()
        mock_route.origin_location = None
        mock_route.destination_location = None
        
        mock_db.query.options.return_value.joinedload.return_value = [None, None]
        mock_db.query.options.return_value.filter.return_value.all.return_value = [mock_route]
        
        service = RouteService(mock_db, repo=mock_repo)
        
        result = service.get_all()
        
        assert len(result) == 1
        assert result[0].origin_location is None
        assert result[0].destination_location is None


@pytest.mark.unit
class TestRouteServiceGetById:
    def test_get_by_id_returns_route_with_locations(self, mock_db, mock_repo):
        mock_origin_location = MagicMock()
        mock_origin_location.name = "Origin Test"
        mock_destination_location = MagicMock()
        mock_destination_location.name = "Destination Test"
        
        mock_route = MagicMock()
        mock_route.origin_location = mock_origin_location
        mock_route.destination_location = mock_destination_location
        
        mock_db.query.options.return_value.joinedload.return_value = [mock_origin_location, mock_destination_location]
        mock_db.query.options.return_value.filter.return_value.first.return_value = mock_route
        
        service = RouteService(mock_db, repo=mock_repo)
        
        result = service.get_by_id(1)
        
        assert result == mock_route
        assert result.origin_location.name == "Origin Test"
        assert result.destination_location.name == "Destination Test"
    
    def test_get_by_id_without_locations(self, mock_db, mock_repo):
        mock_route = MagicMock()
        mock_route.origin_location = None
        mock_route.destination_location = None
        
        mock_db.query.options.return_value.joinedload.return_value = [None, None]
        mock_db.query.options.return_value.filter.return_value.first.return_value = mock_route
        
        service = RouteService(mock_db, repo=mock_repo)
        
        result = service.get_by_id(1)
        
        assert result == mock_route
        assert result.origin_location is None
        assert result.destination_location is None
    
    def test_get_by_id_not_found(self, mock_db, mock_repo):
        mock_db.query.options.return_value.joinedload.return_value = [None, None]
        mock_db.query.options.return_value.filter.return_value.first.return_value = None
        
        service = RouteService(mock_db, repo=mock_repo)
        
        with pytest.raises(NotFoundException):
            service.get_by_id(999)


@pytest.mark.unit
class TestRouteServiceCreate:
    def test_create_route_success(self, mock_db, mock_repo):
        route_data = RouteCreate(
            origin_location_id=1,
            destination_location_id=2,
            distance=100.0,
            duration=2.0,
            price=50.0
        )
        
        mock_repo.get_by_id_or_raise.return_value = None
        
        service = RouteService(mock_db, repo=mock_repo)
        
        result = service.create_route(route_data)
        
        mock_repo.create.assert_called_once()
        mock_db.add.assert_called_once()
        mock_db.commit.assert_called_once()
        mock_db.refresh.assert_called_once()
    
    def test_create_route_duplicate_fails(self, mock_db, mock_repo):
        existing_route = RouteFactory()
        mock_repo.get_by_id_or_raise.return_value = existing_route
        
        route_data = RouteCreate(
            origin_location_id=1,
            destination_location_id=2,
            distance=100.0,
            duration=2.0,
            price=50.0
        )
        
        service = RouteService(mock_db, repo=mock_repo)
        
        with pytest.raises(ConflictException):
            service.create_route(route_data)


@pytest.mark.unit
class TestRouteServiceUpdate:
    def test_update_route_success(self, mock_db, mock_repo):
        route = RouteFactory()
        mock_repo.get_by_id_or_raise.return_value = route
        
        route_data = RouteUpdate(
            distance=150.0,
        )
        
        mock_repo.update.return_value = route
        service = RouteService(mock_db, repo=mock_repo)
        
        service.update_route(1, route_data)
        
        mock_repo.update.assert_called_once()
        mock_db.commit.assert_called_once()
        mock_db.refresh.assert_called_once()


@pytest.mark.unit
class TestRouteServiceDelete:
    def test_delete_route_success(self, mock_db, mock_repo):
        route = RouteFactory()
        mock_repo.get_by_id_or_raise.return_value = route
        
        service = RouteService(mock_db, repo=mock_repo)
        
        service.delete_route(1)
        
        mock_repo.delete.assert_called_once()
        mock_db.delete.assert_called_once()
        mock_db.commit.assert_called_once()
    
    def test_delete_route_with_trips_fails(self, mock_db, mock_repo):
        route = RouteFactory()
        mock_repo.get_by_id_or_raise.return_value = route
        
        service = RouteService(mock_db, repo=mock_repo)
        
        service.delete_route(1)
        
        mock_db.query.filter.return_value.first.side_effect = IntegrityError)
        mock_db.delete.side_effect = IntegrityError)
        mock_db.rollback.assert_called_once()
        
        with pytest.raises(ValidationException):
            service.delete_route(1)
