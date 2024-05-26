import random
import secrets
import string
from datetime import datetime, timedelta
from typing import Dict, List, Union

from fastapi import HTTPException, Request, status
from fastapi.security import (
    HTTPAuthorizationCredentials,
    HTTPBearer,
    OAuth2PasswordBearer,
)
from jose import JWTError, jwt
from passlib.context import CryptContext

from app.core.exceptions import AuthError, NotVerifiedError
from app.core.logger import get_logger
from app.core.settings import settings
from app.model.user import User
from app.schema.auth_schema import TokenData
from app.schema.external_app_schema import AppServiceTokenData
from app.schema.user_schema import UserLogin

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")


def create_access_token(
    data: dict, expires_delta: Union[timedelta, None] = None
) -> (str, str):
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(
            minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES
        )
    payload = {"exp": expire, **data}
    encoded_jwt = jwt.encode(
        payload, settings.SECRET_KEY, algorithm=settings.AUTH_ALGORITHM
    )
    expiration_datetime = expire.strftime(settings.DATETIME_FORMAT)
    return encoded_jwt, expiration_datetime


def generate_access_token(email: str, role: str) -> (str, str):
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    return create_access_token(
        data={"sub": email, "role": role}, expires_delta=access_token_expires
    )


def generate_access_token_for_third_party_app(
    secret_key: str, expiry: int, role: str
) -> (str, str):
    access_token_expires = timedelta(minutes=expiry)
    return create_access_token(
        data={"sub": secret_key, "role": role}, expires_delta=access_token_expires
    )


def generate_token_for_new_user(user_email: str, db_user) -> (str, str):
    """
    Generate an access token for a user creating a new account.
    No password check is required here.
    """
    if not db_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Invalid User"
        )
    return generate_access_token(user_email, db_user.role)


def generate_token_for_existing_user(user: UserLogin, db_user) -> (str, str):
    """
    Generate an access token for a user logging in.
    Password validation is done before generating the token.
    """
    if not db_user or not verify_password(user.password, db_user.password):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Invalid Credentials"
        )
    return generate_access_token(user.email_address, db_user.role)


def generate_verification_token(length: int = 100) -> str:
    verify_token = "".join(
        random.choices(string.ascii_letters + string.digits, k=length)
    )
    return verify_token


def verify_token(token: str):
    try:
        payload = jwt.decode(
            token, settings.SECRET_KEY, algorithms=[settings.AUTH_ALGORITHM]
        )

        username: str = payload.get("sub")
        role: str = payload.get("role")
        if username is None:
            raise NotVerifiedError(detail="Could not validate credentials")
        token_data = TokenData(username=username, role=role)
        return token_data
    except JWTError:
        raise NotVerifiedError(detail="Could not validate credentials")


def verify_third_party_token(token: str):
    try:
        payload = jwt.decode(
            token, settings.SECRET_KEY, algorithms=[settings.AUTH_ALGORITHM]
        )
        secret_key: str = payload.get("sub")
        role: str = payload.get("role")
        if secret_key is None:
            raise NotVerifiedError(detail="Could not validate app key")
        token_data = AppServiceTokenData(secret_key=secret_key, role=role)
        return token_data
    except JWTError:
        raise NotVerifiedError(detail="Could not validate app key")


def verify_token_frontend(token: str) -> bool:
    try:
        jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.AUTH_ALGORITHM])
        return True
    except JWTError:
        return False


def decode_token(token: str) -> dict:
    try:
        decoded_token = jwt.decode(
            token, settings.SECRET_KEY, algorithms=settings.AUTH_ALGORITHM
        )
        return (
            decoded_token
            if decoded_token["exp"] >= int(round(datetime.utcnow().timestamp()))
            else None
        )
    except Exception as e:
        get_logger().error(e)
        return {}


def extract_user_data(user: User) -> Dict[str, str]:
    return {
        "first_name": user.first_name,
        "last_name": user.last_name,
        "phone_number": user.phone_number,
        "email_address": user.email_address,
        "uuid": user.uuid,
        "verifiedAt": user.verifiedAt,
        "account_type": user.account_type,
        "onboarding_status": user.onboarding_status,
        "avatar_url": user.avatar_url,
        "role": user.role,
        "status": user.status,
    }


def hash_user_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)


def generate_reset_token():
    return secrets.token_urlsafe(64)


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

    def verify_jwt(self, jwt_token: str) -> bool:
        is_token_valid: bool = False
        try:
            payload = decode_token(jwt_token)
        except Exception as e:
            get_logger().error(e)
            payload = None
        if payload:
            is_token_valid = payload.get("role") in self.allowed_roles
        return is_token_valid