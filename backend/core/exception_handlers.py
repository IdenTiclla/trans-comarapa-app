"""
Global exception handlers that map domain AppException codes to HTTP responses.

Register these handlers in main.py via:
    from core.exception_handlers import register_exception_handlers
    register_exception_handlers(app)
"""

import logging

from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse

from core.exceptions import AppException

logger = logging.getLogger(__name__)

# Mapping from AppException.code → HTTP status code
_CODE_TO_STATUS: dict[str, int] = {
    "NOT_FOUND": 404,
    "CONFLICT": 409,
    "VALIDATION_ERROR": 422,
    "FORBIDDEN": 403,
    "UNAUTHORIZED": 401,
    "INVALID_STATE_TRANSITION": 400,
    "APP_ERROR": 500,
}


async def _app_exception_handler(request: Request, exc: AppException) -> JSONResponse:
    """Convert an AppException into a structured JSON response."""
    status_code = _CODE_TO_STATUS.get(exc.code, 500)

    if status_code >= 500:
        logger.error("Unhandled app error: %s (code=%s)", exc.message, exc.code)
    else:
        logger.warning("App exception: %s (code=%s, status=%d)", exc.message, exc.code, status_code)

    return JSONResponse(
        status_code=status_code,
        content={
            "detail": exc.message,
            "code": exc.code,
        },
    )


def register_exception_handlers(app: FastAPI) -> None:
    """Register all custom exception handlers on the FastAPI app."""
    app.add_exception_handler(AppException, _app_exception_handler)
