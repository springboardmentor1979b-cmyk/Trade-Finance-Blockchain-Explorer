"""Middleware registration and configuration module.

Configures and registers middleware components for the FastAPI application,
including CORS (Cross-Origin Resource Sharing) for frontend communication
and TrustedHost validation for security.

Middleware Components:
    - CORSMiddleware: Enables cross-origin requests from frontend applications
    - TrustedHostMiddleware: Restricts requests to trusted hosts to prevent
      host header attacks

Note:
    Middleware order matters in FastAPI. Middleware added first will be
    executed last (LIFO - Last In First Out order).
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware


def register_middleware(app: FastAPI):
    """Register and configure all middleware for the FastAPI application.

    Adds CORS middleware to allow cross-origin requests from frontend clients
    and TrustedHost middleware to restrict requests to known hosts only.

    Args:
        app (FastAPI): The FastAPI application instance to register middleware on.

    Middleware Configuration:
        - CORS: Allows all origins, methods, headers with credentials
        - TrustedHost: Restricts to localhost and 127.0.0.1 (development)

    Note:
        - For production, update CORS allow_origins to specific frontend domain(s)
        - For production, update TrustedHost allowed_hosts to include production domain
        - CORS allow_credentials=True enables cookies and authorization headers
    """
    # CORS middleware: Allows cross-origin requests from frontend
    # Configuration allows all origins, methods, and headers for development
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["http://localhost:5173"],
        allow_methods=["*"],
        allow_headers=["*"],
        allow_credentials=True,
    )

    # TrustedHost middleware: Restricts requests to trusted hosts only
    # Prevents host header attacks by validating Host header is in allowed list
    app.add_middleware(
        TrustedHostMiddleware,
        allowed_hosts=["localhost", "127.0.0.1"],
    )
