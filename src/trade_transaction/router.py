"""API router for trade transaction endpoints.

Provides REST API endpoints for creating, reading, and updating
trade transactions with role-based access control.
"""

from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlmodel import Session, select

from src.db.models import Users, TradeTransactions
from src.db.enums import TransactionStatusChoices
from src.trade_transaction.service import trade_transaction_service
from src.trade_transaction.schema import (
    TradeTransactionCreate,
    TradeTransactionResponse,
    TradeTransactionStatusUpdate,
    TradeTransactionListResponse
)
from src.Auth.dependency import get_current_user, role_required
from src.db.database import get_session as get_db
# Import your existing auth dependency
# from src.auth.dependencies import get_current_user
# from src.db.session import get_db


router = APIRouter(
    prefix="/transactions",
    tags=["Trade Transactions"]
)


@router.post(
    "/",
    response_model=TradeTransactionResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create new trade transaction",
    description="Create a new trade transaction. Only bank and corporate users can create transactions."
)
async def create_transaction(
    transaction_data: TradeTransactionCreate,
    session: Session = Depends(get_db),
    current_user: Users = Depends(get_current_user)
) -> TradeTransactionResponse:
    """Create a new trade transaction.
    
    **Required Role:** Bank or Corporate
    
    **Request Body:**
    - buyer_id: ID of the buyer
    - seller_id: ID of the seller
    - amount: Transaction amount (must be positive)
    - currency: 3-letter ISO currency code
    - status: Optional initial status (defaults to pending)
    
    **Returns:**
    - Created transaction with full details including buyer and seller info
    
    **Raises:**
    - 403: If user is not bank or corporate
    - 400: If validation fails
    - 404: If buyer or seller not found
    """
    transaction = trade_transaction_service.create_transaction(
        session=session,
        current_user=current_user,
        buyer_id=transaction_data.buyer_id,
        seller_id=transaction_data.seller_id,
        amount=transaction_data.amount,
        currency=transaction_data.currency,
        status=transaction_data.status
    )
    
    return transaction


@router.get(
    "/{transaction_id}",
    response_model=TradeTransactionResponse,
    summary="Get transaction by ID",
    description="Retrieve details of a specific trade transaction."
)
async def get_transaction(
    transaction_id: int,
    session: Session = Depends(get_db),
    current_user: Users = Depends(get_current_user)
) -> TradeTransactionResponse:
    """Get a specific transaction by ID.
    
    **Path Parameters:**
    - transaction_id: ID of the transaction to retrieve
    
    **Returns:**
    - Transaction details with buyer and seller information
    
    **Raises:**
    - 404: If transaction not found
    """
    transaction = trade_transaction_service.get_transaction(
        session=session,
        transaction_id=transaction_id
    )
    
    return transaction


@router.get(
    "/",
    response_model=TradeTransactionListResponse,
    summary="List all transactions",
    description="Retrieve a list of trade transactions with optional filtering and pagination."
)
async def list_transactions(
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(100, ge=1, le=1000, description="Maximum number of records to return"),
    status: Optional[TransactionStatusChoices] = Query(None, description="Filter by transaction status"),
    session: Session = Depends(get_db),
    current_user: Users = Depends(get_current_user)
) -> TradeTransactionListResponse:
    """List transactions with pagination and optional filtering.
    
    **Query Parameters:**
    - skip: Number of records to skip (default: 0)
    - limit: Maximum records to return (default: 100, max: 1000)
    - status: Optional status filter (pending, in_progress, completed, disputed)
    
    **Returns:**
    - Paginated list of transactions with total count
    """
    transactions = trade_transaction_service.list_transactions(
        session=session,
        current_user=current_user,
        skip=skip,
        limit=limit,
        status_filter=status
    )
    
    # Get total count for pagination
    count_query = select(TradeTransactions)
    if status:
        count_query = count_query.where(TradeTransactions.status == status)
    total = len(session.exec(count_query).all())
    
    return TradeTransactionListResponse(
        total=total,
        transactions=transactions,
        skip=skip,
        limit=limit
    )


@router.patch(
    "/{transaction_id}/status",
    response_model=TradeTransactionResponse,
    summary="Update transaction status",
    description="Update the status of an existing trade transaction. Only bank and corporate users can update."
)
async def update_transaction_status(
    transaction_id: int,
    status_update: TradeTransactionStatusUpdate,
    session: Session = Depends(get_db),
    current_user: Users = Depends(get_current_user)
) -> TradeTransactionResponse:
    """Update transaction status.
    
    **Required Role:** Bank or Corporate
    
    **Path Parameters:**
    - transaction_id: ID of the transaction to update
    
    **Request Body:**
    - status: New status (pending, in_progress, completed, disputed)
    
    **Returns:**
    - Updated transaction details
    
    **Raises:**
    - 403: If user is not bank or corporate
    - 404: If transaction not found
    """
    transaction = trade_transaction_service.update_transaction_status(
        session=session,
        current_user=current_user,
        transaction_id=transaction_id,
        new_status=status_update.status
    )
    
    return transaction


@router.get(
    "/user/{user_id}",
    response_model=TradeTransactionListResponse,
    summary="Get transactions for a specific user",
    description="Retrieve all transactions where the user is either buyer or seller."
)
async def get_user_transactions(
    user_id: int,
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    session: Session = Depends(get_db),
    current_user: Users = Depends(get_current_user)
) -> TradeTransactionListResponse:
    """Get all transactions for a specific user.
    
    **Path Parameters:**
    - user_id: ID of the user
    
    **Query Parameters:**
    - skip: Number of records to skip (default: 0)
    - limit: Maximum records to return (default: 100)
    
    **Returns:**
    - List of transactions where user is buyer or seller
    """
    query = select(TradeTransactions).where(
        (TradeTransactions.buyer_id == user_id) | 
        (TradeTransactions.seller_id == user_id)
    ).order_by(TradeTransactions.created_at.desc())
    
    query = query.offset(skip).limit(limit)
    transactions = session.exec(query).all()
    
    # Get total count
    count_query = select(TradeTransactions).where(
        (TradeTransactions.buyer_id == user_id) | 
        (TradeTransactions.seller_id == user_id)
    )
    total = len(session.exec(count_query).all())
    
    return TradeTransactionListResponse(
        total=total,
        transactions=list(transactions),
        skip=skip,
        limit=limit
    )
from fastapi import APIRouter, Depends, status,Form
from sqlmodel import Session
from src.db.database import get_session
from src.Auth.dependency import role_required
from .service import TransactionService
from .schemas import TransactionStatusUpdate, TransactionResponse
from src.db.enums import  TransactionStatusChoices
transaction_router = APIRouter()

@transaction_router.patch(
    "/{transaction_id}/status", 
    response_model=TransactionResponse
)
def edit_transaction_status(
    transaction_id: int,
    status: TransactionStatusChoices=Form(...),
    db: Session = Depends(get_session),
    admin_check: bool = Depends(role_required(["admin"]))
):
    """Admin-only: Updates the status of a transaction. Other fields cannot be changed."""
    return TransactionService.update_status(db, transaction_id, status)

@transaction_router.delete(
    "/{transaction_id}", 
    status_code=status.HTTP_204_NO_CONTENT
)
def delete_transaction(
    transaction_id: int,
    db: Session = Depends(get_session),
    admin_check: bool = Depends(role_required(["admin"]))
):
    """Admin-only: Deletes a transaction. Users must re-add to change immutable details."""
    TransactionService.delete_transaction(db, transaction_id)
    return None
