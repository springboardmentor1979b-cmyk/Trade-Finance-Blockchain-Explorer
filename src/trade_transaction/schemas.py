from pydantic import BaseModel, ConfigDict, Field, validator
from src.db.enums import TransactionStatusChoices
from datetime import datetime
from typing import Optional


class TransactionResponse(BaseModel):
    """Schema for returning transaction details."""

    id: int
    amount: float
    currency: str
    status: TransactionStatusChoices
    buyer_id: int
    seller_id: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class TradeTransactionCreate(BaseModel):
    """Schema for creating a new trade transaction.

    Attributes:
        buyer_id: ID of the user purchasing goods/services.
        seller_id: ID of the user selling goods/services.
        amount: Transaction amount (must be positive).
        currency: 3-letter ISO currency code (e.g., USD, EUR, GBP).
        status: Optional initial status (defaults to PENDING).
    """

    buyer_id: int = Field(..., gt=0, description="Buyer user ID")
    seller_id: int = Field(..., gt=0, description="Seller user ID")
    amount: float = Field(..., gt=0, description="Transaction amount")
    currency: str = Field(
        ..., min_length=3, max_length=3, description="ISO currency code"
    )
    status: Optional[TransactionStatusChoices] = Field(
        default=TransactionStatusChoices.PENDING,
        description="Initial transaction status",
    )

    @validator("currency")
    def validate_currency_format(cls, v):
        """Ensure currency is uppercase and alphabetic."""
        if not v.isalpha():
            raise ValueError("Currency must contain only letters")
        return v.upper()

    class Config:
        schema_extra = {
            "example": {
                "buyer_id": 1,
                "seller_id": 2,
                "amount": 50000.00,
                "currency": "USD",
                "status": "pending",
            }
        }


class TradeTransactionStatusUpdate(BaseModel):
    """Schema for updating transaction status.

    Attributes:
        status: New status for the transaction.
    """

    status: TransactionStatusChoices = Field(..., description="New transaction status")

    class Config:
        schema_extra = {"example": {"status": "in_progress"}}


class BuyerResponse(BaseModel):
    """Response schema for buyer information."""

    id: int
    name: str
    email: str
    org_name: str

    class Config:
        orm_mode = True


class SellerResponse(BaseModel):
    """Response schema for seller information."""

    id: int
    name: str
    email: str
    org_name: str

    class Config:
        orm_mode = True


class TradeTransactionResponse(BaseModel):
    """Schema for trade transaction response.

    Includes full transaction details with buyer and seller information.
    """

    id: int
    buyer_id: int
    seller_id: int
    amount: float
    currency: str
    status: TransactionStatusChoices
    created_at: datetime
    updated_at: datetime
    buyer: Optional[BuyerResponse] = None
    seller: Optional[SellerResponse] = None

    class Config:
        orm_mode = True
        schema_extra = {
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
        }


class TradeTransactionListResponse(BaseModel):
    """Schema for paginated transaction list response."""

    total: int = Field(..., description="Total number of transactions")
    transactions: list[TradeTransactionResponse] = Field(
        ..., description="List of transactions"
    )
    skip: int = Field(..., description="Number of records skipped")
    limit: int = Field(..., description="Maximum records returned")

    class Config:
        schema_extra = {
            "example": {"total": 10, "transactions": [], "skip": 0, "limit": 100}
        }
