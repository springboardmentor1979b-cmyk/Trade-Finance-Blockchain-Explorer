from fastapi import APIRouter, Depends, status
from sqlmodel import Session
from src.db.database import get_session
from src.Auth.dependency import get_current_user, role_required
from src.db.models import Users
from .service import RiskScoreService
from .schemas import RiskScoreCreate, RiskScoreUpdate, RiskScoreResponse

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
    return RiskScoreService.get_user_risk_scores(user.id, db)


@risk_scores_router.get("/", response_model=list[RiskScoreResponse])
def get_all_risk_scores(
    db: Session = Depends(get_session),
    role_check: None = Depends(role_required(["admin", "auditor"])),
) -> list[RiskScoreResponse]:
    return RiskScoreService.get_all_risk_scores(db)


@risk_scores_router.patch("/{risk_id}", response_model=RiskScoreResponse)
def update_risk_score(
    risk_id: str,
    update_data: RiskScoreUpdate,
    db: Session = Depends(get_session),
    role_check: None = Depends(role_required(["admin", "auditor"])),
) -> RiskScoreResponse:
    return RiskScoreService.update_risk_score(risk_id, update_data, db)


@risk_scores_router.delete("/{risk_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_risk_score(
    risk_id: str,
    db: Session = Depends(get_session),
    role_check: None = Depends(role_required(["admin", "auditor"])),
) -> None:
    RiskScoreService.delete_risk_score(risk_id, db)