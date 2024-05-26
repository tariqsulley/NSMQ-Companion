from dependency_injector.wiring import Provide, inject
from fastapi import APIRouter, Depends
from fastapi.responses import ORJSONResponse
from pydantic import EmailStr

from app.core import messages
from app.core.container import Container
from app.core.dependencies import get_current_user
from app.core.exceptions import ExpiredVerificationCodeError, NotFoundError
from app.core.security import extract_user_data
from app.core.settings import settings
from app.model.user import User
from app.schema.invitation_schema import (
    InvitationCreatePayload,
    InvitationCreatePayloadSingle,
)
from app.schema.user_schema import (
    AccountDeactivationPayload,
    ResetPasswordPayload,
    UpdatePhoneNumber,
    UpdateUserAvatar,
    UpdateUserPayload,
    UserPayload,
    UserPhoneVerificationToken,
    UserUpdatePassword,
)
from app.service.invitation_service import InvitationService
from app.service.phone_otp_service import PhoneOTPService
from app.service.reset_password_service import ResetPassword
from app.service.user_service import UserService
from app.util.email import (
    send_email_invitation,
    send_email_verification,
    send_otp_email,
)
from app.util.enums import AccountType, EmailPurpose
from app.util.utils import (
    allow_admins_only,
    send_client_side_error,
    send_data,
    send_info,
    send_internal_server_error,
)

router = APIRouter(
    prefix="/users",
    tags=["users"],
)
msg_prefix = "user"