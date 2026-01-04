from pydantic import BaseModel
from datetime import datetime


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