"""Ledger Schemas Module.

This module defines Pydantic models for ledger entry request validation
and response serialization. These schemas ensure data integrity and
provide automatic API documentation.

Classes:
    LedgerCreate: Schema for creating new ledger entries.
    LedgerResponse: Schema for full ledger entry responses.
    LedgerOut: Simplified schema for list views.
    PaginatedLedgerResponse: Schema for paginated ledger responses.
"""

from datetime import datetime
from typing import Any, Dict, Optional

from pydantic import BaseModel, Field

from src.db.enums import LedgerActionChoices


class LedgerCreate(BaseModel):
    """Schema for creating a new ledger entry.

    Used to validate incoming requests when creating ledger entries
    that track document actions.

    Attributes:
        document_id: ID of the document this entry relates to.
        action: Action performed on the document (issued, amended, verified, etc.).
        metadatav: Additional metadata in JSON format for action-specific details.

    Example:
        >>> entry_data = LedgerCreate(
        ...     document_id=1,
        ...     action=LedgerActionChoices.ISSUED,
        ...     metadatav={"remarks": "Initial issuance", "amount": 50000}
        ... )
    """

    document_id: int = Field(
        ..., description="ID of the document this entry relates to", gt=0
    )
    action: LedgerActionChoices = Field(
        ..., description="Action performed on the document"
    )
    metadatav: Optional[Dict[str, Any]] = Field(
        default={}, description="Additional metadata in JSON format"
    )

    class Config:
        """Pydantic model configuration."""

        from_attributes = True
        json_schema_extra = {
            "example": {
                "document_id": 1,
                "action": "issued",
                "metadatav": {
                    "remarks": "Letter of Credit issued successfully",
                    "amount": 50000,
                    "currency": "USD",
                },
            }
        }


class LedgerResponse(BaseModel):
    """Schema for full ledger entry API responses.

    Represents a complete ledger entry with all details including
    timestamp and actor information.

    Attributes:
        id: Unique identifier of the ledger entry.
        document_id: ID of the associated document.
        action: Action that was performed.
        actor_id: ID of the user who performed the action.
        metadatav: Additional metadata stored with the entry.
        created_at: Timestamp when the entry was created.
    """

    id: int = Field(..., description="Unique ledger entry ID")
    document_id: int = Field(..., description="Associated document ID")
    action: LedgerActionChoices = Field(..., description="Action performed")
    actor_id: int = Field(..., description="ID of the user who performed the action")
    metadatav: Dict[str, Any] = Field(..., description="Additional metadata")
    created_at: datetime = Field(..., description="Entry creation timestamp")

    class Config:
        """Pydantic model configuration."""

        from_attributes = True
        json_schema_extra = {
            "example": {
                "id": 1,
                "document_id": 2,
                "action": "issued",
                "actor_id": 0,
                "metadatav": {
                    "amount": 20000,
                    "currency": "USD",
                    "remarks": "Letter of Credit issued successfully",
                },
                "created_at": "2026-01-05T09:04:08.497Z",
            }
        }


class LedgerOut(BaseModel):
    """Simplified schema for ledger entry list views.

    Provides essential fields for displaying ledger entries in tables
    and lists, including resolved document number and user name.

    Attributes:
        id: Unique identifier of the ledger entry.
        document_number: Human-readable document number.
        action: Action that was performed.
        user_name: Name of the user who performed the action.
        created_at: Timestamp when the entry was created.
    """

    id: int = Field(..., description="Unique ledger entry ID")
    document_number: str = Field(..., description="Document number for display")
    action: str = Field(..., description="Action performed")
    user_name: str = Field(..., description="Name of the actor")
    created_at: datetime = Field(..., description="Entry creation timestamp")

    class Config:
        """Pydantic model configuration."""

        from_attributes = True


class PaginatedLedgerResponse(BaseModel):
    """Schema for paginated ledger responses.

    Used for list endpoints that return paginated results with
    metadata about the total count and current page.

    Attributes:
        total: Total number of records matching the query.
        page: Current page number.
        page_size: Number of records per page.
        items: List of ledger entries for the current page.
    """

    total: int = Field(..., description="Total number of matching records")
    page: int = Field(..., description="Current page number")
    page_size: int = Field(..., description="Records per page")
    items: list[LedgerOut] = Field(..., description="Ledger entries for this page")
