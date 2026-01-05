import pytest
from fastapi import status
from unittest.mock import MagicMock, patch
from src.db.enums import RoleChoices, DocumentTypeChoices

trade_chain_prefix = "/api/trade_chain"

@pytest.fixture
def mock_user_bank():
    """Fixture for a Bank user."""
    return MagicMock(id=1, name="Bank User", role=RoleChoices.BANK)

@pytest.fixture
def mock_user_admin():
    """Fixture for an Admin user."""
    return MagicMock(id=2, name="Admin User", role=RoleChoices.ADMIN)

def test_upload_document_success(test_client, mock_user_bank):
    """
    Test successful document upload by a Bank user.
    Verifies that the endpoint accepts files and returns 200.
    """
    # Mocking get_current_user and the service layer
    with patch("src.Auth.dependency.get_current_user", return_value=mock_user_bank):
        with patch("src.trade_chain.service.TradeChainService.save_multiple_document") as mock_save:
            mock_save.return_value = []
            
            files = [("files", ("test.pdf", b"content", "application/pdf"))]
            data = {
                "doc_type": DocumentTypeChoices.INVOICE.value,
                "issued_at": "2024-01-01T00:00:00"
            }
            
            response = test_client.post(
                f"{trade_chain_prefix}/upload",
                files=files,
                data=data
            )
            
            assert response.status_code == status.HTTP_200_OK
            mock_save.assert_called_once()

def test_upload_document_unauthorized_role(test_client, mock_user_admin):
    """
    Test that an Admin cannot upload a document (only Bank/Corporate can).
    Verifies role-based access control (RBAC).
    """
    with patch("src.Auth.dependency.get_current_user", return_value=mock_user_admin):
        files = [("files", ("test.pdf", b"content", "application/pdf"))]
        data = {"doc_type": "invoice", "issued_at": "2024-01-01T00:00:00"}
        
        response = test_client.post(
            f"{trade_chain_prefix}/upload",
            files=files,
            data=data
        )
        
        # Should fail because role_required(["bank", "corporate"]) is applied
        assert response.status_code == status.HTTP_401_UNAUTHORIZED

def test_get_all_documents_admin_only(test_client, mock_user_admin):
    """
    Test that an Admin can access the global documents list.
    """
    with patch("src.Auth.dependency.get_current_user", return_value=mock_user_admin):
        with patch("src.trade_chain.service.TradeChainService.get_all_documents_by_all_user") as mock_get:
            mock_get.return_value = []
            response = test_client.get(f"{trade_chain_prefix}/documents")
            
            assert response.status_code == status.HTTP_200_OK
            mock_get.assert_called_once()