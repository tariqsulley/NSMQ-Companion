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


class Facilitator(BaseModel):
    __tablename__ = "Facilitators"
    uuid = Column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
        unique=True,
        nullable=False,
    )
    first_name = Column(String(length=30), nullable=False, default="", index=True)
    last_name = Column(String(length=30), nullable=False, default="", index=True)
    school = Column(String(length=200), nullable=False, default="", index=True)
    email_address = Column(String(length=100), nullable=False, default="", index=True)
    password = Column(String(length=200), nullable=False)
    verifiedAt = Column(String(length=100), nullable=True, default=None, index=True)
    account_type = Column(String(length=50), nullable=True, index=True)
    facilitator_verification = relationship(
        "EmailVerification", uselist=False, back_populates="facilitator"
    )

class Student(BaseModel):
    __tablename__ = "students"
    uuid = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, unique=True, nullable=False)
    first_name = Column(String(length=30), nullable=False)
    last_name = Column(String(length=30), nullable=False)
    year = Column(Integer, nullable=False)
    email_address = Column(String(length=100), unique=True, nullable=False)
    password = Column(String(length=200), nullable=False)
    account_type = Column(String(length=200), nullable=False)
    facilitator_uuid = Column(UUID(as_uuid=True), ForeignKey('Facilitators.uuid'))
    facilitator = relationship("Facilitator", back_populates="students")
    
Facilitator.students = relationship("Student", order_by=Student.id, back_populates="facilitator")


class TokenTable(Base):
    __tablename__ = "token"
    uuid = Column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
        unique=True,
        nullable=False,
    )
    facilitator_uuid = Column(UUID(as_uuid=True), ForeignKey("Facilitators.uuid"), nullable=False)
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
    facilitator_uuid = Column(
        UUID(as_uuid=True),
        ForeignKey("Facilitators.uuid"),
        primary_key=True,
        unique=True,
        nullable=False,
    )
    verification_token = Column(String(450))
    expiry_date = Column(String(450), nullable=False)
    facilitator = relationship("Facilitator", back_populates="facilitator_verification")


