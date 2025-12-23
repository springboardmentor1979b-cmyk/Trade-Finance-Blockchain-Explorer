"""Infosys Springboard API main application module.

Initializes and configures the FastAPI application instance with complete setup
including middleware configuration, error handler registration, startup checks,
and authentication route inclusion. This module serves as the entry point for
the entire API application.

Application Configuration:
    - Version: V1
    - Title: Infosys Springboard api
    - API Documentation: Available at /docs (Swagger UI) and /redoc (ReDoc)
    - Base URL: http://localhost:8000 (default)

Initialization Steps:
    1. Create FastAPI application with metadata and links
    2. Determine database (SQLite or PostgreSQL) based on USE_POSTGRES setting
    3. Register error handlers for custom exceptions
    4. Register middleware (CORS and TrustedHost)
    5. Register startup health checks (database and Redis)
    6. Include authentication router at /api/auth prefix

Attributes:
    app (FastAPI): The main FastAPI application instance configured with version,
        title, description, and social media links.
    DATABASE_URL (str): The active database connection URL (either SQLite or PostgreSQL).
    REDIS_URL (str): The Redis connection URL for token blocklist operations.

Features:
    - CORS middleware for cross-origin requests from frontend (development mode)
    - TrustedHost middleware for security validation
    - Centralized error handling with custom exception mapping
    - JWT-based authentication with token blocklist support
    - Startup health checks for database and Redis connectivity
    - API documentation with Swagger UI and ReDoc
    - Developer links (GitHub and LinkedIn) in API metadata

Integration Points:
    - register_error_handlers: Maps custom exceptions to HTTP responses
    - register_middleware: Adds CORS and TrustedHost validation
    - register_startup_checks: Verifies database and Redis availability
    - authRouter: Handles user registration, login, refresh, and logout

Note:
    - Error handlers must be registered before routes for proper exception mapping
    - Middleware is applied in the order registered (LIFO execution)
    - Startup checks block application initialization if any service is unavailable
    - Database selection (SQLite vs PostgreSQL) is controlled by USE_POSTGRES env var
    - Authentication routes use Bearer token scheme with JTI-based revocation
    - For production, update CORS allow_origins and TrustedHost allowed_hosts
"""

from fastapi import FastAPI

from src.config import settings
from src.startup_checks import register_startup_checks

from .Auth.router import authRouter
from .trade_chain.router import trade_chain_router
from .errors import register_error_handlers
from .middleware import register_middleware

app = FastAPI(
    version="V1",
    title="Infosys Springboard api",
    description="""
Connect with me:

- **GitHub**: [@Prabhatsingh001](https://github.com/Prabhatsingh001)
- **LinkedIn**: [Prabhat Singh](https://www.linkedin.com/in/prabhat-singh-736643287/)
    """,
)


DATABASE_URL = settings.POSTGRES_DATABASE_URL
REDIS_URL = settings.REDIS_URL

register_error_handlers(app)
register_middleware(app)

register_startup_checks(app, DATABASE_URL, REDIS_URL)

# Register authentication router with API prefix and tags
app.include_router(router=authRouter, prefix="/api/auth", tags=["Authentication"])
app.include_router(
    router=trade_chain_router, prefix="/api/trade_chain", tags=["Trade Chain"]
)
