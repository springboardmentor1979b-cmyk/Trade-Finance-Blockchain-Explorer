<<<<<<< HEAD
from pydantic import BaseModel
from datetime import datetime


=======
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
        from_attributes = True
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
        
class LedgerResponse(BaseModel):
    """Schema for ledger entry response."""
    
    id: int
    document_id: int
    action: LedgerActionChoices
    actor_id: int
    metadatav: Dict[str, Any]
    created_at: datetime
    
    class Config:
        from_attributes = True  # ✅ Ye important hai - SQLModel to Pydantic conversion ke liye
        json_schema_extra = {
            "example": {
                "id": 1,
                "document_id": 2,
                "action": "issued",
                "actor_id": 0,
                "metadatav": {
                    "amount": 20000,
                    "currency": "USD",
                    "remarks": "Letter of Credit issued successfully"
                },
                "created_at": "2026-01-05T09:04:08.497Z"
            }
        }

>>>>>>> 7545c9c88d64928b48b565268cb1ba33b67fa76b
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
<<<<<<< HEAD
    items: list[LedgerOut]
=======
    items: list[LedgerOut]
>>>>>>> 7545c9c88d64928b48b565268cb1ba33b67fa76b
