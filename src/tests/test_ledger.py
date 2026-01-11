import pytest
from fastapi import status
from unittest.mock import MagicMock, patch
from src.db.enums import RoleChoices, LedgerActionChoices
from src import app
from src.Auth.dependency import get_current_user, get_current_user_role

ledger_prefix = "/api/ledger"

@pytest.fixture
def mock_bank_user():
    return MagicMock(id=1, name="Global Bank", role=RoleChoices.BANK)

@pytest.fixture
def mock_admin_user():
    return MagicMock(id=99, name="Admin User", role=RoleChoices.ADMIN)

def test_create_ledger_entry_success(test_client, mock_bank_user):
    """Test that a bank user can successfully create a ledger entry."""
    app.dependency_overrides[get_current_user] = lambda: mock_bank_user
    app.dependency_overrides[get_current_user_role] = lambda: RoleChoices.BANK
    try:
        with patch("src.ledger.service.LedgerService.create_ledger_entry") as mock_create:
            mock_create.return_value = {
                "id": 1, 
                "action": "issued",
                "document_id": 10,
                "actor_id": 1,
                "metadatav": {"amount": 5000, "currency": "USD"},
                "created_at": "2023-01-01T12:00:00"
            }
            
            payload = {
                "document_id": 10,
                "action": LedgerActionChoices.ISSUED.value,
                "metadatav": {"amount": 5000, "currency": "USD"}
            }
            
            response = test_client.post(f"{ledger_prefix}/entry", json=payload)
            
            assert response.status_code == status.HTTP_201_CREATED
            mock_create.assert_called_once()
    finally:
        del app.dependency_overrides[get_current_user]
        del app.dependency_overrides[get_current_user_role]

def test_get_admin_records_unauthorized(test_client, mock_bank_user):
    """Test that a non-admin (Bank) cannot access the global admin ledger records."""
    app.dependency_overrides[get_current_user] = lambda: mock_bank_user
    app.dependency_overrides[get_current_user_role] = lambda: RoleChoices.BANK
    try:
        response = test_client.get(f"{ledger_prefix}/records/admin")
        
        # Should return 401 because role_required(["admin", "auditor"]) is enforced
        assert response.status_code == status.HTTP_401_UNAUTHORIZED
    finally:
        del app.dependency_overrides[get_current_user]
        del app.dependency_overrides[get_current_user_role]

def test_update_ledger_action_admin(test_client, mock_admin_user):
    """Test that an admin can update a ledger entry action."""
    app.dependency_overrides[get_current_user] = lambda: mock_admin_user
    app.dependency_overrides[get_current_user_role] = lambda: RoleChoices.ADMIN
    try:
        with patch("src.ledger.service.LedgerService.edit_action") as mock_edit:
            mock_edit.return_value = {"id": 1, "action": "verified"}
            
            # Form data for the PATCH request
            response = test_client.patch(
                f"{ledger_prefix}/records/1", 
                data={"action": LedgerActionChoices.VERIFIED.value}
            )
            
            assert response.status_code == status.HTTP_200_OK
            mock_edit.assert_called_once()
    finally:
        del app.dependency_overrides[get_current_user]
        del app.dependency_overrides[get_current_user_role]