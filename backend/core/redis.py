import redis
import os
from typing import Optional

class RedisClient:
    """
    Cliente Redis singleton para gestionar la conexión a Redis.
    """
    _instance = None
    _redis_client = None
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(RedisClient, cls).__new__(cls)
        return cls._instance
    
    def __init__(self):
        if self._redis_client is None:
            self._connect()
    
    def _connect(self):
        """Establece la conexión con Redis."""
        redis_url = os.getenv("REDIS_URL", "redis://localhost:6379")
        try:
            self._redis_client = redis.from_url(
                redis_url,
                decode_responses=True,
                health_check_interval=30
            )
            # Prueba la conexión
            self._redis_client.ping()
        except Exception as e:
            raise ConnectionError(f"Failed to connect to Redis at {redis_url}: {str(e)}")
    
    @property
    def client(self) -> redis.Redis:
        """Retorna el cliente Redis."""
        if self._redis_client is None:
            self._connect()
        return self._redis_client
    
    def is_connected(self) -> bool:
        """Verifica si la conexión a Redis está activa."""
        try:
            self._redis_client.ping()
            return True
        except:
            return False

# Instancia global del cliente Redis
redis_client = RedisClient()