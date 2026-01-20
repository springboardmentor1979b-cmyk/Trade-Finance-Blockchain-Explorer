"""Tests for ID generation utilities."""

from src.db.id_utils import generate_transaction_id, generate_risk_score_id, generate_audit_log_id


def test_generate_transaction_id():
    """Test transaction ID generation format."""
    id_val = generate_transaction_id()
    assert id_val.startswith("TXN-")
    assert len(id_val) == 13  # TXN-MMDD-YYYY


def test_generate_risk_score_id():
    """Test risk score ID generation format."""
    id_val = generate_risk_score_id()
    assert id_val.startswith("RISK-")
    assert len(id_val) == 14  # RISK-MMDD-YYYY


def test_generate_audit_log_id():
    """Test audit log ID generation format."""
    id_val = generate_audit_log_id()
    assert id_val.startswith("AUDIT-")
    assert len(id_val) == 15  # AUDIT-MMDD-YYYY