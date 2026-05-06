"""
Domain exceptions for Trans Comarapa application.

These exceptions represent business-level errors and are mapped to HTTP
status codes by the global exception handler in exception_handlers.py.
"""


class AppException(Exception):
    """Base application exception with a machine-readable code and human message."""

    def __init__(self, message: str, code: str = "APP_ERROR"):
        self.message = message
        self.code = code
        super().__init__(self.message)


class NotFoundException(AppException):
    """Raised when a requested resource does not exist."""

    def __init__(self, message: str = "Recurso no encontrado"):
        super().__init__(message=message, code="NOT_FOUND")


class ConflictException(AppException):
    """Raised when the operation conflicts with the current state (e.g. duplicate)."""

    def __init__(self, message: str = "Conflicto de recurso"):
        super().__init__(message=message, code="CONFLICT")


class ValidationException(AppException):
    """Raised when input validation fails at the domain level."""

    def __init__(self, message: str = "Error de validación"):
        super().__init__(message=message, code="VALIDATION_ERROR")


class ForbiddenException(AppException):
    """Raised when the user lacks permission for the requested operation."""

    def __init__(self, message: str = "Operación no permitida"):
        super().__init__(message=message, code="FORBIDDEN")


class UnauthorizedException(AppException):
    """Raised when authentication is required but missing or invalid."""

    def __init__(self, message: str = "Autenticación requerida"):
        super().__init__(message=message, code="UNAUTHORIZED")


class InvalidStateTransitionException(AppException):
    """Raised when an entity state transition is not allowed.

    Used for tickets, packages, and trips state machines.
    """

    def __init__(
        self,
        entity: str,
        current_state: str,
        target_state: str,
        allowed_states: list[str] | None = None,
    ):
        allowed = ", ".join(allowed_states) if allowed_states else "none"
        message = (
            f"Transición de estado inválida para {entity}: "
            f"'{current_state}' → '{target_state}'. "
            f"Transiciones permitidas: [{allowed}]"
        )
        super().__init__(message=message, code="INVALID_STATE_TRANSITION")
