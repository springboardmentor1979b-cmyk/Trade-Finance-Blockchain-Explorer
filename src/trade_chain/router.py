from datetime import datetime

from fastapi import APIRouter, Depends, File, Form, UploadFile, status
from sqlmodel import Session

from src.audit_logs.service import log_action
from src.Auth.dependency import get_current_user, role_required
from src.db.database import get_session
from src.db.enums import DocumentTypeChoices
from src.db.models import Documents, Users

from .schemas import UserDocumentsResponse
from .service import TradeChainService

trade_chain_router = APIRouter()


"""
endpoint for uploading single or multiple documents
"""


@trade_chain_router.post("/upload")
def upload_single_multiple_document(
    files: list[UploadFile] = File(...),
    doc_type: DocumentTypeChoices = Form(...),
    issued_at: datetime = Form(...),
    db: Session = Depends(get_session),
    user: Users = Depends(get_current_user),
    role_check: None = Depends(role_required(["bank", "corporate"])),
) -> list[Documents]:
    return TradeChainService.save_multiple_document(
        files=files,
        doc_type=doc_type,
        owner_id=user.id,  # type: ignore
        issued_at=issued_at,
        db=db,
    )


"""BANK AND CORPORATE CAN SEE ONLY THEIR DOCUMENTS"""


@trade_chain_router.get("/document", response_model=list[Documents])
def get_document_by_user(
    db: Session = Depends(get_session),
    user: Users = Depends(get_current_user),
    role_check: None = Depends(role_required(["bank", "corporate"])),
) -> list[Documents]:
    return TradeChainService.get_document_by_user(
        user=user,
        db=db,
    )


"""ADMIN AND AUDITOR CAN SEE ALL USERS DOCUMENTS"""


@trade_chain_router.get("/documents", response_model=list[UserDocumentsResponse])
def get_all_user_documents(
    db: Session = Depends(get_session),
    role_check: None = Depends(role_required(["admin", "auditor"])),
) -> list[UserDocumentsResponse]:
    return TradeChainService.get_all_documents_by_all_user(db=db)


"""ADMIN AND AUDITOR CAN UPDATE ANY USER'S DOCUMENT"""


@trade_chain_router.put("/document/{document_id}", response_model=Documents)
def update_document(
    document_id: int,
    file: UploadFile = File(...),
    doc_type: DocumentTypeChoices = Form(...),
    db: Session = Depends(get_session),
    user: Users = Depends(get_current_user),
    role_check: None = Depends(role_required(["admin", "auditor"])),
) -> Documents:
    result = TradeChainService.edit_document(
        document_id=document_id,
        file=file,
        doc_type=doc_type,
        db=db,
    )
    # Log the action (after edit_document commits, we add new entry and commit again)
    log_action(db, user.id, "UPDATE", "document", str(document_id))  # type: ignore
    db.commit()
    return result


"""ADMIN AND AUDITOR CAN DELETE ANY USER'S DOCUMENT"""


@trade_chain_router.delete(
    "/document/{document_id}", status_code=status.HTTP_204_NO_CONTENT
)
def delete_document(
    document_id: int,
    db: Session = Depends(get_session),
    user: Users = Depends(get_current_user),
    role_check: None = Depends(role_required(["admin", "auditor"])),
) -> None:
    # Delete the document (service handles commit)
    # Audit log is added before commit inside the service transaction
    TradeChainService.delete_document(
        document_id=document_id,
        db=db,
    )
    # Log the action after successful deletion
    log_action(db, user.id, "DELETE", "document", str(document_id))  # type: ignore
    db.commit()


"""
CRUD operations for trade chain documents and user management.

create => BANK, CORPORATE
read => BANK,CORPORATE(ONLY THEIR OWN), ADMIN, AUDITOR(ALL USERS)
update => ADMIN,AUDITOR
delete => ADMIN,AUDITOR

- if bank or corporate wants to edit or delete their documents they have to contact admin or auditor.
- Admin and auditor can edit or delete any user's document.
- All users can see their own documents.
- Admin and auditor can see all users and their documents.
"""
