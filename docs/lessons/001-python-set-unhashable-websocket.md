# Lesson 001: No usar `set` con objetos que contienen WebSocket

**Fecha:** 2026-03-10
**Contexto:** Implementación de WebSocket para bloqueo de asientos en tiempo real

## Error

Se usó un `dataclass` (`WSConnection`) que contenía un `WebSocket` de FastAPI dentro de un `set()` de Python.

```python
# MAL - WebSocket no es hashable
@dataclass
class WSConnection:
    ws: WebSocket
    user_id: int

self._connections: dict[int, set[WSConnection]] = {}
```

**Resultado:** `TypeError: unhashable type: 'WSConnection'` en cada conexión WS. El WebSocket nunca se conectaba y el broadcast no funcionaba.

## Solución

Usar `list` en vez de `set` para almacenar conexiones:

```python
# BIEN
class WSConnection:
    __slots__ = ('ws', 'user_id')
    def __init__(self, ws: WebSocket, user_id: int):
        self.ws = ws
        self.user_id = user_id

self._connections: dict[int, list[WSConnection]] = {}
```

## Regla

Nunca usar `set` para almacenar objetos que contengan referencias a conexiones de red (`WebSocket`, `Socket`, etc.) — no son hashables. Usar `list` y manejar duplicados manualmente.
