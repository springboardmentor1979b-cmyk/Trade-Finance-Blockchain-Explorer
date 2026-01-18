from fastapi import APIRouter, Depends
from sqlmodel import Session
from src.db.database import get_session
from src.Auth.dependency import get_current_user, role_required
from src.db.models import Users
from .service import AuditLogService
from .schemas import AuditLogCreate, AuditLogResponse

audit_logs_router = APIRouter()


@audit_logs_router.post("/", response_model=AuditLogResponse)
def create_audit_log(
    log_data: AuditLogCreate,
    db: Session = Depends(get_session),
    user: Users = Depends(get_current_user),
    role_check: None = Depends(role_required(["admin"])),
) -> AuditLogResponse:
    return AuditLogService.create_audit_log(log_data, user.id, db)


@audit_logs_router.get("/", response_model=list[AuditLogResponse])
def get_all_audit_logs(
    db: Session = Depends(get_session),
    role_check: None = Depends(role_required(["admin", "auditor"])),
) -> list[AuditLogResponse]:
    return AuditLogService.get_all_audit_logs(db)


@audit_logs_router.get("/my", response_model=list[AuditLogResponse])
def get_my_audit_logs(
    db: Session = Depends(get_session),
    user: Users = Depends(get_current_user),
    role_check: None = Depends(role_required(["admin"])),
) -> list[AuditLogResponse]:
    return AuditLogService.get_audit_logs_by_admin(user.id, db)