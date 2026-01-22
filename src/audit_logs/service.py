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
    """
    Utility function to create an audit log entry.
    Used internally by other services to log admin/auditor actions.

    Args:
        db: Database session
        admin_id: ID of the user performing the action
        action: Action being performed (CREATE, UPDATE, DELETE, VIEW, etc.)
        target_type: Type of entity (risk_score, ledger, transaction, user, etc.)
        target_id: ID of the target entity
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
    @staticmethod
    def create_audit_log(
        log_data: AuditLogCreate, admin_id: int, db: Session
    ) -> AuditLogResponse:
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
