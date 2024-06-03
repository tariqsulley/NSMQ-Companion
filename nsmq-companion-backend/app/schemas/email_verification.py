from uuid import UUID
from pydantic import BaseModel


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

