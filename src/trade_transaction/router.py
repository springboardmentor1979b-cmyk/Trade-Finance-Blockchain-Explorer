"""Trade Transaction API Router.

This module defines the FastAPI router for trade transaction management endpoints.
It provides endpoints for creating, retrieving, updating, and deleting trade
transactions between buyers and sellers.

Endpoints:
    POST /: Create a new transaction (Bank, Corporate)
    GET /{transaction_id}: Get transaction by ID (Bank, Corporate)
    GET /: List all transactions with filtering (All authenticated)
    PATCH /{transaction_id}/status: Update transaction status (Admin, Auditor)
    GET /user/{user_id}: Get transactions for a specific user (All authenticated)
    DELETE /{transaction_id}: Delete a transaction (Admin, Auditor)

Permissions:
    - CREATE: Bank, Corporate
    - READ: Bank, Corporate
    - UPDATE (status): Admin, Auditor
    - DELETE: Admin, Auditor
"""

from typing import Optional

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import selectinload
from sqlmodel import Session, select

from src.audit_logs.service import log_action
from src.Auth.dependency import get_current_user, role_required
from src.db.database import get_session
from src.db.enums import TransactionStatusChoices
from src.db.models import TradeTransactions, Users
from src.trade_transaction.schemas import (
    TradeTransactionCreate,
    TradeTransactionListResponse,
    TradeTransactionResponse,
    UpdateTransactionStatusRequest,
)
from src.trade_transaction.service import TradeTransactionService

transaction_router = APIRouter()
trade_transaction_service = TradeTransactionService()


@transaction_router.post(
    "/",
    response_model=TradeTransactionResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create new trade transaction",
    description="Create a new trade transaction. Only bank and corporate users can create transactions.",
)
async def create_transaction(
    transaction_data: TradeTransactionCreate,
    session: Session = Depends(get_session),
    role_check: bool = Depends(role_required(["bank", "corporate"])),
) -> TradeTransactionResponse:
    """Create a new trade transaction.

    Creates a transaction between a buyer and seller with the specified
    amount and currency. The transaction starts in PENDING status by default.

    Args:
        transaction_data: Transaction details including buyer_id, seller_id,
            amount, currency, and optional initial status.
        session: Database session (injected).
        role_check: Role validation ensuring bank/corporate access (injected).

    Returns:
        TradeTransactionResponse: The created transaction with all details.

    Raises:
        HTTPException (400): If buyer and seller are the same user.
        HTTPException (400): If amount is not positive.
        HTTPException (400): If currency format is invalid.
        HTTPException (401): If user is not authenticated.
        HTTPException (403): If user is not a bank or corporate user.
        HTTPException (404): If buyer or seller user does not exist.
    """
    transaction = trade_transaction_service.create_transaction(
        session=session,
        buyer_id=transaction_data.buyer_id,
        seller_id=transaction_data.seller_id,
        amount=transaction_data.amount,
        currency=transaction_data.currency,
        status=transaction_data.status,
    )

    return TradeTransactionResponse.model_validate(transaction)


@transaction_router.get(
    "/",
    response_model=TradeTransactionListResponse,
    summary="List all transactions",
    description="Retrieve a list of trade transactions with optional filtering and pagination.",
)
async def list_transactions(
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(
        100, ge=1, le=1000, description="Maximum number of records to return"
    ),
    status: Optional[TransactionStatusChoices] = Query(
        None, description="Filter by transaction status"
    ),
    search: Optional[str] = Query(
        None, description="Search by transaction ID, buyer name, or seller name"
    ),
    buyer_id: Optional[int] = Query(None, description="Filter by buyer ID"),
    seller_id: Optional[int] = Query(None, description="Filter by seller ID"),
    session: Session = Depends(get_session),
    # role_check: bool = Depends(role_required(["bank", "corporate"])),
) -> TradeTransactionListResponse:
    """List all transactions with filtering and pagination.

    Retrieves a paginated list of transactions with optional filters for
    status, search term, buyer ID, and seller ID. Results are ordered
    by creation date descending (newest first).

    Args:
        skip: Number of records to skip for pagination (default: 0).
        limit: Maximum records to return (default: 100, max: 1000).
        status: Optional filter by transaction status.
        search: Optional search term for transaction ID or user names.
        buyer_id: Optional filter for specific buyer.
        seller_id: Optional filter for specific seller.
        session: Database session (injected).

    Returns:
        TradeTransactionListResponse: Paginated list with total count.

    Raises:
        HTTPException (401): If user is not authenticated.
    """
    transactions, total = trade_transaction_service.list_transactions(
        session=session,
        skip=skip,
        limit=limit,
        status_filter=status,
        search=search,
        buyer_id=buyer_id,
        seller_id=seller_id,
    )

    return TradeTransactionListResponse(
        total=total,
        transactions=[TradeTransactionResponse.model_validate(t) for t in transactions],
        skip=skip,
        limit=limit,  # type: ignore
    )


@transaction_router.get(
    "/user/{user_id}",
    response_model=TradeTransactionListResponse,
    summary="Get transactions for a specific user",
    description="Retrieve all transactions where the user is either buyer or seller.",
)
async def get_user_transactions(
    user_id: int,
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    session: Session = Depends(get_session),
) -> TradeTransactionListResponse:
    """Retrieve transactions for a specific user.

    Fetches all transactions where the specified user is either the
    buyer or seller, with pagination support.

    Args:
        user_id: ID of the user to fetch transactions for.
        skip: Number of records to skip (default: 0).
        limit: Maximum records to return (default: 100).
        session: Database session (injected).

    Returns:
        TradeTransactionListResponse: Paginated list of user's transactions.

    Raises:
        HTTPException (401): If user is not authenticated.
    """
    query = (
        select(TradeTransactions)
        .where(
            (TradeTransactions.buyer_id == user_id)
            | (TradeTransactions.seller_id == user_id)
        )
        .order_by(TradeTransactions.created_at.desc())  # type: ignore
    )

    query = query.offset(skip).limit(limit)
    transactions = session.exec(query).all()

    # Get total count
    count_query = select(TradeTransactions).where(
        (TradeTransactions.buyer_id == user_id)
        | (TradeTransactions.seller_id == user_id)
    )
    total = len(session.exec(count_query).all())

    return TradeTransactionListResponse(
        total=total,
        transactions=[TradeTransactionResponse.model_validate(t) for t in transactions],
        skip=skip,
        limit=limit,  # type: ignore
    )


@transaction_router.get(
    "/{transaction_id}",
    response_model=TradeTransactionResponse,
    summary="Get transaction by ID",
    description="Retrieve details of a specific trade transaction.",
)
async def get_transaction(
    transaction_id: int,
    session: Session = Depends(get_session),
    role_check: bool = Depends(role_required(["bank", "corporate"])),
) -> TradeTransactionResponse:
    """Retrieve a specific transaction by ID.

    Fetches complete details of a transaction including buyer and seller
    information.

    Args:
        transaction_id: ID of the transaction to retrieve.
        session: Database session (injected).
        role_check: Role validation ensuring bank/corporate access (injected).

    Returns:
        TradeTransactionResponse: Complete transaction details.

    Raises:
        HTTPException (401): If user is not authenticated.
        HTTPException (403): If user is not a bank or corporate user.
        HTTPException (404): If transaction not found.
    """
    transaction = trade_transaction_service.get_transaction(
        session=session, transaction_id=transaction_id
    )

    return TradeTransactionResponse.model_validate(transaction)


@transaction_router.patch(
    "/{transaction_id}/status",
    response_model=TradeTransactionResponse,
    summary="Update transaction status",
    description="Update the status of an existing trade transaction. Only bank and corporate users can update.",
)
async def update_transaction_status(
    transaction_id: int,
    payload: UpdateTransactionStatusRequest,
    session: Session = Depends(get_session),
    user: Users = Depends(get_current_user),
    role_check: bool = Depends(role_required(["admin", "auditor"])),
):
    """Update the status of a transaction.

    Updates the status of an existing transaction. This operation is
    restricted to Admin and Auditor users and is logged in the audit trail.

    Args:
        transaction_id: ID of the transaction to update.
        payload: Request body containing the new status.
        session: Database session (injected).
        user: Current authenticated user (injected).
        role_check: Role validation ensuring admin/auditor access (injected).

    Returns:
        TradeTransactionResponse: The updated transaction.

    Raises:
        HTTPException (401): If user is not authenticated.
        HTTPException (403): If user is not an admin or auditor.
        HTTPException (404): If transaction not found.
    """
    trade_transaction_service.update_transaction_status(
        session=session,
        transaction_id=transaction_id,
        new_status=payload.status,
    )
    log_action(session, user.id, "UPDATE", "transaction", str(transaction_id))  # type: ignore
    session.commit()
    updated_transaction = session.exec(
        select(TradeTransactions)
        .options(
            selectinload(TradeTransactions.buyer),  # type: ignore
            selectinload(TradeTransactions.seller),  # type: ignore
        )
        .where(TradeTransactions.id == transaction_id)
    ).one()
    return TradeTransactionResponse.model_validate(updated_transaction)


@transaction_router.delete("/{transaction_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_transaction(
    transaction_id: int,
    session: Session = Depends(get_session),
    user: Users = Depends(get_current_user),
    admin_check: bool = Depends(role_required(["admin", "auditor"])),
):
    """Delete a transaction by ID.

    Removes a transaction from the database. This operation is restricted
    to Admin and Auditor users and is logged in the audit trail.
    Users who need to modify immutable transaction details must delete
    and re-create the transaction.

    Args:
        transaction_id: ID of the transaction to delete.
        session: Database session (injected).
        user: Current authenticated user (injected).
        admin_check: Role validation ensuring admin/auditor access (injected).

    Raises:
        HTTPException (401): If user is not authenticated.
        HTTPException (403): If user is not an admin or auditor.
        HTTPException (404): If transaction not found.
    """
    log_action(session, user.id, "DELETE", "transaction", str(transaction_id))  # type: ignore
    trade_transaction_service.delete_transaction(session, transaction_id)
