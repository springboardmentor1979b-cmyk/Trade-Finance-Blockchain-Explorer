from sqlalchemy import (
    Column,
    Integer,
    String,
    Enum,
    ForeignKey,
    TIMESTAMP,
    Numeric,
    Text,
    JSON,
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base
import enum


# --- ENUMS (Dropdown options defined in your PDF) ---
class UserRole(str, enum.Enum):
    BANK = "bank"
    CORPORATE = "corporate"
    AUDITOR = "auditor"
    ADMIN = "admin"


class DocType(str, enum.Enum):
    LOC = "LOC"
    INVOICE = "INVOICE"
    BILL_OF_LADING = "BILL_OF_LADING"
    PO = "PO"
    COO = "COO"
    INSURANCE_CERT = "INSURANCE_CERT"


class LedgerAction(str, enum.Enum):
    ISSUED = "ISSUED"
    AMENDED = "AMENDED"
    SHIPPED = "SHIPPED"
    RECEIVED = "RECEIVED"
    PAID = "PAID"
    CANCELLED = "CANCELLED"
    VERIFIED = "VERIFIED"


class TradeStatus(str, enum.Enum):
    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    DISPUTED = "disputed"


# --- MODELS (Tables) ---


class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    password = Column(String, nullable=False)
    role = Column(Enum(UserRole), nullable=False)
    org_name = Column(String, nullable=False)
    created_at = Column(TIMESTAMP(timezone=True), server_default=func.now())


class Document(Base):
    __tablename__ = "documents"
    id = Column(Integer, primary_key=True, index=True)
    owner_id = Column(Integer, ForeignKey("users.id"))
    doc_type = Column(Enum(DocType), nullable=False)
    doc_number = Column(String, nullable=False)
    file_url = Column(String, nullable=False)
    hash = Column(String, nullable=False)
    issued_at = Column(TIMESTAMP(timezone=True))
    created_at = Column(TIMESTAMP(timezone=True), server_default=func.now())


class LedgerEntry(Base):
    __tablename__ = "ledger_entries"
    id = Column(Integer, primary_key=True, index=True)
    document_id = Column(Integer, ForeignKey("documents.id"))
    action = Column(Enum(LedgerAction), nullable=False)
    actor_id = Column(Integer, ForeignKey("users.id"))
    metadata_info = Column(
        JSON, nullable=True
    )  # Renamed from 'metadata' to avoid conflict
    created_at = Column(TIMESTAMP(timezone=True), server_default=func.now())


class TradeTransaction(Base):
    __tablename__ = "trade_transactions"
    id = Column(Integer, primary_key=True, index=True)
    buyer_id = Column(Integer, ForeignKey("users.id"))
    seller_id = Column(Integer, ForeignKey("users.id"))
    amount = Column(Numeric, nullable=False)
    currency = Column(String(3), nullable=False)
    status = Column(Enum(TradeStatus), default=TradeStatus.PENDING)
    created_at = Column(TIMESTAMP(timezone=True), server_default=func.now())
    updated_at = Column(TIMESTAMP(timezone=True), onupdate=func.now())


class RiskScore(Base):
    __tablename__ = "risk_scores"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    score = Column(Numeric, nullable=False)
    rationale = Column(Text, nullable=True)
    last_updated = Column(TIMESTAMP(timezone=True), server_default=func.now())


class AuditLog(Base):
    __tablename__ = "audit_logs"
    id = Column(Integer, primary_key=True, index=True)
    admin_id = Column(Integer, ForeignKey("users.id"))
    action = Column(Text, nullable=False)
    target_type = Column(String, nullable=False)
    target_id = Column(Integer, nullable=False)
    timestamp = Column(TIMESTAMP(timezone=True), server_default=func.now())
