"""Database configuration and session management module.

Sets up SQLModel database engine and provides a FastAPI dependency for
obtaining database sessions.
"""

from sqlmodel import Session, create_engine
from src.config import settings

# SQLModel database engine - manages connections to the database
engine = create_engine(settings.POSTGRES_DATABASE_URL, echo=False)


def get_session():
    """Get a database session for dependency injection in FastAPI.

    This is a FastAPI dependency that provides a database session to route handlers.
    The session is automatically closed after the request is processed.

    Yields:
        Session: A SQLModel database session for executing queries.

    Note:
        Use this as a dependency in FastAPI route handlers:

        @app.get("/")
        def my_route(db: Session = Depends(get_session)):
            # Use db to query the database
            pass
    """
    with Session(engine) as session:
        yield session
