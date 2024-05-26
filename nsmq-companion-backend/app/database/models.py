import datetime
import uuid

from sqlalchemy import Boolean, Column, DateTime, ForeignKey, Integer, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from .core import Base


class BaseModel(Base):
    __abstract__ = True

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    created_at = Column(
        DateTime(timezone=True), nullable=False, server_default=func.now()
    )
    updated_at = Column(DateTime(timezone=True), nullable=True, onupdate=func.now())


class User(BaseModel):
    __tablename__ = "users"
    uuid = Column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
        unique=True,
        nullable=False,
    )
    first_name = Column(String(length=30), nullable=False, default="", index=True)
    last_name = Column(String(length=30), nullable=False, default="", index=True)
    phone_number = Column(String(length=20), nullable=False, default="", index=True)
    school = Column(String(length=20), nullable=False, default="", index=True)
    email_address = Column(String(length=100), nullable=False, default="", index=True)
    password = Column(String(length=200), nullable=False)
    verifiedAt = Column(String(length=100), nullable=True, default=None, index=True)
    account_type = Column(String(length=50), nullable=True, index=True)
    user_verification = relationship(
        "EmailVerification", uselist=False, back_populates="user"
    )


class TokenTable(Base):
    __tablename__ = "token"
    uuid = Column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
        unique=True,
        nullable=False,
    )
    user_uuid = Column(UUID(as_uuid=True), ForeignKey("users.uuid"), nullable=False)
    access_toke = Column(String(450), primary_key=True)
    refresh_toke = Column(String(450), nullable=False)
    status = Column(Boolean)
    created_date = Column(DateTime, default=datetime.datetime.now)


class EmailVerification(Base):
    __tablename__ = "email_verifications"
    uuid = Column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
        unique=True,
        nullable=False,
    )
    user_uuid = Column(
        UUID(as_uuid=True),
        ForeignKey("users.uuid"),
        primary_key=True,
        unique=True,
        nullable=False,
    )
    verification_token = Column(String(450))
    expiry_date = Column(String(450), nullable=False)
    user = relationship("User", back_populates="user_verification")


