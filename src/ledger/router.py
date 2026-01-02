from fastapi import APIRouter, Depends, status
from src.db.database import get_session
from src.Auth.dependency import role_required
from sqlmodel import Session
from .service import LedgerService
from src.errors import DocumentNotFound


ledger_router = APIRouter()


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
