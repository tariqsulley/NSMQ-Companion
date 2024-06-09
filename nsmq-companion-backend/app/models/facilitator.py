import datetime
import uuid
from sqlalchemy import Column,ForeignKey, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.models.base_model import BaseModel
from app.models.student import Student

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
    avatar_url = Column(String(length=200), nullable=True)
    facilitator_verification = relationship(
        "EmailVerification", uselist=False, back_populates="facilitator"
    )

Facilitator.students = relationship("Student", order_by=Student.id, back_populates="facilitator")
