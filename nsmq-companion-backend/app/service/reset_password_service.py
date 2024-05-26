from app.repository.reset_password_repository import PasswordResetRepository
from app.service.base_service import BaseService


class ResetPassword(BaseService):
    def __init__(self, reset_password_repository: PasswordResetRepository):
        self.reset_password_repository = reset_password_repository
        super().__init__(reset_password_repository)

    def reset_password(self, user_uuid):
        try:
            return self.reset_password_repository.reset_password(user_uuid)
        except Exception as e:
            raise e

    def update_password(
        self, token: str, new_password: str, password_confirmation: str
    ):
        try:
            return self.reset_password_repository.update_password(
                token, new_password, password_confirmation
            )
        except Exception as e:
            raise e