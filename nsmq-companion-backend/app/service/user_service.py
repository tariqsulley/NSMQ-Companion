from datetime import datetime, timedelta
from uuid import UUID

from pydantic import EmailStr

from app.core import messages
from app.core.constants import FREE_PACKAGE, FREE_PACKAGE_ITEMS
from app.core.exceptions import NotFoundError

from app.repository.user_repository import UserRepository

from app.schema.user_schema import (
    # UpdateUserPayload,
    UserPayload,
)
from app.service.base_service import BaseService


class UserService(BaseService):
    def __init__(
        self,
        user_repository: UserRepository,
    ):
        self.user_repository = user_repository
        super().__init__(user_repository)

    def create_user(self, payload: UserPayload):
        return self.user_repository.create_user(payload)

    def get_account_users(self, business_uuid: str):
        return self.user_repository.get_account_users(business_uuid)

    # def update_user_by_uuid(self, uuid: str, payload: UpdateUserPayload):
    #     try:
    #         # check uuid is valid
    #         if not UUID(uuid):
    #             return None
    #         user = self.user_repository.update_user_by_uuid(uuid, payload)
    #         return user if user else None
    #     except NotFoundError as e:
    #         raise e
    #     except Exception as e:
    #         raise e

    def get_user_by_email_address(self, email: EmailStr):
        try:
            user = self.user_repository.get_user_by_email_address(email)
            return user if user else None
        except Exception as e:
            raise e

    def update_user_status(self, uuid: str):
        try:
            user = self.user_repository.update_user_status(uuid)
            return user if user else None
        except Exception as e:
            raise e

    def change_password(
        self,
        user_uuid: str,
        old_password: str,
        new_password: str,
        password_confirmation: str,
    ):
        try:
            return self.user_repository.change_password(
                user_uuid, old_password, new_password, password_confirmation
            )

        except Exception as e:
            raise e

    def update_user_avatar(self, user_id: str, avatar_url: str):
        try:
            return self.user_repository.update_user_avatar(user_id, avatar_url)
        except Exception as e:
            raise e


    def get_user_by_phone_number(self, phone_number: str):
        try:
            return self.user_repository.get_user_by_phone_number(phone_number)
        except NotFoundError as e:
            raise e
        except Exception as e:
            raise e