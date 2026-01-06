from unittest.mock import MagicMock, patch

import pytest
from fastapi import status

from src import app
from src.Auth.dependency import get_current_user
from src.db.enums import RoleChoices

trade_chain_prefix = "/api/trade_chain"


@pytest.fixture
def mock_user_bank():
    user = MagicMock()
    user.id = 1
    user.name = "Bank User"
    user.role = RoleChoices.BANK
    return user


@pytest.fixture
def mock_user_corporate():
    user = MagicMock()
    user.id = 3
    user.name = "Corporate User"
    user.role = RoleChoices.CORPORATE
    return user


@pytest.fixture
def mock_user_admin():
    user = MagicMock()
    user.id = 2
    user.name = "Admin User"
    user.role = RoleChoices.ADMIN
    return user


@pytest.fixture(autouse=True)
def clean_overrides():
    """Clean up dependency overrides after each test."""
    yield
    app.dependency_overrides = {}


# --- UPLOAD TESTS ---


def test_upload_document_success(test_client, mock_user_bank):
    app.dependency_overrides[get_current_user] = lambda: mock_user_bank

    with patch(
        "src.trade_chain.service.TradeChainService.save_multiple_document"
    ) as mock_save:
        mock_save.return_value = []

        files = [("files", ("test.pdf", b"content", "application/pdf"))]
        data = {"doc_type": "invoice", "issued_at": "2024-01-01T12:00:00"}

        response = test_client.post(
            f"{trade_chain_prefix}/upload", files=files, data=data
        )

        assert response.status_code == status.HTTP_200_OK
        mock_save.assert_called_once()


def test_upload_document_unauthorized_role(test_client, mock_user_admin):
    app.dependency_overrides[get_current_user] = lambda: mock_user_admin

    files = [("files", ("test.pdf", b"content", "application/pdf"))]
    data = {"doc_type": "invoice", "issued_at": "2024-01-01T12:00:00"}

    response = test_client.post(f"{trade_chain_prefix}/upload", files=files, data=data)

    # Admin is not in ["bank", "corporate"] for upload
    assert response.status_code == status.HTTP_401_UNAUTHORIZED


# --- GET MY DOCUMENTS TESTS ---


def test_get_my_documents_success(test_client, mock_user_bank):
    app.dependency_overrides[get_current_user] = lambda: mock_user_bank

    with patch(
        "src.trade_chain.service.TradeChainService.get_document_by_user"
    ) as mock_get:
        mock_get.return_value = []

        response = test_client.get(f"{trade_chain_prefix}/document")

        assert response.status_code == status.HTTP_200_OK
        mock_get.assert_called_once()


def test_get_my_documents_unauthorized_role(test_client, mock_user_admin):
    app.dependency_overrides[get_current_user] = lambda: mock_user_admin

    response = test_client.get(f"{trade_chain_prefix}/document")

    # Admin is not in ["bank", "corporate"] for this endpoint
    assert response.status_code == status.HTTP_401_UNAUTHORIZED


# --- GET ALL DOCUMENTS TESTS ---


def test_get_all_documents_success(test_client, mock_user_admin):
    app.dependency_overrides[get_current_user] = lambda: mock_user_admin

    with patch(
        "src.trade_chain.service.TradeChainService.get_all_documents_by_all_user"
    ) as mock_get:
        mock_get.return_value = []

        response = test_client.get(f"{trade_chain_prefix}/documents")

        assert response.status_code == status.HTTP_200_OK
        mock_get.assert_called_once()


def test_get_all_documents_unauthorized_role(test_client, mock_user_bank):
    app.dependency_overrides[get_current_user] = lambda: mock_user_bank

    response = test_client.get(f"{trade_chain_prefix}/documents")

    # Bank is not in ["admin", "auditor"]
    assert response.status_code == status.HTTP_401_UNAUTHORIZED


# --- UPDATE DOCUMENT TESTS ---


def test_update_document_success(test_client, mock_user_admin):
    app.dependency_overrides[get_current_user] = lambda: mock_user_admin

    with patch("src.trade_chain.service.TradeChainService.edit_document") as mock_edit:
        mock_doc = MagicMock()
        mock_doc.id = 1
        mock_doc.doc_type = "invoice"
        mock_doc.doc_number = "DOC-001"
        mock_doc.file_url = "http://localhost/doc.pdf"
        mock_doc.hash = "dummyhash"
        # Add timestamp fields if necessary, as strings or datetime depending on model
        mock_doc.issued_at = "2024-01-01T00:00:00"
        mock_doc.created_at = "2024-01-01T00:00:00"

        mock_edit.return_value = mock_doc

        files = {"file": ("updated.pdf", b"new_content", "application/pdf")}
        data = {"doc_type": "invoice"}

        response = test_client.put(
            f"{trade_chain_prefix}/document/1", files=files, data=data
        )

        assert response.status_code == status.HTTP_200_OK
        mock_edit.assert_called_once()


def test_update_document_unauthorized_role(test_client, mock_user_bank):
    app.dependency_overrides[get_current_user] = lambda: mock_user_bank

    files = {"file": ("updated.pdf", b"new_content", "application/pdf")}
    data = {"doc_type": "invoice"}

    response = test_client.put(
        f"{trade_chain_prefix}/document/1", files=files, data=data
    )

    assert response.status_code == status.HTTP_401_UNAUTHORIZED


# --- DELETE DOCUMENT TESTS ---


def test_delete_document_success(test_client, mock_user_admin):
    app.dependency_overrides[get_current_user] = lambda: mock_user_admin

    with patch(
        "src.trade_chain.service.TradeChainService.delete_document"
    ) as mock_delete:
        mock_delete.return_value = None

        response = test_client.delete(f"{trade_chain_prefix}/document/1")

        assert response.status_code == status.HTTP_204_NO_CONTENT
        mock_delete.assert_called_once()


def test_delete_document_unauthorized_role(test_client, mock_user_bank):
    app.dependency_overrides[get_current_user] = lambda: mock_user_bank

    response = test_client.delete(f"{trade_chain_prefix}/document/1")

    assert response.status_code == status.HTTP_401_UNAUTHORIZED
