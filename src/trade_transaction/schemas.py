"""Trade Transaction Schemas Module.

This module defines Pydantic models for trade transaction request validation
and response serialization. These schemas ensure data integrity and
provide automatic API documentation.

Classes:
    TradeTransactionCreate: Schema for creating new transactions.
    UpdateTransactionStatusRequest: Schema for status updates.
    BuyerResponse: Schema for buyer information in responses.
    SellerResponse: Schema for seller information in responses.
    TradeTransactionResponse: Schema for transaction API responses.
    TradeTransactionListResponse: Schema for paginated transaction lists.
"""

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field, field_validator

from src.db.enums import TransactionStatusChoices


class TradeTransactionCreate(BaseModel):
    """Schema for creating a new trade transaction.

    Validates incoming requests for transaction creation, ensuring
    all required fields are present and properly formatted.

    Attributes:
        buyer_id: ID of the user purchasing goods/services.
        seller_id: ID of the user selling goods/services.
        amount: Transaction amount (must be positive).
        currency: 3-letter ISO 4217 currency code (e.g., USD, EUR, GBP).
        status: Optional initial status (defaults to PENDING).

    Example:
        >>> transaction_data = TradeTransactionCreate(
        ...     buyer_id=1,
        ...     seller_id=2,
        ...     amount=50000.00,
        ...     currency="USD"
        ... )
    """

    buyer_id: int = Field(..., gt=0, description="Buyer user ID")
    seller_id: int = Field(..., gt=0, description="Seller user ID")
    amount: float = Field(
        ..., gt=0, description="Transaction amount (must be positive)"
    )
    currency: str = Field(
        ..., min_length=3, max_length=3, description="ISO 4217 currency code"
    )
    status: Optional[TransactionStatusChoices] = Field(
        default=TransactionStatusChoices.PENDING,
        description="Initial transaction status",
    )

    @field_validator("currency", mode="before")
    @classmethod
    def validate_currency_format(cls, v: str) -> str:
        """Ensure currency is uppercase and alphabetic.

        Args:
            v: Currency code to validate.

        Returns:
            str: Uppercase currency code.

        Raises:
            ValueError: If currency contains non-alphabetic characters.
        """
        if not v.isalpha():
            raise ValueError("Currency must contain only letters")
        return v.upper()

    model_config = {
        "json_schema_extra": {
            "example": {
                "buyer_id": 1,
                "seller_id": 2,
                "amount": 50000.00,
                "currency": "USD",
                "status": "pending",
            }
        }
    }


class UpdateTransactionStatusRequest(BaseModel):
    """Schema for updating transaction status.

    Used in PATCH requests to update a transaction's status.

    Attributes:
        status: The new status for the transaction.

    Example:
        >>> update_data = UpdateTransactionStatusRequest(
        ...     status=TransactionStatusChoices.IN_PROGRESS
        ... )
    """

    status: TransactionStatusChoices = Field(..., description="New transaction status")


class BuyerResponse(BaseModel):
    """Response schema for buyer information.

    Embedded within TradeTransactionResponse to provide buyer details.

    Attributes:
        id: Buyer's unique identifier.
        name: Buyer's display name.
        email: Buyer's email address.
        org_name: Buyer's organization name.
    """

    id: int = Field(..., description="Buyer user ID")
    name: str = Field(..., description="Buyer name")
    email: str = Field(..., description="Buyer email")
    org_name: str = Field(..., description="Buyer organization name")

    model_config = ConfigDict(from_attributes=True)


class SellerResponse(BaseModel):
    """Response schema for seller information.

    Embedded within TradeTransactionResponse to provide seller details.

    Attributes:
        id: Seller's unique identifier.
        name: Seller's display name.
        email: Seller's email address.
        org_name: Seller's organization name.
    """

    id: int = Field(..., description="Seller user ID")
    name: str = Field(..., description="Seller name")
    email: str = Field(..., description="Seller email")
    org_name: str = Field(..., description="Seller organization name")

    model_config = ConfigDict(from_attributes=True)


class TradeTransactionResponse(BaseModel):
    """Schema for trade transaction API responses.

    Represents a complete transaction record with buyer and seller details.
    Includes full transaction details with nested user information.

    Attributes:
        id: Unique transaction identifier.
        buyer_id: ID of the buyer user.
        seller_id: ID of the seller user.
        amount: Transaction amount.
        currency: ISO 4217 currency code.
        status: Current transaction status.
        created_at: When the transaction was created.
        updated_at: When the transaction was last updated.
        buyer: Full buyer information (optional).
        seller: Full seller information (optional).
    """

    id: int = Field(..., description="Unique transaction ID")
    buyer_id: int = Field(..., description="Buyer user ID")
    seller_id: int = Field(..., description="Seller user ID")
    amount: float = Field(..., description="Transaction amount")
    currency: str = Field(..., description="ISO 4217 currency code")
    status: TransactionStatusChoices = Field(..., description="Transaction status")
    created_at: datetime = Field(..., description="Creation timestamp")
    updated_at: datetime = Field(..., description="Last update timestamp")
    buyer: Optional[BuyerResponse] = Field(default=None, description="Buyer details")
    seller: Optional[SellerResponse] = Field(default=None, description="Seller details")

    model_config = ConfigDict(
        from_attributes=True,
        json_schema_extra={
            "example": {
                "id": 1,
                "buyer_id": 1,
                "seller_id": 2,
                "amount": 50000.00,
                "currency": "USD",
                "status": "pending",
                "created_at": "2026-01-12T10:30:00Z",
                "updated_at": "2026-01-12T10:30:00Z",
                "buyer": {
                    "id": 1,
                    "name": "John Doe",
                    "email": "john@company.com",
                    "org_name": "ABC Corp",
                },
                "seller": {
                    "id": 2,
                    "name": "Jane Smith",
                    "email": "jane@supplier.com",
                    "org_name": "XYZ Suppliers",
                },
            }
        },
    )


class TradeTransactionListResponse(BaseModel):
    """Schema for paginated transaction list responses.

    Used for list endpoints that return paginated results with
    metadata about the total count and pagination parameters.

    Attributes:
        total: Total number of transactions matching the query.
        transactions: List of transactions for the current page.
        skip: Number of records skipped.
        limit: Maximum records returned.
    """

    total: int = Field(..., description="Total number of transactions")
    transactions: list[TradeTransactionResponse] = Field(
        ..., description="List of transactions"
    )
    skip: int = Field(..., description="Number of records skipped")
    limit: int = Field(..., description="Maximum records returned")

    model_config = ConfigDict(
        json_schema_extra={
            "example": {"total": 10, "transactions": [], "skip": 0, "limit": 100}
        }
    )
