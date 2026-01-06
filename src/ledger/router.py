from fastapi import APIRouter, Depends, status, Form, Query
from src.db.database import get_session
from src.Auth.dependency import role_required, get_current_user
from sqlmodel import Session
from .service import LedgerService
from .schemas import PaginatedLedgerResponse
from src.errors import DocumentNotFound
from src.db.models import Users
from .schemas import LedgerCreate, LedgerResponse

from src.db.enums import LedgerActionChoices
from datetime import date

ledger_router = APIRouter()


@ledger_router.post(
    "/entry", response_model=LedgerResponse, status_code=status.HTTP_201_CREATED
)
def create_ledger_entry(
    ledger_data: LedgerCreate,
    db: Session = Depends(get_session),
    user: Users = Depends(get_current_user),
    role_check: None = Depends(role_required(["bank"])),
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
    return LedgerService.get_user_ledger_records(db, page, page_size, user.id)  # type: ignore


@ledger_router.delete("/records/{record_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_record(
    record_id: int,
    db: Session = Depends(get_session),
    role_check: None = Depends(role_required(["admin", "auditor"])),
):
    """
    Delete a ledger record by its ID.
    """
    res = LedgerService.delete_ledger_entry(record_id, db)
    if not res:
        raise DocumentNotFound


@ledger_router.patch("/records/{record_id}", status_code=status.HTTP_200_OK)
def update_record(
    record_id: int,
    action: LedgerActionChoices = Form(...),
    db: Session = Depends(get_session),
    role_check: None = Depends(role_required(["admin", "auditor"])),
):
    """
    Update the action field of a ledger record. Restricted to Admin and Auditor users.
    """
    updated_record = LedgerService.edit_action(record_id, action, db)

    if not updated_record:
        raise DocumentNotFound

    return updated_record
