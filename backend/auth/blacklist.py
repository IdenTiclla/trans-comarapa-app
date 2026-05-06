from datetime import datetime, timedelta
import logging
from typing import Optional
from core.redis import redis_client
from core.config import settings

logger = logging.getLogger(__name__)

class TokenBlacklist:
    """
    Clase para manejar la lista negra de tokens JWT usando Redis para persistencia.
    
    Utiliza Redis como backend de almacenamiento para mantener la blacklist
    de tokens incluso después de reinicios del servidor.
    """
    
    def __init__(self):
        self.redis_key_prefix = "blacklist:token:"
        self.fallback_blacklist = {}  # Fallback en memoria si Redis falla
        
    def add_token_to_blacklist(self, token: str, expires_delta: Optional[timedelta] = None):
        """
        Agrega un token a la lista negra.
        
        Args:
            token: Token JWT a agregar a la lista negra
            expires_delta: Tiempo de expiración opcional
        """
        try:
            if expires_delta:
                expire_seconds = int(expires_delta.total_seconds())
            else:
                expire_seconds = settings.JWT_BLACKLIST_EXPIRE_SECONDS
            
            redis_key = f"{self.redis_key_prefix}{token}"
            redis_client.client.setex(redis_key, expire_seconds, "blacklisted")
            logger.info(f"Token added to blacklist with {expire_seconds}s expiration")
            
        except Exception as e:
            logger.error(f"Failed to add token to Redis blacklist: {e}")
            # Fallback a memoria
            expire = datetime.now() + (expires_delta or timedelta(hours=24))
            self.fallback_blacklist[token] = expire
            
    def is_token_blacklisted(self, token: str) -> bool:
        """
        Verifica si un token está en la lista negra.
        
        Args:
            token: Token JWT a verificar
            
        Returns:
            True si el token está en la lista negra, False en caso contrario
        """
        try:
            redis_key = f"{self.redis_key_prefix}{token}"
            result = redis_client.client.get(redis_key)
            if result is not None:
                return True
                
        except Exception as e:
            logger.error(f"Failed to check token in Redis blacklist: {e}")
        
        # Fallback: verificar en memoria y limpiar expirados
        self._clean_expired_tokens()
        return token in self.fallback_blacklist
            
    def _clean_expired_tokens(self):
        """
        Limpia los tokens expirados de la lista negra en memoria (fallback).
        Redis maneja automáticamente la expiración de claves.
        """
        now = datetime.now()
        expired_tokens = [
            token for token, expire in self.fallback_blacklist.items() 
            if expire < now
        ]
        
        for token in expired_tokens:
            del self.fallback_blacklist[token]
    
    def clear_blacklist(self):
        """
        Limpia toda la blacklist. Usado principalmente para testing.
        """
        try:
            # Limpiar tokens en Redis
            pattern = f"{self.redis_key_prefix}*"
            keys = redis_client.client.keys(pattern)
            if keys:
                redis_client.client.delete(*keys)
            logger.info(f"Cleared {len(keys)} tokens from Redis blacklist")
        except Exception as e:
            logger.error(f"Failed to clear Redis blacklist: {e}")
        
        # Limpiar fallback en memoria
        self.fallback_blacklist.clear()
        logger.info("Cleared fallback blacklist")
    

# Instancia global de la lista negra de tokens
token_blacklist = TokenBlacklist()
