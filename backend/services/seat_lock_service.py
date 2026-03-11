"""
Seat lock service - Redis-based distributed seat locking to prevent double-selling.

Uses Redis SET NX EX for atomic lock acquisition with automatic TTL expiration.
Falls back gracefully to DB-level conflict detection if Redis is unavailable.
"""

import logging
from typing import Optional

from core.redis import redis_client

logger = logging.getLogger(__name__)

DEFAULT_LOCK_TTL = 300  # 5 minutes


class SeatLockService:
    """Manages temporary seat locks using Redis."""

    KEY_PREFIX = "seat_lock"

    def _key(self, trip_id: int, seat_id: int) -> str:
        return f"{self.KEY_PREFIX}:{trip_id}:{seat_id}"

    def _is_available(self) -> bool:
        try:
            return redis_client.is_connected()
        except Exception:
            logger.warning("Redis not available for seat locking")
            return False

    def lock_seat(
        self, trip_id: int, seat_id: int, user_id: int, ttl: int = DEFAULT_LOCK_TTL
    ) -> dict:
        """
        Attempt to lock a seat for a user.

        Returns dict with 'locked' bool and optional 'holder' if already locked by another user.
        """
        if not self._is_available():
            return {"locked": True, "fallback": True}

        key = self._key(trip_id, seat_id)
        value = str(user_id)

        try:
            client = redis_client.client
            # Check if already locked by same user (extend TTL)
            current = client.get(key)
            if current == value:
                client.expire(key, ttl)
                return {"locked": True, "extended": True, "ttl": ttl}

            # Atomic set-if-not-exists
            acquired = client.set(key, value, nx=True, ex=ttl)
            if acquired:
                return {"locked": True, "ttl": ttl}

            # Lock held by another user
            holder = client.get(key)
            return {"locked": False, "holder": int(holder) if holder else None}
        except Exception as e:
            logger.error("Redis lock_seat error: %s", e)
            return {"locked": True, "fallback": True}

    def unlock_seat(self, trip_id: int, seat_id: int, user_id: int) -> bool:
        """
        Release a seat lock, only if held by the given user.

        Returns True if unlocked, False otherwise.
        """
        if not self._is_available():
            return True

        key = self._key(trip_id, seat_id)
        try:
            client = redis_client.client
            current = client.get(key)
            if current is None:
                return True
            if current == str(user_id):
                client.delete(key)
                return True
            return False
        except Exception as e:
            logger.error("Redis unlock_seat error: %s", e)
            return True

    def unlock_seats_bulk(self, trip_id: int, seat_ids: list[int], user_id: int) -> int:
        """Release multiple seat locks for a user. Returns count of unlocked seats."""
        unlocked = 0
        for seat_id in seat_ids:
            if self.unlock_seat(trip_id, seat_id, user_id):
                unlocked += 1
        return unlocked

    def is_locked(self, trip_id: int, seat_id: int) -> bool:
        """Check if a seat is currently locked."""
        if not self._is_available():
            return False

        key = self._key(trip_id, seat_id)
        try:
            return redis_client.client.exists(key) > 0
        except Exception:
            return False

    def get_lock_holder(self, trip_id: int, seat_id: int) -> Optional[int]:
        """Get the user_id holding the lock, or None."""
        if not self._is_available():
            return None

        key = self._key(trip_id, seat_id)
        try:
            val = redis_client.client.get(key)
            return int(val) if val else None
        except Exception:
            return None

    def get_lock_ttl(self, trip_id: int, seat_id: int) -> int:
        """Get remaining TTL in seconds for a lock. Returns -1 if no lock."""
        if not self._is_available():
            return -1

        key = self._key(trip_id, seat_id)
        try:
            ttl = redis_client.client.ttl(key)
            return ttl if ttl > 0 else -1
        except Exception:
            return -1

    def get_locked_seats(self, trip_id: int) -> list[dict]:
        """
        Get all locked seats for a trip.

        Returns list of dicts: [{"seat_id": int, "user_id": int, "ttl": int}, ...]
        """
        if not self._is_available():
            return []

        pattern = f"{self.KEY_PREFIX}:{trip_id}:*"
        locked = []
        try:
            client = redis_client.client
            for key in client.scan_iter(match=pattern, count=100):
                parts = key.split(":")
                if len(parts) == 3:
                    seat_id = int(parts[2])
                    user_id_str = client.get(key)
                    ttl = client.ttl(key)
                    locked.append({
                        "seat_id": seat_id,
                        "user_id": int(user_id_str) if user_id_str else None,
                        "ttl": ttl if ttl > 0 else 0,
                    })
        except Exception as e:
            logger.error("Redis get_locked_seats error: %s", e)

        return locked
