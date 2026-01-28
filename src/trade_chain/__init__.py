"""Trade Chain Module for Trade Finance Blockchain Explorer.

This module handles the document management system for trade finance documents.
It supports uploading, storing, and managing various types of trade documents
with built-in duplicate detection and automatic ledger entry creation.

Components:
    router: FastAPI router with document endpoints.
    service: Business logic for document operations.
    schemas: Pydantic schemas for request/response validation.
    utils: Utility functions for hash generation.
    validators: Document validation helpers.

Features:
    - Multi-file upload support
    - Automatic duplicate detection via SHA-256 hashing
    - Support for multiple document types (LOC, Invoice, Bill of Lading, etc.)
    - Automatic ledger entry creation on upload
    - File storage management with cleanup on failure
    - Atomic multi-document uploads (all-or-nothing)

Document Types:
    - Letter of Credit (LOC)
    - Invoice
    - Bill of Lading
    - Purchase Order (PO)
    - Certificate of Origin (COO)
    - Insurance Certificate

Usage:
    from src.trade_chain.router import trade_chain_router
    from src.trade_chain.service import TradeChainService

    # Upload documents
    docs = TradeChainService.save_multiple_document(files, doc_type, owner_id, db)

Permissions:
    - CREATE: Bank, Corporate
    - READ (own): Bank, Corporate
    - READ (all): Admin, Auditor
    - UPDATE: Admin, Auditor
    - DELETE: Admin, Auditor
"""

from .router import trade_chain_router
from .service import TradeChainService

__all__ = ["trade_chain_router", "TradeChainService"]
