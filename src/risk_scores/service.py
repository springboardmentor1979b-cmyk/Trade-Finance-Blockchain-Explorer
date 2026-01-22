from typing import Optional

from fastapi import HTTPException
from sqlmodel import Session, or_, select

from src.db.models import RiskScores, Users

from .schemas import RiskScoreCreate, RiskScoreResponse, RiskScoreUpdate


class RiskScoreService:
    @staticmethod
    def create_risk_score(risk_data: RiskScoreCreate, db: Session) -> RiskScoreResponse:
        # Verify user exists
        user = db.get(Users, risk_data.user_id)
        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        risk_score = RiskScores(
            user_id=risk_data.user_id,
            score=risk_data.score,
            rationale=risk_data.rationale,
        )
        db.add(risk_score)
        db.commit()
        db.refresh(risk_score)

        return RiskScoreResponse(
            id=risk_score.id,
            score=risk_score.score,
            rationale=risk_score.rationale,
            last_updated=risk_score.last_updated,
            user_id=risk_score.user_id,
            user_name=risk_score.user.name if risk_score.user else None,
        )

    @staticmethod
    def get_user_risk_scores(user_id: int, db: Session) -> list[RiskScoreResponse]:
        statement = select(RiskScores).where(RiskScores.user_id == user_id)
        risk_scores = db.exec(statement).all()

        return [
            RiskScoreResponse(
                id=rs.id,
                score=rs.score,
                rationale=rs.rationale,
                last_updated=rs.last_updated,
                user_id=rs.user_id,
                user_name=rs.user.name if rs.user else None,
            )
            for rs in risk_scores
        ]

    @staticmethod
    def get_all_risk_scores(
        db: Session,
        search: Optional[str] = None,
        min_score: Optional[float] = None,
        max_score: Optional[float] = None,
        user_id: Optional[int] = None,
    ) -> list[RiskScoreResponse]:
        statement = select(RiskScores).join(Users, RiskScores.user_id == Users.id)

        # Apply filters
        if search:
            search_term = f"%{search}%"
            statement = statement.where(
                or_(
                    Users.name.ilike(search_term),
                    RiskScores.rationale.ilike(search_term),
                )
            )

        if min_score is not None:
            statement = statement.where(RiskScores.score >= min_score)

        if max_score is not None:
            statement = statement.where(RiskScores.score <= max_score)

        if user_id is not None:
            statement = statement.where(RiskScores.user_id == user_id)

        statement = statement.order_by(RiskScores.last_updated.desc())
        risk_scores = db.exec(statement).all()

        return [
            RiskScoreResponse(
                id=rs.id,
                score=rs.score,
                rationale=rs.rationale,
                last_updated=rs.last_updated,
                user_id=rs.user_id,
                user_name=rs.user.name if rs.user else None,
            )
            for rs in risk_scores
        ]

    @staticmethod
    def update_risk_score(
        risk_id: int, update_data: RiskScoreUpdate, db: Session
    ) -> RiskScoreResponse:
        risk_score = db.get(RiskScores, risk_id)
        if not risk_score:
            raise HTTPException(status_code=404, detail="Risk score not found")

        risk_score.score = update_data.score
        risk_score.rationale = update_data.rationale
        db.add(risk_score)
        db.commit()
        db.refresh(risk_score)

        return RiskScoreResponse(
            id=risk_score.id,
            score=risk_score.score,
            rationale=risk_score.rationale,
            last_updated=risk_score.last_updated,
            user_id=risk_score.user_id,
            user_name=risk_score.user.name if risk_score.user else None,
        )

    @staticmethod
    def delete_risk_score(risk_id: int, db: Session) -> None:
        risk_score = db.get(RiskScores, risk_id)
        if not risk_score:
            raise HTTPException(status_code=404, detail="Risk score not found")

        db.delete(risk_score)
        db.commit()
