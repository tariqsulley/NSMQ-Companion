from typing import Optional
from uuid import UUID

from pydantic import BaseModel, EmailStr

from app.util.enums import AccountType, ActiveStatus, UserRole


class UserPayload(BaseModel):
    first_name: str
    last_name: str
    email_address: EmailStr
    password: str
    account_type: AccountType
    school_name: Optional[str] = None
    role: Optional[UserRole] = UserRole.CUSTOMER
    status: ActiveStatus = ActiveStatus.ACTIVE

    class Config:
        orm_model = True
