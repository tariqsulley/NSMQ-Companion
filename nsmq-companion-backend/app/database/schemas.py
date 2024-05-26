from typing import List, Optional, Union

from uuid import UUID

from pydantic import BaseModel, EmailStr



class User(BaseModel):
    first_name: str
    last_name: str
    address: Optional[str]
    phone_number: Optional[str]
    email_address: EmailStr
    password: str

    class Config:
        orm_model = True


class UpdateUser(BaseModel):
    location: Optional[str]
    address: Optional[str]
    phone_number: Optional[str]

    class Config:
        orm_model = True


class UserLogin(BaseModel):
    email_address: EmailStr
    password: str

    class Config:
        orm_model = True


class UserEmail(BaseModel):
    email_address: str

    class Config:
        orm_model = True


class EmailVerification(BaseModel):
    user_uuid: UUID
    verification_token: str
    expiry_date: str

    class Config:
        orm_model = True


class UserEmailVerification(BaseModel):
    uuid: str

    class Config:
        orm_model = True


class VerifyToken(BaseModel):
    Token: str

    class Config:
        orm_model = True


class TokenData(BaseModel):
    username: Union[str, None] = None


class Token(BaseModel):
    access_token: str
    token_type: str

    class Config:
        orm_model = True

