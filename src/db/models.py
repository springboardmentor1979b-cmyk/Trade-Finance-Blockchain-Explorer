"""Database models module.

Defines SQLModel ORM models for the application database, including user model
and role enumeration for role-based access control.
"""

from datetime import datetime
from typing import Any, List, Optional

from sqlalchemy.dialects.postgresql import JSONB
from sqlmodel import Column, Field, Relationship, SQLModel, func, DateTime
from .enums import (
    DocumentTypeChoices,
    LedgerActionChoices,
    TransactionStatusChoices,
    RoleChoices,
)


class Documents(SQLModel, table=True):
    """Trade document model for storing document metadata and references.

    Represents various trade finance documents such as Letters of Credit,
    invoices, bills of lading, etc. Stores document metadata and file references.

    Attributes:
        id: Primary key identifier for the document.
        doc_type: Type of the document (LOC, invoice, etc.).
        doc_number: Unique document reference number, indexed for fast lookup.
        file_url: URL or path to the stored document file.
        hash: Cryptographic hash of the document for integrity verification.
        issued_at: Timestamp when the document was officially issued.
        created_at: Timestamp when the record was created in the system.
        owner_id: Foreign key reference to the owning user.
        owner: Relationship to the Users model representing the document owner.
        ledger_entries: List of ledger entries associated with this document.
    """

    id: Optional[int] = Field(primary_key=True, default=None)
    doc_type: DocumentTypeChoices
    doc_number: str = Field(index=True)
    file_url: str
    hash: str
    issued_at: datetime
    created_at: datetime = Field(
        sa_column=Column(
            DateTime(timezone=True), server_default=func.now(), nullable=False
        )
    )
    owner_id: int = Field(foreign_key="users.id")

    # Relationships
    owner: Optional["Users"] = Relationship(back_populates="documents")
    ledger_entries: List["LedgerEntries"] = Relationship(back_populates="document")


class TradeTransactions(SQLModel, table=True):
    """Trade transaction model representing financial transactions between parties.

    Tracks trade finance transactions including the monetary amount, currency,
    status, and the parties involved (buyer and seller).

    Attributes:
        id: Primary key identifier for the transaction.
        amount: Monetary value of the transaction.
        currency: ISO currency code (e.g., 'USD', 'EUR').
        status: Current status of the transaction (pending, in_progress, etc.).
        created_at: Timestamp when the transaction was created.
        updated_at: Timestamp of the last update to the transaction.
        buyer_id: Foreign key reference to the buyer user.
        seller_id: Foreign key reference to the seller user.
        buyer: Relationship to the Users model representing the buyer.
        seller: Relationship to the Users model representing the seller.
    """

    id: Optional[int] = Field(primary_key=True, default=None)
    amount: float
    currency: str
    status: TransactionStatusChoices = Field(default=TransactionStatusChoices.PENDING)
    created_at: datetime = Field(
        sa_column=Column(
            DateTime(timezone=True), server_default=func.now(), nullable=False
        )
    )
    updated_at: datetime = Field(
        sa_column=Column(
            DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
        )
    )
    buyer_id: int = Field(foreign_key="users.id")
    seller_id: int = Field(foreign_key="users.id")

    # Relationships
    buyer: Optional["Users"] = Relationship(
        back_populates="buyer_transactions",
        sa_relationship_kwargs={"foreign_keys": "TradeTransactions.buyer_id"},
    )
    seller: Optional["Users"] = Relationship(
        back_populates="seller_transactions",
        sa_relationship_kwargs={"foreign_keys": "TradeTransactions.seller_id"},
    )


class LedgerEntries(SQLModel, table=True):
    """Immutable ledger entry model for audit trail and action tracking.

    Records all actions performed on documents, providing a complete
    audit trail for compliance and traceability purposes.

    Attributes:
        id: Primary key identifier for the ledger entry.
        action: Type of action performed (issued, amended, verified, etc.).
        metadatav: JSONB field containing additional action-specific metadata.
        created_at: Timestamp when the ledger entry was created.
        document_id: Foreign key reference to the associated document.
        actor_id: Foreign key reference to the user who performed the action.
        document: Relationship to the Documents model.
        actor: Relationship to the Users model representing who performed the action.
    """

    id: Optional[int] = Field(primary_key=True, default=None)
    action: LedgerActionChoices
    metadatav: dict[str, Any] = Field(sa_column=Column(JSONB))
    created_at: datetime = Field(
        sa_column=Column(
            DateTime(timezone=True), server_default=func.now(), nullable=False
        )
    )
    document_id: int = Field(foreign_key="documents.id")
    actor_id: int = Field(foreign_key="users.id")

    # Relationships
    document: Optional["Documents"] = Relationship(back_populates="ledger_entries")
    actor: Optional["Users"] = Relationship(back_populates="ledger_entries")


class RiskScores(SQLModel, table=True):
    """Risk score model for user risk assessment and tracking.

    Stores computed risk scores for users based on their transaction
    history and behavior, used for risk management and compliance.

    Attributes:
        id: Primary key identifier for the risk score record.
        score: Numerical risk score value (typically 0-100 or similar scale).
        rationale: Text explanation of how the risk score was determined.
        last_updated: Timestamp of the most recent score calculation.
        user_id: Foreign key reference to the assessed user.
        user: Relationship to the Users model.
    """

    id: Optional[int] = Field(primary_key=True, default=None)
    score: float
    rationale: str
    last_updated: datetime = Field(
        sa_column=Column(
            DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
        )
    )
    user_id: int = Field(foreign_key="users.id")

    # Relationships
    user: Optional["Users"] = Relationship(back_populates="risk_scores")


class AuditLogs(SQLModel, table=True):
    """Audit log model for tracking administrative actions.

    Records all administrative actions performed in the system for
    security auditing and compliance purposes.

    Attributes:
        id: Primary key identifier for the audit log entry.
        admin_id: Foreign key reference to the admin user who performed the action.
        action: Description of the action performed (e.g., 'delete_user', 'update_role').
        target_type: Type of entity the action was performed on (e.g., 'user', 'document').
        target_id: Primary key of the target entity.
        timestamp: Timestamp when the action was performed.
        admin: Relationship to the Users model representing the admin.
    """

    id: Optional[int] = Field(primary_key=True, default=None)
    admin_id: int = Field(foreign_key="users.id")
    action: str
    target_type: str
    target_id: int
    timestamp: datetime = Field(
        sa_column=Column(
            DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
        )
    )

    # Relationships
    admin: Optional["Users"] = Relationship(back_populates="audit_logs")


class Users(SQLModel, table=True):
    """User database model for authentication and authorization.

    Represents system users including banks, corporates, auditors, and admins.
    Defined last to allow forward references to other models in List annotations.

    Attributes:
        id: Primary key identifier for the user.
        name: Full name of the user.
        email: Unique email address used for authentication, indexed for fast lookup.
        password: Hashed password (Argon2) for secure authentication.
        role: User role determining access permissions (bank, corporate, auditor, admin).
        org_name: Name of the organization the user belongs to.
        created_at: Timestamp when the user account was created.
        documents: List of documents owned by this user.
        buyer_transactions: List of transactions where this user is the buyer.
        seller_transactions: List of transactions where this user is the seller.
        audit_logs: List of audit log entries created by this user (admin only).
        ledger_entries: List of ledger entries where this user was the actor.
        risk_scores: List of risk score assessments for this user.
    """

    id: Optional[int] = Field(primary_key=True, default=None)
    name: str
    email: str = Field(unique=True, index=True)
    password: str
    role: RoleChoices
    org_name: str
    created_at: datetime = Field(
        sa_column=Column(
            DateTime(timezone=True), server_default=func.now(), nullable=False
        )
    )

    # Relationships
    documents: List[Documents] = Relationship(back_populates="owner")
    buyer_transactions: List[TradeTransactions] = Relationship(
        back_populates="buyer",
        sa_relationship_kwargs={"foreign_keys": "TradeTransactions.buyer_id"},
    )
    seller_transactions: List[TradeTransactions] = Relationship(
        back_populates="seller",
        sa_relationship_kwargs={"foreign_keys": "TradeTransactions.seller_id"},
    )
    audit_logs: List[AuditLogs] = Relationship(back_populates="admin")
    ledger_entries: List[LedgerEntries] = Relationship(back_populates="actor")
    risk_scores: List[RiskScores] = Relationship(back_populates="user")
    password_reset_tokens: List["PasswordResetTokens"] = Relationship(
        back_populates="user"
    )


class PasswordResetTokens(SQLModel, table=True):
    """Password reset token model for secure password recovery.

    Stores one-time tokens for password reset requests, linked to user accounts.
    Tokens have an expiration time to enhance security.

    Attributes:
        id: Primary key identifier for the password reset token.
        user_id: Foreign key reference to the user requesting the password reset.
        token: Unique token string used for password reset verification.
        expires_at: Timestamp when the token expires and becomes invalid.
        created_at: Timestamp when the token was created.
        user: Relationship to the Users model.
    """

    id: Optional[int] = Field(primary_key=True, default=None)
    user_id: int = Field(foreign_key="users.id")
    token: str = Field(unique=True, index=True)
    is_used: bool = Field(default=False)
    expires_at: datetime = Field(
        sa_column=Column(
            DateTime(timezone=True),  # IMPORTANT
            nullable=False,
        )
    )
    created_at: datetime = Field(
        sa_column=Column(
            DateTime(timezone=True), server_default=func.now(), nullable=False
        )
    )

    # Relationships
    user: Optional["Users"] = Relationship(back_populates="password_reset_tokens")
