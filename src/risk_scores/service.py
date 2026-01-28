"""Risk Scores Service Module.

This module provides the business logic for risk score operations
including creation, retrieval, updates, and deletion. Risk scores
are used for counterparty risk assessment in trade finance.

Classes:
    RiskScoreService: Service class with static methods for risk score operations.
"""

from typing import List, Optional

from sqlmodel import Session, or_, select

from src.db.models import RiskScores, Users
from src.errors import DocumentNotFound

from .schemas import RiskScoreCreate, RiskScoreResponse, RiskScoreUpdate


class RiskScoreService:
    """Service class for risk score operations.

    Provides static methods for managing risk scores including
    creation, retrieval with filtering, updates, and deletion.
    All methods accept a database session for transaction control.

    Methods:
        create_risk_score: Create a new risk score for a user.
        get_user_risk_scores: Retrieve risk scores for a specific user.
        get_all_risk_scores: Retrieve all risk scores with filtering.
        update_risk_score: Update an existing risk score.
        delete_risk_score: Delete a risk score by ID.
    """

    @staticmethod
    def create_risk_score(risk_data: RiskScoreCreate, db: Session) -> RiskScoreResponse:
        """Create a new risk score for a user.

        Creates a risk assessment record with the specified score and rationale.
        The timestamp is automatically set to the current time.

        Args:
            risk_data: Pydantic schema containing user_id, score, and rationale.
            db: Database session for the transaction.

        Returns:
            RiskScoreResponse: The created risk score with user name resolved.

        Raises:
            DocumentNotFound: If the target user does not exist.

        Example:
            >>> score = RiskScoreService.create_risk_score(
            ...     RiskScoreCreate(user_id=5, score=75.0, rationale="High volume"),
            ...     db
            ... )
        """
        # Verify user exists
        user = db.get(Users, risk_data.user_id)
        if not user:
            raise DocumentNotFound(f"User with ID {risk_data.user_id} not found.")

        risk_score = RiskScores(
            user_id=risk_data.user_id,
            score=risk_data.score,
            rationale=risk_data.rationale,
        )  # type: ignore
        db.add(risk_score)
        db.commit()
        db.refresh(risk_score)

        return RiskScoreResponse(
            id=risk_score.id,  # type: ignore
            score=risk_score.score,
            rationale=risk_score.rationale,
            last_updated=risk_score.last_updated,
            user_id=risk_score.user_id,
            user_name=risk_score.user.name if risk_score.user else None,
        )

    @staticmethod
    def get_user_risk_scores(user_id: int, db: Session) -> List[RiskScoreResponse]:
        """Retrieve all risk scores for a specific user.

        Fetches all risk assessment records associated with the given user ID.

        Args:
            user_id: ID of the user to fetch scores for.
            db: Database session for querying.

        Returns:
            List[RiskScoreResponse]: List of risk scores for the user.

        Example:
            >>> scores = RiskScoreService.get_user_risk_scores(5, db)
            >>> for score in scores:
            ...     print(f"Score: {score.score}, Rationale: {score.rationale}")
        """
        statement = select(RiskScores).where(RiskScores.user_id == user_id)
        risk_scores = db.exec(statement).all()

        return [
            RiskScoreResponse(
                id=rs.id,  # type: ignore
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
    ) -> List[RiskScoreResponse]:
        """Retrieve all risk scores with optional filtering.

        Fetches risk scores from the database with support for searching
        by user name or rationale, filtering by score range, and filtering
        by specific user. Results are ordered by last_updated descending.

        Args:
            db: Database session for querying.
            search: Optional search term to match against user name or rationale
                (case-insensitive partial match).
            min_score: Optional minimum score filter (inclusive).
            max_score: Optional maximum score filter (inclusive).
            user_id: Optional filter for a specific user's scores.

        Returns:
            List[RiskScoreResponse]: List of matching risk scores.

        Example:
            >>> # Get high-risk scores
            >>> high_risk = RiskScoreService.get_all_risk_scores(
            ...     db, min_score=70.0
            ... )
            >>> # Search for specific user
            >>> results = RiskScoreService.get_all_risk_scores(
            ...     db, search="John"
            ... )
        """
        statement = select(RiskScores).join(Users, RiskScores.user_id == Users.id)  # type: ignore

        # Apply filters
        if search:
            search_term = f"%{search}%"
            statement = statement.where(
                or_(
                    Users.name.ilike(search_term),  # type: ignore
                    RiskScores.rationale.ilike(search_term),  # type: ignore
                )
            )

        if min_score is not None:
            statement = statement.where(RiskScores.score >= min_score)

        if max_score is not None:
            statement = statement.where(RiskScores.score <= max_score)

        if user_id is not None:
            statement = statement.where(RiskScores.user_id == user_id)

        statement = statement.order_by(RiskScores.last_updated.desc())  # type: ignore
        risk_scores = db.exec(statement).all()

        return [
            RiskScoreResponse(
                id=rs.id,  # type: ignore
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
        """Update an existing risk score.

        Updates the score and rationale of a risk assessment record.
        The last_updated timestamp is automatically updated.

        Args:
            risk_id: ID of the risk score to update.
            update_data: Pydantic schema containing new score and rationale.
            db: Database session for the transaction.

        Returns:
            RiskScoreResponse: The updated risk score.

        Raises:
            HTTPException (404): If the risk score is not found.

        Example:
            >>> updated = RiskScoreService.update_risk_score(
            ...     1,
            ...     RiskScoreUpdate(score=50.0, rationale="Revised assessment"),
            ...     db
            ... )
        """
        risk_score = db.get(RiskScores, risk_id)
        if not risk_score:
            raise DocumentNotFound(f"Risk score with ID {risk_id} not found.")

        risk_score.score = update_data.score
        risk_score.rationale = update_data.rationale
        db.add(risk_score)
        db.commit()
        db.refresh(risk_score)

        return RiskScoreResponse(
            id=risk_score.id,  # type: ignore
            score=risk_score.score,
            rationale=risk_score.rationale,
            last_updated=risk_score.last_updated,
            user_id=risk_score.user_id,
            user_name=risk_score.user.name if risk_score.user else None,
        )

    @staticmethod
    def delete_risk_score(risk_id: int, db: Session) -> None:
        """Delete a risk score by its ID.

        Removes a risk assessment record from the database.

        Args:
            risk_id: ID of the risk score to delete.
            db: Database session for the transaction.

        Raises:
            DocumentNotFound: If the risk score is not found.

        Example:
            >>> RiskScoreService.delete_risk_score(1, db)
        """
        risk_score = db.get(RiskScores, risk_id)
        if not risk_score:
            raise DocumentNotFound(f"Risk score with ID {risk_id} not found.")

        db.delete(risk_score)
        db.commit()
