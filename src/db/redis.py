"""Redis token blocklist management module.

Handles token revocation using Redis as a cache. When users log out, their token's
JTI (JWT ID) is stored in Redis blocklist to prevent reuse of revoked tokens.
"""

import redis
from src.config import settings

# Default expiry time for tokens in Redis blocklist (1 hour in seconds)
JTI_EXPIRY = 3600

# Redis client initialized from configuration URL
token_blocklist = redis.from_url(settings.REDIS_URL)


def add_jti_blocklist(jti: str, exp: int | None = None) -> None:
    """Add a JWT ID to the token blocklist.

    Stores the JTI (JWT ID) claim in Redis with an expiration time. Once a token
    is added to the blocklist, it cannot be used for authentication.

    Args:
        jti (str): The JWT ID (JTI) claim from the token to revoke.
        exp (int | None): Expiration time in seconds. If None, defaults to JTI_EXPIRY (3600 seconds).
            Should match the token's remaining TTL (time-to-live).

    Returns:
        None

    Note:
        - Redis automatically deletes the entry after the expiration time
        - The value stored is an empty string; only the key presence is checked
        - TTL should typically match the token's expiration time for efficiency
        - Used by revoke_token() to invalidate tokens on logout
    """
    token_blocklist.set(name=jti, value="", ex=JTI_EXPIRY if exp is None else exp)


def token_in_blocklist(jti: str) -> bool:
    """Check if a JWT ID is in the token blocklist.

    Queries Redis to determine if a token's JTI has been revoked. Used during
    authentication to reject tokens that have been logged out.

    Args:
        jti (str): The JWT ID (JTI) claim to check.

    Returns:
        bool: True if the JTI is in the blocklist (token is revoked), False otherwise.

    Note:
        - Checks for key existence in Redis
        - Returns False if Redis key has expired (auto-deleted by Redis)
        - Fast O(1) operation for checking token revocation status
        - Called by get_current_user() dependency to validate token status
    """
    jtis = token_blocklist.get(jti)

    return jtis is not None
