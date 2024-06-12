from dependency_injector.wiring import Provide, inject
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import ORJSONResponse

from app.core.container import Container
from app.core.exceptions import AuthError
from app.core.logger import get_logger
from app.core.security import verify_token_frontend
from app.core.settings import settings
from app.service.auth_service import AuthService
from app.utils.utils import send_data, send_info, send_internal_server_error
from app.schemas.student import Login
from app.core.security import decode_access_token
from sqlalchemy.orm import Session
from app.routers.shared import get_db
from app.core.security import extract_user_data
from app.schemas.token import VerifyToken
from app.core.security import (
    generate_verification_token,
    create_verification_token
)
from app.models.facilitator import Facilitator
from app.models.email_verification import EmailVerification
from app.schemas.email_verification import UserEmailVerification
from datetime import datetime,timedelta

router = APIRouter(
    prefix="",
    tags=["authentication"],
)

log = get_logger()

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


@router.post("/verify-email")
async def verify_user_email(
    user: UserEmailVerification, db: Session = Depends(get_db)
):
    # check if user already verified
    expiry_time = datetime.now() + timedelta(minutes=3)
    db_user = db.query(Facilitator).filter(Facilitator.uuid == user.facilitator_uuid).first()
    if db_user:
        if db_user.verifiedAt is None:
            # check if token already generated
            verified_user = (
                db.query(EmailVerification)
                .filter(EmailVerification.facilitator_uuid == user.facilitator_uuid)
                .first()
            )

            if verified_user is None:
                # Generate token
                verify_token = generate_verification_token()

                token_detail = {
                    "facilitator_uuid": user.facilitator_uuid,
                    "verification_token": verify_token,
                    "expiry_date": expiry_time.isoformat() # Save the expiry time to the database
                }

                # save generated token into db
                return create_verification_token(db, user, token_detail)
            else:
                raise HTTPException(
                    status_code=409,
                    detail="Verification code already generated, please check email to verify",
                )
        else:
            raise HTTPException(status_code=409, detail="User already verified")
    else:
        raise HTTPException(status_code=404, detail="User not found")
    


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
    
