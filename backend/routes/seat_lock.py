"""
Seat lock routes - Redis-based seat locking endpoints with WebSocket broadcast.

Allows secretaries to temporarily lock seats during the selection process
to prevent double-selling across multiple offices. Lock/unlock events are
broadcast in real-time via WebSocket to all clients viewing the same trip.
"""

import logging

from fastapi import APIRouter, Depends, HTTPException, WebSocket, WebSocketDisconnect, status
from pydantic import BaseModel
from auth.jwt import get_current_user
from models.user import User
from services.seat_lock_service import SeatLockService
from core.ws_manager import seat_lock_ws

logger = logging.getLogger(__name__)

router = APIRouter(tags=["Seat Locks"])

seat_lock_service = SeatLockService()


class SeatLockRequest(BaseModel):
    trip_id: int
    seat_id: int


class SeatLockResponse(BaseModel):
    locked: bool
    ttl: int | None = None
    extended: bool = False
    fallback: bool = False
    holder: int | None = None
    message: str = ""


class LockedSeatInfo(BaseModel):
    seat_id: int
    user_id: int | None = None
    ttl: int = 0


class SeatUnlockRequest(BaseModel):
    trip_id: int
    seat_ids: list[int]


async def _broadcast_locks(trip_id: int):
    """Broadcast current lock state to all WebSocket clients for this trip."""
    locks = seat_lock_service.get_locked_seats(trip_id)
    await seat_lock_ws.broadcast(trip_id, {
        "type": "seat_locks_updated",
        "trip_id": trip_id,
        "locks": locks,
    })


@router.post("/lock", response_model=SeatLockResponse)
async def lock_seat(
    request: SeatLockRequest,
    current_user: User = Depends(get_current_user),
):
    """Lock a seat for the current user (5-minute TTL)."""
    result = seat_lock_service.lock_seat(
        trip_id=request.trip_id,
        seat_id=request.seat_id,
        user_id=current_user.id,
    )

    if not result.get("locked"):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="El asiento ya está bloqueado por otro usuario.",
        )

    # Broadcast updated locks to all viewers of this trip
    await _broadcast_locks(request.trip_id)

    return SeatLockResponse(
        locked=True,
        ttl=result.get("ttl"),
        extended=result.get("extended", False),
        fallback=result.get("fallback", False),
        message="Asiento bloqueado exitosamente.",
    )


@router.post("/unlock")
async def unlock_seats(
    request: SeatUnlockRequest,
    current_user: User = Depends(get_current_user),
):
    """Release seat locks held by the current user."""
    unlocked = seat_lock_service.unlock_seats_bulk(
        trip_id=request.trip_id,
        seat_ids=request.seat_ids,
        user_id=current_user.id,
    )

    # Broadcast updated locks to all viewers of this trip
    await _broadcast_locks(request.trip_id)

    return {"unlocked": unlocked, "total": len(request.seat_ids)}


@router.get("/locks/{trip_id}", response_model=list[LockedSeatInfo])
async def get_locked_seats(
    trip_id: int,
    current_user: User = Depends(get_current_user),
):
    """Get all currently locked seats for a trip."""
    return seat_lock_service.get_locked_seats(trip_id)


@router.websocket("/ws/{trip_id}")
async def seat_lock_websocket(ws: WebSocket, trip_id: int):
    """
    WebSocket endpoint for real-time seat lock updates.

    Clients connect to /seats/ws/{trip_id}?user_id=N and receive JSON messages
    whenever locks change for that trip. On disconnect, all locks held by that
    user for this trip are automatically released.
    """
    # Get user_id from query params (WS can't use cookie auth easily)
    user_id_str = ws.query_params.get("user_id")
    user_id = int(user_id_str) if user_id_str else 0

    conn = await seat_lock_ws.connect(trip_id, ws, user_id)
    try:
        # Send current state immediately on connect
        locks = seat_lock_service.get_locked_seats(trip_id)
        await ws.send_json({
            "type": "seat_locks_updated",
            "trip_id": trip_id,
            "locks": locks,
        })

        # Keep connection alive, listen for pings
        while True:
            data = await ws.receive_text()
            if data == "ping":
                await ws.send_text("pong")
    except WebSocketDisconnect:
        pass
    except Exception:
        pass
    finally:
        seat_lock_ws.disconnect(trip_id, conn)

        # Release locks only if user has NO other active connections for this trip
        # (avoids releasing locks during page refresh where new WS connects before old closes)
        if user_id and not seat_lock_ws.user_has_other_connections(trip_id, user_id):
            locked = seat_lock_service.get_locked_seats(trip_id)
            user_locks = [l["seat_id"] for l in locked if l.get("user_id") == user_id]
            if user_locks:
                seat_lock_service.unlock_seats_bulk(trip_id, user_locks, user_id)
                logger.info("Auto-released %d locks for user %d on trip %d (WS disconnect)", len(user_locks), user_id, trip_id)
                # Broadcast updated state to remaining connections
                await _broadcast_locks(trip_id)
