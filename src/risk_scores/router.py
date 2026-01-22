from typing import Optional

from fastapi import APIRouter, Depends, Query, status
from sqlmodel import Session

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
    role_check: None = Depends(role_required(["admin", "auditor"])),
) -> RiskScoreResponse:
    return RiskScoreService.create_risk_score(risk_data, db)


@risk_scores_router.get("/my", response_model=list[RiskScoreResponse])
def get_my_risk_scores(
    db: Session = Depends(get_session),
    user: Users = Depends(get_current_user),
) -> list[RiskScoreResponse]:
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
    return RiskScoreService.get_all_risk_scores(
        db, search=search, min_score=min_score, max_score=max_score, user_id=user_id
    )


@risk_scores_router.patch("/{risk_id}", response_model=RiskScoreResponse)
def update_risk_score(
    risk_id: int,
    update_data: RiskScoreUpdate,
    db: Session = Depends(get_session),
    role_check: None = Depends(role_required(["admin", "auditor"])),
) -> RiskScoreResponse:
    return RiskScoreService.update_risk_score(risk_id, update_data, db)


@risk_scores_router.delete("/{risk_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_risk_score(
    risk_id: int,
    db: Session = Depends(get_session),
    role_check: None = Depends(role_required(["admin", "auditor"])),
) -> None:
    RiskScoreService.delete_risk_score(risk_id, db)
