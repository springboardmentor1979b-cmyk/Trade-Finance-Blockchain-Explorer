from datetime import datetime
from typing import Optional, Tuple

from fastapi import HTTPException, status
from sqlmodel import Session, func, or_, select

from src.db.enums import RoleChoices, TransactionStatusChoices
from src.db.models import TradeTransactions, Users
from src.errors import DocumentNotFound


class TradeTransactionService:
    """Service for managing trade transactions with role-based validation."""

    @staticmethod
    def validate_transaction_creator(user: Users) -> None:
        """Validate that user has permission to create transactions.

        Args:
            user: The user attempting to create a transaction.

        Raises:
            HTTPException: If user role is not bank or corporate.
        """
        allowed_roles = [RoleChoices.BANK, RoleChoices.CORPORATE]
        if user.role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only bank and corporate users can create trade transactions",
            )

    @staticmethod
    def validate_user_exists(session: Session, user_id: int) -> Users:
        """Validate that a user exists in the database.

        Args:
            session: Database session.
            user_id: ID of the user to validate.

        Returns:
            Users: The validated user object.

        Raises:
            HTTPException: If user does not exist.
        """
        user = session.get(Users, user_id)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"User with id {user_id} not found",
            )
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
        current_user: Users,
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
        # Validate creator has permission
        self.validate_transaction_creator(current_user)

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
        current_user: Users,
        skip: int = 0,
        limit: int = 100,
        status_filter: Optional[TransactionStatusChoices] = None,
        search: Optional[str] = None,
        buyer_id: Optional[int] = None,
        seller_id: Optional[int] = None,
    ) -> Tuple[list[TradeTransactions], int]:
        """List transactions with optional filtering.

        Args:
            session: Database session.
            current_user: User requesting the list.
            skip: Number of records to skip (pagination).
            limit: Maximum number of records to return.
            status_filter: Optional status to filter by.
            search: Optional search term for transaction ID or user names.
            buyer_id: Optional buyer ID to filter by.
            seller_id: Optional seller ID to filter by.

        Returns:
            Tuple[list[TradeTransactions], int]: List of transactions and total count.
        """
        # Alias for buyer and seller joins
        BuyerUser = Users
        SellerUser = Users

        query = select(TradeTransactions)

        # Apply status filter if provided
        if status_filter:
            query = query.where(TradeTransactions.status == status_filter)

        # Apply buyer filter
        if buyer_id:
            query = query.where(TradeTransactions.buyer_id == buyer_id)

        # Apply seller filter
        if seller_id:
            query = query.where(TradeTransactions.seller_id == seller_id)

        # Apply search filter (search by transaction ID or user names)
        if search:
            search_term = f"%{search}%"
            # Get buyer and seller IDs that match the search term
            buyer_ids = session.exec(
                select(Users.id).where(Users.name.ilike(search_term))
            ).all()
            seller_ids = session.exec(
                select(Users.id).where(Users.name.ilike(search_term))
            ).all()

            # Build search conditions
            search_conditions = [
                TradeTransactions.id.cast(str).ilike(search_term),
                TradeTransactions.buyer_id.in_(buyer_ids) if buyer_ids else False,
                TradeTransactions.seller_id.in_(seller_ids) if seller_ids else False,
            ]
            # Filter out False values (when no matching IDs)
            search_conditions = [c for c in search_conditions if c is not False]
            if search_conditions:
                query = query.where(or_(*search_conditions))

        # Get total count before pagination
        count_query = select(func.count()).select_from(query.subquery())
        total = session.exec(count_query).one()

        # Order by created_at descending (newest first)
        query = query.order_by(TradeTransactions.created_at.desc())  # type: ignore
        query = query.offset(skip).limit(limit)

        transactions = session.exec(query).all()
        return list(transactions), total

    def update_transaction_status(
        self,
        session: Session,
        current_user: Users,
        transaction_id: int,
        new_status: TransactionStatusChoices,
    ) -> TradeTransactions:
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
        # Validate creator has permission
        self.validate_transaction_creator(current_user)

        transaction = self.get_transaction(session, transaction_id)

        # Update status and timestamp
        transaction.status = new_status
        transaction.updated_at = datetime.utcnow()

        session.add(transaction)
        session.commit()
        session.refresh(transaction)

        return transaction

    @staticmethod
    def update_status(db: Session, transaction_id: int, new_status: str):
        """Updates ONLY the status of a specific transaction."""
        transaction = db.get(TradeTransactions, transaction_id)
        if not transaction:
            raise DocumentNotFound()

        transaction.status = new_status  # type: ignore
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


trade_transaction_service = TradeTransactionService()
