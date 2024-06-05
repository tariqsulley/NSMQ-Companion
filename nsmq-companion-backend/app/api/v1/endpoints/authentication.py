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
from app.schemas.student import Login
from app.core.security import decode_access_token
from sqlalchemy.orm import Session
from app.routers.shared import get_db
from app.core.security import extract_user_data
from app.schemas.token import VerifyToken

router = APIRouter(
    prefix="",
    tags=["authentication"],
)

log = get_logger()


# @router.post("/decode_token", response_class=ORJSONResponse)
# @inject
# async def decode_access_token_endpoint(
#     token_data,
#     service: AuthService = Depends(Provide[Container.auth_service]),
# ):
#     try:
#         result = decode_access_token(token_data)
#         return send_data(result)
#     except Exception as e:
#         return send_internal_server_error(user_msg="Could not decode token", error=e)

@router.post("/decode_token", response_class=ORJSONResponse)
@inject
async def decode_access_token_endpoint(
    token_data,
    service: AuthService = Depends(Provide[Container.auth_service]),
    db: Session = Depends(get_db),
):
    try:
        user = decode_access_token(token_data, db)
        return send_data(extract_user_data(user))
    except Exception as e:
        return send_internal_server_error(user_msg="Could not decode token", error=e)
    



  
@router.post("/verify_token_frontend")
async def verify_token_route_front(token_data: VerifyToken):
    if verify_token_frontend(token_data.Token):
        return {"message": "Token is valid"}
    else:
        raise HTTPException(status_code=401, detail="Token is invalid or expired")

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


# @router.post("/verify_email", response_class=ORJSONResponse)
# @inject
# async def verify_user_email(
#     user,
#     service: AuthService = Depends(Provide[Container.auth_service]),
# ):
#     try:
#         token_detail = service.verify_user_email(user)
#         # save generated token into db
#         user, token = service.user_repository.create_verification_token(
#             user_verify=user, verification_token=token_detail
#         )
#         log.info("User email verified", extra={"email_address": user.email_address})
#         if user and token:
#             try:
#                 # send verification email
#                 await send_email_verification(
#                     recipient_name=user.first_name,
#                     email=user.email_address,
#                     message=settings.MAIL_VERIFICATION_MESSAGE,
#                     url=settings.VERIFY_EMAIL_URL,
#                     btn=settings.VERIFY_BTN,
#                     token=token,
#                 )
#             except Exception as e:
#                 return send_internal_server_error(
#                     user_msg="Could not send verification email", error=e
#                 )
#         return send_info("Verification token generated successfully")
#     except Exception as e:
#         return send_internal_server_error(
#             user_msg="Could not generate verification token", error=e
#         )



@router.post("/login", response_model=None)
@inject
async def login_handler(
    login: Login,
    auth_service: AuthService = Depends(Provide[Container.auth_service]),
):
    try:
        login_result = auth_service.login_user(login)
        return send_data(login_result)
    except Exception as e:
        msg = "Failed to login"
        return send_internal_server_error(user_msg=msg, error=e)
    
