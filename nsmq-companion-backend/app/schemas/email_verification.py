from uuid import UUID
from pydantic import BaseModel
from typing import Union
from datetime import datetime


class EmailVerificationPayload(BaseModel):
    facilitator_uuid: str
    verification_token: str
    expiry_date: Union[str, datetime]

    class Config:
        orm_model = True


class UserEmailVerification(BaseModel):
    facilitator_uuid: str

    class Config:
        orm_model = True

