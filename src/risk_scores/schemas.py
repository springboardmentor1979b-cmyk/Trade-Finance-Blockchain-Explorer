from datetime import datetime
from typing import Optional

from pydantic import BaseModel


class RiskScoreCreate(BaseModel):
    user_id: int
    score: float
    rationale: str


class RiskScoreUpdate(BaseModel):
    score: float
    rationale: str


class RiskScoreResponse(BaseModel):
    id: int
    score: float
    rationale: str
    last_updated: datetime
    user_id: int
    user_name: Optional[str] = None
