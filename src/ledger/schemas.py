from pydantic import BaseModel, Field
from typing import Optional, Dict, Any
from src.db.enums import LedgerActionChoices
from datetime import datetime


class LedgerCreate(BaseModel):
    """Schema for creating a new ledger entry.
    
    Attributes:
        document_id: ID of the document this entry relates to.
        action: Action performed on the document (issued, amended, verified, etc.).
        metadatav: Additional metadata in JSON format for action-specific details.
    """
    
    document_id: int = Field(..., description="ID of the document this entry relates to")
    action: LedgerActionChoices = Field(..., description="Action performed on the document")
    metadatav: Optional[Dict[str, Any]] = Field(
        default={}, 
        description="Additional metadata in JSON format"
    )

    class Config:
        json_schema_extra = {
            "example": {
                "document_id": 1,
                "action": "issued",
                "metadatav": {
                    "remarks": "Letter of Credit issued successfully",
                    "amount": 50000,
                    "currency": "USD"
                }
            }
        }


class LedgerOut(BaseModel):
    id: int
    document_number: str
    action: str
    user_name: str
    created_at: datetime

    class Config:
        orm_mode = True


class PaginatedLedgerResponse(BaseModel):
    total: int
    page: int
    page_size: int
    items: list[LedgerOut]
