from dependency_injector import containers, providers
from app.core.database import Database
from app.core.settings import settings
from app.repository import (
    user_repository,
    student_repository,
    performance_repository,
    student_progress_repository,
    student_accuracy_repository
)
from app.service import (
    user_service,
    auth_service,
    student_service,
    language_service,
    performance_service,
    student_progress_service,
    student_accuracy_service
)


class Container(containers.DeclarativeContainer):
    wiring_config = containers.WiringConfiguration(
        modules=[
            "app.api.v1.endpoints.authentication",
            "app.api.v1.endpoints.users",
            "app.api.v1.endpoints.language",
            "app.api.v1.endpoints.questions",
            "app.api.v1.endpoints.performance",
            "app.api.v1.endpoints.student_progress",
            "app.api.v1.endpoints.student_accuracy"
        ]
    )

    db = providers.Singleton(Database, db_url=settings.DATABASE_URI)
   

    user_repository = providers.Factory(
        user_repository.UserRepository, session_factory=db.provided.session
    )

    student_repository = providers.Factory(
        student_repository.StudentRepository, session_factory=db.provided.session
    )

    performance_repository = providers.Factory(
        performance_repository.PerformanceRepository, session_factory=db.provided.session
    )

    student_progress_repository = providers.Factory(
        student_progress_repository.StudentProgressRepository, session_factory = db.provided.session
    )

    student_accuracy_repository = providers.Factory(
        student_accuracy_repository.StudentAccuracyRepository, session_factory = db.provided.session
    )

    auth_service = providers.Factory(
        auth_service.AuthService,
        user_repository=user_repository,
    )

    user_service = providers.Factory(
        user_service.UserService,
        user_repository=user_repository,
    )

    student_service = providers.Factory(
        student_service.StudentService,
        student_repository = student_repository
    )

    language_service = providers.Factory(
        language_service.LanguageService,
    )

    performance_service = providers.Factory(
        performance_service.PerformanceService,
         performance_repository=performance_repository  
    )

    student_progress_service = providers.Factory(
        student_progress_service.StudentProgressService,
        student_progress_repository = student_progress_repository
    )

    student_accuracy_service = providers.Factory(
        student_accuracy_service.StudentAccuracyService,
        student_accuracy_repository = student_accuracy_repository
    )

    


