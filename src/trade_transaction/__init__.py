"""Trade Transaction Module for Trade Finance Blockchain Explorer.

This module handles the core trade transaction management system.
It supports creating, tracking, and managing trade transactions between
buyers and sellers with full status lifecycle support.

Components:
    router: FastAPI router with transaction endpoints.
    service: Business logic for transaction operations.
    schemas: Pydantic schemas for request/response validation.
    utils: Utility functions for transaction calculations.
    validators: Transaction validation helpers.

Features:
    - Multi-party transaction support (buyer/seller)
    - Status lifecycle management (pending, in_progress, completed, disputed)
    - Multi-currency support with ISO 4217 validation
    - Search and filtering capabilities
    - Transaction summary and statistics
    - Audit logging for all modifications

Transaction Statuses:
    - PENDING: Transaction created, awaiting processing
    - IN_PROGRESS: Transaction being processed
    - COMPLETED: Transaction successfully completed
    - DISPUTED: Transaction under dispute resolution

Usage:
    from src.trade_transaction.router import transaction_router
    from src.trade_transaction.service import TradeTransactionService

    # Create a transaction
    transaction = service.create_transaction(
        session, buyer_id, seller_id, amount, currency
    )

Permissions:
    - CREATE: Bank, Corporate
    - READ: Bank, Corporate
    - UPDATE (status): Admin, Auditor
    - DELETE: Admin, Auditor
"""

from .router import transaction_router
from .service import TradeTransactionService
from .utils import TransactionUtils
from .validators import TransactionValidator

__all__ = [
    "transaction_router",
    "TradeTransactionService",
    "TransactionUtils",
    "TransactionValidator",
]
