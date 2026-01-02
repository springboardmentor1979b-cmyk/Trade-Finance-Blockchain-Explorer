from sqlmodel import Session, select
from src.db.models import LedgerEntries


class LedgerService:
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
