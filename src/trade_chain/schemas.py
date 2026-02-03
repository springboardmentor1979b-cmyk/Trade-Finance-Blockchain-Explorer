"""Trade Chain Schemas Module.

This module defines Pydantic models for trade document request validation
and response serialization. These schemas ensure data integrity and
provide automatic API documentation.

Classes:
    DocumentUpdate: Schema for updating document type.
    DocumentBase: Base schema for document responses.
    DocumentListResponse: Paginated list response for documents.
    UserDocumentsResponse: Schema for user with documents response.
"""

from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field

from src.db.enums import DocumentTypeChoices


class DocumentUpdate(BaseModel):
    """Schema for updating a document's type.

    Used to validate incoming requests when updating document type.
    Only the document type can be changed; file content is immutable.

    Attributes:
        doc_type: The new document type to set.

    Example:
        >>> update_data = DocumentUpdate(
        ...     doc_type=DocumentTypeChoices.INVOICE
        ... )
    """

    doc_type: DocumentTypeChoices = Field(
        ..., description="New document type (letter_of_credit, invoice, etc.)"
    )

    model_config = ConfigDict(from_attributes=True)


class DocumentBase(BaseModel):
    """Base schema for document responses.

    Represents a complete document record with all metadata.
    Used in API responses and nested within UserDocumentsResponse.

    Attributes:
        id: Unique identifier of the document.
        doc_type: Type of the document.
        doc_number: Human-readable document number (UUID).
        file_url: Path to the stored file on disk.
        hash: SHA-256 hash of the file for duplicate detection.
        owner_id: ID of the user who owns the document.
        issued_at: When the document was officially issued.
        created_at: When the document was uploaded to the system.

    Example:
        >>> doc = DocumentBase(
        ...     id=1,
        ...     doc_type="invoice",
        ...     doc_number="abc-123",
        ...     file_url="uploads/documents/file.pdf",
        ...     hash="sha256hash...",
        ...     owner_id=5,
        ...     issued_at=datetime.now(),
        ...     created_at=datetime.now()
        ... )
    """

    id: int = Field(..., description="Unique document ID")
    doc_type: str = Field(..., description="Document type")
    doc_number: str = Field(..., description="Human-readable document number")
    file_url: str = Field(..., description="Path to stored file")
    hash: str = Field(..., description="SHA-256 hash for duplicate detection")
    owner_id: int = Field(..., description="ID of the document owner")
    issued_at: datetime = Field(..., description="Document issuance date")
    created_at: datetime = Field(..., description="Upload timestamp")

    model_config = ConfigDict(from_attributes=True)


class DocumentListResponse(BaseModel):
    """Paginated list response for documents.

    Used for API responses that return paginated document lists,
    including total count and pagination metadata.

    Attributes:
        total: Total number of documents matching the query.
        documents: List of documents for the current page.
        skip: Number of records skipped (offset).
        limit: Maximum number of records returned per page.

    Example:
        >>> response = DocumentListResponse(
        ...     total=100,
        ...     documents=[...],
        ...     skip=0,
        ...     limit=25
        ... )
    """

    total: int = Field(..., description="Total number of documents")
    documents: list[DocumentBase] = Field(..., description="List of documents")
    skip: int = Field(..., description="Number of records skipped")
    limit: int = Field(..., description="Maximum records returned")

    model_config = ConfigDict(from_attributes=True)


class UserDocumentsResponse(BaseModel):
    """Schema for user with documents response.

    Used for admin views that display users along with their
    associated documents.

    Attributes:
        id: User's unique identifier.
        email: User's email address.
        name: User's display name.
        documents: List of documents owned by the user.

    Example:
        >>> response = UserDocumentsResponse(
        ...     id=5,
        ...     email="user@example.com",
        ...     name="John Doe",
        ...     documents=[...]
        ... )
    """

    id: int = Field(..., description="User ID")
    email: str = Field(..., description="User email address")
    name: str = Field(..., description="User display name")
    documents: list[DocumentBase] = Field(..., description="List of user's documents")

    model_config = ConfigDict(from_attributes=True)
