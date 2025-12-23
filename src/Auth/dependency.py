"""Authentication dependency module.

Provides FastAPI dependencies for OAuth2 bearer token authentication and
current user extraction from JWT tokens. Includes token blocklist validation
for logout functionality and role-based access control.

Dependencies:
    - get_current_user: Validates bearer token and returns authenticated user
    - get_current_user_role: Extracts role from authenticated user
    - role_required: Factory for role-based access control enforcement

Token Validation Flow:
    1. Extract bearer token from Authorization header
    2. Validate token scheme is "Bearer"
    3. Decode JWT and extract claims
    4. Check JTI against Redis blocklist (revocation check)
    5. Verify token type is "access"
    6. Look up user by email claim
    7. Return user object or raise exception

Security Features:
    - Bearer token scheme validation
    - JWT signature and expiration verification
    - Token revocation via Redis blocklist (JTI-based)
    - Token type validation (access vs refresh)
    - User existence verification
    - Role-based access control (RBAC)

Note:
    These dependencies are used in route handlers via FastAPI's Depends()
    mechanism. The HTTPBearer scheme automatically handles Authorization
    header parsing and validation.
"""

from fastapi import Depends
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlmodel import Session, select

from src.db.database import get_session
from src.db.models import Users
from src.db.redis import token_in_blocklist
from src.errors import (
    AccessTokenRequired,
    InsufficientPermission,
    InvalidToken,
    RevokedToken,
    UserNotFound,
)

from .utils import JWTHandler

oauth2_scheme = HTTPBearer()


def get_current_user(
    token: HTTPAuthorizationCredentials = Depends(oauth2_scheme),
    db: Session = Depends(get_session),
):
    """Extract and validate the current user from JWT access token.

    This is a FastAPI dependency that validates the bearer token from the Authorization
    header, decodes the JWT, checks if token is revoked, and retrieves the corresponding
    user from the database.

    Args:
        token (HTTPAuthorizationCredentials): The bearer token from Authorization header.
            Injected automatically by FastAPI's dependency system.
        db (Session): Database session for user lookup.
            Injected automatically by FastAPI's dependency system.

    Returns:
        Users: The authenticated user object.

    Raises:
        HTTPException: If token is missing or invalid (status 401).
        HTTPException: If token scheme is not 'Bearer' (status 401).
        HTTPException: If token has been revoked/logged out (status 401).
        HTTPException: If token type is not 'access' (status 401).
        HTTPException: If email claim is missing from token (status 401).
        HTTPException: If user is not found in database (status 404).

    Note:
        Checks token blocklist (via Redis) to ensure the token has not been revoked
        during logout. The JTI (JWT ID) claim is used to identify revoked tokens.
    """
    if not token or token.scheme.lower() != "bearer":
        raise InvalidToken()

    raw_token = token.credentials
    payload = JWTHandler.decode_jwt_token(raw_token)

    if not payload:
        raise InvalidToken()

    jti = str(payload.get("jti"))
    if token_in_blocklist(jti):
        raise RevokedToken()

    if payload.get("type") != "access":
        raise AccessTokenRequired()

    user_email = payload.get("email")
    if not user_email:
        raise InvalidToken()
    user = db.exec(select(Users).where(Users.email == user_email)).first()

    if not user:
        raise UserNotFound()

    return user


def get_current_user_role(data: Users = Depends(get_current_user)) -> str:
    """Retrieve the role of the current authenticated user.

    This is a FastAPI dependency that extracts the user's role from the
    authenticated user object provided by the get_current_user dependency.

    Args:
        data (Users): The authenticated user object.
            Injected automatically by FastAPI's dependency system.

    Returns:
        str: The role of the current user (e.g., "admin", "user").

    Note:
        This function simplifies access to the user's role for authorization
        checks in route handlers.
    """
    return data.role


def role_required(required_role: list[str]):
    """Dependency factory to enforce role-based access control.

    Creates a FastAPI dependency that checks if the current user's role
    matches one of the required roles for accessing a route.

    Args:
        required_role (list[str]): List of roles allowed to access the route.
    Returns:
        function: A FastAPI dependency function that performs the role check.
    Raises:
        HTTPException: If the user's role is not in the required roles (status 403).
    """

    def role_checker(user_role: str = Depends(get_current_user_role)):
        if user_role not in required_role:
            raise InsufficientPermission()
        return True

    return role_checker
