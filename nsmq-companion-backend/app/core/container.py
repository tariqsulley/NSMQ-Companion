from dependency_injector import containers, providers
from app.core.database import Database
from dependency_injector import containers, providers


from app.core.database import Database
from app.core.settings import settings
from app.repository import (
    user_repository,
)
from app.service import (
    user_service,
)


class Container(containers.DeclarativeContainer):
    wiring_config = containers.WiringConfiguration(
        modules=[
            "app.api.v1.endpoints.authentication",
            "app.api.v1.endpoints.users",
        ]
    )

    db = providers.Singleton(Database, db_url=settings.DATABASE_URI)

    # Repositories
    user_repository = providers.Factory(
        user_repository.UserRepository, session_factory=db.provided.session
    )

    #     auth_service = providers.Factory(
    #     auth_service.AuthService,
    #     user_repository=user_repository,
    #     email_verification_repository=email_verfication_repository,
    #     user_subscription_repository=user_subscription_repository,
    #     subscription_repository=subscription_repository,
    # )
    # user_service = providers.Factory(
    #     user_service.UserService,
    #     user_repository=user_repository,
    #     user_subscription_repository=user_subscription_repository,
    #     subscription_repository=subscription_repository,
    #     invitation_repository=team_member_invitation_repository,
    # )
