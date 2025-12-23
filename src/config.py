"""Application configuration module.

Loads and manages environment-specific settings using Pydantic BaseSettings.
Configuration is read from the .env file and validated against the Settings model.
"""

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings configuration.

    Loads environment variables from the .env file and provides typed access
    to application configuration settings. Extra environment variables are ignored.

    Attributes:
        DATABASE_URL (str): The default database connection URL (e.g., sqlite:///database.db).
        POSTGRES_DATABASE_URL (str): The PostgreSQL database connection URL (e.g., postgresql://user:pass@host/db).
        USE_POSTGRES (bool): Flag to determine whether to use PostgreSQL or the default database.
        JWT_SECRET_KEY (str): The secret key used to sign JWT tokens. Must be kept secure.
        JWT_ALGORITHM (str): The algorithm used to sign JWT tokens (e.g., "HS256").
        REDIS_URL (str): Full Redis connection URL (e.g., redis://host:port/db).
        REDIS_HOST (str): Redis server hostname or IP address.
        REDIS_PORT (int): Redis server port number (default is 6379).

    Note:
        Settings are loaded from the .env file in the project root directory.
        All required attributes must be present in the .env file.
        The USE_POSTGRES flag controls which database URL is used at runtime.
        Redis is used for token blocklist management in the authentication system.
    """

    POSTGRES_DATABASE_URL: str
    JWT_SECRET_KEY: str
    JWT_ALGORITHM: str
    REDIS_URL: str
    REDIS_HOST: str
    REDIS_PORT: int

    model_config = SettingsConfigDict(
        env_file=".env",
        extra="ignore",
    )


# Global settings instance - use this to access configuration values throughout the application
settings = Settings()  # type: ignore
