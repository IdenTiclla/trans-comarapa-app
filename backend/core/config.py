import os
from dotenv import load_dotenv

load_dotenv()


class Settings:
    APP_NAME: str = os.getenv("APP_NAME", "Trans Comarapa API")
    APP_VERSION: str = os.getenv("APP_VERSION", "1.0.0")
    DEBUG: bool = os.getenv("DEBUG", "True").lower() == "true"
    TIMEZONE: str = os.getenv("TIMEZONE", "America/La_Paz")

    JWT_SECRET_KEY: str = os.getenv("SECRET_KEY", "")
    JWT_ALGORITHM: str = os.getenv("JWT_ALGORITHM", "HS256")
    JWT_ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("JWT_ACCESS_TOKEN_EXPIRE_MINUTES", "30"))
    JWT_REFRESH_TOKEN_EXPIRE_DAYS: int = int(os.getenv("JWT_REFRESH_TOKEN_EXPIRE_DAYS", "7"))
    JWT_BLACKLIST_EXPIRE_SECONDS: int = int(os.getenv("JWT_BLACKLIST_EXPIRE_SECONDS", str(24 * 60 * 60)))

    DB_POOL_SIZE: int = int(os.getenv("DB_POOL_SIZE", "10"))
    DB_MAX_OVERFLOW: int = int(os.getenv("DB_MAX_OVERFLOW", "20"))
    DB_POOL_RECYCLE: int = int(os.getenv("DB_POOL_RECYCLE", "1800"))

    SEAT_LOCK_TTL_SECONDS: int = int(os.getenv("SEAT_LOCK_TTL_SECONDS", "300"))
    TRIP_MIN_DEPARTURE_BUFFER_MINUTES: int = int(os.getenv("TRIP_MIN_DEPARTURE_BUFFER_MINUTES", "30"))
    TRIP_CONFLICT_BUFFER_HOURS: int = int(os.getenv("TRIP_CONFLICT_BUFFER_HOURS", "2"))
    CASH_REGISTER_HISTORY_DAYS: int = int(os.getenv("CASH_REGISTER_HISTORY_DAYS", "7"))
    RATE_LIMIT_AUTH_LOGIN: str = os.getenv("RATE_LIMIT_AUTH_LOGIN", "10/minute")
    RATE_LIMIT_AUTH_REGISTER: str = os.getenv("RATE_LIMIT_AUTH_REGISTER", "3/minute")
    RATE_LIMIT_AUTH_REFRESH: str = os.getenv("RATE_LIMIT_AUTH_REFRESH", "10/minute")
    RATE_LIMIT_DEFAULT: str = os.getenv("RATE_LIMIT_DEFAULT", "100/minute")

    EMAIL_DOMAIN: str = os.getenv("EMAIL_DOMAIN", "transcomarapa.com")

    DEFAULT_OWNER_PASSWORD: str = os.getenv("DEFAULT_OWNER_PASSWORD", "socio123")
    DEFAULT_CLIENT_PASSWORD: str = os.getenv("DEFAULT_CLIENT_PASSWORD", "123456")

    CORS_ORIGINS: str = os.getenv(
        "CORS_ORIGINS",
        "http://localhost:3000,http://127.0.0.1:3000,http://localhost:3001,"
        "http://127.0.0.1:3001,http://localhost:5173,http://127.0.0.1:5173,"
        "http://frontend:3000,http://0.0.0.0:3000",
    )

    TESTING: bool = os.getenv("TESTING", "false").lower() == "true"

    @property
    def cors_origin_list(self) -> list[str]:
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",") if origin.strip()]

    @property
    def refresh_token_expire_seconds(self) -> int:
        return self.JWT_REFRESH_TOKEN_EXPIRE_DAYS * 24 * 60 * 60


settings = Settings()
