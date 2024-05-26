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

from app.schema.user_schema import (
    ResetPasswordPayload,
    UpdatePhoneNumber,
    UpdateUserAvatar,
    UpdateUserPayload,
    UserPayload,
    UserPhoneVerificationToken,
    UserUpdatePassword,
)

from app.service.phone_otp_service import PhoneOTPService
from app.service.reset_password_service import ResetPassword
from app.service.user_service import UserService

from app.util.email import (
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


@router.post("/", response_class=ORJSONResponse)
@inject
async def create_user_handler(
    payload: UserPayload,
    service: UserService = Depends(Provide[Container.user_service]),
):
    try:
        found_user = service.get_user_by_email_address(payload.email_address)
        if found_user:
            return send_client_side_error(
                user_msg=f"User already exists : {payload.email_address}",
            )

        user = service.create_user(payload)
        return send_data(user)
    except Exception as e:
        msg = messages.CREATE_FAILED + msg_prefix
        return send_internal_server_error(user_msg=msg, error=e)


@router.get("/", dependencies=[allow_admins_only], response_class=ORJSONResponse)
@inject
async def get_users(
    service: UserService = Depends(Provide[Container.user_service]),
    current_user: User = Depends(get_current_user),
):
    try:
        users = service.get_list()
        users_info = [extract_user_data(user) for user in users]
        return send_data(users_info)
    except Exception as e:
        msg = messages.GET_FAILED + f"{msg_prefix}s"
        return send_internal_server_error(user_msg=msg, error=e)


@router.put("/{uuid}", response_class=ORJSONResponse)
@inject
async def update_user(
    uuid: str,
    payload: UpdateUserPayload,
    service: UserService = Depends(Provide[Container.user_service]),
    current_user: User = Depends(get_current_user),
):
    try:
        user = service.update_user_by_uuid(uuid, payload)
        if user is None:
            return send_client_side_error(
                user_msg=messages.USER_NOT_FOUND + uuid,
            )
        return send_data(user)
    except Exception as e:
        msg = messages.GET_FAILED + msg_prefix
        return send_internal_server_error(user_msg=msg, error=e)


@router.put("/toggle_status/{uuid}", response_class=ORJSONResponse)
@inject
async def update_user_status(
    uuid: str,
    service: UserService = Depends(Provide[Container.user_service]),
    current_user: User = Depends(get_current_user),
):
    try:
        user = service.update_user_status(uuid)
        if user is None:
            return send_client_side_error(
                user_msg=messages.USER_NOT_FOUND + uuid,
            )
        status_message = f"User status updated to: {user.status}"
        return send_info(status_message)
    except Exception as e:
        msg = messages.GET_FAILED + msg_prefix
        return send_internal_server_error(user_msg=msg, error=e)


@router.get("/{email_address}", response_class=ORJSONResponse)
@inject
async def get_user_by_email(
    email_address: EmailStr,
    service: UserService = Depends(Provide[Container.user_service]),
):
    try:
        user = service.get_user_by_email_address(email_address)
        if user is None:
            return send_client_side_error(
                user_msg=messages.USER_NOT_FOUND + email_address
            )
        return send_data(extract_user_data(user))
    except Exception as e:
        msg = messages.GET_FAILED + msg_prefix
        return send_internal_server_error(user_msg=msg, error=e)


@router.get("/{user_uuid}/user", response_class=ORJSONResponse)
@inject
async def get_user_by_uuid_handler(
    user_uuid: str,
    service: UserService = Depends(Provide[Container.user_service]),
    current_user: User = Depends(get_current_user),
):
    try:
        user = service.get_user_by_uuid(user_uuid)
        if user is None:
            return send_client_side_error(user_msg=messages.USER_NOT_FOUND + user_uuid)
        return send_data(user)
    except Exception as e:
        msg = messages.GET_FAILED + msg_prefix
        return send_internal_server_error(user_msg=msg, error=e)




@router.put("/password/{user_uuid}", response_class=ORJSONResponse)
@inject
async def change_password_handler(
    user_uuid: str,
    payload: UserUpdatePassword,
    service: UserService = Depends(Provide[Container.user_service]),
    current_user: User = Depends(get_current_user),
):
    try:
        user = service.change_password(
            user_uuid,
            payload.old_password,
            payload.new_password,
            payload.password_confirmation,
        )
        if user is None:
            return send_client_side_error(
                user_msg=messages.USER_NOT_FOUND + user_uuid,
            )
        return send_data(user)
    except Exception as e:
        msg = messages.GET_FAILED + msg_prefix
        return send_internal_server_error(user_msg=msg, error=e)


@router.put("/phone/{uuid}", response_class=ORJSONResponse)
@inject
async def update_phone_handler(
    uuid: str,
    payload: UpdatePhoneNumber,
    service: UserService = Depends(Provide[Container.user_service]),
    phone_otp_service: PhoneOTPService = Depends(Provide[Container.phone_otp_service]),
    current_user: User = Depends(get_current_user),
):
    user = service.get_by_uuid(uuid)

    if user is None:
        return send_client_side_error(
            user_msg=messages.USER_NOT_FOUND + uuid,
        )

    user_with_phone_number = service.get_user_by_phone_number(payload.phone_number)

    # check if the given phone number is already associated with another user
    if user_with_phone_number and not (user_with_phone_number.uuid == user.uuid):
        return send_client_side_error(
            user_msg=messages.PHONE_NUMBER_EXISTS + payload.phone_number
        )

    try:
        service.patch_by_uuid(uuid, payload)
        token = phone_otp_service.create_phone_verification_token(user.uuid)
        await send_otp_email(
            subject=settings.PHONE_OTP_SUBJECT,
            recipient_name=user.first_name,
            email=user.email_address,
            otp=token,
        )
        msg = "Phone number update pending verification"
        return send_info(f"{msg}")
    except Exception as e:
        msg = messages.CREATE_FAILED + f"token for user {uuid}"
        return send_internal_server_error(user_msg=msg, error=str(e))


@router.post("/password/{email_address}", response_class=ORJSONResponse)
@inject
async def send_password_link_handler(
    email_address: str,
    service: ResetPassword = Depends(Provide[Container.reset_password_service]),
    user_service: UserService = Depends(Provide[Container.user_service]),
):
    try:
        found_user = user_service.get_user_by_email_address(email_address)
        if not found_user:
            return send_client_side_error(
                user_msg=f"Email address : {email_address} does not exist",
            )
        reset_password_token = service.reset_password(found_user.uuid)

        if reset_password_token:
            try:
                # send verification email
                await send_email_verification(
                    recipient_name=found_user.first_name,
                    email=email_address,
                    message=settings.PASSWORD_RESET_MAIL_VERIFICATION_MESSAGE,
                    url=settings.RESET_PASSWORD_URL,
                    btn=settings.RESET_BTN,
                    token=reset_password_token,
                    email_purpose=EmailPurpose.PASSWORD_RESET,
                )
            except Exception as e:
                return send_internal_server_error(
                    user_msg="Could not send password reset email", error=e
                )
            reset_message = f"Password reset link sent to: {email_address}"
            return send_info(reset_message)
        else:
            return send_internal_server_error(
                user_msg="Invalid Token", error="Error sending password reset link"
            )
    except Exception as e:
        msg = messages.GET_FAILED + msg_prefix
        return send_internal_server_error(user_msg=msg, error=e)


@router.post("/password", response_class=ORJSONResponse)
@inject
async def update_password_handler(
    payload: ResetPasswordPayload,
    service: ResetPassword = Depends(Provide[Container.reset_password_service]),
):
    try:
        password_update = service.update_password(
            payload.token, payload.new_password, payload.password_confirmation
        )
        return send_data(password_update)
    except Exception as e:
        msg = messages.GET_FAILED + msg_prefix
        return send_internal_server_error(user_msg=msg, error=e)


@router.put("/avatar/{uuid}", response_class=ORJSONResponse)
@inject
async def update_user_avatar_handler(
    uuid: str,
    payload: UpdateUserAvatar,
    service: UserService = Depends(Provide[Container.user_service]),
):
    try:
        user = service.update_user_avatar(user_id=uuid, avatar_url=payload.avatar_url)
        return send_data(UpdateUserAvatar(avatar_url=user.avatar_url))
    except Exception as e:
        msg = messages.GET_FAILED + msg_prefix
        return send_internal_server_error(user_msg=msg, error=e)



@router.post("/phone_verification/{user_uuid}", response_class=ORJSONResponse)
@inject
async def phone_token_verification_handler(
    user_uuid: str,
    payload: UserPhoneVerificationToken,
    service: UserService = Depends(Provide[Container.user_service]),
    phone_otp_service: PhoneOTPService = Depends(Provide[Container.phone_otp_service]),
    current_user: User = Depends(Provide[get_current_user]),
):
    user = service.get_by_uuid(user_uuid)
    if not user:
        return send_client_side_error(
            user_msg=messages.USER_NOT_FOUND + user_uuid,
        )

    try:
        phone_otp_service.verify_token(payload.token)
        msg = msg_prefix + " phone number updated successfully"
        return send_info(info=msg)
    except NotFoundError:
        return send_client_side_error(user_msg=messages.PHONE_OTP_INVALID)
    except ExpiredVerificationCodeError:
        return send_client_side_error(user_msg=messages.PHONE_OTP_EXPIRED)
    except Exception as e:
        msg = messages.PHONE_OTP_FAILED
        return send_client_side_error(user_msg=msg, dev_msg=str(e))