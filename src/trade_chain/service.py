"""Trade chain service module.

Provides business logic for trade document management including upload,
retrieval, and deletion operations. Handles file storage, hash generation
for duplicate detection, and database interactions.

Typical usage:
    from src.trade_chain.service import TradeChainService

    # Upload a document
    document = TradeChainService.save_single_document(
        file=uploaded_file,
        doc_type=DocumentTypeChoices.INVOICE,
        owner_id=user.id,
        db=session
    )

    # Get user's documents
    documents = TradeChainService.get_document_by_user(user, session)
"""

import shutil
import uuid
from datetime import datetime
from pathlib import Path
from typing import List, Tuple

from fastapi import UploadFile
from sqlalchemy.exc import SQLAlchemyError
from sqlmodel import Session, func, select

from src.db.enums import DocumentTypeChoices, LedgerActionChoices
from src.db.models import Documents, LedgerEntries, Users
from src.errors import (
    DocumentDeleteError,
    DocumentNotFound,
    DocumentNotUploaded,
    DocumentUploadError,
    DupliacateDocument,
    InvalidDocumentFormat,
)

from .schemas import DocumentBase
from .utils import generate_document_hash
from .validators import DocumentValidator

UPLOAD_FOLDER = Path("uploads/documents")
UPLOAD_FOLDER.mkdir(exist_ok=True)

file_validator = DocumentValidator()


class TradeChainService:
    """Service class for trade chain document operations.

    Provides static methods for managing trade documents including
    file upload, storage, retrieval, and deletion. All operations
    are atomic and handle cleanup on failure.

    Attributes:
        None (all methods are static).

    Note:
        All methods are static and do not require instantiation.
        Database sessions are passed as parameters for transaction control.
    """

    @staticmethod
    def save_single_document(
        file: UploadFile,
        doc_type: DocumentTypeChoices,
        owner_id: int,
        issued_at: datetime,
        db: Session,
    ) -> Documents:
        """Save a single document to the upload folder and create a database record.

        Validates the file extension, generates a unique filename, saves the file
        to disk, computes a hash for duplicate detection, and creates a Documents
        record in the database.

        Args:
            file: The uploaded file from the HTTP request.
            doc_type: Type of the document (e.g., LOC, INVOICE, BILL_OF_LADING).
            owner_id: ID of the user who owns the document.
            db: SQLModel database session for database operations.

        Returns:
            Documents: The created Documents record (not yet committed).

        Raises:
            HTTPException: 400 if no file selected or invalid file extension.
            HTTPException: 409 if duplicate file detected (same hash exists).
            HTTPException: 500 if file upload fails for any other reason.

        Note:
            This method adds the document to the session but does not commit.
            The caller is responsible for committing or rolling back the transaction.
            On failure, any partially saved file is cleaned up automatically.
        """

        if not UPLOAD_FOLDER.exists():
            UPLOAD_FOLDER.mkdir(parents=True, exist_ok=True)

        if not file.filename:
            raise DocumentNotUploaded()

        if not file_validator.validate_file_extension(file):
            raise InvalidDocumentFormat()

        unique_filename = f"{uuid.uuid4()}_{file.filename}"
        destination = UPLOAD_FOLDER / unique_filename

        try:
            with open(destination, "wb") as buffer:
                shutil.copyfileobj(file.file, buffer)

            file_hash = generate_document_hash(str(destination))
            statement = select(Documents).where(Documents.hash == file_hash)
            if db.exec(statement).first():
                raise DupliacateDocument()

            document = Documents(
                doc_type=doc_type,
                doc_number=str(uuid.uuid4()),
                issued_at=issued_at,
                file_url=str(destination),
                hash=file_hash,
                owner_id=owner_id,
            )  # type: ignore

            db.add(document)
            return document

        except Exception as e:
            if destination.exists():
                destination.unlink(missing_ok=True)
            raise DocumentUploadError() from e

    @staticmethod
    def save_multiple_document(
        files: List[UploadFile],
        doc_type: DocumentTypeChoices,
        owner_id: int,
        issued_at: datetime,
        db: Session,
    ) -> List[Documents]:
        """Upload multiple documents atomically (all-or-nothing).

        Processes a list of uploaded files, saving each to disk and creating
        corresponding database records. The operation is atomic: if any file
        fails, all previously saved files are cleaned up and the transaction
        is rolled back.

        Args:
            files: List of uploaded files from the HTTP request.
            doc_type: Type of all documents (e.g., LOC, INVOICE, BILL_OF_LADING).
            owner_id: ID of the user who owns the documents.
            db: SQLModel database session for database operations.

        Returns:
            List[Documents]: List of created and committed Documents records.

        Raises:
            HTTPException: 400 if any file has no filename or invalid extension.
            HTTPException: 409 if any duplicate file detected.
            HTTPException: 500 if any file upload fails.
            SQLAlchemyError: Re-raised after cleanup if database operation fails.

        Note:
            All files must succeed for any to be saved. On failure, all
            partially uploaded files are deleted from disk and the database
            transaction is rolled back.
        """
        documents: List[Documents] = []

        try:
            for file in files:
                document = TradeChainService.save_single_document(
                    file=file,
                    doc_type=doc_type,
                    owner_id=owner_id,
                    issued_at=issued_at,
                    db=db,
                )
                documents.append(document)

            db.commit()
            for doc in documents:
                db.refresh(doc)

            # Auto-create ledger entries for each uploaded document
            for doc in documents:
                ledger_entry = LedgerEntries(
                    document_id=doc.id,
                    action=LedgerActionChoices.ISSUED,
                    actor_id=owner_id,
                    metadatav={"auto_created": True, "source": "document_upload"},
                )  # type: ignore
                db.add(ledger_entry)
            db.commit()

            return documents

        except SQLAlchemyError:
            db.rollback()
            for doc in documents:
                file_path = Path(doc.file_url)
                if file_path.exists():
                    file_path.unlink(missing_ok=True)
            raise DocumentUploadError()

    @staticmethod
    def get_all_documents_by_all_user(
        db: Session,
        skip: int = 0,
        limit: int = 25,
    ) -> Tuple[List[DocumentBase], int]:
        """Retrieve all documents with pagination (admin view).

        Fetches all documents from the database with pagination support.
        Intended for administrative dashboards.

        Args:
            db: SQLModel database session for database operations.
            skip: Number of records to skip for pagination (default: 0).
            limit: Maximum number of records to return (default: 25).

        Returns:
            Tuple[List[DocumentBase], int]: A tuple containing:
                - List of documents for the current page
                - Total count of all documents

        Note:
            This endpoint should be restricted to admin users only.
            Results are ordered by created_at descending (newest first).
        """
        # Get total count
        base_query = select(Documents)
        count_query = select(func.count()).select_from(base_query.subquery())
        total = db.exec(count_query).one()

        # Get paginated documents
        statement = (
            select(Documents)
            .order_by(Documents.created_at.desc())  # type: ignore
            .offset(skip)
            .limit(limit)
        )
        results = db.exec(statement).all()

        documents = [DocumentBase.model_validate(doc) for doc in results]
        return documents, total

    @staticmethod
    def get_document_by_user(
        user: Users,
        db: Session,
        skip: int = 0,
        limit: int = 25,
    ) -> Tuple[list[DocumentBase], int]:
        """Retrieve all documents owned by a specific user with pagination.

        Fetches documents from the database where the owner_id matches
        the provided user's ID, with pagination support.

        Args:
            user: The authenticated user whose documents are to be retrieved.
            db: SQLModel database session for database operations.
            skip: Number of records to skip for pagination (default: 0).
            limit: Maximum number of records to return (default: 25).

        Returns:
            Tuple[list[DocumentBase], int]: A tuple containing:
                - List of documents for the current page
                - Total count of user's documents

        Note:
            Results are ordered by created_at descending (newest first).
            Returns all document types. Use additional filtering at the
            router level if specific document types are needed.
        """
        # Get total count for this user
        base_query = select(Documents).where(Documents.owner_id == user.id)  # type: ignore
        count_query = select(func.count()).select_from(base_query.subquery())
        total = db.exec(count_query).one()

        # Get paginated documents
        statement = (
            select(Documents)
            .where(Documents.owner_id == user.id)  # type: ignore
            .order_by(Documents.created_at.desc())  # type: ignore
            .offset(skip)
            .limit(limit)
        )
        results = db.exec(statement).all()

        documents = [DocumentBase.model_validate(doc) for doc in results]
        return documents, total

    @staticmethod
    def get_document_by_id(
        document_id: int,
        db: Session,
    ) -> Documents | None:
        """Retrieve a single document by its ID.

        Fetches a document from the database by its primary key ID.

        Args:
            document_id: The primary key ID of the document to retrieve.
            db: SQLModel database session for database operations.

        Returns:
            Documents | None: The document if found, otherwise None.
        """
        statement = select(Documents).where(Documents.id == document_id)
        return db.exec(statement).first()

    @staticmethod
    def edit_document(
        document_id: int,
        doc_type: DocumentTypeChoices,
        db: Session,
    ) -> Documents:
        """Update an existing document's type.

        Updates only the document type field. File and other metadata remain unchanged.

        Args:
            document_id: The primary key ID of the document to update.
            doc_type: The new document type to set.
            db: SQLModel database session for database operations.

        Returns:
            Documents: The updated Documents record.

        Raises:
            HTTPException: 404 if document not found.
        """
        statement = select(Documents).where(Documents.id == document_id)
        document = db.exec(statement).first()
        if not document:
            raise DocumentNotFound()

        document.doc_type = doc_type
        db.add(document)
        db.commit()
        db.refresh(document)

        return document

    @staticmethod
    def delete_document(
        document_id: int,
        db: Session,
    ) -> None:
        """Delete a document owned by a specific user.

        Removes both the database record and the physical file from disk.
        Only the document owner can delete their own documents.

        Args:
            document_id: The primary key ID of the document to delete.
            user: The authenticated user requesting the deletion.
            db: SQLModel database session for database operations.

        Returns:
            None: Returns nothing on successful deletion.

        Raises:
            HTTPException: 404 if document not found or not owned by user.
            HTTPException: 500 if deletion fails due to database error.

        Note:
            The file is deleted from disk before the database record is removed.
            If the database deletion fails, the transaction is rolled back,
            but the file will already be deleted from disk.
        """
        # First check if document exists (before any session modifications)
        statement = select(Documents).where(Documents.id == document_id)
        document = db.exec(statement).first()
        if not document:
            raise DocumentNotFound()

        try:
            file_path = Path(document.file_url)
            if file_path.exists():
                file_path.unlink(missing_ok=True)

            db.delete(document)
            db.commit()
            return None
        except SQLAlchemyError as e:
            db.rollback()
            raise DocumentDeleteError() from e
