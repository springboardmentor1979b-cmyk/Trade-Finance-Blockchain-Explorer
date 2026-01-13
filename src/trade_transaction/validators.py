"""Validation utilities for trade transactions.

Provides reusable validation functions for transaction data.
"""

import re
from typing import Set
from fastapi import HTTPException, status


# ISO 4217 common currency codes
VALID_CURRENCIES: Set[str] = {
    'USD', 'EUR', 'GBP', 'JPY', 'CHF', 'CAD', 'AUD', 'NZD',
    'SEK', 'NOK', 'DKK', 'PLN', 'CZK', 'HUF', 'RON', 'BGN',
    'HRK', 'RUB', 'TRY', 'ZAR', 'BRL', 'MXN', 'ARS', 'CLP',
    'CNY', 'HKD', 'INR', 'IDR', 'KRW', 'MYR', 'PHP', 'SGD',
    'THB', 'VND', 'AED', 'SAR', 'EGP', 'ILS', 'QAR', 'KWD'
}


class TransactionValidator:
    """Validator for trade transaction business rules."""

    @staticmethod
    def validate_currency_code(currency: str) -> str:
        """Validate currency is a valid ISO 4217 code.
        
        Args:
            currency: Currency code to validate.
            
        Returns:
            str: Uppercase currency code.
            
        Raises:
            HTTPException: If currency is invalid.
        """
        currency = currency.upper()
        
        if currency not in VALID_CURRENCIES:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid currency code: {currency}. Must be a valid ISO 4217 code."
            )
        
        return currency

    @staticmethod
    def validate_amount_precision(amount: float, max_decimals: int = 2) -> None:
        """Validate amount doesn't exceed allowed decimal precision.
        
        Args:
            amount: Amount to validate.
            max_decimals: Maximum allowed decimal places (default: 2).
            
        Raises:
            HTTPException: If decimal precision exceeds limit.
        """
        # Convert to string and check decimal places
        amount_str = str(amount)
        if '.' in amount_str:
            decimal_places = len(amount_str.split('.')[1])
            if decimal_places > max_decimals:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Amount cannot have more than {max_decimals} decimal places"
                )

    @staticmethod
    def validate_amount_range(
        amount: float,
        min_amount: float = 0.01,
        max_amount: float = 999999999.99
    ) -> None:
        """Validate amount is within acceptable range.
        
        Args:
            amount: Amount to validate.
            min_amount: Minimum allowed amount (default: 0.01).
            max_amount: Maximum allowed amount (default: 999999999.99).
            
        Raises:
            HTTPException: If amount is out of range.
        """
        if amount < min_amount:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Amount must be at least {min_amount}"
            )
        
        if amount > max_amount:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Amount cannot exceed {max_amount}"
            )

    @staticmethod
    def validate_transaction_parties(
        buyer_id: int,
        seller_id: int,
        buyer_org: str,
        seller_org: str
    ) -> None:
        """Validate transaction parties meet business rules.
        
        Args:
            buyer_id: Buyer user ID.
            seller_id: Seller user ID.
            buyer_org: Buyer organization name.
            seller_org: Seller organization name.
            
        Raises:
            HTTPException: If validation fails.
        """
        # Users must be different
        if buyer_id == seller_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Buyer and seller must be different users"
            )
        
        # Organizations should be different (optional business rule)
        if buyer_org.lower() == seller_org.lower():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Buyer and seller must be from different organizations"
            )


# Create singleton instance
transaction_validator = TransactionValidator()