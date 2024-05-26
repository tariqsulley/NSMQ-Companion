from datetime import datetime

from app.core.exceptions import ExpiredVerificationCodeError, NotFoundError
from app.repository.phone_otp_repository import PhoneOtpTokenRepository
from app.repository.user_repository import UserRepository
from app.service.base_service import BaseService


class PhoneOTPService(BaseService):
    def __init__(
        self,
        phone_otp_repository: PhoneOtpTokenRepository,
        user_repository: UserRepository,
    ):
        self.phone_otp_repository = phone_otp_repository
        self.user_repository = user_repository
        super().__init__(phone_otp_repository)

    def create_phone_verification_token(self, user_id: str) -> str:
        self.phone_otp_repository.delete_by_user_uuid(user_id)
        return self.phone_otp_repository.create_token(user_id).token

    def verify_token(self, token: str):
        user_token = self.phone_otp_repository.get_token(token)
        if not user_token:
            raise NotFoundError(detail="Token not found")

        if user_token.expires_at < datetime.now():
            raise ExpiredVerificationCodeError(detail="Token has expired")

        try:
            self.user_repository.update_attr_by_uuid(
                user_token.user_uuid, "phone_verified_at", datetime.now()
            )
            self.phone_otp_repository.delete_by_uuid(user_token.uuid)

        except Exception as e:
            raise e