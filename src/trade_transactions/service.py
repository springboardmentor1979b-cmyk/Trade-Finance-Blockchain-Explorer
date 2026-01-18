from sqlmodel import Session, select
from src.db.models import TradeTransactions, Users
from src.db.enums import TransactionStatusChoices
from src.db.id_utils import generate_transaction_id
from .schemas import TransactionCreate, TransactionUpdate, TransactionResponse
from fastapi import HTTPException, status


class TradeTransactionService:
    @staticmethod
    def create_transaction(transaction_data: TransactionCreate, buyer_id: int, db: Session) -> TransactionResponse:
        # Verify seller exists
        seller = db.get(Users, transaction_data.seller_id)
        if not seller:
            raise HTTPException(status_code=404, detail="Seller not found")
        
        transaction = TradeTransactions(
            id=transaction_data.id,
            amount=transaction_data.amount,
            currency=transaction_data.currency,
            buyer_id=buyer_id,
            seller_id=transaction_data.seller_id
        )
        db.add(transaction)
        db.commit()
        db.refresh(transaction)
        
        return TransactionResponse(
            id=transaction.id,
            amount=transaction.amount,
            currency=transaction.currency,
            status=transaction.status,
            created_at=transaction.created_at,
            updated_at=transaction.updated_at,
            buyer_id=transaction.buyer_id,
            seller_id=transaction.seller_id,
            buyer_name=transaction.buyer.name if transaction.buyer else None,
            seller_name=transaction.seller.name if transaction.seller else None
        )

    @staticmethod
    def get_user_transactions(user_id: int, db: Session) -> list[TransactionResponse]:
        statement = select(TradeTransactions).where(
            (TradeTransactions.buyer_id == user_id) | (TradeTransactions.seller_id == user_id)
        )
        transactions = db.exec(statement).all()
        
        return [
            TransactionResponse(
                id=t.id,
                amount=t.amount,
                currency=t.currency,
                status=t.status,
                created_at=t.created_at,
                updated_at=t.updated_at,
                buyer_id=t.buyer_id,
                seller_id=t.seller_id,
                buyer_name=t.buyer.name if t.buyer else None,
                seller_name=t.seller.name if t.seller else None
            ) for t in transactions
        ]

    @staticmethod
    def get_all_transactions(db: Session) -> list[TransactionResponse]:
        statement = select(TradeTransactions)
        transactions = db.exec(statement).all()
        
        return [
            TransactionResponse(
                id=t.id,
                amount=t.amount,
                currency=t.currency,
                status=t.status,
                created_at=t.created_at,
                updated_at=t.updated_at,
                buyer_id=t.buyer_id,
                seller_id=t.seller_id,
                buyer_name=t.buyer.name if t.buyer else None,
                seller_name=t.seller.name if t.seller else None
            ) for t in transactions
        ]

    @staticmethod
    def update_transaction(transaction_id: str, update_data: TransactionUpdate, db: Session) -> TransactionResponse:
        transaction = db.get(TradeTransactions, transaction_id)
        if not transaction:
            raise HTTPException(status_code=404, detail="Transaction not found")
        
        transaction.status = update_data.status
        db.add(transaction)
        db.commit()
        db.refresh(transaction)
        
        return TransactionResponse(
            id=transaction.id,
            amount=transaction.amount,
            currency=transaction.currency,
            status=transaction.status,
            created_at=transaction.created_at,
            updated_at=transaction.updated_at,
            buyer_id=transaction.buyer_id,
            seller_id=transaction.seller_id,
            buyer_name=transaction.buyer.name if transaction.buyer else None,
            seller_name=transaction.seller.name if transaction.seller else None
        )