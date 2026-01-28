"""Audit Logs Service Module.

This module provides the business logic for audit log operations including
creation, retrieval, and filtering. It also provides a utility function
for other services to log actions.

Classes:
    AuditLogService: Service class with static methods for audit log operations.

Functions:
    log_action: Utility function for logging admin/auditor actions.
"""

from typing import Optional

from sqlmodel import Session, or_, select

from src.db.models import AuditLogs, Users

from .schemas import AuditLogCreate, AuditLogResponse


def log_action(
    db: Session,
    admin_id: int,
    action: str,
    target_type: str,
    target_id: str,
) -> None:
    """Create an audit log entry for tracking administrative actions.

    This is the primary utility function for logging actions performed by
    admin and auditor users. It is called by other services to maintain
    an audit trail for compliance and debugging purposes.

    Args:
        db: Database session for the current transaction.
        admin_id: ID of the user performing the action.
        action: Action being performed (CREATE, UPDATE, DELETE, VIEW, etc.).
        target_type: Type of entity being affected (risk_score, ledger,
            transaction, user, document, etc.).
        target_id: ID of the target entity as a string.

    Note:
        This function adds the audit log to the session but does NOT commit.
        The calling function should handle the transaction commit to ensure
        the audit log is saved atomically with the main operation.

    Example:
        >>> log_action(db, user.id, "UPDATE", "document", str(document_id))
        >>> db.commit()  # Commit both the main operation and audit log
    """
    audit_log = AuditLogs(
        admin_id=admin_id,
        action=action,
        target_type=target_type,
        target_id=str(target_id),
    )
    db.add(audit_log)
    # Don't commit here - let the calling function handle the transaction


class AuditLogService:
    """Service class for audit log operations.

    Provides static methods for creating and retrieving audit logs.
    All methods accept a database session for transaction control.

    Methods:
        create_audit_log: Create a new audit log entry.
        get_all_audit_logs: Retrieve all audit logs with optional filtering.
        get_audit_logs_by_admin: Retrieve audit logs for a specific admin.
    """

    @staticmethod
    def create_audit_log(
        log_data: AuditLogCreate, admin_id: int, db: Session
    ) -> AuditLogResponse:
        """Create a new audit log entry.

        Args:
            log_data: Pydantic schema containing action, target_type, and target_id.
            admin_id: ID of the admin user creating the log entry.
            db: Database session for the transaction.

        Returns:
            AuditLogResponse: The created audit log with all details including
                the admin's name.

        Example:
            >>> log_data = AuditLogCreate(
            ...     action="CREATE",
            ...     target_type="document",
            ...     target_id=1
            ... )
            >>> response = AuditLogService.create_audit_log(log_data, admin_id, db)
        """
        audit_log = AuditLogs(
            admin_id=admin_id,
            action=log_data.action,
            target_type=log_data.target_type,
            target_id=log_data.target_id,
        )
        db.add(audit_log)
        db.commit()
        db.refresh(audit_log)

        return AuditLogResponse(
            id=audit_log.id,
            admin_id=audit_log.admin_id,
            action=audit_log.action,
            target_type=audit_log.target_type,
            target_id=audit_log.target_id,
            timestamp=audit_log.timestamp,
            admin_name=audit_log.admin.name if audit_log.admin else None,
        )

    @staticmethod
    def get_all_audit_logs(
        db: Session,
        search: Optional[str] = None,
        action: Optional[str] = None,
        target_type: Optional[str] = None,
    ) -> list[AuditLogResponse]:
        """Retrieve all audit logs with optional filtering.

        Fetches audit logs from the database with support for searching
        by admin name or target, and filtering by action or target type.
        Results are ordered by timestamp descending (newest first).

        Args:
            db: Database session for querying.
            search: Optional search term to match against admin name,
                target_id, or target_type (case-insensitive).
            action: Optional exact match filter for action type.
            target_type: Optional exact match filter for target type.

        Returns:
            list[AuditLogResponse]: List of matching audit log entries.

        Example:
            >>> # Get all UPDATE actions
            >>> logs = AuditLogService.get_all_audit_logs(db, action="UPDATE")
            >>> # Search for logs by admin name
            >>> logs = AuditLogService.get_all_audit_logs(db, search="John")
        """
        statement = select(AuditLogs).join(Users, AuditLogs.admin_id == Users.id)

        # Apply filters
        if search:
            search_term = f"%{search}%"
            statement = statement.where(
                or_(
                    Users.name.ilike(search_term),
                    AuditLogs.target_id.ilike(search_term),
                    AuditLogs.target_type.ilike(search_term),
                )
            )

        if action:
            statement = statement.where(AuditLogs.action == action)

        if target_type:
            statement = statement.where(AuditLogs.target_type == target_type)

        statement = statement.order_by(AuditLogs.timestamp.desc())
        audit_logs = db.exec(statement).all()

        return [
            AuditLogResponse(
                id=log.id,
                admin_id=log.admin_id,
                action=log.action,
                target_type=log.target_type,
                target_id=log.target_id,
                timestamp=log.timestamp,
                admin_name=log.admin.name if log.admin else None,
            )
            for log in audit_logs
        ]

    @staticmethod
    def get_audit_logs_by_admin(admin_id: int, db: Session) -> list[AuditLogResponse]:
        """Retrieve audit logs for a specific admin user.

        Fetches all audit logs created by the specified admin user,
        ordered by timestamp descending (newest first).

        Args:
            admin_id: ID of the admin user to filter by.
            db: Database session for querying.

        Returns:
            list[AuditLogResponse]: List of audit logs created by the admin.

        Example:
            >>> my_logs = AuditLogService.get_audit_logs_by_admin(user.id, db)
        """
        statement = (
            select(AuditLogs)
            .where(AuditLogs.admin_id == admin_id)
            .order_by(AuditLogs.timestamp.desc())
        )
        audit_logs = db.exec(statement).all()

        return [
            AuditLogResponse(
                id=log.id,
                admin_id=log.admin_id,
                action=log.action,
                target_type=log.target_type,
                target_id=log.target_id,
                timestamp=log.timestamp,
                admin_name=log.admin.name if log.admin else None,
            )
            for log in audit_logs
        ]
