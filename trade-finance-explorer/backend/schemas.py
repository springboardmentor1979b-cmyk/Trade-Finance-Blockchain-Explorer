from pydantic import BaseModel, EmailStr
from typing import Optional, List, Dict, Any
from datetime import datetime
from models import UserRole, DocType, LedgerAction, TradeStatus

# --- User Schemas ---
class UserBase(BaseModel):
    name: str
    email: EmailStr
    role: UserRole
    org_name: str

class UserCreate(UserBase):
    password: str

class UserOut(UserBase):
    id: int
    created_at: datetime
    class Config:
        from_attributes = True

# --- Token Schemas ---
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None

# --- Document Schemas ---
class DocumentOut(BaseModel):
    id: int
    doc_type: DocType
    doc_number: str
    file_url: str
    hash: str
    created_at: datetime
    issued_at: datetime
    class Config:
        from_attributes = True

# --- Ledger Schemas  ---
class LedgerEntryCreate(BaseModel):
    action: LedgerAction
    metadata_info: Optional[Dict[str, Any]] = None

class LedgerEntryOut(BaseModel):
    id: int
    document_id: int
    action: LedgerAction
    actor_id: int
    metadata_info: Optional[Dict[str, Any]]
    created_at: datetime
    class Config:
        from_attributes = True

# --- TRADE TRANSACTION SCHEMAS ---

class TradeTransactionCreate(BaseModel):
    buyer_email: EmailStr # We identify the buyer by email
    amount: float
    currency: str = "USD"

class TradeTransactionUpdate(BaseModel):
    status: TradeStatus 

class TradeTransactionOut(BaseModel):
    id: int
    buyer_id: int
    seller_id: int
    amount: float
    currency: str
    status: TradeStatus
    created_at: datetime
    updated_at: Optional[datetime]

    class Config:
        from_attributes = True


class DocumentWithUser(DocumentOut):
    owner_id: int
    owner_name: str
    owner_email: str

# --- AUDIT LOG SCHEMAS ---

class AuditLogOut(BaseModel):
    id: int
    admin_id: int
    action: str
    target_type: str
    target_id: int
    timestamp: datetime
    
    # Field to show the name of the admin who performed the action
    admin_name: Optional[str] = None 

    class Config:
        from_attributes = True