"""Audit Logs Module for Trade Finance Blockchain Explorer.

This module provides functionality for tracking and logging administrative
actions within the system. It maintains an immutable audit trail for compliance,
security, and debugging purposes.

Components:
    router: FastAPI router with audit log endpoints.
    service: Business logic for audit log operations.
    schemas: Pydantic schemas for request/response validation.

Features:
    - Automatic logging of admin/auditor actions
    - Filtering and search capabilities
    - User-specific audit trail retrieval
    - Compliance-ready audit records

Usage:
    from src.audit_logs.router import audit_logs_router
    from src.audit_logs.service import log_action

    # Log an action
    log_action(db, user_id, "UPDATE", "document", "123")

Permissions:
    - CREATE: Admin only
    - READ (all): Admin, Auditor
    - READ (own): Admin
"""

from .router import audit_logs_router
from .service import AuditLogService, log_action

__all__ = ["audit_logs_router", "AuditLogService", "log_action"]
