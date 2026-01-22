from datetime import date, datetime

from fastapi import HTTPException, status
from sqlalchemy import func
from sqlmodel import Session, select

from src.db.models import Documents, LedgerEntries, Users

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
                detail=f"Document with ID {ledger_data.document_id} not found",
            )

        # 2. Create new ledger entry
        new_entry = LedgerEntries(
            document_id=ledger_data.document_id,
            action=ledger_data.action,
            actor_id=actor_id,
            metadatav=ledger_data.metadatav or {},
        )  # type: ignore

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
    def get_all_ledger_records(
        db: Session,
        page: int,
        page_size: int,
        document_number: str | None = None,
        action: str | None = None,
        user_name: str | None = None,
        start_date: date | None = None,
        end_date: date | None = None,
    ):
        offset = (page - 1) * page_size
        base_query = select(LedgerEntries).join(Documents).join(Users)

        if document_number:
            base_query = base_query.where(
                Documents.doc_number.ilike(f"%{document_number}%")  # type: ignore
            )

        if action:
            base_query = base_query.where(LedgerEntries.action == action)

        if user_name:
            base_query = base_query.where(Users.name.ilike(f"%{user_name}%"))  # type: ignore

        if start_date:
            base_query = base_query.where(
                LedgerEntries.created_at
                >= datetime.combine(start_date, datetime.min.time())
            )

        if end_date:
            base_query = base_query.where(
                LedgerEntries.created_at
                <= datetime.combine(end_date, datetime.max.time())
            )

        # ---- COUNT QUERY (SQLModel-safe) ----
        total = db.exec(select(func.count()).select_from(base_query.subquery())).one()

        # ---- PAGINATED QUERY ----
        ledgers = db.exec(
            base_query.order_by(LedgerEntries.created_at.desc())  # type: ignore
            .offset(offset)
            .limit(page_size)
        ).all()

        # ---- RESPONSE MAPPING ----
        items = [
            {
                "id": ledger.id,
                "document_number": ledger.document.doc_number,  # type: ignore
                "action": ledger.action,
                "user_name": ledger.actor.name,  # type: ignore
                "created_at": ledger.created_at,
            }
            for ledger in ledgers
        ]

        return {
            "total": total,
            "page": page,
            "page_size": page_size,
            "items": items,
        }

    @staticmethod
    def get_user_ledger_records(db: Session, page: int, page_size: int, user_id: int):
        offset = (page - 1) * page_size

        # Count only user's records
        total = db.exec(
            select(func.count())
            .select_from(LedgerEntries)
            .where(LedgerEntries.actor_id == user_id)
        ).one()

        # Fetch with joins to get document and user info
        logs = db.exec(
            select(LedgerEntries)
            .join(Documents)
            .join(Users, LedgerEntries.actor_id == Users.id)
            .where(LedgerEntries.actor_id == user_id)
            .order_by(LedgerEntries.created_at.desc())  # type: ignore
            .offset(offset)
            .limit(page_size)
        ).all()

        # Format response to match LedgerOut schema
        items = [
            {
                "id": ledger.id,
                "document_number": ledger.document.doc_number
                if ledger.document
                else "N/A",  # type: ignore
                "action": ledger.action,
                "user_name": ledger.actor.name if ledger.actor else "Unknown",  # type: ignore
                "created_at": ledger.created_at,
            }
            for ledger in logs
        ]

        return {"total": total, "page": page, "page_size": page_size, "items": items}

    @staticmethod
    def edit_action(ledger_id: int, new_action: str, db: Session):
        """
        Updates only the 'action' field of a specific ledger entry.
        """
        # Fetch the record by ID
        statement = select(LedgerEntries).where(LedgerEntries.id == ledger_id)
        result = db.exec(statement).first()

        if not result:
            return None

        # Update the action field using the new value
        result.action = new_action  # type: ignore

        db.add(result)
        db.commit()
        db.refresh(result)
        return result
