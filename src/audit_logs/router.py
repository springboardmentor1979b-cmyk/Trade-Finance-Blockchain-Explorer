"""Audit Logs API Router.

This module defines the FastAPI router for audit log endpoints.
It provides endpoints for creating, retrieving, and filtering audit logs
that track administrative actions within the system.

Endpoints:
    POST /: Create a new audit log entry (Admin only)
    GET /: Get all audit logs with optional filtering (Admin, Auditor)
    GET /my: Get audit logs for the current admin user (Admin only)
"""

from typing import Optional

from fastapi import APIRouter, Depends, Query
from sqlmodel import Session

from src.Auth.dependency import get_current_user, role_required
from src.db.database import get_session
from src.db.models import Users

from .schemas import AuditLogCreate, AuditLogResponse
from .service import AuditLogService

audit_logs_router = APIRouter()


@audit_logs_router.post("/", response_model=AuditLogResponse)
def create_audit_log(
    log_data: AuditLogCreate,
    db: Session = Depends(get_session),
    user: Users = Depends(get_current_user),
    role_check: None = Depends(role_required(["admin"])),
) -> AuditLogResponse:
    """Create a new audit log entry.

    Records an administrative action for compliance and audit purposes.
    Only admin users can manually create audit log entries.

    Args:
        log_data: The audit log data containing action, target_type, and target_id.
        db: Database session (injected).
        user: Current authenticated user (injected).
        role_check: Role validation ensuring admin access (injected).

    Returns:
        AuditLogResponse: The created audit log entry with all details.

    Raises:
        HTTPException (401): If user is not authenticated.
        HTTPException (403): If user is not an admin.
    """
    return AuditLogService.create_audit_log(log_data, user.id, db)  # type: ignore


@audit_logs_router.get("/", response_model=list[AuditLogResponse])
def get_all_audit_logs(
    search: Optional[str] = Query(None, description="Search by admin name or target"),
    action: Optional[str] = Query(None, description="Filter by action type"),
    target_type: Optional[str] = Query(None, description="Filter by target type"),
    db: Session = Depends(get_session),
    role_check: None = Depends(role_required(["admin", "auditor"])),
) -> list[AuditLogResponse]:
    """Retrieve all audit logs with optional filtering.

    Returns a list of all audit logs in the system, optionally filtered
    by search term, action type, or target type. Results are ordered
    by timestamp in descending order (newest first).

    Args:
        search: Optional search term to filter by admin name or target ID.
        action: Optional filter for specific action types (CREATE, UPDATE, DELETE, etc.).
        target_type: Optional filter for specific target types (document, ledger, etc.).
        db: Database session (injected).
        role_check: Role validation ensuring admin/auditor access (injected).

    Returns:
        list[AuditLogResponse]: List of matching audit log entries.

    Raises:
        HTTPException (401): If user is not authenticated.
        HTTPException (403): If user is not an admin or auditor.
    """
    return AuditLogService.get_all_audit_logs(
        db, search=search, action=action, target_type=target_type
    )


@audit_logs_router.get("/my", response_model=list[AuditLogResponse])
def get_my_audit_logs(
    db: Session = Depends(get_session),
    user: Users = Depends(get_current_user),
    role_check: None = Depends(role_required(["admin", "auditor"])),
) -> list[AuditLogResponse]:
    """Retrieve audit logs for the current admin user.

    Returns all audit logs created by the currently authenticated admin,
    ordered by timestamp in descending order (newest first).

    Args:
        db: Database session (injected).
        user: Current authenticated user (injected).
        role_check: Role validation ensuring admin access (injected).

    Returns:
        list[AuditLogResponse]: List of audit logs created by the current user.

    Raises:
        HTTPException (401): If user is not authenticated.
        HTTPException (403): If user is not an admin.
    """
    return AuditLogService.get_audit_logs_by_admin(user.id, db)  # type: ignore
