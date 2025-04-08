from datetime import datetime, timedelta
import threading

class TokenBlacklist:
    """
    Clase para manejar la lista negra de tokens JWT.
    
    Esta implementación simple mantiene los tokens en memoria.
    Para una aplicación en producción, se recomienda usar Redis u otra
    solución de almacenamiento persistente.
    """
    
    def __init__(self):
        self.blacklist = {}
        self.lock = threading.Lock()
        
    def add_token_to_blacklist(self, token: str, expires_delta: timedelta = None):
        """
        Agrega un token a la lista negra.
        
        Args:
            token: Token JWT a agregar a la lista negra
            expires_delta: Tiempo de expiración opcional
        """
        with self.lock:
            if expires_delta:
                expire = datetime.utcnow() + expires_delta
            else:
                # Por defecto, los tokens expirarán en 24 horas
                expire = datetime.utcnow() + timedelta(hours=24)
            
            self.blacklist[token] = expire
            
    def is_token_blacklisted(self, token: str) -> bool:
        """
        Verifica si un token está en la lista negra.
        
        Args:
            token: Token JWT a verificar
            
        Returns:
            True si el token está en la lista negra, False en caso contrario
        """
        with self.lock:
            # Limpiar tokens expirados
            self._clean_expired_tokens()
            
            # Verificar si el token está en la lista negra
            return token in self.blacklist
            
    def _clean_expired_tokens(self):
        """
        Limpia los tokens expirados de la lista negra.
        """
        now = datetime.utcnow()
        expired_tokens = [token for token, expire in self.blacklist.items() if expire < now]
        
        for token in expired_tokens:
            del self.blacklist[token]

# Instancia global de la lista negra de tokens
token_blacklist = TokenBlacklist()
