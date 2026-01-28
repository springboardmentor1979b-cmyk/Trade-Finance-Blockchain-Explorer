"""Ledger Module for Trade Finance Blockchain Explorer.

This module provides functionality for managing immutable ledger entries
that record actions performed on trade documents. Each entry serves as
a tamper-proof audit trail for compliance and traceability.

Components:
    router: FastAPI router with ledger endpoints.
    service: Business logic for ledger operations.
    schemas: Pydantic schemas for request/response validation.

Features:
    - Automatic ledger creation on document upload
    - Action tracking (issued, amended, shipped, received, paid, cancelled, verified)
    - Immutable record storage with timestamps
    - Metadata support for action-specific details
    - Filtering by document, action, user, and date range

Usage:
    from src.ledger.router import ledger_router
    from src.ledger.service import LedgerService

    # Create a ledger entry
    entry = LedgerService.create_ledger_entry(ledger_data, actor_id, db)

Permissions:
    - CREATE: Bank, Corporate
    - READ (user): Bank, Corporate
    - READ (all): Admin, Auditor
    - UPDATE: Admin, Auditor
    - DELETE: Admin, Auditor
"""

from .router import ledger_router
from .service import LedgerService

__all__ = ["ledger_router", "LedgerService"]
