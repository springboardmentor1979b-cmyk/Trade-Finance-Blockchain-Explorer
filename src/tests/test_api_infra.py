import pytest
from fastapi import status
from src.errors import UserNotFound
from unittest.mock import patch

from src import app
from src.Auth.dependency import get_current_user, get_current_user_role

def test_custom_error_handler_mapping(test_client):
    """Test that the application correctly maps custom exceptions to JSON responses."""
    # We trigger a route that we know uses the UserNotFound exception
    # and mock the service to raise it.
    
    def mock_raise_user_not_found():
        raise UserNotFound()

    app.dependency_overrides[get_current_user] = mock_raise_user_not_found
    app.dependency_overrides[get_current_user_role] = mock_raise_user_not_found
    
    try:
        response = test_client.get("/api/trade_chain/documents")
        
        assert response.status_code == status.HTTP_404_NOT_FOUND
        assert response.json()["error_code"] == "user_not_found"
        assert "message" in response.json()
    finally:
        del app.dependency_overrides[get_current_user]
        del app.dependency_overrides[get_current_user_role]

def test_cors_headers(test_client):
    """Verify that CORS middleware is correctly injecting headers."""
    response = test_client.options(
        "/api/auth/login",
        headers={
            "Origin": "http://localhost:5173",
            "Access-Control-Request-Method": "POST",
        }
    )
    assert response.status_code == status.HTTP_200_OK
    assert response.headers["access-control-allow-origin"] == "http://localhost:5173"

def test_trusted_host_middleware(test_client):
    """Verify that unauthorized hosts are blocked by TrustedHostMiddleware."""
    # Test with an invalid host header
    response = test_client.get("/", headers={"Host": "evil-domain.com"})
    assert response.status_code == status.HTTP_400_BAD_REQUEST