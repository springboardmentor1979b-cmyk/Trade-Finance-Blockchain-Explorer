from src.db.models import Documents, Users
from pathlib import Path
import shutil
from typing import List
import uuid
from fastapi import HTTPException, UploadFile
from sqlmodel import Session, select
from .utils import generate_document_hash
from .validators import DocumentValidator
from src.db.enums import DocumentTypeChoices
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import selectinload
from .schemas import UserDocumentsResponse, DocumentBase


UPLOAD_FOLDER = Path("uploads/documents")
UPLOAD_FOLDER.mkdir(exist_ok=True)

file_validator = DocumentValidator()


class TradeChainService:
    @staticmethod
    def save_single_document(
        file: UploadFile, doc_type: DocumentTypeChoices, owner_id: int, db: Session
    ) -> Documents:
        """Saves a document to the upload folder and creates a Documents record.

        Args:
            file_path: Path to the file to be saved.
            doc_type: Type of the document.
            doc_number: Unique document reference number.
            owner_id: ID of the user owning the document.

        Returns:
            Documents: The created Documents record.
        """

        if not UPLOAD_FOLDER.exists():
            UPLOAD_FOLDER.mkdir(parents=True, exist_ok=True)

        if not file.filename:
            raise HTTPException(status_code=400, detail="No file selected.")

        if not file_validator.validate_file_extension(file):
            raise HTTPException(status_code=400, detail="Invalid file extension.")

        unique_filename = f"{uuid.uuid4()}_{file.filename}"
        destination = UPLOAD_FOLDER / unique_filename

        try:
            with open(destination, "wb") as buffer:
                shutil.copyfileobj(file.file, buffer)

            file_hash = generate_document_hash(str(destination))
            statement = select(Documents).where(Documents.hash == file_hash)
            if db.exec(statement).first():
                raise HTTPException(
                    status_code=409, detail="Duplicate file upload detected."
                )

            document = Documents(
                doc_type=doc_type,
                doc_number=str(uuid.uuid4()),
                file_url=str(destination),
                hash=file_hash,
                owner_id=owner_id,
            )  # type: ignore

            db.add(document)
            return document

        except Exception as e:
            if destination.exists():
                destination.unlink(missing_ok=True)
            raise HTTPException(status_code=500, detail=f"File upload failed: {str(e)}")

    @staticmethod
    def save_multiple_document(
        files: List[UploadFile],
        doc_type: DocumentTypeChoices,
        owner_id: int,
        db: Session,
    ) -> List[Documents]:
        """
        Uploads multiple documents and creates their corresponding records
        atomically (all-or-nothing).
        """
        documents: List[Documents] = []

        try:
            for file in files:
                document = TradeChainService.save_single_document(
                    file=file,
                    doc_type=doc_type,
                    owner_id=owner_id,
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
            raise

    @staticmethod
    def get_all_documents_by_all_user(
        db: Session,
    ) -> List[UserDocumentsResponse]:
        """Retrieve all documents owned by a specific user.

        Args:
            db (Session): The database session.

        Returns:
            List[Documents]: A list of Documents owned by the user.
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
        """Retrieve a document owned by a specific user.

        Args:
            user (Users): The user whose document is to be retrieved.
            db (Session): The database session.

        Returns:
            Documents: The document owned by the user.
        """
        statement = select(Documents).where(Documents.owner_id == user.id)  # type: ignore
        document = db.exec(statement).all()
        if not document:
            raise HTTPException(status_code=404, detail="Document not found.")
        return list(document)

    @staticmethod
    def delete_document(
        document_id: int,
        user: Users,
        db: Session,
    ) -> None:
        """Deletes a document owned by a specific user.

        Args:
            document_id (int): The ID of the document to be deleted.
            user (Users): The user requesting the deletion.
            db (Session): The database session.

        Returns:
            None
        """
        try:
            statement = select(Documents).where(
                Documents.id == document_id,
                Documents.owner_id == user.id,  # type: ignore
            )
            document = db.exec(statement).first()
            if not document:
                raise HTTPException(status_code=404, detail="Document not found.")

            file_path = Path(document.file_url)
            if file_path.exists():
                file_path.unlink(missing_ok=True)

            db.delete(document)
            db.commit()
            return None
        except SQLAlchemyError as e:
            db.rollback()
            raise HTTPException(status_code=500, detail=f"Deletion failed: {str(e)}")
