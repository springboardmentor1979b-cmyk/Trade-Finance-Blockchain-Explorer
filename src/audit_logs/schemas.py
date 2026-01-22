from datetime import datetime
from typing import Optional

from pydantic import BaseModel


class AuditLogCreate(BaseModel):
    action: str
    target_type: str
    target_id: int


class AuditLogResponse(BaseModel):
    id: int
    admin_id: int
    action: str
    target_type: str
    target_id: int
    timestamp: datetime
    admin_name: Optional[str] = None
