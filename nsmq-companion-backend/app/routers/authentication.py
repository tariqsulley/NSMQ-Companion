from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException
from jose import jwt
from sqlalchemy.orm import Session

from app.models.facilitator import Facilitator
from app.models.student import Student
from app.models.email_verification import EmailVerification
from app.database.repository import create_verification_token, get_user_by_email_address
from app.schemas.email_verification import EmailVerification,UserEmailVerification
from app.schemas.student import Login
from app.schemas.token import VerifyToken
from app.core.security import(
     extract_user_data,
    generate_token_for_existing_user,
    generate_token_for_new_user,
    generate_verification_token,
    verify_token_frontend,
    verify_password,
    generate_access_token
)
from app.utils.hashing import ALGORITHM, SECRET_KEY

from .shared import get_db

router = APIRouter(
    prefix="",
    tags=["authentication"],
)

db_user = None

port = 587
smtp_server = "live.smtp.mailtrap.io"
login = "1de0bb762bb183"
password = "ae4bfeca11542d"


@router.post("/decode-token")
async def decode_access_token(
    token_data: VerifyToken, db: Session = Depends(get_db)
):
    payload = jwt.decode(token_data.Token, SECRET_KEY, algorithms=[ALGORITHM])
    email = payload.get("sub")
    user = get_user_by_email_address(db=db, email=email)
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")
    return extract_user_data(user)


# This endpoint serves a crucial security function for users who choose to register via email.
# Upon successful registration, the user's access token is stored within a cookie.
# To ensure the legitimacy of the token and prevent unauthorized generation of tokens,
# the token within the cookie undergoes a verification process.
@router.post("/verify-token-frontend")
async def verify_token_route_front(token_data: VerifyToken):
    if verify_token_frontend(token_data.Token):
        return {"message": "Token is valid"}
    else:
        raise HTTPException(status_code=401, detail="Token is invalid or expired")


@router.post("/verify-token")
async def verify_token_route(
    token_data: VerifyToken, db: Session = Depends(get_db)
):
    # check if token exist
    current_datetime = datetime.now()
    # if user_token.expiry_date <= current_datetime:
    #     raise HTTPException(status_code=404, detail="Verification code expired")

    user_token = (
        db.query(EmailVerification)
        .filter(EmailVerification.verification_token == token_data.Token)
        .first()
    )

    if user_token:
        current_datetime = datetime.now()
        date_format = "%Y-%m-%d %H:%M:%S.%f"
        current_date = current_datetime.strftime(date_format)
        expiry_date = user_token.expiry_date

        # check if token has expired
        if expiry_date > current_date:
            user_data = (
                db.query(Facilitator)
                .filter(Facilitator.uuid == user_token.facilitator_uuid)
                .first()
            )
            if not user_data:
                raise HTTPException(status_code=404, detail="User not found")

            # Assuming your user model has an 'email' field. If it's different, adjust the code.
            access_token = generate_token_for_new_user(
                user_email=user_data.email_address, db_user=user_data
            )

            # update user table verifiedAt to current date
            user_token.user.verifiedAt = datetime.now()
            db.commit()

            # delete user token from token table
            db.query(EmailVerification).filter(
                EmailVerification.verification_token == token_data.Token
            ).delete()
            db.commit()

            # Return the access token to the client
            return {
                "access_token": access_token,
                "token_type": "bearer",
                "detail": "User verified successfully",
            }

            # return {"detail": "User verified successfully"}
        else:
            # delete expired verification token
            user_token = (
                db.query(EmailVerification)
                .filter(EmailVerification.verification_token == token_data.Token)
                .delete()
            )

            raise HTTPException(status_code=404, detail="Verification code expired")
    else:
        raise HTTPException(status_code=409, detail="Verification token not found")


@router.post("/verify-email")
async def verify_user_email(
    facilitator: UserEmailVerification, db: Session = Depends(get_db)
):
    # check if user already verified
    # expiry_time = datetime.now() + timedelta(minutes=VERIFY_TOKEN_EXPIRE_DAYS)
    db_user = db.query(facilitator).filter(facilitator.uuid == facilitator.uuid).first()
    if db_user:
        if db_user.verifiedAt is None:
            # check if token already generated
            verified_user = (
                db.query(EmailVerification)
                .filter(EmailVerification.facilitator_uuid == facilitator.uuid)
                .first()
            )

            if verified_user is None:
                # Generate token
                verify_token = generate_verification_token()

                token_detail = {
                    "facilitator_uuid": facilitator.uuid,
                    "verification_token": verify_token,
                    # "expiry_date": expiry_time  # Save the expiry time to the database
                }

                # save generated token into db
                return create_verification_token(db, facilitator, token_detail)
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
async def login_handler(login: Login, db: Session = Depends(get_db)):
    if login.account_type == "facilitator":
        user = db.query(Facilitator).filter(Facilitator.email_address == login.email_address).first()
    elif login.account_type == "student":
        user = db.query(Student).filter(Student.email_address == login.email_address).first()
    else:
        raise HTTPException(status_code=400, detail="Invalid account type specified")

    if user is None:
        raise HTTPException(status_code=404, detail="User not found")

    if not verify_password(login.password, user.password):
        raise HTTPException(status_code=401, detail="Incorrect password")

    access_token = generate_access_token(email=login.email_address)
    return {"access_token": access_token, "user": extract_user_data(user), "permission": ""}