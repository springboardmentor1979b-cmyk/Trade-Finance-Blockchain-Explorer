from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class AuditLogCreate(BaseModel):
    action: str
    target_type: str
    target_id: str


class AuditLogResponse(BaseModel):
    id: str
    admin_id: int
    action: str
    target_type: str
    target_id: str
    timestamp: datetime
    admin_name: Optional[str] = None