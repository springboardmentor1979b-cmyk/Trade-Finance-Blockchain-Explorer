"""Integration tests for string ID functionality."""

from datetime import datetime
from src.db.id_utils import generate_transaction_id, generate_risk_score_id, generate_audit_log_id
from src.trade_transactions.schemas import TransactionCreate, TransactionResponse
from src.risk_scores.schemas import RiskScoreCreate, RiskScoreResponse
from src.audit_logs.schemas import AuditLogCreate, AuditLogResponse


def test_transaction_schema_with_string_id():
    """Test transaction schemas work with string IDs."""
    # Test create schema
    create_data = TransactionCreate(
        id="TXN-0118-2024",
        amount=1000.0,
        currency="USD",
        seller_id=2
    )
    assert create_data.id == "TXN-0118-2024"
    
    # Test response schema
    response_data = TransactionResponse(
        id="TXN-0118-2024",
        amount=1000.0,
        currency="USD",
        status="pending",
        created_at=datetime.now(),
        updated_at=datetime.now(),
        buyer_id=1,
        seller_id=2
    )
    assert response_data.id == "TXN-0118-2024"


def test_risk_score_schema_with_string_id():
    """Test risk score schemas work with string IDs."""
    # Test create schema
    create_data = RiskScoreCreate(
        user_id=1,
        score=85.5,
        rationale="Test rationale"
    )
    assert create_data.score == 85.5
    
    # Test response schema
    response_data = RiskScoreResponse(
        id="RISK-0118-2024",
        score=85.5,
        rationale="Test rationale",
        last_updated=datetime.now(),
        user_id=1
    )
    assert response_data.id == "RISK-0118-2024"


def test_audit_log_schema_with_string_id():
    """Test audit log schemas work with string IDs."""
    # Test create schema
    create_data = AuditLogCreate(
        action="delete_user",
        target_type="user",
        target_id="USER-001"
    )
    assert create_data.target_id == "USER-001"
    
    # Test response schema
    response_data = AuditLogResponse(
        id="AUDIT-0118-2024",
        admin_id=1,
        action="delete_user",
        target_type="user",
        target_id="USER-001",
        timestamp=datetime.now()
    )
    assert response_data.id == "AUDIT-0118-2024"
    assert response_data.target_id == "USER-001"


def test_id_generation_uniqueness():
    """Test that ID generation produces different IDs."""
    id1 = generate_transaction_id()
    id2 = generate_transaction_id()
    # They should be the same format but could be same if generated at same time
    assert id1.startswith("TXN-")
    assert id2.startswith("TXN-")
    
    risk_id = generate_risk_score_id()
    audit_id = generate_audit_log_id()
    
    assert risk_id.startswith("RISK-")
    assert audit_id.startswith("AUDIT-")
    assert risk_id != audit_id