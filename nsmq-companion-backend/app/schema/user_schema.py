from typing import Optional
from uuid import UUID

import phonenumbers
from pydantic import BaseModel, EmailStr, Field, ValidationInfo, constr, field_validator

from app.util.enums import AccountType, ActiveStatus, UserRole


class UserPayload(BaseModel):
    first_name: str
    last_name: str
    email_address: EmailStr
    password: constr(min_length=6)
    account_type: AccountType
    business_name: Optional[str] = None
    business_email: Optional[str] = None
    business_phone: Optional[str] = None
    role: Optional[UserRole] = UserRole.CUSTOMER
    status: ActiveStatus = ActiveStatus.ACTIVE

    class Config:
        orm_model = True


class UpdateUserPayload(BaseModel):
    location: str
    address: str
    phone_number: constr(max_length=15)

    class Config:
        orm_model = True


class UserLogin(BaseModel):
    email_address: EmailStr
    password: str

    class Config:
        orm_model = True


class UserEmail(BaseModel):
    email_address: EmailStr

    class Config:
        orm_model = True


class UserUpdatePassword(BaseModel):
    old_password: str
    new_password: str
    password_confirmation: str

    class Config:
        orm_model = True


class ResetPasswordPayload(BaseModel):
    token: str
    new_password: str
    password_confirmation: str

    class Config:
        orm_model = True


class IndividualUser(BaseModel):
    first_name: str
    last_name: str
    email_address: EmailStr
    uuid: UUID
    account_type: AccountType
    role: UserRole


class BussinessUser(IndividualUser):
    business_name: str
    business_email: str
    business_phone: str


class AccountDeactivationPayload(BaseModel):
    reason: str


class UpdateUserAvatar(BaseModel):
    avatar_url: str = Field(min_length=3, max_length=200)


class UpdatePhoneNumber(BaseModel):
    phone_number: str = Field(min_length=10, max_length=20)

    @field_validator("phone_number")
    @classmethod
    def validate_phone_number(cls, value: str, info: ValidationInfo) -> str:
        try:
            phone_number = phonenumbers.parse(value, None)
            if not phonenumbers.is_valid_number(phone_number):
                raise ValueError("Invalid phone number format")

            if not phonenumbers.is_possible_number(phone_number):
                raise ValueError("Invalid phone number")
            return value
        except phonenumbers.NumberParseException as e:
            raise ValueError(f"Invalid phone number: {e}")


class UserPhoneVerificationToken(BaseModel):
    token: str = Field(min_length=6, max_length=6)