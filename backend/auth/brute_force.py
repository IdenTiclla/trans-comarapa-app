from typing import Optional
from datetime import datetime, timedelta
from core.redis import redis_client
import logging

logger = logging.getLogger(__name__)

class BruteForceProtection:
    """
    Servicio para proteger contra ataques de fuerza bruta en el login.
    Utiliza Redis para rastrear intentos fallidos por IP y usuario.
    """
    
    def __init__(self):
        self.redis = redis_client.client
        
        # Configuración de límites
        self.max_attempts_per_ip = 10  # Máximo 10 intentos por IP por hora
        self.max_attempts_per_user = 5  # Máximo 5 intentos por usuario por hora
        self.lockout_duration_minutes = 15  # Bloqueo de 15 minutos
        self.window_duration_minutes = 60  # Ventana de tiempo de 1 hora
    
    def _get_ip_key(self, ip: str) -> str:
        """Genera la clave Redis para intentos por IP."""
        return f"login_attempts:ip:{ip}"
    
    def _get_user_key(self, username: str) -> str:
        """Genera la clave Redis para intentos por usuario."""
        return f"login_attempts:user:{username}"
    
    def _get_lockout_key(self, identifier: str, type_: str) -> str:
        """Genera la clave Redis para bloqueos."""
        return f"login_lockout:{type_}:{identifier}"
    
    def is_locked_out(self, ip: str, username: str) -> tuple[bool, Optional[str]]:
        """
        Verifica si la IP o usuario están bloqueados.
        
        Args:
            ip: Dirección IP del cliente
            username: Nombre de usuario/email
            
        Returns:
            Tuple con (is_locked, reason)
        """
        # Verificar bloqueo por IP
        ip_lockout_key = self._get_lockout_key(ip, "ip")
        if self.redis.exists(ip_lockout_key):
            ttl = self.redis.ttl(ip_lockout_key)
            if ttl > 0:
                return True, f"IP bloqueada. Tiempo restante: {ttl // 60} minutos"
        
        # Verificar bloqueo por usuario
        user_lockout_key = self._get_lockout_key(username, "user")
        if self.redis.exists(user_lockout_key):
            ttl = self.redis.ttl(user_lockout_key)
            if ttl > 0:
                return True, f"Usuario bloqueado. Tiempo restante: {ttl // 60} minutos"
        
        return False, None
    
    def record_failed_attempt(self, ip: str, username: str) -> dict:
        """
        Registra un intento fallido de login y verifica si se debe bloquear.
        
        Args:
            ip: Dirección IP del cliente
            username: Nombre de usuario/email
            
        Returns:
            Dict con información del estado actual
        """
        current_time = datetime.now()
        window_seconds = self.window_duration_minutes * 60
        lockout_seconds = self.lockout_duration_minutes * 60
        
        # Registrar intento por IP
        ip_key = self._get_ip_key(ip)
        ip_attempts = self._increment_attempts(ip_key, window_seconds)
        
        # Registrar intento por usuario
        user_key = self._get_user_key(username)
        user_attempts = self._increment_attempts(user_key, window_seconds)
        
        result = {
            "ip_attempts": ip_attempts,
            "user_attempts": user_attempts,
            "ip_locked": False,
            "user_locked": False,
            "lockout_duration_minutes": self.lockout_duration_minutes
        }
        
        # Verificar si se debe bloquear por IP
        if ip_attempts >= self.max_attempts_per_ip:
            ip_lockout_key = self._get_lockout_key(ip, "ip")
            self.redis.setex(ip_lockout_key, lockout_seconds, "locked")
            result["ip_locked"] = True
            logger.warning(f"IP {ip} bloqueada por {self.lockout_duration_minutes} minutos después de {ip_attempts} intentos fallidos")
        
        # Verificar si se debe bloquear por usuario
        if user_attempts >= self.max_attempts_per_user:
            user_lockout_key = self._get_lockout_key(username, "user")
            self.redis.setex(user_lockout_key, lockout_seconds, "locked")
            result["user_locked"] = True
            logger.warning(f"Usuario {username} bloqueado por {self.lockout_duration_minutes} minutos después de {user_attempts} intentos fallidos")
        
        return result
    
    def _increment_attempts(self, key: str, window_seconds: int) -> int:
        """
        Incrementa el contador de intentos y retorna el total actual.
        
        Args:
            key: Clave Redis
            window_seconds: Duración de la ventana en segundos
            
        Returns:
            Número total de intentos en la ventana actual
        """
        pipe = self.redis.pipeline()
        pipe.incr(key)
        pipe.expire(key, window_seconds)
        results = pipe.execute()
        return results[0]
    
    def clear_failed_attempts(self, ip: str, username: str):
        """
        Limpia los intentos fallidos después de un login exitoso.
        
        Args:
            ip: Dirección IP del cliente
            username: Nombre de usuario/email
        """
        ip_key = self._get_ip_key(ip)
        user_key = self._get_user_key(username)
        
        self.redis.delete(ip_key, user_key)
        logger.info(f"Intentos fallidos limpiados para IP {ip} y usuario {username}")
    
    def get_remaining_attempts(self, ip: str, username: str) -> dict:
        """
        Obtiene el número de intentos restantes antes del bloqueo.
        
        Args:
            ip: Dirección IP del cliente
            username: Nombre de usuario/email
            
        Returns:
            Dict con información de intentos restantes
        """
        ip_key = self._get_ip_key(ip)
        user_key = self._get_user_key(username)
        
        ip_attempts = int(self.redis.get(ip_key) or 0)
        user_attempts = int(self.redis.get(user_key) or 0)
        
        return {
            "ip_attempts_remaining": max(0, self.max_attempts_per_ip - ip_attempts),
            "user_attempts_remaining": max(0, self.max_attempts_per_user - user_attempts),
            "ip_attempts_used": ip_attempts,
            "user_attempts_used": user_attempts
        }

# Instancia global del servicio de protección contra fuerza bruta
brute_force_protection = BruteForceProtection()