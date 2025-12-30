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
from pathlib import Path
from typing import List

from fastapi import UploadFile
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import selectinload
from sqlmodel import Session, select
from datetime import datetime

from src.db.enums import DocumentTypeChoices
from src.db.models import Documents, Users
from src.errors import (
    DupliacateDocument,
    DocumentNotFound,
    DocumentNotUploaded,
    InvalidDocumentFormat,
    DocumentUploadError,
    DocumentDeleteError,
)

from .schemas import DocumentBase, UserDocumentsResponse
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
    ) -> List[UserDocumentsResponse]:
        """Retrieve all users with their associated documents (admin view).

        Fetches all users from the database along with their documents
        using eager loading to avoid N+1 query issues. Intended for
        administrative dashboards.

        Args:
            db: SQLModel database session for database operations.

        Returns:
            List[UserDocumentsResponse]: List of users with their documents,
                each containing user id, name, email, and list of documents.

        Note:
            This endpoint should be restricted to admin users only.
            Uses selectinload for efficient eager loading of documents.
        """
        statement = select(Users).options(selectinload(Users.documents))  # type: ignore
        results = db.exec(statement).all()
        return [
            UserDocumentsResponse(
                id=user.id,  # type: ignore
                name=user.name,
                email=user.email,
                documents=[
                    DocumentBase.model_validate(doc) for doc in user.documents or []
                ],
            )
            for user in results
        ]

    @staticmethod
    def get_document_by_user(
        user: Users,
        db: Session,
    ) -> list[Documents]:
        """Retrieve all documents owned by a specific user.

        Fetches all documents from the database where the owner_id matches
        the provided user's ID.

        Args:
            user: The authenticated user whose documents are to be retrieved.
            db: SQLModel database session for database operations.

        Returns:
            list[Documents]: List of all Documents owned by the user.

        Raises:
            HTTPException: 404 if no documents are found for the user.

        Note:
            Returns all document types. Use additional filtering at the
            router level if specific document types are needed.
        """
        statement = select(Documents).where(Documents.owner_id == user.id)  # type: ignore
        document = db.exec(statement).all()
        if not document:
            raise DocumentNotFound()
        return list(document)

    @staticmethod
    def edit_document(
        document_id: int,
        file: UploadFile,
        doc_type: DocumentTypeChoices,
        db: Session,
    ) -> Documents:
        """Update an existing document's file owned by a specific user.

        Validates the new file, saves it to disk, updates the database record,
        and removes the old file from disk. Only the document owner can update
        their own documents.

        Args:
            document_id: The primary key ID of the document to update.
            file: The new uploaded file from the HTTP request.
            user: The authenticated user requesting the update.
            db: SQLModel database session for database operations.
        Returns:
            Documents: The updated Documents record.
        Raises:
            HTTPException: 404 if document not found or not owned by user.
            HTTPException: 400 if no file selected or invalid file extension.
            HTTPException: 500 if file upload or database update fails.
        """
        if not file.filename:
            raise DocumentNotUploaded()

        if not file_validator.validate_file_extension(file):
            raise InvalidDocumentFormat()

        statement = select(Documents).where(Documents.id == document_id)
        document = db.exec(statement).first()
        if not document:
            raise DocumentNotFound()

        unique_filename = f"{uuid.uuid4()}_{file.filename}"
        destination = UPLOAD_FOLDER / unique_filename

        try:
            with open(destination, "wb") as buffer:
                shutil.copyfileobj(file.file, buffer)

            old_file_path = Path(document.file_url)

            document.file_url = str(destination)
            document.doc_type = doc_type
            document.hash = generate_document_hash(str(destination))

            db.add(document)
            db.commit()
            db.refresh(document)

            if old_file_path.exists():
                old_file_path.unlink(missing_ok=True)

            return document

        except Exception as e:
            if destination.exists():
                destination.unlink(missing_ok=True)
            raise DocumentUploadError() from e

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
        try:
            statement = select(Documents).where(Documents.id == document_id)
            document = db.exec(statement).first()
            if not document:
                raise DocumentNotFound()

            file_path = Path(document.file_url)
            if file_path.exists():
                file_path.unlink(missing_ok=True)

            db.delete(document)
            db.commit()
            return None
        except SQLAlchemyError as e:
            db.rollback()
            raise DocumentDeleteError() from e
