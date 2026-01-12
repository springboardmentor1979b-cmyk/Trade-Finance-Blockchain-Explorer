from fastapi import APIRouter, Depends, status,Form
from sqlmodel import Session
from src.db.database import get_session
from src.Auth.dependency import role_required
from .service import TransactionService
from .schemas import TransactionStatusUpdate, TransactionResponse
from src.db.enums import  TransactionStatusChoices
transaction_router = APIRouter()

@transaction_router.patch(
    "/{transaction_id}/status", 
    response_model=TransactionResponse
)
def edit_transaction_status(
    transaction_id: int,
    status: TransactionStatusChoices=Form(...),
    db: Session = Depends(get_session),
    admin_check: bool = Depends(role_required(["admin"]))
):
    """Admin-only: Updates the status of a transaction. Other fields cannot be changed."""
    return TransactionService.update_status(db, transaction_id, status)

@transaction_router.delete(
    "/{transaction_id}", 
    status_code=status.HTTP_204_NO_CONTENT
)
def delete_transaction(
    transaction_id: int,
    db: Session = Depends(get_session),
    admin_check: bool = Depends(role_required(["admin"]))
):
    """Admin-only: Deletes a transaction. Users must re-add to change immutable details."""
    TransactionService.delete_transaction(db, transaction_id)
    return None
