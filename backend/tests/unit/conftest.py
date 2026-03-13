"""Fixtures for pure unit tests. No database, no external services."""

import pytest
from unittest.mock import MagicMock, create_autospec
from sqlalchemy.orm import Session


@pytest.fixture
def mock_db():
    """A MagicMock Session for unit tests."""
    return create_autospec(Session, instance=True)


@pytest.fixture
def mock_query(mock_db):
    """Pre-configured mock query chain."""
    query = MagicMock()
    mock_db.query.return_value = query
    query.filter.return_value = query
    query.first.return_value = None
    query.all.return_value = []
    return query
