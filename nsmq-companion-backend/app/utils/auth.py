import random
import string
from datetime import datetime, timedelta
from typing import Annotated, Dict, Union

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from sqlalchemy.orm import Session

from app.database import schemas
from app.routers.shared import get_db
from app.utils.hashing import (
    ACCESS_TOKEN_EXPIRE_MINUTES,
    ALGORITHM,
    SECRET_KEY,
    verify_password,
)

router = APIRouter(
    prefix="/login",
    tags=["authentication"],
)

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")


def create_access_token(
    data: dict, expires_delta: Union[timedelta, None] = None
) -> str:
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=1440)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


def generate_access_token(email: str) -> str:
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    return create_access_token(data={"sub": email}, expires_delta=access_token_expires)


def generate_token_for_new_user(
    user_email: str, db_user, db: Session = Depends(get_db)
) -> str:
    """
    Generate an access token for a user creating a new account.
    No password check is required here.
    """
    if not db_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Invalid User"
        )
    return generate_access_token(user_email)


def generate_token_for_existing_user(
    user: schemas.FacilitatorLogin, db_user, db: Session = Depends(get_db)
) -> str:
    """
    Generate an access token for a user logging in.
    Password validation is done before generating the token.
    """
    if not db_user or not verify_password(user.password, db_user.password):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Invalid Credentials"
        )
    return generate_access_token(user.email_address)


def generate_verification_token(length: int = 100) -> str:
    verify_token = "".join(
        random.choices(string.ascii_letters + string.digits, k=length)
    )
    return verify_token


def verify_token(token: str, credentials_exception: HTTPException):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
        # token_data = schemas.TokenData(username=username)
    except JWTError:
        raise credentials_exception


def verify_token_frontend(token: str) -> bool:
    try:
        jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return True
    except JWTError:
        return False


async def get_current_user(
    token: Annotated[str, Depends(oauth2_scheme)]
) -> Union[schemas.TokenData, HTTPException]:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    return verify_token(token, credentials_exception)


def extract_user_data(user) -> Dict[str, str]:
    return {
        "first_name": user.first_name,
        "last_name": user.last_name,
        "email_address": user.email_address,
        "uuid": user.uuid,
    }