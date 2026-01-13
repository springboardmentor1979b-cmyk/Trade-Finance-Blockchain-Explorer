from pydantic import BaseModel, ConfigDict
from src.db.enums import TransactionStatusChoices
from datetime import datetime

class TransactionStatusUpdate(BaseModel):
    """Schema for updating only the transaction status."""
    status: TransactionStatusChoices

class TransactionResponse(BaseModel):
    """Schema for returning transaction details."""
    id: int
    amount: float
    currency: str
    status: TransactionStatusChoices
    buyer_id: int
    seller_id: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
