from dependency_injector.wiring import Provide, inject
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import ORJSONResponse

from app.core.container import Container
from app.core.exceptions import AuthError
from app.core.logger import get_logger
from app.core.security import verify_token_frontend
from app.core.settings import settings
# from app.schema.auth_schema import UserEmailVerification, VerifyToken
# from app.schema.user_schema import UserLogin
from app.service.auth_service import AuthService
# from app.utils.email import send_email_verification
from app.utils.utils import send_data, send_info, send_internal_server_error

router = APIRouter(
    prefix="",
    tags=["authentication"],
)

log = get_logger()


@router.post("/decode_token", response_class=ORJSONResponse)
@inject
async def decode_access_token(
    token_data,
    service: AuthService = Depends(Provide[Container.auth_service]),
):
    try:
        return send_data(service.decode_access_token(token_data))
    except Exception as e:
        return send_internal_server_error(user_msg="Could not decode token", error=e)


# This endpoint serves a crucial security function for users who choose to register via email.
# Upon successful registration, the user's access token is stored within a cookie.
# To ensure the legitimacy of the token and prevent unauthorized generation of tokens,
# the token within the cookie undergoes a verification process.
@router.post("/verify_token_frontend", response_class=ORJSONResponse)
@inject
async def verify_token_frontend_handler(token_data):
    if verify_token_frontend(token_data.Token):
        return send_data("Token is valid")
    else:
        error_message = "Token is invalid or expired"
        log.error(error_message)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=error_message,
        )


@router.post("/verify_token", response_class=ORJSONResponse)
@inject
async def verify_token(
    token_data,
    service: AuthService = Depends(Provide[Container.auth_service]),
):
    try:
        return send_data(service.verify_token(token_data))
    except Exception as e:
        return send_internal_server_error(user_msg="Could not verify token", error=e)


@router.post("/verify_email", response_class=ORJSONResponse)
@inject
async def verify_user_email(
    user,
    service: AuthService = Depends(Provide[Container.auth_service]),
):
    try:
        token_detail = service.verify_user_email(user)
        # save generated token into db
        user, token = service.user_repository.create_verification_token(
            user_verify=user, verification_token=token_detail
        )
        log.info("User email verified", extra={"email_address": user.email_address})
        if user and token:
            try:
                # send verification email
                await send_email_verification(
                    recipient_name=user.first_name,
                    email=user.email_address,
                    message=settings.MAIL_VERIFICATION_MESSAGE,
                    url=settings.VERIFY_EMAIL_URL,
                    btn=settings.VERIFY_BTN,
                    token=token,
                )
            except Exception as e:
                return send_internal_server_error(
                    user_msg="Could not send verification email", error=e
                )
        return send_info("Verification token generated successfully")
    except Exception as e:
        return send_internal_server_error(
            user_msg="Could not generate verification token", error=e
        )


@router.post("/login", response_class=ORJSONResponse)
@inject
async def login(
    user, service: AuthService = Depends(Provide[Container.auth_service])
):
    try:
        return send_data(service.login(user))
    except AuthError as e:
        return send_internal_server_error(user_msg=str(e.detail), error=e)
    except Exception as e:
        return send_internal_server_error(user_msg="Invalid Credentials", error=e)