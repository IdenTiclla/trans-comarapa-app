"""
Centralized logging configuration for the backend application.

Call `setup_logging()` from main.py at startup to configure all loggers.
"""

import logging
import os
import sys


def setup_logging() -> None:
    """Configure the root logger with a consistent format and level."""
    log_level_name = os.getenv("LOG_LEVEL", "INFO").upper()
    log_level = getattr(logging, log_level_name, logging.INFO)

    formatter = logging.Formatter(
        fmt="%(asctime)s | %(levelname)-8s | %(name)s | %(message)s",
        datefmt="%Y-%m-%d %H:%M:%S",
    )

    # Console handler (stdout)
    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setFormatter(formatter)

    # Configure root logger
    root_logger = logging.getLogger()
    root_logger.setLevel(log_level)

    # Remove existing handlers to avoid duplicates on reload
    root_logger.handlers.clear()
    root_logger.addHandler(console_handler)

    # Reduce noise from third-party libraries
    logging.getLogger("uvicorn.access").setLevel(logging.WARNING)
    logging.getLogger("sqlalchemy.engine").setLevel(
        logging.INFO if log_level <= logging.DEBUG else logging.WARNING
    )

    logging.getLogger(__name__).info(
        "Logging configured: level=%s", log_level_name
    )
