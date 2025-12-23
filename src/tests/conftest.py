"""Pytest configuration and fixtures for authentication tests.

Provides mock objects, fixtures, and dependency overrides for testing
authentication endpoints and services.
"""

from unittest.mock import Mock

import pytest
from fastapi.testclient import TestClient

from src import app
from src.db.database import get_session

# Mock objects for testing
mock_session = Mock()
mock_auth_service = Mock()


def get_mock_session():
    """Provide a mock database session for testing.

    Yields:
        Mock: A mocked SQLModel Session object for test isolation.
    """
    yield mock_session


# Override the real get_session dependency with mock for all tests
app.dependency_overrides[get_session] = get_mock_session


@pytest.fixture
def fake_session():
    """Fixture providing a mock database session.

    Returns:
        Mock: A mocked SQLModel Session object for assertions and test setup.
    """
    return mock_session


@pytest.fixture
def fake_auth_service():
    """Fixture providing a mock authentication service.

    Returns:
        Mock: A mocked authService object for assertions and test setup.
    """
    return mock_auth_service


@pytest.fixture
def test_client():
    """Fixture providing a FastAPI test client.

    Returns:
        TestClient: A test client for making HTTP requests to the FastAPI app.
    """
    return TestClient(app)
