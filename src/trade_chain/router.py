"""Trade Chain API Router.

This module defines the FastAPI router for trade document management endpoints.
It provides endpoints for uploading, retrieving, updating, and deleting
trade documents such as Letters of Credit, Invoices, and Bills of Lading.

Endpoints:
    POST /upload: Upload single or multiple documents (Bank, Corporate)
    GET /document: Get current user's documents (Bank, Corporate)
    GET /documents: Get all users' documents (Admin, Auditor)
    PUT /document/{document_id}: Update document type (Admin, Auditor)
    DELETE /document/{document_id}: Delete a document (Admin, Auditor)

Permissions:
    - CREATE: Bank, Corporate
    - READ (own): Bank, Corporate
    - READ (all): Admin, Auditor
    - UPDATE: Admin, Auditor
    - DELETE: Admin, Auditor

Note:
    Bank and Corporate users who need to edit or delete their documents
    must contact an Admin or Auditor to perform the operation.
"""

from datetime import datetime

from fastapi import APIRouter, Depends, File, Form, UploadFile, status
from sqlmodel import Session

from src.audit_logs.service import log_action
from src.Auth.dependency import get_current_user, role_required
from src.db.database import get_session
from src.db.enums import DocumentTypeChoices
from src.db.models import Documents, Users

from .schemas import DocumentUpdate, UserDocumentsResponse
from .service import TradeChainService

trade_chain_router = APIRouter()


@trade_chain_router.post("/upload")
def upload_single_multiple_document(
    files: list[UploadFile] = File(...),
    doc_type: DocumentTypeChoices = Form(...),
    issued_at: datetime = Form(...),
    db: Session = Depends(get_session),
    user: Users = Depends(get_current_user),
    role_check: None = Depends(role_required(["bank", "corporate"])),
) -> list[Documents]:
    """Upload single or multiple documents.

    Accepts one or more files and creates document records in the database.
    Automatically creates a ledger entry with "ISSUED" action for each
    document upon successful upload.

    Args:
        files: List of files to upload (supports multiple files).
        doc_type: Type of document (letter_of_credit, invoice, bill_of_lading, etc.).
        issued_at: The issuance date of the document.
        db: Database session (injected).
        user: Current authenticated user (injected).
        role_check: Role validation ensuring bank/corporate access (injected).

    Returns:
        list[Documents]: List of created document records.

    Raises:
        HTTPException (400): If no file selected or invalid file extension.
        HTTPException (401): If user is not authenticated.
        HTTPException (403): If user is not a bank or corporate user.
        HTTPException (409): If duplicate file detected (same hash exists).
        HTTPException (500): If file upload fails.

    Note:
        The upload is atomic - if any file fails, all files are rolled back.
        Supported file extensions are validated by the DocumentValidator.
    """
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
    role_check: None = Depends(role_required(["bank", "corporate"])),
) -> list[Documents]:
    """Retrieve documents for the current user.

    Returns all documents owned by the currently authenticated user.
    Bank and Corporate users can only see their own documents.

    Args:
        db: Database session (injected).
        user: Current authenticated user (injected).
        role_check: Role validation ensuring bank/corporate access (injected).

    Returns:
        list[Documents]: List of documents owned by the current user.

    Raises:
        HTTPException (401): If user is not authenticated.
        HTTPException (403): If user is not a bank or corporate user.
        HTTPException (404): If no documents found for the user.
    """
    return TradeChainService.get_document_by_user(
        user=user,
        db=db,
    )


@trade_chain_router.get("/documents", response_model=list[UserDocumentsResponse])
def get_all_user_documents(
    db: Session = Depends(get_session),
    role_check: None = Depends(role_required(["admin", "auditor"])),
) -> list[UserDocumentsResponse]:
    """Retrieve all users with their documents (Admin view).

    Returns all users in the system along with their associated documents.
    Intended for administrative dashboards and audit purposes.

    Args:
        db: Database session (injected).
        role_check: Role validation ensuring admin/auditor access (injected).

    Returns:
        list[UserDocumentsResponse]: List of users with their documents.

    Raises:
        HTTPException (401): If user is not authenticated.
        HTTPException (403): If user is not an admin or auditor.
    """
    return TradeChainService.get_all_documents_by_all_user(db=db)


@trade_chain_router.put("/document/{document_id}", response_model=Documents)
def update_document(
    document_id: int,
    update_data: DocumentUpdate,
    db: Session = Depends(get_session),
    user: Users = Depends(get_current_user),
    role_check: None = Depends(role_required(["admin", "auditor"])),
) -> Documents:
    """Update a document's type.

    Updates the document type of an existing document. Only the document
    type can be changed; the file itself remains unchanged.
    This operation is logged in the audit trail.

    Args:
        document_id: ID of the document to update.
        update_data: JSON body containing the new doc_type.
        db: Database session (injected).
        user: Current authenticated user (injected).
        role_check: Role validation ensuring admin/auditor access (injected).

    Returns:
        Documents: The updated document record.

    Raises:
        HTTPException (401): If user is not authenticated.
        HTTPException (403): If user is not an admin or auditor.
        HTTPException (404): If document not found.
    """
    result = TradeChainService.edit_document(
        document_id=document_id,
        doc_type=update_data.doc_type,
        db=db,
    )
    # Log the action (after edit_document commits, we add new entry and commit again)
    log_action(db, user.id, "UPDATE", "document", str(document_id))  # type: ignore
    db.commit()
    return result


@trade_chain_router.delete(
    "/document/{document_id}", status_code=status.HTTP_204_NO_CONTENT
)
def delete_document(
    document_id: int,
    db: Session = Depends(get_session),
    user: Users = Depends(get_current_user),
    role_check: None = Depends(role_required(["admin", "auditor"])),
) -> None:
    """Delete a document by its ID.

    Removes both the database record and the physical file from disk.
    This operation is logged in the audit trail for compliance purposes.

    Args:
        document_id: ID of the document to delete.
        db: Database session (injected).
        user: Current authenticated user (injected).
        role_check: Role validation ensuring admin/auditor access (injected).

    Raises:
        HTTPException (401): If user is not authenticated.
        HTTPException (403): If user is not an admin or auditor.
        HTTPException (404): If document not found.
        HTTPException (500): If deletion fails due to database error.
    """
    # Delete the document (service handles commit)
    # Audit log is added before commit inside the service transaction
    TradeChainService.delete_document(
        document_id=document_id,
        db=db,
    )
    # Log the action after successful deletion
    log_action(db, user.id, "DELETE", "document", str(document_id))  # type: ignore
    db.commit()
