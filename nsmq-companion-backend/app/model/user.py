import uuid

from sqlalchemy import Column, DateTime, Enum, ForeignKey, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.model.base_model import BaseModel
from app.util.enums import AccountType, ActiveStatus, UserRole


class User(BaseModel):
    __tablename__ = "users"

    uuid = Column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
        unique=True,
        nullable=False,
    )
    first_name = Column(String(length=30), nullable=False, index=True)
    last_name = Column(String(length=30), nullable=False, index=True)
    phone_number = Column(String(length=20), nullable=True, unique=True, index=True)
    email_address = Column(String(length=100), nullable=False, unique=True, index=True)
    password = Column(String(length=200), nullable=False)
    verifiedAt = Column(String(length=100), nullable=True, default=None, index=True)
    school_name = Column(String(length=30), nullable=True, index=True)
    account_type = Column(Enum(AccountType), nullable=False, index=True)
    onboarding_status = Column(String(length=50), nullable=True, index=True)
    status = Column(Enum(ActiveStatus), default=ActiveStatus.ACTIVE, nullable=False)
    avatar_url = Column(String(length=200), nullable=True)
    phone_verified_at = Column(DateTime, nullable=True)
    role = Column(
        Enum(UserRole), nullable=False, default=UserRole.CUSTOMER.value, index=True
    )
    user_verification = relationship(
        "EmailVerification", uselist=False, back_populates="user"
    )
    phone_otp_token = relationship(
        "PhoneOtpToken", uselist=False, back_populates="user"
    )
