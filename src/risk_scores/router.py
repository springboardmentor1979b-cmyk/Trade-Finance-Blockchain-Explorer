"""Risk Scores API Router.

This module defines the FastAPI router for risk score endpoints.
It provides endpoints for creating, retrieving, updating, and deleting
user risk scores used for counterparty risk assessment.

Endpoints:
    POST /: Create a new risk score (Admin, Auditor)
    GET /my: Get current user's risk scores (All authenticated users)
    GET /: Get all risk scores with filtering (Admin, Auditor)
    PATCH /{risk_id}: Update a risk score (Admin, Auditor)
    DELETE /{risk_id}: Delete a risk score (Admin, Auditor)
"""

from typing import Optional

from fastapi import APIRouter, Depends, Query, status
from sqlmodel import Session

from src.audit_logs.service import log_action
from src.Auth.dependency import get_current_user, role_required
from src.db.database import get_session
from src.db.models import Users

from .schemas import RiskScoreCreate, RiskScoreResponse, RiskScoreUpdate
from .service import RiskScoreService

risk_scores_router = APIRouter()


@risk_scores_router.post("/", response_model=RiskScoreResponse)
def create_risk_score(
    risk_data: RiskScoreCreate,
    db: Session = Depends(get_session),
    user: Users = Depends(get_current_user),
    role_check: None = Depends(role_required(["admin", "auditor"])),
) -> RiskScoreResponse:
    """Create a new risk score for a user.

    Creates a risk assessment record for a user, including the score
    (0-100) and rationale. This operation is logged in the audit trail.

    Args:
        risk_data: Risk score data containing user_id, score, and rationale.
        db: Database session (injected).
        user: Current authenticated user (injected).
        role_check: Role validation ensuring admin/auditor access (injected).

    Returns:
        RiskScoreResponse: The created risk score with all details.

    Raises:
        HTTPException (401): If user is not authenticated.
        HTTPException (403): If user is not an admin or auditor.
        HTTPException (404): If target user does not exist.
    """
    result = RiskScoreService.create_risk_score(risk_data, db)
    # Log the action
    log_action(db, user.id, "CREATE", "risk_score", str(result.id))  # type: ignore
    db.commit()
    return result


@risk_scores_router.get("/my", response_model=list[RiskScoreResponse])
def get_my_risk_scores(
    db: Session = Depends(get_session),
    user: Users = Depends(get_current_user),
) -> list[RiskScoreResponse]:
    """Retrieve risk scores for the current user.

    Returns all risk scores assigned to the currently authenticated user.
    Available to all authenticated users regardless of role.

    Args:
        db: Database session (injected).
        user: Current authenticated user (injected).

    Returns:
        list[RiskScoreResponse]: List of risk scores for the current user.

    Raises:
        HTTPException (401): If user is not authenticated.
    """
    return RiskScoreService.get_user_risk_scores(user.id, db)  # type: ignore


@risk_scores_router.get("/", response_model=list[RiskScoreResponse])
def get_all_risk_scores(
    search: Optional[str] = Query(None, description="Search by user name or rationale"),
    min_score: Optional[float] = Query(None, ge=0, description="Minimum score filter"),
    max_score: Optional[float] = Query(
        None, le=100, description="Maximum score filter"
    ),
    user_id: Optional[int] = Query(None, description="Filter by specific user ID"),
    db: Session = Depends(get_session),
    role_check: None = Depends(role_required(["admin", "auditor"])),
) -> list[RiskScoreResponse]:
    """Retrieve all risk scores with optional filtering.

    Returns all risk scores in the system with optional filters for
    search term, score range, and specific user. Results are ordered
    by last_updated descending (newest first).

    Args:
        search: Optional search term to match against user name or rationale.
        min_score: Optional minimum score filter (0-100).
        max_score: Optional maximum score filter (0-100).
        user_id: Optional filter for a specific user's scores.
        db: Database session (injected).
        role_check: Role validation ensuring admin/auditor access (injected).

    Returns:
        list[RiskScoreResponse]: List of matching risk scores.

    Raises:
        HTTPException (401): If user is not authenticated.
        HTTPException (403): If user is not an admin or auditor.
    """
    return RiskScoreService.get_all_risk_scores(
        db, search=search, min_score=min_score, max_score=max_score, user_id=user_id
    )


@risk_scores_router.patch("/{risk_id}", response_model=RiskScoreResponse)
def update_risk_score(
    risk_id: int,
    update_data: RiskScoreUpdate,
    db: Session = Depends(get_session),
    user: Users = Depends(get_current_user),
    role_check: None = Depends(role_required(["admin", "auditor"])),
) -> RiskScoreResponse:
    """Update an existing risk score.

    Updates the score and rationale of an existing risk score record.
    The last_updated timestamp is automatically updated.
    This operation is logged in the audit trail.

    Args:
        risk_id: ID of the risk score to update.
        update_data: New score and rationale values.
        db: Database session (injected).
        user: Current authenticated user (injected).
        role_check: Role validation ensuring admin/auditor access (injected).

    Returns:
        RiskScoreResponse: The updated risk score.

    Raises:
        HTTPException (401): If user is not authenticated.
        HTTPException (403): If user is not an admin or auditor.
        HTTPException (404): If risk score not found.
    """
    result = RiskScoreService.update_risk_score(risk_id, update_data, db)
    # Log the action
    log_action(db, user.id, "UPDATE", "risk_score", str(risk_id))  # type: ignore
    db.commit()
    return result


@risk_scores_router.delete("/{risk_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_risk_score(
    risk_id: int,
    db: Session = Depends(get_session),
    user: Users = Depends(get_current_user),
    role_check: None = Depends(role_required(["admin", "auditor"])),
) -> None:
    """Delete a risk score by its ID.

    Removes a risk score record from the database. This operation
    is logged in the audit trail for compliance purposes.

    Args:
        risk_id: ID of the risk score to delete.
        db: Database session (injected).
        user: Current authenticated user (injected).
        role_check: Role validation ensuring admin/auditor access (injected).

    Raises:
        HTTPException (401): If user is not authenticated.
        HTTPException (403): If user is not an admin or auditor.
        HTTPException (404): If risk score not found.
    """
    RiskScoreService.delete_risk_score(risk_id, db)
    # Log the action
    log_action(db, user.id, "DELETE", "risk_score", str(risk_id))  # type: ignore
    db.commit()
