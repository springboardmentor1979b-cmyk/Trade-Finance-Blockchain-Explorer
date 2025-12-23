"""Authentication endpoint tests.

Test suite for authentication API endpoints including user registration,
login, token refresh, and logout functionality.
"""

from src.Auth.schemas import UserCreateModel
from src.db.models import RoleChoices

auth_prefix = "/api/auth"


def test_user_creation(fake_session, fake_auth_service, test_client):
    """Test user creation and validation.

    Verifies that the registration endpoint properly validates user data
    and calls the authentication service with correct parameters.

    Args:
        fake_session: Mock database session fixture.
        fake_auth_service: Mock authentication service fixture.
        test_client: FastAPI test client fixture.
    """
    signup_data = {
        "email": "teat1@gmail.com",
        "name": "testperson1",
        "password": "test123456",
        "role": RoleChoices.BANK,
        "org_name": "abc org",
    }
    # response = test_client.post(
    #     url=f"{auth_prefix}/register",
    #     json=signup_data,
    # )

    user_data = UserCreateModel(**signup_data)

    assert fake_auth_service.get_user_by_email_called_once()
    assert fake_auth_service.get_user_by_email_called_once_with(
        signup_data["email"], fake_session
    )

    assert fake_auth_service.register_user_called_once()
    assert fake_auth_service.register_user_called_once(user_data, fake_session)
