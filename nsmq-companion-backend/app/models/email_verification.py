import datetime
import uuid
from sqlalchemy import Boolean, Column, DateTime, ForeignKey, Integer, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.models.base_model import BaseModel
from app.models.student import Student
from app.models.base_model import Base

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
