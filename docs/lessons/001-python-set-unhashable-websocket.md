# Lesson 001: Do not use `set` with objects containing WebSocket

**Date:** 2026-03-10
**Context:** WebSocket implementation for real-time seat locking

## Error

A `dataclass` (`WSConnection`) containing a FastAPI `WebSocket` was used within a Python `set()`.

```python
# WRONG - WebSocket is not hashable
@dataclass
class WSConnection:
    ws: WebSocket
    user_id: int

self._connections: dict[int, set[WSConnection]] = {}
```

**Result:** `TypeError: unhashable type: 'WSConnection'` on every WS connection. The WebSocket never connected and broadcast did not work.

## Solution

Use `list` instead of `set` to store connections:

```python
# CORRECT
class WSConnection:
    __slots__ = ('ws', 'user_id')
    def __init__(self, ws: WebSocket, user_id: int):
        self.ws = ws
        self.user_id = user_id

self._connections: dict[int, list[WSConnection]] = {}
```

## Rule

Never use `set` to store objects containing references to network connections (`WebSocket`, `Socket`, etc.) — they are not hashable. Use `list` and handle duplicates manually.
