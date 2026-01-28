"""Database Enumerations Module.

This module defines enum classes used throughout the application for
type-safe, validated choices in database models and API schemas.

Enumerations:
    RoleChoices: User role types for role-based access control.
    DocumentTypeChoices: Types of trade documents supported.
    TransactionStatusChoices: Lifecycle statuses for transactions.
    LedgerActionChoices: Actions recorded in the ledger.

Usage:
    from src.db.enums import RoleChoices, DocumentTypeChoices

    # Use in SQLModel/Pydantic models
    role: RoleChoices = RoleChoices.BANK
    doc_type: DocumentTypeChoices = DocumentTypeChoices.LOC
"""

from enum import Enum


class RoleChoices(str, Enum):
    """Enumeration of user roles for role-based access control.

    Attributes:
        BANK: Financial institution role with banking privileges.
        CORPORATE: Corporate entity role for business operations.
        AUDITOR: Auditor role with read-only access for compliance.
        ADMIN: Administrator role with full system access.
    """

    BANK = "bank"
    CORPORATE = "corporate"
    AUDITOR = "auditor"
    ADMIN = "admin"


class DocumentTypeChoices(str, Enum):
    """Enumeration of trade document types supported by the system.

    Attributes:
        LOC: Letter of Credit document.
        INVOICE: Commercial invoice document.
        BILL_OF_LADING: Bill of Lading shipping document.
        PO: Purchase Order document.
        COO: Certificate of Origin document.
        INSURANCE_CERT: Insurance Certificate document.
    """

    LOC = "letter_of_credit"
    INVOICE = "invoice"
    BILL_OF_LADING = "bill_of_lading"
    PO = "purchase_order"
    COO = "certificate_of_origin"
    INSURANCE_CERT = "insurance_certificate"


class TransactionStatusChoices(str, Enum):
    """Enumeration of trade transaction statuses.

    Attributes:
        PENDING: Transaction is awaiting processing.
        IN_PROGRESS: Transaction is currently being processed.
        COMPLETED: Transaction has been successfully completed.
        DISPUTED: Transaction is under dispute resolution.
    """

    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    DISPUTED = "disputed"


class LedgerActionChoices(str, Enum):
    """Enumeration of actions that can be recorded in the ledger.

    Attributes:
        ISSUED: Document or transaction was issued.
        AMENDED: Document or transaction was amended/modified.
        SHIPPED: Goods associated with the transaction were shipped.
        RECEIVED: Goods or documents were received.
        PAID: Payment was made for the transaction.
        CANCELLED: Document or transaction was cancelled.
        VERIFIED: Document or transaction was verified.
    """

    ISSUED = "issued"
    AMENDED = "amended"
    SHIPPED = "shipped"
    RECEIVED = "received"
    PAID = "paid"
    CANCELLED = "cancelled"
    VERIFIED = "verified"
