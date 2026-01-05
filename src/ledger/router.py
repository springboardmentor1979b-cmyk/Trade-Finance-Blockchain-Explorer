from fastapi import APIRouter, Depends, status
from src.db.database import get_session
from src.Auth.dependency import role_required, get_current_user
from sqlmodel import Session
from .service import LedgerService
from src.errors import DocumentNotFound
from src.db.models import Users, LedgerEntries
from .schemas import LedgerCreate


ledger_router = APIRouter()

@ledger_router.post("/entry", response_model=LedgerEntries, status_code=status.HTTP_201_CREATED)
def create_ledger_entry(
    ledger_data: LedgerCreate,
    db: Session = Depends(get_session),
    user: Users = Depends(get_current_user),
    role_check: None = Depends(role_required(["bank"])),
) -> LedgerEntries:
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


@ledger_router.get("/records")
def get_all_ledger_records_every_user(
    db: Session = Depends(get_session),
    role_check: None = Depends(role_required(["admin"])),
):
    return LedgerService.get_all_ledger_records(db)


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
