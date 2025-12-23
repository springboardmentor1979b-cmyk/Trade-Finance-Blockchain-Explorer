from pydantic import BaseModel, ConfigDict
from datetime import datetime


class DocumentBase(BaseModel):
    id: int
    doc_type: str
    doc_number: str
    file_url: str
    hash: str
    owner_id: int
    issued_at: datetime
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class UserDocumentsResponse(BaseModel):
    id: int
    email: str
    name: str
    documents: list[DocumentBase]

    model_config = ConfigDict(from_attributes=True)
