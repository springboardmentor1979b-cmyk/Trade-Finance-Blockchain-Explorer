from pydantic import BaseModel
from datetime import datetime
from typing import Optional
from src.db.enums import TransactionStatusChoices


class TransactionCreate(BaseModel):
    id: str
    amount: float
    currency: str
    seller_id: int


class TransactionUpdate(BaseModel):
    status: TransactionStatusChoices


class TransactionResponse(BaseModel):
    id: str
    amount: float
    currency: str
    status: TransactionStatusChoices
    created_at: datetime
    updated_at: datetime
    buyer_id: int
    seller_id: int
    buyer_name: Optional[str] = None
    seller_name: Optional[str] = None