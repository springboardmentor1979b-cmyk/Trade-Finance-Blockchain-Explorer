"""Authentication service module.

Provides user authentication and authorization services including user registration,
login, token generation, token refresh, and token revocation functionality.
Includes Redis-based token blocklist management for logout operations.

Core Responsibilities:
    - User registration with email and password validation
    - User authentication with credential verification
    - JWT token generation (access and refresh tokens)
    - Token refresh using refresh tokens
    - Token revocation via Redis blocklist

Service Methods:
    - register_user: Create new user with validated credentials
    - authenticate_user: Verify credentials and issue tokens
    - new_acces_token: Issue new token pair using refresh token
    - revoke_token: Add tokens to Redis blocklist for logout

Validation:
    - Email format validation before database operations
    - Password strength enforcement (5 requirements via regex)
    - User duplicate detection to prevent account overlap

Integration:
    - SQLModel ORM for database operations
    - JWTHandler for token creation and validation
    - Redis for stateful token revocation
    - Custom exception classes for standardized error handling

Note:
    - All database operations use SQLModel Session
    - Token payloads include sub (user ID), email, role, and JTI for revocation
    - Access tokens expire in 10 minutes, refresh tokens in 7 days
    - Password hashing uses Argon2 via passlib
"""

import time

from fastapi import Response
from sqlmodel import Session, select
from datetime import datetime, timedelta, timezone

from src.db.models import Users, PasswordResetTokens
from src.db.redis import add_jti_blocklist
from src.errors import (
    InvalidCredentials,
    InvalidEmailFormat,
    InvalidToken,
    PasswordMissing,
    RefreshTokenRequired,
    UserAlreadyExists,
    UserNotFound,
)

from .schemas import UserCreateModel, UserLoginModel, UserEmailModel
from .utils import (
    JWTHandler,
    hash_password,
    validate_email,
    validate_password,
    verify_password,
    generate_otp,
    verify_otp,
)


class authService:
    """Service class for authentication operations.

    Handles all authentication-related operations including user registration,
    credential validation, JWT token generation and refresh, and token revocation
    via Redis blocklist support.

    Public Methods:
        - get_user_by_email(email, db): Retrieve user by email address
        - get_user_by_id(user_id, db): Retrieve user by user ID
        - register_user(user, db): Register new user with validation
        - authenticate_user(login, db): Verify credentials and issue tokens
        - new_acces_token(data, db): Refresh token pair using refresh token
        - revoke_token(logout_data, token): Add tokens to Redis blocklist

    Authentication Flow:
        1. Registration: Validate email/password → check duplicates → hash → persist
        2. Login: Verify credentials → generate JWT pair → return tokens
        3. Refresh: Validate refresh token → lookup user → generate new token pair
        4. Logout: Decode tokens → extract JTI → add to Redis blocklist

    Integration Points:
        - SQLModel for ORM and database operations
        - JWTHandler for token creation and validation
        - Redis blocklist for stateful token revocation
        - Custom exceptions for consistent error handling

    Note:
        All methods expect SQLModel Session objects for database operations.
        Token revocation prevents reuse of logged-out tokens regardless of
        expiration time.
    """

    def get_user_by_email(self, email: str, db: Session):
        """Retrieve a user from the database by email address.

        Searches the database for a user with the specified email address.
        Email format is validated before querying the database.

        Args:
            email (str): The email address to search for. Must be in valid email format.
            db (Session): SQLModel database session for executing queries.

        Returns:
            Users: The user object if found, None if no user exists with that email.

        Raises:
            InvalidEmailFormat: If the email format is invalid.

        Note:
            Performs email format validation before database query.
            Uses SQLModel select() with where() clause for type-safe queries.
        """
        if validate_email(email) is False:
            raise InvalidEmailFormat()
        return db.exec(select(Users).where(Users.email == email)).first()

    def get_user_by_id(self, user_id: int, db: Session):
        """Retrieve a user from the database by user ID.

        Searches the database for a user with the specified unique identifier.
        Used primarily for token refresh and user lookup operations.

        Args:
            user_id (int): The unique integer identifier of the user.
            db (Session): SQLModel database session for executing queries.

        Returns:
            Users: The user object if found, None if no user exists with that ID.

        Note:
            User ID is extracted from JWT token's 'sub' claim during authentication.
            Returns None if user has been deleted from database.
        """
        return db.exec(select(Users).where(Users.id == user_id)).first()

    def register_user(self, user: UserCreateModel, db: Session):
        """Register a new user in the system.

        Creates a new user account with validated email and strong password. Validates email format
        and password strength before persisting. Raises an exception if validation fails or user
        with the same email already exists.

        Args:
            user (UserCreateModel): User registration data including email, name, password, role, and org_name.
            db (Session): Database session for persisting the user.

        Returns:
            Users: The newly created user object.

        Raises:
            HTTPException: If email format is invalid (status 400).
            HTTPException: If user with email already exists (status 400).
            HTTPException: If password is missing (status 400).
            HTTPException: If password fails strength validation (status 400) with code "invalid_password"
                and list of detailed error messages.

        Password Strength Requirements:
            - Minimum 8 characters
            - At least one uppercase letter (A-Z)
            - At least one lowercase letter (a-z)
            - At least one digit (0-9)
            - At least one special character (non-alphanumeric)

        Note:
            - Email format validated first before checking for duplicates
            - Password validation errors returned as structured response with detailed messages
            - Password hashed with Argon2 before storage in database
        """
        try:
            data = user.model_dump()

            email = data["email"]
            name = data["name"]
            password = data["password"]
            role = data["role"]
            org_name = data["org_name"]

            if not validate_email(email):
                raise InvalidEmailFormat()

            if self.get_user_by_email(email, db):
                raise UserAlreadyExists()

            if not password:
                raise PasswordMissing()

            errors = validate_password(password)
            if errors:
                raise InvalidCredentials()

            hashed = hash_password(password)

            new_user = Users(
                name=name, email=email, password=hashed, role=role, org_name=org_name
            )  # type: ignore

            db.add(new_user)
            db.commit()
            db.refresh(new_user)

            return new_user
        except Exception:
            db.rollback()
            raise

    def authenticate_user(self, login: UserLoginModel, response: Response, db: Session):
        """Authenticate a user and generate JWT token pair.

        Verifies user credentials (email and password) against the database.
        Upon successful authentication, generates both an access token (short-lived,
        10 minutes) and refresh token (long-lived, 7 days) for the user.

        Args:
            login (UserLoginModel): Login credentials containing email and password.
            db (Session): SQLModel database session for user lookup.

        Returns:
            TokenResponseModel: Object containing access_token, refresh_token, token_type.

        Raises:
            UserNotFound: If user with provided email does not exist (status 404).
            InvalidCredentials: If password verification fails (status 401).

        Token Payloads:
            Access claims: sub (user ID), email, role, type ("access"), jti, exp
            Refresh claims: sub (user ID), email, type ("refresh"), jti, exp

        Note:
            Password verified using constant-time comparison via passlib.
            Tokens include JTI claims for Redis blocklist revocation.
            Access tokens required in Authorization header for protected endpoints.
        """
        user = self.get_user_by_email(login.email, db)
        if not user:
            raise UserNotFound()

        if not verify_password(login.password, user.password):
            raise InvalidCredentials()

        access_payload = {"sub": str(user.id), "email": user.email, "role": user.role}

        refresh_payload = {"sub": str(user.id), "email": user.email}

        access = JWTHandler.create_access_token(access_payload)
        refresh = JWTHandler.create_refresh_token(refresh_payload)

        return {
            "user": user,
            "access_token": access,
            "refresh_token": refresh,
            "token_type": "bearer",
        }

    def new_acces_token(self, refresh_token: str | None, db: Session):
        """Generate a new token pair using a valid refresh token.

        Validates the provided refresh token and generates both new access and
        refresh tokens for the user. Enables token rotation without re-authentication.

        Args:
            data (RefreshRequest): Request object containing the refresh_token.
            db (Session): SQLModel database session for user lookup.

        Returns:
            TokenResponseModel: New access_token, refresh_token, and token_type.

        Raises:
            RefreshTokenRequired: If refresh token is missing or type is not "refresh".
            InvalidCredentials: If token payload is invalid or empty.
            InvalidToken: If 'sub' claim is missing from token.
            HTTPException: If token subject is not a valid integer (status 401).
            UserNotFound: If user associated with token not found (status 404).

        Token Validation:
            - Must not be revoked (not in Redis blocklist)
            - Signature must be valid (signed with JWT_SECRET_KEY)
            - Must not be expired
            - Type claim must be "refresh" (not "access")
            - Associated user must exist in database

        Note:
            Allows refresh even if access token is expired.
            Generates new tokens with fresh expiration times.
            Old tokens not automatically revoked; use /logout for explicit revocation.
        """
        if not refresh_token:
            raise RefreshTokenRequired()

        payload = JWTHandler.decode_jwt_token(refresh_token)

        if not payload:
            raise InvalidCredentials()

        if payload.get("type") != "refresh":
            raise RefreshTokenRequired()

        sub = payload.get("sub")
        if not sub:
            raise InvalidToken()

        try:
            user_id = int(sub)
        except ValueError as exc:
            raise InvalidToken() from exc

        user = self.get_user_by_id(user_id, db)
        if not user:
            raise UserNotFound()

        access_payload = {"sub": str(user.id), "email": user.email, "role": user.role}

        refresh_payload = {"sub": str(user.id), "email": user.email}

        new_access = JWTHandler.create_access_token(access_payload)
        new_refresh = JWTHandler.create_refresh_token(refresh_payload)

        return {
            "access_token": new_access,
            "refresh_token": new_refresh,
            "token_type": "bearer",
        }

    def revoke_token(
        self,
        refresh_token: str | None = None,
        token: str | None = None,
    ) -> bool:
        """
        Safely revoke access and refresh tokens by blocklisting their JTIs.

        - Idempotent (never fails)
        - Handles missing / expired tokens
        - Logout-safe
        """

        current_time = int(time.time())

        # ---------- ACCESS TOKEN ----------
        if token:
            try:
                access_payload = JWTHandler.decode_jwt_token(
                    token, options={"verify_exp": False}
                )
                access_jti = access_payload.get("jti")  # type: ignore
                access_exp = access_payload.get("exp")  # type: ignore

                if access_jti and access_exp:
                    ttl = access_exp - current_time
                    if ttl > 0:
                        add_jti_blocklist(access_jti, ttl)
            except Exception:
                pass  # logout must never fail

        # ---------- REFRESH TOKEN ----------
        if refresh_token:
            try:
                refresh_payload = JWTHandler.decode_jwt_token(
                    refresh_token, options={"verify_exp": False}
                )
                refresh_jti = refresh_payload.get("jti")  # type: ignore
                refresh_exp = refresh_payload.get("exp")  # type: ignore

                if refresh_jti and refresh_exp:
                    ttl = refresh_exp - current_time
                    if ttl > 0:
                        add_jti_blocklist(refresh_jti, ttl)
            except Exception:
                pass  # logout must never fail

        return True

    def initiate_password_reset(self, email: UserEmailModel, db: Session):
        """Initiate password reset process for a user.

        Validates the provided email and checks if a user exists with that email.
        If the user exists, generates a password reset token and sends it via email.

        Args:
            email (str): The email address of the user requesting password reset.
            db (Session): SQLModel database session for user lookup.
        Returns:
            bool: True if the password reset process was initiated successfully.
        Raises:
            InvalidEmailFormat: If the email format is invalid (status 400).
            UserNotFound: If no user exists with the provided email (status 404).
        """
        if validate_email(email.email) is False:
            raise InvalidEmailFormat()

        user = self.get_user_by_email(email.email, db)
        if not user:
            raise UserNotFound()

        existing_tokens = db.exec(
            select(PasswordResetTokens).where(PasswordResetTokens.user_id == user.id)
        ).all()

        for token in existing_tokens:
            token.is_used = True

        print("Password reset token generated and sent via email (simulated).")
        otp = generate_otp()
        expiry = datetime.now(timezone.utc) + timedelta(minutes=5)
        new_token = PasswordResetTokens(user_id=user.id, token=otp, expires_at=expiry)  # type: ignore
        db.add(new_token)
        db.commit()
        db.refresh(new_token)
        print(f"the otp is : {otp} for email {email}")
        return True

    def verify_otp_service(self, email: str, otp: str, db: Session):
        """Verify the provided OTP for password reset.

        Validates the OTP against the expected value. If valid, allows the user
        to proceed with password reset.

        Args:
            otp (str): The one-time password provided by the user.
            db (Session): SQLModel database session for user lookup.

        Returns:
            bool: True if OTP is valid, False otherwise.

        Raises:
            InvalidCredentials: If the OTP is invalid or expired (status 400).
        """
        user = self.get_user_by_email(email, db)
        if not user:
            raise UserNotFound()
        token_entry = db.exec(
            select(PasswordResetTokens)
            .where(PasswordResetTokens.user_id == user.id)
            .order_by(PasswordResetTokens.created_at.desc())  # type: ignore
        ).first()
        if not token_entry:
            raise InvalidCredentials()
        expires_at = token_entry.expires_at
        if expires_at.tzinfo is None:
            expires_at = expires_at.replace(tzinfo=timezone.utc)
        if expires_at < datetime.now(timezone.utc) and not token_entry.is_used:
            raise InvalidCredentials()
        return verify_otp(otp, token_entry.token)

    def reset_password(self, email: str, new_password: str, db: Session):
        """Reset the user's password.

        Validates the new password strength and updates the user's password in the database.

        Args:
            new_password (str): The new password to set for the user.
            db (Session): SQLModel database session for user lookup and update.

        Returns:
            bool: True if password was successfully reset.

        Raises:
            InvalidCredentials: If the new password fails strength validation (status 400).
        """
        errors = validate_password(new_password)
        if errors:
            raise InvalidCredentials()

        user = self.get_user_by_email(email, db)
        if not user:
            raise UserNotFound()

        hashed = hash_password(new_password)
        user.password = hashed
        db.add(user)
        db.commit()
        db.refresh(user)
        return True
