from sqlmodel import Session, select 
from src.db.models import LedgerEntries, Documents
from fastapi import HTTPException, status
from .schemas import LedgerCreate


class LedgerService:
    
    @staticmethod
    def create_ledger_entry(
        ledger_data: LedgerCreate,
        actor_id: int,
        db: Session,
    ) -> LedgerEntries:
        """Create a new ledger entry for a document."""
        
        # 1. Check if document exists
        document = db.get(Documents, ledger_data.document_id)
        if not document:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Document with ID {ledger_data.document_id} not found"
            )
        
        # 2. Create new ledger entry
        new_entry = LedgerEntries(
            document_id=ledger_data.document_id,
            action=ledger_data.action,
            actor_id=actor_id,
            metadatav=ledger_data.metadatav or {},
        )
        
        # 3. Save to database
        db.add(new_entry)
        db.commit()
        db.refresh(new_entry)
        
        return new_entry
    
    @staticmethod
    def delete_ledger_entry(ledger_id: int, db: Session):
        statement = select(LedgerEntries).where(LedgerEntries.id == ledger_id)
        result = db.exec(statement).first()
        if not result:
            return False
        db.delete(result)
        db.commit()
        return True

    @staticmethod
    def get_all_ledger_records(db: Session):
        statement = select(LedgerEntries)
        results = db.exec(statement).all()
        return results
