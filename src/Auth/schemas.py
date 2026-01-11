"""Authentication data schemas module.

Defines Pydantic models for request/response validation in authentication endpoints,
including user registration, login, token management, and role definitions.
"""

from pydantic import BaseModel, EmailStr, Field
from src.db.enums import RoleChoices


class UserCreateModel(BaseModel):
    """User registration data model.

    Pydantic model for validating user registration requests.
    Used when a new user creates an account in the system.

    Attributes:
        name (str): Full name of the user.
        email (EmailStr): Email address of the user. Must be a valid email format.
        password (str): User password. Must be at least 8 characters long.
        role (RoleEnum): User role (bank, corporate, auditor, or admin).
        org_name (str): Name of the user's organization.
    """

    name: str
    email: EmailStr
    password: str = Field(min_length=8)
    role: RoleChoices
    org_name: str


class UserResponseModel(BaseModel):
    """User response data model.

    Pydantic model for returning user information in API responses.
    Does not include sensitive information like passwords.

    Attributes:
        id (int): Unique identifier of the user.
        name (str): Full name of the user.
        email (EmailStr): Email address of the user.
        role (RoleEnum): User role (bank, corporate, auditor, or admin).
        org_name (str): Name of the user's organization.
    """

    id: int
    name: str
    email: EmailStr
    role: RoleChoices
    org_name: str


class UserLoginModel(BaseModel):
    """User login credentials model.

    Pydantic model for validating user login requests.

    Attributes:
        email (EmailStr): Email address of the user. Must be a valid email format.
        password (str): User password.
    """

    email: EmailStr
    password: str


class TokenResponseModel(BaseModel):
    """JWT token response model.

    Pydantic model for returning authentication tokens in API responses.
    Includes both access and refresh tokens for secure session management.

    Attributes:
        access_token (str): JWT access token for making authenticated requests.
        refresh_token (str): JWT refresh token for obtaining new access tokens.
        token_type (str): Type of token, typically "bearer" for HTTP Bearer authentication.
    """

    access_token: str
    token_type: str


class RefreshRequest(BaseModel):
    """Token refresh request model.

    Pydantic model for validating token refresh requests.
    Used when exchanging a refresh token for new access and refresh tokens.

    Attributes:
        refresh_token (str): The refresh token to exchange for new tokens.
    """

    refresh_token: str


class UserEmailModel(BaseModel):
    """User email model.

    Pydantic model for validating requests that require only the user's email address.
    Used in scenarios like password reset requests.

    Attributes:
        email (EmailStr): Email address of the user. Must be a valid email format.
    """

    email: EmailStr
