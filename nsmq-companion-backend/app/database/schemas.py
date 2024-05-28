from typing import List, Optional, Union

from uuid import UUID

from pydantic import BaseModel, EmailStr, validator,UUID4
import random
import string



class Facilitator(BaseModel):
    # uuid: UUID4
    first_name: str
    last_name: str
    school:str
    email_address: EmailStr
    account_type:str
    password: str

    class Config:
        orm_model = True


class StudentBase(BaseModel):
    # uuid: UUID4
    first_name: str
    last_name: str
    year: int
    email_address: EmailStr
    account_type:str

class StudentCreate(StudentBase):
    facilitator_uuid: str

    # @validator('email')
    # def email_must_be_unique(cls, value, session: Session):
    #     if session.query(Student).filter(Student.email == value).first():
    #         raise ValueError('Email already registered')
    #     return value

    def generate_password():
        return ''.join(random.choices(string.ascii_letters + string.digits, k=10))
    
class UpdateUser(BaseModel):
    location: Optional[str]
    address: Optional[str]
    phone_number: Optional[str]

    class Config:
        orm_model = True


class Login(BaseModel):
    email_address: EmailStr
    account_type:str
    password: str

    class Config:
        orm_model = True


class UserEmail(BaseModel):
    email_address: str

    class Config:
        orm_model = True


class EmailVerification(BaseModel):
    facilitator_uuid: UUID
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

