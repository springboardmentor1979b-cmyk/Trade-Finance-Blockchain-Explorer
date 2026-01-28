"""Ledger Service Module.

This module provides the business logic for ledger entry operations
including creation, retrieval, deletion, and updates. Ledger entries
serve as an immutable audit trail for document actions.

Classes:
    LedgerService: Service class with static methods for ledger operations.
"""

from datetime import date, datetime
from typing import Dict, Optional

from sqlalchemy import func
from sqlmodel import Session, select

from src.db.models import Documents, LedgerEntries, Users
from src.errors import DocumentNotFound

from .schemas import LedgerCreate


class LedgerService:
    """Service class for ledger entry operations.

    Provides static methods for managing ledger entries including
    creation, retrieval with filtering, deletion, and action updates.
    All methods accept a database session for transaction control.

    Methods:
        create_ledger_entry: Create a new ledger entry for a document.
        delete_ledger_entry: Delete a ledger entry by ID.
        get_all_ledger_records: Retrieve all ledger records with filtering.
        get_user_ledger_records: Retrieve ledger records for a specific user.
        edit_action: Update the action field of a ledger entry.
    """

    @staticmethod
    def create_ledger_entry(
        ledger_data: LedgerCreate,
        actor_id: int,
        db: Session,
    ) -> LedgerEntries:
        """Create a new ledger entry for a document.

        Creates an immutable record of an action performed on a document.
        The entry includes the action type, actor, and optional metadata.

        Args:
            ledger_data: Pydantic schema containing document_id, action,
                and optional metadata.
            actor_id: ID of the user performing the action.
            db: Database session for the transaction.

        Returns:
            LedgerEntries: The created ledger entry with all details.

        Raises:
            DocumentNotFound: If the specified document does not exist.

        Example:
            >>> entry = LedgerService.create_ledger_entry(
            ...     LedgerCreate(document_id=1, action="issued"),
            ...     actor_id=user.id,
            ...     db=session
            ... )
        """
        # 1. Check if document exists
        document = db.get(Documents, ledger_data.document_id)
        if not document:
            raise DocumentNotFound(
                f"Document with ID {ledger_data.document_id} not found."
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
    def delete_ledger_entry(ledger_id: int, db: Session) -> bool:
        """Delete a ledger entry by its ID.

        Args:
            ledger_id: ID of the ledger entry to delete.
            db: Database session for the transaction.

        Returns:
            bool: True if deleted successfully, False if not found.

        Example:
            >>> success = LedgerService.delete_ledger_entry(123, db)
            >>> if not success:
            ...     raise DocumentNotFound(f"Ledger entry with ID 123 not found.")
        """
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
        document_number: Optional[str] = None,
        action: Optional[str] = None,
        user_name: Optional[str] = None,
        start_date: Optional[date] = None,
        end_date: Optional[date] = None,
    ) -> Dict:
        """Retrieve all ledger records with filtering and pagination.

        Fetches ledger entries with support for multiple filters and
        pagination. Results include resolved document numbers and user names.

        Args:
            db: Database session for querying.
            page: Page number (1-indexed).
            page_size: Number of records per page.
            document_number: Optional filter by document number (partial match).
            action: Optional filter by action type (exact match).
            user_name: Optional filter by user name (partial match).
            start_date: Optional filter for records on or after this date.
            end_date: Optional filter for records on or before this date.

        Returns:
            Dict: Contains 'total', 'page', 'page_size', and 'items' keys.
                Items are formatted with document_number and user_name resolved.

        Example:
            >>> result = LedgerService.get_all_ledger_records(
            ...     db, page=1, page_size=25, action="issued"
            ... )
            >>> print(f"Total: {result['total']}, Page: {result['page']}")
        """
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

        # Count query (SQLModel-safe)
        total = db.exec(select(func.count()).select_from(base_query.subquery())).one()

        # Paginated query
        ledgers = db.exec(
            base_query.order_by(LedgerEntries.created_at.desc())  # type: ignore
            .offset(offset)
            .limit(page_size)
        ).all()

        # Response mapping
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
    def get_user_ledger_records(
        db: Session, page: int, page_size: int, user_id: int
    ) -> Dict:
        """Retrieve ledger records for a specific user.

        Fetches ledger entries where the user is the actor, with
        pagination support.

        Args:
            db: Database session for querying.
            page: Page number (1-indexed).
            page_size: Number of records per page.
            user_id: ID of the user to filter by.

        Returns:
            Dict: Contains 'total', 'page', 'page_size', and 'items' keys.

        Example:
            >>> result = LedgerService.get_user_ledger_records(
            ...     db, page=1, page_size=25, user_id=5
            ... )
        """
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
            .join(Users, LedgerEntries.actor_id == Users.id)  # type: ignore
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
    def edit_action(ledger_id: int, new_action: str, db: Session) -> LedgerEntries:
        """Update the action field of a ledger entry.

        Updates only the action field of an existing ledger entry.
        This is the only mutable field on ledger entries.

        Args:
            ledger_id: ID of the ledger entry to update.
            new_action: New action value.
            db: Database session for the transaction.

        Returns:
            LedgerEntries: Updated ledger entry.

        Example:
            >>> updated = LedgerService.edit_action(123, "verified", db)
            >>> if updated:
            ...     print(f"Updated to: {updated.action}")
        """
        # Fetch the record by ID
        statement = select(LedgerEntries).where(LedgerEntries.id == ledger_id)
        result = db.exec(statement).first()

        if not result:
            raise DocumentNotFound(f"Ledger entry with ID {ledger_id} not found.")

        # Update the action field using the new value
        result.action = new_action  # type: ignore

        db.add(result)
        db.commit()
        db.refresh(result)
        return result
