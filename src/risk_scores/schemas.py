"""Risk Scores Schemas Module.

This module defines Pydantic models for risk score request validation
and response serialization. These schemas ensure data integrity and
provide automatic API documentation.

Classes:
    RiskScoreCreate: Schema for creating new risk scores.
    RiskScoreUpdate: Schema for updating existing risk scores.
    RiskScoreResponse: Schema for risk score API responses.
"""

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field


class RiskScoreCreate(BaseModel):
    """Schema for creating a new risk score.

    Used to validate incoming requests when creating risk assessments
    for users.

    Attributes:
        user_id: ID of the user being assessed.
        score: Risk score value between 0 and 100.
        rationale: Explanation for the assigned score.

    Example:
        >>> score_data = RiskScoreCreate(
        ...     user_id=5,
        ...     score=75.5,
        ...     rationale="High transaction volume with new counterparties"
        ... )
    """

    user_id: int = Field(..., description="ID of the user being assessed", gt=0)
    score: float = Field(
        ..., ge=0, le=100, description="Risk score (0-100, higher = more risk)"
    )
    rationale: str = Field(
        ..., min_length=1, description="Explanation for the assigned score"
    )


class RiskScoreUpdate(BaseModel):
    """Schema for updating an existing risk score.

    Used to validate incoming requests when modifying risk assessments.
    Only score and rationale can be updated; user association is immutable.

    Attributes:
        score: New risk score value between 0 and 100.
        rationale: New explanation for the assigned score.

    Example:
        >>> update_data = RiskScoreUpdate(
        ...     score=45.0,
        ...     rationale="Risk reduced after compliance review"
        ... )
    """

    score: float = Field(..., ge=0, le=100, description="Updated risk score (0-100)")
    rationale: str = Field(..., min_length=1, description="Updated rationale")


class RiskScoreResponse(BaseModel):
    """Schema for risk score API responses.

    Represents a complete risk score record including the associated
    user's name for display purposes.

    Attributes:
        id: Unique identifier of the risk score record.
        score: Risk score value (0-100).
        rationale: Explanation for the assigned score.
        last_updated: Timestamp of the last update.
        user_id: ID of the associated user.
        user_name: Name of the associated user (for display).

    Example:
        >>> response = RiskScoreResponse(
        ...     id=1,
        ...     score=75.5,
        ...     rationale="High volume trader",
        ...     last_updated=datetime.now(),
        ...     user_id=5,
        ...     user_name="John Doe"
        ... )
    """

    id: int = Field(..., description="Unique risk score ID")
    score: float = Field(..., description="Risk score value (0-100)")
    rationale: str = Field(..., description="Explanation for the score")
    last_updated: datetime = Field(..., description="Last update timestamp")
    user_id: int = Field(..., description="ID of the assessed user")
    user_name: Optional[str] = Field(
        default=None, description="Name of the assessed user"
    )
