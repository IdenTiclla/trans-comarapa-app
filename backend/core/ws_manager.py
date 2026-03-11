"""
WebSocket connection manager for real-time seat lock notifications.

Manages per-trip connection groups so lock/unlock events are broadcast
only to users viewing the same trip. When a connection disconnects,
automatically releases all seat locks held by that user for the trip.
"""

import logging
from fastapi import WebSocket

logger = logging.getLogger(__name__)


class WSConnection:
    __slots__ = ('ws', 'user_id')

    def __init__(self, ws: WebSocket, user_id: int):
        self.ws = ws
        self.user_id = user_id


class SeatLockWSManager:
    """Manages WebSocket connections grouped by trip_id."""

    def __init__(self):
        self._connections: dict[int, list[WSConnection]] = {}

    async def connect(self, trip_id: int, ws: WebSocket, user_id: int) -> WSConnection:
        await ws.accept()
        conn = WSConnection(ws=ws, user_id=user_id)
        if trip_id not in self._connections:
            self._connections[trip_id] = []
        self._connections[trip_id].append(conn)
        logger.debug("WS connected for trip %d, user %d (total: %d)", trip_id, user_id, len(self._connections[trip_id]))
        return conn

    def disconnect(self, trip_id: int, conn: WSConnection):
        conns = self._connections.get(trip_id)
        if conns:
            try:
                conns.remove(conn)
            except ValueError:
                pass
            if not conns:
                del self._connections[trip_id]
        logger.debug("WS disconnected for trip %d, user %d", trip_id, conn.user_id)

    def user_has_other_connections(self, trip_id: int, user_id: int) -> bool:
        """Check if a user still has active connections for a trip (after disconnect)."""
        conns = self._connections.get(trip_id)
        if not conns:
            return False
        return any(c.user_id == user_id for c in conns)

    async def broadcast(self, trip_id: int, data: dict):
        """Send data to all connections watching a trip."""
        conns = self._connections.get(trip_id)
        if not conns:
            return

        dead = []
        for conn in conns:
            try:
                await conn.ws.send_json(data)
            except Exception:
                dead.append(conn)

        for conn in dead:
            try:
                conns.remove(conn)
            except ValueError:
                pass
        if not conns:
            self._connections.pop(trip_id, None)


# Global singleton
seat_lock_ws = SeatLockWSManager()
