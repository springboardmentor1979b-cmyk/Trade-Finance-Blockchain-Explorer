"""Utility functions for trade transactions.

Provides helper functions for transaction processing and formatting.
"""

from datetime import datetime, timedelta
from typing import Any, Dict, List, Optional

from sqlmodel import Session, func, select

from src.db.enums import TransactionStatusChoices
from src.db.models import TradeTransactions


class TransactionUtils:
    """Utility functions for transaction operations."""

    @staticmethod
    def format_amount(amount: float, currency: str) -> str:
        """Format amount with currency symbol.

        Args:
            amount: Transaction amount.
            currency: Currency code.

        Returns:
            str: Formatted amount string (e.g., "USD 50,000.00").
        """
        return f"{currency} {amount:,.2f}"

    @staticmethod
    def calculate_transaction_summary(
        session: Session,
        user_id: int,
        date_from: Optional[datetime] = None,
        date_to: Optional[datetime] = None,
    ) -> Dict[str, Any]:
        """Calculate transaction summary for a user.

        Args:
            session: Database session.
            user_id: User ID to calculate summary for.
            date_from: Optional start date for filtering.
            date_to: Optional end date for filtering.

        Returns:
            Dict containing transaction statistics.
        """
        # Base query for user transactions
        query = select(TradeTransactions).where(
            (TradeTransactions.buyer_id == user_id)
            | (TradeTransactions.seller_id == user_id)
        )

        # Apply date filters if provided
        if date_from:
            query = query.where(TradeTransactions.created_at >= date_from)
        if date_to:
            query = query.where(TradeTransactions.created_at <= date_to)

        transactions = session.exec(query).all()

        # Calculate statistics
        total_count = len(transactions)
        total_as_buyer = sum(1 for t in transactions if t.buyer_id == user_id)
        total_as_seller = sum(1 for t in transactions if t.seller_id == user_id)

        # Status breakdown
        status_breakdown = {
            "pending": sum(
                1 for t in transactions if t.status == TransactionStatusChoices.PENDING
            ),
            "in_progress": sum(
                1
                for t in transactions
                if t.status == TransactionStatusChoices.IN_PROGRESS
            ),
            "completed": sum(
                1
                for t in transactions
                if t.status == TransactionStatusChoices.COMPLETED
            ),
            "disputed": sum(
                1 for t in transactions if t.status == TransactionStatusChoices.DISPUTED
            ),
        }

        # Total amounts by currency
        amounts_by_currency = {}
        for transaction in transactions:
            currency = transaction.currency
            if currency not in amounts_by_currency:
                amounts_by_currency[currency] = 0
            amounts_by_currency[currency] += transaction.amount

        return {
            "total_transactions": total_count,
            "as_buyer": total_as_buyer,
            "as_seller": total_as_seller,
            "status_breakdown": status_breakdown,
            "amounts_by_currency": amounts_by_currency,
            "period": {
                "from": date_from.isoformat() if date_from else None,
                "to": date_to.isoformat() if date_to else None,
            },
        }

    @staticmethod
    def get_pending_transactions_count(session: Session, user_id: int) -> int:
        """Get count of pending transactions for a user.

        Args:
            session: Database session.
            user_id: User ID.

        Returns:
            int: Count of pending transactions.
        """
        query = select(func.count(TradeTransactions.id)).where(  # type: ignore
            (
                (TradeTransactions.buyer_id == user_id)
                | (TradeTransactions.seller_id == user_id)
            )
            & (TradeTransactions.status == TransactionStatusChoices.PENDING)
        )

        count = session.exec(query).one()
        return count

    @staticmethod
    def get_recent_transactions(
        session: Session, user_id: int, days: int = 30, limit: int = 10
    ) -> List[TradeTransactions]:
        """Get recent transactions for a user.

        Args:
            session: Database session.
            user_id: User ID.
            days: Number of days to look back (default: 30).
            limit: Maximum number of transactions to return (default: 10).

        Returns:
            List of recent transactions.
        """
        date_threshold = datetime.utcnow() - timedelta(days=days)

        query = (
            select(TradeTransactions)
            .where(
                (
                    (TradeTransactions.buyer_id == user_id)
                    | (TradeTransactions.seller_id == user_id)
                )
                & (TradeTransactions.created_at >= date_threshold)
            )
            .order_by(TradeTransactions.created_at.desc())  # type: ignore
            .limit(limit)
        )

        transactions = session.exec(query).all()
        return list(transactions)

    @staticmethod
    def can_cancel_transaction(transaction: TradeTransactions) -> bool:
        """Check if a transaction can be cancelled.

        Args:
            transaction: Transaction to check.

        Returns:
            bool: True if transaction can be cancelled.
        """
        # Business rule: Only pending transactions can be cancelled
        return transaction.status == TransactionStatusChoices.PENDING

    @staticmethod
    def get_transaction_duration(transaction: TradeTransactions) -> timedelta:
        """Calculate duration of a transaction.

        Args:
            transaction: Transaction to calculate duration for.

        Returns:
            timedelta: Duration from creation to last update.
        """
        return transaction.updated_at - transaction.created_at

    @staticmethod
    def generate_transaction_reference(transaction_id: int) -> str:
        """Generate a human-readable transaction reference.

        Args:
            transaction_id: Transaction ID.

        Returns:
            str: Transaction reference (e.g., "TXN-2026-000001").
        """
        current_year = datetime.utcnow().year
        return f"TXN-{current_year}-{transaction_id:06d}"


# Create singleton instance
transaction_utils = TransactionUtils()
