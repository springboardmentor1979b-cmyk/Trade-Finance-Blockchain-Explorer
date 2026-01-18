from fastapi import APIRouter, Depends, status
from sqlmodel import Session
from src.db.database import get_session
from src.Auth.dependency import get_current_user, role_required
from src.db.models import Users
from .service import TradeTransactionService
from .schemas import TransactionCreate, TransactionUpdate, TransactionResponse

trade_transactions_router = APIRouter()


@trade_transactions_router.post("/", response_model=TransactionResponse)
def create_transaction(
    transaction_data: TransactionCreate,
    db: Session = Depends(get_session),
    user: Users = Depends(get_current_user),
    role_check: None = Depends(role_required(["bank", "corporate"])),
) -> TransactionResponse:
    return TradeTransactionService.create_transaction(transaction_data, user.id, db)


@trade_transactions_router.get("/my", response_model=list[TransactionResponse])
def get_my_transactions(
    db: Session = Depends(get_session),
    user: Users = Depends(get_current_user),
    role_check: None = Depends(role_required(["bank", "corporate"])),
) -> list[TransactionResponse]:
    return TradeTransactionService.get_user_transactions(user.id, db)


@trade_transactions_router.get("/", response_model=list[TransactionResponse])
def get_all_transactions(
    db: Session = Depends(get_session),
    role_check: None = Depends(role_required(["admin", "auditor"])),
) -> list[TransactionResponse]:
    return TradeTransactionService.get_all_transactions(db)


@trade_transactions_router.patch("/{transaction_id}", response_model=TransactionResponse)
def update_transaction(
    transaction_id: str,
    update_data: TransactionUpdate,
    db: Session = Depends(get_session),
    role_check: None = Depends(role_required(["admin", "auditor"])),
) -> TransactionResponse:
    return TradeTransactionService.update_transaction(transaction_id, update_data, db)