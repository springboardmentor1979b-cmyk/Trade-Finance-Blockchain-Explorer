from fastapi import APIRouter, File, UploadFile, Depends, Form
from sqlmodel import Session
from src.db.database import get_session
from .service import TradeChainService
from src.Auth.dependency import get_current_user
from src.db.models import Users, Documents
from src.db.enums import DocumentTypeChoices

trade_chain_router = APIRouter()


@trade_chain_router.post("/upload")
def upload_single_multiple_document(
    files: list[UploadFile] = File(...),
    doc_type: DocumentTypeChoices = Form(...),
    db: Session = Depends(get_session),
    user: Users = Depends(get_current_user),
) -> list[Documents]:
    return TradeChainService.save_multiple_document(
        files=files,
        doc_type=doc_type,
        owner_id=user.id,  # type: ignore
        db=db,
    )
