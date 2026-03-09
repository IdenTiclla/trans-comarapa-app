"""
Security utilities - password hashing/verification extracted from models/user.py.

Following SRP: models should only define data structure + relationships,
not contain cryptographic logic.
"""

from passlib.context import CryptContext

_pwd_context = CryptContext(
    schemes=["sha256_crypt"],
    deprecated="auto",
    sha256_crypt__min_rounds=29000,
    sha256_crypt__max_rounds=200000,
    sha256_crypt__default_rounds=80000,
)


def get_password_hash(password: str) -> str:
    """Hash a plain-text password using sha256_crypt."""
    if isinstance(password, str):
        password_bytes = password.encode("utf-8")
        if len(password_bytes) > 72:
            password = password_bytes[:72].decode("utf-8", errors="ignore")
    return _pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a plain-text password against a stored hash."""
    try:
        return _pwd_context.verify(plain_password, hashed_password)
    except Exception as exc:
        import logging
        logging.getLogger(__name__).error("Error verificando contraseña: %s", exc)
        return False
