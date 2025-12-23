"""Authentication utilities module.

Provides password hashing, verification, validation, and JWT token generation/validation
functionality for secure user authentication and authorization. Includes JTI (JWT ID) claims
for token revocation and blocklist support. Enforces strong password policies via regex patterns.
"""

import re
import uuid
from datetime import datetime, timedelta

from jose import ExpiredSignatureError, JWTError, jwt
from passlib.context import CryptContext

from src.config import settings

JWT_SECRET_KEY = settings.JWT_SECRET_KEY
JWT_ALGORITHM = settings.JWT_ALGORITHM
ACCESS_TOKEN_EXPIRE_MINUTES = 10  # Access token expiration time in minutes
REFRESH_TOKEN_EXPIRE_DAYS = 7  # Refresh token expiration time in days

UPPER = re.compile(r"[A-Z]")
LOWER = re.compile(r"[a-z]")
DIGIT = re.compile(r"\d")
SPECIAL = re.compile(r"[^A-Za-z0-9]")

# Password context for hashing and verifying passwords using Argon2
pwd_context = CryptContext(schemes=["argon2"], deprecated="auto")


def hash_password(plain_password: str) -> str:
    """Hash a plain text password using Argon2.

    Converts a plain text password into a securely hashed password that can be
    stored safely in the database. Uses Argon2 algorithm for strong security.

    Args:
        plain_password (str): The plain text password to hash.

    Returns:
        str: The hashed password string.

    Note:
        The output is deterministic - the same password will always produce different
        hashes due to random salt generation, preventing rainbow table attacks.
    """
    return pwd_context.hash(plain_password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a plain text password against a hashed password.

    Safely compares a plain text password with a hashed password stored in the
    database using constant-time comparison to prevent timing attacks.

    Args:
        plain_password (str): The plain text password provided by the user.
        hashed_password (str): The hashed password stored in the database.

    Returns:
        bool: True if passwords match, False otherwise.
    """
    return pwd_context.verify(plain_password, hashed_password)


def validate_password(password: str) -> list[str]:
    """Validate password strength against security policy.

    Checks that a password meets all minimum security requirements including length,
    character variety, and complexity. Returns a list of validation errors; empty list
    means the password is valid and strong.

    Password Requirements:
        - Minimum 8 characters
        - At least one uppercase letter (A-Z)
        - At least one lowercase letter (a-z)
        - At least one digit (0-9)
        - At least one special character (non-alphanumeric)

    Args:
        password (str): The password to validate.

    Returns:
        list[str]: List of validation error messages. Empty list if password is valid.
            Each error message describes one requirement that was not met.

    Example:
        >>> validate_password("weak")
        ['Password must be at least 8 characters long.', ...]
        >>> validate_password("Strong@1234")
        []

    Note:
        - All checks must pass for a valid password
        - Error messages are user-friendly and can be displayed directly
        - Use at service layer before calling hash_password()
    """
    errors = []

    if len(password) < 8:
        errors.append("Password must be at least 8 characters long.")
    if not UPPER.search(password):
        errors.append("Password must contain at least one uppercase letter.")
    if not LOWER.search(password):
        errors.append("Password must contain at least one lowercase letter.")
    if not DIGIT.search(password):
        errors.append("Password must contain at least one digit.")
    if not SPECIAL.search(password):
        errors.append("Password must contain at least one special character.")

    return errors


def validate_email(email: str) -> bool:
    """Validate the format of an email address.

    Uses a regular expression to check if the provided email address conforms
    to standard email formatting rules. Validates basic structure but does not
    verify that the email address actually exists or is deliverable.

    Args:
        email (str): The email address to validate.

    Returns:
        bool: True if the email format is valid, False otherwise.

    Note:
        - Validates format only, not existence of the email address
        - Allows common email formats with alphanumeric, dots, hyphens, underscores
        - Requires at least one @ symbol and a domain with extension
        - Use at schema validation layer (Pydantic EmailStr) or service layer
    """
    email_regex = re.compile(r"(^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$)")
    return bool(email_regex.match(email))


class JWTHandler:
    """JWT token handler for token creation and validation.

    Provides static methods for creating and validating JWT (JSON Web Token) tokens
    used for authentication and authorization in the application.
    """

    @staticmethod
    def create_access_token(data: dict, expiry: timedelta | None = None) -> str:
        """Create a JWT access token.

        Generates a signed JWT access token with the provided data and expiration time.
        Access tokens are short-lived and used for authenticating API requests.

        Args:
            data (dict): Payload data to encode in the token (e.g., user_id, email, role).
            expiry (timedelta | None): Token expiration duration. Defaults to 10 minutes
                if not provided.

        Returns:
            str: The encoded JWT access token.

        Note:
            The token automatically includes the following claims:
            - 'exp': Expiration timestamp
            - 'type': "access" token type identifier
            - 'jti': Unique JWT ID for token revocation tracking
        """
        payload = data.copy()
        if expiry is None:
            expiry = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        expiry_time = datetime.utcnow() + expiry

        payload.update({"exp": expiry_time, "type": "access"})
        payload.update({"jti": str(uuid.uuid4())})

        token = jwt.encode(payload, JWT_SECRET_KEY, algorithm=JWT_ALGORITHM)
        return token

    @staticmethod
    def create_refresh_token(data: dict, expiry: timedelta | None = None) -> str:
        """Create a JWT refresh token.

        Generates a signed JWT refresh token with the provided data and expiration time.
        Refresh tokens are long-lived and used to obtain new access tokens without
        requiring the user to re-authenticate with their credentials.

        Args:
            data (dict): Payload data to encode in the token (e.g., user_id, email).
            expiry (timedelta | None): Token expiration duration. Defaults to 7 days
                if not provided.

        Returns:
            str: The encoded JWT refresh token.

        Note:
            The token automatically includes the following claims:
            - 'exp': Expiration timestamp
            - 'type': "refresh" token type identifier
            - 'jti': Unique JWT ID for token revocation tracking
        """
        payload = data.copy()
        if expiry is None:
            expiry = timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)

        expiry_time = datetime.utcnow() + expiry
        payload.update({"exp": expiry_time, "type": "refresh"})
        payload.update({"jti": str(uuid.uuid4())})

        token = jwt.encode(payload, JWT_SECRET_KEY, algorithm=JWT_ALGORITHM)
        return token

    @staticmethod
    def decode_jwt_token(token: str) -> dict | None:
        """Decode and validate a JWT token.

        Decodes a JWT token, validates its signature, and checks expiration.
        Handles both raw tokens and tokens with "Bearer " prefix.

        Args:
            token (str): The JWT token to decode. Can include "Bearer " prefix.

        Returns:
            dict | None: The decoded token payload as a dictionary if valid,
                None if token is expired, invalid, malformed, or an error occurs.

        Note:
            - If token starts with "Bearer ", the prefix is automatically removed.
            - Expired tokens return None (not an exception).
            - All errors (expired, invalid signature, malformed) are caught and
              logged before returning None.
            - The returned dictionary includes standard claims:
              - 'exp': Expiration timestamp
              - 'type': "access" or "refresh" token type
              - 'jti': Unique JWT ID for revocation tracking
        """
        if isinstance(token, str) and token.startswith("Bearer "):
            token = token[7:].strip()

        try:
            decoded_token = jwt.decode(
                token, JWT_SECRET_KEY, algorithms=[JWT_ALGORITHM]
            )
            return decoded_token

        except ExpiredSignatureError:
            print("token expired")
            return None

        except JWTError as e:
            print("JWT decode error:", e)
            return None

        except Exception as e:
            print("Unexpected error decoding JWT:", e)
            return None
