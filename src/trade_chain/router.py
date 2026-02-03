"""Trade Chain API Router.

This module defines the FastAPI router for trade document management endpoints.
It provides endpoints for uploading, retrieving, updating, downloading, and deleting
trade documents such as Letters of Credit, Invoices, and Bills of Lading.

Endpoints:
    POST /upload: Upload single or multiple documents (Bank, Corporate)
    GET /document: Get current user's documents (Bank, Corporate)
    GET /documents: Get all users' documents (Admin, Auditor)
    GET /document/{document_id}/download: Download a document file (Bank, Corporate own; Admin, Auditor all)
    PUT /document/{document_id}: Update document type (Admin, Auditor)
    DELETE /document/{document_id}: Delete a document (Admin, Auditor)

Permissions:
    - CREATE: Bank, Corporate
    - READ (own): Bank, Corporate
    - READ (all): Admin, Auditor
    - DOWNLOAD (own): Bank, Corporate
    - DOWNLOAD (all): Admin, Auditor
    - UPDATE: Admin, Auditor
    - DELETE: Admin, Auditor

Note:
    Bank and Corporate users who need to edit or delete their documents
    must contact an Admin or Auditor to perform the operation.
"""

import mimetypes
from datetime import datetime
from pathlib import Path

from fastapi import APIRouter, Depends, File, Form, Query, UploadFile, status
from fastapi.responses import FileResponse
from sqlmodel import Session

from src.audit_logs.service import log_action
from src.Auth.dependency import get_current_user, role_required
from src.db.database import get_session
from src.db.enums import DocumentTypeChoices
from src.db.models import Documents, Users
from src.errors import DocumentNotFound

from .schemas import DocumentListResponse, DocumentUpdate
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


@trade_chain_router.get("/document", response_model=DocumentListResponse)
def get_document_by_user(
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(
        25, ge=1, le=100, description="Maximum number of records to return"
    ),
    db: Session = Depends(get_session),
    user: Users = Depends(get_current_user),
    role_check: None = Depends(role_required(["bank", "corporate"])),
) -> DocumentListResponse:
    """Retrieve documents for the current user with pagination.

    Returns paginated documents owned by the currently authenticated user.
    Bank and Corporate users can only see their own documents.

    Args:
        skip: Number of records to skip for pagination (default: 0).
        limit: Maximum records to return (default: 25, max: 100).
        db: Database session (injected).
        user: Current authenticated user (injected).
        role_check: Role validation ensuring bank/corporate access (injected).

    Returns:
        DocumentListResponse: Paginated list of documents with total count.

    Raises:
        HTTPException (401): If user is not authenticated.
        HTTPException (403): If user is not a bank or corporate user.
    """
    documents, total = TradeChainService.get_document_by_user(
        user=user,
        db=db,
        skip=skip,
        limit=limit,
    )
    return DocumentListResponse(
        total=total, documents=documents, skip=skip, limit=limit
    )


@trade_chain_router.get("/documents", response_model=DocumentListResponse)
def get_all_user_documents(
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(
        25, ge=1, le=100, description="Maximum number of records to return"
    ),
    db: Session = Depends(get_session),
    role_check: None = Depends(role_required(["admin", "auditor"])),
) -> DocumentListResponse:
    """Retrieve all documents with pagination (Admin view).

    Returns all documents in the system with pagination support.
    Intended for administrative dashboards and audit purposes.

    Args:
        skip: Number of records to skip for pagination (default: 0).
        limit: Maximum records to return (default: 25, max: 100).
        db: Database session (injected).
        role_check: Role validation ensuring admin/auditor access (injected).

    Returns:
        DocumentListResponse: Paginated list of documents with total count.

    Raises:
        HTTPException (401): If user is not authenticated.
        HTTPException (403): If user is not an admin or auditor.
    """
    documents, total = TradeChainService.get_all_documents_by_all_user(
        db=db, skip=skip, limit=limit
    )
    return DocumentListResponse(
        total=total, documents=documents, skip=skip, limit=limit
    )


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


@trade_chain_router.get("/document/{document_id}/download")
def download_document(
    document_id: int,
    db: Session = Depends(get_session),
    user: Users = Depends(get_current_user),
    role_check: None = Depends(role_required(["bank", "corporate"])),
) -> FileResponse:
    """Download a document file by its ID.

    Returns the actual file for download. Bank and Corporate users can only
    download their own documents. Admin and Auditor users can download any document.

    Args:
        document_id: ID of the document to download.
        db: Database session (injected).
        user: Current authenticated user (injected).
        role_check: Role validation ensuring authenticated access (injected).

    Returns:
        FileResponse: The document file as a downloadable attachment.

    Raises:
        HTTPException (401): If user is not authenticated.
        HTTPException (403): If user doesn't have permission to download this document.
        HTTPException (404): If document not found or file doesn't exist on disk.
    """
    document = TradeChainService.get_document_by_id(document_id, db)

    if not document:
        raise DocumentNotFound()

    file_path = Path(document.file_url)
    if not file_path.exists():
        raise DocumentNotFound()

    stored_filename = file_path.name
    original_filename = (
        "_".join(stored_filename.split("_")[1:])
        if "_" in stored_filename
        else stored_filename
    )

    # Log the download action
    log_action(db, user.id, "DOWNLOAD", "document", str(document_id))  # type: ignore
    db.commit()

    # Detect MIME type from file extension
    mime_type, _ = mimetypes.guess_type(original_filename)
    if not mime_type:
        mime_type = "application/octet-stream"

    return FileResponse(
        path=str(file_path),
        filename=original_filename,
        media_type=mime_type,
    )
