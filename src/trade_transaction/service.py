"""Trade Transaction Service Module.

This module provides the business logic for trade transaction operations
including creation, retrieval, updates, and deletion. Transactions represent
trade agreements between buyers and sellers with full lifecycle management.

Classes:
    TradeTransactionService: Service class for transaction operations.
"""

from typing import Optional

from fastapi import HTTPException, status
from sqlalchemy.orm import selectinload
from sqlmodel import Session, String, cast, func, or_, select

from src.db.enums import TransactionStatusChoices
from src.db.models import TradeTransactions, Users
from src.errors import DocumentNotFound,UserNotFound


class TradeTransactionService:
    """Service class for trade transaction operations.

    Provides methods for creating, retrieving, updating, and deleting
    trade transactions. Includes validation helpers for business rules.

    Methods:
        validate_user_exists: Validate that a user exists.
        validate_buyer_seller_different: Ensure buyer and seller are different.
        validate_amount: Validate transaction amount is positive.
        validate_currency: Validate currency code format.
        create_transaction: Create a new transaction.
        get_transaction: Retrieve a transaction by ID.
        list_transactions: List transactions with filtering.
        update_transaction_status: Update transaction status.
        delete_transaction: Delete a transaction.
    """

    @staticmethod
    def validate_user_exists(session: Session, user_id: int) -> Users:
        """Validate that a user exists in the database.

        Args:
            session: Database session.
            user_id: ID of the user to validate.

        Returns:
            Users: The validated user object.

        Raises:
            UserNotFound: If user does not exist.
        """
        user = session.get(Users, user_id)
        if not user:
            raise UserNotFound()
        return user

    @staticmethod
    def validate_buyer_seller_different(buyer_id: int, seller_id: int) -> None:
        """Ensure buyer and seller are different users.

        Args:
            buyer_id: Buyer user ID.
            seller_id: Seller user ID.

        Raises:
            HTTPException: If buyer and seller IDs are the same.
        """
        if buyer_id == seller_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Buyer and seller must be different users",
            )

    @staticmethod
    def validate_amount(amount: float) -> None:
        """Validate transaction amount is positive.

        Args:
            amount: Transaction amount to validate.

        Raises:
            HTTPException: If amount is not positive.
        """
        if amount <= 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Transaction amount must be greater than zero",
            )

    @staticmethod
    def validate_currency(currency: str) -> None:
        """Validate currency code format.

        Args:
            currency: ISO currency code (e.g., 'USD', 'EUR').

        Raises:
            HTTPException: If currency format is invalid.
        """
        if not currency or len(currency) != 3 or not currency.isalpha():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Currency must be a valid 3-letter ISO code",
            )

    def create_transaction(
        self,
        session: Session,
        buyer_id: int,
        seller_id: int,
        amount: float,
        currency: str,
        status: Optional[TransactionStatusChoices] = None,
    ) -> TradeTransactions:
        """Create a new trade transaction.

        Args:
            session: Database session.
            current_user: User creating the transaction.
            buyer_id: ID of the buyer.
            seller_id: ID of the seller.
            amount: Transaction amount.
            currency: ISO currency code.
            status: Optional initial status (defaults to PENDING).

        Returns:
            TradeTransactions: The created transaction.

        Raises:
            HTTPException: For validation failures or permission issues.
        """

        # Validate transaction data
        self.validate_amount(amount)
        self.validate_currency(currency.upper())
        self.validate_buyer_seller_different(buyer_id, seller_id)

        # Validate buyer and seller exist
        self.validate_user_exists(session, buyer_id)
        self.validate_user_exists(session, seller_id)

        # Create transaction
        transaction = TradeTransactions(
            buyer_id=buyer_id,
            seller_id=seller_id,
            amount=amount,
            currency=currency.upper(),
            status=status or TransactionStatusChoices.PENDING,
        )  # type: ignore

        session.add(transaction)
        session.commit()
        session.refresh(transaction)

        return transaction

    def get_transaction(
        self, session: Session, transaction_id: int
    ) -> TradeTransactions:
        """Retrieve a transaction by ID.

        Args:
            session: Database session.
            transaction_id: ID of the transaction to retrieve.

        Returns:
            TradeTransactions: The requested transaction.

        Raises:
            HTTPException: If transaction not found.
        """
        transaction = session.get(TradeTransactions, transaction_id)
        if not transaction:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Transaction with id {transaction_id} not found",
            )
        return transaction

    def list_transactions(
        self,
        session: Session,
        skip: int = 0,
        limit: int = 100,
        status_filter: Optional[TransactionStatusChoices] = None,
        search: Optional[str] = None,
        buyer_id: Optional[int] = None,
        seller_id: Optional[int] = None,
    ) -> tuple[list[TradeTransactions], int]:
        query = select(TradeTransactions).options(
            selectinload(TradeTransactions.buyer),  # type: ignore
            selectinload(TradeTransactions.seller),  # type: ignore
        )

        if status_filter:
            query = query.where(TradeTransactions.status == status_filter)

        if buyer_id:
            query = query.where(TradeTransactions.buyer_id == buyer_id)

        if seller_id:
            query = query.where(TradeTransactions.seller_id == seller_id)

        if search:
            search_term = f"%{search}%"

            buyer_ids = [
                row[0]  # type: ignore
                for row in session.exec(
                    select(Users.id).where(Users.name.ilike(search_term))  # type: ignore
                ).all()
            ]

            seller_ids = buyer_ids  # same query, same table

            search_conditions = [
                cast(TradeTransactions.id, String).ilike(search_term),
            ]

            if buyer_ids:
                search_conditions.append(TradeTransactions.buyer_id.in_(buyer_ids))  # type: ignore

            if seller_ids:
                search_conditions.append(TradeTransactions.seller_id.in_(seller_ids))  # type: ignore

            query = query.where(or_(*search_conditions))

        # total count (before pagination)
        count_query = select(func.count()).select_from(query.subquery())
        total = session.exec(count_query).one()

        query = (
            query.order_by(TradeTransactions.created_at.desc())  # type: ignore
            .offset(skip)
            .limit(limit)
        )

        transactions = session.exec(query).all()
        return list(transactions), total

    def update_transaction_status(
        self,
        session: Session,
        transaction_id: int,
        new_status: TransactionStatusChoices,
    ):
        """Update the status of a transaction.

        Args:
            session: Database session.
            current_user: User updating the transaction.
            transaction_id: ID of the transaction to update.
            new_status: New status for the transaction.

        Returns:
            TradeTransactions: The updated transaction.

        Raises:
            HTTPException: If transaction not found or permission denied.
        """

        query = select(TradeTransactions).where(TradeTransactions.id == transaction_id)

        transaction = (session.exec(query)).first()
        if not transaction:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Transaction with id {transaction_id} not found",
            )

        # Update status and timestamp
        transaction.status = new_status
        return transaction

    def delete_transaction(self, session: Session, transaction_id: int) -> None:
        """Delete a transaction from the database.

        Removes a transaction record. Used when users need to change
        immutable transaction details (must delete and re-create).

        Args:
            session: Database session for the transaction.
            transaction_id: ID of the transaction to delete.

        Returns:
            None: Returns nothing on successful deletion.

        Raises:
            DocumentNotFound: If transaction does not exist.

        Example:
            >>> service.delete_transaction(session, 123)
        """
        transaction = session.get(TradeTransactions, transaction_id)
        if not transaction:
            raise DocumentNotFound()

        session.delete(transaction)
        session.commit()
        return None
