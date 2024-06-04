import random
import string
from datetime import datetime, timedelta
from typing import Annotated, Dict, Union,List

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from sqlalchemy.orm import Session
from passlib.context import CryptContext
from app.schemas.student import Login
from app.schemas.token import TokenData
from app.routers.shared import get_db
from app.utils.hashing import (
    ACCESS_TOKEN_EXPIRE_MINUTES,
    ALGORITHM,
    SECRET_KEY,
)
from fastapi.security import (
    HTTPAuthorizationCredentials,
    HTTPBearer,
    OAuth2PasswordBearer,
)
from app.core.exceptions import AuthError, NotVerifiedError
from fastapi import HTTPException, Request, status
from app.models.facilitator import Facilitator
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")


def hash_user_password(password: str) -> str:
    return pwd_context.hash(password)

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


def get_user_by_email_address(email: str, db: Session):
    try:
        user = db.query(Facilitator).filter(Facilitator.email_address == email).first()
        if user:
            return user
    except Exception:
        raise HTTPException(status_code=400, detail="User not found")
        

def decode_access_token(
    token_data, db: Session = Depends(get_db)):
    payload = jwt.decode(token_data, SECRET_KEY, algorithms=[ALGORITHM])
    email = payload.get("sub")
    user = get_user_by_email_address(email=email,db=db)
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")
    return user


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
    user: Login, db_user, db: Session = Depends(get_db)
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


def verify_token_frontend(token: str) -> str:
    try:
        jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return "Token Valid"
    except JWTError:
        return "Invalid Token"


async def get_current_user(
    token: Annotated[str, Depends(oauth2_scheme)]
) -> Union[TokenData, HTTPException]:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    return verify_token(token, credentials_exception)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

class JWTBearer(HTTPBearer):
    def __init__(self, allowed_roles: List, auto_error: bool = True):
        super(JWTBearer, self).__init__(auto_error=auto_error)
        self.allowed_roles = allowed_roles

    async def __call__(self, request: Request):
        credentials: HTTPAuthorizationCredentials = await super(
            JWTBearer, self
        ).__call__(request)
        if credentials:
            if not credentials.scheme == "Bearer":
                raise AuthError(detail="Invalid authentication scheme.")
            if not self.verify_jwt(credentials.credentials):
                raise AuthError(detail="Invalid token or expired token.")
            return credentials.credentials
        else:
            raise AuthError(detail="Invalid authorization code.")
        
def extract_user_data(user) -> Dict[str, str]:
    return {
        "first_name": user.first_name,
        "last_name": user.last_name,
        "email_address": user.email_address,
        "account_type": user.account_type,
        "uuid": user.uuid,
    }

