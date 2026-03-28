"""Pure unit tests for SeatLockService - no Redis required."""

import pytest
from unittest.mock import MagicMock, patch

from services.seat_lock_service import SeatLockService


def _make_service(redis_available=True):
    service = SeatLockService()
    return service


def _mock_redis_client(connected=True):
    mock = MagicMock()
    mock.is_connected.return_value = connected
    mock.client = MagicMock()
    return mock


@pytest.mark.unit
class TestLockSeat:
    def test_lock_new_seat_succeeds(self):
        service = _make_service()
        mock_redis = _mock_redis_client()
        mock_redis.client.get.return_value = None
        mock_redis.client.set.return_value = True

        with patch("services.seat_lock_service.redis_client", mock_redis):
            result = service.lock_seat(trip_id=1, seat_id=5, user_id=10)

        assert result["locked"] is True
        assert result["ttl"] == 300
        mock_redis.client.set.assert_called_once()

    def test_lock_same_user_extends_ttl(self):
        service = _make_service()
        mock_redis = _mock_redis_client()
        mock_redis.client.get.return_value = "10"  # Same user

        with patch("services.seat_lock_service.redis_client", mock_redis):
            result = service.lock_seat(trip_id=1, seat_id=5, user_id=10)

        assert result["locked"] is True
        assert result["extended"] is True
        mock_redis.client.expire.assert_called_once()

    def test_lock_different_user_fails(self):
        service = _make_service()
        mock_redis = _mock_redis_client()
        mock_redis.client.get.side_effect = [None, "20"]  # First get: not same user, second: holder
        mock_redis.client.set.return_value = False  # NX fails

        with patch("services.seat_lock_service.redis_client", mock_redis):
            result = service.lock_seat(trip_id=1, seat_id=5, user_id=10)

        assert result["locked"] is False
        assert result["holder"] == 20

    def test_lock_fallback_without_redis(self):
        service = _make_service()
        mock_redis = _mock_redis_client(connected=False)

        with patch("services.seat_lock_service.redis_client", mock_redis):
            result = service.lock_seat(trip_id=1, seat_id=5, user_id=10)

        assert result["locked"] is True
        assert result["fallback"] is True


@pytest.mark.unit
class TestUnlockSeat:
    def test_unlock_own_seat(self):
        service = _make_service()
        mock_redis = _mock_redis_client()
        mock_redis.client.get.return_value = "10"

        with patch("services.seat_lock_service.redis_client", mock_redis):
            result = service.unlock_seat(trip_id=1, seat_id=5, user_id=10)

        assert result is True
        mock_redis.client.delete.assert_called_once()

    def test_unlock_other_users_seat_fails(self):
        service = _make_service()
        mock_redis = _mock_redis_client()
        mock_redis.client.get.return_value = "20"

        with patch("services.seat_lock_service.redis_client", mock_redis):
            result = service.unlock_seat(trip_id=1, seat_id=5, user_id=10)

        assert result is False
        mock_redis.client.delete.assert_not_called()

    def test_unlock_nonexistent_lock_returns_true(self):
        service = _make_service()
        mock_redis = _mock_redis_client()
        mock_redis.client.get.return_value = None

        with patch("services.seat_lock_service.redis_client", mock_redis):
            result = service.unlock_seat(trip_id=1, seat_id=5, user_id=10)

        assert result is True

    def test_unlock_fallback_without_redis(self):
        service = _make_service()
        mock_redis = _mock_redis_client(connected=False)

        with patch("services.seat_lock_service.redis_client", mock_redis):
            result = service.unlock_seat(trip_id=1, seat_id=5, user_id=10)

        assert result is True


@pytest.mark.unit
class TestUnlockBulk:
    def test_bulk_unlock_multiple_seats(self):
        service = _make_service()
        mock_redis = _mock_redis_client()
        mock_redis.client.get.return_value = "10"

        with patch("services.seat_lock_service.redis_client", mock_redis):
            result = service.unlock_seats_bulk(trip_id=1, seat_ids=[1, 2, 3], user_id=10)

        assert result == 3


@pytest.mark.unit
class TestGetLockedSeats:
    def test_returns_locked_seats(self):
        service = _make_service()
        mock_redis = _mock_redis_client()
        mock_redis.client.scan_iter.return_value = ["seat_lock:1:5", "seat_lock:1:8"]
        mock_redis.client.get.side_effect = ["10", "20"]
        mock_redis.client.ttl.side_effect = [250, 100]

        with patch("services.seat_lock_service.redis_client", mock_redis):
            result = service.get_locked_seats(trip_id=1)

        assert len(result) == 2
        assert result[0]["seat_id"] == 5
        assert result[0]["user_id"] == 10
        assert result[1]["seat_id"] == 8

    def test_returns_empty_without_redis(self):
        service = _make_service()
        mock_redis = _mock_redis_client(connected=False)

        with patch("services.seat_lock_service.redis_client", mock_redis):
            result = service.get_locked_seats(trip_id=1)

        assert result == []


@pytest.mark.unit
class TestIsLocked:
    def test_locked_seat_returns_true(self):
        service = _make_service()
        mock_redis = _mock_redis_client()
        mock_redis.client.exists.return_value = 1

        with patch("services.seat_lock_service.redis_client", mock_redis):
            assert service.is_locked(trip_id=1, seat_id=5) is True

    def test_unlocked_seat_returns_false(self):
        service = _make_service()
        mock_redis = _mock_redis_client()
        mock_redis.client.exists.return_value = 0

        with patch("services.seat_lock_service.redis_client", mock_redis):
            assert service.is_locked(trip_id=1, seat_id=5) is False

    def test_fallback_returns_false(self):
        service = _make_service()
        mock_redis = _mock_redis_client(connected=False)

        with patch("services.seat_lock_service.redis_client", mock_redis):
            assert service.is_locked(trip_id=1, seat_id=5) is False
