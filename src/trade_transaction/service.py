from sqlmodel import Session, select
from src.db.models import TradeTransactions
from src.errors import DocumentNotFound 

class TransactionService:
    @staticmethod
    def update_status(db: Session, transaction_id: int, new_status: str):
        """Updates ONLY the status of a specific transaction."""
        transaction = db.get(TradeTransactions, transaction_id)
        if not transaction:
            raise DocumentNotFound() 
        
        transaction.status = new_status
        db.add(transaction)
        db.commit()
        db.refresh(transaction)
        return transaction

    @staticmethod
    def delete_transaction(db: Session, transaction_id: int):
        """Removes a transaction record from the database."""
        transaction = db.get(TradeTransactions, transaction_id)
        if not transaction:
            raise DocumentNotFound()
        
        db.delete(transaction)
        db.commit()
        return None
