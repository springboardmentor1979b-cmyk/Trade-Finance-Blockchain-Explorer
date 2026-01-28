"""Risk Scores Module for Trade Finance Blockchain Explorer.

This module provides functionality for managing user risk assessments.
Risk scores help financial institutions evaluate counterparty risk in
trade transactions.

Components:
    router: FastAPI router with risk score endpoints.
    service: Business logic for risk score operations.
    schemas: Pydantic schemas for request/response validation.

Features:
    - Risk score assignment to users (0-100 scale)
    - Rationale documentation for compliance
    - Automatic timestamp tracking
    - Filtering by score range and user
    - Audit logging for all modifications

Usage:
    from src.risk_scores.router import risk_scores_router
    from src.risk_scores.service import RiskScoreService

    # Create a risk score
    score = RiskScoreService.create_risk_score(risk_data, db)

Permissions:
    - CREATE: Admin, Auditor
    - READ (own): All authenticated users
    - READ (all): Admin, Auditor
    - UPDATE: Admin, Auditor
    - DELETE: Admin, Auditor
"""

from .router import risk_scores_router
from .service import RiskScoreService

__all__ = ["risk_scores_router", "RiskScoreService"]
