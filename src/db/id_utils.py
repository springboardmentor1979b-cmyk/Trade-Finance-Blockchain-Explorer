"""ID generation utilities for string-based primary keys."""

from datetime import datetime


def generate_transaction_id() -> str:
    """Generate a unique transaction ID in format TXN-XXX-YYYY."""
    timestamp = datetime.now()
    return f"TXN-{timestamp.strftime('%m%d')}-{timestamp.year}"


def generate_risk_score_id() -> str:
    """Generate a unique risk score ID in format RISK-XXX-YYYY."""
    timestamp = datetime.now()
    return f"RISK-{timestamp.strftime('%m%d')}-{timestamp.year}"


def generate_audit_log_id() -> str:
    """Generate a unique audit log ID in format AUDIT-XXX-YYYY."""
    timestamp = datetime.now()
    return f"AUDIT-{timestamp.strftime('%m%d')}-{timestamp.year}"