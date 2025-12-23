"""Authentication router module.

Defines FastAPI routes for user authentication including registration, login,
token refresh, user profile retrieval, email verification, and logout functionality.
All endpoints handle JWT token-based authentication and return standardized JSON responses.

API Endpoints:
    GET /check-email: Check if email exists (public, no auth required)
    POST /register: Create new user account with validation
    POST /login: Authenticate and receive token pair
    POST /refresh: Exchange refresh token for new token pair
    GET /me: Retrieve current user profile (requires access token)
    POST /logout: Revoke tokens and log out user

HTTP Methods and Status Codes:
    - POST /register: 201 Created on success, 400 Bad Request on failure
    - POST /login: 200 OK on success, 404 Not Found if user not found
    - POST /refresh: 200 OK on success, 401 Unauthorized if token invalid
    - GET /me: 200 OK on success, 401 Unauthorized if not authenticated
    - POST /logout: 200 OK on success, 401 Unauthorized if token invalid

Security:
    - Passwords validated for strength (8+ chars, uppercase, lowercase, digit, special)
    - Email format validation required at registration
    - JWT tokens with expiration (access: 10 min, refresh: 7 days)
    - Revoked tokens tracked in Redis blocklist to prevent reuse
    - Bearer token scheme for authentication headers
    - Token blocklist checked on every authenticated request

Token Claims:
    - sub (subject): User ID as string
    - email: User email address
    - role: User role (bank, corporate, auditor, admin)
    - type: Token type ("access" or "refresh")
    - jti: JWT ID (unique identifier) for revocation tracking
    - exp: Token expiration timestamp (Unix time)

Dependencies:
    authService: Service layer providing authentication business logic
    get_current_user: FastAPI dependency for validating access tokens
    HTTPBearer: OAuth2 Bearer token security scheme
    get_session: FastAPI dependency for database session injection

Request/Response Models:
    UserCreateModel: Email, name, password, role, org_name
    UserLoginModel: Email and password
    RefreshRequest: Refresh token
    TokenResponseModel: Access token, refresh token, token type
    UserResponseModel: User profile data (id, email, name, role, org_name)

Note:
    - Email existence check is public and does not require authentication
    - All authenticated endpoints require valid access token in Authorization header
    - Token refresh is possible even with expired access tokens (refresh token must be valid)
    - Logout revokes both access and refresh tokens immediately
    - For production, implement rate limiting on /register and /login endpoints
"""

from fastapi import APIRouter, Depends, HTTPException, Response, status
from fastapi.params import Cookie
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlmodel import Session

from src.db.database import get_session

from .service import authService
from .dependency import get_current_user
from .schemas import (
    TokenResponseModel,
    UserCreateModel,
    UserLoginModel,
    UserResponseModel,
)

authRouter = APIRouter()
service = authService()
oauth2_scheme = HTTPBearer()


@authRouter.get("/check-email")
def check_email(email: str, db: Session = Depends(get_session)):
    """Check if an email address is already registered in the system.

    Public endpoint that allows clients to verify email availability during
    registration flow without requiring authentication.

    Args:
        email (str): The email address to check.
        db (Session): Database session. Injected by FastAPI's dependency system.

    Returns:
        dict: A dictionary with key "exists" (bool) indicating if email is registered.
            - exists: True if email is already registered, False if available.

    HTTP Status Codes:
        200: Email check completed successfully.

    Note:
        This endpoint is public and does not require authentication.
        Useful for real-time validation in frontend registration forms.
    """
    user = service.get_user_by_email(email, db)
    return {"exists": bool(user)}


@authRouter.post("/register", status_code=status.HTTP_201_CREATED)
def signup(
    user: UserCreateModel, db: Session = Depends(get_session)
) -> UserResponseModel:
    """Register a new user account in the system.

    Creates a new user account with the provided credentials and registration data.
    Validates email format, checks for duplicate accounts, and enforces password
    strength requirements before persisting the user to the database.

    Args:
        user (UserCreateModel): User registration data containing:
            - email (EmailStr): User email address (must be valid format)
            - name (str): Full name of the user
            - password (str): User password (must meet strength requirements)
            - role (RoleEnum): User role (bank, corporate, auditor, or admin)
            - org_name (str): Name of user's organization
        db (Session): Database session. Injected by FastAPI's dependency system.

    Returns:
        UserResponseModel: The newly created user object with id, email, name, role, and org_name.

    Raises:
        HTTPException: If validation fails or account creation fails (status 400).
            Possible error scenarios:
            - Invalid email format
            - User already exists with provided email
            - Missing password
            - Password fails strength validation (returns detailed error messages)

    HTTP Status Codes:
        201: User account successfully created.
        400: Validation failed or user already exists.

    Note:
        Password strength requirements:
        - Minimum 8 characters
        - At least one uppercase letter (A-Z)
        - At least one lowercase letter (a-z)
        - At least one digit (0-9)
        - At least one special character (non-alphanumeric)
    """
    created_user = service.register_user(user, db)

    if not created_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User already exists or could not be created",
        )
    return UserResponseModel(**created_user.model_dump())


@authRouter.post("/login", status_code=status.HTTP_200_OK)
def login(
    user_data: UserLoginModel, response: Response, db: Session = Depends(get_session)
) -> TokenResponseModel:
    """Authenticate user and generate JWT token pair.

    Validates user credentials (email and password) against the database.
    Upon successful authentication, returns both an access token (short-lived)
    and refresh token (long-lived) that can be used for subsequent requests.

    Args:
        user_data (UserLoginModel): Login credentials containing:
            - email (EmailStr): User email address
            - password (str): User password (plain text, hashed before comparison)
        db (Session): Database session. Injected by FastAPI's dependency system.

    Returns:
        TokenResponseModel: Object containing:
            - access_token (str): JWT access token (10 minute expiry)
            - refresh_token (str): JWT refresh token (7 day expiry)
            - token_type (str): Always "bearer"

    Raises:
        HTTPException: If user not found or credentials invalid (status 404).

    HTTP Status Codes:
        200: Authentication successful, token pair generated and returned.
        404: User not found or password incorrect.

    Note:
        - Access token must be included in Authorization header for protected endpoints
        - Refresh token is used with /refresh endpoint to obtain new token pair
        - Tokens contain JWT claims: sub, email, role, type, jti, exp
        - Password is hashed with Argon2 before comparison
    """
    token = service.authenticate_user(user_data, response, db)
    response.set_cookie(
        key="refresh_token",
        value=token["refresh_token"],
        httponly=True,
        secure=False,  # True in production (HTTPS), you can set False on localhost while dev
        samesite="lax",  # or "strict"
        max_age=7 * 24 * 60 * 60,  # 7 days
    )

    return TokenResponseModel(access_token=token["access_token"], token_type="bearer")


@authRouter.post("/refresh", response_model=TokenResponseModel)
def refresh_token_endpoint(
    response: Response,
    refresh_token: str | None = Cookie(default=None),  # type: ignore
    db: Session = Depends(get_session),
):
    """Exchange a valid refresh token for new access and refresh tokens.

    Validates the provided refresh token and generates a new pair of access and
    refresh tokens. This allows users to obtain fresh tokens without providing
    credentials again, enabling seamless user experience with token expiration.

    Args:
        data (RefreshRequest): Request object containing:
            - refresh_token (str): The valid refresh token to exchange
        db (Session): Database session. Injected by FastAPI's dependency system.

    Returns:
        TokenResponseModel: Object containing:
            - access_token (str): New JWT access token (10 minute expiry)
            - refresh_token (str): New JWT refresh token (7 day expiry)
            - token_type (str): Always "bearer"

    Raises:
        HTTPException: If refresh token is missing, invalid, expired, or revoked.
        HTTPException: If user associated with token is not found (status 404).

    HTTP Status Codes:
        200: New tokens successfully generated and returned.
        401: Refresh token is invalid, expired, or has been revoked.
        404: User associated with token not found in database.

    Note:
        - Refresh tokens must not be in Redis blocklist (revoked)
        - Refresh token must have valid signature and not be expired
        - Refresh token type must be "refresh" (not "access")
        - Even with expired access token, refresh is possible if refresh token is valid
        - New tokens issued with fresh expiration times
    """
    token = service.new_acces_token(refresh_token, db)
    response.set_cookie(
        key="refresh_token",
        value=token["refresh_token"],
        httponly=True,
        secure=False,  # True in production (HTTPS), you can set False on localhost while dev
        samesite="lax",
        max_age=7 * 24 * 60 * 60,  # 7 days
    )
    return TokenResponseModel(access_token=token["access_token"], token_type="bearer")


@authRouter.get("/me", status_code=status.HTTP_200_OK)
def get_logged_in_user(user: UserResponseModel = Depends(get_current_user)):
    """Retrieve the current authenticated user's profile information.

    Returns detailed profile information of the user associated with the provided
    access token. Requires a valid JWT access token in the Authorization header.
    This endpoint serves as a "who am I" endpoint for verifying token validity
    and retrieving user details.

    Args:
        user (UserResponseModel): The authenticated user object.
            Injected by get_current_user dependency which validates the access token
            from the Authorization header.

    Returns:
        UserResponseModel: The current user's profile data containing:
            - id (int): User's unique identifier
            - email (str): User's email address
            - name (str): User's full name
            - role (str): User's role (bank, corporate, auditor, admin)
            - org_name (str): User's organization name

    Raises:
        HTTPException: If access token is missing or invalid (status 401).
        HTTPException: If token has been revoked/logged out (status 401).
        HTTPException: If token is not an access token (status 401).
        HTTPException: If user is not found in database (status 404).

    HTTP Status Codes:
        200: User profile successfully retrieved.
        401: Missing, invalid, or revoked access token.
        404: User not found in database.

    Note:
        - Requires Authorization header with format: "Bearer <access_token>"
        - Access token is validated against Redis blocklist for revocation status
        - Token signature and expiration are verified
        - Safe endpoint for frontend to verify authentication status
    """
    return UserResponseModel(**user.model_dump())


@authRouter.post("/logout")
def logout(
    response: Response,
    refresh_token: str | None = Cookie(default=None),  # type: ignore
    token: HTTPAuthorizationCredentials = Depends(oauth2_scheme),
):
    """Log out the current user and revoke their authentication tokens.

    Handles user logout by extracting and revoking both the access and refresh
    tokens. Both tokens' JTI (JWT ID) claims are added to Redis blocklist,
    preventing any future use of either token regardless of expiration time.

    Args:
        logout_data (RefreshRequest): Request object containing:
            - refresh_token (str): The refresh token to revoke
        token (HTTPAuthorizationCredentials): The access token from Authorization header.
            Injected automatically by FastAPI's HTTPBearer dependency system.

    Returns:
        dict: Response object containing:
            - detail (str): "Successfully logged out" message
            - status_code (int): HTTP 200 status code

    Raises:
        HTTPException: If token extraction or revocation fails.

    HTTP Status Codes:
        200: User successfully logged out and tokens revoked.
        401: Invalid or missing authorization token.

    Note:
        - Both access and refresh tokens are added to Redis blocklist
        - JTI (JWT ID) claims are extracted and stored with TTL matching token expiry
        - Tokens cannot be reused for authentication after logout
        - Redis automatically removes expired JTI entries
        - Client should discard stored tokens after successful logout
        - Token revocation is immediate and applies globally
    """
    val = service.revoke_token(refresh_token=refresh_token, token=token.credentials)  # type: ignore
    if val:
        response.delete_cookie(key="refresh_token")
        return {"detail": "Successfully logged out", "status_code": status.HTTP_200_OK}
    raise HTTPException(
        detail="some error occured during logout",
        status_code=status.HTTP_400_BAD_REQUEST,
    )
