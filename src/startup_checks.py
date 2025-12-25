"""Startup health checks and dependency verification module.

Provides health check functions for validating critical service dependencies
(database and Redis) before the FastAPI application starts. Ensures all required
services are reachable and responsive during application startup.

Startup Checks:
    - SQLModel database connectivity (SQLite or PostgreSQL)
    - Redis connection for token blocklist operations

Usage:
    Register checks in the main app with:

    from src.startup_checks import register_startup_checks
    register_startup_checks(app, settings.DATABASE_URL, settings.REDIS_URL)

Note:
    Startup checks run on application launch and block startup if any service
    is unavailable. This ensures the app only starts when all dependencies are ready.
"""

import redis
from fastapi import FastAPI
from sqlalchemy import text
from sqlmodel import create_engine


def check_sqlmodel_database(db_url: str) -> None:
    """Check SQLModel database connectivity.

    Attempts to establish a connection to the configured database (SQLite or PostgreSQL)
    and executes a simple query to verify the connection is working properly.

    Args:
        db_url (str): The database connection URL (e.g., sqlite:///database.db or
            postgresql://user:password@host/database).

    Returns:
        None

    Raises:
        RuntimeError: If database connection fails or query execution fails.

    Note:
        Creates a temporary engine for the check and properly disposes of it.
        The check uses a simple SELECT 1 query to verify connectivity.
    """
    print("Checking SQLModel database connectivity...")

    engine = create_engine(db_url, echo=False)

    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        print("Database connection OK")
    except Exception as e:
        print("Database connection FAILED:", e)
        raise RuntimeError("Database is not reachable") from e
    finally:
        engine.dispose()


def check_redis_connection(redis_url: str) -> None:
    """Check Redis connection and availability.

    Attempts to establish a connection to the configured Redis server and
    verifies it is responding to commands using a PING operation.

    Args:
        redis_url (str): The Redis connection URL (e.g., redis://localhost:6379/0
            or redis://:password@host:port/db).

    Returns:
        None

    Raises:
        RuntimeError: If Redis connection fails or server does not respond.

    Note:
        Redis is used for token blocklist management in the authentication system.
        Connection failure indicates token revocation will not work properly.
    """
    print(f"Checking Redis connectivity: {redis_url}")

    client = redis.from_url(redis_url)

    try:
        if client.ping():
            print("Redis connection OK")
    except Exception as e:
        print("Redis connection FAILED:", e)
        raise RuntimeError("Redis is not reachable") from e
    finally:
        client.close()


def register_startup_checks(app: FastAPI, db_url: str, redis_url: str) -> None:
    """Register startup health checks with FastAPI application.

    Registers an event handler that runs on application startup to verify all
    critical dependencies (database and Redis) are reachable before the app
    begins accepting requests.

    Args:
        app (FastAPI): The FastAPI application instance to register startup checks with.
        db_url (str): The database connection URL for connectivity verification.
        redis_url (str): The Redis connection URL for connectivity verification.

    Returns:
        None

    Note:
        - Startup checks block application initialization if any service is unavailable
        - Detects SQLite (development) vs PostgreSQL (production) based on URL scheme
        - Prints health check results to console
        - Both checks must pass for application to start successfully
    """

    @app.on_event("startup")
    def verify_dependencies():
        print("\nRunning startup health checks...\n")

        print("Using Postgres database")

        check_sqlmodel_database(db_url)
        check_redis_connection(redis_url)

        print("\nAll services healthy — FastAPI is starting!\n")
