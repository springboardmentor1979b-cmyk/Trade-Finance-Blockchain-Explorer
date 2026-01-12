"""Custom exception and error handling module.

Defines application-specific exception classes for authentication, authorization,
and token management errors. Provides centralized error handlers that register with
FastAPI to return consistent JSON error responses across the API.
"""

from typing import Any, Callable

from fastapi import FastAPI, Request, status
from fastapi.responses import JSONResponse
from jose import ExpiredSignatureError, JWTError


class TradeExplorerException(Exception):
    """Base exception class for all application-specific errors.

    All custom exceptions in the trade explorer system inherit from this class.
    This allows for centralized error handling and consistent error response formatting.
    """

    pass


class InvalidToken(TradeExplorerException):
    """Exception raised when a token is invalid or has expired.

    Occurs when a user provides a token that fails validation, signature verification,
    or has passed its expiration timestamp.
    """

    pass


class RevokedToken(TradeExplorerException):
    """Exception raised when a token has been revoked.

    Occurs when a user provides a token whose JTI (JWT ID) is in the Redis blocklist,
    indicating the token was revoked during logout.
    """

    pass


class AccessTokenRequired(TradeExplorerException):
    """Exception raised when an access token is required but not provided.

    Occurs when a user provides a refresh token for an endpoint that requires
    an access token for authentication.
    """

    pass


class RefreshTokenRequired(TradeExplorerException):
    """Exception raised when a refresh token is required but not provided.

    Occurs when a user provides an access token for a refresh endpoint that requires
    a refresh token.
    """

    pass


class UserAlreadyExists(TradeExplorerException):
    """Exception raised when attempting to register a user with an existing email.

    Occurs during user registration when the provided email address is already
    associated with an existing user account in the database.
    """

    pass


class InvalidCredentials(TradeExplorerException):
    """Exception raised when login credentials are invalid.

    Occurs when a user provides an incorrect email address or password combination
    during the login process.
    """

    pass


class InsufficientPermission(TradeExplorerException):
    """Exception raised when user lacks required permissions.

    Occurs when an authenticated user attempts an action that requires specific
    permissions or role-based access control restrictions.
    """

    pass


class UserNotFound(TradeExplorerException):
    """Exception raised when a user cannot be found in the database.

    Occurs when attempting to retrieve, update, or perform operations on a user
    that does not exist in the system.
    """

    pass


class AccountNotVerified(Exception):
    """Exception raised when attempting to use an unverified account.

    Occurs when a user tries to access features that require account verification,
    but their account has not yet been verified through email confirmation.
    """

    pass


class InvalidEmailFormat(TradeExplorerException):
    """Exception raised when an email address has an invalid format.

    Occurs during user registration or profile updates when the provided email
    does not confirm to standard email formatting rules.
    """

    pass


class InvalidPasswordFormat(TradeExplorerException):
    """Exception raised when a password does not meet complexity requirements.

    Occurs during user registration or password updates when the provided password
    fails to meet defined complexity rules (length, character types, etc.).
    """

    pass


class PasswordMissing(TradeExplorerException):
    """Exception raised when a required password is missing.

    Occurs during user registration or password updates when no password is provided.
    """

    pass


class LogoutError(TradeExplorerException):
    """Exception raised when an error occurs during logout.

    Occurs when there is a failure in the logout process, such as issues
    revoking tokens or updating session state.
    """

    pass


class DupliacateDocument(TradeExplorerException):
    """Exception raised when a duplicate document is detected.

    Occurs when attempting to add a document that already exists in the system,
    based on its cryptographic hash.
    """

    pass


class DocumentNotFound(TradeExplorerException):
    """Exception raised when a document cannot be found in the database.

    Occurs when attempting to retrieve or perform operations on a document
    that does not exist in the system.
    """

    pass


class UnauthorizedDocumentAccess(TradeExplorerException):
    """Exception raised when a user attempts to access a document they do not own.

    Occurs when a user tries to retrieve or manipulate a document that belongs
    to another user.
    """

    pass


class DocumentUploadError(TradeExplorerException):
    """Exception raised when an error occurs during document upload.

    Occurs when there is a failure in the document upload process, such as issues
    saving the file or generating its hash.
    """

    pass


class DocumentProcessingError(TradeExplorerException):
    """Exception raised when an error occurs during document processing.

    Occurs when there is a failure in processing the document, such as issues
    reading the file or extracting necessary metadata.
    """

    pass


class ExternalServiceError(TradeExplorerException):
    """Exception raised when an external service call fails.

    Occurs when there is a failure in communicating with an external service,
    such as a third-party API or microservice.
    """

    pass


class DocumentNotUploaded(TradeExplorerException):
    """Exception raised when a document is not uploaded successfully.

    Occurs when there is a failure in the document upload process, such as issues
    saving the file or generating its hash.
    """

    pass


class InvalidDocumentFormat(TradeExplorerException):
    """Exception raised when a document has an invalid format.

    Occurs during document upload or processing when the provided document
    does not conform to expected formatting rules.
    """

    pass


class DocumentDeleteError(TradeExplorerException):
    """Exception raised when an error occurs during document deletion.

    Occurs when there is a failure in the document deletion process, such as issues
    removing the file or updating database records.
    """

    pass


def create_exception_handler(
    status_code: int, initial_detail: Any
) -> Callable[[Request, Exception], JSONResponse]:
    """Create a FastAPI exception handler for custom exceptions.

    Factory function that generates standardized exception handlers that convert
    custom exceptions into consistent JSON responses with specified status codes
    and error details.

    Args:
        status_code (int): HTTP status code to return in the response.
        initial_detail (Any): Error details to include in the JSON response.
            Typically a dict with 'message', 'error_code', and optional 'resolution'.

    Returns:
        Callable: A synchronous exception handler function that FastAPI can register.
    """

    def exception_handler(request: Request, exc: TradeExplorerException):
        return JSONResponse(content=initial_detail, status_code=status_code)

    return exception_handler  # type: ignore


def register_error_handlers(app: FastAPI):
    """Register all custom exception handlers with the FastAPI application.

    Configures the FastAPI app to handle application-specific exceptions and return
    consistent JSON error responses with appropriate HTTP status codes and error details.
    Also registers a generic handler for HTTP 500 internal server errors.

    Args:
        app (FastAPI): The FastAPI application instance to register handlers with.

    Note:
        - Each exception type is mapped to a specific HTTP status code
        - Error responses include 'message', 'error_code', and optional 'resolution'
        - This function should be called during application initialization
    """
    app.add_exception_handler(
        UserAlreadyExists,
        create_exception_handler(
            status_code=status.HTTP_403_FORBIDDEN,
            initial_detail={
                "message": "User with email already exists",
                "error_code": "user_exists",
            },
        ),
    )

    app.add_exception_handler(
        UserNotFound,
        create_exception_handler(
            status_code=status.HTTP_404_NOT_FOUND,
            initial_detail={
                "message": "User not found",
                "error_code": "user_not_found",
            },
        ),
    )
    app.add_exception_handler(
        InvalidCredentials,
        create_exception_handler(
            status_code=status.HTTP_400_BAD_REQUEST,
            initial_detail={
                "message": "Invalid Email Or Password",
                "error_code": "invalid_email_or_password",
            },
        ),
    )
    app.add_exception_handler(
        InvalidToken,
        create_exception_handler(
            status_code=status.HTTP_401_UNAUTHORIZED,
            initial_detail={
                "message": "Token type is invalid Or expired",
                "resolution": "Please provide valid token",
                "error_code": "invalid_token",
            },
        ),
    )
    app.add_exception_handler(
        RevokedToken,
        create_exception_handler(
            status_code=status.HTTP_401_UNAUTHORIZED,
            initial_detail={
                "message": "Token is invalid or has been revoked",
                "resolution": "Please get new token",
                "error_code": "token_revoked",
            },
        ),
    )
    app.add_exception_handler(
        AccessTokenRequired,
        create_exception_handler(
            status_code=status.HTTP_401_UNAUTHORIZED,
            initial_detail={
                "message": "Please provide a valid access token",
                "resolution": "Please get an access token",
                "error_code": "access_token_required",
            },
        ),
    )
    app.add_exception_handler(
        RefreshTokenRequired,
        create_exception_handler(
            status_code=status.HTTP_403_FORBIDDEN,
            initial_detail={
                "message": "Please provide a valid refresh token",
                "resolution": "Please get an refresh token",
                "error_code": "refresh_token_required",
            },
        ),
    )
    app.add_exception_handler(
        InsufficientPermission,
        create_exception_handler(
            status_code=status.HTTP_401_UNAUTHORIZED,
            initial_detail={
                "message": "You do not have enough permissions to perform this action",
                "error_code": "insufficient_permissions",
            },
        ),
    )

    app.add_exception_handler(
        AccountNotVerified,
        create_exception_handler(
            status_code=status.HTTP_403_FORBIDDEN,
            initial_detail={
                "message": "Account not verified",
                "error_code": "Account_not_verified",
                "resolution": "please chehck your email for verification details",
            },
        ),
    )

    app.add_exception_handler(
        InvalidEmailFormat,
        create_exception_handler(
            status_code=status.HTTP_400_BAD_REQUEST,
            initial_detail={
                "message": "Invalid email format",
                "error_code": "invalid_email_format",
                "resolution": "Please provide a valid email address",
            },
        ),
    )

    app.add_exception_handler(
        InvalidPasswordFormat,
        create_exception_handler(
            status_code=status.HTTP_400_BAD_REQUEST,
            initial_detail={
                "message": "Password does not meet complexity requirements",
                "error_code": "invalid_password_format",
                "resolution": "Please provide a password that meets the required criteria",
            },
        ),
    )

    app.add_exception_handler(
        PasswordMissing,
        create_exception_handler(
            status_code=status.HTTP_400_BAD_REQUEST,
            initial_detail={
                "message": "Password is required",
                "error_code": "password_missing",
                "resolution": "Please provide a password",
            },
        ),
    )

    app.add_exception_handler(
        LogoutError,
        create_exception_handler(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            initial_detail={
                "message": "An error occurred during logout",
                "error_code": "logout_error",
                "resolution": "Please try logging out again later",
            },
        ),
    )

    app.add_exception_handler(
        DocumentNotFound,
        create_exception_handler(
            status_code=status.HTTP_404_NOT_FOUND,
            initial_detail={
                "message": "Document not found",
                "error_code": "document_not_found",
            },
        ),
    )

    app.add_exception_handler(
        UnauthorizedDocumentAccess,
        create_exception_handler(
            status_code=status.HTTP_401_UNAUTHORIZED,
            initial_detail={
                "message": "You do not have access to this document",
                "error_code": "unauthorized_document_access",
            },
        ),
    )

    app.add_exception_handler(
        DupliacateDocument,
        create_exception_handler(
            status_code=status.HTTP_409_CONFLICT,
            initial_detail={
                "message": "Duplicate document detected",
                "error_code": "duplicate_document",
                "resolution": "Please check the document and try again",
            },
        ),
    )

    app.add_exception_handler(
        DocumentNotUploaded,
        create_exception_handler(
            status_code=status.HTTP_400_BAD_REQUEST,
            initial_detail={
                "message": "No document was uploaded",
                "error_code": "document_upload_error",
                "resolution": "Please try uploading the document again",
            },
        ),
    )

    app.add_exception_handler(
        InvalidDocumentFormat,
        create_exception_handler(
            status_code=status.HTTP_400_BAD_REQUEST,
            initial_detail={
                "message": "The document format is invalid",
                "error_code": "invalid_document_format",
                "resolution": "Please upload a document in the correct format",
            },
        ),
    )

    app.add_exception_handler(
        DocumentUploadError,
        create_exception_handler(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            initial_detail={
                "message": "An error occurred during document upload",
                "error_code": "document_upload_error",
                "resolution": "Please try uploading the document again later",
            },
        ),
    )

    app.add_exception_handler(
        DocumentDeleteError,
        create_exception_handler(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            initial_detail={
                "message": "An error occurred during document deletion",
                "error_code": "document_delete_error",
                "resolution": "Please try deleting the document again later",
            },
        ),
    )

    app.add_exception_handler(
        ExpiredSignatureError,
        create_exception_handler(
            status_code=status.HTTP_401_UNAUTHORIZED,
            initial_detail={
                "message": "Token has expired",
                "resolution": "Please refresh your token",
                "error_code": "token_expired",
            },
        ),
    )

    app.add_exception_handler(
        JWTError,
        create_exception_handler(
            status_code=status.HTTP_401_UNAUTHORIZED,
            initial_detail={
                "message": "Invalid token",
                "resolution": "Please provide a valid token",
                "error_code": "invalid_token",
            },
        ),
    )

    @app.exception_handler(500)
    def internal_server_error(request, exc):
        return JSONResponse(
            content={
                "message": "Oops! Something went wrong",
                "error_code": "server_error",
            },
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )
