from fastapi import APIRouter, File, UploadFile, Depends, Form, status
from sqlmodel import Session, select
from src.db.database import get_session
from .service import TradeChainService
from src.Auth.dependency import get_current_user, role_required
from src.db.models import Users, Documents
from src.db.enums import DocumentTypeChoices
from .schemas import UserDocumentsResponse
from datetime import datetime

trade_chain_router = APIRouter()


@trade_chain_router.post("/upload")
def upload_single_multiple_document(
    files: list[UploadFile] = File(...),
    doc_type: DocumentTypeChoices = Form(...),
    issued_at: datetime = Form(...),
    db: Session = Depends(get_session),
    user: Users = Depends(get_current_user),
    role_check: None = Depends(
        role_required(["bank", "admin", "corporate", "auditor"])
    ),
) -> list[Documents]:
    return TradeChainService.save_multiple_document(
        files=files,
        doc_type=doc_type,
        owner_id=user.id,  # type: ignore
        issued_at=issued_at,
        db=db,
    )


@trade_chain_router.get("/document", response_model=list[Documents])
def get_document_by_user(
    db: Session = Depends(get_session),
    user: Users = Depends(get_current_user),
    role_check: None = Depends(
        role_required(["bank", "admin", "corporate", "auditor"])
    ),
) -> list[Documents]:
    return TradeChainService.get_document_by_user(
        user=user,
        db=db,
    )


@trade_chain_router.get("/documents", response_model=list[UserDocumentsResponse])
def get_all_user_documents(
    db: Session = Depends(get_session),
    role_check: None = Depends(role_required(["admin"])),
) -> list[UserDocumentsResponse]:
    return TradeChainService.get_all_documents_by_all_user(db=db)


@trade_chain_router.put("/document/{document_id}", response_model=Documents)
def update_document(
    document_id: int,
    file: UploadFile = File(...),
    doc_type: DocumentTypeChoices = Form(...),
    db: Session = Depends(get_session),
    user: Users = Depends(get_current_user),
    role_check: None = Depends(
        role_required(["bank", "admin", "corporate", "auditor"])
    ),
) -> Documents:
    return TradeChainService.edit_document(
        document_id=document_id,
        file=file,
        doc_type=doc_type,
        user=user,
        db=db,
    )


@trade_chain_router.delete(
    "/document/{document_id}", status_code=status.HTTP_204_NO_CONTENT
)
def delete_document(
    document_id: int,
    db: Session = Depends(get_session),
    user: Users = Depends(get_current_user),
    role_check: None = Depends(
        role_required(["bank", "admin", "corporate", "auditor"])
    ),
) -> None:
    TradeChainService.delete_document(
        document_id=document_id,
        user=user,
        db=db,
    )


@trade_chain_router.get("/all_documents", response_model=list[Documents])
def get_all_documents(db: Session = Depends(get_session)) -> list[Documents]:
    statement = select(Documents)
    results = db.exec(statement).all()
    return list(results)


@trade_chain_router.get("/all_users", response_model=list[Users])
def get_all_users(db: Session = Depends(get_session)) -> list[Users]:
    statement = select(Users)
    results = db.exec(statement).all()
    return list(results)
