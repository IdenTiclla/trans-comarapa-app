import pytest
from unittest.mock import MagicMock, create_autospec

from sqlalchemy.orm import Session

from services.driver_service import DriverService
from repositories.driver_repository import DriverRepository
from models.driver import Driver
from core.exceptions import NotFoundException, ConflictException, ValidationException


@pytest.fixture
def mock_db():
    return create_autospec(Session, instance=True)


@pytest.fixture
def mock_repo():
    return create_autospec(DriverRepository, instance=True)


@pytest.fixture
def service(mock_db, mock_repo):
    return DriverService(mock_db, repo=mock_repo)


def make_driver(**kwargs):
    driver = Driver()
    for k, v in kwargs.items():
        setattr(driver, k, v)
    return driver


class TestDriverServiceCreate:
    def test_create_success(self, service, mock_repo, mock_db):
        mock_repo.get_by_license_number.return_value = None
        driver = make_driver(id=1, firstname="Juan", license_number="LC123")
        mock_repo.create.return_value = driver

        result = service.create({
            "firstname": "Juan",
            "lastname": "Perez",
            "license_number": "LC123",
        })

        mock_repo.get_by_license_number.assert_called_once_with("LC123")
        mock_repo.create.assert_called_once()
        mock_db.commit.assert_called_once()

    def test_create_duplicate_license_raises(self, service, mock_repo):
        mock_repo.get_by_license_number.return_value = make_driver(id=1)

        with pytest.raises(ConflictException):
            service.create({"firstname": "Juan", "license_number": "LC123"})


class TestDriverServiceGet:
    def test_get_by_id_success(self, service, mock_repo):
        expected = make_driver(id=1, firstname="Juan")
        mock_repo.get_by_id_or_raise.return_value = expected

        result = service.get_by_id(1)

        assert result == expected
        mock_repo.get_by_id_or_raise.assert_called_once_with(1, "Driver")

    def test_get_all(self, service, mock_repo):
        drivers = [make_driver(id=1), make_driver(id=2)]
        mock_repo.get_all_drivers.return_value = drivers

        result = service.get_all()

        assert result == drivers


class TestDriverServiceUpdate:
    def test_update_success(self, service, mock_repo, mock_db):
        driver = make_driver(id=1, firstname="Juan", license_number="LC123")
        mock_repo.get_by_id_or_raise.return_value = driver
        mock_repo.get_by_license_number.return_value = None

        result = service.update(1, {"firstname": "Pedro"})

        mock_db.commit.assert_called_once()
        assert driver.firstname == "Pedro"

    def test_update_empty_data_raises(self, service, mock_repo):
        mock_repo.get_by_id_or_raise.return_value = make_driver(id=1)

        with pytest.raises(ValidationException):
            service.update(1, {})

    def test_update_conflicting_license_raises(self, service, mock_repo):
        driver = make_driver(id=1, license_number="LC123")
        other = make_driver(id=2, license_number="LC999")
        mock_repo.get_by_id_or_raise.return_value = driver
        mock_repo.get_by_license_number.return_value = other

        with pytest.raises(ConflictException):
            service.update(1, {"license_number": "LC999"})


class TestDriverServiceDelete:
    def test_delete_success(self, service, mock_repo, mock_db):
        driver = make_driver(id=1, firstname="Juan")
        mock_repo.get_by_id_or_raise.return_value = driver

        result = service.delete(1)

        mock_repo.delete.assert_called_once_with(driver)
        mock_db.commit.assert_called_once()
