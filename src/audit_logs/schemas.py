"""Audit Logs Schemas Module.

This module defines Pydantic models for audit log request validation
and response serialization. These schemas ensure data integrity and
provide automatic API documentation.

Classes:
    AuditLogCreate: Schema for creating new audit log entries.
    AuditLogResponse: Schema for audit log API responses.
"""

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field


class AuditLogCreate(BaseModel):
    """Schema for creating a new audit log entry.

    Used to validate incoming requests when manually creating audit logs.
    Most audit logs are created automatically by the log_action utility function.

    Attributes:
        action: The action performed (e.g., CREATE, UPDATE, DELETE, VIEW).
        target_type: The type of entity affected (e.g., document, ledger, risk_score).
        target_id: The identifier of the affected entity.

    Example:
        >>> log_data = AuditLogCreate(
        ...     action="UPDATE",
        ...     target_type="document",
        ...     target_id=123
        ... )
    """

    action: str = Field(
        ...,
        description="Action performed (CREATE, UPDATE, DELETE, VIEW, etc.)",
        examples=["CREATE", "UPDATE", "DELETE"],
    )
    target_type: str = Field(
        ...,
        description="Type of entity affected",
        examples=["document", "ledger", "risk_score", "transaction", "user"],
    )
    target_id: int = Field(..., description="ID of the affected entity", gt=0)


class AuditLogResponse(BaseModel):
    """Schema for audit log API responses.

    Represents a complete audit log entry including metadata and
    the name of the admin who performed the action.

    Attributes:
        id: Unique identifier of the audit log entry.
        admin_id: ID of the user who performed the action.
        action: The action that was performed.
        target_type: The type of entity that was affected.
        target_id: The identifier of the affected entity.
        timestamp: When the action was recorded.
        admin_name: Name of the admin user (for display purposes).

    Example:
        >>> response = AuditLogResponse(
        ...     id=1,
        ...     admin_id=5,
        ...     action="UPDATE",
        ...     target_type="document",
        ...     target_id=123,
        ...     timestamp=datetime.now(),
        ...     admin_name="John Admin"
        ... )
    """

    id: int = Field(..., description="Unique audit log entry ID")
    admin_id: int = Field(..., description="ID of the admin who performed the action")
    action: str = Field(..., description="Action performed")
    target_type: str = Field(..., description="Type of entity affected")
    target_id: int = Field(..., description="ID of the affected entity")
    timestamp: datetime = Field(..., description="When the action was recorded")
    admin_name: Optional[str] = Field(
        default=None, description="Name of the admin user"
    )
