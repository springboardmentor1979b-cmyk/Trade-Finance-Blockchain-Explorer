"""Ledger API Router.

This module defines the FastAPI router for ledger entry endpoints.
It provides endpoints for creating, retrieving, updating, and deleting
immutable ledger entries that track document actions.

Endpoints:
    POST /entry: Create a new ledger entry (Bank, Corporate)
    GET /records/admin: Get all ledger records with filtering (Admin, Auditor)
    GET /records/user: Get current user's ledger records (Bank, Corporate)
    DELETE /records/{record_id}: Delete a ledger record (Admin, Auditor)
    PATCH /records/{record_id}: Update ledger action (Admin, Auditor)
"""

from datetime import date

from fastapi import APIRouter, Depends, Form, Query, status
from sqlmodel import Session

from src.audit_logs.service import log_action
from src.Auth.dependency import get_current_user, role_required
from src.db.database import get_session
from src.db.enums import LedgerActionChoices
from src.db.models import Users
from src.errors import DocumentNotFound

from .schemas import LedgerCreate, LedgerResponse, PaginatedLedgerResponse
from .service import LedgerService

ledger_router = APIRouter()


@ledger_router.post(
    "/entry", response_model=LedgerResponse, status_code=status.HTTP_201_CREATED
)
def create_ledger_entry(
    ledger_data: LedgerCreate,
    db: Session = Depends(get_session),
    user: Users = Depends(get_current_user),
    role_check: None = Depends(role_required(["bank", "corporate"])),
) -> LedgerResponse:
    """Create a new immutable ledger entry for a document.

    This endpoint allows bank users to record actions performed on documents,
    creating a tamper-proof audit trail for compliance and traceability.

    Args:
        ledger_data: Request body containing document_id, action, and metadata.
        db: Database session injected by FastAPI dependency.
        user: Currently authenticated user (must be a bank user).
        role_check: Role validation ensuring only banks can access this endpoint.

    Returns:
        LedgerEntries: The created ledger entry with all details including timestamp.

    Raises:
        403 Forbidden: If user is not a bank.
        404 Not Found: If specified document does not exist.
    """
    return LedgerService.create_ledger_entry(
        ledger_data=ledger_data,
        actor_id=user.id,  # type: ignore
        db=db,
    )


@ledger_router.get("/records/admin", response_model=PaginatedLedgerResponse)
def get_all_ledger_records_every_user(
    # Pagination
    page: int = Query(1, ge=1),
    page_size: int = Query(25, ge=1, le=100),
    # Filters
    document_number: str | None = Query(None),
    action: str | None = Query(None),
    user_name: str | None = Query(None),
    start_date: date | None = Query(None),
    end_date: date | None = Query(None),
    db: Session = Depends(get_session),
    role_check: None = Depends(role_required(["admin", "auditor"])),
):
    """Retrieve all ledger records with filtering and pagination.

    Returns a paginated list of all ledger records in the system,
    with optional filters for document number, action, user name,
    and date range.

    Args:
        page: Page number for pagination (default: 1).
        page_size: Number of records per page (default: 25, max: 100).
        document_number: Optional filter by document number (partial match).
        action: Optional filter by action type.
        user_name: Optional filter by user name (partial match).
        start_date: Optional filter for records on or after this date.
        end_date: Optional filter for records on or before this date.
        db: Database session (injected).
        role_check: Role validation ensuring admin/auditor access (injected).

    Returns:
        PaginatedLedgerResponse: Paginated list of ledger records.

    Raises:
        HTTPException (401): If user is not authenticated.
        HTTPException (403): If user is not an admin or auditor.
    """
    return LedgerService.get_all_ledger_records(
        db, page, page_size, document_number, action, user_name, start_date, end_date
    )


@ledger_router.get("/records/user", response_model=PaginatedLedgerResponse)
def get_user_ledger_records(
    page: int = Query(1, ge=1),
    page_size: int = Query(25, ge=1, le=100),
    db: Session = Depends(get_session),
    user: Users = Depends(get_current_user),
    role_check: None = Depends(role_required(["bank", "corporate"])),
):
    """Retrieve ledger records for the current user.

    Returns a paginated list of ledger records where the current user
    is the actor. Useful for bank and corporate users to track their
    own document actions.

    Args:
        page: Page number for pagination (default: 1).
        page_size: Number of records per page (default: 25, max: 100).
        db: Database session (injected).
        user: Current authenticated user (injected).
        role_check: Role validation ensuring bank/corporate access (injected).

    Returns:
        PaginatedLedgerResponse: Paginated list of user's ledger records.

    Raises:
        HTTPException (401): If user is not authenticated.
        HTTPException (403): If user is not a bank or corporate user.
    """
    return LedgerService.get_user_ledger_records(db, page, page_size, user.id)  # type: ignore


@ledger_router.delete("/records/{record_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_record(
    record_id: int,
    db: Session = Depends(get_session),
    user: Users = Depends(get_current_user),
    role_check: None = Depends(role_required(["admin", "auditor"])),
):
    """Delete a ledger record by its ID.

    Removes a ledger record from the database. This operation is
    logged in the audit trail for compliance purposes.

    Args:
        record_id: ID of the ledger record to delete.
        db: Database session (injected).
        user: Current authenticated user (injected).
        role_check: Role validation ensuring admin/auditor access (injected).

    Raises:
        HTTPException (401): If user is not authenticated.
        HTTPException (403): If user is not an admin or auditor.
        HTTPException (404): If ledger record not found.
    """
    res = LedgerService.delete_ledger_entry(record_id, db)
    if not res:
        raise DocumentNotFound
    # Log the action
    log_action(db, user.id, "DELETE", "ledger", str(record_id))  # type: ignore
    db.commit()


@ledger_router.patch("/records/{record_id}", status_code=status.HTTP_200_OK)
def update_record(
    record_id: int,
    action: LedgerActionChoices = Form(...),
    db: Session = Depends(get_session),
    user: Users = Depends(get_current_user),
    role_check: None = Depends(role_required(["admin", "auditor"])),
):
    """Update the action field of a ledger record.

    Updates only the action field of an existing ledger record.
    This operation is restricted to Admin and Auditor users and
    is logged in the audit trail for compliance purposes.

    Args:
        record_id: ID of the ledger record to update.
        action: New action value (issued, amended, shipped, received,
            paid, cancelled, verified).
        db: Database session (injected).
        user: Current authenticated user (injected).
        role_check: Role validation ensuring admin/auditor access (injected).

    Returns:
        LedgerEntries: The updated ledger record.

    Raises:
        HTTPException (401): If user is not authenticated.
        HTTPException (403): If user is not an admin or auditor.
        HTTPException (404): If ledger record not found.
    """
    updated_record = LedgerService.edit_action(record_id, action, db)

    if not updated_record:
        raise DocumentNotFound

    # Log the action
    log_action(db, user.id, "UPDATE", "ledger", str(record_id))  # type: ignore
    db.commit()
    return updated_record
